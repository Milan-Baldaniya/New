const mongoose = require('mongoose');
const Product = require('./Product');

// Create an Auction schema that extends Product
const AuctionSchema = new mongoose.Schema({
  // Auction-specific properties
  currentBid: {
    type: Number,
    default: 0
  },
  startingBid: {
    type: Number,
    required: [true, 'Please provide a starting bid price'],
    min: [0.01, 'Starting bid must be greater than 0']
  },
  minBidIncrement: {
    type: Number,
    default: 0.5,
    min: [0.1, 'Minimum bid increment must be at least 0.1']
  },
  endBidTime: {
    type: Date,
    required: [true, 'Please provide an end time for the auction']
  },
  startBidTime: {
    type: Date,
    default: Date.now
  },
  currentBidder: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  lastBidTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  winningBid: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bid'
  },
  totalBids: {
    type: Number,
    default: 0
  },
  participants: {
    type: Number,
    default: 0
  },
  reservePrice: {
    type: Number,
    min: [0, 'Reserve price must be at least 0']
  },
  metadata: {
    type: Map,
    of: String
  }
});

// Add virtual populate for bids
AuctionSchema.virtual('bids', {
  ref: 'Bid',
  localField: '_id',
  foreignField: 'auction',
  options: { sort: { timestamp: -1 } }
});

// Check if auction has ended
AuctionSchema.methods.hasEnded = function() {
  return new Date() > this.endBidTime;
};

// Update auction status based on current time
AuctionSchema.methods.updateStatus = function() {
  const now = new Date();
  
  if (now < this.startBidTime) {
    this.status = 'pending';
  } else if (now > this.endBidTime) {
    this.status = 'completed';
  } else {
    this.status = 'active';
  }
  
  return this.status;
};

// Record a new bid
AuctionSchema.methods.recordBid = async function(bidId, amount, userId) {
  this.currentBid = amount;
  this.currentBidder = userId;
  this.lastBidTime = new Date();
  this.totalBids += 1;
  
  // Update winning bid if auction has ended
  if (this.hasEnded()) {
    this.winningBid = bidId;
    this.status = 'completed';
  }
  
  return this.save();
};

// Add indexes
AuctionSchema.index({ status: 1, endBidTime: 1 }); // For finding active auctions
AuctionSchema.index({ farmer: 1 }); // For finding auctions by farmer

module.exports = mongoose.model('Auction', AuctionSchema); 