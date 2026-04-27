import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useDispatch } from 'react-redux'
import { api, auth } from '../services/api'
import { addToCart } from '../features/cartSlice'
import { viewProduct as trackView } from '../features/recentlyViewedSlice'
import { toAssetUrl } from '../utils/media'
import RecentlyViewedStrip from '../components/RecentlyViewedStrip'
import RichTextContent from '../components/RichTextContent'

const schema = yup.object({
  orderId: yup.string().trim().required('Order ID is required.'),
  rating: yup.number().required('Rating is required.').min(1).max(5),
  comment: yup.string().max(1200).default(''),
})

const packToGrams = (label) => {
  const str = String(label || '').toLowerCase().replace(/,/g, '').trim()
  const kg = str.match(/(\d+(?:\.\d+)?)\s*kg\b/)
  if (kg) return Number(kg[1]) * 1000
  const gm = str.match(/(\d+(?:\.\d+)?)\s*(gm|g)\b/)
  if (gm) return Number(gm[1])
  return null
}

const isBulkPack = (label) => {
  const grams = packToGrams(label)
  return grams !== null && Number.isFinite(grams) && grams >= 1000
}

const getMinPack = (packs = []) => {
  const normalized = packs
    .map((p) => {
      const price = Number(p.price)
      const salePrice = p.salePrice === null || p.salePrice === undefined || p.salePrice === '' ? null : Number(p.salePrice)
      const onSale = Number.isFinite(salePrice) && salePrice > 0 && Number.isFinite(price) && salePrice < price
      return {
        label: (p.label || '').trim(),
        price,
        salePrice: onSale ? salePrice : null,
        effectivePrice: onSale ? salePrice : price,
        onSale,
      }
    })
    .filter((p) => p.label && !Number.isNaN(p.effectivePrice))
  if (!normalized.length) return null
  return normalized.reduce((min, p) => (p.effectivePrice < min.effectivePrice ? p : min), normalized[0])
}

const clampImageZoom = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return 1
  return Math.min(Math.max(n, 1), 2.5)
}

