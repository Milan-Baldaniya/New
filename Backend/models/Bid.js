const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  auction: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product', // References the Product model for now, could be changed to Auction if created
    required: [true, 'Bid must belong to an auction']
  },
  amount: {
    type: Number,
    required: [true, 'Bid must have an amount'],
    min: [0.01, 'Bid amount must be greater than 0']
  },
  bidder: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Bid must belong to a user']
  },
  bidderName: {
    type: String,
    default: 'Anonymous'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isWinningBid: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for faster queries
BidSchema.index({ auction: 1, timestamp: -1 }); // For fetching latest bids for an auction
BidSchema.index({ bidder: 1 }); // For fetching a user's bids

module.exports = mongoose.model('Bid', BidSchema); 