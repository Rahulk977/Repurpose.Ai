import axios from 'axios'
import Cookies from 'js-cookie'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: BASE,
  timeout: 180_000, // 3 min for long AI ops
  headers: { 'Content-Type': 'application/json' },
})

// ── Attach token ──────────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = Cookies.get('rp_token') ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('rp_token') : null)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Handle 401 ────────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove('rp_token')
      if (typeof localStorage !== 'undefined') localStorage.removeItem('rp_token')
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=true'
      }
    }
    return Promise.reject(err)
  }
)

// ── API modules ───────────────────────────────────────────────────────────────
export const authAPI = {
  signup:         (d: { name: string; email: string; password: string }) => api.post('/auth/signup', d),
  login:          (d: { email: string; password: string })               => api.post('/auth/login', d),
  getMe:          ()                                                      => api.get('/auth/me'),
  updateSettings: (d: any)                                               => api.put('/auth/settings', d),
  changePassword: (d: { currentPassword: string; newPassword: string }) => api.put('/auth/password', d),
}

export const contentAPI = {
  generate:    (fd: FormData)                                    => api.post('/content/generate', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getHistory:  (params?: Record<string, any>)                    => api.get('/content/history', { params }),
  getStats:    ()                                                 => api.get('/content/stats'),
  getContent:  (id: string)                                      => api.get(`/content/${id}`),
  update:      (id: string, d: { contentType: string; newContent: string }) => api.put(`/content/${id}`, d),
  regenerate:  (id: string, contentType: string)                 => api.post(`/content/${id}/regenerate`, { contentType }),
  delete:      (id: string)                                      => api.delete(`/content/${id}`),
}

export const subscriptionAPI = {
  getStatus:      ()              => api.get('/subscription/status'),
  createCheckout: (plan: string)  => api.post('/subscription/create', { plan }),
  createPortal:   ()              => api.post('/subscription/portal'),
}

// ── Token helpers ─────────────────────────────────────────────────────────────
export const saveToken = (token: string) => {
  Cookies.set('rp_token', token, { expires: 7, sameSite: 'strict' })
  localStorage.setItem('rp_token', token)
}

export const clearToken = () => {
  Cookies.remove('rp_token')
  localStorage.removeItem('rp_token')
}

export const getToken = (): string | null =>
  Cookies.get('rp_token') ?? localStorage.getItem('rp_token')
