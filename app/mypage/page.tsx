'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MyPage() {
  const [selectedTab, setSelectedTab] = useState<'usage' | 'plan' | 'mnp' | 'cancel'>('usage');

  // Mock data
  const mockData = {
    userName: '山田 太郎',
    phoneNumber: '090-1234-5678',
    currentPlan: '10GB',
    monthlyFee: 2780,
    dataUsage: {
      total: 10,
      used: 6.5,
      remaining: 3.5,
      threeDayUsage: 1.2,
      threeDayLimit: 1.5,
    },
    callUsage: {
      minutes: 45,
      estimatedCost: 990,
    },
    callOption: '5分かけ放題',
    nextBillingDate: '2025-11-01',
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8">
            <span className="text-white">マイ</span>
            <span className="text-[#d4af37]">ページ</span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                <div className="mb-6">
                  <div className="text-white/60 text-sm mb-1">契約者名</div>
                  <div className="text-white font-semibold">{mockData.userName}</div>
                </div>
                <div className="mb-6">
                  <div className="text-white/60 text-sm mb-1">電話番号</div>
                  <div className="text-white font-semibold">{mockData.phoneNumber}</div>
                </div>
                <div className="mb-6">
                  <div className="text-white/60 text-sm mb-1">現在のプラン</div>
                  <div className="text-[#d4af37] font-bold text-lg">{mockData.currentPlan}</div>
                </div>

                <nav className="space-y-2">
                  <button
                    onClick={() => setSelectedTab('usage')}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                      selectedTab === 'usage'
                        ? 'bg-[#d4af37]/20 text-[#d4af37] font-semibold'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    利用状況
                  </button>
                  <button
                    onClick={() => setSelectedTab('plan')}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                      selectedTab === 'plan'
                        ? 'bg-[#d4af37]/20 text-[#d4af37] font-semibold'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    プラン変更
                  </button>
                  <button
                    onClick={() => setSelectedTab('mnp')}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                      selectedTab === 'mnp'
                        ? 'bg-[#d4af37]/20 text-[#d4af37] font-semibold'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    MNP予約番号
                  </button>
                  <button
                    onClick={() => setSelectedTab('cancel')}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                      selectedTab === 'cancel'
                        ? 'bg-[#d4af37]/20 text-[#d4af37] font-semibold'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    解約申請
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Usage Tab */}
              {selectedTab === 'usage' && (
                <div className="space-y-6">
                  {/* Data Usage */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">データ利用状況</h2>

                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-white/70">今月の使用量</span>
                        <span className="text-white font-bold">
                          {mockData.dataUsage.used}GB / {mockData.dataUsage.total}GB
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#d4af37] to-[#f0d970] transition-all duration-300"
                          style={{
                            width: `${(mockData.dataUsage.used / mockData.dataUsage.total) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-white/50 text-sm mt-2">
                        残り {mockData.dataUsage.remaining}GB
                      </div>
                    </div>

                    <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-2xl p-4">
                      <h3 className="text-[#d4af37] font-semibold mb-3">3日間制限</h3>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/70 text-sm">直近3日間の使用量</span>
                        <span className="text-white font-semibold">
                          {mockData.dataUsage.threeDayUsage}GB / {mockData.dataUsage.threeDayLimit}GB
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            mockData.dataUsage.threeDayUsage >= mockData.dataUsage.threeDayLimit
                              ? 'bg-red-500'
                              : 'bg-gradient-to-r from-[#d4af37] to-[#f0d970]'
                          }`}
                          style={{
                            width: `${
                              (mockData.dataUsage.threeDayUsage / mockData.dataUsage.threeDayLimit) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-white/60 text-xs mt-2">
                        3日間の上限を超えると、当該期間は256kbpsに制御されます
                      </p>
                    </div>

                    <div className="mt-6 flex gap-4">
                      <button className="flex-1 px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black font-bold rounded-full hover:shadow-xl hover:shadow-[#d4af37]/50 transition-all duration-300">
                        500MB追加 (¥770)
                      </button>
                      <button className="flex-1 px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black font-bold rounded-full hover:shadow-xl hover:shadow-[#d4af37]/50 transition-all duration-300">
                        1GB追加 (¥1,320)
                      </button>
                    </div>
                  </div>

                  {/* Call Usage */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">通話利用状況</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <div className="text-white/60 text-sm mb-2">通話オプション</div>
                        <div className="text-white font-bold text-lg">{mockData.callOption}</div>
                      </div>
                      <div>
                        <div className="text-white/60 text-sm mb-2">従量通話 (今月)</div>
                        <div className="text-white font-bold text-lg">{mockData.callUsage.minutes}分</div>
                      </div>
                    </div>

                    <div className="mt-6 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-2xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">従量通話料（概算）</span>
                        <span className="text-[#d4af37] font-bold text-xl">
                          ¥{mockData.callUsage.estimatedCost.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-white/50 text-xs mt-2">※翌々月の請求に合算されます</p>
                    </div>
                  </div>

                  {/* Billing Info */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">請求情報</h2>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-white/10">
                        <span className="text-white/70">基本料金</span>
                        <span className="text-white font-semibold">¥{mockData.monthlyFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-white/10">
                        <span className="text-white/70">通話オプション</span>
                        <span className="text-white font-semibold">¥660</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-white/10">
                        <span className="text-white/70">法定料</span>
                        <span className="text-white font-semibold">¥3</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-white font-bold">次回請求額（予定）</span>
                        <span className="text-[#d4af37] font-bold text-2xl">
                          ¥{(mockData.monthlyFee + 660 + 3).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-white/50 text-sm">
                        請求日: {mockData.nextBillingDate}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Plan Change Tab */}
              {selectedTab === 'plan' && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">プラン変更</h2>

                  <div className="mb-6">
                    <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-2xl p-4 mb-6">
                      <p className="text-white/80 text-sm">
                        現在のプラン: <span className="text-[#d4af37] font-bold">{mockData.currentPlan}</span>
                      </p>
                      <p className="text-white/60 text-xs mt-2">
                        プラン変更は翌月から適用されます
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white font-semibold mb-4">データプラン</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                          { plan: '1GB', price: 880 },
                          { plan: '3GB', price: 1680 },
                          { plan: '7.5GB', price: 2280 },
                          { plan: '10GB', price: 2780 },
                          { plan: '20GB', price: 3580 },
                          { plan: '100GB目安', price: 4580 },
                        ].map((item) => (
                          <button
                            key={item.plan}
                            className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                              mockData.currentPlan === item.plan
                                ? 'border-[#d4af37] bg-[#d4af37]/20'
                                : 'border-white/20 bg-white/5 hover:border-white/40'
                            }`}
                          >
                            <div className="text-white font-bold">{item.plan}</div>
                            <div className="text-[#d4af37] text-sm mt-1">¥{item.price}/月</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-semibold mb-4">通話オプション</h3>
                      <div className="space-y-3">
                        {[
                          { label: 'なし', price: 0 },
                          { label: '5分かけ放題', price: 660 },
                          { label: '10分かけ放題', price: 880 },
                          { label: '完全かけ放題', price: 2200 },
                        ].map((option) => (
                          <button
                            key={option.label}
                            className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 flex justify-between items-center ${
                              mockData.callOption === option.label
                                ? 'border-[#d4af37] bg-[#d4af37]/20'
                                : 'border-white/20 bg-white/5 hover:border-white/40'
                            }`}
                          >
                            <span className="text-white font-semibold">{option.label}</span>
                            <span className="text-[#d4af37] font-bold">
                              {option.price === 0 ? '¥0' : `¥${option.price}/月`}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button className="w-full px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black font-bold rounded-full hover:shadow-xl hover:shadow-[#d4af37]/50 transition-all duration-300">
                      プラン変更を申請
                    </button>
                  </div>
                </div>
              )}

              {/* MNP Tab */}
              {selectedTab === 'mnp' && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">MNP予約番号の発行</h2>

                  <div className="space-y-6">
                    <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-2xl p-6">
                      <h3 className="text-[#d4af37] font-semibold mb-2">MNP転出について</h3>
                      <ul className="text-white/70 text-sm space-y-2 list-disc list-inside">
                        <li>MNP転出手数料は0円です</li>
                        <li>予約番号の有効期限は発行日から15日間です</li>
                        <li>転出後も当月分の料金は発生します（日割りなし）</li>
                      </ul>
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2 font-medium">
                        転出理由（任意）
                      </label>
                      <textarea
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors min-h-[100px]"
                        placeholder="ご意見をお聞かせください"
                      />
                    </div>

                    <button className="w-full px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black font-bold rounded-full hover:shadow-xl hover:shadow-[#d4af37]/50 transition-all duration-300">
                      MNP予約番号を発行
                    </button>
                  </div>
                </div>
              )}

              {/* Cancel Tab */}
              {selectedTab === 'cancel' && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">解約申請</h2>

                  <div className="space-y-6">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
                      <h3 className="text-red-400 font-semibold mb-2">解約について</h3>
                      <ul className="text-white/70 text-sm space-y-2 list-disc list-inside">
                        <li>解約金は発生しません</li>
                        <li>当月内の解約申請で当月末に解約となります</li>
                        <li>解約月の料金は日割りになりません</li>
                        <li>解約後のデータ復旧はできません</li>
                      </ul>
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2 font-medium">
                        解約理由（任意）
                      </label>
                      <textarea
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] transition-colors min-h-[100px]"
                        placeholder="ご意見をお聞かせください"
                      />
                    </div>

                    <div className="bg-white/5 rounded-2xl p-4">
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 text-[#d4af37] focus:ring-[#d4af37]"
                        />
                        <span className="ml-3 text-white/80 text-sm">
                          上記の注意事項を確認し、解約することに同意します
                        </span>
                      </label>
                    </div>

                    <button className="w-full px-6 py-3 bg-red-500/80 text-white font-bold rounded-full hover:bg-red-500 transition-all duration-300">
                      解約を申請
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
