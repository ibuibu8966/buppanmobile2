import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminSession } from '@/lib/auth'

// Supabaseクライアントを初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 画像URLを署名付きURLに変換するヘルパー関数
const getSignedImageUrl = async (publicUrl: string | null): Promise<string | null> => {
  if (!publicUrl) return null

  const match = publicUrl.match(/\/applications\/(.+)$/)
  if (!match) return publicUrl

  const filePath = match[1]
  const { data } = await supabase.storage
    .from('applications')
    .createSignedUrl(filePath, 3600) // 1時間有効

  return data?.signedUrl || publicUrl
}

// GET: 申し込み一覧を取得（管理者用）
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getAdminSession(request)
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''
    const archived = searchParams.get('archived') === 'true'

    const from = (page - 1) * limit
    const to = from + limit - 1

    // クエリを構築
    let query = supabase
      .from('Application')
      .select('*, Line(*)', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(from, to)

    // アーカイブフィルター（デフォルトは非アーカイブのみ）
    query = query.eq('isArchived', archived)

    // ステータスフィルター
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // 検索フィルター（名前、メール、電話番号で検索）
    if (search) {
      query = query.or(
        `lastName.ilike.%${search}%,firstName.ilike.%${search}%,companyName.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      )
    }

    // 申し込み一覧を取得
    const { data: applications, count, error } = await query

    if (error) {
      console.error('申し込み一覧の取得エラー:', error)
      return NextResponse.json(
        { error: '申し込み一覧の取得に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    // linesをLine配列に変換（Supabaseの結果をPrismaの形式に合わせる）
    const formattedApplications = applications?.map((app: any) => ({
      ...app,
      lines: app.Line || [],
    }))

    // 画像URLを署名付きURLに変換
    const applicationsWithSignedUrls = await Promise.all(
      (formattedApplications || []).map(async (app: any) => ({
        ...app,
        idCardFrontUrl: await getSignedImageUrl(app.idCardFrontUrl),
        idCardBackUrl: await getSignedImageUrl(app.idCardBackUrl),
        registrationUrl: await getSignedImageUrl(app.registrationUrl),
      }))
    )

    return NextResponse.json({
      applications: applicationsWithSignedUrls,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('申し込み一覧の取得エラー:', error)
    return NextResponse.json(
      { error: '申し込み一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}
