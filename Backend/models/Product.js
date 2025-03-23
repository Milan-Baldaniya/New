const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide product description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price'],
    min: [0, 'Price must be at least 0']
  },
  category: {
    type: String,
    required: [true, 'Please provide product category'],
    enum: {
      values: ['fruits', 'vegetables', 'dairy', 'grains', 'meat', 'other'],
      message: '{VALUE} is not supported as category'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Please provide product stock'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  unit: {
    type: String,
    required: [true, 'Please provide unit of measurement'],
    enum: {
      values: ['kg', 'g', 'pcs', 'litre', 'dozen', 'box'],
      message: '{VALUE} is not supported as unit'
    }
  },
  images: {
    type: [String],
    default: ['default-product.jpg']
  },
  farmer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Product must belong to a farmer']
  },
  isOrganic: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean, 
    default: true
  },
  // Auction/bidding specific fields
  bidding: {
    type: Boolean,
    default: false
  },
  startingBid: {
    type: Number,
    min: [0, 'Starting bid must be at least 0']
  },
  currentBid: {
    type: Number,
    default: 0
  },
  endBidTime: {
    type: Date
  },
  bidder: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  numReviews: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for search
ProductSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', ProductSchema); 