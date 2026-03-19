const express = require('express')
const Product = require('../models/Product')
const { protect, adminOnly } = require('../middleware/auth')

const router = express.Router()

router.get('/', async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Math.min(Number(req.query.limit) || 12, 50)
  const skip = (page - 1) * limit

  const keyword = (req.query.keyword || '').trim()
  const category = (req.query.category || '').trim()
  const buyer = (req.query.buyer || '').trim() // "personal" | "industrial"
  const purposeRaw = (req.query.purpose || '').trim() // tag id or comma-separated list
  const familyRaw = (req.query.family || '').trim() // tag id or comma-separated list
  const bestSeller = (req.query.bestSeller || '').toString().trim()
  const minPrice = req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined
  const maxPrice = req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined
  const sort = (req.query.sort || 'newest').trim()

  const filter = {}
  if (keyword) {
    filter.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
    ]
  }
  if (category) {
    filter.category = category
  }
  if (buyer === 'personal') {
    filter.buyerType = { $in: ['personal', 'both'] }
  } else if (buyer === 'industrial') {
    filter.buyerType = { $in: ['industrial', 'both'] }
  }
  const purposes = purposeRaw
    ? purposeRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []
  const families = familyRaw
    ? familyRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []

  if (purposes.length) {
    filter.purposeTags = { $in: purposes }
  }
  if (families.length) {
    filter.familyTags = { $in: families }
  }
  if (bestSeller && ['1', 'true', 'yes', 'on'].includes(bestSeller.toLowerCase())) {
    filter.isBestSeller = true
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {}
    if (minPrice !== undefined && !Number.isNaN(minPrice)) filter.price.$gte = minPrice
    if (maxPrice !== undefined && !Number.isNaN(maxPrice)) filter.price.$lte = maxPrice
  }

  const sortMap = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating_desc: { rating: -1 },
    name_asc: { name: 1 },
  }

  const sortObj = sortMap[sort] || sortMap.newest

  const total = await Product.countDocuments(filter)
  const products = await Product.find(filter).sort(sortObj).skip(skip).limit(limit)

  res.json({
    products,
    page,
    pages: Math.ceil(total / limit),
    total,
  })
})

router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }
  res.json(product)
})

router.post('/', protect, adminOnly, async (req, res) => {
  const {
    name,
    description,
    category,
    buyerType,
    purposeTags,
    familyTags,
    isBestSeller,
    price,
    packs,
    images,
    stock,
    highlights,
  } = req.body

  if (!name || !description || price === undefined) {
    return res.status(400).json({ message: 'Name, description, and price are required' })
  }

  const product = await Product.create({
    name,
    description,
    category,
    buyerType,
    purposeTags: Array.isArray(purposeTags) ? purposeTags : [],
    familyTags: Array.isArray(familyTags) ? familyTags : [],
    isBestSeller: isBestSeller === true,
    price,
    packs: Array.isArray(packs) ? packs : [],
    images,
    stock,
    highlights,
  })

  res.status(201).json(product)
})

router.put('/:id', protect, adminOnly, async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }

  const fields = [
    'name',
    'description',
    'category',
    'buyerType',
    'purposeTags',
    'familyTags',
    'isBestSeller',
    'price',
    'packs',
    'images',
    'stock',
    'highlights',
  ]
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === 'purposeTags' || field === 'familyTags') {
        product[field] = Array.isArray(req.body[field]) ? req.body[field] : []
      } else {
        product[field] = req.body[field]
      }
    }
  })

  const updated = await product.save()
  res.json(updated)
})

router.delete('/:id', protect, adminOnly, async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }
  await product.deleteOne()
  res.json({ message: 'Product deleted' })
})

router.post('/:id/reviews', protect, async (req, res) => {
  if (req.user?.isAdmin === true) {
    return res.status(403).json({ message: 'Admins cannot submit reviews' })
  }

  const { rating, comment } = req.body

  if (!rating || !comment) {
    return res.status(400).json({ message: 'Rating and comment are required' })
  }

  const product = await Product.findById(req.params.id)
  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }

  const alreadyReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  )

  if (alreadyReviewed) {
    return res.status(400).json({ message: 'You already reviewed this product' })
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  })
  product.numReviews = product.reviews.length
  product.rating =
    product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.numReviews

  await product.save()
  res.status(201).json({ message: 'Review added' })
})

router.delete('/:id/reviews/:reviewId', protect, adminOnly, async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }

  const reviewIndex = product.reviews.findIndex(
    (review) => review._id.toString() === req.params.reviewId
  )

  if (reviewIndex === -1) {
    return res.status(404).json({ message: 'Review not found' })
  }

  product.reviews.splice(reviewIndex, 1)
  product.numReviews = product.reviews.length
  product.rating = product.numReviews
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.numReviews
    : 0

  await product.save()
  res.json({ message: 'Review removed' })
})

module.exports = router
