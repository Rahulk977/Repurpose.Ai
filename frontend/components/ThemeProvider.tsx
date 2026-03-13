'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

const ThemeContext = createContext<{
  theme: string
  toggleTheme: () => void
}>({ theme: 'dark', toggleTheme: () => {} })

export const useTheme = () => useContext(ThemeContext)

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const saved = localStorage.getItem('rp_theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('rp_theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}