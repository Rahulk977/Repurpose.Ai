'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  ArrowRight, Zap, Twitter, Linkedin, Instagram, BookOpen,
  Mail, Youtube, Check, Star, Play, Menu, X, Sparkles,
  Upload, FileText, ChevronRight
} from 'lucide-react'

const FORMATS = [
  { icon: Twitter,   label: 'Twitter Thread',    desc: '7-10 punchy tweets with hooks & CTAs',     color: '#1DA1F2', bg: 'rgba(29,161,242,0.1)'  },
  { icon: Linkedin,  label: 'LinkedIn Post',      desc: 'Thought-leadership with engagement hooks',  color: '#0A66C2', bg: 'rgba(10,102,194,0.1)'  },
  { icon: Instagram, label: 'Instagram Caption',  desc: 'Visual-first copy with 30 hashtags',        color: '#E1306C', bg: 'rgba(225,48,108,0.1)'   },
  { icon: BookOpen,  label: 'Blog Article',        desc: 'SEO-structured long-form in Markdown',     color: '#10B981', bg: 'rgba(16,185,129,0.1)'  },
  { icon: Mail,      label: 'Email Newsletter',   desc: 'Subject + body optimized for opens',        color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
  { icon: Youtube,   label: 'YT Shorts Script',   desc: '60-second script with visual direction',    color: '#FF0000', bg: 'rgba(255,0,0,0.08)'     },
]

const STEPS = [
  { num: '01', icon: Upload,    title: 'Add your source',  desc: 'Drop a YouTube URL, upload audio/video, or paste any text content.' },
  { num: '02', icon: Sparkles,  title: 'AI extracts value', desc: 'We transcribe, analyze, and identify the key insights in your content.' },
  { num: '03', icon: Zap,       title: 'Get 6 formats',    desc: 'Receive platform-optimized content for every channel in under 60 seconds.' },
]

const PLANS = [
  {
    id: 'free', name: 'Free', price: '$0', period: '/forever',
    features: ['3 generations / month', 'All 6 content formats', 'Text input', 'Copy & export'],
    cta: 'Start Free', href: '/signup', highlight: false,
  },
  {
    id: 'pro', name: 'Pro', price: '$19', period: '/month',
    badge: 'Most Popular',
    features: ['Unlimited generations', 'All 6 content formats', 'YouTube + Audio input', 'Edit & regenerate cards', 'Full history', 'Priority support'],
    cta: 'Start Pro', href: '/signup?plan=pro', highlight: true,
  },
  {
    id: 'creator', name: 'Creator', price: '$39', period: '/month',
    features: ['Everything in Pro', 'GPT-4 Turbo (best quality)', 'Priority AI processing', 'API access', 'Early feature access', 'Dedicated support'],
    cta: 'Go Creator', href: '/signup?plan=creator', highlight: false,
  },
]

const TESTIMONIALS = [
  {
    name: 'Sarah Johnson',
    role: 'YouTuber · 125K subscribers',
    avatar: 'SJ',
    avatarColor: '#6366F1',
    rating: 5,
    text: 'I used to spend my entire Sunday repurposing one video into posts for every platform. Now I paste the URL and everything is done in 60 seconds. This tool literally gave me my weekends back.',
  },
  {
    name: 'Marcus Chen',
    role: 'Podcast Host · The Growth Lab',
    avatar: 'MC',
    avatarColor: '#10B981',
    rating: 5,
    text: 'My LinkedIn engagement went up 340% in 3 weeks after I started using Repurpose.AI. The posts it generates are better than anything I could write myself. Absolutely insane ROI.',
  },
  {
    name: 'Priya Sharma',
    role: 'Content Marketer · SaaS Startup',
    avatar: 'PS',
    avatarColor: '#F59E0B',
    rating: 5,
    text: 'We manage content for 8 clients. Before this tool we needed a team of 4 writers. Now 2 of us handle everything. The quality is consistently high and formats are spot on for each platform.',
  },
  {
    name: 'Jake Williams',
    role: 'Business Coach · 50K followers',
    avatar: 'JW',
    avatarColor: '#EF4444',
    rating: 5,
    text: "The Twitter threads this generates are incredible. I've had multiple threads go viral that were created by this tool. My audience thinks I have a full content team — it's just me and this app.",
  },
  {
    name: 'Aisha Patel',
    role: 'Online Course Creator',
    avatar: 'AP',
    avatarColor: '#8B5CF6',
    rating: 5,
    text: "I record my course lessons and upload the audio. Within a minute I have a full email newsletter, blog post, and social posts ready to go. It's like having 5 assistants working 24/7.",
  },
  {
    name: 'Tom Richardson',
    role: 'Marketing Director · Agency',
    avatar: 'TR',
    avatarColor: '#06B6D4',
    rating: 5,
    text: "We tested 6 AI content tools before landing on Repurpose.AI. Nothing comes close to the quality of output, especially the blog articles and email newsletters. Our clients love the results.",
  },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text-primary)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Nav ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '0 1.5rem',
        background: scrolled ? 'rgba(10,10,11,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        transition: 'all 0.3s',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#0A0A0B" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Repurpose<span style={{ color: 'var(--accent)' }}>.AI</span>
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="hidden md:flex">
            {['Features', 'How It Works', 'Pricing'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.15s' }}
                onMouseEnter={e => (e.target as any).style.color = 'var(--text-primary)'}
                onMouseLeave={e => (e.target as any).style.color = 'var(--text-secondary)'}
              >{l}</a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="hidden md:flex">
            <Link href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, padding: '8px 16px', borderRadius: 8, transition: 'color 0.15s' }}>
              Log in
            </Link>
            <Link href="/signup" className="btn-primary" style={{ padding: '8px 20px', fontSize: 14 }}>
              Get Started Free <ArrowRight size={14} />
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 4 }}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, margin: '0 0 12px', padding: '1rem' }} className="md:hidden">
            {['Features', 'How It Works', 'Pricing'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '10px 8px', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14 }}>
                {l}
              </a>
            ))}
            <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
            <Link href="/signup" className="btn-primary" style={{ width: '100%', marginTop: 8 }}>Get Started Free</Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section style={{ padding: '140px 1.5rem 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }} className="stagger">
          {/* <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent-dim)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 100, padding: '6px 16px', marginBottom: 32 }}>
            <Sparkles size={13} color="var(--accent)" />
            <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>Powered by Groq AI & Whisper</span>
          </div> */}

          <h1 className="heading-xl" style={{ color: 'var(--text-primary)', marginBottom: 28 }}>
            One piece of content.<br />
            <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Six platforms.</em><br />
            Instantly.
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Drop a YouTube link, audio recording, or article — get Twitter threads, LinkedIn posts, Instagram captions, blog articles, emails, and YouTube Shorts scripts in under 60 seconds.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>
              Start For Free <ArrowRight size={16} />
            </Link>
            <a href="#how-it-works" className="btn-ghost" style={{ padding: '12px 24px', fontSize: 15 }}>
              <Play size={15} /> See how it works
            </a>
          </div>

          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
            No credit card required · 3 free generations included
          </p>
        </div>

        {/* Hero preview mockup */}
        <div style={{ maxWidth: 860, margin: '64px auto 0', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
          <div style={{ background: 'var(--surface-raised)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)' }}>
            {['#F87171','#FBBF24','#34D399'].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c, opacity: 0.7 }} />)}
            <span style={{ marginLeft: 12, fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>repurpose.ai/generate</span>
          </div>
          <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {FORMATS.map(f => (
              <div key={f.label} style={{ background: f.bg, border: `1px solid ${f.color}22`, borderRadius: 10, padding: '14px 16px' }}>
                <f.icon size={18} color={f.color} />
                <p style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{f.label}</p>
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[100, 80, 60].map(w => <div key={w} className="shimmer" style={{ height: 6, borderRadius: 3, width: `${w}%`, opacity: 0.4 }} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '100px 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>Output Formats</p>
            <h2 className="heading-display" style={{ fontSize: 'clamp(2rem,4vw,3rem)', color: 'var(--text-primary)', marginBottom: 16 }}>
              Everything your content calendar needs
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 520, margin: '0 auto' }}>
              Each format uses platform-specific prompts crafted by social media professionals.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }} className="stagger">
            {FORMATS.map(f => (
              <div key={f.label} className="card" style={{ padding: '24px', display: 'flex', gap: 16 }}>
                <div style={{ width: 44, height: 44, background: f.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <f.icon size={20} color={f.color} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, marginBottom: 4, fontSize: '0.95rem' }}>{f.label}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ padding: '100px 1.5rem', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>Process</p>
            <h2 className="heading-display" style={{ fontSize: 'clamp(2rem,4vw,3rem)', color: 'var(--text-primary)' }}>
              Three steps to publish-ready
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 40 }} className="stagger">
            {STEPS.map((s, i) => (
              <div key={s.num} style={{ position: 'relative' }}>
                {i < STEPS.length - 1 && (
                  <div style={{ position: 'absolute', top: 28, left: '65%', width: '70%', height: 1, background: 'linear-gradient(to right, rgba(245,158,11,0.4), transparent)' }} className="hidden md:block" />
                )}
                <div style={{ width: 56, height: 56, background: 'var(--accent-dim)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, position: 'relative' }}>
                  <s.icon size={24} color="var(--accent)" />
                  <span style={{ position: 'absolute', top: -8, right: -8, background: 'var(--accent)', color: '#0A0A0B', fontSize: 10, fontWeight: 800, borderRadius: 4, padding: '2px 5px', fontFamily: 'var(--font-mono)' }}>{s.num}</span>
                </div>
                <h3 style={{ fontWeight: 600, marginBottom: 8, fontSize: '1rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: '100px 1.5rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>Pricing</p>
            <h2 className="heading-display" style={{ fontSize: 'clamp(2rem,4vw,3rem)', color: 'var(--text-primary)', marginBottom: 12 }}>Simple, honest pricing</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Start free. Upgrade when you're ready.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, alignItems: 'start' }}>
            {PLANS.map(p => (
              <div key={p.id} style={{
                background: p.highlight ? 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, var(--surface) 100%)' : 'var(--surface)',
                border: p.highlight ? '1px solid rgba(245,158,11,0.3)' : '1px solid var(--border)',
                borderRadius: 16, padding: '32px 28px', position: 'relative',
                boxShadow: p.highlight ? '0 0 40px rgba(245,158,11,0.1)' : 'none',
              }}>
                {p.badge && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#0A0A0B', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 100, whiteSpace: 'nowrap' }}>{p.badge}</div>
                )}
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 6 }}>{p.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{p.price}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{p.period}</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <Check size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={p.href} className={p.highlight ? 'btn-primary' : 'btn-ghost'} style={{ width: '100%', justifyContent: 'center' }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: '100px 1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>
              Testimonials
            </p>
            <h2 className="heading-display" style={{ fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 12 }}>
              Loved by creators worldwide
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Join 2,400+ creators already saving 10+ hours per week
            </p>

            {/* Stats bar */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 36, flexWrap: 'wrap' }}>
              {[
                { number: '2,400+', label: 'Active Users' },
                { number: '180K+',  label: 'Pieces Generated' },
                { number: '4.9/5',  label: 'Average Rating' },
                { number: '10 hrs', label: 'Saved Per Week' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{s.number}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }} className="stagger">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Stars */}
                <div style={{ display: 'flex', gap: 3 }}>
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />
                  ))}
                </div>
                {/* Text */}
                <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-secondary)', flex: 1 }}>
                  "{t.text}"
                </p>
                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: t.avatarColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700 }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 1.5rem 120px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: 'var(--accent-dim)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 24, padding: '56px 40px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(245,158,11,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <Zap size={36} color="var(--accent)" style={{ marginBottom: 20 }} />
            <h2 className="heading-display" style={{ fontSize: '2rem', marginBottom: 16 }}>Ready to 10× your content output?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.7 }}>
              Join thousands of creators saving 10+ hours per week. No credit card needed to start.
            </p>
            <Link href="/signup" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              Create Free Account <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, background: 'var(--accent)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={13} color="#0A0A0B" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600 }}>Repurpose<span style={{ color: 'var(--accent)' }}>.AI</span></span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>© 2024 Repurpose.AI. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <a key={l} href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, transition: 'color 0.15s' }}
                onMouseEnter={e => (e.target as any).style.color = 'var(--text-primary)'}
                onMouseLeave={e => (e.target as any).style.color = 'var(--text-muted)'}
              >{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}