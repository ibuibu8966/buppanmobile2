'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

type ApplyType = 'new' | 'mnp';
type Step = 1 | 2 | 3 | 4;

export default function ApplyPage() {
  const searchParams = useSearchParams();
  const [applyType, setApplyType] = useState<ApplyType>('new');
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    // Step 1: Identity Verification
    applicantType: 'individual',
    fullName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    address: '',
    companyName: '',
    companyRegistration: '',

    // Step 2: Plan Selection
    plan: '1GB',
    callOption: 'none',
    lineCount: '1',

    // Step 3: Payment
    paymentMethod: 'credit',

    // MNP Specific
    mnpNumber: '',
    mnpExpiry: '',
    carrierType: '',
  });

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'mnp' || type === 'new') {
      setApplyType(type);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('申込が完了しました！（デモ）');
  };

  const steps = [
    { number: 1, title: '本人確認' },
    { number: 2, title: 'プラン選択' },
    { number: 3, title: '支払い情報' },
    { number: 4, title: '最終確認' },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-white">お申し込み</span>
              <span className="text-[#d4af37] ml-2">
                {applyType === 'mnp' ? '（MNP転入）' : '（新規）'}
              </span>
            </h1>

            {/* Apply Type Toggle */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-white/5 backdrop-blur-sm rounded-full p-1 border border-white/10">
                <button
                  onClick={() => setApplyType('new')}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                    applyType === 'new'
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  新規申込
                </button>
                <button
                  onClick={() => setApplyType('mnp')}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                    applyType === 'mnp'
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  MNP転入
                </button>
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div className="mb-12">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-all duration-300 ${
                        currentStep >= step.number
                          ? 'bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {step.number}
                    </div>
                    <div
                      className={`text-xs sm:text-sm font-medium text-center ${
                        currentStep >= step.number ? 'text-[#d4af37]' : 'text-white/40'
                      }`}
                    >
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-all duration-300 ${
                        currentStep > step.number ? 'bg-[#d4af37]' : 'bg-white/10'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8">
              {/* Step 1: Identity Verification */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">本人確認情報</h2>

                  <div>
                    <label className="block text-white/80 mb-2 font-medium">申込種別</label>
                    <select
                      name="applicantType"
                      value={formData.applicantType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#d4af37] transition-colors"
                    >
                      <option value="individual" className="bg-black">個人</option>
                      <option value="corporate" className="bg-black">法人</option>
                    </select>
                  </div>

                  {formData.applicantType === 'corporate' && (
                    <>
                      <div>
                        <label className="block text-white/80 mb-2 font-medium">会社名</label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                          placeholder="合同会社ピーチ"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 mb-2 font-medium">登記番号</label>
                        <input
                          type="text"
                          name="companyRegistration"
                          value={formData.companyRegistration}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                          placeholder="1234567890123"
                          required
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-white/80 mb-2 font-medium">
                      {formData.applicantType === 'corporate' ? '担当者氏名' : '氏名'}
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                      placeholder="山田 太郎"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2 font-medium">生年月日</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#d4af37] transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2 font-medium">メールアドレス</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                      placeholder="example@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2 font-medium">電話番号</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                      placeholder="090-1234-5678"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2 font-medium">住所</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                      placeholder="〒100-0001 東京都千代田区..."
                      required
                    />
                  </div>

                  {applyType === 'mnp' && (
                    <>
                      <h3 className="text-xl font-bold text-[#d4af37] mt-8 mb-4">MNP情報</h3>

                      <div>
                        <label className="block text-white/80 mb-2 font-medium">MNP予約番号</label>
                        <input
                          type="text"
                          name="mnpNumber"
                          value={formData.mnpNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors"
                          placeholder="12345678901"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white/80 mb-2 font-medium">有効期限</label>
                        <input
                          type="date"
                          name="mnpExpiry"
                          value={formData.mnpExpiry}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#d4af37] transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white/80 mb-2 font-medium">回線種別</label>
                        <select
                          name="carrierType"
                          value={formData.carrierType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#d4af37] transition-colors"
                          required
                        >
                          <option value="" className="bg-black">選択してください</option>
                          <option value="docomo" className="bg-black">ドコモ</option>
                          <option value="au" className="bg-black">au</option>
                          <option value="softbank" className="bg-black">ソフトバンク</option>
                          <option value="rakuten" className="bg-black">楽天モバイル</option>
                          <option value="mvno" className="bg-black">その他MVNO</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 2: Plan Selection */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">プラン選択</h2>

                  <div>
                    <label className="block text-white/80 mb-2 font-medium">回線数</label>
                    <input
                      type="number"
                      name="lineCount"
                      value={formData.lineCount}
                      onChange={handleInputChange}
                      min="1"
                      max={formData.applicantType === 'individual' ? '5' : '999'}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#d4af37] transition-colors"
                      required
                    />
                    <p className="text-white/50 text-sm mt-2">
                      {formData.applicantType === 'individual'
                        ? '個人は最大5回線までです'
                        : '法人で20回線以上のお申込は別途審査が必要です'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-white/80 mb-4 font-medium">データプラン</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {['1GB', '3GB', '7.5GB', '10GB', '20GB', '100GB目安'].map((plan) => (
                        <button
                          key={plan}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, plan }))}
                          className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                            formData.plan === plan
                              ? 'border-[#d4af37] bg-[#d4af37]/20'
                              : 'border-white/20 bg-white/5 hover:border-white/40'
                          }`}
                        >
                          <div className="text-white font-bold text-lg">{plan}</div>
                          <div className="text-white/60 text-sm mt-1">
                            {plan === '1GB' && '¥880/月'}
                            {plan === '3GB' && '¥1,680/月'}
                            {plan === '7.5GB' && '¥2,280/月'}
                            {plan === '10GB' && '¥2,780/月'}
                            {plan === '20GB' && '¥3,580/月'}
                            {plan === '100GB目安' && '¥4,580/月'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 mb-4 font-medium">通話定額オプション（任意）</label>
                    <div className="space-y-3">
                      {[
                        { value: 'none', label: 'なし', price: '¥0' },
                        { value: '5min', label: '5分かけ放題', price: '¥660/月' },
                        { value: '10min', label: '10分かけ放題', price: '¥880/月' },
                        { value: 'unlimited', label: '完全かけ放題', price: '¥2,200/月' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, callOption: option.value }))}
                          className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 flex justify-between items-center ${
                            formData.callOption === option.value
                              ? 'border-[#d4af37] bg-[#d4af37]/20'
                              : 'border-white/20 bg-white/5 hover:border-white/40'
                          }`}
                        >
                          <span className="text-white font-semibold">{option.label}</span>
                          <span className="text-[#d4af37] font-bold">{option.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">支払い情報</h2>

                  <div>
                    <label className="block text-white/80 mb-4 font-medium">支払い方法</label>
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'credit' }))}
                        className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${
                          formData.paymentMethod === 'credit'
                            ? 'border-[#d4af37] bg-[#d4af37]/20'
                            : 'border-white/20 bg-white/5 hover:border-white/40'
                        }`}
                      >
                        <div className="text-white font-semibold">クレジットカード</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'bank' }))}
                        className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 ${
                          formData.paymentMethod === 'bank'
                            ? 'border-[#d4af37] bg-[#d4af37]/20'
                            : 'border-white/20 bg-white/5 hover:border-white/40'
                        }`}
                      >
                        <div className="text-white font-semibold">銀行振込（請求書対応可）</div>
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-2xl p-6">
                    <p className="text-white/80 text-sm leading-relaxed">
                      {formData.paymentMethod === 'credit'
                        ? 'クレジットカード情報は次のステップで入力していただきます。'
                        : '請求書は登録いただいたメールアドレスに送付されます。振込手数料はお客様負担となります。'}
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">最終確認</h2>

                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="text-[#d4af37] font-semibold mb-4">申込情報</h3>
                      <dl className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-white/60">申込種別</dt>
                          <dd className="text-white font-semibold">
                            {formData.applicantType === 'individual' ? '個人' : '法人'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-white/60">氏名</dt>
                          <dd className="text-white font-semibold">{formData.fullName}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-white/60">メールアドレス</dt>
                          <dd className="text-white font-semibold">{formData.email}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-white/60">電話番号</dt>
                          <dd className="text-white font-semibold">{formData.phone}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="text-[#d4af37] font-semibold mb-4">プラン情報</h3>
                      <dl className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-white/60">回線数</dt>
                          <dd className="text-white font-semibold">{formData.lineCount}回線</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-white/60">データプラン</dt>
                          <dd className="text-white font-semibold">{formData.plan}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-white/60">通話オプション</dt>
                          <dd className="text-white font-semibold">
                            {formData.callOption === 'none' && 'なし'}
                            {formData.callOption === '5min' && '5分かけ放題'}
                            {formData.callOption === '10min' && '10分かけ放題'}
                            {formData.callOption === 'unlimited' && '完全かけ放題'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-white/60">支払い方法</dt>
                          <dd className="text-white font-semibold">
                            {formData.paymentMethod === 'credit' ? 'クレジットカード' : '銀行振込'}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-2xl p-6">
                      <h3 className="text-[#d4af37] font-semibold mb-2">初期費用（3ヶ月パック）</h3>
                      <div className="text-3xl font-bold text-white">
                        ¥{parseInt(formData.lineCount) >= 50 ? '4,200' : '4,600'}
                        <span className="text-lg text-white/60"> / 回線</span>
                      </div>
                      <p className="text-white/60 text-sm mt-2">
                        合計: ¥{(parseInt(formData.lineCount) * (parseInt(formData.lineCount) >= 50 ? 4200 : 4600)).toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 text-[#d4af37] focus:ring-[#d4af37]"
                          required
                        />
                        <span className="ml-3 text-white/80 text-sm leading-relaxed">
                          <Link href="/terms" className="text-[#d4af37] hover:underline">
                            利用規約
                          </Link>
                          、
                          <Link href="/privacy" className="text-[#d4af37] hover:underline">
                            プライバシーポリシー
                          </Link>
                          、
                          <Link href="/legal" className="text-[#d4af37] hover:underline">
                            特定商取引法表示
                          </Link>
                          に同意します
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-all duration-300"
                  >
                    戻る
                  </button>
                )}
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black font-bold rounded-full hover:shadow-xl hover:shadow-[#d4af37]/50 transition-all duration-300"
                  >
                    次へ
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black font-bold rounded-full hover:shadow-xl hover:shadow-[#d4af37]/50 transition-all duration-300"
                  >
                    申し込む
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
