import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

// GET: タグ一覧を取得
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getAdminSession(request)
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'sim_location' | 'spare' | null

    const where = type ? { type } : {}

    const tags = await prisma.tag.findMany({
      where,
      orderBy: {
        order: 'asc',
      },
    })

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('タグ一覧の取得エラー:', error)
    return NextResponse.json(
      { error: 'タグ一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: タグを作成
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getAdminSession(request)
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, type, color, order } = body

    // 同じ名前のタグが既に存在するかチェック
    const existing = await prisma.tag.findUnique({
      where: { name },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'このタグ名は既に使用されています' },
        { status: 400 }
      )
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        type,
        color: color || null,
        order: order || 0,
      },
    })

    return NextResponse.json({
      success: true,
      tag,
    })
  } catch (error) {
    console.error('タグ作成エラー:', error)
    return NextResponse.json(
      { error: 'タグの作成に失敗しました' },
      { status: 500 }
    )
  }
}
