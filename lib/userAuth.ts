import { jwtVerify, SignJWT } from 'jose'
import { NextRequest } from 'next/server'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

export interface UserSession {
  id: string
  email: string
  name: string
  contractorType: 'individual' | 'corporate'
  mustChangePassword: boolean
  isContractor: boolean // true: Contractorテーブル, false: Applicationテーブル
}

export async function getUserSession(request: NextRequest): Promise<UserSession | null> {
  try {
    const token = request.cookies.get('user-token')?.value

    if (!token) {
      return null
    }

    const { payload } = await jwtVerify(token, SECRET_KEY)

    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      contractorType: payload.contractorType as 'individual' | 'corporate',
      mustChangePassword: payload.mustChangePassword as boolean,
      isContractor: payload.isContractor as boolean,
    }
  } catch (error) {
    console.error('ユーザー認証エラー:', error)
    return null
  }
}

export async function createUserToken(user: UserSession): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    contractorType: user.contractorType,
    mustChangePassword: user.mustChangePassword,
    isContractor: user.isContractor,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY)
}

export function requireUser(handler: (request: NextRequest, session: UserSession) => Promise<Response>) {
  return async (request: NextRequest) => {
    const session = await getUserSession(request)

    if (!session) {
      return new Response(JSON.stringify({ error: '認証が必要です' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return handler(request, session)
  }
}

// パスワード変更必須チェック用（change-password以外のページで使用）
export function requireUserWithPasswordChanged(handler: (request: NextRequest, session: UserSession) => Promise<Response>) {
  return async (request: NextRequest) => {
    const session = await getUserSession(request)

    if (!session) {
      return new Response(JSON.stringify({ error: '認証が必要です' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (session.mustChangePassword) {
      return new Response(JSON.stringify({ error: 'パスワードの変更が必要です', mustChangePassword: true }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return handler(request, session)
  }
}
