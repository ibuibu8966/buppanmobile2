import { ReactNode } from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin-token')?.value

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return payload
  } catch {
    return null
  }
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession()

  // ログインページの場合は認証チェックをスキップ（リダイレクトループを防ぐため）
  // ログインページ以外で未認証の場合はリダイレクト
  // Note: この判定はサーバーコンポーネントなので headers() を使えますが、
  // シンプルにするため children の型チェックは行わず、session がない場合のみ
  // ログインページ専用のレイアウトを返します
  if (!session) {
    // ログインページ用のシンプルなレイアウト
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-gray-800 shadow-md">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-white">
                buppan mobile 管理画面
              </h1>
              <nav className="flex space-x-4">
                <Link
                  href="/admin/applications"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  申し込み一覧
                </Link>
                <Link
                  href="/admin/tags"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  タグ管理
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                {session.name as string}
              </span>
              <form action="/api/admin/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-gray-300 hover:text-white"
                >
                  ログアウト
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
