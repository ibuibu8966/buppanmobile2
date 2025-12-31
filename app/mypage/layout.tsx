'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

interface UserInfo {
  id: string
  email: string
  name: string
  contractorType: 'individual' | 'corporate'
}

interface MypageLayoutProps {
  children: ReactNode
}

export default function MypageLayout({ children }: MypageLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // ログインページとパスワード変更ページは認証チェックをスキップ
  const isLoginPage = pathname === '/mypage/login'
  const isChangePasswordPage = pathname === '/mypage/change-password'

  useEffect(() => {
    const checkAuth = async () => {
      if (isLoginPage) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch('/api/user/profile')
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)

          // パスワード変更が必要な場合、パスワード変更ページ以外ならリダイレクト
          if (data.mustChangePassword && !isChangePasswordPage) {
            router.push('/mypage/change-password')
          }
        } else if (res.status === 401) {
          router.push('/mypage/login')
        }
      } catch {
        router.push('/mypage/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [isLoginPage, isChangePasswordPage, router])

  const handleLogout = async () => {
    await fetch('/api/user/logout', { method: 'POST' })
    router.push('/mypage/login')
  }

  // ログインページの場合はシンプルなレイアウト
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        {children}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">読み込み中...</div>
      </div>
    )
  }

  const navItems = [
    { href: '/mypage', label: '回線一覧', icon: '📱' },
    { href: '/mypage/profile', label: '契約者情報', icon: '👤' },
    { href: '/mypage/order', label: '追加発注', icon: '➕' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* ヘッダー */}
      <header className="bg-black/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/mypage" className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-gradient-to-r from-[#d4af37] to-[#f0d970] bg-clip-text text-transparent">
                  buppan mobile
                </span>
                <span className="text-white/60 text-sm">マイページ</span>
              </Link>

              {/* デスクトップナビゲーション */}
              <nav className="hidden md:flex space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-[#d4af37]/20 text-[#d4af37]'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <span className="hidden sm:block text-sm text-white/70">
                  {user.name || user.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-white/70 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                ログアウト
              </button>

              {/* モバイルメニューボタン */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white/70 hover:text-white p-2"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* モバイルメニュー */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-[#d4af37]/20 text-[#d4af37]'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-white/40 text-sm">
              &copy; 2024 buppan mobile. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link href="/" className="text-white/40 hover:text-white/70 text-sm transition-colors">
                トップページ
              </Link>
              <Link href="/privacy" className="text-white/40 hover:text-white/70 text-sm transition-colors">
                プライバシーポリシー
              </Link>
              <Link href="/terms" className="text-white/40 hover:text-white/70 text-sm transition-colors">
                利用規約
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
