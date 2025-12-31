import { NextResponse } from 'next/server'

// POST: ユーザーログアウト
export async function POST() {
  const response = NextResponse.json({ success: true })

  // user-tokenクッキーを削除
  response.cookies.set('user-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}
