import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@buppanmobile.com'
  const password = process.env.ADMIN_PASSWORD || 'change_this_password_immediately'
  const name = '管理者'

  console.log('管理者アカウントを作成しています...')
  console.log(`メールアドレス: ${email}`)

  // 既存の管理者をチェック
  const existingAdmin = await prisma.admin.findUnique({
    where: { email },
  })

  if (existingAdmin) {
    console.log('⚠️  このメールアドレスの管理者は既に存在します')

    // パスワードを更新するか確認
    console.log('パスワードを更新します...')

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.admin.update({
      where: { email },
      data: { password: hashedPassword },
    })

    console.log('✅ パスワードを更新しました')
    return
  }

  // 新規管理者を作成
  const hashedPassword = await bcrypt.hash(password, 10)

  const admin = await prisma.admin.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'admin',
    },
  })

  console.log('✅ 管理者アカウントを作成しました')
  console.log(`ID: ${admin.id}`)
  console.log(`メールアドレス: ${admin.email}`)
  console.log(`名前: ${admin.name}`)
  console.log('\n⚠️  重要: 本番環境では必ずパスワードを変更してください!')
}

main()
  .catch((e) => {
    console.error('エラーが発生しました:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
