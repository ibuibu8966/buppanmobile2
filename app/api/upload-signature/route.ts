import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, folder = 'documents' } = await request.json()

    if (!fileName) {
      return NextResponse.json(
        { error: 'ファイル名が必要です' },
        { status: 400 }
      )
    }

    // ファイルタイプチェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (fileType && !allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: '対応しているファイル形式: JPEG, PNG, PDF' },
        { status: 400 }
      )
    }

    const timestamp = Date.now()
    const sanitizedName = fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]/g, '_')
    const fileExtension = fileName.split('.').pop() || ''
    const filePath = `${folder}/${timestamp}-${sanitizedName}.${fileExtension}`

    // 署名付きURLを生成（有効期限: 1時間）
    const { data, error } = await supabaseAdmin.storage
      .from('applications')
      .createSignedUploadUrl(filePath)

    if (error) {
      console.error('署名付きURL生成エラー:', error)
      return NextResponse.json(
        { error: '署名付きURLの生成に失敗しました' },
        { status: 500 }
      )
    }

    // 公開URLも返す
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('applications')
      .getPublicUrl(filePath)

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: filePath,
      publicUrl: publicUrl,
    })
  } catch (error) {
    console.error('署名付きURL生成エラー:', error)
    return NextResponse.json(
      { error: '署名付きURLの生成に失敗しました' },
      { status: 500 }
    )
  }
}
