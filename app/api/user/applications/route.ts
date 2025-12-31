import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserSession } from '@/lib/userAuth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: ユーザーの申込一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession(request)

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    let applications: unknown[] = []

    if (session.isContractor) {
      // Contractorに紐づく申込を取得
      const { data, error } = await supabase
        .from('Application')
        .select('*, lines:Line(*)')
        .eq('contractorId', session.id)
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('申込取得エラー:', error)
        return NextResponse.json(
          { error: '申込の取得に失敗しました' },
          { status: 500 }
        )
      }

      applications = data || []
    } else {
      // メールアドレスで申込を取得（submitted以上のステータス）
      const { data, error } = await supabase
        .from('Application')
        .select('*, lines:Line(*)')
        .eq('email', session.email)
        .neq('status', 'draft')
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('申込取得エラー:', error)
        return NextResponse.json(
          { error: '申込の取得に失敗しました' },
          { status: 500 }
        )
      }

      applications = data || []
    }

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('申込一覧取得エラー:', error)
    return NextResponse.json(
      { error: '申込の取得に失敗しました' },
      { status: 500 }
    )
  }
}
