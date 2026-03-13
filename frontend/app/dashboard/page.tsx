'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { PlusSquare, Twitter, Linkedin, Instagram, BookOpen, Mail, Youtube, ArrowRight, Zap, TrendingUp, Clock, Sparkles } from 'lucide-react'
import { authAPI, contentAPI, subscriptionAPI } from '@/lib/api'
import DashboardLayout from './layout'

const FMT: Record<string, { icon: any; color: string; bg: string }> = {
  twitter:       { icon: Twitter,   color: '#1DA1F2', bg: 'rgba(29,161,242,0.12)'  },
  linkedin:      { icon: Linkedin,  color: '#0A66C2', bg: 'rgba(10,102,194,0.12)'  },
  instagram:     { icon: Instagram, color: '#E1306C', bg: 'rgba(225,48,108,0.12)'   },
  blog:          { icon: BookOpen,  color: '#10B981', bg: 'rgba(16,185,129,0.12)'  },
  email:         { icon: Mail,      color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
  youtube_shorts:{ icon: Youtube,   color: '#FF4444', bg: 'rgba(255,68,68,0.1)'     },
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      authAPI.getMe(),
      contentAPI.getHistory({ limit: 5 }),
      contentAPI.getStats(),
    ])
      .then(([u, h, s]) => {
        setUser(u.data.user)
        setHistory(h.data.contents)
        setStats(s.data.stats)
      })
      .finally(() => setLoading(false))
  }, [])

  // if (loading) return (
  //   <DashboardLayout>
  //     <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
  //       <div style={{ width: 32, height: 32, border: '2px solid rgba(245,158,11,0.2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  //     </div>
  //   </DashboardLayout>
  // )

  const plan = user?.subscription?.plan || 'free'
  const isUnlimited = user?.remainingGenerations === -1

  return (
    // <DashboardLayout>
      <div style={{ maxWidth: 640, margin: '0 auto'}} className="stagger">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 600, marginBottom: 4 }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>What content will you repurpose today?</p>
          </div>
          <Link href="/generate" className="btn-primary">
            <PlusSquare size={15} /> New Content
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 32 }}>
          {[
            { label: 'This Month',      value: stats?.thisMonth ?? 0,             sub: 'generations',      icon: Zap,       iconColor: 'var(--accent)' },
            { label: 'Remaining',       value: isUnlimited ? '∞' : (user?.remainingGenerations ?? 0), sub: plan === 'free' ? 'of 3 free' : 'unlimited', icon: Sparkles,  iconColor: '#22C55E' },
            { label: 'All Time',        value: stats?.totalGenerations ?? 0,      sub: 'total pieces',     icon: TrendingUp,iconColor: '#818CF8' },
            { label: 'Active Since',    value: user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : '—', sub: 'member',     icon: Clock,     iconColor: '#F472B6' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
                <s.icon size={15} color={s.iconColor} />
              </div>
              <p style={{ fontSize: '1.7rem', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Free upgrade nudge */}
        {plan === 'free' && (
          <div style={{ background: 'var(--accent-dim)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ fontWeight: 600, marginBottom: 2, fontSize: '0.9rem' }}>Unlock unlimited generations</p>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Pro plan: $19/mo · YouTube + audio input · unlimited content</p>
            </div>
            <Link href="/billing" className="btn-primary" style={{ padding: '8px 18px', fontSize: 13, flexShrink: 0 }}>
              Upgrade Now <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* Quick start */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Quick Start</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
            {[
              { title: 'YouTube URL',  desc: 'Paste a video link to transcribe', href: '/generate?type=youtube', icon: Youtube,   color: '#FF4444', bg: 'rgba(255,68,68,0.1)' },
              { title: 'Audio Upload', desc: 'Upload MP3, WAV, or video file',   href: '/generate?type=audio',   icon: Zap,       color: 'var(--accent)', bg: 'var(--accent-dim)' },
              { title: 'Paste Text',   desc: 'Blog post or article content',     href: '/generate?type=text',    icon: BookOpen,  color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
            ].map(a => (
              <Link key={a.title} href={a.href} className="card" style={{ padding: '18px', display: 'flex', gap: 14, textDecoration: 'none', cursor: 'pointer' }}>
                <div style={{ width: 40, height: 40, background: a.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <a.icon size={19} color={a.color} />
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 3 }}>{a.title}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent generations */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Generations</h2>
            <Link href="/history" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              View all →
            </Link>
          </div>

          {history.length === 0 ? (
            <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
              <Sparkles size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 600, marginBottom: 6 }}>No content yet</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>Generate your first repurposed content in seconds</p>
              <Link href="/generate" className="btn-primary">
                <PlusSquare size={14} /> Start Generating
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.map(item => (
                <Link key={item._id} href={`/history/${item._id}`} className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', cursor: 'pointer' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                    <div style={{ display: 'flex', gap: 10, marginTop: 3 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{item.inputType}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>·</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(item.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {item.generatedContent?.slice(0, 5).map((c: any) => {
                      const f = FMT[c.type]
                      if (!f) return null
                      return (
                        <div key={c.type} style={{ width: 26, height: 26, background: f.bg, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <f.icon size={13} color={f.color} />
                        </div>
                      )
                    })}
                  </div>
                  <ArrowRight size={15} color="var(--text-muted)" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    // </DashboardLayout>
  )
}
