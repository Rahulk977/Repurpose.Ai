import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import ThemeProvider from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: {
    default: 'Repurpose.AI — Turn Any Content Into Social Gold',
    template: '%s | Repurpose.AI',
  },
  description: 'Transform YouTube videos, audio files, or text into Twitter threads, LinkedIn posts, Instagram captions, blog articles, email newsletters, and YouTube Shorts scripts — instantly.',
  keywords: ['AI content repurposing', 'social media automation', 'content marketing', 'OpenAI', 'Twitter threads'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    title: 'Repurpose.AI',
    description: 'Transform any content into social media gold with AI',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#242428',
              color: '#EEEEF4',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#F59E0B', secondary: '#0A0A0B' },
            },
            error: {
              iconTheme: { primary: '#F87171', secondary: '#0A0A0B' },
            },
          }}
        />
      </body>
    </html>
  )
}