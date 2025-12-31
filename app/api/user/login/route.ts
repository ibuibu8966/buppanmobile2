import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { createUserToken, UserSession } from '@/lib/userAuth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST: ユーザーログイン
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードは必須です' },
        { status: 400 }
      )
    }

    // 1. まずContractorテーブルを検索
    const { data: contractor } = await supabase
      .from('Contractor')
      .select('*')
      .eq('email', email)
      .single()

    if (contractor) {
      // Contractorが存在する場合
      if (!contractor.password) {
        // パスワード未設定の場合、メールアドレス=パスワードで認証
        if (password !== email) {
          return NextResponse.json(
            { error: 'メールアドレスまたはパスワードが正しくありません' },
            { status: 401 }
          )
        }
      } else {
        // パスワードが設定済みの場合
        const isValid = await bcrypt.compare(password, contractor.password)
        if (!isValid) {
          return NextResponse.json(
            { error: 'メールアドレスまたはパスワードが正しくありません' },
            { status: 401 }
          )
        }
      }

      // 最終ログイン日時を更新
      await supabase
        .from('Contractor')
        .update({ lastLoginAt: new Date().toISOString() })
        .eq('id', contractor.id)

      // ユーザー名を生成
      const name = contractor.contractorType === 'corporate'
        ? contractor.companyName || ''
        : `${contractor.lastName || ''} ${contractor.firstName || ''}`.trim()

      const userSession: UserSession = {
        id: contractor.id,
        email: contractor.email,
        name,
        contractorType: contractor.contractorType as 'individual' | 'corporate',
        mustChangePassword: contractor.mustChangePassword,
        isContractor: true,
      }

      const token = await createUserToken(userSession)

      const response = NextResponse.json({
        success: true,
        user: {
          id: contractor.id,
          email: contractor.email,
          name,
          contractorType: contractor.contractorType,
        },
        mustChangePassword: contractor.mustChangePassword,
      })

      response.cookies.set('user-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7日間
        path: '/',
      })

      return response
    }

    // 2. Contractorがない場合、Applicationテーブルを検索（submitted状態のもの）
    const { data: applications, error: appError } = await supabase
      .from('Application')
      .select('*')
      .eq('email', email)
      .eq('status', 'submitted')
      .order('createdAt', { ascending: false })

    if (appError || !applications || applications.length === 0) {
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401 }
      )
    }

    // 最新の申込を使用
    const application = applications[0]

    // パスワードチェック
    if (!application.password) {
      // パスワード未設定の場合、メールアドレス=パスワードで認証
      if (password !== email) {
        return NextResponse.json(
          { error: 'メールアドレスまたはパスワードが正しくありません' },
          { status: 401 }
        )
      }
    } else {
      // パスワードが設定済みの場合
      const isValid = await bcrypt.compare(password, application.password)
      if (!isValid) {
        return NextResponse.json(
          { error: 'メールアドレスまたはパスワードが正しくありません' },
          { status: 401 }
        )
      }
    }

    // パスワード未設定の場合、初回ログインとしてmustChangePasswordをtrueにする
    const mustChangePassword = !application.password

    // ユーザー名を生成
    const name = application.applicantType === 'corporate'
      ? application.companyName || ''
      : `${application.lastName || ''} ${application.firstName || ''}`.trim()

    const userSession: UserSession = {
      id: application.id,
      email: application.email,
      name,
      contractorType: application.applicantType as 'individual' | 'corporate',
      mustChangePassword,
      isContractor: false,
    }

    const token = await createUserToken(userSession)

    const response = NextResponse.json({
      success: true,
      user: {
        id: application.id,
        email: application.email,
        name,
        contractorType: application.applicantType,
      },
      mustChangePassword,
    })

    response.cookies.set('user-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7日間
      path: '/',
    })

    return response
  } catch (error) {
    console.error('ログインエラー:', error)
    return NextResponse.json(
      { error: 'ログインに失敗しました' },
      { status: 500 }
    )
  }
}
