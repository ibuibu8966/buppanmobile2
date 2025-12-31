import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserSession } from '@/lib/userAuth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: ユーザーの回線一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession(request)

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    let applicationIds: string[] = []

    if (session.isContractor) {
      // Contractorに紐づく申込IDを取得
      const { data: apps, error } = await supabase
        .from('Application')
        .select('id')
        .eq('contractorId', session.id)

      if (error) {
        console.error('申込取得エラー:', error)
        return NextResponse.json(
          { error: '回線の取得に失敗しました' },
          { status: 500 }
        )
      }

      applicationIds = (apps || []).map((app: { id: string }) => app.id)
    } else {
      // メールアドレスで申込IDを取得
      const { data: apps, error } = await supabase
        .from('Application')
        .select('id')
        .eq('email', session.email)
        .neq('status', 'draft')

      if (error) {
        console.error('申込取得エラー:', error)
        return NextResponse.json(
          { error: '回線の取得に失敗しました' },
          { status: 500 }
        )
      }

      applicationIds = (apps || []).map((app: { id: string }) => app.id)
    }

    if (applicationIds.length === 0) {
      return NextResponse.json({ lines: [], summary: { total: 0 } })
    }

    // 回線を取得
    const { data: lines, error: linesError } = await supabase
      .from('Line')
      .select(`
        *,
        application:Application(id, planType, createdAt, status),
        simLocation:Tag!simLocationId(id, name, color),
        spareTag:Tag!spareTagId(id, name, color)
      `)
      .in('applicationId', applicationIds)
      .order('createdAt', { ascending: false })

    if (linesError) {
      console.error('回線取得エラー:', linesError)
      return NextResponse.json(
        { error: '回線の取得に失敗しました' },
        { status: 500 }
      )
    }

    // サマリーを計算
    const statusCounts: Record<string, number> = {}
    for (const line of lines || []) {
      const status = line.lineStatus || 'not_opened'
      statusCounts[status] = (statusCounts[status] || 0) + 1
    }

    const summary = {
      total: lines?.length || 0,
      ...statusCounts,
    }

    return NextResponse.json({ lines: lines || [], summary })
  } catch (error) {
    console.error('回線一覧取得エラー:', error)
    return NextResponse.json(
      { error: '回線の取得に失敗しました' },
      { status: 500 }
    )
  }
}
