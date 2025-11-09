import { jwtVerify } from 'jose'
import { NextRequest } from 'next/server'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

export interface AdminSession {
  id: string
  email: string
  name: string
  role: string
}

export async function getAdminSession(request: NextRequest): Promise<AdminSession | null> {
  try {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return null
    }

    const { payload } = await jwtVerify(token, SECRET_KEY)

    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    }
  } catch (error) {
    console.error('認証エラー:', error)
    return null
  }
}

export function requireAdmin(handler: (request: NextRequest, session: AdminSession) => Promise<Response>) {
  return async (request: NextRequest) => {
    const session = await getAdminSession(request)

    if (!session) {
      return new Response(JSON.stringify({ error: '認証が必要です' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return handler(request, session)
  }
}
