import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

// GET: 申し込み詳細を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 認証チェック
    const session = await getAdminSession(request)
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { id } = await params

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            simLocation: true,
            spareTag: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: '申し込み情報が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json({ application })
  } catch (error) {
    console.error('申し込み詳細の取得エラー:', error)
    return NextResponse.json(
      { error: '申し込み詳細の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// PATCH: 申し込み情報を更新（ステータス、コメントなど）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 認証チェック
    const session = await getAdminSession(request)
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const application = await prisma.application.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      application,
    })
  } catch (error) {
    console.error('申し込み情報の更新エラー:', error)
    return NextResponse.json(
      { error: '申し込み情報の更新に失敗しました' },
      { status: 500 }
    )
  }
}
