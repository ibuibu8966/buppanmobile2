'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface Tag {
  id: string
  name: string
  type: string
}

interface FilterConfig {
  applicantName: string
  companyName: string
  phoneNumber: string
  iccid: string
  simLocationIds: string[]
  spareTagIds: string[]
  lineStatuses: string[]
  shipmentDateFrom: string
  shipmentDateTo: string
  returnDateFrom: string
  returnDateTo: string
}

const initialFilterConfig: FilterConfig = {
  applicantName: '',
  companyName: '',
  phoneNumber: '',
  iccid: '',
  simLocationIds: [],
  spareTagIds: [],
  lineStatuses: [],
  shipmentDateFrom: '',
  shipmentDateTo: '',
  returnDateFrom: '',
  returnDateTo: '',
}

const LINE_STATUS_OPTIONS = [
  { value: 'not_opened', label: '未開通' },
  { value: 'opened', label: '開通済み' },
  { value: 'shipped', label: '発送済み' },
  { value: 'waiting_return', label: '返却待ち' },
  { value: 'returned', label: '返却済み' },
  { value: 'canceled', label: '解約' },
]

interface Line {
  id: string
  applicationId: string
  phoneNumber?: string | null
  iccid?: string | null
  simLocationId?: string | null
  spareTagId?: string | null
  shipmentDate?: string | null
  returnDate?: string | null
  lineStatus: string
  simLocation?: Tag | null
  spareTag?: Tag | null
  application: {
    id: string
    applicantType: string
    lastName?: string | null
    firstName?: string | null
    companyName?: string | null
  }
}

interface PendingChange {
  phoneNumber?: string | null
  iccid?: string | null
  simLocationId?: string | null
  spareTagId?: string | null
  shipmentDate?: string | null
  returnDate?: string | null
  lineStatus?: string
}

