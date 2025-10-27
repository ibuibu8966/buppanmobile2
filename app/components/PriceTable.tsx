'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PricePlan {
  capacity: string;
  price: string;
  notes: string;
}

const standardPlans: PricePlan[] = [
  { capacity: '1GB', price: '¥880', notes: '音声＋SMS込み' },
  { capacity: '3GB', price: '¥1,380', notes: '3日500MBで制御' },
  { capacity: '7.5GB', price: '¥2,080', notes: '3日1GBで制御' },
  { capacity: '10GB', price: '¥2,680', notes: '3日1.5GBで制御' },
];

const enterprisePlans: PricePlan[] = [
  { capacity: '1GB', price: '¥780', notes: '音声＋SMS込み' },
  { capacity: '3GB', price: '¥1,280', notes: '3日500MBで制御' },
  { capacity: '7.5GB', price: '¥1,980', notes: '3日1GBで制御' },
  { capacity: '10GB', price: '¥2,580', notes: '3日1.5GBで制御' },
];

export default function PriceTable() {
  const [activeTab, setActiveTab] = useState<'individual' | 'corporate'>('individual');
  const [is100Plus, setIs100Plus] = useState(false);

  const currentPlans = (activeTab === 'corporate' && is100Plus) ? enterprisePlans : standardPlans;

  return (
    <section id="pricing" className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/ruchindra-gunasekara-GK8x_XCcDZg-unsplash.jpg"
          alt="Pricing Background"
          fill
          className="object-cover opacity-30"
        />
      </div>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40 z-0"></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-white">シンプルな</span>
            <span className="text-[#d4af37]">料金プラン</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            音声通話＋SMS込みで、使う分だけを選べる明確な料金体系
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white/5 backdrop-blur-sm rounded-full p-1 border border-white/10">
            <button
              onClick={() => {
                setActiveTab('individual');
                setIs100Plus(false);
              }}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === 'individual'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black shadow-lg shadow-[#d4af37]/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              個人
            </button>
            <button
              onClick={() => {
                setActiveTab('corporate');
                setIs100Plus(false);
              }}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === 'corporate'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black shadow-lg shadow-[#d4af37]/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              法人
            </button>
          </div>
        </div>

        {/* 100+ Lines Option for Corporate */}
        {activeTab === 'corporate' && (
          <div className="flex justify-center mb-8 px-4">
            <button
              onClick={() => setIs100Plus(!is100Plus)}
              className={`relative px-8 py-5 rounded-2xl font-semibold transition-all duration-300 border-2 max-w-2xl w-full shadow-lg transform hover:scale-[1.02] ${
                is100Plus
                  ? 'bg-gradient-to-br from-[#d4af37]/30 to-[#d4af37]/10 border-[#d4af37] shadow-[#d4af37]/20'
                  : 'bg-white/5 backdrop-blur-sm border-white/20 hover:border-[#d4af37]/50 hover:bg-white/10 shadow-black/20'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  is100Plus
                    ? 'bg-[#d4af37] border-[#d4af37]'
                    : 'bg-white/5 border-white/30'
                }`}>
                  {is100Plus && (
                    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="text-left flex-1">
                  <p className={`text-lg font-bold mb-1 ${is100Plus ? 'text-[#d4af37]' : 'text-white'}`}>
                    100回線以上（継続）専用プラン
                  </p>
                  <p className={`text-sm leading-relaxed ${is100Plus ? 'text-[#d4af37]/90' : 'text-white/60'}`}>
                    継続利用＆毎月100回線以上のご契約で、標準価格から税込100円引き（各容量一律）
                  </p>
                </div>
              </div>
              {/* Hover indicator */}
              {!is100Plus && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#d4af37]/0 via-[#d4af37]/5 to-[#d4af37]/0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
              )}
            </button>
          </div>
        )}

        {/* Price Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {currentPlans.map((plan, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 hover:border-[#d4af37]/50 hover:shadow-xl hover:shadow-[#d4af37]/10 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-center">
                <div className="text-white/60 text-sm font-medium mb-2">
                  {plan.capacity}
                </div>
                {is100Plus ? (
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-white/40 line-through mb-1">
                      {standardPlans[index].price}
                    </div>
                    <div className="text-sm text-[#f0d970] font-semibold mb-1">
                      -100円
                    </div>
                    <div className="text-4xl font-bold">
                      <span className="text-[#d4af37]">{plan.price}</span>
                      <span className="text-white/40 text-lg">/月</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-4xl font-bold mb-2">
                    <span className="text-[#d4af37]">{plan.price}</span>
                    <span className="text-white/40 text-lg">/月</span>
                  </div>
                )}
                <div className="text-white/60 text-sm">{plan.notes}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            追加オプション・通話料
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="text-[#d4af37] font-semibold mb-2">追加データ</h4>
              <ul className="text-white/70 space-y-1">
                <li>• 500MB: <span className="text-white font-semibold">¥770</span></li>
                <li>• 1GB: <span className="text-white font-semibold">¥1,320</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#d4af37] font-semibold mb-2">通話料</h4>
              <ul className="text-white/70 space-y-1">
                <li>• 従量通話: <span className="text-white font-semibold">¥11/30秒</span></li>
                <li className="text-xs text-white/50">（対象外: 0570/0180/104/衛星系）</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#d4af37] font-semibold mb-2">定額通話オプション</h4>
              <ul className="text-white/70 space-y-1">
                <li>• 5分かけ放題: <span className="text-white font-semibold">¥660/月</span></li>
                <li>• 10分かけ放題: <span className="text-white font-semibold">¥880/月</span></li>
                <li>• 完全かけ放題: <span className="text-white font-semibold">¥2,200/月</span></li>
                <li className="text-xs text-white/50">（1通話120分で自動終了）</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#d4af37] font-semibold mb-2">初回3ヶ月パック</h4>
              <ul className="text-white/70 space-y-1">
                <li>• 50回線以上: <span className="text-white font-semibold">¥4,200/回線</span></li>
                <li>• 50回線未満: <span className="text-white font-semibold">¥4,600/回線</span></li>
                <li className="text-xs text-white/50">（SIM登録・個別配送込み）</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-white/50 text-xs leading-relaxed">
              ※ 表示価格はすべて税込です<br />
              ※ 別途、ユニバーサルサービス料2円/月、電話リレーサービス料1円/月がかかります<br />
              ※ 従量通話の請求はご利用月の翌々月に合算されます<br />
              ※ 申込初月・解約月の日割りはありません<br />
              ※ 「100GB」は厳密な月間容量ではなく"10GB/3日で速度制御"の目安表記です
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
