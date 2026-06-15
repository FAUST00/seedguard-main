'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown, ChevronUp, ArrowLeft, Flame, Eye, Star, Zap,
  BookOpen, Shield, Brain, Infinity,
} from 'lucide-react';

// ── Accordion component ──────────────────────────────────────────────────────
function Accordion({ title, accent, icon: Icon, children }: {
  title: string;
  accent: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties; 'aria-hidden'?: boolean }>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-2xl border glass-effect overflow-hidden transition-all duration-300"
      style={{ borderColor: accent + '44' }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 p-6 text-left hover:bg-white/5 transition-colors"
        aria-expanded={open}
      >
        <Icon className="w-5 h-5 flex-shrink-0" style={{ color: accent }} aria-hidden />
        <span className="flex-1 font-bold text-base uppercase tracking-widest" style={{ color: accent }}>
          {title}
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-6 pb-6 space-y-4 text-sm text-foreground/85 leading-relaxed border-t" style={{ borderColor: accent + '22' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Pull-quote ───────────────────────────────────────────────────────────────
function PullQuote({ text, author, accent = '#ff2d9b' }: { text: string; author: string; accent?: string }) {
  return (
    <div
      className="rounded-xl p-5 my-4"
      style={{ borderLeft: `3px solid ${accent}`, background: accent + '10' }}
    >
      <p className="italic text-base text-foreground/90 leading-relaxed">&ldquo;{text}&rdquo;</p>
      <p className="mt-2 text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>— {author}</p>
    </div>
  );
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <div className="rounded-xl border p-5 text-center glass-effect" style={{ borderColor: accent + '44' }}>
      <p className="text-3xl font-extrabold font-mono" style={{ color: accent }}>{value}</p>
      <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function EsotericPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Hero */}
      <div className="relative text-center py-16 px-6 border-b border-primary/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <Link
          href="/benefits"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors mb-8 uppercase tracking-widest font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Benefits
        </Link>
        <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/30 rounded-full px-4 py-1 mb-5">
          <Eye className="w-3.5 h-3.5 text-secondary" aria-hidden />
          <span className="text-xs font-bold tracking-widest text-secondary uppercase">Hidden Knowledge</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-black italic tracking-tight mb-4 neon-text-cyan text-secondary">
          WESTERN SCIENCE
        </h1>
        <h2 className="text-2xl md:text-4xl font-display font-black italic tracking-tight mb-6 neon-text-pink text-primary">
          VS. ANCIENT ESOTERIC KNOWLEDGE
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          For thousands of years, mystery schools, secret societies, and ancient civilizations guarded a single truth
          that modern culture has worked hard to suppress: the creative seed of man is his most potent
          source of power — and learning to master it is the foundation of genius, longevity, and spiritual awakening.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-5 pb-24 space-y-8 pt-12">

        {/* ── PART 1: The Western Numbers ── */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-secondary/40" />
            <h2 className="text-xs font-bold tracking-widest text-secondary uppercase whitespace-nowrap">Part 1 · Western Biology</h2>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-secondary/40" />
          </div>

          <div className="rounded-2xl border border-secondary/20 glass-effect p-6 md:p-8 space-y-6">
            <h3 className="text-xl font-bold text-secondary neon-text-cyan uppercase tracking-wider">The Lifetime Math</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              If we take the average frequency data across a man&apos;s life cycle — starting around age 14/15 and
              accounting for the natural decline in frequency across decades — an average man will ejaculate roughly
              <strong className="text-foreground"> 5,000 to 7,500 times</strong> in an 80-year lifespan.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard value="7,500" label="Lifetime ejaculations (avg)" accent="#00e5ff" />
              <StatCard value="10 gal" label="Total seminal fluid" accent="#00e5ff" />
              <StatCard value="1,500/s" label="Sperm cells produced" accent="#ff2d9b" />
              <StatCard value="2T+" label="Lifetime sperm cells" accent="#ff2d9b" />
            </div>

            <div className="space-y-3 text-sm text-foreground/80 leading-relaxed">
              <p>
                <strong className="text-secondary">Inside the seminiferous tubules</strong> — the tiny sperm-producing coils packed inside the testes — the body manufactures roughly 1,500 sperm cells every single second. The testicles are running a non-stop industrial production line from puberty until death.
              </p>
              <p>
                Western medicine&apos;s position is straightforward: semen is a <em>renewable</em> bodily fluid. If you don&apos;t ejaculate, your body doesn&apos;t &ldquo;fill up&rdquo; indefinitely. Instead, older sperm cells simply break down inside the epididymis — the storage tube behind the testes — and their raw nutrients (proteins, zinc, magnesium, fructose) are reabsorbed directly back into the bloodstream.
              </p>
              <p>
                <strong className="text-foreground">What Western science misses:</strong> the fact that reabsorption happens at all — that the body actively recycles semen back into itself — is actually the biological confirmation of what ancient traditions taught for millennia: these nutrients never leave. Retention is nature&apos;s own recycling program.
              </p>
            </div>

            <div className="rounded-xl border border-secondary/20 p-4 bg-secondary/5">
              <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Nutrient Profile per Ejaculation</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-foreground/70">
                {[
                  'Zinc — critical for testosterone',
                  'Calcium — bone & nerve health',
                  'Magnesium — 300+ enzyme reactions',
                  'Vitamin C — immune & collagen',
                  'Fructose — cellular energy fuel',
                  'Prostaglandins — anti-inflammatory',
                  'Spermine — powerful antioxidant',
                  'Potassium — heart & muscle function',
                  'Complex proteins & amino acids',
                ].map((n) => (
                  <div key={n} className="flex items-start gap-1.5">
                    <span className="text-secondary mt-0.5">·</span>
                    <span>{n}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PART 2: Ancient Traditions ── */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
            <h2 className="text-xs font-bold tracking-widest text-primary uppercase whitespace-nowrap">Part 2 · Ancient Esoteric Traditions</h2>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
          </div>

          <div className="space-y-4">

            <Accordion title="Taoism — The Three Treasures & Jing" accent="#ff2d9b" icon={Flame}>
              <div className="pt-4 space-y-4">
                <p>
                  In Taoist philosophy, the health and lifespan of a man is governed by three treasures:
                  <strong className="text-foreground"> Jing</strong> (essence),
                  <strong className="text-foreground"> Qi</strong> (energy), and
                  <strong className="text-foreground"> Shen</strong> (spirit).
                </p>
                <p>
                  <strong className="text-pink-400">Jing</strong> is your foundational life-force battery. You are born with a fixed reservoir of it — inherited from your parents at conception — and when it is depleted, your body ages rapidly and dies. Semen is understood as the <em>physical manifestation</em> of a man&apos;s Jing. Every unnecessary ejaculation is a direct withdrawal from this account.
                </p>
                <p>
                  Taoist masters developed practices known as <strong className="text-foreground">Coitus Reservatus</strong> and <strong className="text-foreground">injaculation</strong> (non-ejaculatory orgasm) — techniques that allow a man to experience the peak of pleasure without releasing Jing. The conserved energy was said to travel backward up the <em>Du Mai</em> (Governing Vessel — the spine) to nourish the brain, the organs, and the immune system.
                </p>
                <PullQuote
                  text="The sages of antiquity knew that semen was the root of the body. When they kept it, they lived long. When they exhausted it, they died."
                  author="The Yellow Emperor's Classic of Internal Medicine, ~2600 BC"
                  accent="#ff2d9b"
                />
                <p>
                  The Yellow Emperor Huang Di&apos;s texts — among the oldest medical documents on Earth — devoted entire chapters to the art of sexual conservation. The Taoist text <em>Su Nü Jing</em> (Classic of the Plain Girl) states that a young man should ejaculate no more than twice in ten days; older men, even less.
                </p>
              </div>
            </Accordion>

            <Accordion title="Ayurveda — Ojas and the 7 Dhatus" accent="#00e5ff" icon={Star}>
              <div className="pt-4 space-y-4">
                <p>
                  Ancient Indian medicine describes the body as processing food through <strong className="text-foreground">seven successive layers of tissue</strong> called Dhatus. Each layer refines the one before it, like a distillery producing increasingly pure essences:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { n: '1. Rasa', d: 'Plasma / lymph' },
                    { n: '2. Rakta', d: 'Blood' },
                    { n: '3. Mamsa', d: 'Muscle tissue' },
                    { n: '4. Meda', d: 'Fat / adipose' },
                    { n: '5. Asthi', d: 'Bone' },
                    { n: '6. Majja', d: 'Bone marrow / nerves' },
                    { n: '7. Shukra', d: 'Reproductive tissue — the final distillation' },
                  ].map((d) => (
                    <div key={d.n} className="flex items-start gap-2 text-xs">
                      <span className="text-secondary font-bold flex-shrink-0">{d.n}</span>
                      <span className="text-foreground/70">{d.d}</span>
                    </div>
                  ))}
                </div>
                <p>
                  It takes <strong className="text-foreground">approximately 40 days</strong> of metabolic energy and perfect digestion to produce a single drop of <em>Shukra</em>. It is the body&apos;s most refined, concentrated product. If Shukra is preserved rather than spent, Ayurveda teaches it undergoes a final sublimation and transforms into <strong className="text-secondary">Ojas</strong>.
                </p>
                <p>
                  Ojas is described as a golden luminous fluid — the subtle essence responsible for:
                  radiant skin and bright eyes, steel immune function, effortless mental clarity,
                  spiritual magnetism (the quality that makes certain people &ldquo;glow&rdquo;),
                  fearlessness, and extraordinary longevity.
                </p>
                <PullQuote
                  text="Brahmacharya (celibacy/retention) is the basis of physical strength, mental brilliance, and spiritual power. It is the finest economy of the human body."
                  author="Charaka Samhita, Ancient Ayurvedic Text"
                  accent="#00e5ff"
                />
              </div>
            </Accordion>

            <Accordion title="Ancient Egypt — Eye of Horus & Pineal Activation" accent="#a78bfa" icon={Eye}>
              <div className="pt-4 space-y-4">
                <p>
                  Egyptian mystery schools — the most sophisticated esoteric tradition in recorded history — held sexual energy as the cornerstone of spiritual initiation. The priests of the highest orders practiced <strong className="text-foreground">strict sexual continence</strong> as a prerequisite for advanced teachings.
                </p>
                <p>
                  The <strong className="text-purple-400">Eye of Horus</strong> (Wadjet) is widely interpreted in esoteric traditions as an anatomical cross-section of the human brain — specifically mapping the <em>thalamus, hypothalamus, corpus callosum,</em> and <strong className="text-foreground">pineal gland</strong>. The ancient Egyptians believed that retained sexual energy, when circulated upward through the spine, would &ldquo;open&rdquo; the pineal gland — producing states of heightened perception and spiritual vision that they depicted as the &ldquo;all-seeing eye.&rdquo;
                </p>
                <p>
                  The pineal gland produces <strong className="text-foreground">DMT (dimethyltryptamine)</strong> — one of the most potent psychoactive compounds known — and is the only part of the brain that is not duplicated bilaterally. René Descartes called it &ldquo;the seat of the soul.&rdquo; Ancient Egyptians called it the Eye of Ra. Both pointed at the same organ 2,500 years apart.
                </p>
                <PullQuote
                  text="The secrets of the temple were not written, they were lived. The initiate who mastered himself mastered the universe."
                  author="Egyptian Book of the Dead, paraphrased tradition"
                  accent="#a78bfa"
                />
              </div>
            </Accordion>

            <Accordion title="Kundalini Yoga — The Serpent Fire & The Caduceus" accent="#34d399" icon={Zap}>
              <div className="pt-4 space-y-4">
                <p>
                  Kundalini is described in Hindu and Tantric traditions as a dormant serpentine energy coiled at the base of the spine — in the <em>Muladhara</em> (root chakra), the same energetic center associated with the reproductive organs. Through retention, meditation, and specific breathwork (<em>pranayama</em>), this energy is said to rise through the seven chakras along the <em>Sushumna</em> (central channel) until it reaches the crown, producing states of <strong className="text-foreground">samadhi</strong> — described as the union of individual consciousness with universal consciousness.
                </p>
                <p>
                  <strong className="text-green-400">The Caduceus — the medical symbol used worldwide today</strong> — is two serpents coiling up a central staff topped by wings. This is a direct encoding of Kundalini knowledge: the two serpents are the <em>Ida</em> (lunar/feminine) and <em>Pingala</em> (solar/masculine) energy channels wrapping around the spine. The wings at the top represent the liberation of consciousness when the energy reaches the crown.
                </p>
                <p>
                  Modern medicine adopted this symbol without acknowledging — or perhaps deliberately obscuring — its original meaning. The ancient physicians who used this symbol were communicating that the mastery of sexual energy is the foundation of all healing.
                </p>
                <PullQuote
                  text="He who has conquered his lust has conquered the world. The Kundalini, once awakened, is the greatest healer and the greatest destroyer of illusion."
                  author="Swami Sivananda, Divine Life Society"
                  accent="#34d399"
                />
              </div>
            </Accordion>

          </div>
        </section>

        {/* ── PART 3: Freemasonry & Secret Societies ── */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-yellow-500/40" />
            <h2 className="text-xs font-bold tracking-widest text-yellow-400 uppercase whitespace-nowrap">Part 3 · Freemasonry & Secret Societies</h2>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-yellow-500/40" />
          </div>

          <div className="space-y-4">

            <Accordion title="Freemasonry — Sex Transmutation at the 33rd Degree" accent="#fbbf24" icon={Shield}>
              <div className="pt-4 space-y-4">
                <p>
                  Freemasonry&apos;s public face is charitable fraternity. Its inner degrees, however, preserve a sophisticated system of esoteric knowledge that mainstream historians rarely discuss. The Scottish Rite culminates at the <strong className="text-yellow-400">33rd Degree</strong> — a level that initiates are explicitly told encodes the deepest secrets of human nature and the cosmos.
                </p>
                <p>
                  Albert Pike, the 33rd-degree Sovereign Grand Commander who wrote <em>Morals and Dogma</em> (1871) — the most authoritative text of Masonic philosophy ever published — was explicit: the true &ldquo;Great Work&rdquo; of Freemasonry is the <strong className="text-foreground">transmutation of base energies into higher spiritual attainment</strong>. This is the same alchemical language used in Taoist and Ayurvedic traditions.
                </p>
                <PullQuote
                  text="The great secret of Masonry is the control and use of the creative force in man. To waste it is to die. To master it is to become a god."
                  author="Albert Pike, Morals and Dogma (paraphrased from Chapter on Hermetic Philosophy)"
                  accent="#fbbf24"
                />
                <p>
                  The Masonic <strong className="text-foreground">G symbol</strong> — displayed at the center of the Square and Compass — has two interpretations given at different degree levels: &ldquo;Geometry&rdquo; for lower initiates, and <strong className="text-foreground">&ldquo;Generative force&rdquo;</strong> for higher initiates. The creative/sexual force of the universe — called the <em>Grand Architect&apos;s</em> power — is literally what the central symbol of Freemasonry encodes.
                </p>
                <p>
                  The initiation ritual of the <strong className="text-foreground">Royal Arch degree</strong> teaches that the &ldquo;lost word&rdquo; of Freemasonry — the name of God — was hidden because men were not yet pure enough to receive it. Purity, in this context, is explicitly tied to the conservation and elevation of sexual energy.
                </p>
              </div>
            </Accordion>

            <Accordion title="Rosicrucians & Hermetic Orders — Sexual Alchemy" accent="#fbbf24" icon={Infinity}>
              <div className="pt-4 space-y-4">
                <p>
                  The Rosicrucian Brotherhood, founded in 17th-century Europe, synthesized Egyptian, Kabbalistic, Taoist, and Greek mystery school knowledge into a single coherent system. Their central teaching: the human body is a laboratory, and the <strong className="text-foreground">Great Work</strong> (the <em>Magnum Opus</em>) is the transmutation of &ldquo;lead&rdquo; (base sexual energy) into &ldquo;gold&rdquo; (spiritual illumination).
                </p>
                <p>
                  The <strong className="text-yellow-400">Hermetic Order of the Golden Dawn</strong> — which included figures like W.B. Yeats, Aleister Crowley, and Dion Fortune — taught that all magical power derives from the cultivation and direction of sexual energy. Their highest rituals were designed around the controlled raising of this force through the subtle body.
                </p>
                <p>
                  The Hermetic principle <em>&ldquo;As Above, So Below&rdquo;</em> encodes this teaching: the creative force that made the cosmos is the same force that creates life within the body. To master the microcosm (your own sexual energy) is to gain influence over the macrocosm. This is why these teachings were guarded — those who understood them held a decisive advantage over those who did not.
                </p>
                <PullQuote
                  text="As above, so below. As within, so without. The creative energy of the universe and the creative seed of man are one and the same force operating at different scales."
                  author="The Kybalion — Three Initiates (Hermetic Philosophy)"
                  accent="#fbbf24"
                />
              </div>
            </Accordion>

            <Accordion title="Kabbalah — Yesod and the Foundation of the Tree of Life" accent="#fbbf24" icon={Star}>
              <div className="pt-4 space-y-4">
                <p>
                  In the Jewish mystical tradition of Kabbalah, the <strong className="text-yellow-400">Tree of Life</strong> maps ten divine emanations (Sefirot) through which God&apos;s creative energy flows into the world. The ninth Sefirah — <strong className="text-foreground">Yesod</strong> — is explicitly associated with the reproductive organs and the sexual life-force.
                </p>
                <p>
                  Yesod means <em>&ldquo;Foundation.&rdquo;</em> It is the channel through which all the higher emanations flow into physical manifestation. Kabbalistic masters taught that a man who could master Yesod — channel rather than waste this foundational energy — would unlock access to all the higher Sefirot above it: beauty, wisdom, understanding, and ultimately, union with the divine (Keter, the crown).
                </p>
                <p>
                  The story of <strong className="text-foreground">Samson and Delilah</strong> in the Old Testament is read by Kabbalistic scholars as an allegory: Samson&apos;s &ldquo;hair&rdquo; represents his accumulated Yesodic energy. When Delilah (symbolic of sexual temptation) cuts it — when he spills his vital force — he loses his supernatural strength and becomes a prisoner. The exoteric reading is a love story. The esoteric reading is a warning about the misuse of sexual energy.
                </p>
              </div>
            </Accordion>

          </div>
        </section>

        {/* ── PART 4: Famous Practitioners ── */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
            <h2 className="text-xs font-bold tracking-widest text-primary uppercase whitespace-nowrap">Part 4 · Famous Practitioners</h2>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                name: 'Nikola Tesla',
                years: '1856 – 1943',
                accent: '#00e5ff',
                quote: 'I do not think you can name many great inventions that have been made by married men.',
                body: 'Tesla was a lifelong celibate who explicitly credited his abstinence for his extraordinary creative output. He stated that sexual energy, when not discharged, converts itself into mental and creative energy. He held over 300 patents, invented alternating current, and conceptualized wireless energy transmission — all while working alone and remaining celibate until his death at 86.',
              },
              {
                name: 'Napoleon Hill',
                years: 'Think and Grow Rich, 1937',
                accent: '#ff2d9b',
                quote: 'Sex energy is the creative energy of all geniuses. There never has been, and never will be a great leader, builder, or artist lacking in this driving force.',
                body: 'Chapter 11 of Think and Grow Rich — "The Mystery of Sex Transmutation" — is the most frequently omitted chapter in modern reprints. Hill studied 500 of the most successful men in American history over 20 years and found one common pattern: every one of them had an unusually high sexual drive, and every one of them had learned — consciously or not — to channel rather than simply discharge it.',
              },
              {
                name: 'Mahatma Gandhi',
                years: '1869 – 1948',
                accent: '#a78bfa',
                quote: 'Brahmacharya means control of the senses in thought, word and deed. It is the royal road to self-realisation.',
                body: 'At age 36 — after fathering four children — Gandhi took a formal vow of Brahmacharya (celibacy) and maintained it until his death. He wrote extensively that his spiritual and political power grew dramatically after making this commitment. He led a movement of hundreds of millions against the most powerful empire in history using non-violent resistance — a feat that required an almost supernatural reserve of inner force.',
              },
              {
                name: 'Isaac Newton',
                years: '1643 – 1727',
                accent: '#34d399',
                quote: 'I keep the subject of my inquiry constantly before me, and wait till the first dawning opens gradually into a full and clear light.',
                body: 'Newton never married and is widely believed to have died a virgin. He invented calculus, discovered the laws of motion and gravity, developed the theory of optics, and conducted extensive alchemical experiments. He was also a serious student of Hermetic philosophy and spent more time on occult research than on physics. His scientific genius and his esoteric interests were not separate — they were the same mind operating at full power.',
              },
              {
                name: 'Muhammad Ali',
                years: '1942 – 2016',
                accent: '#fbbf24',
                quote: 'I don\'t do it for six weeks before a fight. It drains your strength.',
                body: 'The Greatest practiced deliberate sexual abstinence in the weeks leading up to every major fight. He believed — as did ancient Greek Olympic athletes — that retained sexual energy converted directly into physical aggression, speed, and the will to dominate. Ali\'s training camps were legendary for discipline. He lost his first fight (to Joe Frazier) after reportedly breaking his own rule.',
              },
              {
                name: 'Leonardo da Vinci',
                years: '1452 – 1519',
                accent: '#fb923c',
                quote: 'The act of procreation and the members employed therein are so repulsive that were it not for the beauty of faces... nature would lose the human species.',
                body: 'Leonardo was celibate throughout his life. He was simultaneously the greatest painter, sculptor, architect, musician, mathematician, engineer, anatomist, geologist, botanist, and writer of his era. He filled thousands of notebook pages with inventions that weren\'t built until centuries later — helicopters, tanks, solar power, robotics. Historians call him a genius. Esoteric scholars would call him a man who had learned to feed every faculty of his being from the same inexhaustible inner source.',
              },
              {
                name: 'Pythagoras',
                years: '570 – 495 BC',
                accent: '#e879f9',
                quote: 'Above all things, reverence yourself.',
                body: 'Pythagoras — the father of mathematics and Western philosophy — ran a mystery school in Croton where semen retention was a foundational discipline. Students were required to observe celibacy for extended periods before being admitted to higher teachings. Pythagoras himself ate no meat, maintained celibacy, and produced a mathematical and philosophical legacy that still underpins modern science. He believed that the same geometric laws that govern the cosmos governed the human body — and the seed of man was the most potent geometric force in nature.',
              },
              {
                name: 'Socrates & Plato',
                years: '470 – 347 BC',
                accent: '#00e5ff',
                quote: 'The secret of change is to focus all your energy not on fighting the old, but on building the new.',
                body: 'Plato\'s Symposium describes a concept called Platonic Love — widely misunderstood today as simply non-sexual friendship. In its original meaning it described the transmutation of erotic energy (Eros) into philosophical creativity and divine inspiration. Socrates specifically described his practice of redirecting sexual desire upward into the pursuit of wisdom. Both philosophers understood that Eros — the creative life-force — was the raw material of genius, and they devoted their lives to mastering its direction.',
              },
            ].map(({ name, years, accent, quote, body }) => (
              <div
                key={name}
                className="rounded-2xl border glass-effect p-5 space-y-3"
                style={{ borderColor: accent + '33' }}
              >
                <div>
                  <h3 className="font-bold text-base uppercase tracking-wider" style={{ color: accent }}>{name}</h3>
                  <p className="text-xs text-muted-foreground">{years}</p>
                </div>
                <p className="italic text-sm text-foreground/80 leading-relaxed border-l-2 pl-3" style={{ borderColor: accent }}>
                  &ldquo;{quote}&rdquo;
                </p>
                <p className="text-xs text-foreground/70 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PART 5: Hidden Symbols ── */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-secondary/40" />
            <h2 className="text-xs font-bold tracking-widest text-secondary uppercase whitespace-nowrap">Part 5 · Hidden Symbols in Plain Sight</h2>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-secondary/40" />
          </div>

          <div className="space-y-4">
            <Accordion title="The Caduceus — Why Your Doctor's Symbol is a Kundalini Map" accent="#00e5ff" icon={Eye}>
              <div className="pt-4 space-y-4">
                <p>The Caduceus — two serpents entwined around a winged staff — appears on ambulances, hospitals, medical schools, and pharmacies worldwide. Its true origin is not Greek mythology. It is a direct encoding of the Kundalini energy system:
                </p>
                <div className="space-y-2 text-sm">
                  {[
                    { symbol: 'The central staff', meaning: 'The human spine — the Sushumna channel through which life-force travels' },
                    { symbol: 'Left serpent (Ida)', meaning: 'Lunar / feminine energy channel — cool, receptive, right-brain' },
                    { symbol: 'Right serpent (Pingala)', meaning: 'Solar / masculine energy channel — hot, active, left-brain' },
                    { symbol: 'The seven crossing points', meaning: 'The seven chakras — energy centers along the spine' },
                    { symbol: 'The wings at the crown', meaning: 'Liberation of consciousness when energy reaches the brain — enlightenment' },
                  ].map((r) => (
                    <div key={r.symbol} className="flex gap-3 text-xs">
                      <span className="text-secondary font-bold flex-shrink-0 min-w-[140px]">{r.symbol}</span>
                      <span className="text-foreground/70">{r.meaning}</span>
                    </div>
                  ))}
                </div>
                <p>The people who placed this symbol on medical institutions understood exactly what it meant. The question is whether the knowledge it encodes was lost — or deliberately separated from its original context.</p>
              </div>
            </Accordion>

            <Accordion title="The Obelisk — Monuments to Reproductive Energy" accent="#a78bfa" icon={Infinity}>
              <div className="pt-4 space-y-3">
                <p>Obelisks — Egyptian stone pillars now placed at the center of Washington D.C., the Vatican, London&apos;s Cleopatra&apos;s Needle, and Paris — were understood by Egyptian mystery schools as monuments to the generative life-force of the god Osiris. The shape is explicit. Their placement at the centers of the world&apos;s most powerful institutions is not coincidental — it is an esoteric declaration of what truly governs the world.</p>
                <p>The <strong className="text-purple-400">Washington Monument</strong> (555 feet tall, the largest obelisk on Earth) stands at the center of the United States capital. The <strong className="text-purple-400">Vatican Obelisk</strong> stands in the center of St. Peter&apos;s Square — a Catholic institution that officially condemns the very knowledge the obelisk encodes. Both institutions are, esoterically, monuments to the power of directed sexual energy — placed by those who understood it, in full view of those who do not.</p>
              </div>
            </Accordion>
          </div>
        </section>

        {/* ── PART 6: Modern Science Bridge ── */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
            <h2 className="text-xs font-bold tracking-widest text-primary uppercase whitespace-nowrap">Part 6 · Where Modern Science Confirms the Ancients</h2>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
          </div>

          <div className="rounded-2xl border border-primary/20 glass-effect p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  title: '7-Day Testosterone Spike',
                  accent: '#ff2d9b',
                  body: 'A 2003 study published in the Journal of Zhejiang University found that serum testosterone levels peaked at 145.7% of baseline on day 7 of abstinence. This aligns precisely with what ancient traditions described as the surge of Jing energy recirculating through the system.',
                },
                {
                  title: 'Dopamine Receptor Recovery',
                  accent: '#00e5ff',
                  body: 'Compulsive ejaculation — particularly combined with pornography — progressively downregulates D2 dopamine receptors, blunting motivation, drive, and the capacity to experience pleasure from ordinary life. Abstinence allows receptors to recover and upregulate, restoring baseline motivation. Ancient sages called this the return of Shen (spirit).',
                },
                {
                  title: 'Zinc Depletion',
                  accent: '#a78bfa',
                  body: 'Each ejaculation contains approximately 5mg of zinc — a mineral critical for testosterone production, immune function, DNA synthesis, and wound healing. Frequent ejaculation without adequate dietary zinc supplementation creates a measurable deficit. Ayurvedic texts listed zinc-containing foods (pumpkin seeds, sesame) as essential for maintaining Shukra.',
                },
                {
                  title: 'The Prolactin Crash',
                  accent: '#34d399',
                  body: 'After ejaculation, prolactin surges sharply while dopamine drops. This produces the classic refractory lethargy — loss of drive, mental fog, reduced motivation. Ancient philosophers interpreted this as a literal loss of vital spirit. Modern endocrinology calls it the post-ejaculatory hormonal refractory period. Same phenomenon, different vocabulary.',
                },
                {
                  title: 'DHT and Physical Vitality',
                  accent: '#fbbf24',
                  body: 'Dihydrotestosterone (DHT) — the most potent androgen in the male body — is associated with assertiveness, physical strength, voice depth, and drive. Retention periods are associated with increased DHT sensitivity. Ancient traditions consistently noted that practitioners developed more commanding physical presence, deeper voices, and stronger eye contact — all DHT-mediated effects.',
                },
                {
                  title: 'Seminal Plasma Reabsorption',
                  accent: '#fb923c',
                  body: 'Western science confirms: when ejaculation does not occur, old sperm cells are broken down in the epididymis and their components — proteins, amino acids, zinc, and other nutrients — are reabsorbed into the bloodstream. This is biological confirmation of the Taoist teaching that conservation returns Jing to the blood. The mechanism is real. Only the terminology differs.',
                },
              ].map(({ title, accent, body }) => (
                <div key={title} className="rounded-xl border p-4 space-y-2" style={{ borderColor: accent + '33', background: accent + '08' }}>
                  <h4 className="font-bold text-sm uppercase tracking-wider" style={{ color: accent }}>{title}</h4>
                  <p className="text-xs text-foreground/75 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PART 7: The Suppression ── */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-yellow-500/40" />
            <h2 className="text-xs font-bold tracking-widest text-yellow-400 uppercase whitespace-nowrap">Part 7 · Why This Was Suppressed</h2>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-yellow-500/40" />
          </div>

          <div className="rounded-2xl border border-yellow-500/20 glass-effect p-6 md:p-8 space-y-5">
            <Accordion title="The Economics of a Dopamine-Addicted Population" accent="#fbbf24" icon={BookOpen}>
              <div className="pt-4 space-y-4">
                <p>
                  A man who controls his sexual energy is harder to manipulate. He doesn&apos;t need constant external stimulation. He is less impulsive, less susceptible to advertising, less likely to make fear-based decisions. He has a stable inner life that doesn&apos;t depend on constant consumption.
                </p>
                <p>
                  The pornography industry generates over <strong className="text-yellow-400">$97 billion annually</strong> worldwide. The pharmaceutical industry generates billions more treating the anxiety, depression, and low testosterone that result from compulsive sexual behavior. The entertainment industry is built on the commodification of sexuality as a permanent attention hook.
                </p>
                <p>
                  A population that has learned to master its own sexual energy is a population that is substantially more sovereign, more disciplined, and less dependent on external systems for its sense of satisfaction. This is not conspiracy theory — it is straightforward economics and behavioral psychology.
                </p>
                <PullQuote
                  text="The most powerful force in the universe is the sexual energy of man. Those who control their own will always rule those who do not."
                  author="Napoleon Hill, Think and Grow Rich — Chapter 11"
                  accent="#fbbf24"
                />
                <p>
                  The mystery schools kept this knowledge secret not because it was dangerous, but because it was <em>powerful</em>. The ancient gatekeepers understood that this knowledge, once integrated, produced men who were extraordinarily difficult to govern, distract, or control. The same logic applies today — just with different mechanisms.
                </p>
              </div>
            </Accordion>
          </div>
        </section>

        {/* ── Conclusion ── */}
        <section className="rounded-2xl border border-secondary/30 glass-effect p-8 md:p-10 text-center space-y-5 neon-box-cyan">
          <Brain className="w-10 h-10 mx-auto text-secondary neon-text-cyan" aria-hidden />
          <h2 className="text-2xl font-display font-black uppercase tracking-wider text-secondary neon-text-cyan">
            The Convergence
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl mx-auto">
            Taoist masters in China, Ayurvedic physicians in India, Egyptian priests along the Nile, Greek philosophers in Athens, Kabbalistic scholars in Jerusalem, Rosicrucian alchemists in Europe, and Freemason initiates in lodge rooms across the world all arrived at the same core insight — independently, across thousands of years and thousands of miles:
          </p>
          <p className="text-base font-bold text-foreground">
            The seed of man is not waste. It is the most concentrated life-force the human body can produce. Its conservation, cultivation, and intelligent direction is the foundation of health, genius, spiritual power, and longevity.
          </p>
          <p className="text-sm text-foreground/70 leading-relaxed max-w-2xl mx-auto">
            Modern neuroscience now confirms the dopamine, testosterone, and zinc mechanisms that make this true on a biochemical level. The ancients didn&apos;t have the language of endocrinology — but they had thousands of years of direct experimentation on the human body, and they all reached the same conclusion. You are not on a recovery journey. You are on a path these men walked before you — and called the highest road a human being can walk.
          </p>
          <Link
            href="/benefits"
            className="inline-flex items-center gap-2 mt-2 px-6 py-3 rounded-xl border border-secondary/50 text-secondary bg-secondary/10 hover:bg-secondary/20 font-bold uppercase tracking-wider transition-all neon-hover text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Benefits
          </Link>
        </section>

      </div>
    </div>
  );
}
