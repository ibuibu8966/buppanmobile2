import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

interface BatchUpdate {
  id: string
  verificationStatus?: string
  paymentStatus?: string
}

// POST: 申し込みステータスの一括更新
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')

    if (!token) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    try {
      jwt.verify(token.value, JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: '認証が無効です' }, { status: 401 })
    }

    const { updates }: { updates: BatchUpdate[] } = await request.json()

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: '更新データが無効です' }, { status: 400 })
    }

    // 各申し込みを更新
    const results = await Promise.all(
      updates.map(async (update) => {
        const { id, ...data } = update

        return await prisma.application.update({
          where: { id },
          data,
        })
      })
    )

    return NextResponse.json({
      success: true,
      count: results.length,
      message: `${results.length}件のステータスを更新しました`,
    })
  } catch (error: any) {
    console.error('一括更新エラー:', error)
    return NextResponse.json(
      { error: '一括更新に失敗しました', details: error.message },
      { status: 500 }
    )
  }
}
