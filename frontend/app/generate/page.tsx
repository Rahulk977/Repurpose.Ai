'use client'
import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import { Youtube, Upload, FileText, Twitter, Linkedin, Instagram, BookOpen, Mail, Zap, ArrowRight, Check, X, Loader2, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { contentAPI } from '@/lib/api'
import DashboardLayout from '../dashboard/layout'
export const dynamic = 'force-dynamic'
const FORMATS = [
  { id: 'twitter',        label: 'Twitter Thread',   icon: Twitter,   color: '#1DA1F2' },
  { id: 'linkedin',       label: 'LinkedIn Post',     icon: Linkedin,  color: '#0A66C2' },
  { id: 'instagram',      label: 'Instagram Caption', icon: Instagram, color: '#E1306C' },
  { id: 'blog',           label: 'Blog Article',      icon: BookOpen,  color: '#10B981' },
  { id: 'email',          label: 'Email Newsletter',  icon: Mail,      color: '#F59E0B' },
  { id: 'youtube_shorts', label: 'YT Shorts Script',  icon: Youtube,   color: '#FF4444' },
]

export default function GeneratePage() {
  const router = useRouter()
  const params = useSearchParams()
  const [step, setStep] = useState<'input' | 'formats'>('input')
  const [inputType, setInputType] = useState<'youtube' | 'audio' | 'text'>(
    (params.get('type') as any) || 'text'
  )
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [textContent, setTextContent] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [selectedFormats, setSelectedFormats] = useState(FORMATS.map(f => f.id))
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) {
      setAudioFile(files[0])
      if (!title) setTitle(files[0].name.replace(/\.[^.]+$/, ''))
    }
  }, [title])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': [], 'video/mp4': [], 'video/webm': [], 'video/quicktime': [] },
    maxSize: 25 * 1024 * 1024,
    multiple: false,
    onDropRejected: files => toast.error(files[0]?.errors[0]?.message || 'Invalid file'),
  })

  const canProceed = () => {
    if (inputType === 'youtube') return /youtu(be\.com|\.be)/.test(youtubeUrl)
    if (inputType === 'audio') return !!audioFile
    if (inputType === 'text') return textContent.trim().length >= 30
    return false
  }

  const handleGenerate = async () => {
    if (!selectedFormats.length) return toast.error('Select at least one format')
    setLoading(true)
    const toastId = toast.loading('Generating your content... (30-90 seconds)')
    try {
      const fd = new FormData()
      fd.append('inputType', inputType)
      fd.append('title', title || `Content — ${new Date().toLocaleDateString()}`)
      fd.append('formats', JSON.stringify(selectedFormats))
      if (inputType === 'youtube') fd.append('youtubeUrl', youtubeUrl)
      else if (inputType === 'audio' && audioFile) fd.append('audio', audioFile)
      else if (inputType === 'text') fd.append('textContent', textContent)

      const { data } = await contentAPI.generate(fd)
      toast.dismiss(toastId)
      toast.success('Content generated! 🎉')
      router.push(`/history/${data.content._id}`)
    } catch (err: any) {
      toast.dismiss(toastId)
      if (err.response?.data?.upgrade) {
        toast.error('Monthly limit reached — please upgrade')
        router.push('/billing')
      } else {
        toast.error(err.response?.data?.message || 'Generation failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 640, margin: '0 auto' }} className="stagger">
        <div style={{ marginBottom: 28 }}>
          {/* <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 16 }}>
            <ChevronLeft size={15} /> Dashboard
          </Link> */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 600, marginBottom: 4 }}>New Generation</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Add source content, choose formats, and let AI do the rest</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
          {[{label: 'Source Content', step: 'input'}, {label: 'Output Formats', step: 'formats'}, {label: 'Generate', step: 'gen'}].map((s, i) => (
            <div key={s.step} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: (step === 'input' && i === 0) || (step === 'formats' && i >= 0) ? (i === 0 && step === 'formats' ? 'var(--accent)' : i === 1 && step === 'formats' ? 'var(--accent)' : 'rgba(245,158,11,0.2)') : 'var(--surface-raised)', color: (step === 'formats' && i <= 1) || (step === 'input' && i === 0) ? (step === 'input' && i === 0 ? 'var(--accent)' : '#0A0A0B') : 'var(--text-muted)', border: i === 0 && step === 'input' ? '1px solid var(--accent)' : 'none', transition: 'all 0.2s' }}>
                  {step === 'formats' && i === 0 ? <Check size={12} /> : i + 1}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: (step === 'input' && i === 0) || (step === 'formats' && i === 1) ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.label}</span>
              </div>
              {i < 2 && <div style={{ width: 32, height: 1, background: 'var(--border)', margin: '0 8px' }} />}
            </div>
          ))}
        </div>

        {step === 'input' && (
          <div className="card" style={{ padding: '28px' }}>
            {/* Title */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Content Title <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="My podcast episode on AI trends" className="input" />
            </div>

            {/* Input type */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 10 }}>Source Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[
                  { id: 'text',    icon: FileText, label: 'Text',    sub: 'Paste content' },
                  { id: 'youtube', icon: Youtube,  label: 'YouTube', sub: 'URL / transcript' },
                  { id: 'audio',   icon: Upload,   label: 'Audio',   sub: 'MP3, WAV, MP4' },
                ].map(t => (
                  <button key={t.id} onClick={() => setInputType(t.id as any)}
                    style={{ padding: '14px 10px', borderRadius: 10, border: inputType === t.id ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--border)', background: inputType === t.id ? 'var(--accent-dim)' : 'var(--surface-raised)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                    <t.icon size={20} color={inputType === t.id ? 'var(--accent)' : 'var(--text-secondary)'} style={{ margin: '0 auto 6px' }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: inputType === t.id ? 'var(--accent)' : 'var(--text-primary)' }}>{t.label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{t.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic input */}
            {inputType === 'youtube' && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>YouTube URL</label>
                <input type="url" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="input" />
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>We'll automatically fetch the video transcript</p>
              </div>
            )}

            {inputType === 'audio' && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Upload File</label>
                <div {...getRootProps()} style={{ border: `2px dashed ${isDragActive ? 'var(--accent)' : audioFile ? '#22C55E' : 'var(--border)'}`, borderRadius: 10, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', background: isDragActive ? 'var(--accent-dim)' : audioFile ? 'rgba(34,197,94,0.05)' : 'var(--surface-raised)', transition: 'all 0.2s' }}>
                  <input {...getInputProps()} />
                  {audioFile ? (
                    <div>
                      <div style={{ width: 40, height: 40, background: 'rgba(34,197,94,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                        <Check size={20} color="#22C55E" />
                      </div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 2 }}>{audioFile.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{(audioFile.size / 1024 / 1024).toFixed(1)} MB</p>
                      <button onClick={e => { e.stopPropagation(); setAudioFile(null) }} style={{ fontSize: 12, color: '#F87171', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <X size={12} /> Remove file
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload size={28} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 }}>Drop your file here, or click to browse</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>MP3, WAV, M4A, MP4, WebM · Max 25MB</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {inputType === 'text' && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Your Content</label>
                <textarea value={textContent} onChange={e => setTextContent(e.target.value)} placeholder="Paste your blog post, article, transcript, or any text content here. The more context you provide, the better the output..." className="textarea" rows={8} style={{ minHeight: 180 }} />
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>
                  {textContent.split(/\s+/).filter(Boolean).length} words · minimum 30 characters required
                </p>
              </div>
            )}

            <button onClick={() => setStep('formats')} disabled={!canProceed()} className="btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center', opacity: canProceed() ? 1 : 0.4 }}>
              Choose Output Formats <ArrowRight size={15} />
            </button>
          </div>
        )}

        {step === 'formats' && (
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                Select output formats ({selectedFormats.length} selected)
              </label>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setSelectedFormats(FORMATS.map(f => f.id))} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>All</button>
                <button onClick={() => setSelectedFormats([])} style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>None</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 24 }}>
              {FORMATS.map(fmt => {
                const sel = selectedFormats.includes(fmt.id)
                return (
                  <button key={fmt.id} onClick={() => setSelectedFormats(prev => sel ? prev.filter(f => f !== fmt.id) : [...prev, fmt.id])}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, border: sel ? `1px solid ${fmt.color}40` : '1px solid var(--border)', background: sel ? `${fmt.color}10` : 'var(--surface-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                    <div style={{ width: 34, height: 34, background: `${fmt.color}18`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <fmt.icon size={16} color={fmt.color} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, flex: 1, color: sel ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{fmt.label}</span>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: sel ? 'none' : '1px solid var(--border)', background: sel ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                      {sel && <Check size={11} color="#0A0A0B" />}
                    </div>
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep('input')} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                <ChevronLeft size={15} /> Back
              </button>
              <button onClick={handleGenerate} disabled={loading || !selectedFormats.length} className="btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '12px' }}>
                {loading ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating...</> : <><Zap size={15} /> Generate {selectedFormats.length} Format{selectedFormats.length !== 1 ? 's' : ''}</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
