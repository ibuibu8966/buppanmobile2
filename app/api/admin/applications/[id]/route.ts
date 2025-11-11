import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminSession } from '@/lib/auth'

// Supabaseクライアントを初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    // 申し込み情報を取得
    const { data: application, error: appError } = await supabase
      .from('Application')
      .select('*')
      .eq('id', id)
      .single()

    if (appError || !application) {
      console.error('申し込み情報の取得エラー:', appError)
      return NextResponse.json(
        { error: '申し込み情報が見つかりません' },
        { status: 404 }
      )
    }

    // 関連する回線情報を取得
    const { data: lines, error: linesError } = await supabase
      .from('Line')
      .select(`
        *,
        simLocation:Tag!Line_simLocationId_fkey(*),
        spareTag:Tag!Line_spareTagId_fkey(*)
      `)
      .eq('applicationId', id)
      .order('createdAt', { ascending: true })

    if (linesError) {
      console.error('回線情報の取得エラー:', linesError)
    }

    // データを結合
    const result = {
      ...application,
      lines: lines || [],
    }

    return NextResponse.json({ application: result })
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

    const { data: application, error } = await supabase
      .from('Application')
      .update({
        ...body,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('申し込み情報の更新エラー:', error)
      return NextResponse.json(
        { error: '申し込み情報の更新に失敗しました', details: error.message },
        { status: 500 }
      )
    }

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
