import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import AdminAssetImage from '../components/AdminAssetImage'
import { getKnowledgeArticle } from '../config/knowledge'

function KnowledgeArticle() {
  const { slug } = useParams()
  const article = getKnowledgeArticle(slug)

  if (!article) {
    return (
      <div className="min-h-screen bg-sand px-6 py-16">
        <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200/80 bg-white p-10 shadow-lg shadow-black/10">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">Knowledge</p>
          <h1 className="mt-4 font-display text-4xl text-ink md:text-5xl">Article not found</h1>
          <p className="mt-4 text-sm text-muted">The article you are looking for does not exist.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/knowledge" className="ka-btn-primary px-6 py-3">
              Back to knowledge center
            </Link>
            <Link to="/products" className="ka-btn-ghost px-6 py-3">
              Browse products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-sand min-h-screen">
      <header className="px-6 pb-10 pt-12">
        <div className="mx-auto w-full max-w-6xl">
          <p className="ka-kicker">Knowledge</p>
          <h1 className="mt-4 ka-h1">{article.title}</h1>
          <p className="mt-4 ka-lead">{article.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-emberDark">
              {article.readTime}
            </span>
            <Link to="/knowledge" className="rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-emberDark hover:border-gold/40">
              Back to knowledge
            </Link>
          </div>
        </div>
      </header>

      <section className="px-6 pb-16">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.article
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-lg shadow-black/10"
          >
            <AdminAssetImage
              assetKey={`knowledge.card.${article.slug}`}
              className="ka-frame ka-mediaBg aspect-[16/9] w-full"
              imgClassName="p-2"
              defaultAspect="16 / 9"
              fit="contain"
            />

            <div className="mt-8 space-y-8">
              {article.sections.map((s) => (
                <section key={s.heading}>
                  <h2 className="text-xl font-semibold text-ink">{s.heading}</h2>
                  {Array.isArray(s.paragraphs)
                    ? s.paragraphs.map((p) => (
                        <p key={p.slice(0, 18)} className="mt-3 text-sm leading-relaxed text-muted">
                          {p}
                        </p>
                      ))
                    : null}
                  {Array.isArray(s.bullets) && s.bullets.length > 0 ? (
                    <ul className="mt-4 space-y-2 text-sm text-muted">
                      {s.bullets.map((b) => (
                        <li key={b}>• {b}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>

            {article.disclaimer ? (
              <div className="mt-10 rounded-2xl border border-gold/25 bg-clay/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Note</p>
                <p className="mt-2 text-sm text-ink">{article.disclaimer}</p>
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="ka-btn-primary px-5 py-2">
                Explore products
              </Link>
              <Link to="/create-blend" className="ka-btn-ghost px-5 py-2">
                Create your own blend
              </Link>
            </div>
          </motion.article>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-black/10">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Next step</p>
              <h3 className="mt-3 text-lg font-semibold text-ink">Find your signature scent</h3>
              <p className="mt-2 text-sm text-muted">
                Take the 60‑second discovery quiz and get recommended fragrance families.
              </p>
              <Link to="/discovery-quiz" className="mt-5 ka-btn-primary px-5 py-2">
                Take quiz
              </Link>
            </div>

            <div className="rounded-3xl border border-gold/25 bg-clay/60 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Custom</p>
              <h3 className="mt-3 text-lg font-semibold text-ink">Need a custom blend?</h3>
              <p className="mt-2 text-sm text-muted">
                Share your preferred notes and quantity. We’ll guide you with sampling, pricing, and lead time.
              </p>
              <Link to="/contact" state={{ intent: 'blend' }} className="mt-5 ka-btn-ghost px-5 py-2">
                Contact us
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}

export default KnowledgeArticle

