import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

// POST: 回線を作成
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
    const { applicationId, phoneNumber, simLocationId, spareTagId, lineStatus } = body

    const line = await prisma.line.create({
      data: {
        applicationId,
        phoneNumber: phoneNumber || null,
        simLocationId: simLocationId || null,
        spareTagId: spareTagId || null,
        lineStatus: lineStatus || 'not_opened',
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
    console.error('回線作成エラー:', error)
    return NextResponse.json(
      { error: '回線の作成に失敗しました' },
      { status: 500 }
    )
  }
}
