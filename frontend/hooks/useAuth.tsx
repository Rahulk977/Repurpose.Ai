'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { authAPI, saveToken, clearToken, getToken } from '@/lib/api'

export interface User {
  id: string
  name: string
  email: string
  avatar: string | null
  subscription: {
    plan: 'free' | 'pro' | 'creator'
    status: string
    currentPeriodEnd?: string | null
    stripeCustomerId?: string | null
  }
  usage: {
    generationsThisMonth: number
    totalGenerations: number
  }
  settings: {
    emailNotifications: boolean
    defaultFormats: string[]
    timezone: string
  }
  remainingGenerations: number
  createdAt: string
}

interface AuthCtx {
  user: User | null
  loading: boolean
  login:   (email: string, password: string) => Promise<void>
  signup:  (name: string, email: string, password: string) => Promise<void>
  logout:  () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]     = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const token = getToken()
    if (!token) { setLoading(false); return }
    try {
      const { data } = await authAPI.getMe()
      setUser(data.user)
    } catch {
      clearToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const login = async (email: string, password: string) => {
    const { data } = await authAPI.login({ email, password })
    saveToken(data.token)
    setUser(data.user)
  }

  const signup = async (name: string, email: string, password: string) => {
    const { data } = await authAPI.signup({ name, email, password })
    saveToken(data.token)
    setUser(data.user)
  }

  const logout = () => {
    clearToken()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
