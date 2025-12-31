'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MypageLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'ログインに失敗しました')
        return
      }

      // パスワード変更が必要な場合
      if (data.mustChangePassword) {
        router.push('/mypage/change-password')
      } else {
        router.push('/mypage')
      }
      router.refresh()
    } catch (error) {
      console.error('ログインエラー:', error)
      setError('ログインに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#d4af37] to-[#f0d970] bg-clip-text text-transparent">
              buppan mobile
            </h1>
          </Link>
          <p className="text-white/60 mt-2">マイページログイン</p>
        </div>

        {/* ログインフォーム */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-colors"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-colors"
                placeholder="パスワード"
              />
              <p className="text-white/40 text-xs mt-2">
                ※ 初めてログインする方は、メールアドレスをパスワードとして入力してください
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        </div>

        {/* フッターリンク */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-white/40 text-sm">
            まだ申し込みをしていない方は
          </p>
          <Link
            href="/apply"
            className="inline-block text-[#d4af37] hover:text-[#f0d970] font-medium transition-colors"
          >
            新規お申し込みはこちら →
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            ← トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