function ReviewStars({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= Number(value || 0)
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border text-xl transition ${
              active
                ? 'border-gold bg-gold/15 text-gold'
                : 'border-slate-200 bg-white text-slate-300 hover:border-gold/40 hover:text-gold'
            }`}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [product, setProduct] = useState(null)
  const [reviewMessage, setReviewMessage] = useState('')
  const [error, setError] = useState('')
  const [relatedProducts, setRelatedProducts] = useState([])
  const [qty, setQty] = useState(1)
  const [packLabel, setPackLabel] = useState('')
  const [reviewOpen, setReviewOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const user = auth.getUser()
  const isAdmin = user?.isAdmin === true

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { orderId: '', rating: 0, comment: '' },
  })

  const selectedRating = watch('rating')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getProduct(id)
        setProduct(data)
        setSelectedImageIndex(0)
        setReviewOpen(false)
        const firstPack = Array.isArray(data?.packs) && data.packs.length ? data.packs[0].label || '' : ''
        setPackLabel(firstPack)

        const minPack = getMinPack(Array.isArray(data?.packs) ? data.packs : [])
        dispatch(
          trackView({
            product: data._id,
            name: data.name,
            image: data.images?.[0] || '',
            price: minPack ? minPack.price : data.price,
            packLabel: minPack ? minPack.label : '',
          })
        )

        try {
          const relatedMap = new Map()
          const addRelated = (items = []) => {
            items.forEach((item) => {
              if (String(item._id) !== String(data._id)) {
                relatedMap.set(String(item._id), item)
              }
            })
          }

          if (Array.isArray(data.familyTags) && data.familyTags.length) {
            const related = await api.getProducts({ family: data.familyTags.slice(0, 3).join(','), limit: 8 })
            addRelated(related.products)
          }

          if (relatedMap.size < 4 && Array.isArray(data.purposeTags) && data.purposeTags.length) {
            const related = await api.getProducts({ purpose: data.purposeTags.slice(0, 3).join(','), limit: 8 })
            addRelated(related.products)
          }

          if (relatedMap.size < 4 && data.category) {
            const related = await api.getProducts({ category: data.category, limit: 8 })
            addRelated(related.products)
          }

          setRelatedProducts([...relatedMap.values()].slice(0, 4))
        } catch {
          setRelatedProducts([])
        }
      } catch (err) {
        setError(err.message)
      }
    }
    load()
  }, [dispatch, id])

  const selectedPack = Array.isArray(product?.packs)
    ? (() => {
        const pack = product.packs.find((p) => (p.label || '') === packLabel)
        if (!pack) return null
        const price = Number(pack.price)
        const salePrice = pack.salePrice === null || pack.salePrice === undefined || pack.salePrice === '' ? null : Number(pack.salePrice)
        const onSale = Number.isFinite(salePrice) && salePrice > 0 && Number.isFinite(price) && salePrice < price
        return {
          ...pack,
          price,
          salePrice: onSale ? salePrice : null,
          effectivePrice: onSale ? salePrice : price,
          onSale,
        }
      })()
    : null

  const sample = product?.sample || {}
  const sampleEnabled =
    sample.enabled === true && String(sample.label || '').trim() && !Number.isNaN(Number(sample.price))
  const displayPrice = selectedPack ? selectedPack.effectivePrice : product?.price
  const bulkPackSelected = isBulkPack(selectedPack?.label || packLabel)

  const refreshProduct = async () => {
    const updated = await api.getProduct(id)
    setProduct(updated)
  }

  const onSubmit = async (data) => {
    try {
      setReviewMessage('')
      await api.addReview(id, {
        orderId: String(data.orderId || '').trim(),
        rating: Number(data.rating),
        comment: String(data.comment || '').trim(),
      })
      setReviewMessage('Review submitted.')
      await refreshProduct()
      reset({ orderId: '', rating: 0, comment: '' })
      setReviewOpen(false)
    } catch (err) {
      setReviewMessage(err.message)
    }
  }

  if (error) {
    return (
      <div className="bg-sand min-h-screen px-6 py-16">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="bg-sand min-h-screen px-6 py-16">
        <p>Loading...</p>
      </div>
    )
  }

  const hasReviews = Array.isArray(product.reviews) && product.reviews.length > 0
  const productImageZoom = clampImageZoom(product.imageZoom)
  const availablePacks = Array.isArray(product.packs) ? product.packs : []
  const relatedList = relatedProducts.slice(0, 4)
  const formattedPrice = Number(displayPrice || 0).toLocaleString('en-IN')
  const productImages = Array.isArray(product.images) ? product.images.filter(Boolean) : []
  const selectedImage = productImages[selectedImageIndex] || productImages[0] || ''

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(201,162,74,0.22),transparent_34%),linear-gradient(180deg,#FFF8EA_0%,#F6F7FB_48%,#EEE3D1_100%)]">
      <section className="px-4 pb-10 pt-10 sm:px-6 lg:pb-12">
        <div className="mx-auto w-full max-w-7xl">
          <Link to="/products" className="text-xs font-semibold uppercase tracking-[0.28em] text-muted transition hover:text-gold">
            ← Back to products
          </Link>

          <div className="mt-6 overflow-hidden rounded-[36px] border border-white/75 bg-white/92 shadow-[0_34px_100px_rgba(17,27,58,0.14)] backdrop-blur">
            <div className="grid lg:grid-cols-[minmax(0,1.04fr)_minmax(420px,0.96fr)]">
              <div className="bg-[radial-gradient(circle_at_20%_10%,rgba(201,162,74,0.20),transparent_32%),linear-gradient(135deg,#FFFFFF,#F7F0E3)] p-4 sm:p-6 lg:p-8">
                <div className="ka-frame aspect-[4/3] min-h-[300px] w-full bg-white/90 sm:aspect-[16/11] lg:min-h-[520px]">
                  <a
                    href={selectedImage ? toAssetUrl(selectedImage, import.meta.env.VITE_API_ASSET) : undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="block h-full w-full"
                    title="Open full image"
                  >
                    {selectedImage ? (
                      <img
                        src={toAssetUrl(selectedImage, import.meta.env.VITE_API_ASSET)}
                        alt={product.name}
                        className="h-full w-full bg-white object-cover transition-transform duration-500"
                        style={{ transform: `scale(${productImageZoom})` }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-[linear-gradient(135deg,#f7efe5,#e6d6c2)]" />
                    )}
                  </a>
                </div>

                {productImages.length > 1 ? (
                  <div className="mt-5 rounded-[28px] border border-gold/20 bg-white/85 p-5 shadow-[0_16px_45px_rgba(17,27,58,0.08)]">
                    <div className="flex justify-end">
                      <span className="rounded-full border border-slate-200 bg-clay/70 px-3 py-1 text-[11px] font-semibold text-emberDark">
                        {selectedImageIndex + 1} / {productImages.length}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5">
                      {productImages.map((url, index) => (
                        <button
                          key={`${url}-${index}`}
                          type="button"
                          onClick={() => setSelectedImageIndex(index)}
                          className={`aspect-square overflow-hidden rounded-2xl border bg-white transition ${
                            selectedImageIndex === index
                              ? 'border-gold shadow-[0_10px_25px_rgba(201,162,74,0.22)]'
                              : 'border-slate-200 hover:border-gold/50'
                          }`}
                          aria-label={`Show product photo ${index + 1}`}
                        >
                          <img
                            src={toAssetUrl(url, import.meta.env.VITE_API_ASSET)}
                            alt={`${product.name} ${index + 1}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emberDark">
                    {product.category || 'Attar'}
                  </span>
                  {sampleEnabled ? (
                    <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emberDark">
                      Sample available
                    </span>
                  ) : null}
                </div>

                <p className="ka-kicker mt-8">Product details</p>
                <h1 className="mt-3 font-display text-4xl leading-tight text-ink md:text-5xl">{product.name}</h1>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <p className="rounded-full bg-ember px-6 py-3 text-2xl font-semibold text-white shadow-lg shadow-ember/20">
                    ₹{formattedPrice}
                  </p>
                  {selectedPack?.onSale ? (
                    <>
                      <p className="text-lg font-semibold text-muted line-through">₹{selectedPack.price}</p>
                      <span className="rounded-full bg-red-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white">
                        Sale
                      </span>
                    </>
                  ) : null}
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-clay/60 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Category</p>
                    <p className="mt-2 text-sm font-semibold text-ink">{product.category || 'Attar'}</p>
                  </div>
                  {availablePacks.length > 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-clay/60 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Pack options</p>
                      <p className="mt-2 text-sm font-semibold text-ink">{availablePacks.length} size{availablePacks.length > 1 ? 's' : ''}</p>
                    </div>
                  ) : null}
                  {sampleEnabled ? (
                    <div className="rounded-3xl border border-gold/25 bg-gold/10 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Sample</p>
                      <p className="mt-2 text-sm font-semibold text-ink">
                        {sample.label} • ₹{sample.price}
                      </p>
                    </div>
                  ) : null}
                </div>

                {isAdmin ? (
                  <div className="mt-8 rounded-[28px] border border-gold/25 bg-[linear-gradient(180deg,#FFFFFF,#FFF8ED)] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Admin controls</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Link to={`/admin/products/${product._id}`} className="ka-btn-primary px-5 py-3">
                        Edit product
                      </Link>
                      <Link to="/admin/products" className="ka-btn-ghost px-5 py-3">
                        Admin products
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 rounded-[28px] border border-gold/25 bg-[linear-gradient(180deg,#FFFFFF,#FFF8ED)] p-5 shadow-[0_18px_55px_rgba(122,85,50,0.10)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Buy now</p>
                    <p className="mt-2 text-sm text-muted">
                      Choose pack size and quantity. For bulk requirements, contact us directly.
                    </p>

                    {sampleEnabled ? (
                      <div className="mt-5 rounded-3xl border border-gold/25 bg-white/80 p-4">
                        <p className="text-sm font-semibold text-ink">Try a sample first</p>
                        <p className="mt-2 text-sm text-muted">Test this product before buying the full pack.</p>
                        <p className="mt-3 text-sm font-semibold text-ink">
                          {sample.label} • ₹{sample.price}
                        </p>
                      </div>
                    ) : null}

                    {availablePacks.length > 0 ? (
                      <div className="mt-5">
                        <label className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Pack size</label>
                        <select
                          value={packLabel}
                          onChange={(e) => setPackLabel(e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink"
                        >
                          {availablePacks.map((p) => {
                            const regularPrice = Number(p.price)
                            const salePrice = p.salePrice === null || p.salePrice === undefined || p.salePrice === '' ? null : Number(p.salePrice)
                            const optionPrice =
                              Number.isFinite(salePrice) && salePrice > 0 && salePrice < regularPrice
                                ? salePrice
                                : regularPrice
                            return (
                              <option key={p.label} value={p.label}>
                                {p.label} — ₹{optionPrice}
                              </option>
                            )
                          })}
                        </select>
                      </div>
                    ) : null}

                    <div className="mt-5">
                      <label className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value || 1))))}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink"
                      />
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => {
                          const item = {
                            product: product._id,
                            name: product.name,
                            price: displayPrice,
                            image: product.images?.[0] || '',
                            packLabel: availablePacks.length ? packLabel : '',
                            qty,
                          }

                          dispatch(addToCart(item))
                          navigate('/cart')
                        }}
                        disabled={bulkPackSelected}
                        className="ka-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Add to cart
                      </button>

                      {sampleEnabled ? (
                        <button
                          type="button"
                          onClick={() => {
                            dispatch(
                              addToCart({
                                product: product._id,
                                name: product.name,
                                price: Number(sample.price),
                                image: product.images?.[0] || '',
                                packLabel: sample.label,
                                isSample: true,
                                qty,
                              })
                            )
                            navigate('/cart')
                          }}
                          className="ka-btn-ghost px-5 py-3"
                        >
                          Buy sample
                        </button>
                      ) : null}
                    </div>

                    <Link
                      to="/contact"
                      state={{
                        intent: 'bulk',
                        product: {
                          id: product?._id,
                          name: product?.name,
                          packLabel: availablePacks.length ? packLabel : '',
                          qty,
                          price: displayPrice,
                        },
                      }}
                      className="mt-4 inline-flex text-sm font-semibold text-emberDark underline decoration-gold/50 underline-offset-4 transition hover:text-gold"
                    >
                      Need bulk quantity? Contact us
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6">
        <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <article className="rounded-[32px] border border-white/75 bg-white/92 p-6 shadow-[0_24px_70px_rgba(17,27,58,0.10)] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="ka-kicker">Description</p>
                <h2 className="mt-3 ka-h2">About this product</h2>
              </div>
              {hasReviews ? (
                <span className="rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-xs font-semibold text-emberDark">
                  {Number(product.rating || 0).toFixed(1)} / 5
                </span>
              ) : null}
            </div>

            <RichTextContent value={product.description} className="mt-6 space-y-5 text-base leading-8 text-muted" />

            {product.highlights?.length > 0 && (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {product.highlights.map((item) => (
                  <li key={item} className="rounded-2xl border border-gold/20 bg-clay/50 p-4 text-sm font-medium text-muted">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </article>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-white/75 bg-white/92 p-6 shadow-[0_24px_70px_rgba(17,27,58,0.10)]">
              <p className="ka-kicker">Product snapshot</p>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-clay/60 p-4">
                  <span className="text-muted">Price</span>
                  <span className="font-semibold text-ink">₹{formattedPrice}</span>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-clay/60 p-4">
                  <span className="text-muted">Category</span>
                  <span className="font-semibold text-ink">{product.category || 'Attar'}</span>
                </div>
                {availablePacks.length > 0 ? (
                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-clay/60 p-4">
                    <span className="text-muted">Pack sizes</span>
                    <span className="font-semibold text-ink">{availablePacks.length}</span>
                  </div>
                ) : null}
              </div>
            </div>

            {!isAdmin ? (
              <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Review</p>
                      <h2 className="mt-2 text-xl font-semibold text-ink">Leave a verified review</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReviewOpen((v) => !v)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-emberDark transition hover:border-gold/50"
                    >
                      {reviewOpen ? 'Hide form' : 'Write a review'}
                    </button>
                  </div>

                  <p className="mt-3 text-sm text-muted">
                    Enter your delivered Order ID. We will verify that this product was included in that delivered order before your review is saved.
                  </p>

                  {reviewOpen ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-ink">Order ID</label>
                        <input
                          {...register('orderId')}
                          placeholder="KA-XXXXXX"
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
                        />
                        {errors.orderId ? <p className="mt-2 text-xs text-red-600">{errors.orderId.message}</p> : null}
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <label className="text-sm font-semibold text-ink">Your rating</label>
                          <span className="text-xs font-semibold text-muted">
                            {selectedRating ? `${selectedRating} / 5` : 'Tap a star'}
                          </span>
                        </div>
                        <div className="mt-3">
                          <ReviewStars value={selectedRating} onChange={(value) => setValue('rating', value, { shouldValidate: true })} />
                        </div>
                        {errors.rating ? <p className="mt-2 text-xs text-red-600">{errors.rating.message}</p> : null}
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-ink">Comment (optional)</label>
                        <textarea
                          rows="4"
                          {...register('comment')}
                          placeholder="How was the fragrance, longevity, or overall experience?"
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
                        />
                        {errors.comment ? <p className="mt-2 text-xs text-red-600">{errors.comment.message}</p> : null}
                      </div>

                      <button type="submit" className="rounded-full bg-ember px-5 py-2 text-sm font-semibold text-white">
                        Submit review
                      </button>
                    </form>
                  ) : null}

                  {reviewMessage ? <p className="mt-4 text-sm font-semibold text-emberDark">{reviewMessage}</p> : null}
                </div>
              ) : null}

              {hasReviews ? (
                <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-semibold text-ink">Reviews</h2>
                  <p className="mt-2 text-sm text-muted">
                    Rating: {Number(product.rating || 0).toFixed(1)} ({product.numReviews} reviews)
                  </p>

                  <div className="mt-5 space-y-3 lg:max-h-[32rem] lg:overflow-y-auto lg:pr-1">
                    {product.reviews?.map((review) => (
                      <div key={review._id} className="rounded-2xl border border-ember/10 bg-clay/40 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-ink">{review.name}</p>
                            {review.verifiedPurchase ? (
                              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
                                Verified purchase
                              </p>
                            ) : null}
                          </div>
                          <p className="text-xs font-semibold text-emberDark">{'★'.repeat(Number(review.rating || 0))}</p>
                        </div>
                        {review.comment ? (
                          <p className="mt-2 text-sm leading-6 text-muted">{review.comment}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
          </aside>
        </div>
      </section>

      {relatedList.length ? (
        <section className="px-4 pb-14 sm:px-6">
          <div className="mx-auto w-full max-w-7xl rounded-[32px] border border-white/75 bg-white/92 p-6 shadow-[0_24px_70px_rgba(17,27,58,0.10)] sm:p-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="ka-kicker">You may also like</p>
                <h2 className="mt-3 ka-h2">Related products</h2>
              </div>
              <Link to="/products" className="ka-btn-ghost px-5 py-2">
                View all products
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedList.map((item) => {
                const minPack = getMinPack(Array.isArray(item.packs) ? item.packs : [])
                const price = minPack ? minPack.effectivePrice : item.price
                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => navigate(`/products/${item._id}`)}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_18px_45px_rgba(17,27,58,0.12)]"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-clay">
                      {item.images?.[0] ? (
                        <img
                          src={toAssetUrl(item.images[0], import.meta.env.VITE_API_ASSET)}
                          alt={item.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full bg-[linear-gradient(135deg,rgba(201,162,74,0.18),rgba(255,255,255,0.92),rgba(17,27,58,0.08))]" />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="line-clamp-2 text-sm font-semibold text-ink">{item.name}</p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs font-semibold text-emberDark">
                          ₹{Number(price || 0).toLocaleString('en-IN')}
                        </span>
                        {minPack?.label ? <span className="text-xs font-semibold text-muted">{minPack.label}</span> : null}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}

      <div className="bg-gradient-to-b from-sand to-clay">
        <RecentlyViewedStrip excludeId={product?._id} title="Recently viewed" />
      </div>
    </div>
  )
}

export default ProductDetail
