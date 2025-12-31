'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Contractor {
  id: string
  email: string
  contractorType: string
  lastName: string | null
  firstName: string | null
  companyName: string | null
  phone: string | null
  createdAt: string
  lastLoginAt: string | null
  _count: {
    applications: number
  }
}

interface DuplicateEmail {
  email: string
  count: number
  applications: {
    id: string
    applicantType: string
    lastName: string | null
    firstName: string | null
    companyName: string | null
    status: string
    createdAt: string
    contractorId: string | null
  }[]
}

export default function ContractorsPage() {
  const router = useRouter()
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [duplicates, setDuplicates] = useState<DuplicateEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'contractors' | 'duplicates'>('duplicates')
  const [mergeModalOpen, setMergeModalOpen] = useState(false)
  const [selectedDuplicate, setSelectedDuplicate] = useState<DuplicateEmail | null>(null)
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([])
  const [primaryApplicationId, setPrimaryApplicationId] = useState<string>('')
  const [isMerging, setIsMerging] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // 契約者一覧と重複メール一覧を並列取得
      const [contractorsRes, duplicatesRes] = await Promise.all([
        fetch('/api/admin/contractors'),
        fetch('/api/admin/applications/duplicates'),
      ])

      if (contractorsRes.status === 401 || duplicatesRes.status === 401) {
        router.push('/admin/login')
        return
      }

      const contractorsData = await contractorsRes.json()
      const duplicatesData = await duplicatesRes.json()

      setContractors(contractorsData.contractors || [])
      setDuplicates(duplicatesData.duplicates || [])
    } catch (error) {
      console.error('データ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const openMergeModal = (duplicate: DuplicateEmail) => {
    setSelectedDuplicate(duplicate)
    // デフォルトで全ての申込を選択
    const ids = duplicate.applications.map(app => app.id)
    setSelectedApplicationIds(ids)
    // 最新の申込を基準に設定
    setPrimaryApplicationId(ids[0] || '')
    setMergeModalOpen(true)
  }

  const closeMergeModal = () => {
    setMergeModalOpen(false)
    setSelectedDuplicate(null)
    setSelectedApplicationIds([])
    setPrimaryApplicationId('')
  }

  const handleApplicationSelect = (appId: string) => {
    setSelectedApplicationIds(prev => {
      if (prev.includes(appId)) {
        // 選択解除時、primaryも解除
        if (primaryApplicationId === appId) {
          const remaining = prev.filter(id => id !== appId)
          setPrimaryApplicationId(remaining[0] || '')
        }
        return prev.filter(id => id !== appId)
      } else {
        return [...prev, appId]
      }
    })
  }

  const handleMerge = async () => {
    if (selectedApplicationIds.length < 1) {
      alert('統合する申込を選択してください')
      return
    }

    if (!primaryApplicationId) {
      alert('基準となる申込を選択してください')
      return
    }

    setIsMerging(true)
    try {
      const res = await fetch('/api/admin/contractors/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationIds: selectedApplicationIds,
          primaryApplicationId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || '統合に失敗しました')
        return
      }

      alert(`${data.mergedCount}件の申込を統合しました`)
      closeMergeModal()
      fetchData()
    } catch (error) {
      console.error('統合エラー:', error)
      alert('統合に失敗しました')
    } finally {
      setIsMerging(false)
    }
  }

  const getContractorName = (contractor: Contractor) => {
    if (contractor.contractorType === 'individual') {
      return `${contractor.lastName || ''} ${contractor.firstName || ''}`.trim() || '-'
    }
    return contractor.companyName || '-'
  }

  const getApplicationName = (app: DuplicateEmail['applications'][0]) => {
    if (app.applicantType === 'individual') {
      return `${app.lastName || ''} ${app.firstName || ''}`.trim() || '-'
    }
    return app.companyName || '-'
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-200 text-gray-800',
      submitted: 'bg-blue-200 text-blue-800',
      processing: 'bg-yellow-200 text-yellow-800',
      completed: 'bg-green-200 text-green-800',
    }
    const labels: Record<string, string> = {
      draft: '下書き',
      submitted: '審査中',
      processing: '処理中',
      completed: '完了',
    }
    return { color: colors[status] || 'bg-gray-200 text-gray-800', label: labels[status] || status }
  }

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">契約者管理</h1>
        <p className="text-sm text-gray-600 mt-1">
          契約者の管理と、複数申込の統合を行えます
        </p>
      </div>

      {/* タブ */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('duplicates')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'duplicates'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            重複メールアドレス
            {duplicates.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                {duplicates.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('contractors')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'contractors'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            契約者一覧
            <span className="ml-2 text-gray-400 text-sm">
              ({contractors.length})
            </span>
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {loading ? (
          <div className="text-center text-gray-500 py-12">読み込み中...</div>
        ) : activeTab === 'duplicates' ? (
          /* 重複メールアドレス一覧 */
          duplicates.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                重複なし
              </h3>
              <p className="text-gray-600">
                全ての申込は契約者に紐付けられているか、メールアドレスが重複していません
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {duplicates.map((dup) => (
                <div key={dup.email} className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">{dup.email}</h3>
                      <p className="text-sm text-gray-600">
                        {dup.count}件の申込があります
                      </p>
                    </div>
                    <button
                      onClick={() => openMergeModal(dup)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                    >
                      統合する
                    </button>
                  </div>
                  <div className="p-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-3 py-2 text-left text-gray-600">ID</th>
                          <th className="px-3 py-2 text-left text-gray-600">タイプ</th>
                          <th className="px-3 py-2 text-left text-gray-600">名前/会社名</th>
                          <th className="px-3 py-2 text-left text-gray-600">ステータス</th>
                          <th className="px-3 py-2 text-left text-gray-600">申込日</th>
                          <th className="px-3 py-2 text-left text-gray-600">契約者紐付け</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dup.applications.map((app) => {
                          const statusBadge = getStatusBadge(app.status)
                          return (
                            <tr key={app.id} className="border-t border-gray-100 hover:bg-gray-50">
                              <td className="px-3 py-2">
                                <Link
                                  href={`/admin/applications/${app.id}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {app.id.substring(0, 8)}...
                                </Link>
                              </td>
                              <td className="px-3 py-2">
                                {app.applicantType === 'individual' ? '個人' : '法人'}
                              </td>
                              <td className="px-3 py-2">{getApplicationName(app)}</td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge.color}`}>
                                  {statusBadge.label}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                {new Date(app.createdAt).toLocaleDateString('ja-JP')}
                              </td>
                              <td className="px-3 py-2">
                                {app.contractorId ? (
                                  <span className="text-green-600">紐付け済み</span>
                                ) : (
                                  <span className="text-gray-400">未紐付け</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* 契約者一覧 */
          contractors.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">契約者がまだ登録されていません</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">メールアドレス</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">タイプ</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">名前/会社名</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">電話番号</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">申込数</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">登録日</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">最終ログイン</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {contractors.map((contractor) => (
                    <tr key={contractor.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {contractor.id.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{contractor.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {contractor.contractorType === 'individual' ? '個人' : '法人'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {getContractorName(contractor)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {contractor.phone || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {contractor._count.applications}件
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(contractor.createdAt).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {contractor.lastLoginAt
                          ? new Date(contractor.lastLoginAt).toLocaleDateString('ja-JP')
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* 統合モーダル */}
      {mergeModalOpen && selectedDuplicate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeMergeModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">申込の統合</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedDuplicate.email} の申込を統合します
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* 説明 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">統合について</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 選択した申込を1つの契約者（Contractor）に紐付けます</li>
                  <li>• 基準となる申込の情報を契約者情報として使用します</li>
                  <li>• 既に契約者が存在する場合は、その契約者に紐付けます</li>
                </ul>
              </div>

              {/* 申込選択 */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">統合する申込を選択</h3>
                <div className="space-y-2">
                  {selectedDuplicate.applications.map((app) => {
                    const isSelected = selectedApplicationIds.includes(app.id)
                    const isPrimary = primaryApplicationId === app.id
                    const statusBadge = getStatusBadge(app.status)

                    return (
                      <div
                        key={app.id}
                        className={`border rounded-lg p-4 transition-colors ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        } ${isPrimary ? 'ring-2 ring-yellow-400' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleApplicationSelect(app.id)}
                              className="w-5 h-5 text-blue-600 rounded"
                            />
                            <div>
                              <div className="font-medium text-gray-900">
                                {getApplicationName(app)}
                                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${statusBadge.color}`}>
                                  {statusBadge.label}
                                </span>
                                {app.contractorId && (
                                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                    紐付け済み
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                {app.applicantType === 'individual' ? '個人' : '法人'} ・
                                申込日: {new Date(app.createdAt).toLocaleDateString('ja-JP')} ・
                                ID: {app.id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <button
                              onClick={() => setPrimaryApplicationId(app.id)}
                              className={`px-3 py-1 text-sm rounded transition-colors ${
                                isPrimary
                                  ? 'bg-yellow-400 text-yellow-900 font-medium'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {isPrimary ? '基準' : '基準にする'}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 注意事項 */}
              {selectedApplicationIds.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">確認</h3>
                  <p className="text-sm text-yellow-800">
                    {selectedApplicationIds.length}件の申込を統合します。
                    {primaryApplicationId && (
                      <>
                        <br />
                        基準となる申込: {selectedDuplicate.applications.find(a => a.id === primaryApplicationId)?.id.substring(0, 8)}...
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeMergeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={handleMerge}
                disabled={isMerging || selectedApplicationIds.length < 1 || !primaryApplicationId}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMerging ? '統合中...' : '統合する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
