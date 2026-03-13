'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Twitter, Linkedin, Instagram, BookOpen, Mail, Youtube, ArrowRight, Trash2, PlusSquare, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { contentAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import DashboardLayout from '../dashboard/layout'

const FMT: Record<string, { icon: any; color: string; bg: string }> = {
  twitter:       { icon: Twitter,   color: '#1DA1F2', bg: 'rgba(29,161,242,0.12)'  },
  linkedin:      { icon: Linkedin,  color: '#0A66C2', bg: 'rgba(10,102,194,0.12)'  },
  instagram:     { icon: Instagram, color: '#E1306C', bg: 'rgba(225,48,108,0.12)'   },
  blog:          { icon: BookOpen,  color: '#10B981', bg: 'rgba(16,185,129,0.12)'  },
  email:         { icon: Mail,      color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
  youtube_shorts:{ icon: Youtube,   color: '#FF4444', bg: 'rgba(255,68,68,0.1)'     },
}

export default function HistoryPage() {
  const [items, setItems] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [page])

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await contentAPI.getHistory({ page, limit: 12, search: search || undefined })
      setItems(data.contents)
      setPagination(data.pagination)
    } catch { toast.error('Failed to load history') }
    finally { setLoading(false) }
  }

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load() }

  const handleDelete = async (id: string, ev: React.MouseEvent) => {
    ev.preventDefault()
    if (!confirm('Delete this item?')) return
    try {
      await contentAPI.delete(id)
      setItems(p => p.filter(i => i._id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 640, margin: '0 auto'}}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, marginBottom: 3 }}>History</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{pagination?.total ?? 0} total generations</p>
          </div>
          <Link href="/generate" className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
            <PlusSquare size={14} /> New
          </Link>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: 20 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search by title..." value={search} onChange={e => setSearch(e.target.value)} className="input" style={{ paddingLeft: 36 }} />
        </form>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 28, height: 28, border: '2px solid rgba(245,158,11,0.2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : items.length === 0 ? (
          <div className="card" style={{ padding: '56px', textAlign: 'center' }}>
            <p style={{ fontWeight: 600, marginBottom: 6 }}>No generations found</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              {search ? 'Try a different search term' : 'Create your first content repurposing session'}
            </p>
            {!search && <Link href="/generate" className="btn-primary"><PlusSquare size={14} /> Generate Content</Link>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map(item => (
              <Link key={item._id} href={`/history/${item._id}`} className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', cursor: 'pointer' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{item.title}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{item.inputType}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{format(new Date(item.createdAt), 'MMM d, yyyy · h:mm a')}</span>
                    {item.metadata?.wordCount > 0 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.metadata.wordCount.toLocaleString()} words</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                  {item.generatedContent?.map((c: any) => {
                    const f = FMT[c.type]; if (!f) return null
                    return (
                      <div key={c.type} style={{ width: 24, height: 24, background: f.bg, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <f.icon size={12} color={f.color} />
                      </div>
                    )
                  })}
                </div>
                <button onClick={e => handleDelete(item._id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: 'var(--text-muted)', flexShrink: 0, transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as any).style.color = '#F87171'}
                  onMouseLeave={e => (e.currentTarget as any).style.color = 'var(--text-muted)'}>
                  <Trash2 size={14} />
                </button>
                <ArrowRight size={14} color="var(--text-muted)" />
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 }}>
            <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrev} className="btn-ghost" style={{ padding: '7px 12px' }}>
              <ChevronLeft size={15} />
            </button>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Page {page} of {pagination.pages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext} className="btn-ghost" style={{ padding: '7px 12px' }}>
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
