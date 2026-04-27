import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AdminAssetImage from '../components/AdminAssetImage'
import { PURPOSE_TAGS, FAMILY_TAGS } from '../config/taxonomy'
import { api, auth } from '../services/api'
import { toAssetUrl } from '../utils/media'
import { BUSINESS } from '../config/business'

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

const featuredCards = [
  {
    title: 'Signature Attars',
    copy: 'Balanced blends for everyday elegance and clean wear.',
    to: '/collections/signature',
    assetKey: 'explore.card.signature',
  },
  {
    title: 'Heritage Collection',
    copy: 'Traditional profiles inspired by classic Kannauj perfumery.',
    to: '/collections/heritage',
    assetKey: 'explore.card.heritage',
  },
  {
    title: 'Custom Blends',
    copy: 'Create a signature attar for gifting, events, or private label.',
    to: '/custom-blends',
    assetKey: 'explore.card.custom',
  },
  {
    title: 'Create Your Own Blend',
    copy: 'Select notes and generate a custom attar preview in seconds.',
    to: '/create-blend',
    assetKey: 'explore.card.blend',
  },
  {
    title: 'Discovery Quiz',
    copy: 'Find your signature scent in 60 seconds — then explore matches.',
    to: '/discovery-quiz',
    assetKey: 'explore.card.quiz',
  },
  {
    title: 'Aroma Knowledge Center',
    copy: 'Learn about attars, oils, aroma chemicals, and safety basics.',
    to: '/knowledge',
    assetKey: 'explore.card.knowledge',
  },
  {
    title: 'Photo Gallery',
    copy: 'Office spaces, craft, and factory moments — add your own photos later.',
    to: '/gallery',
    assetKey: 'explore.card.gallery',
  },
  {
    title: 'All Products',
    copy: 'Browse the complete catalog with pack options and pricing.',
    to: '/products',
    assetKey: 'explore.card.all',
  },
  {
    title: 'New Arrivals',
    copy: 'Fresh additions and newly listed blends.',
    to: '/products?sort=newest',
    assetKey: 'explore.card.new',
  },
  {
    title: 'Top Rated',
    copy: 'Customer favourites — rated and reviewed.',
    to: '/products?sort=rating_desc',
    assetKey: 'explore.card.top',
  },
  {
    title: 'Luxury Gifting',
    copy: 'Celebrate with elegant profiles for premium gifting.',
    to: '/products?purpose=luxury_gifting',
    assetKey: 'explore.card.gifting',
  },
  {
    title: 'Wholesale / Bulk',
    copy: 'For trade, manufacturing, and large requirements — talk to us directly.',
    to: '/contact',
    state: { intent: 'bulk' },
    assetKey: 'explore.card.wholesale',
  },
]

const purposeCopy = {
  daily_wear: 'Clean profiles for daily wear — subtle, polished, long lasting.',
  weddings: 'Richer blends that feel festive, warm, and statement-ready.',
  meditation_spiritual: 'Soft, grounding aromas for calm, prayer, and focus.',
  luxury_gifting: 'Elegant signatures that feel premium and gift-worthy.',
  skin_hair: 'Light oils often chosen for personal care routines.',
  candle_making: 'Aroma oils used in candles and home ambience (placeholder).',
  soap_cosmetic_mfg: 'For makers: classic profiles used in soaps & cosmetics.',
  industrial_use: 'For bulk/industrial needs — browse then contact for pricing.',
}

const familyCopy = {
  floral: 'Rose, jasmine, and garden florals — classic and romantic.',
  woody: 'Sandalwood, cedar, and smooth woods — calm and luxurious.',
  musky: 'Clean musk profiles — soft, skin-close, long wear.',
  oriental: 'Amber, resin, and warmth — rich and traditional.',
  citrus: 'Bright bergamot and fresh citrus — uplifting and crisp.',
  aquatic: 'Fresh, airy, and modern — clean “after shower” vibe.',
  spicy: 'Warm spices — bold, confident, and festive.',
  gourmand: 'Sweet comfort notes — smooth, cozy, and addictive.',
}

function ExploreCard({ title, copy, to, assetKey, state }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-black/10 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/15"
    >
      <AdminAssetImage
        assetKey={assetKey}
        className="ka-frame ka-mediaBg aspect-[5/4] w-full"
        imgClassName="p-2"
        defaultAspect="5 / 4"
        fit="contain"
      />
      <h2 className="mt-4 text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm text-muted">{copy}</p>
      <Link to={to} state={state} className="mt-6 ka-btn-primary px-5 py-2">
        Explore
      </Link>
    </motion.div>
  )
}

