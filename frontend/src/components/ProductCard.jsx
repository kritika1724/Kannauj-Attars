import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toAssetUrl } from '../utils/media'
import { useTaxonomy } from './TaxonomyProvider'

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

const getShortDescription = (text, maxLength = 96) => {
  const value = String(text || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!value) return ''
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength).trim()}...`
}

const clampImageZoom = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return 1
  return Math.min(Math.max(n, 1), 2.5)
}

function ProductCard({ product, onView, onAdd, isAdmin, showActions = true }) {
  const { purposeMap, familyMap } = useTaxonomy()
  const minPack = useMemo(() => getMinPack(Array.isArray(product?.packs) ? product.packs : []), [product?.packs])
  const showPack = Array.isArray(product?.packs) && product.packs.length && minPack
  const shortDescription = getShortDescription(product?.description)
  const hasReviews = Number(product?.numReviews || 0) > 0
  const priceLabel = showPack ? minPack.label : 'Base price'
  const onSale = Boolean(showPack && minPack?.onSale)
  const sample = product?.sample || {}
  const sampleEnabled =
    sample.enabled === true && String(sample.label || '').trim() && !Number.isNaN(Number(sample.price))
  const imageZoom = clampImageZoom(product?.imageZoom)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_18px_50px_rgba(17,27,58,0.10)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_70px_rgba(17,27,58,0.16)]">
      <Link to={`/products/${product._id}`} className="block p-3 sm:p-4">
        <div className="relative aspect-square overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(201,162,74,0.18),rgba(255,255,255,1)_55%,rgba(17,27,58,0.06))]">
          <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
            {product?.isBestSeller ? (
              <span className="rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-midnight">
                Best seller
              </span>
            ) : null}
            {product?.isNewArrival ? (
              <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-emberDark shadow-sm">
                New
              </span>
            ) : null}
            {onSale ? (
              <span className="rounded-full bg-red-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white shadow-sm">
                Sale
              </span>
            ) : null}
          </div>

          {product.images?.[0] ? (
            <img
              src={toAssetUrl(product.images[0], import.meta.env.VITE_API_ASSET)}
              alt={product.name}
              className="h-full w-full object-cover object-center transition-transform duration-500"
              style={{ transform: `scale(${imageZoom})` }}
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,rgba(201,162,74,0.22),rgba(255,255,255,0.96),rgba(17,27,58,0.10))]">
              <span className="rounded-full border border-gold/25 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-emberDark">
                Kannauj Attars
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-4 pb-4 sm:px-5 sm:pb-5">
        <Link to={`/products/${product._id}`} className="block">
          <h3 className="text-lg font-semibold leading-snug text-ink">{product.name}</h3>
        </Link>

        {shortDescription ? (
          <p className="mt-2 text-sm leading-6 text-muted">{shortDescription}</p>
        ) : null}

        {(Array.isArray(product.purposeTags) && product.purposeTags.length > 0) ||
        (Array.isArray(product.familyTags) && product.familyTags.length > 0) ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {(product.purposeTags || []).slice(0, 1).map((id) => (
              <span key={id} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-emberDark">
                {purposeMap[id] || id}
              </span>
            ))}
            {(product.familyTags || []).slice(0, 2).map((id) => (
              <span key={id} className="rounded-full bg-clay/70 px-3 py-1 text-[11px] font-semibold text-emberDark">
                {familyMap[id] || id}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">{priceLabel}</p>
            {showPack ? (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold text-ink">₹{minPack.effectivePrice}</p>
                {minPack.onSale ? (
                  <p className="text-sm font-medium text-muted line-through">₹{minPack.price}</p>
                ) : null}
                <span className="text-sm font-medium text-muted">{minPack.label}</span>
              </div>
            ) : (
              <p className="mt-1 text-lg font-semibold text-ink">₹{product.price}</p>
            )}
          </div>
          {hasReviews ? (
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-emberDark">
              {Number(product.rating || 0).toFixed(1)} / 5
            </div>
          ) : null}
        </div>

        {showActions ? (
          <div className="mt-5 grid grid-cols-2 gap-2">
            {!isAdmin ? (
              <button
                type="button"
                onClick={onAdd}
                className="ka-btn-primary px-4 py-2.5 text-xs sm:text-sm"
              >
                Add to cart
              </button>
            ) : (
              <Link
                to={`/admin/products/${product._id}`}
                className="ka-btn-primary px-4 py-2.5 text-center text-xs sm:text-sm"
              >
                Edit (Admin)
              </Link>
            )}
            <button
              type="button"
              onClick={onView}
              className="ka-btn-ghost px-4 py-2.5 text-xs sm:text-sm"
            >
              View
            </button>
          </div>
        ) : null}

        {showActions && !isAdmin && sampleEnabled ? (
          <button
            type="button"
            onClick={() => onAdd?.({ mode: 'sample' })}
            className="mt-3 inline-flex items-center justify-between gap-3 rounded-2xl border border-gold/20 bg-clay/50 px-4 py-3 text-left transition hover:border-gold/40 hover:bg-clay/70"
          >
            <span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Try first</span>
              <span className="mt-1 block text-sm font-semibold text-ink">
                Buy a sample
                <span className="ml-2 text-xs font-medium text-muted">
                  {sample.label} • ₹{sample.price}
                </span>
              </span>
            </span>
            <span className="text-xs font-semibold text-emberDark">Quick add</span>
          </button>
        ) : null}
      </div>
    </article>
  )
}

export default ProductCard
