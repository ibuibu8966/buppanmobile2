import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminSession } from '@/lib/auth'

// Supabaseクライアントを初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST: 回線を作成
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
    const { applicationId, phoneNumber, simLocationId, spareTagId, lineStatus } = body

    const { data: line, error } = await supabase
      .from('Line')
      .insert({
        id: crypto.randomUUID(),
        applicationId,
        phoneNumber: phoneNumber || null,
        simLocationId: simLocationId || null,
        spareTagId: spareTagId || null,
        lineStatus: lineStatus || 'not_opened',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select(`
        *,
        simLocation:Tag!Line_simLocationId_fkey(*),
        spareTag:Tag!Line_spareTagId_fkey(*)
      `)
      .single()

    if (error) {
      console.error('回線作成エラー:', error)
      return NextResponse.json(
        { error: '回線の作成に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      line,
    })
  } catch (error) {
    console.error('回線作成エラー:', error)
    return NextResponse.json(
      { error: '回線の作成に失敗しました' },
      { status: 500 }
    )
  }
}
