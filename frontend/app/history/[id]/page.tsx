'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Twitter, Linkedin, Instagram, BookOpen, Mail, Youtube, Copy, Edit2, RefreshCw, Check, ChevronLeft, Loader2, Save, X } from 'lucide-react'
import { contentAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import DashboardLayout from '../../dashboard/layout'

const FMT: Record<string, { icon: any; label: string; color: string; bg: string; border: string }> = {
  twitter:       { icon: Twitter,   label: 'Twitter/X Thread',     color: '#1DA1F2', bg: 'rgba(29,161,242,0.07)',  border: 'rgba(29,161,242,0.2)'  },
  linkedin:      { icon: Linkedin,  label: 'LinkedIn Post',         color: '#0A66C2', bg: 'rgba(10,102,194,0.07)',  border: 'rgba(10,102,194,0.2)'  },
  instagram:     { icon: Instagram, label: 'Instagram Caption',     color: '#E1306C', bg: 'rgba(225,48,108,0.07)',  border: 'rgba(225,48,108,0.2)'   },
  blog:          { icon: BookOpen,  label: 'Blog Article',          color: '#10B981', bg: 'rgba(16,185,129,0.07)',  border: 'rgba(16,185,129,0.2)'  },
  email:         { icon: Mail,      label: 'Email Newsletter',      color: '#F59E0B', bg: 'rgba(245,158,11,0.07)',  border: 'rgba(245,158,11,0.2)'  },
  youtube_shorts:{ icon: Youtube,   label: 'YouTube Shorts Script', color: '#FF4444', bg: 'rgba(255,68,68,0.06)',   border: 'rgba(255,68,68,0.2)'   },
}

function ContentCard({ item, contentId, onUpdate }: { item: any; contentId: string; onUpdate: (type: string, content: string) => void }) {
  const cfg = FMT[item.type]
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(item.content)
  const [copying, setCopying] = useState(false)
  const [saving, setSaving] = useState(false)
  const [regen, setRegen] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(item.content)
    setCopying(true); setTimeout(() => setCopying(false), 2000)
    toast.success('Copied!')
  }

  const save = async () => {
    setSaving(true)
    try {
      await contentAPI.update(contentId, { contentType: item.type, newContent: editVal })
      onUpdate(item.type, editVal)
      setEditing(false)
      toast.success('Saved')
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  const regenerate = async () => {
    setRegen(true)
    try {
      const { data } = await contentAPI.regenerate(contentId, item.type)
      const updated = data.content.generatedContent.find((c: any) => c.type === item.type)
      if (updated) { onUpdate(item.type, updated.content); setEditVal(updated.content) }
      toast.success('Regenerated!')
    } catch (err: any) {
      if (err.response?.data?.upgrade) toast.error('Upgrade to regenerate')
      else toast.error('Regeneration failed')
    }
    finally { setRegen(false) }
  }

  if (!cfg) return null

  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, padding: '18px 20px', transition: 'box-shadow 0.2s' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: `${cfg.color}18`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <cfg.icon size={16} color={cfg.color} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700 }}>{cfg.label}</p>
            {item.isEdited && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Edited</p>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {editing ? (
            <>
              <button onClick={() => { setEditing(false); setEditVal(item.content) }} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={13} />
              </button>
              <button onClick={save} disabled={saving} style={{ background: 'var(--accent)', color: '#0A0A0B', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                {saving ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Save size={12} />} Save
              </button>
            </>
          ) : (
            <>
              <button onClick={copy} style={{ background: copying ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: copying ? '#22C55E' : 'var(--text-secondary)', transition: 'all 0.15s' }} title="Copy">
                {copying ? <Check size={13} /> : <Copy size={13} />}
              </button>
              <button onClick={() => setEditing(true)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Edit">
                <Edit2 size={13} />
              </button>
              <button onClick={regenerate} disabled={regen} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Regenerate">
                {regen ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <RefreshCw size={13} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {editing ? (
        <textarea value={editVal} onChange={e => setEditVal(e.target.value)} autoFocus
          style={{ width: '100%', minHeight: 180, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px', fontSize: 13, lineHeight: 1.65, resize: 'vertical', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', outline: 'none' }}
        />
      ) : (
        <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto', opacity: 0.9 }}>
          {item.content}
        </div>
      )}

      {item.regenerationCount > 0 && !editing && (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>Regenerated {item.regenerationCount}×</p>
      )}
    </div>
  )
}

export default function ContentDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    contentAPI.getContent(id as string)
      .then(r => setContent(r.data.content))
      .catch(() => { toast.error('Not found'); router.push('/history') })
      .finally(() => setLoading(false))
  }, [id])

  const handleUpdate = (type: string, newContent: string) => {
    setContent((prev: any) => ({
      ...prev,
      generatedContent: prev.generatedContent.map((c: any) =>
        c.type === type ? { ...c, content: newContent, isEdited: true } : c
      ),
    }))
  }

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: 32, height: 32, border: '2px solid rgba(245,158,11,0.2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* <button onClick={() => router.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, padding: 0 }}>
          <ChevronLeft size={15} /> Back to History
        </button> */}

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, marginBottom: 6 }}>{content?.title}</h1>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 8px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{content?.inputType}</span>
            {content?.createdAt && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(content.createdAt), 'MMM d, yyyy · h:mm a')}</span>}
            {content?.metadata?.wordCount > 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{content.metadata.wordCount.toLocaleString()} words processed</span>}
            {content?.metadata?.processingTimeMs > 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{(content.metadata.processingTimeMs / 1000).toFixed(1)}s generation time</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(420px,1fr))', gap: 16 }}>
          {content?.generatedContent?.map((item: any) => (
            <ContentCard key={item.type} item={item} contentId={content._id} onUpdate={handleUpdate} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
