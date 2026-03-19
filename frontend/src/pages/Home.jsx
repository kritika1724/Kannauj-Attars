import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiDroplet, FiWind, FiFeather } from 'react-icons/fi'
import AdminAssetImage from '../components/AdminAssetImage'
import { auth } from '../services/api'
import RecentlyViewedStrip from '../components/RecentlyViewedStrip'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

function Home() {
  const isAdmin = auth.getUser()?.isAdmin === true

  return (
    <div className="bg-sand">
      <header className="relative overflow-hidden px-6 pb-24 pt-16">
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
              Kannauj attars, crafted in the old city of perfume.
            </h1>
            <p className="max-w-xl ka-lead">
              In Kannauj, perfume is more than scent. It is memory, ritual, and artistry.
              We blend slow-distilled oils with modern refinement to create attars that feel
              timeless and personal.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/explore"
                className="ka-btn-primary"
              >
                Explore collections
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
              From rose & kewra seasonals to sandalwood-rich bases — explore signature attars,
              custom blends, and bulk supply for trade.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative overflow-hidden rounded-3xl bg-midnight p-8 text-white shadow-soft"
          >
            <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top,rgba(201,162,74,0.26)_0%,rgba(201,162,74,0)_65%)] opacity-90" />
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(201,162,74,0.35)_0%,rgba(201,162,74,0)_68%)]" />
            <div className="relative space-y-5">
              <p className="font-display text-xl">Kannauj Attars — 1998</p>
              <p className="text-sm text-white/80">
                A private, family-led house dedicated to natural attars, heritage extraction,
                and thoughtful modern perfumery.
              </p>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <AdminAssetImage
                  assetKey="home.hero.card"
                  className="aspect-[4/3] w-full rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(201,162,74,0.18),rgba(255,255,255,0.02))]"
                  imgClassName="p-2 bg-white/10"
                  defaultAspect="4 / 3"
                />
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-white/70">
                <span className="rounded-full border border-white/20 px-3 py-1">Small-batch</span>
                <span className="rounded-full border border-white/20 px-3 py-1">Botanical oils</span>
                <span className="rounded-full border border-white/20 px-3 py-1">Made in India</span>
              </div>
            </div>
          </motion.div>
        </div>

      </header>

      <section id="culture" className="bg-sand px-6 py-20">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-10 max-w-2xl">
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
                className="ka-panel group p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-gold/20 bg-white shadow-sm">
                  <Icon className="text-ember" size={22} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-3 text-sm text-muted">{copy}</p>
              </motion.article>
            ))}
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <div className="ka-panel p-6">
              <AdminAssetImage
                assetKey="home.culture.glimpse"
                className="ka-frame ka-mediaBg aspect-[16/9] w-full"
                imgClassName="p-2"
                defaultAspect="16 / 9"
              />
              {isAdmin ? (
                <p className="mt-4 text-xs font-semibold text-muted">
                  Admin: use the upload button on the image to replace it.
                </p>
              ) : null}
            </div>
            <div className="ka-card p-6">
              <h3 className="text-lg font-semibold text-ink">A glimpse of Kannauj</h3>
              <div className="ka-divider mt-4" />
              <p className="mt-4 text-sm text-muted">
                Add a heritage workshop photo, distillation still, or floral harvest image here when ready.
              </p>
              <p className="mt-3 text-sm text-muted">
                Good shots: copper deg & bhapka, condenser lines, rose harvest, kewra petals, bottling and packing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-sand to-clay px-6 py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="ka-kicker">Our house</p>
            <h2 className="mt-4 ka-h2">Rooted in Kannauj — since 1998</h2>
            <p className="mt-4 text-muted">
              Kannauj Attars is a private enterprise built around slow craft and consistent quality.
              From traditional attars to trade-ready compounds, we keep the process authentic — and the buying experience modern.
            </p>
            <div className="mt-6 grid gap-3 text-sm font-semibold text-emberDark">
              <p>Attars & perfume oils</p>
              <p>Aromatics chemicals</p>
              <p>Pan Masala & Zafrani Jarda compounds</p>
            </div>
          </div>
          <div className="ka-card p-6">
            <AdminAssetImage
              assetKey="home.house.photo"
              className="ka-frame aspect-[16/10] w-full bg-[linear-gradient(135deg,rgba(17,27,58,0.14),rgba(255,255,255,0.92),rgba(201,162,74,0.22))]"
              imgClassName="p-2"
              defaultAspect="16 / 10"
              fit="contain"
            />
            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-muted">
                Kannauj Attars • 1998
              </p>
              <h3 className="mt-3 text-lg font-semibold text-ink">Heritage you can trust</h3>
              <p className="mt-3 text-sm text-muted">
                Founder: Mr Pawan Trivedi. We serve everyday buyers as well as bulk requirements — with the same care for purity and finish.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sand px-6 py-20">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-10 max-w-2xl">
            <p className="ka-kicker">Explore</p>
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
                className="flex h-full flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10"
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
                  className="mt-6 inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-emberDark transition hover:border-gold/50 hover:bg-clay/60"
                >
                  View details
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-gradient-to-b from-sand to-clay">
        <RecentlyViewedStrip />
      </div>

      <footer className="bg-midnight px-6 py-16 text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl">Kannauj Attars</h2>
            <p className="mt-2 text-sm text-white/75">Private business. Heritage oils. Modern sensibility.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/explore"
              className="ka-btn-primary px-5 py-2"
            >
              Explore
            </Link>
            <a
              href="#top"
              className="ka-btn-darkOutline px-5 py-2"
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
