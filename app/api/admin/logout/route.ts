import { NextResponse } from 'next/server'

// POST: 管理者ログアウト
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'ログアウトしました',
  })

  // クッキーを削除
  response.cookies.delete('admin-token')

  return response
}
