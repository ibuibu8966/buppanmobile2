import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserSession } from '@/lib/userAuth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: 回線詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getUserSession(request)

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { id } = await params

    // 回線を取得
    const { data: line, error } = await supabase
      .from('Line')
      .select(`
        *,
        application:Application(*),
        simLocation:Tag!simLocationId(id, name, color),
        spareTag:Tag!spareTagId(id, name, color)
      `)
      .eq('id', id)
      .single()

    if (error || !line) {
      return NextResponse.json(
        { error: '回線が見つかりません' },
        { status: 404 }
      )
    }

    // 所有者チェック
    const application = line.application
    let isOwner = false

    if (session.isContractor) {
      isOwner = application.contractorId === session.id
    } else {
      isOwner = application.email === session.email
    }

    if (!isOwner) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      )
    }

    return NextResponse.json({ line })
  } catch (error) {
    console.error('回線詳細取得エラー:', error)
    return NextResponse.json(
      { error: '回線の取得に失敗しました' },
      { status: 500 }
    )
  }
}
