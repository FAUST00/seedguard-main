'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, PlayCircle } from 'lucide-react';

// ── Video library ─────────────────────────────────────────────────────────────
// To add more videos: append an object to this array.
// Fields: id (YouTube video ID), title, description, category.
const VIDEOS = [
  {
    id: 'LcV0CY6Xerw',
    title: 'Why Semen Retention Changes Everything',
    description:
      'A comprehensive overview of the core science and philosophy behind semen retention — covering how conserved sexual energy influences testosterone, mental clarity, and overall male vitality.',
    category: 'Science',
  },
  {
    id: 'TFm--2_RtM8',
    title: 'The Science of NoFap',
    description:
      'A deep dive into the neurological and hormonal research supporting a porn-free lifestyle. Explores dopamine receptor sensitivity, prefrontal cortex recovery, and what the peer-reviewed literature actually says.',
    category: 'Science',
  },
  {
    id: 'B7SrVqtbwNk',
    title: 'The Hidden Cost of Esoteric Knowledge',
    description:
      'Occaro Wisdom unpacks what secret societies and mystery schools understood about sexual energy that mainstream culture has deliberately kept hidden — and the price men pay for not knowing.',
    category: 'Esoteric',
  },
  {
    id: 'nsR6nq_wGE8',
    title: 'PMO Addiction: How Deep Does It Go?',
    description:
      'A clinical-style breakdown of pornography\'s grip on the brain and the measurable recovery milestones men experience during abstinence — from acute withdrawal to long-term neurological healing.',
    category: 'Science',
  },
  {
    id: 'L8hWx1wKhqs',
    title: 'The NoFap Dopamine Reset Explained',
    description:
      'Breaks down exactly how pornography hijacks the brain\'s reward circuitry and how abstinence gradually restores baseline dopamine sensitivity, motivation, and emotional regulation.',
    category: 'Psychology',
  },
  {
    id: 'Cz_vMThVXdM',
    title: 'The Porn Addiction Loop — and How to Break It',
    description:
      'A psychological breakdown of compulsive pornography use: how the habit forms, why willpower alone fails, and the evidence-based recovery pathway that actually works.',
    category: 'Psychology',
  },
  {
    id: '0HhqLdTUKP8',
    title: 'NoFap: The Uncomfortable Truth',
    description:
      'An honest look at the mental battles, identity shifts, and false relapses men face on the journey — cutting through the hype to explain what actually changes and what takes real work.',
    category: 'Psychology',
  },
  {
    id: 'C2GGtyI0JoI',
    title: 'The NoFap Benefits Timeline — Week by Week',
    description:
      'A practical week-by-week guide to what the brain and body experience during retention: from the initial detox discomfort through flatline, and into the sustained benefits beyond 30 days.',
    category: 'Benefits',
  },
  {
    id: '6NMjXIraUPY',
    title: 'Semen Retention Esoteric Secret',
    description:
      'Moss breaks down the hidden esoteric truth behind semen retention — why ancient traditions treated it as a sacred practice and how this forgotten knowledge directly applies to modern men seeking transformation.',
    category: 'Esoteric',
  },
  {
    id: 'z7o_vf0yl_g',
    title: 'Semen Retention & Magnetism: What Changes in You',
    description:
      'Examines the widely reported shifts in social presence, eye contact, and personal magnetism that long-term retainers describe — and what science and tradition say about why this happens.',
    category: 'Benefits',
  },
  {
    id: 'ksQmRbSyG8s',
    title: 'Real Talk: 90-Day NoFap Transformation',
    description:
      'First-person account of the physical, mental, and social changes that occurred over a full 90-day streak — from the brutal first week to the clarity and confidence that follow.',
    category: 'Motivation',
  },
  {
    id: 'qriz7css2_I',
    title: 'Overcoming Urges: Practical Strategies That Work',
    description:
      'Evidence-based tools for managing urges and preventing relapse — breathing techniques, urge surfing, environment design, and the mindset shifts that separate those who make it from those who don\'t.',
    category: 'Motivation',
  },
  {
    id: '0KqmvRtQV-E',
    title: 'Why Community & Accountability Multiply Your Results',
    description:
      'Examines how accountability partners, streak tracking, and peer support dramatically increase success rates — and why going alone is the single biggest mistake most men make.',
    category: 'Motivation',
  },
  {
    id: 'ioJJb0ujF_4',
    title: '33 Steps Up: Solomon\'s Temple & Sacred Knowledge',
    description:
      'Decode Scripture explores the esoteric symbolism of Solomon\'s Temple and Freemasonry\'s 33 degrees — revealing how the ancient architecture of sacred spaces encoded the path of inner mastery and sexual transmutation.',
    category: 'Esoteric',
  },
  {
    id: '_ITwQ5ShBLc',
    title: 'Discipline Over Desire: Building the Unbreakable Habit',
    description:
      'A practical framework for turning NoFap from a white-knuckle struggle into a sustainable lifestyle — covering routine stacking, environment design, and identity-based habit change.',
    category: 'Motivation',
  },
  {
    id: 'cevA-d7NyNg',
    title: 'Semen Retention: Ancient Wisdom Meets Modern Science',
    description:
      'Bridges thousands of years of esoteric tradition — Taoism, Ayurveda, Kundalini — with contemporary neuroscience to show why multiple ancient cultures independently arrived at the same conclusion.',
    category: 'Esoteric',
  },
  {
    id: 'l7ImtskJx8c',
    title: 'The Hidden Power of Sexual Energy',
    description:
      'Explores ancient traditions around transmuting sexual energy into creative, spiritual, and intellectual force — from Taoist inner alchemy to Nikola Tesla\'s reported practices of celibacy.',
    category: 'Esoteric',
  },
] as const;

