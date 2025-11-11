import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminSession } from '@/lib/auth'

// Supabaseクライアントを初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    let query = supabase
      .from('Tag')
      .select('*')
      .order('order', { ascending: true })

    if (type) {
      query = query.eq('type', type)
    }

    const { data: tags, error } = await query

    if (error) {
      console.error('タグ一覧の取得エラー:', error)
      return NextResponse.json(
        { error: 'タグ一覧の取得に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ tags: tags || [] })
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
    const { data: existing } = await supabase
      .from('Tag')
      .select('*')
      .eq('name', name)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'このタグ名は既に使用されています' },
        { status: 400 }
      )
    }

    const { data: tag, error } = await supabase
      .from('Tag')
      .insert({
        id: crypto.randomUUID(),
        name,
        type,
        color: color || null,
        order: order || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('タグ作成エラー:', error)
      return NextResponse.json(
        { error: 'タグの作成に失敗しました', details: error.message },
        { status: 500 }
      )
    }

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
