'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Line {
  id: string
  phoneNumber: string | null
  iccid: string | null
  lineStatus: string
  contractMonth: string | null
  shipmentDate: string | null
  returnDate: string | null
  createdAt: string
  updatedAt: string
  application: {
    id: string
    planType: string
    lineCount: number
    totalAmount: number
    applicantType: string
    lastName: string | null
    firstName: string | null
    companyName: string | null
    email: string
    phone: string
    createdAt: string
    status: string
  }
  simLocation: { id: string; name: string; color: string } | null
  spareTag: { id: string; name: string; color: string } | null
}

const statusLabels: Record<string, string> = {
  not_opened: '未開通',
  opened: '開通済み',
  shipped: '発送済み',
  waiting_return: '返却待ち',
  returned: '返却済み',
  canceled: 'キャンセル',
}

const statusColors: Record<string, string> = {
  not_opened: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  opened: 'bg-green-500/20 text-green-400 border-green-500/30',
  shipped: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  waiting_return: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  returned: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  canceled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function LineDetailPage() {
  const params = useParams()
  const [line, setLine] = useState<Line | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLine = async () => {
      try {
        const res = await fetch(`/api/user/lines/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setLine(data.line)
        } else if (res.status === 404) {
          setError('回線が見つかりません')
        } else if (res.status === 403) {
          setError('アクセス権限がありません')
        } else {
          setError('回線情報の取得に失敗しました')
        }
      } catch {
        setError('回線情報の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchLine()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-white/60">読み込み中...</div>
      </div>
    )
  }

  if (error || !line) {
    return (
      <div className="space-y-6">
        <Link
          href="/mypage"
          className="inline-flex items-center text-white/60 hover:text-white transition-colors"
        >
          ← 回線一覧に戻る
        </Link>
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-lg">
          {error || '回線が見つかりません'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <Link
            href="/mypage"
            className="inline-flex items-center text-white/60 hover:text-white transition-colors mb-4"
          >
            ← 回線一覧に戻る
          </Link>
          <h1 className="text-2xl font-bold text-white">回線詳細</h1>
        </div>
        <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${statusColors[line.lineStatus] || statusColors.not_opened}`}>
          {statusLabels[line.lineStatus] || '不明'}
        </span>
      </div>

      {/* 回線情報 */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">回線情報</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="text-white/60 text-sm mb-1">電話番号</div>
            <div className="text-white text-lg font-medium">{line.phoneNumber || '-'}</div>
          </div>
          <div>
            <div className="text-white/60 text-sm mb-1">ICCID</div>
            <div className="text-white font-mono">{line.iccid || '-'}</div>
          </div>
          <div>
            <div className="text-white/60 text-sm mb-1">契約月</div>
            <div className="text-white">{line.contractMonth || '-'}</div>
          </div>
          <div>
            <div className="text-white/60 text-sm mb-1">ステータス</div>
            <div className="text-white">{statusLabels[line.lineStatus] || '不明'}</div>
          </div>
          {line.shipmentDate && (
            <div>
              <div className="text-white/60 text-sm mb-1">発送日</div>
              <div className="text-white">{new Date(line.shipmentDate).toLocaleDateString('ja-JP')}</div>
            </div>
          )}
          {line.returnDate && (
            <div>
              <div className="text-white/60 text-sm mb-1">返却日</div>
              <div className="text-white">{new Date(line.returnDate).toLocaleDateString('ja-JP')}</div>
            </div>
          )}
        </div>
      </div>

      {/* 申込情報 */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">申込情報</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="text-white/60 text-sm mb-1">プラン</div>
            <div className="text-white">
              {line.application.planType === '3month-50plus' ? '3ヶ月パック（50回線以上）' : '3ヶ月パック（50回線未満）'}
            </div>
          </div>
          <div>
            <div className="text-white/60 text-sm mb-1">回線数</div>
            <div className="text-white">{line.application.lineCount}回線</div>
          </div>
          <div>
            <div className="text-white/60 text-sm mb-1">申込日</div>
            <div className="text-white">{new Date(line.application.createdAt).toLocaleDateString('ja-JP')}</div>
          </div>
          <div>
            <div className="text-white/60 text-sm mb-1">契約者</div>
            <div className="text-white">
              {line.application.applicantType === 'corporate'
                ? line.application.companyName
                : `${line.application.lastName || ''} ${line.application.firstName || ''}`.trim()
              }
            </div>
          </div>
        </div>
      </div>

      {/* タグ情報（あれば） */}
      {(line.simLocation || line.spareTag) && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">タグ情報</h2>
          <div className="flex flex-wrap gap-3">
            {line.simLocation && (
              <div
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: `${line.simLocation.color}20`,
                  color: line.simLocation.color,
                  borderColor: `${line.simLocation.color}50`,
                  borderWidth: '1px'
                }}
              >
                SIM場所: {line.simLocation.name}
              </div>
            )}
            {line.spareTag && (
              <div
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: `${line.spareTag.color}20`,
                  color: line.spareTag.color,
                  borderColor: `${line.spareTag.color}50`,
                  borderWidth: '1px'
                }}
              >
                予備: {line.spareTag.name}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 更新日時 */}
      <div className="text-white/40 text-sm text-right">
        最終更新: {new Date(line.updatedAt).toLocaleString('ja-JP')}
      </div>
    </div>
  )
}