type Category = 'All' | 'Science' | 'Benefits' | 'Psychology' | 'Motivation' | 'Esoteric';

const CATEGORIES: Category[] = ['All', 'Science', 'Benefits', 'Psychology', 'Motivation', 'Esoteric'];

const CATEGORY_STYLE: Record<Category, string> = {
  All:        'border-primary/50 bg-primary/15 text-primary',
  Science:    'border-secondary/50 bg-secondary/15 text-secondary',
  Benefits:   'border-accent/50 bg-accent/15 text-accent',
  Psychology: 'border-[#c084fc]/50 bg-[#c084fc]/15 text-[#c084fc]',
  Motivation: 'border-gold/50 bg-gold/15 text-gold',
  Esoteric:   'border-[#a78bfa]/50 bg-[#a78bfa]/15 text-[#a78bfa]',
};

const INACTIVE = 'border-muted/30 bg-muted/10 text-muted-foreground hover:border-muted/50 hover:text-foreground';

export default function VideosPage() {
  const [active, setActive] = useState<Category>('All');

  const filtered = active === 'All'
    ? VIDEOS
    : VIDEOS.filter((v) => v.category === active);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative text-center py-16 px-6 pb-12 border-b border-primary/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-transparent to-transparent pointer-events-none" aria-hidden />

        {/* Back link */}
        <div className="absolute top-6 left-6">
          <Link
            href="/benefits"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
            Benefits
          </Link>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-1 mb-5">
          <PlayCircle className="w-3.5 h-3.5 text-gold" aria-hidden />
          <span className="text-xs font-bold tracking-widest text-gold uppercase">Resource Library</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-display font-black italic tracking-tight mb-4 neon-text-cyan text-secondary">
          VIDEO LIBRARY
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Curated videos covering the science, psychology, and real-world transformations behind semen retention and NoFap.
        </p>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 pb-24 pt-10 space-y-8">

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all ${
                active === cat ? CATEGORY_STYLE[cat] : INACTIVE
              }`}
            >
              {cat}
              {cat === 'All' && (
                <span className="ml-1.5 opacity-60">({VIDEOS.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Video count */}
        <p className="text-center text-xs text-muted-foreground/50 uppercase tracking-widest">
          Showing {filtered.length} video{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Video grid — 3 columns on large screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((video) => (
            <div
              key={video.id}
              className="rounded-2xl border border-primary/20 bg-background/50 backdrop-blur-sm overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group flex flex-col"
            >
              {/* Embed */}
              <div className="aspect-video w-full flex-shrink-0">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&modestbranding=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  className="w-full h-full"
                />
              </div>

              {/* Info */}
              <div className="p-4 space-y-2 flex flex-col flex-1">
                {/* Category tag */}
                <span className={`self-start inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${CATEGORY_STYLE[video.category as Category]}`}>
                  {video.category}
                </span>

                {/* Title */}
                <h2 className="font-display font-bold text-sm md:text-base text-foreground leading-snug group-hover:text-primary transition-colors">
                  {video.title}
                </h2>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                  {video.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="text-center pt-4 border-t border-primary/10">
          <p className="text-xs text-muted-foreground/40 uppercase tracking-widest">
            + More videos added regularly
          </p>
        </div>

      </div>
    </div>
  );
}
