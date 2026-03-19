const mongoose = require('mongoose')

const reviewSchema = require('./Review')

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'Attar' },
    // B2C / B2B segmentation (backward compatible: default personal)
    buyerType: {
      type: String,
      enum: ['personal', 'industrial', 'both'],
      default: 'personal',
    },
    // Smart discovery tags (store ids/slugs, e.g. "daily_wear", "floral")
    purposeTags: { type: [String], default: [] },
    familyTags: { type: [String], default: [] },
    // Curated on Explore/Home by admin (manual best-seller list)
    isBestSeller: { type: Boolean, default: false },
    price: { type: Number, required: true },
    packs: {
      type: [
        {
          label: { type: String, required: true }, // e.g. "200 gm", "1 kg", "10 kg"
          price: { type: Number, required: true },
          stock: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    images: { type: [String], default: [] },
    stock: { type: Number, default: 0 },
    highlights: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: { type: [reviewSchema], default: [] },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Product', productSchema)
