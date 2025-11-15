import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { uploadToR2 } from '@/lib/r2'

// POST: ファイルアップロード
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'documents'

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      )
    }

    // ファイルサイズチェック（10MB）
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'ファイルサイズは10MB以下にしてください' },
        { status: 400 }
      )
    }

    // ファイルタイプチェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '対応しているファイル形式: JPEG, PNG, PDF' },
        { status: 400 }
      )
    }

    // ファイル名を生成（タイムスタンプ + オリジナル名）
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || ''
    const sanitizedName = file.name
      .replace(/\.[^/.]+$/, '') // 拡張子を除去
      .replace(/[^a-zA-Z0-9-_]/g, '_') // 英数字とハイフン、アンダースコア以外を置換
    const fileName = `${timestamp}-${sanitizedName}.${fileExtension}`
    const filePath = `${folder}/${fileName}`

    // Supabase Storageにアップロード
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabaseAdmin.storage
      .from('applications')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Supabaseアップロードエラー:', error)

      // バケットが存在しない場合のエラーメッセージ
      if (error.message?.includes('Bucket not found')) {
        return NextResponse.json(
          { error: 'Supabase Storageバケット "applications" が作成されていません。Supabaseダッシュボードで作成してください。' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { error: `ファイルのアップロードに失敗しました: ${error.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    // 公開URLを取得
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('applications')
      .getPublicUrl(filePath)

    // Cloudflare R2にバックアップ（エラーは無視）
    try {
      await uploadToR2(buffer, filePath, file.type)
      console.log('[R2] バックアップ成功:', filePath)
    } catch (r2Error: any) {
      console.error('[WARNING] R2バックアップ失敗（メインストレージは成功）:', {
        filePath,
        error: r2Error.message,
        timestamp: new Date().toISOString(),
      })
      // R2失敗してもユーザーには成功を返す（Supabaseが成功しているため）
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath,
    })
  } catch (error) {
    console.error('ファイルアップロードエラー:', error)
    return NextResponse.json(
      { error: 'ファイルのアップロードに失敗しました' },
      { status: 500 }
    )
  }
}
