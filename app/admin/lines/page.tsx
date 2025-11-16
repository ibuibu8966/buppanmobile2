'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Tag {
  id: string
  name: string
  type: string
}

interface Line {
  id: string
  applicationId: string
  phoneNumber?: string | null
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

  const getApplicantName = (line: Line) => {
    if (line.application.applicantType === 'individual') {
      return `${line.application.lastName || ''} ${line.application.firstName || ''}`
    }
    return line.application.companyName || '-'
  }

  const getCurrentValue = (lineId: string, field: keyof PendingChange, originalValue: any) => {
    return pendingChanges[lineId]?.[field] !== undefined ? pendingChanges[lineId][field] : originalValue
  }

  const hasPendingChanges = Object.keys(pendingChanges).length > 0

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">総合回線管理</h1>
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
                    <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">申込者名</th>
                    <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">会社名</th>
                    <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">電話番号</th>
                    <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">SIMの場所</th>
                    <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">予備タグ</th>
                    <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">発送日</th>
                    <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">返却日</th>
                    <th className="px-1 py-0.5 text-left text-[10px] font-semibold text-gray-700 border border-gray-300">ステータス</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {lines.map((line) => {
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
