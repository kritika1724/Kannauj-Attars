import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api, auth } from '../services/api'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../features/cartSlice'
import { addToWishlist, removeFromWishlist } from '../features/wishlistSlice'
import AddToCartModal from '../components/AddToCartModal'
import { toAssetUrl } from '../utils/media'
import { PURPOSE_TAGS, FAMILY_TAGS } from '../config/taxonomy'
import { FiHeart } from 'react-icons/fi'

const SORT_VALUES = new Set(['newest', 'price_asc', 'price_desc', 'rating_desc', 'name_asc'])
const PURPOSE_VALUES = new Set(PURPOSE_TAGS.map((t) => t.id))
const FAMILY_VALUES = new Set(FAMILY_TAGS.map((t) => t.id))

const getMinPack = (packs = []) => {
  const normalized = packs
    .map((p) => ({ label: (p.label || '').trim(), price: Number(p.price) }))
    .filter((p) => p.label && !Number.isNaN(p.price))
  if (!normalized.length) return null
  return normalized.reduce((min, p) => (p.price < min.price ? p : min), normalized[0])
}

function Products() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const searchKey = searchParams.toString()
  const user = auth.getUser()
  const isAdmin = user?.isAdmin === true
  const [products, setProducts] = useState([])
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [sort, setSort] = useState('newest')
  const [purposes, setPurposes] = useState([])
  const [families, setFamilies] = useState([])
  const [bestSellerOnly, setBestSellerOnly] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [error, setError] = useState('')
  const [cartModal, setCartModal] = useState({ open: false, product: null })

  const purposeParam = purposes.join(',')
  const familyParam = families.join(',')
  const activeFilterCount = purposes.length + families.length + (bestSellerOnly ? 1 : 0)

  const togglePurpose = (id) => {
    setPage(1)
    setPurposes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleFamily = (id) => {
    setPage(1)
    setFamilies((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleBestSellers = () => {
    setPage(1)
    setBestSellerOnly((v) => !v)
  }

  useEffect(() => {
    // Allow deep links from Explore page, e.g. /products?purpose=daily_wear&sort=rating_desc
    const qpKeyword = (searchParams.get('keyword') || '').trim()
    const qpSort = (searchParams.get('sort') || '').trim()
    const qpPurpose = (searchParams.get('purpose') || '').trim() // can be comma-separated list
    const qpFamily = (searchParams.get('family') || '').trim() // can be comma-separated list
    const qpBestSeller = (searchParams.get('bestSeller') || '').trim()
    const qpPageRaw = (searchParams.get('page') || '').trim()

    const nextSort = SORT_VALUES.has(qpSort) ? qpSort : 'newest'
    const nextPurposes = qpPurpose
      ? qpPurpose
          .split(',')
          .map((s) => s.trim())
          .filter((id) => PURPOSE_VALUES.has(id))
      : []
    const nextFamilies = qpFamily
      ? qpFamily
          .split(',')
          .map((s) => s.trim())
          .filter((id) => FAMILY_VALUES.has(id))
      : []
    const nextPage = Number(qpPageRaw || 1)

    setKeyword(qpKeyword)
    setSort(nextSort)
    setPurposes(nextPurposes)
    setFamilies(nextFamilies)
    setBestSellerOnly(['1', 'true', 'yes', 'on'].includes(qpBestSeller.toLowerCase()))
    setPage(Number.isFinite(nextPage) && nextPage > 0 ? nextPage : 1)
  }, [searchKey])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getProducts({
          page,
          keyword,
          sort,
          purpose: purposeParam,
          family: familyParam,
          bestSeller: bestSellerOnly ? 1 : '',
        })
        const list = Array.isArray(data) ? data : data.products || []
        setProducts(list)
        setPages(Array.isArray(data) ? 1 : data.pages || 1)
      } catch (err) {
        setError(err.message)
      }
    }
    load()
  }, [page, keyword, sort, purposeParam, familyParam, bestSellerOnly])

  return (
    <div className="bg-sand min-h-screen">
      <header className="px-6 pb-10 pt-12">
        <div className="mx-auto w-full max-w-6xl">
          <p className="ka-kicker">Products</p>
          <h1 className="mt-3 ka-h1">Explore our attars</h1>
          <p className="mt-4 ka-lead">Handcrafted blends for every mood.</p>
        </div>
      </header>

      <section className="px-6 pb-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8 grid gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto_auto]">
              <input
                value={keyword}
                onChange={(e) => {
                  setPage(1)
                  setKeyword(e.target.value)
                }}
                placeholder="Search attars…"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/15"
              />
              <button
                type="button"
                aria-expanded={filtersOpen}
                aria-controls="product-filters"
                onClick={() => setFiltersOpen((v) => !v)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-gold/50"
              >
                Filters
                {activeFilterCount > 0 ? (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-ember px-2 py-0.5 text-[10px] font-semibold text-white">
                    {activeFilterCount}
                  </span>
                ) : null}
                <span className="text-xs font-semibold text-muted">{filtersOpen ? 'Hide' : 'Show'}</span>
              </button>
              <select
                value={sort}
                onChange={(e) => {
                  setPage(1)
                  setSort(e.target.value)
                }}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Top Rated</option>
                <option value="name_asc">Name: A–Z</option>
              </select>
              <div className="flex items-center justify-between gap-2 md:justify-end">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-emberDark disabled:opacity-50"
                >
                  Prev
                </button>
                <p className="text-xs font-semibold text-muted">
                  Page {page} / {pages}
                </p>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page >= pages}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-emberDark disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>

            {activeFilterCount > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
                    Active:
                  </span>
                  {bestSellerOnly ? (
                    <span className="rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-midnight">
                      Best sellers
                    </span>
                  ) : null}
                  {purposes.map((id) => (
                    <span
                      key={id}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-emberDark"
                    >
                      {PURPOSE_TAGS.find((t) => t.id === id)?.label || id}
                    </span>
                  ))}
                  {families.map((id) => (
                    <span
                      key={id}
                      className="rounded-full bg-clay/70 px-3 py-1 text-[11px] font-semibold text-emberDark"
                    >
                      {FAMILY_TAGS.find((t) => t.id === id)?.label || id}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPage(1)
                    setPurposes([])
                    setFamilies([])
                    setBestSellerOnly(false)
                  }}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-emberDark transition hover:border-gold/50"
                >
                  Clear
                </button>
              </div>
            ) : null}

            {filtersOpen ? (
              <div
                id="product-filters"
                className="rounded-3xl border border-slate-200/80 bg-clay/60 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Filter options</p>
                  <p className="mt-2 text-sm text-muted">
                      Select multiple purposes and fragrance families (checkboxes).
                  </p>
                </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPage(1)
                      setPurposes([])
                      setFamilies([])
                      setBestSellerOnly(false)
                    }}
                    disabled={purposes.length === 0 && families.length === 0 && !bestSellerOnly}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-emberDark transition hover:border-gold/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Clear filters
                  </button>
                </div>

                <label className="mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">Best sellers only</p>
                    <p className="mt-1 text-xs text-muted">Show curated best seller picks.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={bestSellerOnly}
                    onChange={toggleBestSellers}
                    className="h-5 w-5 accent-ember"
                  />
                </label>

                <div className="mt-5 grid gap-6 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Shop by purpose</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {PURPOSE_TAGS.map((t) => {
                        const checked = purposes.includes(t.id)
                        return (
                          <label
                            key={t.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                              checked
                                ? 'border-gold/40 bg-white'
                                : 'border-slate-200 bg-white hover:border-gold/35'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePurpose(t.id)}
                              className="mt-1 h-4 w-4 accent-ember"
                            />
                            <span className="text-sm font-semibold text-ink">{t.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Fragrance family</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {FAMILY_TAGS.map((t) => {
                        const checked = families.includes(t.id)
                        return (
                          <label
                            key={t.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                              checked
                                ? 'border-gold/40 bg-white'
                                : 'border-slate-200 bg-white hover:border-gold/35'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleFamily(t.id)}
                              className="mt-1 h-4 w-4 accent-ember"
                            />
                            <span className="text-sm font-semibold text-ink">{t.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <div className="grid gap-6 md:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onView={() => navigate(`/products/${product._id}`)}
                onAdd={!isAdmin ? () => setCartModal({ open: true, product }) : null}
                isAdmin={isAdmin}
              />
            ))}
            {products.length === 0 && (
              <p className="text-sm text-muted">No products yet. Add some from the admin panel.</p>
            )}
          </div>
        </div>
      </section>

      {!isAdmin ? (
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

            const item = {
              product: p._id,
              name: p.name,
              price,
              image: p.images?.[0] || '',
              packLabel: packs.length ? packLabel : '',
              qty,
            }

            dispatch(addToCart(item))
            setCartModal({ open: false, product: null })
            navigate('/cart')
          }}
        />
      ) : null}
    </div>
  )
}

function ProductCard({ product, onView, onAdd, isAdmin }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const wishlistItems = useSelector((state) => state.wishlist.items)
  const wished = wishlistItems.some((x) => x.product === product._id)
  const minPack = useMemo(() => getMinPack(Array.isArray(product?.packs) ? product.packs : []), [product?.packs])
  const showPack = Array.isArray(product?.packs) && product.packs.length && minPack

  return (
    <article className="group rounded-3xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-black/10 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/15">
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative ka-frame ka-mediaBg aspect-[4/3] w-full">
          {product.images?.[0] ? (
            <img
              src={toAssetUrl(product.images[0], import.meta.env.VITE_API_ASSET)}
              alt={product.name}
              className="h-full w-full bg-white object-contain p-3 transition group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(135deg,rgba(201,162,74,0.22),rgba(255,255,255,0.92),rgba(17,27,58,0.10))]" />
          )}

          {!isAdmin ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()

                const item = {
                  product: product._id,
                  name: product.name,
                  image: product.images?.[0] || '',
                  price: showPack ? minPack.price : product.price,
                  packLabel: showPack ? minPack.label : '',
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
              className={`absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/95 shadow-sm transition hover:-translate-y-0.5 ${
                wished ? 'border-gold/60' : 'border-slate-200 hover:border-gold/40'
              }`}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              title={wished ? 'Saved' : 'Save'}
            >
              <FiHeart className={wished ? 'text-ember' : 'text-muted'} />
            </button>
          ) : null}
        </div>
      </Link>

      <div className="mt-4">
        <Link to={`/products/${product._id}`} className="block">
          <h3 className="text-lg font-semibold text-ink">{product.name}</h3>
        </Link>

        {(Array.isArray(product.purposeTags) && product.purposeTags.length > 0) ||
        (Array.isArray(product.familyTags) && product.familyTags.length > 0) ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {(product.purposeTags || []).slice(0, 1).map((id) => (
              <span key={id} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-emberDark">
                {PURPOSE_TAGS.find((t) => t.id === id)?.label || id}
              </span>
            ))}
            {(product.familyTags || []).slice(0, 2).map((id) => (
              <span key={id} className="rounded-full bg-clay/70 px-3 py-1 text-[11px] font-semibold text-emberDark">
                {FAMILY_TAGS.find((t) => t.id === id)?.label || id}
              </span>
            ))}
          </div>
        ) : null}

        <p className="mt-2 text-sm text-muted">
          {showPack ? (
            <>
              <span className="font-semibold text-ink">{minPack.label}</span> / ₹{minPack.price}
            </>
          ) : (
            <>₹{product.price}</>
          )}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {!isAdmin ? (
            <button
              type="button"
              onClick={onAdd}
              className="ka-btn-primary px-5 py-2"
            >
              Add to cart
            </button>
          ) : (
            <Link
              to={`/admin/products/${product._id}`}
              className="ka-btn-primary px-5 py-2"
            >
              Edit (Admin)
            </Link>
          )}
          <button
            type="button"
            onClick={onView}
            className="ka-btn-ghost px-5 py-2"
          >
            View
          </button>
        </div>
      </div>
    </article>
  )
}

export default Products
