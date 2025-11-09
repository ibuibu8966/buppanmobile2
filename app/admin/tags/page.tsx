'use client'

import { useState, useEffect } from 'react'

interface Tag {
  id: string
  name: string
  type: string
  color?: string | null
  order: number
}

export default function TagsPage() {
  const [simLocationTags, setSimLocationTags] = useState<Tag[]>([])
  const [spareTags, setSpareTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  const [isAddingSimLocation, setIsAddingSimLocation] = useState(false)
  const [isAddingSpare, setIsAddingSpare] = useState(false)
  const [newSimLocationName, setNewSimLocationName] = useState('')
  const [newSpareName, setNewSpareName] = useState('')

  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/tags')
      if (!response.ok) {
        throw new Error('Failed to fetch tags')
      }
      const data = await response.json()

      const simLocations = data.tags.filter((tag: Tag) => tag.type === 'sim_location')
      const spares = data.tags.filter((tag: Tag) => tag.type === 'spare')

      setSimLocationTags(simLocations)
      setSpareTags(spares)
    } catch (error) {
      console.error('タグの取得エラー:', error)
      alert('タグの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = async (type: 'sim_location' | 'spare', name: string) => {
    if (!name.trim()) {
      alert('タグ名を入力してください')
      return
    }

    try {
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type,
          order: type === 'sim_location' ? simLocationTags.length : spareTags.length,
        }),
      })

      if (response.ok) {
        if (type === 'sim_location') {
          setNewSimLocationName('')
          setIsAddingSimLocation(false)
        } else {
          setNewSpareName('')
          setIsAddingSpare(false)
        }
        fetchTags()
      } else {
        const data = await response.json()
        alert(data.error || 'タグの作成に失敗しました')
      }
    } catch (error) {
      console.error('タグ作成エラー:', error)
      alert('タグの作成に失敗しました')
    }
  }

  const handleUpdateTag = async (tagId: string, name: string) => {
    if (!name.trim()) {
      alert('タグ名を入力してください')
      return
    }

    try {
      const response = await fetch(`/api/admin/tags/${tagId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })

      if (response.ok) {
        setEditingTag(null)
        setEditingName('')
        fetchTags()
      } else {
        const data = await response.json()
        alert(data.error || 'タグの更新に失敗しました')
      }
    } catch (error) {
      console.error('タグ更新エラー:', error)
      alert('タグの更新に失敗しました')
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('このタグを削除しますか？')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/tags/${tagId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchTags()
      } else {
        const data = await response.json()
        alert(data.error || 'タグの削除に失敗しました')
      }
    } catch (error) {
      console.error('タグ削除エラー:', error)
      alert('タグの削除に失敗しました')
    }
  }

  const startEdit = (tag: Tag) => {
    setEditingTag(tag.id)
    setEditingName(tag.name)
  }

  const cancelEdit = () => {
    setEditingTag(null)
    setEditingName('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">タグ管理</h1>

        <div className="grid grid-cols-2 gap-6">
          {/* SIM Location Tags */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">SIMの場所タグ</h2>
              <button
                onClick={() => setIsAddingSimLocation(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                + 追加
              </button>
            </div>

            {isAddingSimLocation && (
              <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
                <input
                  type="text"
                  value={newSimLocationName}
                  onChange={(e) => setNewSimLocationName(e.target.value)}
                  placeholder="タグ名を入力"
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-gray-900"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddTag('sim_location', newSimLocationName)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingSimLocation(false)
                      setNewSimLocationName('')
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {simLocationTags.length === 0 ? (
                <p className="text-gray-500 text-sm">タグがありません</p>
              ) : (
                simLocationTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
                  >
                    {editingTag === tag.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-gray-900"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateTag(tag.id, editingName)}
                          className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          保存
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-2 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
                        >
                          キャンセル
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-gray-900">{tag.name}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(tag)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDeleteTag(tag.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            削除
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Spare Tags */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">予備タグ</h2>
              <button
                onClick={() => setIsAddingSpare(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                + 追加
              </button>
            </div>

            {isAddingSpare && (
              <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
                <input
                  type="text"
                  value={newSpareName}
                  onChange={(e) => setNewSpareName(e.target.value)}
                  placeholder="タグ名を入力"
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-gray-900"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddTag('spare', newSpareName)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingSpare(false)
                      setNewSpareName('')
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {spareTags.length === 0 ? (
                <p className="text-gray-500 text-sm">タグがありません</p>
              ) : (
                spareTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
                  >
                    {editingTag === tag.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-gray-900"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateTag(tag.id, editingName)}
                          className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          保存
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-2 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
                        >
                          キャンセル
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-gray-900">{tag.name}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(tag)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDeleteTag(tag.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            削除
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
