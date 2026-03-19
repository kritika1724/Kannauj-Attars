const mongoose = require('mongoose')

const galleryPhotoSchema = new mongoose.Schema(
  {
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GallerySection',
      required: true,
      index: true,
    },
    url: { type: String, required: true, trim: true },
    caption: { type: String, default: '', trim: true, maxlength: 120 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('GalleryPhoto', galleryPhotoSchema)

