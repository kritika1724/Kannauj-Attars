const mongoose = require('mongoose')

const gallerySectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, default: '', trim: true, maxlength: 240 },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

gallerySectionSchema.index({ isActive: 1, order: 1, createdAt: 1 })

module.exports = mongoose.model('GallerySection', gallerySectionSchema)
