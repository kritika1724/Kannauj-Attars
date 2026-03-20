import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiMail, FiMapPin, FiAward } from 'react-icons/fi'
import AdminAssetImage from '../components/AdminAssetImage'
import { BUSINESS } from '../config/business'

function Ceo() {
  return (
    <div className="bg-sand min-h-screen">
      <header className="px-6 pb-12 pt-12">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <p className="ka-kicker">Leadership</p>
            <h1 className="mt-4 ka-h1">{BUSINESS.founder}</h1>
            <p className="mt-4 ka-lead">
              {BUSINESS.founderTitle}
            </p>
            <p className="mt-6 text-sm text-muted">
              Kannauj Attars is built on heritage craft and modern reliability — serving personal buyers as well as trade
              and bulk requirements with a consistent focus on purity and finish.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="ka-btn-primary px-6 py-3">
                Browse products
              </Link>
              <Link to="/contact" className="ka-btn-ghost px-6 py-3">
                Contact
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-black/10"
          >
            <AdminAssetImage
              assetKey="about.ceo.photo"
              className="ka-frame ka-mediaBg aspect-[4/5] w-full"
              imgClassName="p-3"
              defaultAspect="4 / 5"
              fit="contain"
            />
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-slate-200/80 bg-clay/60 p-4">
                <div className="flex items-start gap-3">
                  <FiAward className="mt-0.5 text-ember" size={18} />
                  <div>
                    <p className="text-sm font-semibold text-ink">Role</p>
                    <p className="mt-1 text-sm text-muted">
                      {BUSINESS.founderTitle}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-clay/60 p-4">
                <div className="flex items-start gap-3">
                  <FiMail className="mt-0.5 text-ember" size={18} />
                  <div>
                    <p className="text-sm font-semibold text-ink">Email</p>
                    <a href={`mailto:${BUSINESS.email}`} className="mt-1 inline-flex text-sm text-muted hover:text-ink">
                      {BUSINESS.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <section className="px-6 pb-16">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-lg shadow-black/10">
            <h2 className="text-xl font-semibold text-ink">About</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Founded in 1998, Kannauj Attars is a private enterprise based in Kannauj — widely recognized as India’s
              perfume heritage city. Under the leadership of Mr. Pawan Trivedi, the focus remains on consistent quality,
              thoughtful blending, and reliable supply.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              The business deals in aromatics chemicals, as well as Pan Masala and Zafrani Jarda compounds, supporting
              both everyday buyers and trade partners.
            </p>

            <div className="mt-8 rounded-2xl border border-gold/25 bg-clay/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Quick links</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/products" className="ka-btn-primary px-5 py-2">
                  Products
                </Link>
                <Link to="/custom-blends" className="ka-btn-ghost px-5 py-2">
                  Custom blends
                </Link>
                <Link to="/knowledge" className="ka-btn-ghost px-5 py-2">
                  Knowledge center
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-lg shadow-black/10">
            <h2 className="text-xl font-semibold text-ink">Offices</h2>
            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl border border-slate-200/80 bg-clay/60 p-5">
                <div className="flex items-start gap-3">
                  <FiMapPin className="mt-0.5 text-ember" size={18} />
                  <div>
                    <p className="text-sm font-semibold text-ink">Kannauj Office</p>
                    <p className="mt-2 text-sm text-muted">{BUSINESS.offices.kannauj.address}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-clay/60 p-5">
                <div className="flex items-start gap-3">
                  <FiMapPin className="mt-0.5 text-ember" size={18} />
                  <div>
                    <p className="text-sm font-semibold text-ink">Mumbai Office</p>
                    <p className="mt-2 text-sm text-muted">
                      {BUSINESS.offices.mumbai.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Link to="/" className="mt-6 inline-flex text-sm font-semibold text-emberDark hover:text-ink">
              Back to Home →
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-midnight px-6 py-14 text-white">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="font-display text-2xl">Kannauj Attars</h2>
          <p className="mt-2 text-sm text-white/75">Leadership rooted in heritage craft.</p>
        </div>
      </footer>
    </div>
  )
}

export default Ceo
