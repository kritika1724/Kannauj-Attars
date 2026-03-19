import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'

const getMinPack = (packs = []) => {
  const normalized = packs
    .map((p) => ({ label: (p.label || '').trim(), price: Number(p.price) }))
    .filter((p) => p.label && !Number.isNaN(p.price))
  if (!normalized.length) return null
  return normalized.reduce((min, p) => (p.price < min.price ? p : min), normalized[0])
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
  const navigate = useNavigate()
  const packs = Array.isArray(product?.packs) ? product.packs : []
  const minPack = useMemo(() => getMinPack(packs), [packs])
  const [packLabel, setPackLabel] = useState('')
  const [qty, setQty] = useState(1)
  const [buyerType, setBuyerType] = useState('personal') // personal | industrial

  useEffect(() => {
    if (!open) return
    setQty(1)
    const initialLabel = minPack?.label || (packs?.[0]?.label || '')
    setPackLabel(initialLabel)
    setBuyerType(isBulkPack(initialLabel) ? 'industrial' : 'personal')
  }, [open, minPack?.label, packs])

  const selectedPack = useMemo(() => {
    if (!packLabel) return null
    return packs.find((p) => (p.label || '').trim() === packLabel) || null
  }, [packs, packLabel])

  const bulkPackSelected = isBulkPack(selectedPack?.label || packLabel)
  const retailFallbackLabel = useMemo(() => {
    const firstRetail = packs.find((p) => !isBulkPack(p.label))
    return firstRetail?.label || ''
  }, [packs])

  useEffect(() => {
    if (!open) return
    // If user selects a bulk pack size, force inquiry flow.
    if (bulkPackSelected) setBuyerType('industrial')
  }, [bulkPackSelected, open])

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
                  {selectedPack.label} • <span className="font-semibold text-ink">₹{selectedPack.price}</span>
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
                  {p.label} — ₹{p.price}
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

        <div className="mt-5">
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

          {buyerType === 'industrial' ? (
            <div className="mt-4 rounded-2xl border border-gold/25 bg-clay/60 p-4">
              <p className="text-sm font-semibold text-ink">Bulk / industrial inquiry</p>
              <p className="mt-2 text-sm text-muted">
                For bulk/industrial orders, pricing and availability are usually shared on inquiry. Would you like to
                contact us directly?
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const packsList = Array.isArray(product?.packs) ? product.packs : []
                    const chosen = packLabel
                      ? packsList.find((x) => (x.label || '').trim() === packLabel)
                      : null
                    const price = chosen ? chosen.price : product?.price

                    navigate('/contact', {
                      state: {
                        intent: 'bulk',
                        product: {
                          id: product?._id,
                          name: product?.name,
                          packLabel: packsList.length ? packLabel : '',
                          qty,
                          price,
                        },
                      },
                    })
                    onClose?.()
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
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onConfirm({ packLabel: packs.length ? packLabel : '', qty })}
            disabled={buyerType === 'industrial' || bulkPackSelected}
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
