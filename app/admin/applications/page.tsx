'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  representativePostalCode?: string | null
  representativeAddress?: string | null
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
  _count?: {
    lines: number
  }
  lines?: Array<{
    lineStatus: string
    shipmentDate?: string | null
    returnDate?: string | null
  }>
}

interface PendingChange {
  verificationStatus?: string
  paymentStatus?: string
}

export default function ApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [modalContent, setModalContent] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [pendingChanges, setPendingChanges] = useState<Record<string, PendingChange>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [selectedImageType, setSelectedImageType] = useState<'front' | 'back' | 'registration'>('front')

  useEffect(() => {
    fetchApplications()
  }, [status, page])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        status,
        search,
      })

      const response = await fetch(`/api/admin/applications?${params}`)

      if (response.status === 401) {
        router.push('/admin/login')
        return
      }

      const data = await response.json()
      setApplications(data.applications)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('データ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchApplications()
  }

  const handleStatusChange = (applicationId: string, field: 'verificationStatus' | 'paymentStatus', value: string) => {
    setPendingChanges(prev => ({
      ...prev,
      [applicationId]: {
        ...prev[applicationId],
        [field]: value
      }
    }))
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      const updates = Object.entries(pendingChanges).map(([id, changes]) => ({
        id,
        ...changes
      }))

      const response = await fetch('/api/admin/applications/batch-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })

      if (response.ok) {
        setPendingChanges({})
        fetchApplications()
        alert('ステータスを一括更新しました')
      } else {
        alert('ステータスの更新に失敗しました')
      }
    } catch (error) {
      console.error('一括更新エラー:', error)
      alert('ステータスの更新に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelAll = () => {
    setPendingChanges({})
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-200 text-gray-800',
      submitted: 'bg-blue-200 text-blue-800',
      processing: 'bg-yellow-200 text-yellow-800',
      completed: 'bg-green-200 text-green-800',
    }
    return colors[status] || 'bg-gray-200 text-gray-800'
  }

  const getApplicantName = (app: Application) => {
    if (app.applicantType === 'individual') {
      return `${app.lastName || ''} ${app.firstName || ''}`
    }
    return app.companyName || ''
  }

  const getApplicantNameKana = (app: Application) => {
    if (app.applicantType === 'individual') {
      return `${app.lastNameKana || ''} ${app.firstNameKana || ''}`
    }
    return app.companyNameKana || ''
  }

  const getRepresentativeName = (app: Application) => {
    if (app.applicantType === 'corporate' && app.representativeLastName) {
      return `${app.representativeLastName || ''} ${app.representativeFirstName || ''}`
    }
    return '-'
  }

  const getContactName = (app: Application) => {
    if (app.applicantType === 'corporate' && app.contactLastName) {
      return `${app.contactLastName || ''} ${app.contactFirstName || ''}`
    }
    return '-'
  }

  const getShippedCount = (app: Application) => {
    if (!app.lines) return 0
    return app.lines.filter(line => line.shipmentDate).length
  }

  const getUnshippedCount = (app: Application) => {
    return app.lineCount - getShippedCount(app)
  }

  const getReturnedCount = (app: Application) => {
    if (!app.lines) return 0
    return app.lines.filter(line => line.returnDate).length
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

  const handleCellClick = (content: string) => {
    setModalContent(content)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalContent(null)
  }

  const openImageModal = (app: Application, imageType: 'front' | 'back' | 'registration') => {
    setSelectedApplication(app)
    setSelectedImageType(imageType)
    setImageModalOpen(true)
  }

  const closeImageModal = () => {
    setImageModalOpen(false)
    setSelectedApplication(null)
  }

  const isExpired = (expirationDate: string | null | undefined) => {
    if (!expirationDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expDate = new Date(expirationDate)
    expDate.setHours(0, 0, 0, 0)
    return expDate < today
  }

  const hasPendingChanges = Object.keys(pendingChanges).length > 0

  return (
    <div className="flex flex-col h-full">

      {/* テーブル */}
      <div className="flex-1 overflow-auto bg-white">
        {loading ? (
          <div className="p-8 text-center text-gray-500">読み込み中...</div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">データがありません</div>
        ) : (
          <>
            {/* 保存/キャンセルボタン */}
            {hasPendingChanges && (
              <div className="sticky top-0 z-10 bg-yellow-100 border-b-2 border-yellow-300 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-yellow-800">
                    {Object.keys(pendingChanges).length}件の変更があります
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelAll}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 text-sm font-medium"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {isSaving ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead className="sticky top-0 z-20">
                <tr className="bg-gray-100">
                  <th colSpan={11} className="px-1 py-0.5 text-center text-[10px] font-bold text-gray-800 border border-gray-300">個人情報/法人情報</th>
                  <th colSpan={4} className="px-1 py-0.5 text-center text-[10px] font-bold text-gray-800 border border-gray-300">回線数</th>
                  <th colSpan={3} className="px-1 py-0.5 text-center text-[10px] font-bold text-gray-800 border border-gray-300">アップロード画像</th>
                  <th className="px-1 py-0.5 text-center text-[10px] font-bold text-gray-800 border border-gray-300">有効期限</th>
                  <th colSpan={2} className="px-1 py-0.5 text-center text-[10px] font-bold text-gray-800 border border-gray-300">ステータス</th>
                  <th colSpan={2} className="px-1 py-0.5 text-center text-[10px] font-bold text-gray-800 border border-gray-300">コメント</th>
                  <th className="px-1 py-0.5 text-center text-[10px] font-bold text-gray-800 border border-gray-300">詳細</th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">個人/法人</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">名前/会社名</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">カナ</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">代表者名</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">担当者名</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">法人郵便番号</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">法人住所</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">代表者郵便番号</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">代表者住所</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">電話番号</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">メール</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">申込回線数</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">発送済</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">未発送</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">返却済</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">身分証表</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">身分証裏</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">謄本</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">有効期限</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">本人確認</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">決済確認</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">コメント1</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">コメント2</th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">詳細</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {applications.map((app) => {
                  const verificationBadge = getVerificationBadge(app.verificationStatus)
                  const paymentBadge = getPaymentBadge(app.paymentStatus)
                  const expired = isExpired(app.expirationDate)
                  const hasChanges = !!pendingChanges[app.id]
                  const currentVerificationStatus = pendingChanges[app.id]?.verificationStatus ?? app.verificationStatus
                  const currentPaymentStatus = pendingChanges[app.id]?.paymentStatus ?? app.paymentStatus

                  return (
                    <tr key={app.id} className={`hover:bg-blue-50 ${expired ? 'border-2 border-red-500' : ''} ${hasChanges ? 'bg-yellow-50' : ''}`}>
                      <td className="px-1 py-0.5 whitespace-nowrap text-[10px] text-gray-900 border border-gray-300">
                        {app.applicantType === 'individual' ? '個人' : '法人'}
                      </td>
                      <td
                        className="px-1 py-0.5 text-[10px] text-gray-900 max-w-xs truncate border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(getApplicantName(app))}
                        title="クリックして全文表示"
                      >
                        {getApplicantName(app)}
                      </td>
                      <td
                        className="px-1 py-0.5 text-[10px] text-gray-900 max-w-xs truncate border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(getApplicantNameKana(app))}
                        title="クリックして全文表示"
                      >
                        {getApplicantNameKana(app)}
                      </td>
                      <td
                        className="px-1 py-0.5 text-[10px] text-gray-900 max-w-xs truncate border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(getRepresentativeName(app))}
                        title="クリックして全文表示"
                      >
                        {getRepresentativeName(app)}
                      </td>
                      <td
                        className="px-1 py-0.5 text-[10px] text-gray-900 max-w-xs truncate border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(getContactName(app))}
                        title="クリックして全文表示"
                      >
                        {getContactName(app)}
                      </td>
                      <td
                        className="px-1 py-0.5 whitespace-nowrap text-[10px] text-gray-900 border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(app.applicantType === 'corporate' ? app.postalCode : '-')}
                        title="クリックして全文表示"
                      >
                        {app.applicantType === 'corporate' ? app.postalCode : '-'}
                      </td>
                      <td
                        className="px-1 py-0.5 text-[10px] text-gray-900 max-w-xs truncate border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(app.applicantType === 'corporate' ? app.address : '-')}
                        title="クリックして全文表示"
                      >
                        {app.applicantType === 'corporate' ? app.address : '-'}
                      </td>
                      <td
                        className="px-1 py-0.5 whitespace-nowrap text-[10px] text-gray-900 border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(app.representativePostalCode || '-')}
                        title="クリックして全文表示"
                      >
                        {app.representativePostalCode || '-'}
                      </td>
                      <td
                        className="px-1 py-0.5 text-[10px] text-gray-900 max-w-xs truncate border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(app.representativeAddress || '-')}
                        title="クリックして全文表示"
                      >
                        {app.representativeAddress || '-'}
                      </td>
                      <td
                        className="px-1 py-0.5 text-[10px] text-gray-900 max-w-xs truncate border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(app.phone)}
                        title="クリックして全文表示"
                      >
                        {app.phone}
                      </td>
                      <td
                        className="px-1 py-0.5 text-[10px] text-gray-900 max-w-xs truncate border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(app.email)}
                        title="クリックして全文表示"
                      >
                        {app.email}
                      </td>
                      <td className="px-1 py-0.5 whitespace-nowrap text-[10px] text-gray-900 border border-gray-300">
                        {app.lineCount}回線
                      </td>
                      <td className="px-1 py-0.5 whitespace-nowrap text-[10px] text-gray-900 border border-gray-300">
                        {getShippedCount(app)}回線
                      </td>
                      <td className="px-1 py-0.5 whitespace-nowrap text-[10px] text-gray-900 border border-gray-300">
                        {getUnshippedCount(app)}回線
                      </td>
                      <td className="px-1 py-0.5 whitespace-nowrap text-[10px] text-gray-900 border border-gray-300">
                        {getReturnedCount(app)}回線
                      </td>
                      <td className="px-1 py-0.5 whitespace-nowrap text-[10px] border border-gray-300">
                        {app.idCardFrontUrl ? (
                          <button onClick={() => openImageModal(app, 'front')} className="text-blue-600 hover:text-blue-900 cursor-pointer">
                            表示
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-1 py-0.5 whitespace-nowrap text-[10px] border border-gray-300">
                        {app.idCardBackUrl ? (
                          <button onClick={() => openImageModal(app, 'back')} className="text-blue-600 hover:text-blue-900 cursor-pointer">
                            表示
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-1 py-0.5 whitespace-nowrap text-[10px] border border-gray-300">
                        {app.registrationUrl ? (
                          <button onClick={() => openImageModal(app, 'registration')} className="text-blue-600 hover:text-blue-900 cursor-pointer">
                            表示
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-1 py-0.5 whitespace-nowrap text-[10px] text-gray-900 border border-gray-300">
                        {app.expirationDate ? (
                          <span className={expired ? 'text-red-600 font-semibold' : ''}>
                            {new Date(app.expirationDate).toLocaleDateString('ja-JP')}
                          </span>
                        ) : (
                          <span className="text-gray-400">未設定</span>
                        )}
                      </td>
                      <td className="px-1 py-0.5 whitespace-nowrap text-[10px] border border-gray-300">
                        <select
                          value={currentVerificationStatus}
                          onChange={(e) => handleStatusChange(app.id, 'verificationStatus', e.target.value)}
                          className={`px-1 py-0.5 text-[10px] font-semibold rounded border-0 ${getVerificationBadge(currentVerificationStatus).color} cursor-pointer`}
                        >
                          <option value="unverified">未確認</option>
                          <option value="verified">確認済み</option>
                          <option value="issue">不備あり</option>
                        </select>
                      </td>
                      <td className="px-1 py-0.5 whitespace-nowrap text-[10px] border border-gray-300">
                        <select
                          value={currentPaymentStatus}
                          onChange={(e) => handleStatusChange(app.id, 'paymentStatus', e.target.value)}
                          className={`px-1 py-0.5 text-[10px] font-semibold rounded border-0 ${getPaymentBadge(currentPaymentStatus).color} cursor-pointer`}
                        >
                          <option value="not_issued">未発行</option>
                          <option value="issued">発行済み</option>
                          <option value="paid">入金済み</option>
                        </select>
                      </td>
                      <td
                        className="px-1 py-0.5 text-[10px] text-gray-900 max-w-xs truncate border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(app.comment1 || '-')}
                        title="クリックして全文表示"
                      >
                        {app.comment1 || '-'}
                      </td>
                      <td
                        className="px-1 py-0.5 text-[10px] text-gray-900 max-w-xs truncate border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(app.comment2 || '-')}
                        title="クリックして全文表示"
                      >
                        {app.comment2 || '-'}
                      </td>
                      <td className="px-1 py-0.5 whitespace-nowrap text-[10px] font-medium border border-gray-300">
                        <Link
                          href={`/admin/applications/${app.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          詳細
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="bg-white px-6 py-4 border-t border-gray-200">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 text-sm"
            >
              前へ
            </button>
            <span className="px-4 py-2 text-sm">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 text-sm"
            >
              次へ
            </button>
          </div>
        </div>
      )}

      {/* モーダル */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">内容</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="text-gray-800 whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
              {modalContent}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  if (modalContent) {
                    navigator.clipboard.writeText(modalContent)
                    alert('コピーしました')
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                コピー
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 画像モーダル */}
      {imageModalOpen && selectedApplication && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">申込情報と画像</h2>
              <button
                onClick={closeImageModal}
                className="text-gray-400 hover:text-gray-600 text-3xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* 左側: 申込情報 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">申込情報</h3>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">申込タイプ:</span>
                    <p className="text-gray-900">{selectedApplication.applicantType === 'individual' ? '個人' : '法人'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">名前/会社名:</span>
                    <p className="text-gray-900">{getApplicantName(selectedApplication)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">カナ:</span>
                    <p className="text-gray-900">{getApplicantNameKana(selectedApplication)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">電話番号:</span>
                    <p className="text-gray-900">{selectedApplication.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-600">メールアドレス:</span>
                    <p className="text-gray-900">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">郵便番号:</span>
                    <p className="text-gray-900">{selectedApplication.postalCode}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-600">住所:</span>
                    <p className="text-gray-900">{selectedApplication.address}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">申込回線数:</span>
                    <p className="text-gray-900">{selectedApplication.lineCount}回線</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">プラン:</span>
                    <p className="text-gray-900">{selectedApplication.planType}</p>
                  </div>
                  {selectedApplication.expirationDate && (
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">身分証有効期限:</span>
                      <p className="text-gray-900">{new Date(selectedApplication.expirationDate).toLocaleDateString('ja-JP')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 右側: 画像 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">画像</h3>

                {/* 画像切り替えタブ */}
                <div className="flex gap-2 border-b">
                  <button
                    onClick={() => setSelectedImageType('front')}
                    className={`px-4 py-2 font-medium ${selectedImageType === 'front' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    身分証（表）
                  </button>
                  <button
                    onClick={() => setSelectedImageType('back')}
                    className={`px-4 py-2 font-medium ${selectedImageType === 'back' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    身分証（裏）
                  </button>
                  {selectedApplication.applicantType === 'corporate' && selectedApplication.registrationUrl && (
                    <button
                      onClick={() => setSelectedImageType('registration')}
                      className={`px-4 py-2 font-medium ${selectedImageType === 'registration' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      謄本
                    </button>
                  )}
                </div>

                {/* 画像表示 */}
                <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
                  {selectedImageType === 'front' && selectedApplication.idCardFrontUrl && (
                    <img src={selectedApplication.idCardFrontUrl} alt="身分証（表）" className="max-w-full max-h-[600px] object-contain" />
                  )}
                  {selectedImageType === 'back' && selectedApplication.idCardBackUrl && (
                    <img src={selectedApplication.idCardBackUrl} alt="身分証（裏）" className="max-w-full max-h-[600px] object-contain" />
                  )}
                  {selectedImageType === 'registration' && selectedApplication.registrationUrl && (
                    <iframe src={selectedApplication.registrationUrl} className="w-full h-[600px]" title="謄本" />
                  )}
                </div>
              </div>
            </div>

            {/* フッター */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={closeImageModal}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
