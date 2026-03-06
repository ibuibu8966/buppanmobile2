'use client'

import { usePathname } from 'next/navigation'

export default function MigrationGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) {
    return <>{children}</>
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: 'sans-serif',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111' }}>
        サイト移転のお知らせ
      </h1>
      <p style={{ fontSize: '1rem', color: '#333', marginBottom: '1.5rem', lineHeight: '1.8' }}>
        このサイトは以下のURLに移転しました。<br />
        ブックマーク等の更新をお願いいたします。
      </p>
      <a
        href="https://supermobile-lines-buppan.vercel.app/"
        style={{
          fontSize: '1.1rem',
          color: '#2563eb',
          textDecoration: 'underline',
          wordBreak: 'break-all',
        }}
      >
        https://supermobile-lines-buppan.vercel.app/
      </a>
    </div>
  )
}
