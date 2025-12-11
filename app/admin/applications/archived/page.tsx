'use client'

import { useState, useEffect, useMemo } from 'react'
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

export default function ArchivedApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [modalContent, setModalContent] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    key: string | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })

  useEffect(() => {
    fetchApplications()
  }, [page])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        archived: 'true',
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

  // ソートハンドラー
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // ソート済みデータ
  const sortedApplications = useMemo(() => {
    if (!sortConfig.key) return applications

    const sorted = [...applications].sort((a, b) => {
      let aValue: any = null
      let bValue: any = null

      switch (sortConfig.key) {
        case 'applicantType':
          aValue = a.applicantType === 'individual' ? '個人' : '法人'
          bValue = b.applicantType === 'individual' ? '個人' : '法人'
          break
        case 'applicantName':
          aValue = a.applicantType === 'individual'
            ? `${a.lastName || ''} ${a.firstName || ''}`.trim()
            : a.companyName || ''
          bValue = b.applicantType === 'individual'
            ? `${b.lastName || ''} ${b.firstName || ''}`.trim()
            : b.companyName || ''
          break
        case 'kana':
          aValue = a.applicantType === 'individual'
            ? `${a.lastNameKana || ''} ${a.firstNameKana || ''}`.trim()
            : a.companyNameKana || ''
          bValue = b.applicantType === 'individual'
            ? `${b.lastNameKana || ''} ${b.firstNameKana || ''}`.trim()
            : b.companyNameKana || ''
          break
        case 'phone':
          aValue = a.phone || ''
          bValue = b.phone || ''
          break
        case 'email':
          aValue = a.email || ''
          bValue = b.email || ''
          break
        case 'lineCount':
          aValue = a.lineCount || 0
          bValue = b.lineCount || 0
          break
        case 'createdAt':
          aValue = a.createdAt || ''
          bValue = b.createdAt || ''
          break
        default:
          return 0
      }

      if (!aValue && bValue) return 1
      if (aValue && !bValue) return -1
      if (!aValue && !bValue) return 0

      if (sortConfig.key === 'lineCount') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      } else if (sortConfig.key === 'createdAt') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      } else {
        return sortConfig.direction === 'asc'
          ? aValue.toString().localeCompare(bValue.toString(), 'ja')
          : bValue.toString().localeCompare(aValue.toString(), 'ja')
      }
    })

    return sorted
  }, [applications, sortConfig])

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
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/admin/applications"
              className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
            >
              ← 申し込み一覧に戻る
            </Link>
            <h1 className="text-xl font-bold text-gray-900">アーカイブ済み申し込み</h1>
          </div>
        </div>
      </div>

      {/* テーブル */}
      <div className="flex-1 overflow-auto bg-white">
        {loading ? (
          <div className="p-8 text-center text-gray-500">読み込み中...</div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">アーカイブ済みの申し込みはありません</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="sticky top-0 z-20">
                <tr className="bg-gray-50">
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">詳細</th>
                  <th
                    className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300 cursor-pointer hover:bg-gray-200 select-none"
                    onClick={() => handleSort('applicantType')}
                  >
                    個人/法人 {sortConfig.key === 'applicantType' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300 cursor-pointer hover:bg-gray-200 select-none"
                    onClick={() => handleSort('applicantName')}
                  >
                    名前/会社名 {sortConfig.key === 'applicantName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300 cursor-pointer hover:bg-gray-200 select-none"
                    onClick={() => handleSort('kana')}
                  >
                    カナ {sortConfig.key === 'kana' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300 cursor-pointer hover:bg-gray-200 select-none"
                    onClick={() => handleSort('phone')}
                  >
                    電話番号 {sortConfig.key === 'phone' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300 cursor-pointer hover:bg-gray-200 select-none"
                    onClick={() => handleSort('email')}
                  >
                    メール {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300 cursor-pointer hover:bg-gray-200 select-none"
                    onClick={() => handleSort('lineCount')}
                  >
                    回線数 {sortConfig.key === 'lineCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300 cursor-pointer hover:bg-gray-200 select-none"
                    onClick={() => handleSort('createdAt')}
                  >
                    申込日 {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">詳細</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {sortedApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-blue-50">
                    <td className="px-0.5 py-0.5 text-[10px] font-medium border border-gray-300">
                      <div className="min-w-[2ch] truncate">
                        <Link
                          href={`/admin/applications/${app.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          詳細
                        </Link>
                      </div>
                    </td>
                    <td className="px-0.5 py-0.5 text-[10px] text-gray-900 border border-gray-300">
                      <div className="min-w-[5ch] truncate">
                        {app.applicantType === 'individual' ? '個人' : '法人'}
                      </div>
                    </td>
                    <td className="px-0.5 py-0.5 text-[10px] text-gray-900 border border-gray-300 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleCellClick(getApplicantName(app))}>
                      <div className="min-w-[10ch] truncate" title={getApplicantName(app)}>
                        {getApplicantName(app)}
                      </div>
                    </td>
                    <td className="px-0.5 py-0.5 text-[10px] text-gray-900 border border-gray-300 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleCellClick(getApplicantNameKana(app))}>
                      <div className="min-w-[10ch] truncate" title={getApplicantNameKana(app)}>
                        {getApplicantNameKana(app)}
                      </div>
                    </td>
                    <td className="px-0.5 py-0.5 text-[10px] text-gray-900 border border-gray-300 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleCellClick(app.phone)}>
                      <div className="min-w-[13ch] truncate" title={app.phone}>
                        {app.phone}
                      </div>
                    </td>
                    <td className="px-0.5 py-0.5 text-[10px] text-gray-900 border border-gray-300 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleCellClick(app.email)}>
                      <div className="min-w-[20ch] truncate" title={app.email}>
                        {app.email}
                      </div>
                    </td>
                    <td className="px-0.5 py-0.5 text-[10px] text-gray-900 border border-gray-300">
                      <div className="min-w-[5ch] truncate">
                        {app.lineCount}
                      </div>
                    </td>
                    <td className="px-0.5 py-0.5 text-[10px] text-gray-900 border border-gray-300">
                      <div className="min-w-[10ch] truncate">
                        {new Date(app.createdAt).toLocaleDateString('ja-JP')}
                      </div>
                    </td>
                    <td className="px-0.5 py-0.5 text-[10px] font-medium border border-gray-300">
                      <div className="min-w-[2ch] truncate">
                        <Link
                          href={`/admin/applications/${app.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          詳細
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
