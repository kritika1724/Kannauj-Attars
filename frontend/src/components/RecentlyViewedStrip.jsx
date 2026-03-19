import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { clearRecent } from '../features/recentlyViewedSlice'
import { toAssetUrl } from '../utils/media'

function RecentlyViewedStrip({ excludeId = '', max = 8, title = 'Recently viewed' }) {
  const dispatch = useDispatch()
  const items = useSelector((state) => state.recentlyViewed.items)
  const filtered = (Array.isArray(items) ? items : [])
    .filter((x) => x?.product && x.product !== excludeId)
    .slice(0, max)

  if (filtered.length === 0) return null

  return (
    <section className="px-6 pb-16">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="ka-kicker">History</p>
            <h2 className="mt-3 ka-h2">{title}</h2>
          </div>
          <button
            type="button"
            onClick={() => dispatch(clearRecent())}
            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-emberDark transition hover:border-gold/50 hover:bg-clay/60"
          >
            Clear
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
          {filtered.map((item) => (
            <Link
              key={item.product}
              to={`/products/${item.product}`}
              className="min-w-[220px] flex-1 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10"
            >
              <div className="ka-frame ka-mediaBg aspect-[4/3] w-full">
                {item.image ? (
                  <img
                    src={toAssetUrl(item.image, import.meta.env.VITE_API_ASSET)}
                    alt={item.name}
                    className="h-full w-full bg-white object-contain p-3"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-[linear-gradient(135deg,rgba(201,162,74,0.22),rgba(255,255,255,0.92),rgba(17,27,58,0.10))]" />
                )}
              </div>
              <h3 className="mt-4 line-clamp-1 text-sm font-semibold text-ink">{item.name}</h3>
              <p className="mt-2 text-xs font-semibold text-emberDark">
                {item.packLabel ? (
                  <>
                    {item.packLabel} / ₹{item.price}
                  </>
                ) : (
                  <>₹{item.price}</>
                )}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default RecentlyViewedStrip

