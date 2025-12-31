'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Application {
  id: string
  applicantType: string
  lastName: string | null
  firstName: string | null
  lastNameKana: string | null
  firstNameKana: string | null
  companyName: string | null
  companyNameKana: string | null
  corporateNumber: string | null
  phone: string
  email: string
  postalCode: string
  address: string
  dateOfBirth: string | null
  representativeLastName: string | null
  representativeFirstName: string | null
  contactLastName: string | null
  contactFirstName: string | null
  idCardFrontUrl: string | null
  idCardBackUrl: string | null
  registrationUrl: string | null
  expirationDate: string | null
  createdAt: string
  status: string
}

interface Contractor {
  id: string
  email: string
  contractorType: string
  lastName: string | null
  firstName: string | null
  lastNameKana: string | null
  firstNameKana: string | null
  companyName: string | null
  companyNameKana: string | null
  corporateNumber: string | null
  phone: string | null
  postalCode: string | null
  address: string | null
  idCardFrontUrl: string | null
  idCardBackUrl: string | null
  registrationUrl: string | null
  expirationDate: string | null
}

export default function ProfilePage() {
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile')
        if (res.ok) {
          const data = await res.json()
          setContractor(data.contractor)
          setApplications(data.applications)
        } else {
          setError('プロフィールの取得に失敗しました')
        }
      } catch {
        setError('プロフィールの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
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

  // 表示用の情報（Contractorがあればそちら、なければ最初のApplication）
  const displayInfo = contractor || (applications.length > 0 ? {
    ...applications[0],
    contractorType: applications[0].applicantType,
  } : null)

  if (!displayInfo) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
        <div className="text-white/40 text-lg">契約者情報がありません</div>
      </div>
    )
  }

  const isIndividual = displayInfo.contractorType === 'individual'

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">契約者情報</h1>
          <p className="text-white/60 mt-1">登録されている契約者情報を確認できます</p>
        </div>
        <Link
          href="/mypage/change-password"
          className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          パスワード変更
        </Link>
      </div>

      {/* 基本情報 */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center">
          <span className="mr-2">👤</span>
          {isIndividual ? '個人情報' : '法人情報'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {isIndividual ? (
            <>
              <div>
                <div className="text-white/60 text-sm mb-1">氏名</div>
                <div className="text-white">{displayInfo.lastName} {displayInfo.firstName}</div>
              </div>
              <div>
                <div className="text-white/60 text-sm mb-1">氏名（カナ）</div>
                <div className="text-white">{displayInfo.lastNameKana} {displayInfo.firstNameKana}</div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="text-white/60 text-sm mb-1">法人名</div>
                <div className="text-white">{displayInfo.companyName}</div>
              </div>
              <div>
                <div className="text-white/60 text-sm mb-1">法人名（カナ）</div>
                <div className="text-white">{displayInfo.companyNameKana}</div>
              </div>
              <div>
                <div className="text-white/60 text-sm mb-1">法人番号</div>
                <div className="text-white">{displayInfo.corporateNumber || '-'}</div>
              </div>
            </>
          )}
          <div>
            <div className="text-white/60 text-sm mb-1">電話番号</div>
            <div className="text-white">{displayInfo.phone || '-'}</div>
          </div>
          <div>
            <div className="text-white/60 text-sm mb-1">メールアドレス</div>
            <div className="text-white">{displayInfo.email}</div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-white/60 text-sm mb-1">住所</div>
            <div className="text-white">
              〒{displayInfo.postalCode}　{displayInfo.address}
            </div>
          </div>
        </div>
      </div>

      {/* 代表者・担当者情報（法人の場合） */}
      {!isIndividual && applications.length > 0 && applications[0].representativeLastName && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            <span className="mr-2">👔</span>
            代表者・担当者情報
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="text-white/60 text-sm mb-1">代表者名</div>
              <div className="text-white">
                {applications[0].representativeLastName} {applications[0].representativeFirstName}
              </div>
            </div>
            {applications[0].contactLastName && (
              <div>
                <div className="text-white/60 text-sm mb-1">担当者名</div>
                <div className="text-white">
                  {applications[0].contactLastName} {applications[0].contactFirstName}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 登録書類 */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center">
          <span className="mr-2">📄</span>
          登録書類
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="text-white/60 text-sm mb-2">身分証明書（表）</div>
            {displayInfo.idCardFrontUrl ? (
              <div className="text-green-400 text-sm">登録済み</div>
            ) : (
              <div className="text-white/40 text-sm">未登録</div>
            )}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="text-white/60 text-sm mb-2">身分証明書（裏）</div>
            {displayInfo.idCardBackUrl ? (
              <div className="text-green-400 text-sm">登録済み</div>
            ) : (
              <div className="text-white/40 text-sm">未登録</div>
            )}
          </div>
          {!isIndividual && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="text-white/60 text-sm mb-2">登記簿謄本</div>
              {displayInfo.registrationUrl ? (
                <div className="text-green-400 text-sm">登録済み</div>
              ) : (
                <div className="text-white/40 text-sm">未登録</div>
              )}
            </div>
          )}
          {displayInfo.expirationDate && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="text-white/60 text-sm mb-2">有効期限</div>
              <div className="text-white text-sm">
                {new Date(displayInfo.expirationDate).toLocaleDateString('ja-JP')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 申込履歴 */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center">
          <span className="mr-2">📋</span>
          申込履歴
        </h2>
        {applications.length === 0 ? (
          <div className="text-white/40">申込履歴がありません</div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-4 bg-white/5 rounded-lg"
              >
                <div>
                  <div className="text-white font-medium">
                    {new Date(app.createdAt).toLocaleDateString('ja-JP')} の申込
                  </div>
                  <div className="text-white/60 text-sm">
                    申込ID: {app.id.substring(0, 8)}...
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    app.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    app.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                    app.status === 'submitted' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {app.status === 'completed' ? '完了' :
                     app.status === 'processing' ? '処理中' :
                     app.status === 'submitted' ? '審査中' :
                     app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