export default function LinesManagementPage() {
  const router = useRouter()
  const [lines, setLines] = useState<Line[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingChanges, setPendingChanges] = useState<Record<string, PendingChange>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set())
  const [bulkSettings, setBulkSettings] = useState({
    simLocationId: '',
    spareTagId: '',
    shipmentDate: '',
    returnDate: '',
    lineStatus: ''
  })
  const [showBulkSettingsModal, setShowBulkSettingsModal] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    key: string | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })
  const [filterConfig, setFilterConfig] = useState<FilterConfig>(initialFilterConfig)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  useEffect(() => {
    fetchLines()
    fetchTags()
  }, [])

  const fetchLines = async () => {
    try {
      setLoading(true)
      // 全申込者のデータを取得（ページネーションなしで全件取得）
      const response = await fetch('/api/admin/applications?page=1&status=all&limit=1000')

      if (response.status === 401) {
        router.push('/admin/login')
        return
      }

      const data = await response.json()

      // 申込者データから回線を抽出
      const allLines: Line[] = []
      data.applications.forEach((app: any) => {
        if (app.lines && app.lines.length > 0) {
          app.lines.forEach((line: any) => {
            allLines.push({
              ...line,
              application: {
                id: app.id,
                applicantType: app.applicantType,
                lastName: app.lastName,
                firstName: app.firstName,
                companyName: app.companyName,
              }
            })
          })
        }
      })

      setLines(allLines)
    } catch (error) {
      console.error('データ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/admin/tags')
      const data = await response.json()
      setTags(data.tags)
    } catch (error) {
      console.error('タグ取得エラー:', error)
    }
  }

  // ソートハンドラー
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getApplicantName = (line: Line) => {
    if (line.application.applicantType === 'individual') {
      return `${line.application.lastName || ''} ${line.application.firstName || ''}`
    }
    return line.application.companyName || '-'
  }

  // フィルター適用済みかどうか
  const hasActiveFilters = useMemo(() => {
    return (
      filterConfig.applicantName !== '' ||
      filterConfig.companyName !== '' ||
      filterConfig.phoneNumber !== '' ||
      filterConfig.iccid !== '' ||
      filterConfig.simLocationIds.length > 0 ||
      filterConfig.spareTagIds.length > 0 ||
      filterConfig.lineStatuses.length > 0 ||
      filterConfig.shipmentDateFrom !== '' ||
      filterConfig.shipmentDateTo !== '' ||
      filterConfig.returnDateFrom !== '' ||
      filterConfig.returnDateTo !== ''
    )
  }, [filterConfig])

  // フィルタークリア
  const handleClearFilters = () => {
    setFilterConfig(initialFilterConfig)
  }

  // フィルター更新
  const updateFilter = <K extends keyof FilterConfig>(key: K, value: FilterConfig[K]) => {
    setFilterConfig(prev => ({ ...prev, [key]: value }))
  }

  // フィルター＆ソート済みデータ
  const filteredAndSortedLines = useMemo(() => {
    // Step 1: フィルタリング
    let filtered = lines.filter(line => {
      // テキストフィルター（部分一致、大文字小文字無視）
      if (filterConfig.applicantName) {
        const name = getApplicantName(line).toLowerCase()
        if (!name.includes(filterConfig.applicantName.toLowerCase())) {
          return false
        }
      }

      if (filterConfig.companyName) {
        const company = (line.application.companyName || '').toLowerCase()
        if (!company.includes(filterConfig.companyName.toLowerCase())) {
          return false
        }
      }

      if (filterConfig.phoneNumber) {
        const phone = (line.phoneNumber || '').toLowerCase()
        if (!phone.includes(filterConfig.phoneNumber.toLowerCase())) {
          return false
        }
      }

      if (filterConfig.iccid) {
        const iccid = (line.iccid || '').toLowerCase()
        if (!iccid.includes(filterConfig.iccid.toLowerCase())) {
          return false
        }
      }

      // セレクトフィルター（複数選択、空配列は全選択、__empty__は未設定を表す）
      if (filterConfig.simLocationIds.length > 0) {
        const hasEmpty = filterConfig.simLocationIds.includes('__empty__')
        const otherIds = filterConfig.simLocationIds.filter(id => id !== '__empty__')
        if (!line.simLocationId) {
          if (!hasEmpty) return false
        } else {
          if (!otherIds.includes(line.simLocationId)) return false
        }
      }

      if (filterConfig.spareTagIds.length > 0) {
        const hasEmpty = filterConfig.spareTagIds.includes('__empty__')
        const otherIds = filterConfig.spareTagIds.filter(id => id !== '__empty__')
        if (!line.spareTagId) {
          if (!hasEmpty) return false
        } else {
          if (!otherIds.includes(line.spareTagId)) return false
        }
      }

      if (filterConfig.lineStatuses.length > 0) {
        if (!filterConfig.lineStatuses.includes(line.lineStatus)) {
          return false
        }
      }

      // 日付フィルター（範囲指定）- 未設定の回線は表示しない
      if (filterConfig.shipmentDateFrom || filterConfig.shipmentDateTo) {
        const date = line.shipmentDate
        if (!date) return false
        if (filterConfig.shipmentDateFrom && date < filterConfig.shipmentDateFrom) return false
        if (filterConfig.shipmentDateTo && date > filterConfig.shipmentDateTo) return false
      }

      if (filterConfig.returnDateFrom || filterConfig.returnDateTo) {
        const date = line.returnDate
        if (!date) return false
        if (filterConfig.returnDateFrom && date < filterConfig.returnDateFrom) return false
        if (filterConfig.returnDateTo && date > filterConfig.returnDateTo) return false
      }

      return true
    })

    // Step 2: ソート
    if (!sortConfig.key) return filtered

    const sorted = [...filtered].sort((a, b) => {
      let aValue: any = null
      let bValue: any = null

      // ソートキーに応じて値を取得
      switch (sortConfig.key) {
        case 'applicantName':
          aValue = a.application.applicantType === 'individual'
            ? `${a.application.lastName || ''} ${a.application.firstName || ''}`.trim()
            : a.application.companyName || ''
          bValue = b.application.applicantType === 'individual'
            ? `${b.application.lastName || ''} ${b.application.firstName || ''}`.trim()
            : b.application.companyName || ''
          break
        case 'companyName':
          aValue = a.application.companyName || ''
          bValue = b.application.companyName || ''
          break
        case 'phoneNumber':
          aValue = a.phoneNumber || ''
          bValue = b.phoneNumber || ''
          break
        case 'iccid':
          aValue = a.iccid || ''
          bValue = b.iccid || ''
          break
        case 'simLocation':
          aValue = a.simLocation?.name || ''
          bValue = b.simLocation?.name || ''
          break
        case 'spareTag':
          aValue = a.spareTag?.name || ''
          bValue = b.spareTag?.name || ''
          break
        case 'shipmentDate':
          aValue = a.shipmentDate || ''
          bValue = b.shipmentDate || ''
          break
        case 'returnDate':
          aValue = a.returnDate || ''
          bValue = b.returnDate || ''
          break
        case 'lineStatus':
          // ステータスのカスタム順序
          const statusOrder: Record<string, number> = {
            'not_opened': 1,
            'opened': 2,
            'shipped': 3,
            'waiting_return': 4,
            'returned': 5,
            'canceled': 6
          }
          aValue = statusOrder[a.lineStatus] || 999
          bValue = statusOrder[b.lineStatus] || 999
          break
        default:
          return 0
      }

      // null/空文字は最後に
      if (!aValue && bValue) return 1
      if (aValue && !bValue) return -1
      if (!aValue && !bValue) return 0

      // 比較
      if (sortConfig.key === 'lineStatus') {
        // 数値比較
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      } else if (sortConfig.key === 'shipmentDate' || sortConfig.key === 'returnDate') {
        // 日付比較
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      } else {
        // 文字列比較（大小文字を区別しない）
        return sortConfig.direction === 'asc'
          ? aValue.toString().localeCompare(bValue.toString(), 'ja')
          : bValue.toString().localeCompare(aValue.toString(), 'ja')
      }
    })

    return sorted
  }, [lines, filterConfig, sortConfig])

  const handleLineChange = (lineId: string, field: keyof PendingChange, value: string | null) => {
    setPendingChanges(prev => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
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

      // 各回線を個別に更新（一括更新APIがないため）
      const results = await Promise.all(
        updates.map(async (update) => {
          const { id, ...data } = update
          const response = await fetch(`/api/admin/lines/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          return response.ok
        })
      )

      if (results.every(r => r)) {
        setPendingChanges({})
        fetchLines()
        alert('回線情報を一括更新しました')
      } else {
        alert('一部の更新に失敗しました')
      }
    } catch (error) {
      console.error('一括更新エラー:', error)
      alert('回線情報の更新に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelAll = () => {
    setPendingChanges({})
  }

  const handleCheckboxChange = (lineId: string) => {
    setSelectedLines(prev => {
      const newSet = new Set(prev)
      if (newSet.has(lineId)) {
        newSet.delete(lineId)
      } else {
        newSet.add(lineId)
      }
      return newSet
    })
  }

  const handleBulkSettingsApply = () => {
    if (selectedLines.size === 0) {
      alert('回線を選択してください')
      return
    }

    // 空でないフィールドのみを適用
    const fieldsToApply: Array<keyof typeof bulkSettings> = []
    if (bulkSettings.simLocationId) fieldsToApply.push('simLocationId')
    if (bulkSettings.spareTagId) fieldsToApply.push('spareTagId')
    if (bulkSettings.shipmentDate) fieldsToApply.push('shipmentDate')
    if (bulkSettings.returnDate) fieldsToApply.push('returnDate')
    if (bulkSettings.lineStatus) fieldsToApply.push('lineStatus')

    if (fieldsToApply.length === 0) {
      alert('設定する項目を入力してください')
      return
    }

    selectedLines.forEach(lineId => {
      fieldsToApply.forEach(field => {
        handleLineChange(lineId, field, bulkSettings[field])
      })
    })

    setShowBulkSettingsModal(false)
    setBulkSettings({
      simLocationId: '',
      spareTagId: '',
      shipmentDate: '',
      returnDate: '',
      lineStatus: ''
    })
    setSelectedLines(new Set())
    alert(`${selectedLines.size}件の回線に${fieldsToApply.length}項目を設定しました`)
  }

  const getCurrentValue = (lineId: string, field: keyof PendingChange, originalValue: any) => {
    return pendingChanges[lineId]?.[field] !== undefined ? pendingChanges[lineId][field] : originalValue
  }

  const hasPendingChanges = Object.keys(pendingChanges).length > 0

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">総合回線管理</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              表示: {filteredAndSortedLines.length}/{lines.length}件
            </span>
            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`px-3 py-1.5 text-sm font-medium rounded border ${
                hasActiveFilters
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
              }`}
            >
              フィルター {isFilterPanelOpen ? '▲' : '▼'}
              {hasActiveFilters && <span className="ml-1 text-blue-600">●</span>}
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800"
              >
                クリア
              </button>
            )}
          </div>
        </div>

        {/* フィルターパネル */}
        {isFilterPanelOpen && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {/* テキストフィルター */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">申込者名</label>
                <input
                  type="text"
                  value={filterConfig.applicantName}
                  onChange={(e) => updateFilter('applicantName', e.target.value)}
                  placeholder="部分一致"
                  className="w-full px-2 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">会社名</label>
                <input
                  type="text"
                  value={filterConfig.companyName}
                  onChange={(e) => updateFilter('companyName', e.target.value)}
                  placeholder="部分一致"
                  className="w-full px-2 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">電話番号</label>
                <input
                  type="text"
                  value={filterConfig.phoneNumber}
                  onChange={(e) => updateFilter('phoneNumber', e.target.value)}
                  placeholder="部分一致"
                  className="w-full px-2 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ICCID</label>
                <input
                  type="text"
                  value={filterConfig.iccid}
                  onChange={(e) => updateFilter('iccid', e.target.value)}
                  placeholder="部分一致"
                  className="w-full px-2 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* セレクトフィルター */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">SIMの場所</label>
                <div className="border border-gray-300 rounded bg-white p-2 max-h-32 overflow-y-auto">
                  <label className="flex items-center gap-2 text-sm text-gray-500 py-0.5 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={filterConfig.simLocationIds.includes('__empty__')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFilter('simLocationIds', [...filterConfig.simLocationIds, '__empty__'])
                        } else {
                          updateFilter('simLocationIds', filterConfig.simLocationIds.filter(id => id !== '__empty__'))
                        }
                      }}
                      className="rounded"
                    />
                    （空）
                  </label>
                  {tags.filter(t => t.type === 'sim_location').map(tag => (
                    <label key={tag.id} className="flex items-center gap-2 text-sm text-gray-900 py-0.5 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={filterConfig.simLocationIds.includes(tag.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFilter('simLocationIds', [...filterConfig.simLocationIds, tag.id])
                          } else {
                            updateFilter('simLocationIds', filterConfig.simLocationIds.filter(id => id !== tag.id))
                          }
                        }}
                        className="rounded"
                      />
                      {tag.name}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">予備タグ</label>
                <div className="border border-gray-300 rounded bg-white p-2 max-h-32 overflow-y-auto">
                  <label className="flex items-center gap-2 text-sm text-gray-500 py-0.5 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={filterConfig.spareTagIds.includes('__empty__')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFilter('spareTagIds', [...filterConfig.spareTagIds, '__empty__'])
                        } else {
                          updateFilter('spareTagIds', filterConfig.spareTagIds.filter(id => id !== '__empty__'))
                        }
                      }}
                      className="rounded"
                    />
                    （空）
                  </label>
                  {tags.filter(t => t.type === 'spare').map(tag => (
                    <label key={tag.id} className="flex items-center gap-2 text-sm text-gray-900 py-0.5 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={filterConfig.spareTagIds.includes(tag.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFilter('spareTagIds', [...filterConfig.spareTagIds, tag.id])
                          } else {
                            updateFilter('spareTagIds', filterConfig.spareTagIds.filter(id => id !== tag.id))
                          }
                        }}
                        className="rounded"
                      />
                      {tag.name}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ステータス</label>
                <div className="border border-gray-300 rounded bg-white p-2 max-h-32 overflow-y-auto">
                  {LINE_STATUS_OPTIONS.map(option => (
                    <label key={option.value} className="flex items-center gap-2 text-sm text-gray-900 py-0.5 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={filterConfig.lineStatuses.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFilter('lineStatuses', [...filterConfig.lineStatuses, option.value])
                          } else {
                            updateFilter('lineStatuses', filterConfig.lineStatuses.filter(v => v !== option.value))
                          }
                        }}
                        className="rounded"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 日付フィルター */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">発送日</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filterConfig.shipmentDateFrom}
                    onChange={(e) => updateFilter('shipmentDateFrom', e.target.value)}
                    className="flex-1 px-2 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-gray-500">〜</span>
                  <input
                    type="date"
                    value={filterConfig.shipmentDateTo}
                    onChange={(e) => updateFilter('shipmentDateTo', e.target.value)}
                    className="flex-1 px-2 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">返却日</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filterConfig.returnDateFrom}
                    onChange={(e) => updateFilter('returnDateFrom', e.target.value)}
                    className="flex-1 px-2 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-gray-500">〜</span>
                  <input
                    type="date"
                    value={filterConfig.returnDateTo}
                    onChange={(e) => updateFilter('returnDateTo', e.target.value)}
                    className="flex-1 px-2 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto bg-white">
        {loading ? (
          <div className="p-8 text-center text-gray-500">読み込み中...</div>
        ) : lines.length === 0 ? (
          <div className="p-8 text-center text-gray-500">回線データがありません</div>
        ) : (
          <>
            {/* 保存/キャンセル/一括発送日設定ボタン */}
            {(hasPendingChanges || selectedLines.size > 0) && (
              <div className="sticky top-0 z-10 bg-yellow-100 border-b-2 border-yellow-300 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {hasPendingChanges && (
                    <span className="text-sm font-semibold text-yellow-800">
                      {Object.keys(pendingChanges).length}件の変更があります
                    </span>
                  )}
                  {selectedLines.size > 0 && (
                    <span className="text-sm font-semibold text-blue-800">
                      {selectedLines.size}件の回線を選択中
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {selectedLines.size > 0 && (
                    <button
                      onClick={() => setShowBulkSettingsModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                    >
                      選択した回線を一括設定
                    </button>
                  )}
                  {hasPendingChanges && (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-gray-50 sticky top-0 z-20">
                  <tr>
                    <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedLines.size === lines.length && lines.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLines(new Set(lines.map(l => l.id)))
                          } else {
                            setSelectedLines(new Set())
                          }
                        }}
                        className="cursor-pointer"
                      />
                    </th>
                    <th
                      className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300 cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('applicantName')}
                    >
                      申込者名 {sortConfig.key === 'applicantName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300 cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('companyName')}
                    >
                      会社名 {sortConfig.key === 'companyName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300 cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('phoneNumber')}
                    >
                      電話番号 {sortConfig.key === 'phoneNumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300 cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('iccid')}
                    >
                      ICCID {sortConfig.key === 'iccid' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300 cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('simLocation')}
                    >
                      SIMの場所 {sortConfig.key === 'simLocation' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300 cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('spareTag')}
                    >
                      予備タグ {sortConfig.key === 'spareTag' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300 cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('shipmentDate')}
                    >
                      発送日 {sortConfig.key === 'shipmentDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300 cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('returnDate')}
                    >
                      返却日 {sortConfig.key === 'returnDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300 cursor-pointer hover:bg-gray-200 select-none"
                      onClick={() => handleSort('lineStatus')}
                    >
                      ステータス {sortConfig.key === 'lineStatus' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredAndSortedLines.map((line) => {
                    const hasChanges = !!pendingChanges[line.id]
                    const isSelected = selectedLines.has(line.id)
                    const currentPhoneNumber = getCurrentValue(line.id, 'phoneNumber', line.phoneNumber)
                    const currentSimLocationId = getCurrentValue(line.id, 'simLocationId', line.simLocationId)
                    const currentSpareTagId = getCurrentValue(line.id, 'spareTagId', line.spareTagId)
                    const currentShipmentDate = getCurrentValue(line.id, 'shipmentDate', line.shipmentDate)
                    const currentReturnDate = getCurrentValue(line.id, 'returnDate', line.returnDate)
                    const currentLineStatus = getCurrentValue(line.id, 'lineStatus', line.lineStatus)

                    return (
                      <tr key={line.id} className={`hover:bg-blue-50 ${hasChanges ? 'bg-yellow-50' : ''} ${isSelected ? 'bg-blue-100' : ''}`}>
                        <td className="px-1 py-0.5 border border-gray-300">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCheckboxChange(line.id)}
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="px-1 py-0.5 whitespace-nowrap text-[10px] text-gray-900 border border-gray-300">
                          {getApplicantName(line)}
                        </td>
                        <td className="px-1 py-0.5 whitespace-nowrap text-[10px] text-gray-900 border border-gray-300">
                          {line.application.applicantType === 'corporate' ? line.application.companyName || '-' : '-'}
                        </td>
                        <td className="px-1 py-0.5 border border-gray-300">
                          <input
                            type="text"
                            value={currentPhoneNumber || ''}
                            onChange={(e) => handleLineChange(line.id, 'phoneNumber', e.target.value)}
                            className="w-full px-1 py-0.5 text-[10px] text-gray-900 border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500"
                            placeholder="電話番号"
                          />
                        </td>
                        <td className="px-1 py-0.5 border border-gray-300">
                          <input
                            type="text"
                            value={getCurrentValue(line.id, 'iccid', line.iccid) || ''}
                            onChange={(e) => handleLineChange(line.id, 'iccid', e.target.value)}
                            className="w-full px-1 py-0.5 text-[10px] text-gray-900 border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500"
                            placeholder="ICCID"
                          />
                        </td>
                        <td className="px-1 py-0.5 border border-gray-300">
                          <select
                            value={currentSimLocationId || ''}
                            onChange={(e) => handleLineChange(line.id, 'simLocationId', e.target.value || null)}
                            className="w-full px-1 py-0.5 text-[10px] text-gray-900 border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="">選択してください</option>
                            {tags.filter(t => t.type === 'sim_location').map(tag => (
                              <option key={tag.id} value={tag.id}>{tag.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-1 py-0.5 border border-gray-300">
                          <select
                            value={currentSpareTagId || ''}
                            onChange={(e) => handleLineChange(line.id, 'spareTagId', e.target.value || null)}
                            className="w-full px-1 py-0.5 text-[10px] text-gray-900 border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="">選択してください</option>
                            {tags.filter(t => t.type === 'spare').map(tag => (
                              <option key={tag.id} value={tag.id}>{tag.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-1 py-0.5 border border-gray-300">
                          <input
                            type="date"
                            value={currentShipmentDate || ''}
                            onChange={(e) => handleLineChange(line.id, 'shipmentDate', e.target.value || null)}
                            className="w-full px-1 py-0.5 text-[10px] text-gray-900 border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-1 py-0.5 border border-gray-300">
                          <input
                            type="date"
                            value={currentReturnDate || ''}
                            onChange={(e) => handleLineChange(line.id, 'returnDate', e.target.value || null)}
                            className="w-full px-1 py-0.5 text-[10px] text-gray-900 border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-1 py-0.5 border border-gray-300">
                          <select
                            value={currentLineStatus}
                            onChange={(e) => handleLineChange(line.id, 'lineStatus', e.target.value)}
                            className="w-full px-1 py-0.5 text-[10px] text-gray-900 border-0 bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 cursor-pointer"
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
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* 一括発送日設定モーダル */}
      {showBulkSettingsModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowBulkSettingsModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">一括設定</h3>
            <p className="text-sm text-gray-600 mb-6">
              選択した{selectedLines.size}件の回線に設定を適用します（空欄の項目は変更されません）
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SIMの場所
                </label>
                <select
                  value={bulkSettings.simLocationId}
                  onChange={(e) => setBulkSettings({...bulkSettings, simLocationId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="">変更しない</option>
                  {tags.filter(t => t.type === 'sim_location').map(tag => (
                    <option key={tag.id} value={tag.id}>{tag.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  予備タグ
                </label>
                <select
                  value={bulkSettings.spareTagId}
                  onChange={(e) => setBulkSettings({...bulkSettings, spareTagId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="">変更しない</option>
                  {tags.filter(t => t.type === 'spare_tag').map(tag => (
                    <option key={tag.id} value={tag.id}>{tag.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  発送日
                </label>
                <input
                  type="date"
                  value={bulkSettings.shipmentDate}
                  onChange={(e) => setBulkSettings({...bulkSettings, shipmentDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  返却日
                </label>
                <input
                  type="date"
                  value={bulkSettings.returnDate}
                  onChange={(e) => setBulkSettings({...bulkSettings, returnDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ステータス
                </label>
                <select
                  value={bulkSettings.lineStatus}
                  onChange={(e) => setBulkSettings({...bulkSettings, lineStatus: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                >
                  <option value="">変更しない</option>
                  <option value="active">利用中</option>
                  <option value="inactive">停止中</option>
                  <option value="cancelled">解約済み</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowBulkSettingsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                キャンセル
              </button>
              <button
                onClick={handleBulkSettingsApply}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                適用
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
