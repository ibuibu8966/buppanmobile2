import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserSession } from '@/lib/userAuth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: ユーザープロフィール取得
export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession(request)

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    let user = null
    let contractor = null
    let applications: unknown[] = []

    if (session.isContractor) {
      // Contractorから情報取得
      const { data, error } = await supabase
        .from('Contractor')
        .select('*')
        .eq('id', session.id)
        .single()

      if (error || !data) {
        return NextResponse.json(
          { error: 'ユーザー情報が見つかりません' },
          { status: 404 }
        )
      }

      contractor = data
      user = {
        id: data.id,
        email: data.email,
        name: data.contractorType === 'corporate'
          ? data.companyName || ''
          : `${data.lastName || ''} ${data.firstName || ''}`.trim(),
        contractorType: data.contractorType,
      }

      // 紐づく申込を取得
      const { data: apps } = await supabase
        .from('Application')
        .select('*')
        .eq('contractorId', session.id)
        .order('createdAt', { ascending: false })

      applications = apps || []
    } else {
      // Applicationから情報取得（最新の申込）
      const { data: apps, error } = await supabase
        .from('Application')
        .select('*')
        .eq('email', session.email)
        .neq('status', 'draft')
        .order('createdAt', { ascending: false })

      if (error || !apps || apps.length === 0) {
        return NextResponse.json(
          { error: 'ユーザー情報が見つかりません' },
          { status: 404 }
        )
      }

      applications = apps
      const primaryApp = apps[0]

      user = {
        id: primaryApp.id,
        email: primaryApp.email,
        name: primaryApp.applicantType === 'corporate'
          ? primaryApp.companyName || ''
          : `${primaryApp.lastName || ''} ${primaryApp.firstName || ''}`.trim(),
        contractorType: primaryApp.applicantType,
      }
    }

    return NextResponse.json({
      user,
      contractor,
      applications,
      mustChangePassword: session.mustChangePassword,
    })
  } catch (error) {
    console.error('プロフィール取得エラー:', error)
    return NextResponse.json(
      { error: 'プロフィールの取得に失敗しました' },
      { status: 500 }
    )
  }
}
