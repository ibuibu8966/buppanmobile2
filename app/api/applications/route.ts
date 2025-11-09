import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// GET: 申し込み情報を取得（draft状態のものを取得 - セッション復帰用）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'メールアドレスが必要です' },
        { status: 400 }
      )
    }

    // 最新のdraft状態の申し込みを取得
    const application = await prisma.application.findFirst({
      where: {
        email,
        status: 'draft',
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json({ application })
  } catch (error) {
    console.error('申し込み情報の取得エラー:', error)
    return NextResponse.json(
      { error: '申し込み情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: 申し込み情報を保存・更新（途中保存 + 最終送信）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      step,
      data,
      status = 'draft',
    } = body

    console.log('受信データ:', JSON.stringify(data, null, 2))

    // 日付文字列をDateオブジェクトに変換
    const processedData: any = { ...data }

    if (processedData.dateOfBirth && typeof processedData.dateOfBirth === 'string') {
      processedData.dateOfBirth = new Date(processedData.dateOfBirth)
    }
    if (processedData.establishedDate && typeof processedData.establishedDate === 'string') {
      processedData.establishedDate = new Date(processedData.establishedDate)
    }
    if (processedData.representativeBirthDate && typeof processedData.representativeBirthDate === 'string') {
      processedData.representativeBirthDate = new Date(processedData.representativeBirthDate)
    }

    // 必須フィールドのデフォルト値設定
    if (!processedData.planType) processedData.planType = ''
    if (!processedData.lineCount) processedData.lineCount = 0
    if (!processedData.totalAmount) processedData.totalAmount = 0

    // ステップごとにデータを保存
    let application

    if (id) {
      // 既存の申し込みを更新
      application = await prisma.application.update({
        where: { id },
        data: {
          ...processedData,
          status,
          updatedAt: new Date(),
          ...(status === 'submitted' && { submittedAt: new Date() }),
        },
      })
    } else {
      // 新規申し込みを作成
      application = await prisma.application.create({
        data: {
          ...processedData,
          status,
          ...(status === 'submitted' && { submittedAt: new Date() }),
        },
      })
    }

    return NextResponse.json({
      success: true,
      application,
    })
  } catch (error) {
    console.error('申し込み情報の保存エラー:', error)
    console.error('エラー詳細:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      {
        error: '申し込み情報の保存に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
