import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserSession } from '@/lib/userAuth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 料金計算
function calculateTotalAmount(planType: string, lineCount: number): number {
  const pricePerLine = planType === '3month-50plus' ? 4200 : 4600
  return pricePerLine * lineCount
}

// POST: 追加発注
export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession(request)

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    if (session.mustChangePassword) {
      return NextResponse.json(
        { error: 'パスワードの変更が必要です' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { planType, lineCount } = body

    // バリデーション
    if (!planType || !['3month-50plus', '3month-under50'].includes(planType)) {
      return NextResponse.json(
        { error: '有効なプランを選択してください' },
        { status: 400 }
      )
    }

    if (!lineCount || lineCount < 1) {
      return NextResponse.json(
        { error: '回線数は1以上で入力してください' },
        { status: 400 }
      )
    }

    // プランに応じた回線数チェック
    if (planType === '3month-50plus' && lineCount < 50) {
      return NextResponse.json(
        { error: '50回線以上プランは50回線以上の契約が必要です' },
        { status: 400 }
      )
    }

    if (planType === '3month-under50' && lineCount >= 50) {
      return NextResponse.json(
        { error: '50回線未満プランは49回線以下の契約が必要です' },
        { status: 400 }
      )
    }

    // 契約者情報を取得
    let baseApplication = null

    if (session.isContractor) {
      // Contractorに紐づく最新の申込を取得
      const { data: apps } = await supabase
        .from('Application')
        .select('*')
        .eq('contractorId', session.id)
        .order('createdAt', { ascending: false })
        .limit(1)

      baseApplication = apps?.[0]

      if (!baseApplication) {
        // Contractorの情報から作成
        const { data: contractor } = await supabase
          .from('Contractor')
          .select('*')
          .eq('id', session.id)
          .single()

        if (contractor) {
          baseApplication = {
            applicantType: contractor.contractorType,
            lastName: contractor.lastName,
            firstName: contractor.firstName,
            lastNameKana: contractor.lastNameKana,
            firstNameKana: contractor.firstNameKana,
            companyName: contractor.companyName,
            companyNameKana: contractor.companyNameKana,
            corporateNumber: contractor.corporateNumber,
            phone: contractor.phone,
            email: contractor.email,
            postalCode: contractor.postalCode,
            address: contractor.address,
            idCardFrontUrl: contractor.idCardFrontUrl,
            idCardBackUrl: contractor.idCardBackUrl,
            registrationUrl: contractor.registrationUrl,
            expirationDate: contractor.expirationDate,
          }
        }
      }
    } else {
      // メールアドレスで最新の申込を取得
      const { data: apps } = await supabase
        .from('Application')
        .select('*')
        .eq('email', session.email)
        .neq('status', 'draft')
        .order('createdAt', { ascending: false })
        .limit(1)

      baseApplication = apps?.[0]
    }

    if (!baseApplication) {
      return NextResponse.json(
        { error: '契約者情報が見つかりません' },
        { status: 404 }
      )
    }

    // 新規申込を作成
    const totalAmount = calculateTotalAmount(planType, lineCount)
    const now = new Date().toISOString()

    const newApplication = {
      // IDを明示的に生成
      id: crypto.randomUUID(),
      // 契約者情報を引き継ぎ
      applicantType: baseApplication.applicantType,
      lastName: baseApplication.lastName,
      firstName: baseApplication.firstName,
      lastNameKana: baseApplication.lastNameKana,
      firstNameKana: baseApplication.firstNameKana,
      companyName: baseApplication.companyName,
      companyNameKana: baseApplication.companyNameKana,
      corporateNumber: baseApplication.corporateNumber,
      establishedDate: baseApplication.establishedDate,
      representativeLastName: baseApplication.representativeLastName,
      representativeFirstName: baseApplication.representativeFirstName,
      representativeLastNameKana: baseApplication.representativeLastNameKana,
      representativeFirstNameKana: baseApplication.representativeFirstNameKana,
      representativeBirthDate: baseApplication.representativeBirthDate,
      representativePostalCode: baseApplication.representativePostalCode,
      representativeAddress: baseApplication.representativeAddress,
      contactLastName: baseApplication.contactLastName,
      contactFirstName: baseApplication.contactFirstName,
      contactLastNameKana: baseApplication.contactLastNameKana,
      contactFirstNameKana: baseApplication.contactFirstNameKana,
      phone: baseApplication.phone,
      email: baseApplication.email,
      postalCode: baseApplication.postalCode,
      address: baseApplication.address,
      dateOfBirth: baseApplication.dateOfBirth,

      // 新しいプラン情報
      planType,
      lineCount,
      totalAmount,

      // 書類情報を引き継ぎ
      isSecondApplication: true,
      idCardFrontUrl: baseApplication.idCardFrontUrl,
      idCardBackUrl: baseApplication.idCardBackUrl,
      registrationUrl: baseApplication.registrationUrl,
      expirationDate: baseApplication.expirationDate,

      // 同意（引き継ぎ）
      agreePrivacy: true,
      agreeTerms: true,
      agreeTelecom: true,
      agreeWithdrawal: true,
      agreeNoAntisocial: true,

      // ステータス
      status: 'submitted',
      verificationStatus: 'unverified',
      paymentStatus: 'not_issued',
      submittedAt: now,

      // Contractor紐付け（あれば）
      contractorId: session.isContractor ? session.id : baseApplication.contractorId,

      // パスワード（なしでOK、既存のものを使う）
      password: null,
      mustChangePassword: false,
    }

    const { data: createdApp, error: createError } = await supabase
      .from('Application')
      .insert(newApplication)
      .select()
      .single()

    if (createError) {
      console.error('申込作成エラー:', createError)
      return NextResponse.json(
        { error: '申込の作成に失敗しました', details: createError.message },
        { status: 500 }
      )
    }

    // 回線を作成
    const lines = []
    for (let i = 0; i < lineCount; i++) {
      lines.push({
        applicationId: createdApp.id,
        lineStatus: 'not_opened',
      })
    }

    const { error: linesError } = await supabase
      .from('Line')
      .insert(lines)

    if (linesError) {
      console.error('回線作成エラー:', linesError)
      // 申込は作成済みなので、エラーでも続行
    }

    return NextResponse.json({
      success: true,
      application: createdApp,
    })
  } catch (error) {
    console.error('追加発注エラー:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: '追加発注に失敗しました', details: errorMessage },
      { status: 500 }
    )
  }
}
