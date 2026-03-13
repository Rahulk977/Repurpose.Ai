'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Zap, Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI, saveToken } from '@/lib/api'

const pwStrength = (pw: string) => {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

export default function SignupPage() {
  const router = useRouter()
  const params = useSearchParams()
  const plan = params.get('plan')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const strength = pwStrength(form.password)
  const colors = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E']
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')
    setLoading(true)
    try {
      const { data } = await authAPI.signup(form)
      saveToken(data.token)
      toast.success('Account created! Welcome 🎉')
      router.push(plan ? `/billing?plan=${plan}` : '/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 28 }}>
            <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="#0A0A0B" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Repurpose<span style={{ color: 'var(--accent)' }}>.AI</span>
            </span>
          </Link>

          {plan && (
            <div style={{ background: 'var(--accent-dim)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <Check size={14} color="var(--accent)" />
              <span>You selected the <strong style={{ color: 'var(--accent)', textTransform: 'capitalize' }}>{plan} Plan</strong> — activate after signup</span>
            </div>
          )}

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 600, marginBottom: 6 }}>Create your account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>3 free generations included, no card needed</p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Full name</label>
              <input type="text" required autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" className="input" />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Email address</label>
              <input type="email" required autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="input" />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} required minLength={8}
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters" className="input" style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? colors[strength] : 'var(--border)', transition: 'background 0.2s' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: colors[strength] || 'var(--text-muted)', marginTop: 4 }}>{labels[strength]}</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.95rem', justifyContent: 'center' }}>
              {loading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(10,10,11,0.3)', borderTopColor: '#0A0A0B', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Creating account...</>
                : <>Create Account <ArrowRight size={15} /></>}
            </button>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16 }}>
              By signing up, you agree to our{' '}
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>Terms</a> and{' '}
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>Privacy Policy</a>
            </p>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
