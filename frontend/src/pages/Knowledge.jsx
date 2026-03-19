import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AdminAssetImage from '../components/AdminAssetImage'
import { KNOWLEDGE_ARTICLES } from '../config/knowledge'

function Knowledge() {
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
            <p className="ka-kicker">Aroma knowledge</p>
            <h1 className="mt-4 ka-h1">Learn the craft behind the scent</h1>
            <p className="mt-4 ka-lead">
              A practical, buyer-friendly guide to attars, essential oils, aroma chemicals, and safe usage.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/discovery-quiz" className="ka-btn-primary px-5 py-2">
                Take the discovery quiz
              </Link>
              <Link to="/products" className="ka-btn-ghost px-5 py-2">
                Browse products
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
              assetKey="knowledge.hero"
              className="ka-frame ka-mediaBg aspect-[16/10] w-full"
              imgClassName="p-2"
              defaultAspect="16 / 10"
              fit="contain"
            />
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Clarity</p>
              <p className="mt-2 text-sm text-muted">
                Understand categories, extraction methods, and safety basics — helpful for personal buyers and
                manufacturers.
              </p>
            </div>
          </motion.div>
        </div>
      </header>

      <section className="px-6 pb-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2">
            {KNOWLEDGE_ARTICLES.map((a) => (
              <motion.article
                key={a.slug}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-black/10 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/15"
              >
                <AdminAssetImage
                  assetKey={`knowledge.card.${a.slug}`}
                  className="ka-frame ka-mediaBg aspect-[16/9] w-full"
                  imgClassName="p-2"
                  defaultAspect="16 / 9"
                  fit="contain"
                />
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Guide</p>
                  <p className="text-xs font-semibold text-muted">{a.readTime}</p>
                </div>
                <h2 className="mt-3 text-xl font-semibold text-ink">{a.title}</h2>
                <p className="mt-3 text-sm text-muted">{a.excerpt}</p>
                <Link to={`/knowledge/${a.slug}`} className="mt-6 ka-btn-primary px-5 py-2">
                  Read
                </Link>
              </motion.article>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-gold/25 bg-clay/60 p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Need help choosing the right profile?</h2>
            <p className="mt-2 text-sm text-muted">
              Take the discovery quiz or request a custom blend — we’ll guide you based on your preferences and use case.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/discovery-quiz" className="ka-btn-primary px-5 py-2">
                Discovery quiz
              </Link>
              <Link to="/create-blend" className="ka-btn-ghost px-5 py-2">
                Create your own blend
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Knowledge

