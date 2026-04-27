import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'

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

function AddToCartModal({ open, product, onClose, onConfirm }) {
  const packs = Array.isArray(product?.packs) ? product.packs : []
  const minPack = useMemo(() => getMinPack(packs), [packs])
  const [packLabel, setPackLabel] = useState('')
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (!open) return
    setQty(1)
    const initialLabel = minPack?.label || (packs?.[0]?.label || '')
    setPackLabel(initialLabel)
  }, [open, minPack?.label, packs])

  const selectedPack = useMemo(() => {
    if (!packLabel) return null
    const pack = packs.find((p) => (p.label || '').trim() === packLabel) || null
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
  }, [packs, packLabel])

  const bulkPackSelected = isBulkPack(selectedPack?.label || packLabel)

  if (!open || !product) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label="Close dialog"
      />
      <div className="absolute left-1/2 top-1/2 w-[min(520px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl shadow-black/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted">Add to cart</p>
            <h3 className="mt-2 text-xl font-semibold text-ink">{product.name}</h3>
            <p className="mt-2 text-sm text-muted">
              {selectedPack ? (
                <>
                  {selectedPack.label} • <span className="font-semibold text-ink">₹{selectedPack.effectivePrice || selectedPack.price}</span>
                  {selectedPack.onSale ? (
                    <span className="text-xs font-semibold text-muted line-through">₹{selectedPack.price}</span>
                  ) : null}
                </>
              ) : (
                <>
                  <span className="font-semibold text-ink">₹{product.price}</span>
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-emberDark hover:border-gold/40"
          >
            Close
          </button>
        </div>

        {packs.length > 0 && (
          <div className="mt-5">
            <label className="text-xs font-semibold text-muted">Choose amount</label>
            <select
              value={packLabel}
              onChange={(e) => setPackLabel(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink"
            >
              {packs.map((p) => (
                <option key={p.label} value={p.label}>
                  {p.label} — ₹
                  {(() => {
                    const regularPrice = Number(p.price)
                    const salePrice = p.salePrice === null || p.salePrice === undefined || p.salePrice === '' ? null : Number(p.salePrice)
                    return Number.isFinite(salePrice) && salePrice > 0 && salePrice < regularPrice ? salePrice : regularPrice
                  })()}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-5">
          <label className="text-xs font-semibold text-muted">Quantity</label>
          <input
            type="number"
            min="1"
            max="99"
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value || 1))))}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink"
          />
        </div>

        <div className="mt-5 rounded-2xl border border-gold/20 bg-clay/50 p-4">
          <p className="text-sm font-semibold text-ink">Bulk orders</p>
          <p className="mt-2 text-sm text-muted">
            For bulk requirements, please contact us directly for pricing and availability.
          </p>
          <Link
            to="/contact"
            state={{
              intent: 'bulk',
              product: {
                id: product?._id,
                name: product?.name,
                packLabel: packs.length ? packLabel : '',
                qty,
                price: selectedPack?.effectivePrice || product?.price,
              },
            }}
            onClick={() => onClose?.()}
            className="mt-4 inline-flex rounded-full border border-gold/25 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emberDark transition hover:border-gold/50 hover:bg-clay/60"
          >
            Contact for bulk
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              onConfirm({
                packLabel: packs.length ? packLabel : '',
                qty,
                isSample: false,
              })
            }
            disabled={bulkPackSelected}
            className="flex-1 rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white transition hover:bg-emberDark disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add to cart
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-emberDark hover:border-gold/40"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default AddToCartModal
