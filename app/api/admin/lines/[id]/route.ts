import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

// PATCH: 回線を更新
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

    // 日付フィールドの変換
    const data: any = { ...body }
    if (data.returnDate && typeof data.returnDate === 'string') {
      data.returnDate = new Date(data.returnDate)
    }
    if (data.shipmentDate && typeof data.shipmentDate === 'string') {
      data.shipmentDate = new Date(data.shipmentDate)
    }

    const line = await prisma.line.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        simLocation: true,
        spareTag: true,
      },
    })

    return NextResponse.json({
      success: true,
      line,
    })
  } catch (error) {
    console.error('回線更新エラー:', error)
    return NextResponse.json(
      { error: '回線の更新に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE: 回線を削除
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

    await prisma.line.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: '回線を削除しました',
    })
  } catch (error) {
    console.error('回線削除エラー:', error)
    return NextResponse.json(
      { error: '回線の削除に失敗しました' },
      { status: 500 }
    )
  }
}
