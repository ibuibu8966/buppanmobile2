import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Cloudflare R2クライアントの初期化
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

/**
 * Cloudflare R2にファイルをアップロードする
 * @param buffer ファイルのバッファ
 * @param filePath R2内のファイルパス
 * @param contentType ファイルのMIMEタイプ
 * @returns アップロード結果
 */
export async function uploadToR2(
  buffer: Buffer,
  filePath: string,
  contentType: string
): Promise<void> {
  const r2Path = `applications/${filePath}`

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: r2Path,
      Body: buffer,
      ContentType: contentType,
    })

    await r2Client.send(command)

    console.log('[R2] アップロード成功:', r2Path)
  } catch (error: any) {
    console.error('[R2] アップロードエラー:', {
      path: r2Path,
      error: error.message,
      timestamp: new Date().toISOString(),
    })
    throw new Error(`R2アップロード失敗: ${error.message}`)
  }
}
