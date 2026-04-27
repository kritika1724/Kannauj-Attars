import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiDroplet, FiWind, FiFeather, FiUser, FiMail, FiPhone, FiPackage, FiAward } from 'react-icons/fi'
import AdminAssetImage from '../components/AdminAssetImage'
import RecentlyViewedStrip from '../components/RecentlyViewedStrip'
import { useSiteAssets } from '../components/SiteAssetsProvider'
import { BUSINESS } from '../config/business'
import { auth } from '../services/api'
import { toAssetUrl } from '../utils/media'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

function Home() {
  const { assets, uploadAndSetAsset } = useSiteAssets()
  const [user, setUser] = useState(auth.getUser())
  const [videoBusy, setVideoBusy] = useState(false)
  const [videoMessage, setVideoMessage] = useState('')
  const isAdmin = user?.isAdmin === true
  const homeVideo = assets?.['home.top.video']
    ? toAssetUrl(assets['home.top.video'], import.meta.env.VITE_API_ASSET)
    : ''

  useEffect(() => {
    const onAuth = () => setUser(auth.getUser())
    window.addEventListener('authchange', onAuth)
    return () => window.removeEventListener('authchange', onAuth)
  }, [])

  const uploadHomeBackgroundVideo = async (file) => {
    setVideoBusy(true)
    setVideoMessage('')
    try {
      await uploadAndSetAsset('home.top.video', file)
      setVideoMessage('Background video updated.')
    } catch (e) {
      setVideoMessage(e.message || 'Video upload failed.')
    } finally {
      setVideoBusy(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-sand">
      {homeVideo ? (
        <div className="fixed inset-0 z-0 overflow-hidden">
          <video
            src={homeVideo}
            className="h-full w-full object-cover object-center"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,250,244,0.88)_0%,rgba(255,250,244,0.74)_48%,rgba(17,27,58,0.42)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,162,74,0.26),rgba(201,162,74,0)_42%)]" />
        </div>
      ) : (
        <div className="fixed inset-0 z-0 bg-[linear-gradient(135deg,#FFF6EC_0%,#F6F7FB_46%,#E6D3B3_100%)]" />
      )}

      {isAdmin ? (
        <div className="fixed bottom-5 right-5 z-50 max-w-[calc(100vw-2rem)] rounded-2xl border border-gold/30 bg-midnight/82 p-3 text-white shadow-[0_18px_45px_rgba(7,11,24,0.28)] backdrop-blur-md">
          <label className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85">
            Home background video
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/ogg,video/x-m4v,.mp4,.webm,.mov,.m4v,.ogg"
              disabled={videoBusy}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadHomeBackgroundVideo(file)
              }}
              className="mt-2 block w-full max-w-xs text-[11px] text-white file:mr-3 file:rounded-full file:border-0 file:bg-white/90 file:px-3 file:py-1 file:text-[11px] file:font-semibold file:text-ink hover:file:bg-white disabled:opacity-60"
            />
          </label>
          {videoMessage ? <p className="mt-2 text-[11px] font-semibold text-white/90">{videoMessage}</p> : null}
        </div>
      ) : null}

      <div className="relative z-10">
      <header className="relative overflow-hidden px-6 py-20 md:py-24">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(90deg,rgba(255,250,244,0.52)_0%,rgba(255,250,244,0.24)_52%,rgba(17,27,58,0.16)_100%)]" />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(201,162,74,0.24),rgba(201,162,74,0)_42%)]" />
        <div className="absolute -right-24 -top-20 z-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(201,162,74,0.34)_0%,rgba(201,162,74,0)_72%)] opacity-60" />
        <div className="absolute -left-20 bottom-10 z-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(17,27,58,0.16)_0%,rgba(17,27,58,0)_72%)] opacity-55" />

        <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="space-y-6 rounded-[32px] border border-white/60 bg-white/72 p-6 shadow-[0_24px_70px_rgba(17,27,58,0.14)] backdrop-blur-md sm:p-8"
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
                to="/collections"
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
              <p className="text-xl font-display">{BUSINESS.displayFirmName}</p>
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
                <span className="px-3 py-1 border rounded-full border-white/20">Indian Attars</span>
                <span className="px-3 py-1 border rounded-full border-white/20">Botanical oils</span>
                <span className="px-3 py-1 border rounded-full border-white/20">Made in India</span>
              </div>
            </div>
          </motion.div>
        </div>

      </header>

      <section id="culture" className="px-6 py-20">
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

      <section className="px-6 py-20">
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
                cardClass:
                  'border-[#d7deec] shadow-[0_18px_42px_rgba(17,27,58,0.08)] hover:border-[#c8a96a]/60 hover:shadow-[0_24px_50px_rgba(17,27,58,0.12)]',
                buttonClass: 'border-[#d7deec] hover:border-gold/60',
              },
              {
                title: 'Heritage Collection',
                copy: 'Deep, traditional scents that honor classic Kannauj recipes.',
                link: '/collections/heritage',
                assetKey: 'home.explore.heritage',
                cardClass:
                  'border-[#e4d1ae] shadow-[0_18px_42px_rgba(122,85,50,0.08)] hover:border-[#c8a96a]/70 hover:shadow-[0_24px_50px_rgba(122,85,50,0.12)]',
                buttonClass: 'border-[#e4d1ae] hover:border-gold/70',
              },
              {
                title: 'Custom Blends',
                copy: 'Personalized attars crafted for occasions, gifting, or identity.',
                link: '/custom-blends',
                assetKey: 'home.explore.custom',
                cardClass:
                  'border-[#d9d4cf] shadow-[0_18px_42px_rgba(60,75,116,0.08)] hover:border-[#c8a96a]/65 hover:shadow-[0_24px_50px_rgba(60,75,116,0.12)]',
                buttonClass: 'border-[#d9d4cf] hover:border-gold/65',
              },
            ].map(({ title, copy, link, assetKey, cardClass, buttonClass }) => (
              <article
                key={title}
                className={`flex h-full flex-col justify-between rounded-3xl border bg-white/88 p-6 backdrop-blur-md transition duration-300 hover:-translate-y-1 ${cardClass}`}
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
                  className={`inline-flex w-fit items-center rounded-full border bg-white px-4 py-2 text-xs font-semibold text-emberDark transition duration-300 hover:bg-clay/60 ${buttonClass}`}
                >
                  View details
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about-brand" className="px-6 py-20">
        <div className="w-full max-w-6xl mx-auto">
          <div className="max-w-3xl mb-10">
            <p className="ka-kicker">About {BUSINESS.displayName}</p>
            <h2 className="mt-4 ka-h2">
              {BUSINESS.name} — a private enterprise founded in {BUSINESS.since}
            </h2>
            <p className="mt-4 text-muted">{BUSINESS.about}</p>
          </div>

          <div className="grid gap-8 lg:items-start lg:grid-cols-[1.1fr_0.9fr]">
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
              <p className="mt-1 text-sm font-semibold text-emberDark">Founder, {BUSINESS.displayFirmName}</p>
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

            <div className="grid self-start gap-6">
              <div className="p-8 ka-card">
                <div className="flex items-center gap-3">
                  <FiPackage className="text-ember" size={24} />
                  <h3 className="text-xl font-semibold text-ink">Business details</h3>
                </div>
                <p className="mt-4 text-sm text-muted">Private enterprise: {BUSINESS.displayName}</p>
                <p className="mt-2 text-sm font-semibold text-emberDark">Firm: {BUSINESS.displayFirmName}</p>

                {Array.isArray(BUSINESS.associations) && BUSINESS.associations.length ? (
                  <div className="p-5 mt-4 border rounded-2xl border-gold/25 bg-clay/60">
                    <div className="flex items-center gap-3">
                      <FiAward className="text-ember" size={18} />
                      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
                        Member of :
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

              <div className="relative overflow-hidden p-8 text-white shadow-soft rounded-[28px] bg-[linear-gradient(135deg,#111B3A_0%,#0B122B_58%,#070B18_100%)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,162,74,0.24),rgba(201,162,74,0)_42%)]" />
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/65">Industry Leadership</p>
                  <h3 className="mt-3 text-2xl font-semibold text-white">Mr. Pawan Trivedi serves as President of The Attars & Perfumers Association Kannauj</h3>
                  <p className="max-w-xl mt-4 text-sm leading-7 text-white/78">
                    Alongside leading {BUSINESS.displayName}, he remains actively connected to the wider perfume community of
                    Kannauj through association leadership, heritage advocacy, and support for the region&apos;s traditional
                    attar craft.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold text-white/85">
                    <span className="rounded-full border border-white/15 bg-white/6 px-3 py-1.5">President role</span>
                    <span className="rounded-full border border-white/15 bg-white/6 px-3 py-1.5">Kannauj association</span>
                    <span className="rounded-full border border-white/15 bg-white/6 px-3 py-1.5">Heritage advocacy</span>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-5">
                    <Link
                      to="/ceo"
                      className="inline-flex items-center px-4 py-2 text-xs font-semibold transition bg-white rounded-full text-emberDark hover:bg-gold hover:text-ink"
                    >
                      Know about CEO
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[28px] border border-gold/20 bg-white/86 p-8 shadow-[0_20px_55px_rgba(17,27,58,0.08)] backdrop-blur-sm">
              <p className="ka-kicker">Heritage & Craft</p>
              <h3 className="mt-4 text-2xl font-semibold text-ink">A legacy carried through generations</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{BUSINESS.legacyIntro}</p>

              <div className="mt-6 rounded-3xl border border-gold/20 bg-clay/55 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Deg-Bhapka tradition</p>
                <p className="mt-3 text-sm leading-7 text-muted">{BUSINESS.craftNote}</p>
              </div>

              <div className="mt-4 rounded-3xl border border-emerald-100 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">GI-tagged authenticity</p>
                <p className="mt-3 text-sm leading-7 text-muted">{BUSINESS.giNote}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {BUSINESS.legacyTimeline.map((item) => (
                <div
                  key={`${item.year}-${item.title}`}
                  className="rounded-[28px] border border-white/75 bg-white/88 p-6 shadow-[0_18px_45px_rgba(17,27,58,0.08)] backdrop-blur-sm"
                >
                  <span className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emberDark">
                    {item.year}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="bg-white/64 backdrop-blur-sm">
        <RecentlyViewedStrip />
      </div>

      <footer className="px-6 py-16 text-white bg-midnight">
        <div className="flex flex-wrap items-center justify-between w-full max-w-6xl gap-6 mx-auto">
          <div>
            <h2 className="text-2xl font-display">{BUSINESS.displayName}</h2>
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
    </div>
  )
}

export default Home
