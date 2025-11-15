'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Tag {
  id: string
  name: string
  type: string
  color?: string | null
}

interface Line {
  id: string
  phoneNumber?: string | null
  simLocationId?: string | null
  spareTagId?: string | null
  returnDate?: string | null
  shipmentDate?: string | null
  lineStatus: string
  simLocation?: Tag | null
  spareTag?: Tag | null
}

interface Application {
  id: string
  applicantType: string
  lastName?: string | null
  firstName?: string | null
  lastNameKana?: string | null
  firstNameKana?: string | null
  companyName?: string | null
  companyNameKana?: string | null
  representativeLastName?: string | null
  representativeFirstName?: string | null
  contactLastName?: string | null
  contactFirstName?: string | null
  email: string
  phone: string
  postalCode: string
  address: string
  planType: string
  lineCount: number
  totalAmount: number
  status: string
  verificationStatus: string
  paymentStatus: string
  idCardFrontUrl?: string | null
  idCardBackUrl?: string | null
  registrationUrl?: string | null
  expirationDate?: string | null
  comment1?: string | null
  comment2?: string | null
  createdAt: string
  submittedAt?: string | null
  lines: Line[]
}

export default function ApplicationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment1, setComment1] = useState('')
  const [comment2, setComment2] = useState('')
  const [isSavingComments, setIsSavingComments] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [isEditingExpiration, setIsEditingExpiration] = useState(false)
  const [expirationDate, setExpirationDate] = useState('')

  useEffect(() => {
    fetchApplication()
    fetchTags()
  }, [id])

  const fetchApplication = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/applications/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch application')
      }
      const data = await response.json()
      const app = data.application

      // 申込回線数と実際の回線数を比較して、不足している場合は自動作成
      const currentLineCount = app.lines?.length || 0
      const requiredLineCount = app.lineCount

      if (currentLineCount < requiredLineCount) {
        const linesToCreate = requiredLineCount - currentLineCount
        await createInitialLines(app.id, linesToCreate)
        // 再取得して最新の状態を取得
        const updatedResponse = await fetch(`/api/admin/applications/${id}`)
        const updatedData = await updatedResponse.json()
        setApplication(updatedData.application)
        setComment1(updatedData.application.comment1 || '')
        setComment2(updatedData.application.comment2 || '')
      } else {
        setApplication(app)
        setComment1(app.comment1 || '')
        setComment2(app.comment2 || '')
      }
    } catch (error) {
      console.error('申し込み詳細の取得エラー:', error)
      alert('申し込み詳細の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const createInitialLines = async (applicationId: string, count: number) => {
    try {
      const promises = Array.from({ length: count }).map(() =>
        fetch('/api/admin/lines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId }),
        })
      )
      await Promise.all(promises)
    } catch (error) {
      console.error('初期回線作成エラー:', error)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/admin/tags')
      if (response.ok) {
        const data = await response.json()
        setTags(data.tags || [])
      }
    } catch (error) {
      console.error('タグの取得エラー:', error)
    }
  }

  const handleStatusChange = async (field: 'verificationStatus' | 'paymentStatus', value: string) => {
    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })

      if (response.ok) {
        fetchApplication()
      } else {
        alert('ステータスの更新に失敗しました')
      }
    } catch (error) {
      console.error('ステータス更新エラー:', error)
      alert('ステータスの更新に失敗しました')
    }
  }

  const handleSaveExpiration = async () => {
    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expirationDate }),
      })

      if (response.ok) {
        setIsEditingExpiration(false)
        fetchApplication()
        alert('有効期限を更新しました')
      } else {
        alert('有効期限の更新に失敗しました')
      }
    } catch (error) {
      console.error('有効期限更新エラー:', error)
      alert('有効期限の更新に失敗しました')
    }
  }

  const handleSaveComments = async () => {
    try {
      setIsSavingComments(true)
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment1, comment2 }),
      })

      if (response.ok) {
        alert('コメントを保存しました')
        fetchApplication()
      } else {
        alert('コメントの保存に失敗しました')
      }
    } catch (error) {
      console.error('コメント保存エラー:', error)
      alert('コメントの保存に失敗しました')
    } finally {
      setIsSavingComments(false)
    }
  }

  const handleLineUpdate = async (lineId: string, field: string, value: string | null) => {
    try {
      const response = await fetch(`/api/admin/lines/${lineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })

      if (response.ok) {
        fetchApplication()
      } else {
        alert('回線情報の更新に失敗しました')
      }
    } catch (error) {
      console.error('回線情報の更新エラー:', error)
      alert('回線情報の更新に失敗しました')
    }
  }


  const getVerificationBadge = (status: string) => {
    const colors: Record<string, string> = {
      unverified: 'bg-gray-200 text-gray-800',
      verified: 'bg-green-200 text-green-800',
      issue: 'bg-red-200 text-red-800',
    }
    const labels: Record<string, string> = {
      unverified: '未確認',
      verified: '確認済み',
      issue: '不備あり',
    }
    return { color: colors[status] || 'bg-gray-200 text-gray-800', label: labels[status] || status }
  }

  const getPaymentBadge = (status: string) => {
    const colors: Record<string, string> = {
      not_issued: 'bg-gray-200 text-gray-800',
      issued: 'bg-yellow-200 text-yellow-800',
      paid: 'bg-green-200 text-green-800',
    }
    const labels: Record<string, string> = {
      not_issued: '未発行',
      issued: '発行済み',
      paid: '入金済み',
    }
    return { color: colors[status] || 'bg-gray-200 text-gray-800', label: labels[status] || status }
  }

  const getLineStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      not_opened: '未開通',
      opened: '開通済み',
      shipped: '発送済み',
      waiting_return: '返却待ち',
      returned: '返却済み',
      canceled: '解約',
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">申し込み情報が見つかりません</div>
      </div>
    )
  }

  const verificationBadge = getVerificationBadge(application.verificationStatus)
  const paymentBadge = getPaymentBadge(application.paymentStatus)

  return (
    <div className="h-full overflow-auto bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/admin/applications"
              className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
            >
              ← 一覧に戻る
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">申し込み詳細</h1>
          </div>
        </div>

        {/* 申し込み情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">申し込み情報</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">申し込みタイプ</label>
              <p className="mt-1 text-gray-900">
                {application.applicantType === 'individual' ? '個人' : '法人'}
              </p>
            </div>

            {application.applicantType === 'individual' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">名前</label>
                  <p className="mt-1 text-gray-900">
                    {application.lastName} {application.firstName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">カナ</label>
                  <p className="mt-1 text-gray-900">
                    {application.lastNameKana} {application.firstNameKana}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">会社名</label>
                  <p className="mt-1 text-gray-900">{application.companyName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">会社名カナ</label>
                  <p className="mt-1 text-gray-900">{application.companyNameKana}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">代表者名</label>
                  <p className="mt-1 text-gray-900">
                    {application.representativeLastName} {application.representativeFirstName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">担当者名</label>
                  <p className="mt-1 text-gray-900">
                    {application.contactLastName} {application.contactFirstName}
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">電話番号</label>
              <p className="mt-1 text-gray-900">{application.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
              <p className="mt-1 text-gray-900">{application.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">郵便番号</label>
              <p className="mt-1 text-gray-900">{application.postalCode}</p>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">住所</label>
              <p className="mt-1 text-gray-900">{application.address}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">申込回線数</label>
              <p className="mt-1 text-gray-900">{application.lineCount}回線</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">合計金額</label>
              <p className="mt-1 text-gray-900">¥{application.totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* ステータス */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">ステータス</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">本人確認</label>
              <select
                value={application.verificationStatus}
                onChange={(e) => handleStatusChange('verificationStatus', e.target.value)}
                className={`px-3 py-2 text-sm font-semibold rounded border-0 ${verificationBadge.color} cursor-pointer`}
              >
                <option value="unverified">未確認</option>
                <option value="verified">確認済み</option>
                <option value="issue">不備あり</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">決済確認</label>
              <select
                value={application.paymentStatus}
                onChange={(e) => handleStatusChange('paymentStatus', e.target.value)}
                className={`px-3 py-2 text-sm font-semibold rounded border-0 ${paymentBadge.color} cursor-pointer`}
              >
                <option value="not_issued">未発行</option>
                <option value="issued">発行済み</option>
                <option value="paid">入金済み</option>
              </select>
            </div>
          </div>
        </div>

        {/* アップロード画像 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">アップロード画像</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">身分証（表）</label>
              {application.idCardFrontUrl ? (
                <a
                  href={application.idCardFrontUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-900"
                >
                  表示
                </a>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">身分証（裏）</label>
              {application.idCardBackUrl ? (
                <a
                  href={application.idCardBackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-900"
                >
                  表示
                </a>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">謄本</label>
              {application.registrationUrl ? (
                <a
                  href={application.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-900"
                >
                  表示
                </a>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>
          </div>
        </div>

        {/* 有効期限 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">身分証有効期限</h2>
          {isEditingExpiration ? (
            <div className="space-y-4">
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveExpiration}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setIsEditingExpiration(false)
                    setExpirationDate(application.expirationDate ? new Date(application.expirationDate).toISOString().split('T')[0] : '')
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-700 mb-2">
                {application.expirationDate ? (
                  new Date(application.expirationDate).toLocaleDateString('ja-JP')
                ) : (
                  <span className="text-gray-400">未設定</span>
                )}
              </p>
              <button
                onClick={() => {
                  setIsEditingExpiration(true)
                  setExpirationDate(application.expirationDate ? new Date(application.expirationDate).toISOString().split('T')[0] : '')
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                編集
              </button>
            </div>
          )}
        </div>

        {/* コメント */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">コメント</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">コメント1</label>
              <textarea
                value={comment1}
                onChange={(e) => setComment1(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">コメント2</label>
              <textarea
                value={comment2}
                onChange={(e) => setComment2(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
            <button
              onClick={handleSaveComments}
              disabled={isSavingComments}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSavingComments ? '保存中...' : 'コメントを保存'}
            </button>
          </div>
        </div>

        {/* 回線管理 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">回線管理</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">
                    電話番号
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">
                    SIMの場所
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">
                    予備タグ
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">
                    発送日
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">
                    返却日
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">
                    ステータス
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {application.lines.map((line) => (
                  <tr key={line.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm border border-gray-300">
                      <input
                        type="text"
                        value={line.phoneNumber || ''}
                        onChange={(e) => handleLineUpdate(line.id, 'phoneNumber', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"
                        placeholder="電話番号"
                      />
                    </td>
                    <td className="px-3 py-2 text-sm border border-gray-300">
                      <select
                        value={line.simLocationId || ''}
                        onChange={(e) => handleLineUpdate(line.id, 'simLocationId', e.target.value || null)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"
                      >
                        <option value="">選択してください</option>
                        {tags
                          .filter((tag) => tag.type === 'sim_location')
                          .map((tag) => (
                            <option key={tag.id} value={tag.id}>
                              {tag.name}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-sm border border-gray-300">
                      <select
                        value={line.spareTagId || ''}
                        onChange={(e) => handleLineUpdate(line.id, 'spareTagId', e.target.value || null)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"
                      >
                        <option value="">選択してください</option>
                        {tags
                          .filter((tag) => tag.type === 'spare')
                          .map((tag) => (
                            <option key={tag.id} value={tag.id}>
                              {tag.name}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-sm border border-gray-300">
                      <input
                        type="date"
                        value={line.shipmentDate ? line.shipmentDate.split('T')[0] : ''}
                        onChange={(e) => handleLineUpdate(line.id, 'shipmentDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"
                      />
                    </td>
                    <td className="px-3 py-2 text-sm border border-gray-300">
                      <input
                        type="date"
                        value={line.returnDate ? line.returnDate.split('T')[0] : ''}
                        onChange={(e) => handleLineUpdate(line.id, 'returnDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"
                      />
                    </td>
                    <td className="px-3 py-2 text-sm border border-gray-300">
                      <select
                        value={line.lineStatus}
                        onChange={(e) => handleLineUpdate(line.id, 'lineStatus', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"
                      >
                        <option value="not_opened">未開通</option>
                        <option value="opened">開通済み</option>
                        <option value="shipped">発送済み</option>
                        <option value="waiting_return">返却待ち</option>
                        <option value="returned">返却済み</option>
                        <option value="canceled">解約</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
