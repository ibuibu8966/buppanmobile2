import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminSession } from '@/lib/auth'

// Supabaseクライアントを初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
      data.returnDate = new Date(data.returnDate).toISOString()
    }
    if (data.shipmentDate && typeof data.shipmentDate === 'string') {
      data.shipmentDate = new Date(data.shipmentDate).toISOString()
    }

    const { data: line, error } = await supabase
      .from('Line')
      .update({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('回線更新エラー:', error)
      return NextResponse.json(
        { error: '回線の更新に失敗しました', details: error.message },
        { status: 500 }
      )
    }

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

    const { error } = await supabase
      .from('Line')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('回線削除エラー:', error)
      return NextResponse.json(
        { error: '回線の削除に失敗しました', details: error.message },
        { status: 500 }
      )
    }

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
