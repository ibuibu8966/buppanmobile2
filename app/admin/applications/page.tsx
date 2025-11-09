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
  comment1?: string | null
  comment2?: string | null
  createdAt: string
  submittedAt?: string | null
  _count?: {
    lines: number
  }
  lines?: Array<{
    lineStatus: string
  }>
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

  const handleStatusChange = async (applicationId: string, field: 'verificationStatus' | 'paymentStatus', value: string) => {
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })

      if (response.ok) {
        // 成功したら一覧を再取得
        fetchApplications()
      } else {
        alert('ステータスの更新に失敗しました')
      }
    } catch (error) {
      console.error('ステータス更新エラー:', error)
      alert('ステータスの更新に失敗しました')
    }
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

  return (
    <div className="flex flex-col h-full">

      {/* テーブル */}
      <div className="flex-1 overflow-auto bg-white">
        {loading ? (
          <div className="p-8 text-center text-gray-500">読み込み中...</div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">データがありません</div>
        ) : (
          <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th colSpan={9} className="px-3 py-2 text-center text-xs font-bold text-gray-800 border border-gray-300">個人情報/法人情報</th>
                  <th colSpan={3} className="px-3 py-2 text-center text-xs font-bold text-gray-800 border border-gray-300">回線数</th>
                  <th colSpan={3} className="px-3 py-2 text-center text-xs font-bold text-gray-800 border border-gray-300">アップロード画像</th>
                  <th colSpan={2} className="px-3 py-2 text-center text-xs font-bold text-gray-800 border border-gray-300">ステータス</th>
                  <th colSpan={2} className="px-3 py-2 text-center text-xs font-bold text-gray-800 border border-gray-300">コメント</th>
                  <th className="px-3 py-2 text-center text-xs font-bold text-gray-800 border border-gray-300">詳細</th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">個人/法人</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">名前/会社名</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">カナ</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">代表者名</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">担当者名</th>
                  <th className="px-8 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">郵便番号</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">住所</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">電話番号</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">メール</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">申込回線数</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">発送済</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">返却済</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">身分証表</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">身分証裏</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">謄本</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">本人確認</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">決済確認</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">コメント1</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">コメント2</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-300">詳細</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {applications.map((app) => {
                  const verificationBadge = getVerificationBadge(app.verificationStatus)
                  const paymentBadge = getPaymentBadge(app.paymentStatus)

                  return (
                    <tr key={app.id} className="hover:bg-blue-50">
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 border border-gray-300">
                        {app.applicantType === 'individual' ? '個人' : '法人'}
                      </td>
                      <td
                        className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(getApplicantName(app))}
                        title="クリックして全文表示"
                      >
                        {getApplicantName(app)}
                      </td>
                      <td
                        className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(getApplicantNameKana(app))}
                        title="クリックして全文表示"
                      >
                        {getApplicantNameKana(app)}
                      </td>
                      <td
                        className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(getRepresentativeName(app))}
                        title="クリックして全文表示"
                      >
                        {getRepresentativeName(app)}
                      </td>
                      <td
                        className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(getContactName(app))}
                        title="クリックして全文表示"
                      >
                        {getContactName(app)}
                      </td>
                      <td
                        className="px-8 py-2 whitespace-nowrap text-sm text-gray-900 border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(app.postalCode)}
                        title="クリックして全文表示"
                      >
                        {app.postalCode}
                      </td>
                      <td
                        className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(app.address)}
                        title="クリックして全文表示"
                      >
                        {app.address}
                      </td>
                      <td
                        className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(app.phone)}
                        title="クリックして全文表示"
                      >
                        {app.phone}
                      </td>
                      <td
                        className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(app.email)}
                        title="クリックして全文表示"
                      >
                        {app.email}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 border border-gray-300">
                        {app.lineCount}回線
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 border border-gray-300">
                        {getShippedCount(app)}回線
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 border border-gray-300">
                        {getReturnedCount(app)}回線
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm border border-gray-300">
                        {app.idCardFrontUrl ? (
                          <a href={app.idCardFrontUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900">
                            表示
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm border border-gray-300">
                        {app.idCardBackUrl ? (
                          <a href={app.idCardBackUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900">
                            表示
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm border border-gray-300">
                        {app.registrationUrl ? (
                          <a href={app.registrationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900">
                            表示
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap border border-gray-300">
                        <select
                          value={app.verificationStatus}
                          onChange={(e) => handleStatusChange(app.id, 'verificationStatus', e.target.value)}
                          className={`px-2 py-1 text-xs font-semibold rounded border-0 ${verificationBadge.color} cursor-pointer`}
                        >
                          <option value="unverified">未確認</option>
                          <option value="verified">確認済み</option>
                          <option value="issue">不備あり</option>
                        </select>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap border border-gray-300">
                        <select
                          value={app.paymentStatus}
                          onChange={(e) => handleStatusChange(app.id, 'paymentStatus', e.target.value)}
                          className={`px-2 py-1 text-xs font-semibold rounded border-0 ${paymentBadge.color} cursor-pointer`}
                        >
                          <option value="not_issued">未発行</option>
                          <option value="issued">発行済み</option>
                          <option value="paid">入金済み</option>
                        </select>
                      </td>
                      <td
                        className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(app.comment1 || '-')}
                        title="クリックして全文表示"
                      >
                        {app.comment1 || '-'}
                      </td>
                      <td
                        className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate border border-gray-300 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCellClick(app.comment2 || '-')}
                        title="クリックして全文表示"
                      >
                        {app.comment2 || '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium border border-gray-300">
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
    </div>
  )
}
