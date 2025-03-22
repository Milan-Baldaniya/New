const Product = require('../models/Product');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const logger = require('../socket/socketLogger');

/**
 * Migrate an existing product to the Auction model
 * @param {string} productId - ID of the product to migrate
 * @returns {Promise<Object>} Migrated auction
 */
async function migrateProductToAuction(productId) {
  try {
    // Find product with bidding enabled
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }
    
    if (!product.bidding) {
      throw new Error(`Product ${productId} is not an auction product`);
    }
    
    // Check if auction already exists
    const existingAuction = await Auction.findOne({ _id: productId });
    if (existingAuction) {
      logger.info(`Auction already exists for product ${productId}`);
      return existingAuction;
    }
    
    // Create new auction with product ID
    const auction = new Auction({
      _id: product._id, // Use same ID as product
      name: product.name,
      description: product.description,
      farmer: product.farmer,
      category: product.category,
      images: product.images,
      startingBid: product.startingBid || 0,
      currentBid: product.currentBid || 0,
      currentBidder: product.bidder,
      endBidTime: product.endBidTime,
      status: product.endBidTime > new Date() ? 'active' : 'completed'
    });
    
    await auction.save();
    logger.info(`Product ${productId} migrated to Auction model`);
    
    return auction;
  } catch (error) {
    logger.error(`Error migrating product to auction: ${error.message}`);
    throw error;
  }
}

/**
 * Get all active auctions
 * @returns {Promise<Array>} List of active auctions
 */
async function getActiveAuctions() {
  try {
    const now = new Date();
    
    // First try to get auctions from Auction model
    let auctions = await Auction.find({ 
      status: 'active',
      endBidTime: { $gt: now }
    }).populate('farmer', 'name');
    
    // If no dedicated auctions found, look for products with bidding enabled
    if (auctions.length === 0) {
      const products = await Product.find({
        bidding: true,
        endBidTime: { $gt: now }
      }).populate('farmer', 'name');
      
      // For each product found, create/migrate to auction
      for (const product of products) {
        await migrateProductToAuction(product._id);
      }
      
      // Fetch again after migration
      auctions = await Auction.find({ 
        status: 'active',
        endBidTime: { $gt: now }
      }).populate('farmer', 'name');
    }
    
    return auctions;
  } catch (error) {
    logger.error(`Error getting active auctions: ${error.message}`);
    throw error;
  }
}

/**
 * Get auction by ID with bid history
 * @param {string} auctionId - Auction ID
 * @returns {Promise<Object>} Auction with bid history
 */
async function getAuctionWithBids(auctionId) {
  try {
    // Try to get from Auction model first
    let auction = await Auction.findById(auctionId)
      .populate('farmer', 'name email')
      .populate('currentBidder', 'name email');
    
    // If not found, check if it's a product with bidding enabled
    if (!auction) {
      const product = await Product.findById(auctionId)
        .populate('farmer', 'name email')
        .populate('bidder', 'name email');
      
      if (product && product.bidding) {
        // Migrate to auction
        auction = await migrateProductToAuction(auctionId);
      } else {
        throw new Error(`Auction ${auctionId} not found`);
      }
    }
    
    // Get bid history
    const bids = await Bid.find({ auction: auctionId })
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('bidder', 'name');
    
    // Update auction status based on current time
    auction.updateStatus();
    await auction.save();
    
    return {
      auction,
      bids
    };
  } catch (error) {
    logger.error(`Error getting auction with bids: ${error.message}`);
    throw error;
  }
}

/**
 * Place a bid on an auction
 * @param {string} auctionId - Auction ID
 * @param {number} amount - Bid amount
 * @param {string} userId - User ID of bidder
 * @param {string} bidderName - Name of bidder
 * @returns {Promise<Object>} Created bid and updated auction
 */
async function placeBid(auctionId, amount, userId, bidderName = 'Anonymous') {
  try {
    // Get auction (will migrate from product if needed)
    let auction;
    try {
      auction = await Auction.findById(auctionId);
    } catch (error) {
      // If not found in Auction model, try to migrate from Product
      auction = await migrateProductToAuction(auctionId);
    }
    
    if (!auction) {
      throw new Error(`Auction ${auctionId} not found`);
    }
    
    // Check if auction is still active
    if (auction.hasEnded()) {
      throw new Error('This auction has ended');
    }
    
    // Verify bid amount is higher than current bid
    if (amount <= auction.currentBid) {
      throw new Error(`Bid amount must be higher than current bid of ${auction.currentBid}`);
    }
    
    // Create bid
    const bid = new Bid({
      auction: auctionId,
      amount,
      bidder: userId,
      bidderName,
      timestamp: new Date()
    });
    
    await bid.save();
    
    // Update auction
    await auction.recordBid(bid._id, amount, userId);
    
    return {
      bid,
      auction
    };
  } catch (error) {
    logger.error(`Error placing bid: ${error.message}`);
    throw error;
  }
}

/**
 * Get latest bid for an auction
 * @param {string} auctionId - Auction ID
 * @returns {Promise<Object>} Latest bid
 */
async function getLatestBid(auctionId) {
  try {
    const latestBid = await Bid.findOne({ auction: auctionId })
      .sort({ timestamp: -1 })
      .populate('bidder', 'name');
    
    return latestBid;
  } catch (error) {
    logger.error(`Error getting latest bid: ${error.message}`);
    throw error;
  }
}

/**
 * Close ended auctions and determine winners
 * @returns {Promise<number>} Number of auctions closed
 */
async function closeEndedAuctions() {
  try {
    const now = new Date();
    
    // Find auctions that have ended but are still active
    const auctions = await Auction.find({
      status: 'active',
      endBidTime: { $lt: now }
    });
    
    let closedCount = 0;
    
    for (const auction of auctions) {
      // Get highest bid
      const highestBid = await Bid.findOne({ auction: auction._id })
        .sort({ amount: -1 });
      
      // Update auction status
      auction.status = 'completed';
      
      if (highestBid) {
        // Set winning bid
        auction.winningBid = highestBid._id;
        highestBid.isWinningBid = true;
        await highestBid.save();
      }
      
      await auction.save();
      closedCount++;
    }
    
    return closedCount;
  } catch (error) {
    logger.error(`Error closing ended auctions: ${error.message}`);
    throw error;
  }
}

module.exports = {
  migrateProductToAuction,
  getActiveAuctions,
  getAuctionWithBids,
  placeBid,
  getLatestBid,
  closeEndedAuctions
}; 