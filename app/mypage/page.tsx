'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Line {
  id: string
  phoneNumber: string | null
  iccid: string | null
  lineStatus: string
  contractMonth: string | null
  createdAt: string
  application: {
    id: string
    planType: string
    createdAt: string
    status: string
  }
}

interface Summary {
  total: number
  not_opened?: number
  opened?: number
  shipped?: number
  waiting_return?: number
  returned?: number
  canceled?: number
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
  not_opened: 'bg-gray-500/20 text-gray-400',
  opened: 'bg-green-500/20 text-green-400',
  shipped: 'bg-blue-500/20 text-blue-400',
  waiting_return: 'bg-yellow-500/20 text-yellow-400',
  returned: 'bg-purple-500/20 text-purple-400',
  canceled: 'bg-red-500/20 text-red-400',
}

export default function MypageDashboard() {
  const [lines, setLines] = useState<Line[]>([])
  const [summary, setSummary] = useState<Summary>({ total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLines = async () => {
      try {
        const res = await fetch('/api/user/lines')
        if (res.ok) {
          const data = await res.json()
          setLines(data.lines)
          setSummary(data.summary)
        } else {
          setError('回線情報の取得に失敗しました')
        }
      } catch {
        setError('回線情報の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchLines()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-white/60">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">契約回線一覧</h1>
          <p className="text-white/60 mt-1">契約中の回線を確認できます</p>
        </div>
        <Link
          href="/mypage/order"
          className="px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all duration-300"
        >
          + 追加発注
        </Link>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-white/60 text-sm">総回線数</div>
          <div className="text-2xl font-bold text-white mt-1">{summary.total}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-white/60 text-sm">開通済み</div>
          <div className="text-2xl font-bold text-green-400 mt-1">{summary.opened || 0}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-white/60 text-sm">発送済み</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">{summary.shipped || 0}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-white/60 text-sm">未開通</div>
          <div className="text-2xl font-bold text-gray-400 mt-1">{summary.not_opened || 0}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-white/60 text-sm">返却待ち</div>
          <div className="text-2xl font-bold text-yellow-400 mt-1">{summary.waiting_return || 0}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-white/60 text-sm">返却済み</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">{summary.returned || 0}</div>
        </div>
      </div>

      {/* 回線一覧 */}
      {lines.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <div className="text-white/40 text-lg mb-4">契約回線がありません</div>
          <Link
            href="/mypage/order"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all duration-300"
          >
            新規発注する
          </Link>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {/* デスクトップテーブル */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 text-white/60 font-medium text-sm">電話番号</th>
                  <th className="text-left py-4 px-6 text-white/60 font-medium text-sm">ICCID</th>
                  <th className="text-left py-4 px-6 text-white/60 font-medium text-sm">ステータス</th>
                  <th className="text-left py-4 px-6 text-white/60 font-medium text-sm">契約月</th>
                  <th className="text-left py-4 px-6 text-white/60 font-medium text-sm">プラン</th>
                  <th className="text-left py-4 px-6 text-white/60 font-medium text-sm">申込日</th>
                  <th className="text-right py-4 px-6 text-white/60 font-medium text-sm"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 text-white font-medium">
                      {line.phoneNumber || '-'}
                    </td>
                    <td className="py-4 px-6 text-white/70 font-mono text-sm">
                      {line.iccid || '-'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[line.lineStatus] || statusColors.not_opened}`}>
                        {statusLabels[line.lineStatus] || '不明'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-white/70">
                      {line.contractMonth || '-'}
                    </td>
                    <td className="py-4 px-6 text-white/70">
                      {line.application.planType === '3month-50plus' ? '50回線以上' : '50回線未満'}
                    </td>
                    <td className="py-4 px-6 text-white/70">
                      {new Date(line.application.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/mypage/lines/${line.id}`}
                        className="text-[#d4af37] hover:text-[#f0d970] text-sm font-medium transition-colors"
                      >
                        詳細 →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* モバイルカード */}
          <div className="md:hidden divide-y divide-white/10">
            {lines.map((line) => (
              <Link
                key={line.id}
                href={`/mypage/lines/${line.id}`}
                className="block p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="text-white font-medium">
                    {line.phoneNumber || '電話番号未設定'}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[line.lineStatus] || statusColors.not_opened}`}>
                    {statusLabels[line.lineStatus] || '不明'}
                  </span>
                </div>
                <div className="text-white/50 text-sm space-y-1">
                  <div>ICCID: {line.iccid || '-'}</div>
                  <div>契約月: {line.contractMonth || '-'}</div>
                  <div>申込日: {new Date(line.application.createdAt).toLocaleDateString('ja-JP')}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
