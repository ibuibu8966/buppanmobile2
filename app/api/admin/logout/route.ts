import { NextResponse } from 'next/server'

// POST: 管理者ログアウト
export async function POST() {
  const response = NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))

  // クッキーを削除
  response.cookies.delete('admin-token')

  return response
}
