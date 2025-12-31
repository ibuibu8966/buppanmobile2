import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST: 申込を統合してContractorを作成
export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { applicationIds, primaryApplicationId } = body

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length < 1) {
      return NextResponse.json(
        { error: '統合する申込IDを指定してください' },
        { status: 400 }
      )
    }

    if (!primaryApplicationId) {
      return NextResponse.json(
        { error: '基準となる申込IDを指定してください' },
        { status: 400 }
      )
    }

    // 指定された申込を取得
    const { data: applications, error: fetchError } = await supabase
      .from('Application')
      .select('*')
      .in('id', applicationIds)

    if (fetchError || !applications || applications.length === 0) {
      return NextResponse.json(
        { error: '申込が見つかりません' },
        { status: 404 }
      )
    }

    // 全ての申込が同じメールアドレスか確認
    const emails = new Set(applications.map(app => app.email))
    if (emails.size > 1) {
      return NextResponse.json(
        { error: '異なるメールアドレスの申込は統合できません' },
        { status: 400 }
      )
    }

    // 基準となる申込を取得
    const primaryApp = applications.find(app => app.id === primaryApplicationId)
    if (!primaryApp) {
      return NextResponse.json(
        { error: '基準となる申込が見つかりません' },
        { status: 404 }
      )
    }

    // 既にContractorが存在するかチェック
    const { data: existingContractor } = await supabase
      .from('Contractor')
      .select('*')
      .eq('email', primaryApp.email)
      .single()

    let contractorId: string

    if (existingContractor) {
      // 既存のContractorを使用
      contractorId = existingContractor.id
    } else {
      // 新しいContractorを作成
      const contractorData = {
        email: primaryApp.email,
        contractorType: primaryApp.applicantType,
        lastName: primaryApp.lastName,
        firstName: primaryApp.firstName,
        lastNameKana: primaryApp.lastNameKana,
        firstNameKana: primaryApp.firstNameKana,
        companyName: primaryApp.companyName,
        companyNameKana: primaryApp.companyNameKana,
        corporateNumber: primaryApp.corporateNumber,
        phone: primaryApp.phone,
        postalCode: primaryApp.postalCode,
        address: primaryApp.address,
        idCardFrontUrl: primaryApp.idCardFrontUrl,
        idCardBackUrl: primaryApp.idCardBackUrl,
        registrationUrl: primaryApp.registrationUrl,
        expirationDate: primaryApp.expirationDate,
        password: primaryApp.password,
        mustChangePassword: !primaryApp.password,
      }

      const { data: newContractor, error: createError } = await supabase
        .from('Contractor')
        .insert(contractorData)
        .select()
        .single()

      if (createError || !newContractor) {
        console.error('Contractor作成エラー:', createError)
        return NextResponse.json(
          { error: '契約者の作成に失敗しました' },
          { status: 500 }
        )
      }

      contractorId = newContractor.id
    }

    // 全ての申込にcontractorIdを設定
    const { error: updateError } = await supabase
      .from('Application')
      .update({ contractorId })
      .in('id', applicationIds)

    if (updateError) {
      console.error('申込更新エラー:', updateError)
      return NextResponse.json(
        { error: '申込の更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      contractorId,
      mergedCount: applicationIds.length,
    })
  } catch (error) {
    console.error('統合エラー:', error)
    return NextResponse.json(
      { error: '統合に失敗しました' },
      { status: 500 }
    )
  }
})
