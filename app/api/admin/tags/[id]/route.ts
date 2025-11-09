import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

// PATCH: タグを更新
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

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      tag,
    })
  } catch (error) {
    console.error('タグ更新エラー:', error)
    return NextResponse.json(
      { error: 'タグの更新に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE: タグを削除
export async function DELETE(
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

    // タグが使用されているかチェック
    const [simLocationCount, spareTagCount] = await Promise.all([
      prisma.line.count({
        where: { simLocationId: id },
      }),
      prisma.line.count({
        where: { spareTagId: id },
      }),
    ])

    if (simLocationCount > 0 || spareTagCount > 0) {
      return NextResponse.json(
        { error: 'このタグは使用中のため削除できません' },
        { status: 400 }
      )
    }

    await prisma.tag.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'タグを削除しました',
    })
  } catch (error) {
    console.error('タグ削除エラー:', error)
    return NextResponse.json(
      { error: 'タグの削除に失敗しました' },
      { status: 500 }
    )
  }
}
