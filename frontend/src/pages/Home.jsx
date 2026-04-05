import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiDroplet, FiWind, FiFeather, FiUser, FiMail, FiPhone, FiPackage, FiAward } from 'react-icons/fi'
import AdminAssetImage from '../components/AdminAssetImage'
import { auth } from '../services/api'
import RecentlyViewedStrip from '../components/RecentlyViewedStrip'
import { BUSINESS } from '../config/business'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

function Home() {
  const isAdmin = auth.getUser()?.isAdmin === true

  return (
    <div className="bg-sand">
      <header className="relative px-6 pt-16 pb-24 overflow-hidden">
        <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(201,162,74,0.55)_0%,rgba(201,162,74,0)_72%)] opacity-60" />
        <div className="absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(17,27,58,0.22)_0%,rgba(17,27,58,0)_72%)] opacity-55" />

        <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <p className="ka-kicker">The fragrance capital of heritage</p>
            <h1 className="ka-h1">
              Kannauj attars, crafted in the perfume city of India.
            </h1>
            <p className="max-w-xl ka-lead">
              In Kannauj, perfume is more than scent. It is memory, ritual, and artistry,
              shaped into timeless attars for personal and trade use.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="ka-btn-primary"
              >
                Browse collections
              </Link>
              <Link
                to="/gallery"
                className="ka-btn-outline"
              >
                Photo gallery
              </Link>
              <a
                href="#culture"
                className="ka-btn-outline bg-white/70"
              >
                Perfume culture
              </a>
            </div>

            <p className="max-w-xl text-sm leading-relaxed text-emberDark/80">
              Explore signature attars, heritage profiles, and trade-ready fragrance supplies.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative p-8 overflow-hidden text-white rounded-3xl bg-midnight shadow-soft"
          >
            <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top,rgba(201,162,74,0.26)_0%,rgba(201,162,74,0)_65%)] opacity-90" />
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(201,162,74,0.35)_0%,rgba(201,162,74,0)_68%)]" />
            <div className="relative space-y-5">
              <p className="text-xl font-display">Kannauj Attars — 1998</p>
              <p className="text-sm text-white/80">
                A private, family-led house dedicated to natural attars, heritage extraction,
                and thoughtful modern perfumery.
              </p>
              <div className="p-4 border rounded-2xl border-white/15 bg-white/5">
                <AdminAssetImage
                  assetKey="home.hero.card"
                  className="aspect-[4/3] w-full rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(201,162,74,0.18),rgba(255,255,255,0.02))]"
                  imgClassName="p-2 bg-white/10"
                  defaultAspect="4 / 3"
                />
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-white/70">
                <span className="px-3 py-1 border rounded-full border-white/20">Small-batch</span>
                <span className="px-3 py-1 border rounded-full border-white/20">Botanical oils</span>
                <span className="px-3 py-1 border rounded-full border-white/20">Made in India</span>
              </div>
            </div>
          </motion.div>
        </div>

      </header>

      <section id="culture" className="px-6 py-20 bg-sand">
        <div className="w-full max-w-6xl mx-auto">
          <div className="max-w-2xl mb-10">
            <p className="ka-kicker">Kannauj legacy</p>
            <h2 className="mt-4 ka-h2">The perfume culture of Kannauj</h2>
            <p className="mt-4 text-muted">
              For centuries, Kannauj has shaped the art of attar making. The craft is slow,
              precise, and deeply respectful of nature.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: FiDroplet,
                title: 'Deg & Bhapka distillation',
                copy: 'Traditional copper stills gently capture floral, woody, and resinous notes.',
              },
              {
                icon: FiWind,
                title: 'Seasonal botanicals',
                copy: 'Flowers, herbs, and spices are sourced in season for the truest expression of each harvest.',
              },
              {
                icon: FiFeather,
                title: 'Slow maceration',
                copy: 'Attars rest and mature so the blend settles into a smooth, lingering trail.',
              },
            ].map(({ icon: Icon, title, copy }) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-6 transition ka-panel group hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10"
              >
                <div className="grid w-12 h-12 bg-white border shadow-sm place-items-center rounded-2xl border-gold/20">
                  <Icon className="text-ember" size={22} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-3 text-sm text-muted">{copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-sand">
        <div className="w-full max-w-6xl mx-auto">
          <div className="max-w-2xl mb-10">
            <p className="ka-kicker">Collections</p>
            <h2 className="mt-4 ka-h2">Choose your attar journey</h2>
            <p className="mt-4 text-muted">Discover blends that align with your mood, season, and story.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Signature Attars',
                copy: 'Balanced profiles for everyday elegance and quiet confidence.',
                link: '/collections/signature',
                assetKey: 'home.explore.signature',
              },
              {
                title: 'Heritage Collection',
                copy: 'Deep, traditional scents that honor classic Kannauj recipes.',
                link: '/collections/heritage',
                assetKey: 'home.explore.heritage',
              },
              {
                title: 'Custom Blends',
                copy: 'Personalized attars crafted for occasions, gifting, or identity.',
                link: '/custom-blends',
                assetKey: 'home.explore.custom',
              },
            ].map(({ title, copy, link, assetKey }) => (
              <article
                key={title}
                className="flex flex-col justify-between h-full p-6 transition bg-white border shadow-sm rounded-3xl border-slate-200/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10"
              >
                <div>
                  <AdminAssetImage
                    assetKey={assetKey}
                    className="ka-frame ka-mediaBg aspect-[5/4] w-full"
                    imgClassName="p-2"
                    defaultAspect="5 / 4"
                    fit="contain"
                  />
                  <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
                  <p className="mt-3 text-sm text-muted">{copy}</p>
                </div>
                <Link
                  to={link}
                  className="inline-flex items-center px-4 py-2 mt-6 text-xs font-semibold transition bg-white border rounded-full w-fit border-slate-200 text-emberDark hover:border-gold/50 hover:bg-clay/60"
                >
                  View details
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-gradient-to-b from-clay to-sand">
        <div className="w-full max-w-6xl mx-auto">
          <div className="max-w-3xl mb-10">
            <p className="ka-kicker">Our Product Range</p>
            <h2 className="mt-4 ka-h2">Traditional attars, roohs, waters, and essential oils</h2>
            <p className="mt-4 text-muted">
              A focused range of classic Indian attars, floral roohs, waters, and specialty oils.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {BUSINESS.productRange.map((section) => (
              <article
                key={section.title}
                className="p-6 transition bg-white border shadow-sm rounded-3xl border-slate-200/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">{section.title}</p>
                <div className="mt-4 ka-divider" />
                <ul className="mt-5 space-y-3 text-sm text-emberDark">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="p-6 mt-8 text-white border rounded-3xl border-gold/20 bg-midnight shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-white/60">Trade & Enquiry</p>
                <p className="mt-2 text-sm text-white/80">
                  For pack sizes, current pricing, bulk supply, or custom requirements, contact Kannauj Attars directly.
                </p>
              </div>
              <Link to="/contact" className="px-5 py-2 ka-btn-primary">
                Request details
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="about-brand" className="px-6 py-20 bg-gradient-to-b from-sand to-clay">
        <div className="w-full max-w-6xl mx-auto">
          <div className="max-w-3xl mb-10">
            <p className="ka-kicker">About Kannauj Attars</p>
            <h2 className="mt-4 ka-h2">
              {BUSINESS.name} — a private enterprise founded in {BUSINESS.since}
            </h2>
            <p className="mt-4 text-muted">{BUSINESS.about}</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 ka-panel">
              <div className="flex items-center gap-3">
                <FiUser className="text-ember" size={24} />
                <h3 className="text-xl font-semibold text-ink">Founder & CEO</h3>
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
                Established in {BUSINESS.since}, the enterprise continues to blend authentic Kannauj craft with
                dependable quality for both personal buyers and trade requirements.
              </p>
              <Link
                to="/ceo"
                className="inline-flex items-center px-4 py-2 mt-5 text-xs font-semibold transition bg-white border rounded-full w-fit border-slate-200 text-emberDark hover:border-gold/50 hover:bg-clay/60"
              >
                Know about CEO →
              </Link>
            </div>

            <div className="p-8 ka-card">
              <div className="flex items-center gap-3">
                <FiPackage className="text-ember" size={24} />
                <h3 className="text-xl font-semibold text-ink">Business details</h3>
              </div>
              <p className="mt-4 text-sm text-muted">Private enterprise: {BUSINESS.name}</p>

              {Array.isArray(BUSINESS.associations) && BUSINESS.associations.length ? (
                <div className="p-5 mt-4 border rounded-2xl border-gold/25 bg-clay/60">
                  <div className="flex items-center gap-3">
                    <FiAward className="text-ember" size={18} />
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
                      Memberships & Associations
                    </p>
                  </div>
                  <div className="grid gap-3 mt-4">
                    {BUSINESS.associations.map((association) => (
                      <div
                        key={`${association.name}-${association.location}`}
                        className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border rounded-2xl border-white/40 bg-white/70"
                      >
                        <p className="text-sm font-semibold text-ink">{association.name}</p>
                        {association.location ? (
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-emberDark">
                            {association.location}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-6 space-y-3 text-sm font-semibold text-emberDark">
                <div className="flex flex-wrap items-center gap-3">
                  <FiMail size={18} />
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {(BUSINESS.emails || [BUSINESS.email]).map((email) => (
                      <a key={email} href={`mailto:${email}`} className="hover:text-ink">
                        {email}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <FiPhone size={18} />
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {(BUSINESS.phones || []).map((phone) => (
                      <a key={phone} href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-ink">
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-gradient-to-b from-sand to-clay">
        <RecentlyViewedStrip />
      </div>

      <footer className="px-6 py-16 text-white bg-midnight">
        <div className="flex flex-wrap items-center justify-between w-full max-w-6xl gap-6 mx-auto">
          <div>
            <h2 className="text-2xl font-display">Kannauj Attars</h2>
            <p className="mt-2 text-sm text-white/75">Private business rooted in Kannauj perfumery.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/products"
              className="px-5 py-2 ka-btn-primary"
            >
              Browse products
            </Link>
            <a
              href="#top"
              className="px-5 py-2 ka-btn-darkOutline"
            >
              Back to top
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