function BestSellerCard({ product }) {
  const minPack = useMemo(() => getMinPack(Array.isArray(product?.packs) ? product.packs : []), [product?.packs])
  const showPack = Array.isArray(product?.packs) && product.packs.length && minPack

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="group rounded-3xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-black/10 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/15"
    >
      <Link to={`/products/${product._id}`} className="block">
        <div className="ka-frame ka-mediaBg aspect-[4/3] w-full">
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
        </div>
      </Link>

      <div className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/products/${product._id}`} className="block">
            <h3 className="text-lg font-semibold text-ink">{product.name}</h3>
          </Link>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex rounded-full bg-gold px-3 py-1 text-[10px] font-semibold text-midnight">
              Best seller
            </span>
            {minPack?.onSale ? (
              <span className="inline-flex rounded-full bg-red-600 px-3 py-1 text-[10px] font-semibold text-white">
                Sale
              </span>
            ) : null}
          </div>
        </div>

        <p className="mt-2 text-sm text-muted">
          {showPack ? (
            <>
              <span className="font-semibold text-ink">{minPack.label}</span> / ₹{minPack.effectivePrice}
              {minPack.onSale ? <span className="ml-2 line-through">₹{minPack.price}</span> : null}
            </>
          ) : (
            <>₹{product.price}</>
          )}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link to={`/products/${product._id}`} className="ka-btn-primary px-5 py-2">
            View
          </Link>
          <Link to="/products?bestSeller=1" className="ka-btn-ghost px-5 py-2">
            More
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

function Explore() {
  const user = auth.getUser()
  const isAdmin = user?.isAdmin === true
  const [bestSellers, setBestSellers] = useState([])
  const [bestLoading, setBestLoading] = useState(false)
  const [bestError, setBestError] = useState('')

  useEffect(() => {
    const load = async () => {
      setBestLoading(true)
      setBestError('')
      try {
        const data = await api.getProducts({ page: 1, limit: 6, bestSeller: 1, sort: 'rating_desc' })
        setBestSellers(Array.isArray(data?.products) ? data.products : Array.isArray(data) ? data : [])
      } catch (e) {
        setBestError(e.message || 'Failed to load best sellers')
        setBestSellers([])
      } finally {
        setBestLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="bg-sand">
      <header className="px-6 pb-10 pt-12">
        <div className="mx-auto w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <p className="ka-kicker">Explore</p>
            <h1 className="mt-4 ka-h1">Choose your attar journey</h1>
            <p className="mt-4 ka-lead">
              Explore collections designed around mood, tradition, and gifting.
            </p>
          </motion.div>
        </div>
      </header>

      <section className="px-6 pb-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="ka-kicker">Featured</p>
              <h2 className="mt-3 ka-h2">Collections & highlights</h2>
            </div>
            <p className="max-w-lg text-sm text-muted">
              {isAdmin
                ? 'Admin: replace these images from Admin → Website Images.'
                : 'Tap any card to explore. Use purpose and family cards to browse faster.'}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featuredCards.map((card) => (
              <ExploreCard
                key={card.assetKey}
                title={card.title}
                copy={card.copy}
                to={card.to}
                state={card.state}
                assetKey={card.assetKey}
              />
            ))}
          </div>

          <div className="mt-14 mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="ka-kicker">Best sellers</p>
              <h2 className="mt-3 ka-h2">Most loved picks</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/products?bestSeller=1"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-emberDark hover:border-gold/40"
              >
                View all
              </Link>
            </div>
          </div>

          {bestError ? <p className="mb-4 text-sm font-semibold text-red-600">{bestError}</p> : null}
          {bestLoading ? <p className="mb-4 text-sm text-muted">Loading best sellers…</p> : null}

          <div className="grid gap-6 md:grid-cols-3">
            {bestSellers.map((p) => (
              <BestSellerCard key={p._id} product={p} />
            ))}
            {!bestLoading && bestSellers.length === 0 ? (
              <div className="rounded-3xl border border-gold/25 bg-clay/60 p-8 shadow-sm md:col-span-3">
                <h3 className="text-lg font-semibold text-ink">Best sellers will appear here</h3>
                <p className="mt-2 text-sm text-muted">
                  {isAdmin
                    ? 'Admin: mark products as Best seller in Admin → Products or inside a product edit page.'
                    : 'We are curating a few favourites. Check back soon, or browse the full catalog.'}
                </p>
                <Link to="/products" className="mt-5 ka-btn-primary px-5 py-2">
                  Browse products
                </Link>
              </div>
            ) : null}
          </div>

          <div className="mt-14 mb-6">
            <p className="ka-kicker">Shop by purpose</p>
            <h2 className="mt-3 ka-h2">What are you buying for?</h2>
            <p className="mt-3 max-w-2xl text-sm text-muted">
              Browse by use-case — from daily wear to gifting and manufacturing needs.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PURPOSE_TAGS.map((t) => (
              <ExploreCard
                key={t.id}
                title={t.label}
                copy={purposeCopy[t.id] || 'Browse products that match this purpose.'}
                to={`/products?purpose=${encodeURIComponent(t.id)}`}
                assetKey={`explore.purpose.${t.id}`}
              />
            ))}
          </div>

          <div className="mt-14 mb-6">
            <p className="ka-kicker">Fragrance families</p>
            <h2 className="mt-3 ka-h2">Pick a scent direction</h2>
            <p className="mt-3 max-w-2xl text-sm text-muted">
              Start with the family you love, then refine by pack size and pricing.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FAMILY_TAGS.map((t) => (
              <ExploreCard
                key={t.id}
                title={t.label}
                copy={familyCopy[t.id] || 'Explore this fragrance family.'}
                to={`/products?family=${encodeURIComponent(t.id)}`}
                assetKey={`explore.family.${t.id}`}
              />
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-gold/25 bg-clay/60 p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Need bulk / industrial supply?</h2>
            <p className="mt-2 text-sm text-muted">
              If you’re buying for manufacturing or large quantities, we’ll guide you to the right grade, pack sizes, and pricing.
            </p>
            <Link to="/contact" state={{ intent: 'bulk' }} className="mt-5 ka-btn-ghost px-5 py-2">
              Contact us
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-midnight px-6 py-14 text-white">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="font-display text-2xl">{BUSINESS.displayName}</h2>
          <p className="mt-2 text-sm text-white/75">Modern presentation of traditional perfumery.</p>
        </div>
      </footer>
    </div>
  )
}

export default Explore
