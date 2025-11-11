import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createAdmin() {
  const email = 'admin@buppanmobile.com'
  const password = 'change_this_password_immediately'
  const name = 'システム管理者'
  
  // パスワードをハッシュ化
  const hashedPassword = await bcrypt.hash(password, 10)
  
  // 既存の管理者を確認
  const { data: existing } = await supabase
    .from('Admin')
    .select('*')
    .eq('email', email)
    .single()
  
  if (existing) {
    console.log('管理者アカウントは既に存在します')
    // パスワードを更新
    const { error } = await supabase
      .from('Admin')
      .update({
        password: hashedPassword,
        updatedAt: new Date().toISOString()
      })
      .eq('email', email)
    
    if (error) {
      console.error('パスワード更新エラー:', error)
    } else {
      console.log('パスワードを更新しました')
    }
    return
  }
  
  // 新規管理者を作成
  const { data, error } = await supabase
    .from('Admin')
    .insert({
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
      name,
      role: 'super_admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    console.error('管理者作成エラー:', error)
  } else {
    console.log('管理者アカウントを作成しました:', data)
  }
}

createAdmin().catch(console.error)
