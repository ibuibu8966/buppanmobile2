'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ProfileInfo {
  name: string
  email: string
  contractorType: 'individual' | 'corporate'
  phone: string
  address: string
}

type Step = 'plan' | 'confirm' | 'complete'

export default function AdditionalOrderPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('plan')
  const [profile, setProfile] = useState<ProfileInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // フォーム状態
  const [planType, setPlanType] = useState<'3month-50plus' | '3month-under50'>('3month-50plus')
  const [lineCount, setLineCount] = useState<number>(50)

  // 料金計算
  const pricePerLine = planType === '3month-50plus' ? 4200 : 4600
  const totalAmount = pricePerLine * lineCount

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile')
        if (res.ok) {
          const data = await res.json()
          const app = data.contractor || (data.applications?.[0])
          if (app) {
            setProfile({
              name: app.contractorType === 'corporate'
                ? app.companyName
                : `${app.lastName || ''} ${app.firstName || ''}`.trim(),
              email: app.email,
              contractorType: app.contractorType || app.applicantType,
              phone: app.phone,
              address: app.address ? `〒${app.postalCode} ${app.address}` : '',
            })
          }
        }
      } catch {
        setError('契約者情報の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handlePlanChange = (newPlanType: '3month-50plus' | '3month-under50') => {
    setPlanType(newPlanType)
    // プラン変更時に回線数を調整
    if (newPlanType === '3month-50plus' && lineCount < 50) {
      setLineCount(50)
    } else if (newPlanType === '3month-under50' && lineCount >= 50) {
      setLineCount(49)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/user/additional-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, lineCount }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.details ? `${data.error}: ${data.details}` : data.error || '発注に失敗しました')
        return
      }

      setStep('complete')
    } catch {
      setError('発注に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-white/60">読み込み中...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-lg">
        契約者情報が見つかりません
      </div>
    )
  }

  // 完了画面
  if (step === 'complete') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">発注が完了しました</h1>
        <p className="text-white/60 mb-8">
          追加発注を受け付けました。<br />
          内容を確認後、ご連絡いたします。
        </p>
        <Link
          href="/mypage"
          className="inline-block px-8 py-3 bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all duration-300"
        >
          マイページに戻る
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* ヘッダー */}
      <div>
        <Link
          href="/mypage"
          className="inline-flex items-center text-white/60 hover:text-white transition-colors mb-4"
        >
          ← 回線一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold text-white">追加発注</h1>
        <p className="text-white/60 mt-1">
          契約者情報・書類を再利用して追加発注できます
        </p>
      </div>

      {/* ステップインジケーター */}
      <div className="flex items-center justify-center space-x-4">
        <div className={`flex items-center ${step === 'plan' ? 'text-[#d4af37]' : 'text-white/40'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step === 'plan' ? 'bg-[#d4af37] text-black' : 'bg-white/10'
          }`}>1</div>
          <span className="ml-2 text-sm">プラン選択</span>
        </div>
        <div className="w-12 h-px bg-white/20"></div>
        <div className={`flex items-center ${step === 'confirm' ? 'text-[#d4af37]' : 'text-white/40'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step === 'confirm' ? 'bg-[#d4af37] text-black' : 'bg-white/10'
          }`}>2</div>
          <span className="ml-2 text-sm">確認</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* プラン選択 */}
      {step === 'plan' && (
        <div className="space-y-6">
          {/* 契約者情報（表示のみ） */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">契約者情報</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/60">契約者: </span>
                <span className="text-white">{profile.name}</span>
              </div>
              <div>
                <span className="text-white/60">メール: </span>
                <span className="text-white">{profile.email}</span>
              </div>
              <div>
                <span className="text-white/60">電話: </span>
                <span className="text-white">{profile.phone}</span>
              </div>
              <div>
                <span className="text-white/60">住所: </span>
                <span className="text-white">{profile.address}</span>
              </div>
            </div>
            <p className="text-white/40 text-xs mt-4">
              ※ 契約者情報・書類は前回の申込から引き継がれます
            </p>
          </div>

          {/* プラン選択 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">プラン選択</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handlePlanChange('3month-50plus')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  planType === '3month-50plus'
                    ? 'border-[#d4af37] bg-[#d4af37]/10'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <div className="font-bold text-white mb-1">3ヶ月パック（50回線以上）</div>
                <div className="text-[#d4af37] text-2xl font-bold">¥4,200<span className="text-sm text-white/60">/回線</span></div>
              </button>
              <button
                onClick={() => handlePlanChange('3month-under50')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  planType === '3month-under50'
                    ? 'border-[#d4af37] bg-[#d4af37]/10'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <div className="font-bold text-white mb-1">3ヶ月パック（50回線未満）</div>
                <div className="text-[#d4af37] text-2xl font-bold">¥4,600<span className="text-sm text-white/60">/回線</span></div>
              </button>
            </div>
          </div>

          {/* 回線数 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">回線数</h2>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={lineCount}
                onChange={(e) => setLineCount(Math.max(1, parseInt(e.target.value) || 1))}
                min={planType === '3month-50plus' ? 50 : 1}
                max={planType === '3month-under50' ? 49 : 9999}
                className="w-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center text-xl font-bold focus:outline-none focus:border-[#d4af37]"
              />
              <span className="text-white">回線</span>
            </div>
            {planType === '3month-50plus' && lineCount < 50 && (
              <p className="text-red-400 text-sm mt-2">50回線以上の契約が必要です</p>
            )}
            {planType === '3month-under50' && lineCount >= 50 && (
              <p className="text-red-400 text-sm mt-2">49回線以下の契約が必要です</p>
            )}
          </div>

          {/* 合計金額 */}
          <div className="bg-gradient-to-r from-[#d4af37]/20 to-[#f0d970]/10 border border-[#d4af37]/30 rounded-xl p-6">
            <div className="flex justify-between items-center">
              <span className="text-white text-lg">合計金額（税込）</span>
              <span className="text-[#d4af37] text-3xl font-bold">
                ¥{totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="text-white/60 text-sm mt-2">
              ¥{pricePerLine.toLocaleString()} × {lineCount}回線
            </div>
          </div>

          {/* 次へボタン */}
          <div className="flex justify-end">
            <button
              onClick={() => setStep('confirm')}
              disabled={
                (planType === '3month-50plus' && lineCount < 50) ||
                (planType === '3month-under50' && lineCount >= 50)
              }
              className="px-8 py-3 bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              確認画面へ →
            </button>
          </div>
        </div>
      )}

      {/* 確認画面 */}
      {step === 'confirm' && (
        <div className="space-y-6">
          {/* 契約者情報 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">契約者情報</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/60">契約者: </span>
                <span className="text-white">{profile.name}</span>
              </div>
              <div>
                <span className="text-white/60">メール: </span>
                <span className="text-white">{profile.email}</span>
              </div>
              <div>
                <span className="text-white/60">電話: </span>
                <span className="text-white">{profile.phone}</span>
              </div>
              <div>
                <span className="text-white/60">住所: </span>
                <span className="text-white">{profile.address}</span>
              </div>
            </div>
          </div>

          {/* 発注内容 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">発注内容</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">プラン</span>
                <span className="text-white">
                  {planType === '3month-50plus' ? '3ヶ月パック（50回線以上）' : '3ヶ月パック（50回線未満）'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">回線数</span>
                <span className="text-white">{lineCount}回線</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">単価</span>
                <span className="text-white">¥{pricePerLine.toLocaleString()}/回線</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="text-white font-bold">合計金額（税込）</span>
                <span className="text-[#d4af37] text-xl font-bold">¥{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-yellow-400 text-sm">
              発注確定後、内容の確認のためご連絡する場合があります。
            </p>
          </div>

          {/* ボタン */}
          <div className="flex justify-between">
            <button
              onClick={() => setStep('plan')}
              className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              ← 戻る
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '発注中...' : '発注を確定する'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
