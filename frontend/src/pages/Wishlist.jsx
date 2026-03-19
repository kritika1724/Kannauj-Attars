import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiHeart, FiTrash2 } from 'react-icons/fi'
import { removeFromWishlist, clearWishlist } from '../features/wishlistSlice'
import { addToCart } from '../features/cartSlice'
import AddToCartModal from '../components/AddToCartModal'
import { api, auth } from '../services/api'
import { toAssetUrl } from '../utils/media'

function Wishlist() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = auth.getUser()
  const isAdmin = user?.isAdmin === true
  const items = useSelector((state) => state.wishlist.items)
  const count = items.length
  const [error, setError] = useState('')
  const [cartModal, setCartModal] = useState({ open: false, product: null })

  const title = useMemo(() => (count ? `Wishlist (${count})` : 'Wishlist'), [count])

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-sand px-6 py-16">
        <div className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200/80 bg-white p-8 shadow-lg shadow-black/10">
          <h1 className="font-display text-3xl text-ink">Wishlist</h1>
          <p className="mt-4 text-sm text-muted">Wishlist is a customer feature and is disabled for admin accounts.</p>
          <Link to="/admin" className="mt-6 inline-flex w-fit rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white">
            Go to admin dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand">
      <header className="px-6 pb-10 pt-12">
        <div className="mx-auto w-full max-w-6xl">
          <p className="ka-kicker">Account</p>
          <h1 className="mt-3 ka-h1">{title}</h1>
          <p className="mt-4 ka-lead">Save products you want to revisit.</p>
        </div>
      </header>

      <section className="px-6 pb-16">
        <div className="mx-auto w-full max-w-6xl">
          {error ? <p className="mb-5 text-sm text-red-600">{error}</p> : null}

          {count > 0 ? (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-emberDark">
                <span className="inline-flex items-center gap-2">
                  <FiHeart className="text-ember" />
                  {count} saved {count === 1 ? 'item' : 'items'}
                </span>
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-emberDark hover:border-gold/40"
                >
                  Browse products
                </Link>
                <button
                  type="button"
                  onClick={() => dispatch(clearWishlist())}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-emberDark hover:border-gold/40"
                >
                  Clear wishlist
                </button>
              </div>
            </div>
          ) : null}

          {count === 0 ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-lg shadow-black/10">
              <h2 className="text-xl font-semibold text-ink">Your wishlist is empty</h2>
              <p className="mt-3 text-sm text-muted">
                Tap the heart icon on a product to save it here.
              </p>
              <Link to="/products" className="mt-6 inline-flex rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white">
                Explore products
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {items.map((item) => (
                <article
                  key={item.product}
                  className="group rounded-3xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-black/10 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/15"
                >
                  <Link to={`/products/${item.product}`} className="block">
                    <div className="ka-frame ka-mediaBg aspect-[4/3] w-full">
                      {item.image ? (
                        <img
                          src={toAssetUrl(item.image, import.meta.env.VITE_API_ASSET)}
                          alt={item.name}
                          className="h-full w-full bg-white object-contain p-3 transition group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full bg-[linear-gradient(135deg,rgba(201,162,74,0.22),rgba(255,255,255,0.92),rgba(17,27,58,0.10))]" />
                      )}
                    </div>
                  </Link>

                  <div className="mt-4">
                    <Link to={`/products/${item.product}`} className="block">
                      <h3 className="text-lg font-semibold text-ink">{item.name}</h3>
                    </Link>

                    <p className="mt-2 text-sm text-muted">
                      {item.packLabel ? (
                        <>
                          <span className="font-semibold text-ink">{item.packLabel}</span> / ₹{item.price}
                        </>
                      ) : (
                        <>₹{item.price}</>
                      )}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={async () => {
                          setError('')
                          try {
                            const p = await api.getProduct(item.product)
                            setCartModal({ open: true, product: p })
                          } catch (e) {
                            setError(e.message)
                          }
                        }}
                        className="ka-btn-primary px-5 py-2"
                      >
                        Add to cart
                      </button>
                      <button
                        type="button"
                        onClick={() => dispatch(removeFromWishlist(item.product))}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-emberDark transition hover:border-gold/50 hover:bg-clay/60"
                        title="Remove from wishlist"
                      >
                        <FiTrash2 />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <AddToCartModal
        open={cartModal.open}
        product={cartModal.product}
        onClose={() => setCartModal({ open: false, product: null })}
        onConfirm={({ packLabel, qty }) => {
          const p = cartModal.product
          if (!p) return

          const packs = Array.isArray(p.packs) ? p.packs : []
          const chosen = packLabel ? packs.find((x) => (x.label || '').trim() === packLabel) : null
          const price = chosen ? chosen.price : p.price

          const cartItem = {
            product: p._id,
            name: p.name,
            price,
            image: p.images?.[0] || '',
            packLabel: packs.length ? packLabel : '',
            qty,
          }

          if (!auth.getUser()) {
            // Shouldn't happen because Wishlist route requires login, but keep it safe.
            try {
              sessionStorage.setItem('pendingAddToCart', JSON.stringify(cartItem))
            } catch {
              // ignore
            }
            setCartModal({ open: false, product: null })
            navigate('/account', { state: { intent: 'cart' } })
            return
          }

          dispatch(addToCart(cartItem))
          setCartModal({ open: false, product: null })
          navigate('/cart')
        }}
      />
    </div>
  )
}

export default Wishlist

