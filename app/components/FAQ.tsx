'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: '申込から何日で使えますか？',
    answer: '物理SIMは通常1〜5営業日で発送、到着後の開通操作でご利用開始。eSIMは非対応です。',
  },
  {
    question: 'MNP転入・転出は可能ですか？',
    answer: 'はい。転出手数料は2200円（税込）です。マイページからお手続きいただけます。',
  },
  {
    question: '通話料金は？',
    answer: '従量は11円/30秒。定額は5分/10分/かけ放題（1通話120分で自動終了）をご用意。',
  },
  {
    question: 'データ追加は？',
    answer: '月内いつでも500MB 770円／1GB 1,320円を都度購入できます。',
  },
  {
    question: '速度制御はありますか？',
    answer: '各プランに3日間合計の上限があり、到達時は当該期間256kbpsに制御されます。',
  },
  {
    question: '対象外番号は？',
    answer: '0570／0180／104／衛星系は定額対象外です。',
  },
  {
    question: 'テザリングは使えますか？',
    answer: '可能です（端末仕様に依存）。',
  },
  {
    question: '国際電話・SMS・ローミングは？',
    answer: 'いずれも対応（要申請）。通話/通信料はキャリアの実費100%をご請求。',
  },
  {
    question: '初月・解約月は日割りになりますか？',
    answer: 'いいえ、日割りはありません（オプション含む）。',
  },
  {
    question: '最低利用期間は？',
    answer: '小売りとしての解約金は設けません（初回3ヶ月パックは返金不可）。',
  },
  {
    question: 'SIMを失くした・破損した',
    answer: '再発行手数料がかかります（再発行＋配送）。',
  },
  {
    question: '請求タイミング',
    answer: '基本料は月次、従量通話などは翌々月に合算。',
  },
  {
    question: '支払い方法は？',
    answer: '銀行振込（請求書対応可）／クレジットカード に対応しています。',
  },
  {
    question: 'ポケモンカードの認証はできますか？',
    answer: 'はい、可能です。',
  },
  {
    question: '個人は何回線まで契約できますか？',
    answer: '最大5回線までです。',
  },
  {
    question: '法人の申込条件は？',
    answer: '20回線以上のお申込は別途審査が必要です（与信・運用体制の確認）。',
  },
  {
    question: '個人の3ヶ月パックはまた申し込めますか？',
    answer: '利用終了後に当社へご連絡のうえ、3ヶ月以内に回線名義を当社に戻すことで再申込が可能です（在庫・審査状況により前後）。',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            <span className="text-white">よくある</span>
            <span className="text-[#d4af37]">質問</span>
          </h2>
          <p className="text-white/60 text-sm sm:text-base md:text-lg px-4">
            お客様から寄せられるよくある質問にお答えします
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden hover:border-[#d4af37]/50 transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors duration-200"
              >
                <span className="text-white font-semibold pr-4 sm:pr-8 text-sm sm:text-base">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-[#d4af37] flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-4 sm:px-6 pb-4 sm:pb-5 text-white/70 leading-relaxed text-sm sm:text-base">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-12 text-center px-4">
          <p className="text-white/60 mb-3 sm:mb-4 text-sm sm:text-base">
            その他のご質問がございましたら、お気軽にお問い合わせください
          </p>
          <a
            href="mailto:peach.2023.7.19@gmail.com"
            className="inline-flex items-center text-[#d4af37] hover:text-[#f0d970] font-semibold transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            peach.2023.7.19@gmail.com
          </a>
        </div>
      </div>
    </section>
  );
}
