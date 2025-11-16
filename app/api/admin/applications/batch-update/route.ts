import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminSession } from '@/lib/auth'

// Supabaseクライアントを初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface BatchUpdate {
  id: string
  verificationStatus?: string
  paymentStatus?: string
}

// POST: 申し込みステータスの一括更新
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { updates }: { updates: BatchUpdate[] } = await request.json()

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: '更新データが無効です' }, { status: 400 })
    }

    // 各申し込みを更新
    const results = await Promise.all(
      updates.map(async (update) => {
        const { id, ...data } = update

        const { data: application, error } = await supabase
          .from('Application')
          .update({
            ...data,
            updatedAt: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single()

        if (error) {
          console.error(`申し込み ${id} の更新エラー:`, error)
          throw error
        }

        return application
      })
    )

    return NextResponse.json({
      success: true,
      count: results.length,
      message: `${results.length}件のステータスを更新しました`,
    })
  } catch (error: any) {
    console.error('一括更新エラー:', error)
    return NextResponse.json(
      { error: '一括更新に失敗しました', details: error.message },
      { status: 500 }
    )
  }
}
