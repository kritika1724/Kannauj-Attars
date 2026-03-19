import { motion } from 'framer-motion'
import { FiUser, FiMapPin, FiMail, FiPackage, FiAward } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import AdminAssetImage from '../components/AdminAssetImage'
import { BUSINESS } from '../config/business'

function About() {
  return (
    <div className="bg-sand">
      <header className="px-6 pb-16 pt-12">
        <div className="mx-auto w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <p className="ka-kicker">About the brand</p>
            <h1 className="mt-4 ka-h1">
              {BUSINESS.name} — a private enterprise founded in {BUSINESS.since}.
            </h1>
            <p className="mt-4 ka-lead">
              {BUSINESS.about}
            </p>
          </motion.div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/gallery"
              className="ka-btn-primary"
            >
              View photo gallery
            </Link>
            <Link
              to="/products"
              className="ka-btn-ghost"
            >
              Browse products
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-sand px-6 py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="ka-panel p-8">
            <div className="flex items-center gap-3">
              <FiUser className="text-ember" size={24} />
              <h2 className="text-xl font-semibold text-ink">Founder & CEO</h2>
            </div>
            <div className="mt-6">
              <AdminAssetImage
                assetKey="about.ceo.photo"
                className="ka-frame aspect-[4/5] w-full bg-[radial-gradient(circle_at_top,rgba(201,162,74,0.22),rgba(255,255,255,0.95))]"
                imgClassName="p-3"
                defaultAspect="4 / 5"
                fit="contain"
              />
            </div>
            <p className="mt-4 text-lg font-semibold text-ink">{BUSINESS.founder}</p>
            <p className="mt-1 text-sm font-semibold text-emberDark">{BUSINESS.founderTitle}</p>
            <p className="mt-3 text-sm text-muted">
              Established in {BUSINESS.since}, the enterprise has grown around a simple belief: authentic Kannauj
              aromatics should be crafted with care, consistency, and trust.
            </p>
          </div>
          <div className="ka-card p-8">
            <div className="flex items-center gap-3">
              <FiPackage className="text-ember" size={24} />
              <h2 className="text-xl font-semibold text-ink">Business details</h2>
            </div>
            <p className="mt-4 text-sm text-muted">Private enterprise: {BUSINESS.name}</p>
            <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">Deals in</p>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {BUSINESS.dealsIn.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>

            {Array.isArray(BUSINESS.associations) && BUSINESS.associations.length ? (
              <div className="mt-4 rounded-2xl border border-gold/25 bg-clay/60 p-5">
                <div className="flex items-center gap-3">
                  <FiAward className="text-ember" size={18} />
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
                    Memberships & Associations
                  </p>
                </div>
                <div className="mt-4 grid gap-3">
                  {BUSINESS.associations.map((a) => (
                    <div
                      key={`${a.name}-${a.location}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/40 bg-white/70 px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-ink">{a.name}</p>
                      {a.location ? (
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-emberDark">
                          {a.location}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex items-center gap-3 text-sm font-semibold text-emberDark">
              <FiMail size={18} />
              <a href={`mailto:${BUSINESS.email}`} className="hover:text-ink">
                {BUSINESS.email}
              </a>
            </div>
            <Link
              to="/ceo"
              className="mt-5 inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-emberDark transition hover:border-gold/50 hover:bg-clay/60"
            >
              Know about CEO →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-sand to-clay px-6 py-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8 max-w-2xl">
            <p className="ka-kicker">Offices</p>
            <h2 className="mt-4 ka-h2">Locations</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <FiMapPin className="text-ember" size={22} />
                <h3 className="text-lg font-semibold text-ink">{BUSINESS.offices.kannauj.label}</h3>
              </div>
              <p className="mt-3 text-sm text-muted">{BUSINESS.offices.kannauj.address}</p>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <FiMapPin className="text-ember" size={22} />
                <h3 className="text-lg font-semibold text-ink">{BUSINESS.offices.mumbai.label}</h3>
              </div>
              <p className="mt-3 text-sm text-muted">
                {BUSINESS.offices.mumbai.address}
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-midnight px-6 py-14 text-white">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="font-display text-2xl">Kannauj Attars</h2>
          <p className="mt-2 text-sm text-white/75">Heritage perfumery from the heart of Kannauj.</p>
        </div>
      </footer>
    </div>
  )
}

export default About
