import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AdminAssetImage from '../components/AdminAssetImage'
import { api } from '../services/api'
import { toAssetUrl } from '../utils/media'
import { FAMILY_TAGS } from '../config/taxonomy'

const BASE_NOTES = [
  { id: 'oud', label: 'Oud', families: ['oriental', 'woody'] },
  { id: 'sandalwood', label: 'Sandalwood', families: ['woody'] },
  { id: 'musk', label: 'Musk', families: ['musky'] },
]

const MIDDLE_NOTES = [
  { id: 'rose', label: 'Rose', families: ['floral'] },
  { id: 'jasmine', label: 'Jasmine', families: ['floral'] },
  { id: 'lavender', label: 'Lavender', families: ['floral'] },
]

const TOP_NOTES = [
  { id: 'citrus', label: 'Citrus', families: ['citrus'] },
  { id: 'mint', label: 'Mint', families: ['aquatic', 'citrus'] },
  { id: 'bergamot', label: 'Bergamot', families: ['citrus'] },
]

const byId = (list, id) => list.find((x) => x.id === id) || null

const unique = (arr) => Array.from(new Set(arr.filter(Boolean)))
const familyLabel = (id) => FAMILY_TAGS.find((t) => t.id === id)?.label || id

function CreateBlend() {
  const navigate = useNavigate()
  const [base, setBase] = useState('oud')
  const [middle, setMiddle] = useState('rose')
  const [top, setTop] = useState('bergamot')
  const [generated, setGenerated] = useState(null)
  const [recommended, setRecommended] = useState([])
  const [loading, setLoading] = useState(false)
  const [recError, setRecError] = useState('')

  const blend = useMemo(() => {
    const b = byId(BASE_NOTES, base)
    const m = byId(MIDDLE_NOTES, middle)
    const t = byId(TOP_NOTES, top)
    const families = unique([...(b?.families || []), ...(m?.families || []), ...(t?.families || [])])
    const name = [b?.label, m?.label, t?.label].filter(Boolean).join(' • ')
    return { b, m, t, families, name }
  }, [base, middle, top])

  const generate = () => {
    const styleBits = [
      blend.b?.id === 'oud' ? 'warm, rich depth' : null,
      blend.b?.id === 'sandalwood' ? 'smooth woody calm' : null,
      blend.b?.id === 'musk' ? 'clean, skin-close softness' : null,
      blend.m ? `${blend.m.label.toLowerCase()} heart` : null,
      blend.t?.id === 'mint' ? 'fresh lift' : null,
      blend.t?.id === 'citrus' || blend.t?.id === 'bergamot' ? 'bright top notes' : null,
    ].filter(Boolean)

    setGenerated({
      title: 'Your custom attar preview',
      name: blend.name,
      families: blend.families,
      summary: styleBits.length ? styleBits.join(', ') : 'A balanced blend with classic structure.',
    })
  }

  useEffect(() => {
    if (!generated) return
    const load = async () => {
      setLoading(true)
      setRecError('')
      try {
        const data = await api.getProducts({
          page: 1,
          limit: 6,
          sort: 'rating_desc',
          family: blend.families.join(','),
        })
        setRecommended(Array.isArray(data?.products) ? data.products : Array.isArray(data) ? data : [])
      } catch (e) {
        setRecError(e.message || 'Failed to load recommendations')
        setRecommended([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [generated, blend.families])

  return (
    <div className="bg-sand min-h-screen">
      <header className="px-6 pb-10 pt-12">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <p className="ka-kicker">Create</p>
            <h1 className="mt-4 ka-h1">Build your own fragrance</h1>
            <p className="mt-4 ka-lead">
              Choose top, middle, and base notes — then generate a custom attar preview and request a blend.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/discovery-quiz" className="ka-btn-ghost px-5 py-2">
                Not sure? Take the quiz
              </Link>
              <Link to="/custom-blends" className="ka-btn-ghost px-5 py-2">
                Custom blends service
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-black/10"
          >
            <AdminAssetImage
              assetKey="blend.hero"
              className="ka-frame ka-mediaBg aspect-[16/10] w-full"
              imgClassName="p-2"
              defaultAspect="16 / 10"
              fit="contain"
            />
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Craft</p>
              <p className="mt-2 text-sm text-muted">
                This is a preview tool — final scent depends on materials, distillation, and refinement.
              </p>
            </div>
          </motion.div>
        </div>
      </header>

      <section className="px-6 pb-16">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-lg shadow-black/10">
            <h2 className="text-xl font-semibold text-ink">Choose your notes</h2>
            <p className="mt-2 text-sm text-muted">
              Select one from each layer. You can always regenerate with new combinations.
            </p>

            <div className="mt-6 grid gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Base note</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {BASE_NOTES.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setBase(n.id)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        base === n.id
                          ? 'border-gold/40 bg-clay/70 text-ink'
                          : 'border-slate-200 bg-white text-emberDark hover:border-gold/35'
                      }`}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Middle note</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {MIDDLE_NOTES.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setMiddle(n.id)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        middle === n.id
                          ? 'border-gold/40 bg-clay/70 text-ink'
                          : 'border-slate-200 bg-white text-emberDark hover:border-gold/35'
                      }`}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Top note</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {TOP_NOTES.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setTop(n.id)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        top === n.id
                          ? 'border-gold/40 bg-clay/70 text-ink'
                          : 'border-slate-200 bg-white text-emberDark hover:border-gold/35'
                      }`}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={generate} className="ka-btn-primary px-6 py-3">
                Generate my custom attar
              </button>
              <button
                type="button"
                onClick={() => {
                  setGenerated(null)
                  setRecommended([])
                  setRecError('')
                }}
                className="ka-btn-ghost px-6 py-3"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-lg shadow-black/10">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Preview</p>
              {generated ? (
                <>
                  <h2 className="mt-3 text-xl font-semibold text-ink">{generated.title}</h2>
                  <p className="mt-3 text-sm text-muted">
                    <span className="font-semibold text-ink">{generated.name}</span>
                  </p>
                  <p className="mt-4 text-sm text-muted">{generated.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {generated.families.map((f) => (
                      <span
                        key={f}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-emberDark"
                      >
                        {familyLabel(f)}
                      </span>
                    ))}
                  </div>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/contact', {
                          state: {
                            intent: 'blend',
                            blend: {
                              base: blend.b?.label || '',
                              middle: blend.m?.label || '',
                              top: blend.t?.label || '',
                              families: blend.families,
                            },
                          },
                        })
                      }}
                      className="ka-btn-primary px-6 py-3"
                    >
                      Send inquiry
                    </button>
                    <Link to="/products" className="ka-btn-ghost px-6 py-3">
                      Browse products
                    </Link>
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-2xl border border-gold/25 bg-clay/60 p-5">
                  <p className="text-sm font-semibold text-ink">Pick notes, then generate</p>
                  <p className="mt-2 text-sm text-muted">
                    You’ll see a preview and recommended products based on your note direction.
                  </p>
                </div>
              )}
            </div>

            {generated ? (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-lg shadow-black/10">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Recommended</p>
                    <h3 className="mt-2 text-lg font-semibold text-ink">Products you may like</h3>
                  </div>
                  <Link to="/products" className="text-sm font-semibold text-emberDark hover:text-ink">
                    View all →
                  </Link>
                </div>

                {recError ? <p className="mt-4 text-sm font-semibold text-red-600">{recError}</p> : null}
                {loading ? <p className="mt-4 text-sm text-muted">Loading recommendations…</p> : null}

                {!loading && recommended.length > 0 ? (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {recommended.slice(0, 6).map((p) => (
                      <Link
                        key={p._id}
                        to={`/products/${p._id}`}
                        className="group rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10"
                      >
                        <div className="ka-frame ka-mediaBg aspect-[4/3] w-full">
                          {p.images?.[0] ? (
                            <img
                              src={toAssetUrl(p.images[0], import.meta.env.VITE_API_ASSET)}
                              alt={p.name}
                              className="h-full w-full bg-white object-contain p-3 transition group-hover:scale-[1.01]"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full bg-[linear-gradient(135deg,rgba(201,162,74,0.20),rgba(255,255,255,0.92),rgba(17,27,58,0.10))]" />
                          )}
                        </div>
                        <p className="mt-3 text-sm font-semibold text-ink">{p.name}</p>
                        <p className="mt-1 text-xs text-muted">₹{p.price}</p>
                      </Link>
                    ))}
                  </div>
                ) : !loading ? (
                  <p className="mt-4 text-sm text-muted">
                    No recommendations yet. Once products are tagged with purpose/family, results will appear here.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}

export default CreateBlend
