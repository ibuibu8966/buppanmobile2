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
      console.error('Tag fetch error:', error)
      alert('Failed to fetch tags')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = async (type: 'sim_location' | 'spare', name: string) => {
    if (!name.trim()) {
      alert('Please enter tag name')
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
        alert(data.error || 'Failed to create tag')
      }
    } catch (error) {
      console.error('Tag create error:', error)
      alert('Failed to create tag')
    }
  }

  const handleUpdateTag = async (tagId: string, name: string) => {
    if (!name.trim()) {
      alert('Please enter tag name')
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
        alert(data.error || 'Failed to update tag')
      }
    } catch (error) {
      console.error('Tag update error:', error)
      alert('Failed to update tag')
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Delete this tag?')) {
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
        alert(data.error || 'Failed to delete tag')
      }
    } catch (error) {
      console.error('Tag delete error:', error)
      alert('Failed to delete tag')
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
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Tag Management</h1>

        <div className="grid grid-cols-2 gap-6">
          {/* SIM Location Tags */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">SIM Location Tags</h2>
              <button
                onClick={() => setIsAddingSimLocation(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                + Add
              </button>
            </div>

            {isAddingSimLocation && (
              <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
                <input
                  type="text"
                  value={newSimLocationName}
                  onChange={(e) => setNewSimLocationName(e.target.value)}
                  placeholder="Enter tag name"
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-gray-900"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddTag('sim_location', newSimLocationName)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingSimLocation(false)
                      setNewSimLocationName('')
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {simLocationTags.length === 0 ? (
                <p className="text-gray-500 text-sm">No tags</p>
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
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-2 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
                        >
                          Cancel
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
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTag(tag.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
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
              <h2 className="text-xl font-bold text-gray-900">Spare Tags</h2>
              <button
                onClick={() => setIsAddingSpare(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                + Add
              </button>
            </div>

            {isAddingSpare && (
              <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
                <input
                  type="text"
                  value={newSpareName}
                  onChange={(e) => setNewSpareName(e.target.value)}
                  placeholder="Enter tag name"
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-gray-900"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddTag('spare', newSpareName)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingSpare(false)
                      setNewSpareName('')
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {spareTags.length === 0 ? (
                <p className="text-gray-500 text-sm">No tags</p>
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
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-2 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
                        >
                          Cancel
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
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTag(tag.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
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
