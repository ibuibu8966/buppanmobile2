import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabaseクライアントを初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
    const { data: application, error } = await supabase
      .from('Application')
      .select('*')
      .eq('email', email)
      .eq('status', 'draft')
      .order('updatedAt', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116は「レコードが見つからない」エラー
      throw error
    }

    return NextResponse.json({ application: application || null })
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

    // 日付文字列をISO形式に変換
    const processedData: any = { ...data }

    if (processedData.dateOfBirth && typeof processedData.dateOfBirth === 'string') {
      processedData.dateOfBirth = new Date(processedData.dateOfBirth).toISOString()
    }
    if (processedData.establishedDate && typeof processedData.establishedDate === 'string') {
      processedData.establishedDate = new Date(processedData.establishedDate).toISOString()
    }
    if (processedData.representativeBirthDate && typeof processedData.representativeBirthDate === 'string') {
      processedData.representativeBirthDate = new Date(processedData.representativeBirthDate).toISOString()
    }
    if (processedData.expirationDate && typeof processedData.expirationDate === 'string') {
      processedData.expirationDate = new Date(processedData.expirationDate).toISOString()
    }

    // 必須フィールドのデフォルト値設定
    if (!processedData.planType) processedData.planType = ''
    if (!processedData.lineCount) processedData.lineCount = 0
    if (!processedData.totalAmount) processedData.totalAmount = 0

    // ステップごとにデータを保存
    let application
    let error

    if (id) {
      // 既存の申し込みを更新
      const updateData = {
        ...processedData,
        status,
        updatedAt: new Date().toISOString(),
        ...(status === 'submitted' && { submittedAt: new Date().toISOString() }),
      }

      const result = await supabase
        .from('Application')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      application = result.data
      error = result.error
    } else {
      // 新規申し込みを作成
      const now = new Date().toISOString()
      const insertData = {
        id: crypto.randomUUID(), // IDを明示的に生成
        ...processedData,
        status,
        createdAt: now,
        updatedAt: now,
        ...(status === 'submitted' && { submittedAt: now }),
      }

      const result = await supabase
        .from('Application')
        .insert(insertData)
        .select()
        .single()

      application = result.data
      error = result.error
    }

    if (error) {
      throw error
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
