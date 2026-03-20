import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { api, auth } from '../services/api'
import { addToCart } from '../features/cartSlice'
import { addToWishlist, removeFromWishlist } from '../features/wishlistSlice'
import { viewProduct as trackView } from '../features/recentlyViewedSlice'
import { toAssetUrl } from '../utils/media'
import { FiHeart } from 'react-icons/fi'
import RecentlyViewedStrip from '../components/RecentlyViewedStrip'

const schema = yup.object({
  rating: yup.number().required('Rating is required.').min(1).max(5),
  comment: yup.string().required('Comment is required.'),
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
    .map((p) => ({ label: (p.label || '').trim(), price: Number(p.price) }))
    .filter((p) => p.label && !Number.isNaN(p.price))
  if (!normalized.length) return null
  return normalized.reduce((min, p) => (p.price < min.price ? p : min), normalized[0])
}

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [product, setProduct] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [qty, setQty] = useState(1)
  const [packLabel, setPackLabel] = useState('')
  const [buyerType, setBuyerType] = useState('personal') // personal | industrial
  const user = auth.getUser()
  const isAdmin = user?.isAdmin === true
  const wishlistItems = useSelector((state) => state.wishlist.items)
  const wished = wishlistItems.some((x) => x.product === id)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(schema) })

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getProduct(id)
        setProduct(data)
        const firstPack = Array.isArray(data?.packs) && data.packs.length ? (data.packs[0].label || '') : ''
        setPackLabel(firstPack)
        if (firstPack && isBulkPack(firstPack)) setBuyerType('industrial')

        // Track recently viewed (stored locally per-user/guest).
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
      } catch (err) {
        setError(err.message)
      }
    }
    load()
  }, [dispatch, id])

  const selectedPack = Array.isArray(product?.packs)
    ? product.packs.find((p) => (p.label || '') === packLabel)
    : null
  const displayPrice = selectedPack ? selectedPack.price : product?.price
  const bulkPackSelected = isBulkPack(selectedPack?.label || packLabel)
  const retailFallbackLabel = Array.isArray(product?.packs)
    ? (product.packs.find((p) => !isBulkPack(p.label))?.label || '')
    : ''

  useEffect(() => {
    if (!product) return
    if (bulkPackSelected) setBuyerType('industrial')
  }, [bulkPackSelected, product])

  const onSubmit = async (data) => {
    try {
      await api.addReview(id, data)
      setMessage('Review submitted.')
      const updated = await api.getProduct(id)
      setProduct(updated)
      reset()
    } catch (err) {
      setMessage(err.message)
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

  return (
    <div className="bg-sand min-h-screen">
      <header className="px-6 pb-10 pt-12">
        <div className="mx-auto w-full max-w-6xl">
          <p className="ka-kicker">Product</p>
          <h1 className="mt-3 ka-h1">{product.name}</h1>
          <p className="mt-4 ka-lead">₹{displayPrice}</p>
        </div>
      </header>

      <section className="px-6 pb-16">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="ka-frame ka-mediaBg aspect-[4/3] w-full">
              {product.images?.[0] ? (
                <a
                  href={toAssetUrl(product.images[0], import.meta.env.VITE_API_ASSET)}
                  target="_blank"
                  rel="noreferrer"
                  className="block h-full w-full"
                  title="Open full image"
                >
                  <img
                    src={toAssetUrl(product.images[0], import.meta.env.VITE_API_ASSET)}
                    alt={product.name}
                    className="h-full w-full bg-white object-contain p-4"
                    loading="lazy"
                  />
                </a>
              ) : (
                <div className="h-full w-full bg-[linear-gradient(135deg,#f7efe5,#e6d6c2)]" />
              )}
            </div>
            <p className="mt-6 text-sm text-muted">{product.description}</p>
            {product.highlights?.length > 0 && (
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {product.highlights.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            )}

            {!isAdmin ? (
              <div className="mt-8 flex flex-wrap items-center gap-4">
                {Array.isArray(product.packs) && product.packs.length > 0 && (
                  <div className="flex flex-col gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <label className="text-xs font-semibold text-muted">Select pack size</label>
                    <select
                      value={packLabel}
                      onChange={(e) => setPackLabel(e.target.value)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink"
                    >
                      {product.packs.map((p) => (
                        <option key={p.label} value={p.label}>
                          {p.label} — ₹{p.price}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2">
                  <label className="text-xs font-semibold text-muted">Qty</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value || 1))))}
                    className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink"
                  />
                </div>

                <div className="w-full">
                  <p className="text-xs font-semibold text-muted">Buying for</p>
                  <div className="mt-2 flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setBuyerType('personal')}
                      disabled={bulkPackSelected}
                      className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold transition ${
                        buyerType === 'personal' ? 'bg-ember text-white' : 'text-emberDark hover:bg-clay/60'
                      } ${bulkPackSelected ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      Personal
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuyerType('industrial')}
                      className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold transition ${
                        buyerType === 'industrial' ? 'bg-ember text-white' : 'text-emberDark hover:bg-clay/60'
                      }`}
                    >
                      Bulk / Industrial
                    </button>
                  </div>
                </div>

                {buyerType === 'industrial' ? (
                  <div className="w-full rounded-2xl border border-gold/25 bg-clay/60 p-4">
                    <p className="text-sm font-semibold text-ink">Bulk / industrial inquiry</p>
                    <p className="mt-2 text-sm text-muted">
                      For bulk/industrial orders, pricing and availability are usually shared on inquiry. Would you like
                      to contact us directly?
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/contact', {
                            state: {
                              intent: 'bulk',
                              product: {
                                id: product?._id,
                                name: product?.name,
                                packLabel: Array.isArray(product.packs) && product.packs.length ? packLabel : '',
                                qty,
                                price: displayPrice,
                              },
                            },
                          })
                        }}
                        className="ka-btn-primary px-5 py-2"
                      >
                        Contact us
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (bulkPackSelected) {
                            if (retailFallbackLabel) setPackLabel(retailFallbackLabel)
                            setBuyerType('personal')
                            return
                          }
                          setBuyerType('personal')
                        }}
                        className="ka-btn-ghost px-5 py-2"
                      >
                        {bulkPackSelected ? 'Choose smaller pack' : 'Continue purchase'}
                      </button>
                    </div>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    const item = {
                      product: product._id,
                      name: product.name,
                      price: displayPrice,
                      image: product.images?.[0] || '',
                      packLabel: Array.isArray(product.packs) && product.packs.length ? packLabel : '',
                      qty,
                    }

                    dispatch(addToCart(item))
                    navigate('/cart')
                  }}
                  disabled={buyerType === 'industrial' || bulkPackSelected}
                  className="ka-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Add to cart
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const packs = Array.isArray(product?.packs) ? product.packs : []
                    const normalized = packs
                      .map((p) => ({ label: (p.label || '').trim(), price: Number(p.price) }))
                      .filter((p) => p.label && !Number.isNaN(p.price))
                    const minPack = normalized.length
                      ? normalized.reduce((min, p) => (p.price < min.price ? p : min), normalized[0])
                      : null

                    const item = {
                      product: product._id,
                      name: product.name,
                      image: product.images?.[0] || '',
                      price: minPack ? minPack.price : product.price,
                      packLabel: minPack ? minPack.label : '',
                    }

                    if (!auth.getUser()) {
                      try {
                        sessionStorage.setItem('pendingAddToWishlist', JSON.stringify(item))
                      } catch {
                        // ignore
                      }
                      navigate('/account', { state: { intent: 'wishlist' } })
                      return
                    }

                    if (wished) dispatch(removeFromWishlist(product._id))
                    else dispatch(addToWishlist(item))
                  }}
                  className={`inline-flex items-center gap-2 rounded-full border bg-white px-5 py-2 text-sm font-semibold transition hover:border-gold/50 hover:bg-clay/60 ${
                    wished ? 'border-gold/60 text-emberDark' : 'border-slate-200 text-emberDark'
                  }`}
                >
                  <FiHeart className={wished ? 'text-ember' : 'text-muted'} />
                  {wished ? 'Saved' : 'Save'}
                </button>
                <Link
                  to="/products"
                  className="ka-btn-ghost"
                >
                  Back
                </Link>
              </div>
            ) : (
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to={`/admin/products/${product._id}`}
                  className="ka-btn-primary"
                >
                  Edit product (Admin)
                </Link>
                <Link
                  to="/admin/products"
                  className="ka-btn-ghost"
                >
                  Back to admin products
                </Link>
              </div>
            )}
          </div>

          <div className="ka-card p-6">
            <h2 className="text-lg font-semibold text-ink">Reviews</h2>
            <p className="mt-2 text-sm text-muted">
              Rating: {product.rating.toFixed(1)} ({product.numReviews} reviews)
            </p>

            <div className="mt-6 space-y-4">
              {product.reviews?.map((review) => (
                <div key={review._id} className="rounded-2xl border border-ember/10 bg-clay/40 p-4">
                  <p className="text-sm font-semibold text-ink">{review.name}</p>
                  <p className="text-xs text-muted">Rating: {review.rating}</p>
                  <p className="mt-2 text-sm text-muted">{review.comment}</p>
                </div>
              ))}
              {product.reviews?.length === 0 && (
                <p className="text-sm text-muted">No reviews yet.</p>
              )}
            </div>

            <div className="mt-6">
              {user && !isAdmin ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-ink">Rating (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      {...register('rating')}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
                    />
                    {errors.rating && <p className="mt-2 text-xs text-red-600">{errors.rating.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-ink">Comment</label>
                    <textarea
                      rows="4"
                      {...register('comment')}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20"
                    />
                    {errors.comment && (
                      <p className="mt-2 text-xs text-red-600">{errors.comment.message}</p>
                    )}
                  </div>
                  <button type="submit" className="rounded-full bg-ember px-5 py-2 text-sm font-semibold text-white">
                    Submit review
                  </button>
                </form>
              ) : !user ? (
                <p className="text-sm text-muted">Login to leave a review.</p>
              ) : null}
              {message && <p className="mt-3 text-sm font-semibold text-emberDark">{message}</p>}
            </div>
          </div>
        </div>
      </section>

      <div className="bg-gradient-to-b from-sand to-clay">
        <RecentlyViewedStrip excludeId={product?._id} title="Recently viewed" />
      </div>
    </div>
  )
}

export default ProductDetail
