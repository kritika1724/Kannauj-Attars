const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    publicOrderId: { type: String, default: '' },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    verifiedPurchase: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = reviewSchema
