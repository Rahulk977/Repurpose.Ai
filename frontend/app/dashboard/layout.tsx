'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Zap, LayoutDashboard, PlusSquare, Clock, CreditCard, Settings, LogOut, Menu, X, ChevronRight, Sun, Moon } from 'lucide-react'
import { authAPI, clearToken, getToken } from '@/lib/api'
import { useTheme } from '@/components/ThemeProvider'

const NAV = [
  { href: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/generate',   label: 'New Content',  icon: PlusSquare },
  { href: '/history',    label: 'History',      icon: Clock },
  { href: '/billing',    label: 'Billing',      icon: CreditCard },
  { href: '/settings',   label: 'Settings',     icon: Settings },
]

const PLAN_STYLES: Record<string, string> = {
  free: 'badge-free',
  pro: 'badge-pro',
  creator: 'badge-creator',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const token = getToken()
    if (!token) { router.replace('/login'); return }
    authAPI.getMe()
      .then(r => setUser(r.data.user))
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false))
  }, [])

  const logout = () => { clearToken(); router.push('/') }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '2px solid rgba(245,158,11,0.2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  const plan = user?.subscription?.plan || 'free'

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={15} color="#0A0A0B" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Repurpose<span style={{ color: 'var(--accent)' }}>.AI</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ padding: '14px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 3, overflow: 'auto' }}>
        {NAV.map(item => (
          <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
            className={`sidebar-link ${pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)) ? 'active' : ''}`}>
            <item.icon size={17} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {(pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) && (
              <ChevronRight size={13} style={{ opacity: 0.6 }} />
            )}
          </Link>
        ))}
      </nav>

      {/* Usage bar for free users */}
      {plan === 'free' && (
        <div style={{ margin: '0 12px 12px', background: 'var(--accent-dim)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '12px 14px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Free Tier Usage</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{user?.usage?.generationsThisMonth ?? 0}/3</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 2, width: `${Math.min(100, ((user?.usage?.generationsThisMonth ?? 0) / 3) * 100)}%`, transition: 'width 0.4s' }} />
          </div>
          <Link href="/billing" style={{ display: 'block', marginTop: 10, fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Upgrade for unlimited →
          </Link>
        </div>
      )}

      {/* User + theme toggle + logout */}
      {user && (
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, var(--accent) 0%, #D97706 100%)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#0A0A0B', flexShrink: 0 }}>
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
              <span className={PLAN_STYLES[plan] || 'badge-free'} style={{ marginTop: 2 }}>
                {plan.toUpperCase()}
              </span>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: 'var(--text-muted)', transition: 'color 0.15s, background 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as any).style.color = 'var(--accent)'; (e.currentTarget as any).style.background = 'var(--accent-dim)' }}
              onMouseLeave={e => { (e.currentTarget as any).style.color = 'var(--text-muted)'; (e.currentTarget as any).style.background = 'none' }}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Logout */}
            <button onClick={logout}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: 'var(--text-muted)', transition: 'color 0.15s, background 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as any).style.color = '#F87171'; (e.currentTarget as any).style.background = 'rgba(248,113,113,0.1)' }}
              onMouseLeave={e => { (e.currentTarget as any).style.color = 'var(--text-muted)'; (e.currentTarget as any).style.background = 'none' }}
              title="Log out">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Desktop sidebar */}
      <div style={{ width: 232, background: 'var(--surface)', borderRight: '1px solid var(--border)', flexShrink: 0, display: 'flex', flexDirection: 'column' }} className="hidden md:flex">
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position: 'relative', width: 240, background: 'var(--surface)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Mobile header */}
        {/* <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', height: 52, borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }} className="md:hidden">
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 4 }}>
            <Menu size={20} />
          </button>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600 }}>
            Repurpose<span style={{ color: 'var(--accent)' }}>.AI</span>
          </span>
        </div> */}

        <main style={{ flex: 1, overflow: 'auto', padding: '28px 28px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}