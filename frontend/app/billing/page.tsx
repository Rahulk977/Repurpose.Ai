'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, Star, Crown, Zap, ExternalLink, Loader2 } from 'lucide-react'
import { subscriptionAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import DashboardLayout from '../dashboard/layout'
import { format } from 'date-fns'

const PLANS = [
  {
    id: 'free', name: 'Free', price: '$0', period: '/forever',
    icon: Zap, iconColor: 'var(--text-secondary)',
    features: ['3 generations / month', 'All 6 content formats', 'Text input', 'Copy & export'],
    highlight: false,
  },
  {
    id: 'pro', name: 'Pro', price: '$19', period: '/month',
    icon: Star, iconColor: '#818CF8',
    badge: 'Most Popular',
    features: ['Unlimited generations', 'All 6 content formats', 'YouTube + Audio input', 'Editable content cards', 'Full history', 'Priority support'],
    highlight: true,
  },
  {
    id: 'creator', name: 'Creator', price: '$39', period: '/month',
    icon: Crown, iconColor: 'var(--accent)',
    features: ['Everything in Pro', 'GPT-4 Turbo (best AI)', 'Priority processing', 'API access', 'Early feature access', 'Dedicated support'],
    highlight: false,
  },
]

export default function BillingPage() {
  const params = useSearchParams()
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    if (params.get('success')) toast.success('Subscription activated! 🎉')
    if (params.get('cancelled')) toast('Checkout cancelled', { icon: 'ℹ️' })
    loadStatus()
  }, [])

  const loadStatus = async () => {
    try {
      const { data } = await subscriptionAPI.getStatus()
      setStatus(data)
    } catch { toast.error('Failed to load billing info') }
    finally { setLoading(false) }
  }

  const upgrade = async (planId: string) => {
    if (planId === 'free') return
    setUpgrading(planId)
    try {
      const { data } = await subscriptionAPI.createCheckout(planId)
      window.location.href = data.url
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Checkout failed')
      setUpgrading(null)
    }
  }

  const openPortal = async () => {
    setPortalLoading(true)
    try {
      const { data } = await subscriptionAPI.createPortal()
      window.location.href = data.url
    } catch {
      toast.error('Failed to open billing portal')
      setPortalLoading(false)
    }
  }

  const currentPlan = status?.subscription?.plan || 'free'

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div style={{ width: 28, height: 28, border: '2px solid rgba(245,158,11,0.2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, marginBottom: 4 }}>Billing & Plans</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Manage your subscription and usage</p>
        </div>

        {/* Current plan summary */}
        <div className="card" style={{ padding: '20px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 6 }}>Current Plan</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, textTransform: 'capitalize' }}>{currentPlan}</span>
              {status?.subscription?.currentPeriodEnd && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Renews {format(new Date(status.subscription.currentPeriodEnd), 'MMM d, yyyy')}</span>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Usage this month</p>
            <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>
              {status?.usage?.generationsThisMonth ?? 0}
              {currentPlan === 'free' && <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.9rem' }}> / 3</span>}
              {currentPlan !== 'free' && <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.9rem' }}> generations</span>}
            </p>
          </div>
          {currentPlan !== 'free' && (
            <button onClick={openPortal} disabled={portalLoading} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>
              {portalLoading ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <ExternalLink size={14} />}
              Manage Subscription
            </button>
          )}
        </div>

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 16, alignItems: 'start' }}>
          {PLANS.map(plan => {
            const isCurrent = currentPlan === plan.id
            return (
              <div key={plan.id} style={{
                background: plan.highlight ? 'linear-gradient(145deg, rgba(245,158,11,0.07) 0%, var(--surface) 100%)' : 'var(--surface)',
                border: plan.highlight ? '1px solid rgba(245,158,11,0.25)' : isCurrent ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border)',
                borderRadius: 14, padding: '26px 24px', position: 'relative',
                boxShadow: plan.highlight ? '0 0 32px rgba(245,158,11,0.08)' : 'none',
              }}>
                {plan.badge && !isCurrent && (
                  <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#0A0A0B', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 100, whiteSpace: 'nowrap' }}>{plan.badge}</div>
                )}
                {isCurrent && (
                  <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: '#22C55E', color: '#0A0A0B', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 100, whiteSpace: 'nowrap' }}>Current Plan</div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <plan.icon size={18} color={plan.iconColor} />
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>{plan.name}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 20 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700 }}>{plan.price}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{plan.period}</span>
                </div>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 22 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <Check size={13} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button onClick={() => upgrade(plan.id)} disabled={isCurrent || upgrading === plan.id || plan.id === 'free'}
                  className={plan.highlight && !isCurrent ? 'btn-primary' : 'btn-ghost'}
                  style={{ width: '100%', justifyContent: 'center', opacity: (isCurrent || plan.id === 'free') ? 0.55 : 1, cursor: (isCurrent || plan.id === 'free') ? 'default' : 'pointer' }}>
                  {upgrading === plan.id ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Redirecting...</> :
                   isCurrent ? 'Current Plan' :
                   plan.id === 'free' ? 'Free Forever' :
                   `Upgrade to ${plan.name}`}
                </button>
              </div>
            )
          })}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
          Secured by Stripe · Cancel anytime · Prorated upgrades
        </p>
      </div>
    </DashboardLayout>
  )
}
