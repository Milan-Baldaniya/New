const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  auction: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product', // References the Product model for now, could be changed to Auction if created
    required: [true, 'Bid must belong to an auction'],
    index: true // Add index for faster queries
  },
  amount: {
    type: Number,
    required: [true, 'Bid must have an amount'],
    min: [0.01, 'Bid amount must be greater than 0']
  },
  bidder: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Bid must belong to a user'],
    index: true // Add index for faster queries
  },
  bidderName: {
    type: String,
    default: 'Anonymous'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // Add index for sorting by timestamp
  },
  isWinningBid: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // Add createdAt and updatedAt fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add a toString method for debugging
BidSchema.methods.toString = function() {
  return `Bid: $${this.amount} by ${this.bidderName} at ${this.timestamp}`;
};

// Add a pre-save hook to ensure timestamp is set
BidSchema.pre('save', function(next) {
  if (!this.timestamp) {
    this.timestamp = new Date();
  }
  next();
});

// Add indexes for faster queries
BidSchema.index({ auction: 1, timestamp: -1 }); // For fetching latest bids for an auction

module.exports = mongoose.model('Bid', BidSchema); 