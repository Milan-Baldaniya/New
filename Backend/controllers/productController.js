const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };
  
  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
  
  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);
  
  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  
  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  let query = Product.find(JSON.parse(queryStr));

  // Search functionality
  if (req.query.search) {
    query = Product.find({ $text: { $search: req.query.search } });
  }
  
  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }
  
  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Product.countDocuments();
  
  query = query.skip(startIndex).limit(limit);
  
  // Add farmer data
  query = query.populate({
    path: 'farmer',
    select: 'name profileImage'
  });
  
  // Executing query
  const products = await query;
  
  // Pagination result
  const pagination = {};
  
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }
  
  res.status(200).json({
    success: true,
    count: products.length,
    pagination,
    data: products
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate({
    path: 'farmer',
    select: 'name profileImage phone email'
  });
  
  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }
  
  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Farmer Only)
exports.createProduct = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.farmer = req.user.id;
  
  // Check if user is a farmer
  if (req.user.userType !== 'farmer') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to add a product`, 401)
    );
  }
  
  // Validate auction fields if bidding is true
  if (req.body.bidding === true) {
    // Ensure required auction fields are present
    if (!req.body.startingBid) {
      return next(new ErrorResponse('Please provide a starting bid for auction', 400));
    }
    
    if (!req.body.endBidTime) {
      return next(new ErrorResponse('Please provide an end time for auction', 400));
    }
    
    // Make sure the endBidTime is in the future
    const endBidTime = new Date(req.body.endBidTime);
    if (endBidTime <= new Date()) {
      return next(new ErrorResponse('Auction end time must be in the future', 400));
    }
    
    // Set initial currentBid to match startingBid if not provided
    if (!req.body.currentBid) {
      req.body.currentBid = req.body.startingBid;
    }
  }
  
  console.log('Creating product with data:', req.body);
  const product = await Product.create(req.body);
  
  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Farmer Only)
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  
  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Make sure user is product owner
  if (product.farmer.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this product`,
        401
      )
    );
  }
  
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Farmer Only)
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Make sure user is product owner
  if (product.farmer.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this product`,
        401
      )
    );
  }
  
  await product.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get products by farmer
// @route   GET /api/products/farmer/:id
// @access  Public
exports.getFarmerProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ farmer: req.params.id });
  
  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
exports.getProductsByCategory = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ category: req.params.category });
  
  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Place a bid on an auction product
// @route   POST /api/products/:id/bid
// @access  Private
const placeBid = async (req, res) => {
  try {
    const { id } = req.params;
    const { bidAmount } = req.body;
    const userId = req.user.id;

    if (!bidAmount || bidAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid bid amount is required'
      });
    }

    // Find the product
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product is an auction product
    if (!product.bidding) {
      return res.status(400).json({
        success: false,
        message: 'This product is not available for auction'
      });
    }

    // Check if auction has ended
    const endTime = new Date(product.endBidTime);
    const now = new Date();
    if (now > endTime) {
      return res.status(400).json({
        success: false,
        message: 'This auction has ended'
      });
    }

    // Check if bid is higher than current/starting bid
    const currentBid = product.currentBid || product.startingBid;
    if (bidAmount <= currentBid) {
      return res.status(400).json({
        success: false,
        message: `Bid must be higher than current bid of $${currentBid}`
      });
    }

    // Check if user is not bidding on their own product
    if (product.farmer.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot bid on your own product'
      });
    }

    // Update product with new bid
    product.currentBid = bidAmount;
    product.bidder = userId;
    
    // Save the product
    await product.save();
    
    // Get user information to include in response
    const user = await User.findById(userId).select('name email profileImage');

    // Get the socket.io instance from the request
    const io = req.app.get('io');
    
    // If socket.io is available, emit the bid event
    if (io) {
      // Emit to all clients in the auction room
      io.to(id).emit('auction:bid', {
        auctionId: id,
        amount: bidAmount,
        bidder: {
          id: userId,
          name: user.name,
          // Don't include email for privacy reasons
          profileImage: user.profileImage || null
        },
        timestamp: new Date()
      });
      
      console.log(`Emitted real-time bid update for auction ${id}`);
    }

    // Populate user information for the response
    await product.populate([
      { path: 'farmer', select: 'name profileImage' },
      { path: 'bidder', select: 'name profileImage' }
    ]);

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.placeBid = placeBid; 