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
  { capacity: '3GB', price: '¥1,680', notes: '3日500MBで制御' },
  { capacity: '7.5GB', price: '¥2,280', notes: '3日1GBで制御' },
  { capacity: '10GB', price: '¥2,780', notes: '3日1.5GBで制御' },
  { capacity: '20GB', price: '¥3,580', notes: '3日3GBで制御' },
  { capacity: '100GB目安', price: '¥4,580', notes: '10GB/3日で制御' },
];

const enterprisePlans: PricePlan[] = [
  { capacity: '1GB', price: '¥780', notes: '音声＋SMS込み' },
  { capacity: '3GB', price: '¥1,580', notes: '3日500MBで制御' },
  { capacity: '7.5GB', price: '¥2,180', notes: '3日1GBで制御' },
  { capacity: '10GB', price: '¥2,680', notes: '3日1.5GBで制御' },
  { capacity: '20GB', price: '¥3,480', notes: '3日3GBで制御' },
  { capacity: '100GB目安', price: '¥4,480', notes: '10GB/3日で制御' },
];

export default function PriceTable() {
  const [activeTab, setActiveTab] = useState<'standard' | 'enterprise'>('standard');

  const currentPlans = activeTab === 'standard' ? standardPlans : enterprisePlans;

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
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white/5 backdrop-blur-sm rounded-full p-1 border border-white/10">
            <button
              onClick={() => setActiveTab('standard')}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === 'standard'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black shadow-lg shadow-[#d4af37]/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              標準プラン
            </button>
            <button
              onClick={() => setActiveTab('enterprise')}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === 'enterprise'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black shadow-lg shadow-[#d4af37]/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              100回線以上（継続）
            </button>
          </div>
        </div>

        {/* Plan Description */}
        <div className="text-center mb-8">
          {activeTab === 'enterprise' && (
            <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-2xl p-6 max-w-3xl mx-auto">
              <p className="text-[#d4af37] font-semibold mb-2">
                100回線以上（継続）専用プラン
              </p>
              <p className="text-white/80 text-sm">
                継続利用＆毎月100回線以上のご契約で、標準価格から税込100円引き（各容量一律）
              </p>
            </div>
          )}
        </div>

        {/* Price Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {currentPlans.map((plan, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 hover:border-[#d4af37]/50 hover:shadow-xl hover:shadow-[#d4af37]/10 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-center">
                <div className="text-white/60 text-sm font-medium mb-2">
                  {plan.capacity}
                </div>
                <div className="text-4xl font-bold mb-2">
                  <span className="text-[#d4af37]">{plan.price}</span>
                  <span className="text-white/40 text-lg">/月</span>
                </div>
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
