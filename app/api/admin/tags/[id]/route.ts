import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminSession } from '@/lib/auth'

// Supabaseクライアントを初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    const { data: tag, error } = await supabase
      .from('Tag')
      .update({
        ...body,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('タグ更新エラー:', error)
      return NextResponse.json(
        { error: 'タグの更新に失敗しました', details: error.message },
        { status: 500 }
      )
    }

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
    const [simLocationResult, spareTagResult] = await Promise.all([
      supabase
        .from('Line')
        .select('id', { count: 'exact', head: true })
        .eq('simLocationId', id),
      supabase
        .from('Line')
        .select('id', { count: 'exact', head: true })
        .eq('spareTagId', id),
    ])

    const simLocationCount = simLocationResult.count || 0
    const spareTagCount = spareTagResult.count || 0

    if (simLocationCount > 0 || spareTagCount > 0) {
      return NextResponse.json(
        { error: 'このタグは使用中のため削除できません' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('Tag')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('タグ削除エラー:', error)
      return NextResponse.json(
        { error: 'タグの削除に失敗しました', details: error.message },
        { status: 500 }
      )
    }

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
