import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api, auth } from '../services/api'
import { useDispatch } from 'react-redux'
import { addToCart } from '../features/cartSlice'
import AddToCartModal from '../components/AddToCartModal'
import ProductCard from '../components/ProductCard'
import { useTaxonomy } from '../components/TaxonomyProvider'
import { BUSINESS } from '../config/business'
import { getPurposeCollectionMeta } from '../config/collections'

const SORT_VALUES = new Set(['newest', 'price_asc', 'price_desc', 'rating_desc', 'name_asc'])
const COLLECTION_MAP = {
  signature: {
    title: 'Signature Attars',
    lead: 'Admin-curated blends chosen for everyday elegance, balance, and easy wear.',
  },
  heritage: {
    title: 'Heritage Collection',
    lead: 'Admin-curated traditional profiles inspired by classic Kannauj perfumery.',
  },
}
const COLLECTION_VALUES = new Set(Object.keys(COLLECTION_MAP))

function Products() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const searchKey = searchParams.toString()
  const collectionKey = (searchParams.get('collection') || '').trim().toLowerCase()
  const activeCollection = COLLECTION_VALUES.has(collectionKey) ? collectionKey : ''
  const collectionMeta = activeCollection ? COLLECTION_MAP[activeCollection] : null
  const user = auth.getUser()
  const isAdmin = user?.isAdmin === true
  const {
    purposes: purposeOptions,
    families: familyOptions,
    purposeMap,
    familyMap,
    loading: taxonomyLoading,
  } = useTaxonomy()
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
  const purposeValues = new Set(purposeOptions.map((t) => t.id))
  const familyValues = new Set(familyOptions.map((t) => t.id))
  const activePurposeId = !activeCollection && purposes.length === 1 && families.length === 0 ? purposes[0] : ''
  const activePurposeMeta = activePurposeId
    ? getPurposeCollectionMeta(activePurposeId, purposeMap[activePurposeId] || activePurposeId)
    : null
  const pageMeta = collectionMeta || activePurposeMeta

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
          .filter((id) => purposeValues.has(id))
      : []
    const nextFamilies = qpFamily
      ? qpFamily
          .split(',')
          .map((s) => s.trim())
          .filter((id) => familyValues.has(id))
      : []
    const nextPage = Number(qpPageRaw || 1)

    setKeyword(qpKeyword)
    setSort(nextSort)
    setPurposes(nextPurposes)
    setFamilies(nextFamilies)
    setBestSellerOnly(['1', 'true', 'yes', 'on'].includes(qpBestSeller.toLowerCase()))
    setPage(Number.isFinite(nextPage) && nextPage > 0 ? nextPage : 1)
  }, [searchKey, taxonomyLoading, purposeOptions, familyOptions])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getProducts({
          page,
          keyword,
          sort,
          purpose: purposeParam,
          family: familyParam,
          collection: activeCollection,
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
  }, [page, keyword, sort, purposeParam, familyParam, activeCollection, bestSellerOnly])

  return (
    <div className="bg-sand min-h-screen">
      <header className="px-4 pb-10 pt-12 sm:px-6">
        <div className="mx-auto w-full max-w-6xl">
          <p className="ka-kicker">{pageMeta ? 'Collection' : 'Products'}</p>
          <h1 className="mt-3 ka-h1">{pageMeta ? pageMeta.title : 'Explore our attars'}</h1>
          <p className="mt-4 ka-lead">{pageMeta ? pageMeta.lead : 'Handcrafted blends for every mood.'}</p>
          <div className="mt-6">
            <Link to="/collections" className="ka-btn-primary px-6 py-3">
              Shop by purpose
            </Link>
          </div>
        </div>
      </header>

      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8 grid gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            {pageMeta ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-gold/20 bg-clay/60 px-4 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Collection view</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{pageMeta.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-emberDark transition hover:border-gold/50"
                >
                  View all products
                </button>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto_auto]">
              <input
                value={keyword}
                onChange={(e) => {
                  setPage(1)
                  setKeyword(e.target.value)
                }}
                placeholder={pageMeta ? `Search within ${pageMeta.title}…` : 'Search attars…'}
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
                      {purposeMap[id] || id}
                    </span>
                  ))}
                  {families.map((id) => (
                    <span
                      key={id}
                      className="rounded-full bg-clay/70 px-3 py-1 text-[11px] font-semibold text-emberDark"
                    >
                      {familyMap[id] || id}
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

                  <div className="flex flex-wrap items-center gap-2">
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
                    <button
                      type="button"
                      onClick={() => setFiltersOpen(false)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-emberDark transition hover:border-gold/50"
                    >
                      Close
                    </button>
                  </div>
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
                      {purposeOptions.map((t) => {
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
                      {familyOptions.map((t) => {
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
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))] xl:[grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onView={() => navigate(`/products/${product._id}`)}
                onAdd={
                  !isAdmin
                    ? ({ mode } = {}) => {
                        if (mode === 'sample') {
                          const sample = product.sample || {}
                          dispatch(
                            addToCart({
                              product: product._id,
                              name: product.name,
                              price: Number(sample.price),
                              image: product.images?.[0] || '',
                              packLabel: sample.label,
                              isSample: true,
                              qty: 1,
                            })
                          )
                          navigate('/cart')
                          return
                        }

                        setCartModal({ open: true, product })
                      }
                    : null
                }
                isAdmin={isAdmin}
              />
            ))}
            {products.length === 0 && (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 text-sm text-muted">
                {collectionMeta ? (
                  <>
                    No products have been added to <span className="font-semibold text-ink">{collectionMeta.title}</span> yet.
                    {isAdmin ? ' Edit a product and add it to this collection from Admin → Products.' : ''}
                  </>
                ) : (
                  <>No products yet. Add some from the admin panel.</>
                )}
              </div>
            )}
          </div>

          <div className="mt-16 rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Our Product Range</p>
              <h2 className="mt-4 text-2xl font-semibold text-ink md:text-3xl">
                Traditional attars, roohs, waters, and essential oils
              </h2>
              <p className="mt-3 text-sm text-muted">
                A focused range of classic Indian attars, floral roohs, waters, and specialty oils.
              </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {BUSINESS.productRange.map((section) => (
                <div
                  key={section.title}
                  className="rounded-3xl border border-slate-200/80 bg-clay/50 p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">{section.title}</p>
                  <div className="mt-4 ka-divider" />
                  <ul className="mt-4 space-y-2 text-sm text-emberDark">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-gold/20 bg-midnight p-6 text-white shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-white/60">Trade & Enquiry</p>
                  <p className="mt-2 text-sm text-white/80">
                    For pack sizes, current pricing, bulk supply, or custom requirements, contact Kannauj Attars directly.
                  </p>
                </div>
                <Link to="/contact" className="ka-btn-primary px-5 py-2">
                  Request details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!isAdmin ? (
        <AddToCartModal
          open={cartModal.open}
          product={cartModal.product}
          onClose={() => setCartModal({ open: false, product: null })}
          onConfirm={({ packLabel, qty, isSample }) => {
            const p = cartModal.product
            if (!p) return
            const packs = Array.isArray(p.packs) ? p.packs : []
            const chosen = packLabel ? packs.find((x) => (x.label || '').trim() === packLabel) : null
            const sample = p.sample || {}
            const regularPrice = Number(chosen?.price)
            const salePrice = chosen?.salePrice === null || chosen?.salePrice === undefined || chosen?.salePrice === '' ? null : Number(chosen?.salePrice)
            const price = isSample
              ? Number(sample.price)
              : chosen && Number.isFinite(salePrice) && salePrice > 0 && Number.isFinite(regularPrice) && salePrice < regularPrice
                ? salePrice
                : chosen
                  ? regularPrice
                  : p.price

            const item = {
              product: p._id,
              name: p.name,
              price,
              image: p.images?.[0] || '',
              packLabel: isSample ? sample.label : packs.length ? packLabel : '',
              isSample: isSample === true,
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

export default Products
