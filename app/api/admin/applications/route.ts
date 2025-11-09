import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

// GET: 申し込み一覧を取得（管理者用）
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // フィルター条件を構築
    const where: any = {}

    // ステータスフィルター
    if (status !== 'all') {
      where.status = status
    }

    // 検索フィルター（名前、メール、電話番号で検索）
    if (search) {
      where.OR = [
        { lastName: { contains: search } },
        { firstName: { contains: search } },
        { companyName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    // 申し込み一覧を取得
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          lines: true,
        },
      }),
      prisma.application.count({ where }),
    ])

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('申し込み一覧の取得エラー:', error)
    return NextResponse.json(
      { error: '申し込み一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}
