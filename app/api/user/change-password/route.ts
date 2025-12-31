import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { getUserSession, createUserToken, UserSession } from '@/lib/userAuth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST: パスワード変更
export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession(request)

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '現在のパスワードと新しいパスワードは必須です' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'パスワードは8文字以上で入力してください' },
        { status: 400 }
      )
    }

    // 現在のパスワードを検証
    if (session.isContractor) {
      // Contractorテーブル
      const { data: contractor, error } = await supabase
        .from('Contractor')
        .select('*')
        .eq('id', session.id)
        .single()

      if (error || !contractor) {
        return NextResponse.json(
          { error: 'ユーザーが見つかりません' },
          { status: 404 }
        )
      }

      // パスワード検証
      if (!contractor.password) {
        // 初回パスワード設定の場合、メールアドレス=現在のパスワード
        if (currentPassword !== contractor.email) {
          return NextResponse.json(
            { error: '現在のパスワードが正しくありません' },
            { status: 401 }
          )
        }
      } else {
        const isValid = await bcrypt.compare(currentPassword, contractor.password)
        if (!isValid) {
          return NextResponse.json(
            { error: '現在のパスワードが正しくありません' },
            { status: 401 }
          )
        }
      }

      // 新しいパスワードをハッシュ化して更新
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      const { error: updateError } = await supabase
        .from('Contractor')
        .update({
          password: hashedPassword,
          mustChangePassword: false,
          passwordChangedAt: new Date().toISOString(),
        })
        .eq('id', session.id)

      if (updateError) {
        console.error('パスワード更新エラー:', updateError)
        return NextResponse.json(
          { error: 'パスワードの更新に失敗しました' },
          { status: 500 }
        )
      }
    } else {
      // Applicationテーブル
      const { data: application, error } = await supabase
        .from('Application')
        .select('*')
        .eq('id', session.id)
        .single()

      if (error || !application) {
        return NextResponse.json(
          { error: 'ユーザーが見つかりません' },
          { status: 404 }
        )
      }

      // パスワード検証
      if (!application.password) {
        // 初回パスワード設定の場合、メールアドレス=現在のパスワード
        if (currentPassword !== application.email) {
          return NextResponse.json(
            { error: '現在のパスワードが正しくありません' },
            { status: 401 }
          )
        }
      } else {
        const isValid = await bcrypt.compare(currentPassword, application.password)
        if (!isValid) {
          return NextResponse.json(
            { error: '現在のパスワードが正しくありません' },
            { status: 401 }
          )
        }
      }

      // 新しいパスワードをハッシュ化して更新
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      const { error: updateError } = await supabase
        .from('Application')
        .update({
          password: hashedPassword,
          mustChangePassword: false,
        })
        .eq('id', session.id)

      if (updateError) {
        console.error('パスワード更新エラー:', updateError)
        return NextResponse.json(
          { error: 'パスワードの更新に失敗しました' },
          { status: 500 }
        )
      }
    }

    // 新しいトークンを発行（mustChangePassword=falseに更新）
    const updatedSession: UserSession = {
      ...session,
      mustChangePassword: false,
    }
    const token = await createUserToken(updatedSession)

    const response = NextResponse.json({ success: true })

    response.cookies.set('user-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7日間
      path: '/',
    })

    return response
  } catch (error) {
    console.error('パスワード変更エラー:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'パスワードの変更に失敗しました', details: errorMessage },
      { status: 500 }
    )
  }
}
