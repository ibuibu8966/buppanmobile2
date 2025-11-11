'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { step1Schema, step2Schema, step3Schema, step4Schema } from '@/lib/validations'
import { PLAN_PRICES, type ApplicationStep, type PlanType } from '@/lib/types'

type FormData = {
  // ステップ1
  applicantType: 'individual' | 'corporate'
  lastName?: string
  firstName?: string
  lastNameKana?: string
  firstNameKana?: string
  companyName?: string
  companyNameKana?: string
  corporateNumber?: string
  establishedDate?: string
  representativeLastName?: string
  representativeFirstName?: string
  representativeLastNameKana?: string
  representativeFirstNameKana?: string
  representativeBirthDate?: string
  representativePostalCode?: string
  representativeAddress?: string
  contactLastName?: string
  contactFirstName?: string
  contactLastNameKana?: string
  contactFirstNameKana?: string
  phone: string
  email: string
  postalCode: string
  address: string
  dateOfBirth?: string

  // ステップ2
  planType?: PlanType
  lineCount?: number

  // ステップ3
  idCardFrontUrl?: string
  idCardBackUrl?: string
  registrationUrl?: string

  // ステップ4
  agreePrivacy?: boolean
  agreeTerms?: boolean
  agreeTelecom?: boolean
  agreeWithdrawal?: boolean
  agreeNoAntisocial?: boolean
}

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState<ApplicationStep>(1)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingFile, setUploadingFile] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    applicantType: 'individual',
    phone: '',
    email: '',
    postalCode: '',
    address: '',
  })

  // セッションストレージから途中保存データを復元
  useEffect(() => {
    const saved = sessionStorage.getItem('applicationDraft')
    if (saved) {
      const parsed = JSON.parse(saved)
      setFormData(parsed.formData)
      setCurrentStep(parsed.currentStep)
      setApplicationId(parsed.applicationId)
    }
  }, [])

  // フォームデータが変わるたびにセッションストレージに保存
  useEffect(() => {
    sessionStorage.setItem('applicationDraft', JSON.stringify({
      formData,
      currentStep,
      applicationId,
    }))
  }, [formData, currentStep, applicationId])

  const steps = [
    { number: 1, title: '個人情報入力' },
    { number: 2, title: 'プラン選択' },
    { number: 3, title: '書類アップロード' },
    { number: 4, title: '確認' },
    { number: 5, title: '完了' },
  ]

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const saveToDatabase = async (status: 'draft' | 'submitted' = 'draft') => {
    try {
      const totalAmount = formData.planType && formData.lineCount
        ? PLAN_PRICES[formData.planType] * formData.lineCount
        : 0

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: applicationId,
          step: currentStep,
          status,
          data: {
            ...formData,
            totalAmount,
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('APIエラー:', result)
        throw new Error(result.details || result.error || '保存に失敗しました')
      }

      if (result.application && !applicationId) {
        setApplicationId(result.application.id)
      }

      return result
    } catch (error) {
      console.error('保存エラー:', error)
      alert(error instanceof Error ? error.message : '保存に失敗しました')
      throw error
    }
  }

  const nextStep = async () => {
    await saveToDatabase('draft')
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as ApplicationStep)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as ApplicationStep)
    }
  }

  const handleFileUpload = async (file: File, fieldName: string) => {
    try {
      setUploadingFile(fieldName)
      const formDataObj = new FormData()
      formDataObj.append('file', file)
      formDataObj.append('folder', 'documents')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataObj,
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('アップロードAPIエラー:', result)
        throw new Error(result.error || 'アップロードに失敗しました')
      }

      updateFormData({ [fieldName]: result.url })
    } catch (error) {
      console.error('ファイルアップロードエラー:', error)
      alert(error instanceof Error ? error.message : 'ファイルのアップロードに失敗しました')
    } finally {
      setUploadingFile(null)
    }
  }

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true)
      await saveToDatabase('submitted')
      setCurrentStep(5)
      sessionStorage.removeItem('applicationDraft')
    } catch (error) {
      console.error('送信エラー:', error)
      alert('申し込みの送信に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ステップ1の入力チェック
  const isStep1Valid = () => {
    if (formData.applicantType === 'individual') {
      return !!(
        formData.lastName && formData.firstName &&
        formData.lastNameKana && formData.firstNameKana &&
        formData.phone && formData.email &&
        formData.postalCode && formData.address && formData.dateOfBirth
      )
    } else {
      return !!(
        formData.companyName && formData.companyNameKana &&
        formData.corporateNumber && formData.establishedDate &&
        formData.phone && formData.email &&
        formData.representativeLastName && formData.representativeFirstName &&
        formData.representativeLastNameKana && formData.representativeFirstNameKana &&
        formData.representativeBirthDate &&
        formData.representativePostalCode && formData.representativeAddress &&
        formData.contactLastName && formData.contactFirstName &&
        formData.contactLastNameKana && formData.contactFirstNameKana &&
        formData.postalCode && formData.address
      )
    }
  }

  // ステップ2の入力チェック
  const isStep2Valid = () => {
    if (!formData.planType || !formData.lineCount) return false
    if (formData.planType === '3month-50plus' && formData.lineCount < 50) return false
    if (formData.planType === '3month-under50' && formData.lineCount >= 50) return false
    return true
  }

  // ステップ3の入力チェック
  const isStep3Valid = () => {
    if (!formData.idCardFrontUrl || !formData.idCardBackUrl) return false
    if (formData.applicantType === 'corporate' && !formData.registrationUrl) return false
    return true
  }

  // ステップ4の入力チェック
  const isStep4Valid = () => {
    return !!(
      formData.agreePrivacy &&
      formData.agreeTerms &&
      formData.agreeTelecom &&
      formData.agreeWithdrawal &&
      formData.agreeNoAntisocial
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          {/* ヘッダー */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-white">3ヶ月パック</span>
              <span className="text-[#d4af37] ml-2">お申し込み</span>
            </h1>
          </div>

          {/* ステッパー */}
          {currentStep < 5 && (
            <div className="mb-12">
              <div className="flex items-center justify-between max-w-3xl mx-auto">
                {steps.slice(0, 4).map((step, index) => (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                        currentStep >= step.number
                          ? 'bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black'
                          : 'bg-white/10 text-white/40 border-2 border-white/20'
                      }`}>
                        {step.number}
                      </div>
                      <span className={`text-xs mt-2 transition-colors duration-300 ${
                        currentStep >= step.number ? 'text-[#d4af37]' : 'text-white/40'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < 3 && (
                      <div className={`h-0.5 flex-1 mx-2 transition-all duration-300 ${
                        currentStep > step.number ? 'bg-[#d4af37]' : 'bg-white/20'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ステップコンテンツ */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            {/* ステップ1: 個人情報入力 */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">個人情報入力</h2>

                {/* 個人/法人タブ */}
                <div className="flex gap-4 mb-8">
                  <button
                    type="button"
                    onClick={() => updateFormData({ applicantType: 'individual' })}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      formData.applicantType === 'individual'
                        ? 'bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    個人
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFormData({ applicantType: 'corporate' })}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      formData.applicantType === 'corporate'
                        ? 'bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    法人
                  </button>
                </div>

                {/* 個人フォーム */}
                {formData.applicantType === 'individual' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 mb-2">姓<span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={formData.lastName || ''}
                          onChange={(e) => updateFormData({ lastName: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                          placeholder="山田"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 mb-2">名<span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={formData.firstName || ''}
                          onChange={(e) => updateFormData({ firstName: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                          placeholder="太郎"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 mb-2">姓（カナ）<span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={formData.lastNameKana || ''}
                          onChange={(e) => updateFormData({ lastNameKana: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                          placeholder="ヤマダ"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 mb-2">名（カナ）<span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={formData.firstNameKana || ''}
                          onChange={(e) => updateFormData({ firstNameKana: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                          placeholder="タロウ"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">電話番号<span className="text-red-400">*</span></label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData({ phone: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                        placeholder="09012345678"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">メールアドレス<span className="text-red-400">*</span></label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData({ email: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                        placeholder="example@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">郵便番号<span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        value={formData.representativePostalCode || ''}
                        onChange={(e) => updateFormData({ representativePostalCode: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                        placeholder="1234567"
                        maxLength={7}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">住所<span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        value={formData.representativeAddress || ''}
                        onChange={(e) => updateFormData({ representativeAddress: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                        placeholder="東京都渋谷区..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">生年月日<span className="text-red-400">*</span></label>
                      <input
                        type="date"
                        value={formData.dateOfBirth || ''}
                        onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* 法人フォーム */}
                {formData.applicantType === 'corporate' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 mb-2">会社名<span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        value={formData.companyName || ''}
                        onChange={(e) => updateFormData({ companyName: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                        placeholder="株式会社〇〇"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">会社名（カナ）<span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        value={formData.companyNameKana || ''}
                        onChange={(e) => updateFormData({ companyNameKana: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                        placeholder="カブシキガイシャ〇〇"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">法人番号<span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        value={formData.corporateNumber || ''}
                        onChange={(e) => updateFormData({ corporateNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                        placeholder="1234567890123"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">設立年月日<span className="text-red-400">*</span></label>
                      <input
                        type="date"
                        value={formData.establishedDate || ''}
                        onChange={(e) => updateFormData({ establishedDate: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">電話番号<span className="text-red-400">*</span></label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData({ phone: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                        placeholder="0312345678"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">メールアドレス<span className="text-red-400">*</span></label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData({ email: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                        placeholder="contact@company.com"
                        required
                      />
                    </div>

                    <div className="border-t border-white/10 pt-6 mt-6">
                      <h3 className="text-xl font-bold text-white mb-4">代表者情報</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-white/80 mb-2">代表者姓<span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            value={formData.representativeLastName || ''}
                            onChange={(e) => updateFormData({ representativeLastName: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                            placeholder="山田"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 mb-2">代表者名<span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            value={formData.representativeFirstName || ''}
                            onChange={(e) => updateFormData({ representativeFirstName: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                            placeholder="太郎"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-white/80 mb-2">代表者姓（カナ）<span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            value={formData.representativeLastNameKana || ''}
                            onChange={(e) => updateFormData({ representativeLastNameKana: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                            placeholder="ヤマダ"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 mb-2">代表者名（カナ）<span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            value={formData.representativeFirstNameKana || ''}
                            onChange={(e) => updateFormData({ representativeFirstNameKana: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                            placeholder="タロウ"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-white/80 mb-2">代表者生年月日<span className="text-red-400">*</span></label>
                        <input
                          type="date"
                          value={formData.representativeBirthDate || ''}
                          onChange={(e) => updateFormData({ representativeBirthDate: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-white/80 mb-2">代表者郵便番号<span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={formData.representativePostalCode || ''}
                          onChange={(e) => updateFormData({ representativePostalCode: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                          placeholder="1234567"
                          maxLength={7}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white/80 mb-2">代表者住所<span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={formData.representativeAddress || ''}
                          onChange={(e) => updateFormData({ representativeAddress: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                          placeholder="東京都渋谷区..."
                          required
                        />
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-6 mt-6">
                      <h3 className="text-xl font-bold text-white mb-4">担当者情報</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-white/80 mb-2">担当者姓<span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            value={formData.contactLastName || ''}
                            onChange={(e) => updateFormData({ contactLastName: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                            placeholder="佐藤"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 mb-2">担当者名<span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            value={formData.contactFirstName || ''}
                            onChange={(e) => updateFormData({ contactFirstName: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                            placeholder="花子"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/80 mb-2">担当者姓（カナ）<span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            value={formData.contactLastNameKana || ''}
                            onChange={(e) => updateFormData({ contactLastNameKana: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                            placeholder="サトウ"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 mb-2">担当者名（カナ）<span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            value={formData.contactFirstNameKana || ''}
                            onChange={(e) => updateFormData({ contactFirstNameKana: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                            placeholder="ハナコ"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-6 mt-6">
                      <h3 className="text-xl font-bold text-white mb-4">法人所在地情報</h3>

                      <div className="mb-4">
                        <label className="block text-white/80 mb-2">法人郵便番号<span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={formData.postalCode}
                          onChange={(e) => updateFormData({ postalCode: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                          placeholder="1234567"
                          maxLength={7}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white/80 mb-2">法人住所<span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => updateFormData({ address: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                          placeholder="東京都千代田区..."
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  {!isStep1Valid() && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <p className="text-red-400 text-sm font-bold mb-2">
                        ※ 以下の必須項目を入力してください：
                      </p>
                      <ul className="text-red-400 text-xs space-y-1 ml-4">
                        {formData.applicantType === 'individual' ? (
                          <>
                            {!formData.lastName && <li>・ 姓</li>}
                            {!formData.firstName && <li>・ 名</li>}
                            {!formData.lastNameKana && <li>・ 姓（カナ）</li>}
                            {!formData.firstNameKana && <li>・ 名（カナ）</li>}
                            {!formData.phone && <li>・ 電話番号</li>}
                            {!formData.email && <li>・ メールアドレス</li>}
                            {!formData.postalCode && <li>・ 郵便番号</li>}
                            {!formData.address && <li>・ 住所</li>}
                            {!formData.dateOfBirth && <li>・ 生年月日</li>}
                          </>
                        ) : (
                          <>
                            {!formData.companyName && <li>・ 会社名</li>}
                            {!formData.companyNameKana && <li>・ 会社名（カナ）</li>}
                            {!formData.corporateNumber && <li>・ 法人番号</li>}
                            {!formData.establishedDate && <li>・ 設立年月日</li>}
                            {!formData.phone && <li>・ 電話番号</li>}
                            {!formData.email && <li>・ メールアドレス</li>}
                            {!formData.representativeLastName && <li>・ 代表者姓</li>}
                            {!formData.representativeFirstName && <li>・ 代表者名</li>}
                            {!formData.representativeLastNameKana && <li>・ 代表者姓（カナ）</li>}
                            {!formData.representativeFirstNameKana && <li>・ 代表者名（カナ）</li>}
                            {!formData.representativeBirthDate && <li>・ 代表者生年月日</li>}
                            {!formData.representativePostalCode && <li>・ 代表者郵便番号</li>}
                            {!formData.representativeAddress && <li>・ 代表者住所</li>}
                            {!formData.contactLastName && <li>・ 担当者姓</li>}
                            {!formData.contactFirstName && <li>・ 担当者名</li>}
                            {!formData.contactLastNameKana && <li>・ 担当者姓（カナ）</li>}
                            {!formData.contactFirstNameKana && <li>・ 担当者名（カナ）</li>}
                            {!formData.postalCode && <li>・ 郵便番号</li>}
                            {!formData.address && <li>・ 住所</li>}
                          </>
                        )}
                      </ul>
                    </div>
                  )}
                  <button
                    onClick={nextStep}
                    disabled={!isStep1Valid()}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      isStep1Valid()
                        ? 'bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black hover:shadow-xl hover:shadow-[#d4af37]/20'
                        : 'bg-white/10 text-white/40 cursor-not-allowed'
                    }`}
                  >
                    次へ
                  </button>
                </div>
              </div>
            )}

            {/* ステップ2: プラン選択 */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">プラン選択</h2>

                <div className="space-y-6">
                  {/* 3ヶ月パック選択 */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">3ヶ月パック</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <button
                        type="button"
                        onClick={() => updateFormData({ planType: '3month-50plus', lineCount: 50 })}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                          formData.planType === '3month-50plus'
                            ? 'border-[#d4af37] bg-[#d4af37]/20'
                            : 'border-white/20 bg-white/5 hover:border-white/40'
                        }`}
                      >
                        <div className="text-lg font-bold text-white mb-2">50回線以上</div>
                        <div className="text-3xl font-bold text-[#d4af37] mb-2">¥4,200<span className="text-lg text-white/60">/回線</span></div>
                        <div className="text-sm text-white/60">税込</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateFormData({ planType: '3month-under50', lineCount: 1 })}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                          formData.planType === '3month-under50'
                            ? 'border-[#d4af37] bg-[#d4af37]/20'
                            : 'border-white/20 bg-white/5 hover:border-white/40'
                        }`}
                      >
                        <div className="text-lg font-bold text-white mb-2">50回線未満</div>
                        <div className="text-3xl font-bold text-[#d4af37] mb-2">¥4,600<span className="text-lg text-white/60">/回線</span></div>
                        <div className="text-sm text-white/60">税込</div>
                      </button>
                    </div>

                    {/* 回線数入力 */}
                    {formData.planType && (
                      <div className="mt-6">
                        <label className="block text-white/80 mb-2">
                          回線数<span className="text-red-400">*</span>
                          {formData.planType === '3month-50plus' && (
                            <span className="text-sm text-white/60 ml-2">（50回線以上で入力してください）</span>
                          )}
                          {formData.planType === '3month-under50' && (
                            <span className="text-sm text-white/60 ml-2">（50回線未満で入力してください）</span>
                          )}
                        </label>
                        <input
                          type="number"
                          value={formData.lineCount || ''}
                          onChange={(e) => updateFormData({ lineCount: parseInt(e.target.value) || 0 })}
                          min={formData.planType === '3month-50plus' ? 50 : 1}
                          max={formData.planType === '3month-under50' ? 49 : undefined}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                          placeholder="回線数を入力"
                          required
                        />
                      </div>
                    )}

                    {/* 合計金額表示 */}
                    {formData.planType && formData.lineCount && formData.lineCount > 0 && (
                      <div className="mt-6 p-6 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-2xl">
                        <div className="text-center">
                          <div className="text-white/80 mb-2">合計金額</div>
                          <div className="text-3xl font-bold text-[#d4af37] mb-2">
                            {formData.lineCount}回線 × ¥{PLAN_PRICES[formData.planType].toLocaleString()} = ¥{(formData.lineCount * PLAN_PRICES[formData.planType]).toLocaleString()}
                          </div>
                          <div className="text-sm text-white/60">※事務手数料込み</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={prevStep}
                    className="flex-1 py-4 rounded-xl font-bold text-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-300"
                  >
                    戻る
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!isStep2Valid()}
                    className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      isStep2Valid()
                        ? 'bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black hover:shadow-xl hover:shadow-[#d4af37]/20'
                        : 'bg-white/10 text-white/40 cursor-not-allowed'
                    }`}
                  >
                    次へ
                  </button>
                </div>
              </div>
            )}

            {/* ステップ3: 書類アップロード */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">書類アップロード</h2>

                <div className="space-y-6">
                  {/* 身分証明書（表） */}
                  <div>
                    <label className="block text-white/80 mb-2">
                      身分証明書（表）<span className="text-red-400">*</span>
                    </label>
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-[#d4af37]/50 transition-colors">
                      {formData.idCardFrontUrl ? (
                        <div>
                          <div className="text-[#d4af37] mb-2">✓ アップロード完了</div>
                          <button
                            type="button"
                            onClick={() => updateFormData({ idCardFrontUrl: '' })}
                            className="text-sm text-white/60 hover:text-white"
                          >
                            削除して再アップロード
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleFileUpload(file, 'idCardFrontUrl')
                            }}
                            className="hidden"
                            id="idCardFront"
                          />
                          <label
                            htmlFor="idCardFront"
                            className="cursor-pointer inline-block px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                          >
                            {uploadingFile === 'idCardFrontUrl' ? 'アップロード中...' : 'ファイルを選択'}
                          </label>
                          <div className="text-sm text-white/60 mt-2">JPEG, PNG, PDF（最大10MB）</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 身分証明書（裏） */}
                  <div>
                    <label className="block text-white/80 mb-2">
                      身分証明書（裏）<span className="text-red-400">*</span>
                    </label>
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-[#d4af37]/50 transition-colors">
                      {formData.idCardBackUrl ? (
                        <div>
                          <div className="text-[#d4af37] mb-2">✓ アップロード完了</div>
                          <button
                            type="button"
                            onClick={() => updateFormData({ idCardBackUrl: '' })}
                            className="text-sm text-white/60 hover:text-white"
                          >
                            削除して再アップロード
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleFileUpload(file, 'idCardBackUrl')
                            }}
                            className="hidden"
                            id="idCardBack"
                          />
                          <label
                            htmlFor="idCardBack"
                            className="cursor-pointer inline-block px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                          >
                            {uploadingFile === 'idCardBackUrl' ? 'アップロード中...' : 'ファイルを選択'}
                          </label>
                          <div className="text-sm text-white/60 mt-2">JPEG, PNG, PDF（最大10MB）</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 登記簿謄本（法人のみ） */}
                  {formData.applicantType === 'corporate' && (
                    <div>
                      <label className="block text-white/80 mb-2">
                        登記簿謄本（3ヶ月以内発行）<span className="text-red-400">*</span>
                      </label>
                      <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-[#d4af37]/50 transition-colors">
                        {formData.registrationUrl ? (
                          <div>
                            <div className="text-[#d4af37] mb-2">✓ アップロード完了</div>
                            <button
                              type="button"
                              onClick={() => updateFormData({ registrationUrl: '' })}
                              className="text-sm text-white/60 hover:text-white"
                            >
                              削除して再アップロード
                            </button>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleFileUpload(file, 'registrationUrl')
                              }}
                              className="hidden"
                              id="registration"
                            />
                            <label
                              htmlFor="registration"
                              className="cursor-pointer inline-block px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                            >
                              {uploadingFile === 'registrationUrl' ? 'アップロード中...' : 'ファイルを選択'}
                            </label>
                            <div className="text-sm text-white/60 mt-2">PDF（最大10MB）</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={prevStep}
                    className="flex-1 py-4 rounded-xl font-bold text-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-300"
                  >
                    戻る
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={!isStep3Valid()}
                    className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      isStep3Valid()
                        ? 'bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black hover:shadow-xl hover:shadow-[#d4af37]/20'
                        : 'bg-white/10 text-white/40 cursor-not-allowed'
                    }`}
                  >
                    次へ
                  </button>
                </div>
              </div>
            )}

            {/* ステップ4: 確認画面 */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">申し込み内容の確認</h2>

                {/* 申し込み内容表示 */}
                <div className="space-y-6 mb-8">
                  {/* 個人情報 */}
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-[#d4af37] mb-4">個人情報</h3>
                    <div className="space-y-2 text-white/80">
                      {formData.applicantType === 'individual' ? (
                        <>
                          <div className="flex justify-between py-2 border-b border-white/10">
                            <span className="text-white/60">氏名</span>
                            <span>{formData.lastName} {formData.firstName} ({formData.lastNameKana} {formData.firstNameKana})</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-white/10">
                            <span className="text-white/60">生年月日</span>
                            <span>{formData.dateOfBirth}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between py-2 border-b border-white/10">
                            <span className="text-white/60">会社名</span>
                            <span>{formData.companyName} ({formData.companyNameKana})</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-white/10">
                            <span className="text-white/60">法人番号</span>
                            <span>{formData.corporateNumber}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-white/10">
                            <span className="text-white/60">代表者</span>
                            <span>{formData.representativeLastName} {formData.representativeFirstName}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-white/10">
                            <span className="text-white/60">担当者</span>
                            <span>{formData.contactLastName} {formData.contactFirstName}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between py-2 border-b border-white/10">
                        <span className="text-white/60">電話番号</span>
                        <span>{formData.phone}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/10">
                        <span className="text-white/60">メールアドレス</span>
                        <span>{formData.email}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-white/60">住所</span>
                        <span>〒{formData.postalCode} {formData.address}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="mt-4 text-[#d4af37] hover:text-[#f0d970] text-sm"
                    >
                      修正する
                    </button>
                  </div>

                  {/* プラン情報 */}
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-[#d4af37] mb-4">プラン情報</h3>
                    <div className="space-y-2 text-white/80">
                      <div className="flex justify-between py-2 border-b border-white/10">
                        <span className="text-white/60">プラン</span>
                        <span>{formData.planType === '3month-50plus' ? '3ヶ月パック（50回線以上）' : '3ヶ月パック（50回線未満）'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/10">
                        <span className="text-white/60">回線数</span>
                        <span>{formData.lineCount}回線</span>
                      </div>
                      <div className="flex justify-between py-2 text-xl font-bold">
                        <span className="text-white">合計金額</span>
                        <span className="text-[#d4af37]">¥{formData.planType && formData.lineCount ? (PLAN_PRICES[formData.planType] * formData.lineCount).toLocaleString() : 0}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="mt-4 text-[#d4af37] hover:text-[#f0d970] text-sm"
                    >
                      修正する
                    </button>
                  </div>

                  {/* 書類 */}
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-[#d4af37] mb-4">アップロード書類</h3>
                    <div className="space-y-2 text-white/80">
                      <div className="flex justify-between py-2 border-b border-white/10">
                        <span className="text-white/60">身分証明書（表）</span>
                        <span className="text-[#d4af37]">✓ アップロード済み</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/10">
                        <span className="text-white/60">身分証明書（裏）</span>
                        <span className="text-[#d4af37]">✓ アップロード済み</span>
                      </div>
                      {formData.applicantType === 'corporate' && formData.registrationUrl && (
                        <div className="flex justify-between py-2">
                          <span className="text-white/60">登記簿謄本</span>
                          <span className="text-[#d4af37]">✓ アップロード済み</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="mt-4 text-[#d4af37] hover:text-[#f0d970] text-sm"
                    >
                      修正する
                    </button>
                  </div>
                </div>

                {/* 同意チェックボックス */}
                <div className="space-y-4 mb-8">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.agreePrivacy || false}
                      onChange={(e) => updateFormData({ agreePrivacy: e.target.checked })}
                      className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 text-[#d4af37] focus:ring-[#d4af37]"
                    />
                    <span className="text-white/80 group-hover:text-white">
                      <a href="/privacy" target="_blank" className="text-[#d4af37] hover:underline">プライバシーポリシー</a>に同意します
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms || false}
                      onChange={(e) => updateFormData({ agreeTerms: e.target.checked })}
                      className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 text-[#d4af37] focus:ring-[#d4af37]"
                    />
                    <span className="text-white/80 group-hover:text-white">
                      <a href="/terms" target="_blank" className="text-[#d4af37] hover:underline">利用規約</a>に同意します
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.agreeTelecom || false}
                      onChange={(e) => updateFormData({ agreeTelecom: e.target.checked })}
                      className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 text-[#d4af37] focus:ring-[#d4af37]"
                    />
                    <span className="text-white/80 group-hover:text-white">
                      電気通信事業法約款に同意します
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.agreeWithdrawal || false}
                      onChange={(e) => updateFormData({ agreeWithdrawal: e.target.checked })}
                      className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 text-[#d4af37] focus:ring-[#d4af37]"
                    />
                    <span className="text-white/80 group-hover:text-white">
                      初期契約解除制度を確認しました
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.agreeNoAntisocial || false}
                      onChange={(e) => updateFormData({ agreeNoAntisocial: e.target.checked })}
                      className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 text-[#d4af37] focus:ring-[#d4af37]"
                    />
                    <span className="text-white/80 group-hover:text-white">
                      反社会的勢力ではないことを表明し確約します
                    </span>
                  </label>
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={prevStep}
                    className="flex-1 py-4 rounded-xl font-bold text-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-300"
                  >
                    戻る
                  </button>
                  <button
                    onClick={handleFinalSubmit}
                    disabled={!isStep4Valid() || isSubmitting}
                    className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                      isStep4Valid() && !isSubmitting
                        ? 'bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black hover:shadow-xl hover:shadow-[#d4af37]/20'
                        : 'bg-white/10 text-white/40 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? '送信中...' : '申し込む'}
                  </button>
                </div>
              </div>
            )}

            {/* ステップ5: 完了メッセージ */}
            {currentStep === 5 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-[#d4af37] to-[#f0d970] rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h2 className="text-3xl font-bold text-white mb-4">申し込みが完了しました</h2>

                <p className="text-xl text-white/80 mb-8">
                  ありがとうございます。<br />
                  2営業日以内で請求書と申し込み確認のご連絡をさせていただきます。
                </p>

                <a
                  href="/"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black font-bold rounded-xl hover:shadow-xl hover:shadow-[#d4af37]/20 transition-all duration-300"
                >
                  トップページに戻る
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
