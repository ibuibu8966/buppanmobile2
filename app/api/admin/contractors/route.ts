import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: 契約者一覧を取得
export const GET = requireAdmin(async () => {
  try {
    const { data: contractors, error } = await supabase
      .from('Contractor')
      .select(`
        *,
        applications:Application(id, status, planType, lineCount, createdAt)
      `)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('契約者一覧取得エラー:', error)
      return NextResponse.json(
        { error: '契約者一覧の取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ contractors: contractors || [] })
  } catch (error) {
    console.error('契約者一覧取得エラー:', error)
    return NextResponse.json(
      { error: '契約者一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
})
