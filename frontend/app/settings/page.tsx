'use client'
import { useState, useEffect } from 'react'
import { Save, Loader2, User, Bell, Sliders, Shield } from 'lucide-react'
import { authAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import DashboardLayout from '../dashboard/layout'
import { format } from 'date-fns'

const ALL_FORMATS = [
  { id: 'twitter', label: 'Twitter/X Thread' },
  { id: 'linkedin', label: 'LinkedIn Post' },
  { id: 'instagram', label: 'Instagram Caption' },
  { id: 'blog', label: 'Blog Article' },
  { id: 'email', label: 'Email Newsletter' },
  { id: 'youtube_shorts', label: 'YouTube Shorts Script' },
]

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({ name: '', emailNotifications: true, defaultFormats: [] as string[] })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  useEffect(() => {
    authAPI.getMe().then(r => {
      const u = r.data.user
      setUser(u)
      setForm({ name: u.name, emailNotifications: u.settings.emailNotifications, defaultFormats: u.settings.defaultFormats || ALL_FORMATS.map(f => f.id) })
    }).finally(() => setLoading(false))
  }, [])

  const toggleFormat = (id: string) => {
    setForm(p => ({
      ...p,
      defaultFormats: p.defaultFormats.includes(id) ? p.defaultFormats.filter(f => f !== id) : [...p.defaultFormats, id],
    }))
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      await authAPI.updateSettings(form)
      toast.success('Settings saved!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match')
    if (pwForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters')
    setSavingPw(true)
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password changed!')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSavingPw(false) }
  }

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div style={{ width: 28, height: 28, border: '2px solid rgba(245,158,11,0.2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    </DashboardLayout>
  )

  const Section = ({ icon: Icon, title, children }: any) => (
    <div className="card" style={{ padding: '24px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
        <Icon size={16} color="var(--accent)" />
        <h2 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{title}</h2>
      </div>
      {children}
    </div>
  )

  return (
    <DashboardLayout>
      <div style={{maxWidth: 640, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, marginBottom: 4 }}>Settings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Manage your account preferences</p>
        </div>

        <Section icon={User} title="Profile">
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Display Name</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Email Address</label>
            <input type="email" value={user?.email || ''} disabled className="input" style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Email cannot be changed</p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Member Since</label>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : '—'}</p>
          </div>
        </Section>

        <Section icon={Bell} title="Notifications">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: 2 }}>Email Notifications</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Receive updates about usage and new features</p>
            </div>
            <button onClick={() => setForm(p => ({ ...p, emailNotifications: !p.emailNotifications }))}
              style={{ width: 42, height: 24, borderRadius: 12, background: form.emailNotifications ? 'var(--accent)' : 'var(--surface-overlay)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
              <div style={{ width: 18, height: 18, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, left: form.emailNotifications ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
            </button>
          </div>
        </Section>

        <Section icon={Sliders} title="Default Output Formats">
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>Pre-selected formats when creating new content</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
            {ALL_FORMATS.map(fmt => {
              const sel = form.defaultFormats.includes(fmt.id)
              return (
                <button key={fmt.id} onClick={() => toggleFormat(fmt.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, border: sel ? '1px solid rgba(245,158,11,0.3)' : '1px solid var(--border)', background: sel ? 'var(--accent-dim)' : 'var(--surface-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: sel ? 'none' : '1px solid var(--border)', background: sel ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {sel && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#0A0A0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: sel ? 'var(--accent)' : 'var(--text-secondary)' }}>{fmt.label}</span>
                </button>
              )
            })}
          </div>
        </Section>

        <div style={{ marginBottom: 16 }}>
          <button onClick={saveSettings} disabled={saving} className="btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center', fontSize: '0.95rem' }}>
            {saving ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</> : <><Save size={15} /> Save Settings</>}
          </button>
        </div>

        <Section icon={Shield} title="Security">
          <form onSubmit={changePw}>
            {[
              { id: 'currentPassword', label: 'Current Password', val: pwForm.currentPassword, onChange: (v: string) => setPwForm(p => ({ ...p, currentPassword: v })) },
              { id: 'newPassword', label: 'New Password', val: pwForm.newPassword, onChange: (v: string) => setPwForm(p => ({ ...p, newPassword: v })) },
              { id: 'confirm', label: 'Confirm New Password', val: pwForm.confirm, onChange: (v: string) => setPwForm(p => ({ ...p, confirm: v })) },
            ].map(f => (
              <div key={f.id} style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>{f.label}</label>
                <input type="password" value={f.val} onChange={e => f.onChange(e.target.value)} className="input" required minLength={f.id !== 'currentPassword' ? 8 : 1} />
              </div>
            ))}
            <button type="submit" disabled={savingPw} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {savingPw ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Changing...</> : 'Change Password'}
            </button>
          </form>
        </Section>
      </div>
    </DashboardLayout>
  )
}
