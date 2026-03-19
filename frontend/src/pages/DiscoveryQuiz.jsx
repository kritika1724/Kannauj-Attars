import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AdminAssetImage from '../components/AdminAssetImage'
import { api } from '../services/api'
import { toAssetUrl } from '../utils/media'
import { FAMILY_TAGS, PURPOSE_TAGS } from '../config/taxonomy'

const QUESTIONS = [
  {
    id: 'intensity',
    label: 'Do you prefer strong or soft?',
    options: [
      { value: 'soft', title: 'Soft', copy: 'Clean, gentle, close to skin.' },
      { value: 'balanced', title: 'Balanced', copy: 'Noticeable but never loud.' },
      { value: 'strong', title: 'Strong', copy: 'Bold presence and richer depth.' },
    ],
  },
  {
    id: 'time',
    label: 'Day or night?',
    options: [
      { value: 'day', title: 'Day', copy: 'Fresh, airy, office-friendly.' },
      { value: 'night', title: 'Night', copy: 'Warm, festive, statement-ready.' },
      { value: 'both', title: 'Both', copy: 'Versatile for any time.' },
    ],
  },
  {
    id: 'direction',
    label: 'Floral or woody?',
    options: [
      { value: 'floral', title: 'Floral', copy: 'Rose, jasmine, soft petals.' },
      { value: 'woody', title: 'Woody', copy: 'Sandalwood, cedar, deep woods.' },
    ],
  },
  {
    id: 'finish',
    label: 'Sweet or dry?',
    options: [
      { value: 'sweet', title: 'Sweet', copy: 'Comforting, smooth, indulgent.' },
      { value: 'dry', title: 'Dry', copy: 'Clean, crisp, less sweetness.' },
    ],
  },
]

const sortFamilies = (scores) =>
  Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k)

const computeProfile = (answers) => {
  const scores = {
    floral: 0,
    woody: 0,
    musky: 0,
    oriental: 0,
    citrus: 0,
    aquatic: 0,
    spicy: 0,
    gourmand: 0,
  }

  const intensity = answers.intensity
  if (intensity === 'soft') {
    scores.aquatic += 2
    scores.citrus += 1
    scores.musky += 1
  } else if (intensity === 'balanced') {
    scores.woody += 1
    scores.floral += 1
    scores.musky += 1
  } else if (intensity === 'strong') {
    scores.oriental += 2
    scores.spicy += 1
    scores.woody += 1
  }

  const time = answers.time
  if (time === 'day') {
    scores.citrus += 2
    scores.aquatic += 1
  } else if (time === 'night') {
    scores.oriental += 1
    scores.spicy += 1
    scores.woody += 1
  } else if (time === 'both') {
    scores.musky += 1
    scores.woody += 1
    scores.floral += 1
  }

  const direction = answers.direction
  if (direction === 'floral') scores.floral += 3
  if (direction === 'woody') scores.woody += 3

  const finish = answers.finish
  if (finish === 'sweet') {
    scores.gourmand += 2
    scores.oriental += 1
  } else if (finish === 'dry') {
    scores.musky += 1
    scores.woody += 1
    scores.spicy += 1
  }

  const ranked = sortFamilies(scores)
  const topFamilies = ranked.slice(0, 2)

  let purpose = ''
  if (time === 'day') purpose = 'daily_wear'
  else if (time === 'night') purpose = 'weddings'
  else purpose = 'luxury_gifting'

  return {
    scores,
    families: topFamilies,
    purpose,
  }
}

const familyLabel = (id) => FAMILY_TAGS.find((t) => t.id === id)?.label || id
const purposeLabel = (id) => PURPOSE_TAGS.find((t) => t.id === id)?.label || id

function DiscoveryQuiz() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [recommended, setRecommended] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const done = step >= QUESTIONS.length
  const profile = useMemo(() => (done ? computeProfile(answers) : null), [done, answers])

  useEffect(() => {
    if (!profile) return
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await api.getProducts({
          page: 1,
          limit: 6,
          sort: 'rating_desc',
          family: profile.families.join(','),
          purpose: profile.purpose,
        })
        setRecommended(Array.isArray(data?.products) ? data.products : Array.isArray(data) ? data : [])
      } catch (e) {
        setError(e.message || 'Failed to load recommendations')
        setRecommended([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [profile])

  const reset = () => {
    setStep(0)
    setAnswers({})
    setRecommended([])
    setError('')
  }

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
            <p className="ka-kicker">Discovery</p>
            <h1 className="mt-4 ka-h1">Find your signature scent in 60 seconds</h1>
            <p className="mt-4 ka-lead">
              Answer a few quick questions. We’ll suggest fragrance families and show products that match.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/create-blend" className="ka-btn-ghost px-5 py-2">
                Create your own blend
              </Link>
              <Link to="/knowledge" className="ka-btn-ghost px-5 py-2">
                Aroma knowledge center
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
              assetKey="quiz.hero"
              className="ka-frame ka-mediaBg aspect-[16/10] w-full"
              imgClassName="p-2"
              defaultAspect="16 / 10"
              fit="contain"
            />
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Fast</p>
              <p className="mt-2 text-sm text-muted">
                This is a discovery tool. If you’re buying in bulk/industrial quantity, contact us for guidance.
              </p>
            </div>
          </motion.div>
        </div>
      </header>

      <section className="px-6 pb-16">
        <div className="mx-auto w-full max-w-6xl">
          {!done ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-lg shadow-black/10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
                  Question {step + 1} / {QUESTIONS.length}
                </p>
                <div className="flex items-center gap-2">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={() => setStep((s) => Math.max(0, s - 1))}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-emberDark hover:border-gold/40"
                    >
                      Back
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-emberDark hover:border-gold/40"
                  >
                    Restart
                  </button>
                </div>
              </div>

              <h2 className="mt-4 text-2xl font-semibold text-ink">{QUESTIONS[step].label}</h2>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {QUESTIONS[step].options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setAnswers((prev) => ({ ...prev, [QUESTIONS[step].id]: opt.value }))
                      setStep((s) => s + 1)
                    }}
                    className="rounded-3xl border border-slate-200/80 bg-clay/60 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-gold/35 hover:bg-white"
                  >
                    <p className="text-sm font-semibold text-ink">{opt.title}</p>
                    <p className="mt-2 text-sm text-muted">{opt.copy}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-lg shadow-black/10">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Your profile</p>
                <h2 className="mt-3 text-2xl font-semibold text-ink">Recommended families</h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {profile.families.map((f) => (
                    <span
                      key={f}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-emberDark"
                    >
                      {familyLabel(f)}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted">
                  Suggested purpose: <span className="font-semibold text-ink">{purposeLabel(profile.purpose)}</span>
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link to="/products" className="ka-btn-primary px-6 py-3">
                    Browse products
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      navigate('/contact', {
                        state: {
                          intent: 'quiz',
                          quiz: {
                            answers,
                            families: profile.families,
                            purpose: profile.purpose,
                          },
                        },
                      })
                    }
                    className="ka-btn-ghost px-6 py-3"
                  >
                    Request guidance
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-lg shadow-black/10">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Matches</p>
                    <h3 className="mt-2 text-lg font-semibold text-ink">Products you may like</h3>
                  </div>
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-emberDark hover:border-gold/40"
                  >
                    Retake quiz
                  </button>
                </div>

                {error ? <p className="mt-4 text-sm font-semibold text-red-600">{error}</p> : null}
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
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default DiscoveryQuiz
