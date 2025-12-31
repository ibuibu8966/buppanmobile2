import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Application {
  id: string
  email: string
  applicantType: string
  lastName: string | null
  firstName: string | null
  companyName: string | null
  status: string
  planType: string
  lineCount: number
  createdAt: string
  contractorId: string | null
}

// GET: 重複メールアドレスの申込を検出
export const GET = requireAdmin(async () => {
  try {
    // 全申込を取得（draft以外）
    const { data: applications, error } = await supabase
      .from('Application')
      .select('id, email, applicantType, lastName, firstName, companyName, status, planType, lineCount, createdAt, contractorId')
      .neq('status', 'draft')
      .order('email')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('申込取得エラー:', error)
      return NextResponse.json(
        { error: '申込の取得に失敗しました' },
        { status: 500 }
      )
    }

    // メールアドレスでグループ化
    const emailGroups: Record<string, Application[]> = {}
    for (const app of (applications || []) as Application[]) {
      if (!emailGroups[app.email]) {
        emailGroups[app.email] = []
      }
      emailGroups[app.email].push(app)
    }

    // 2件以上ある重複のみ抽出
    const duplicates = Object.entries(emailGroups)
      .filter(([, apps]) => apps.length >= 2)
      .map(([email, apps]) => ({
        email,
        count: apps.length,
        applications: apps,
        isContractorCreated: apps.some(app => app.contractorId !== null),
      }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      duplicates,
      totalDuplicateEmails: duplicates.length,
      totalDuplicateApplications: duplicates.reduce((sum, d) => sum + d.count, 0),
    })
  } catch (error) {
    console.error('重複検出エラー:', error)
    return NextResponse.json(
      { error: '重複の検出に失敗しました' },
      { status: 500 }
    )
  }
})
