import Link from 'next/link';
import Image from 'next/image';
import Header from './components/Header';
import Footer from './components/Footer';
import PriceTable from './components/PriceTable';
import FAQ from './components/FAQ';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/user_pascal-7qlXFeFNv14-unsplash.jpg"
            alt="Hero Background"
            fill
            className="object-cover opacity-40"
            priority
          />
        </div>
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30 z-0"></div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center">
            {/* 装飾的な上部ライン */}
            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <div className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent to-[#d4af37]"></div>
              <div className="mx-2 sm:mx-4 text-[#d4af37] text-xs sm:text-sm font-semibold tracking-widest uppercase">Premium MVNO Service</div>
              <div className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent to-[#d4af37]"></div>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-bold mb-6 sm:mb-8 leading-tight px-2">
              <span className="text-white drop-shadow-2xl block">仕入れの相棒。</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f0d970] to-[#d4af37] drop-shadow-lg animate-pulse block mt-2">
                音声込みで
              </span>
              <span className="text-white drop-shadow-2xl block mt-2">&quot;使うぶんだけ&quot;に</span>
              <span className="text-white drop-shadow-2xl block">最適化。</span>
            </h1>

            <p className="text-lg sm:text-2xl md:text-3xl text-white/90 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed font-light px-4">
              <span className="text-[#f0d970] font-bold block sm:inline">1GB/月880円</span>
              <span className="mx-2 hidden sm:inline">・</span>
              <span className="text-white block sm:inline mt-1 sm:mt-0">音声＋SMS込み</span>
              <br className="my-2" />
              <span className="text-white/80 text-base sm:text-xl block sm:inline">重い月は</span>
              <span className="text-[#f0d970] font-bold text-xl sm:text-2xl block sm:inline mt-1 sm:mt-0">100GB目安</span>
              <span className="text-white/60 text-sm sm:text-lg block sm:inline">（10GB/3日）</span>
              <span className="text-white/80 text-base sm:text-xl block sm:inline mt-1 sm:mt-0">で使い倒せる。</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex justify-center items-center mb-16">
              <Link
                href="/apply?type=new"
                className="group relative px-12 py-6 bg-gradient-to-r from-[#d4af37] via-[#f0d970] to-[#d4af37] text-black font-bold text-xl rounded-full hover:shadow-2xl hover:shadow-[#d4af37]/50 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto text-center overflow-hidden"
              >
                <span className="relative z-10">申し込む</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#f0d970] to-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>

            {/* 3-Month Pack Highlight - 豪華版 */}
            <div className="relative bg-gradient-to-br from-[#d4af37]/30 via-[#d4af37]/10 to-transparent border-2 border-[#d4af37]/50 rounded-2xl sm:rounded-3xl p-6 sm:p-10 max-w-5xl mx-auto backdrop-blur-md shadow-2xl shadow-[#d4af37]/20">
              {/* 装飾的なコーナー */}
              <div className="absolute top-0 left-0 w-12 h-12 sm:w-20 sm:h-20 border-t-2 border-l-2 sm:border-t-4 sm:border-l-4 border-[#f0d970] rounded-tl-2xl sm:rounded-tl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 sm:w-20 sm:h-20 border-b-2 border-r-2 sm:border-b-4 sm:border-r-4 border-[#f0d970] rounded-br-2xl sm:rounded-br-3xl"></div>

              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#f0d970] mb-4 sm:mb-6 drop-shadow-lg px-4">
                <span className="block">事務手数料込み・</span>
                <span className="block">3ヶ月パック</span>
                <span className="block text-base sm:text-xl text-white/80 mt-2">（音声＋SMS）</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 text-left px-2">
                <div className="relative bg-gradient-to-br from-black/50 to-black/30 rounded-xl sm:rounded-2xl p-5 sm:p-8 border-2 border-[#d4af37]/40 shadow-xl hover:border-[#f0d970] transition-all duration-300 transform hover:scale-105">
                  <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black text-xs font-bold px-3 py-1 rounded-full">
                    お得
                  </div>
                  <div className="text-[#f0d970] text-xs sm:text-sm mb-2 sm:mb-3 font-semibold">50回線以上の一括申込</div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f0d970]">¥4,200</span>
                    <span className="text-base sm:text-xl text-white/60">/回線</span>
                  </div>
                  <div className="text-white/80 text-xs sm:text-sm">3ヶ月分・税込</div>
                </div>

                <div className="relative bg-gradient-to-br from-black/50 to-black/30 rounded-xl sm:rounded-2xl p-5 sm:p-8 border-2 border-[#d4af37]/40 shadow-xl hover:border-[#f0d970] transition-all duration-300 transform hover:scale-105">
                  <div className="text-[#f0d970] text-xs sm:text-sm mb-2 sm:mb-3 font-semibold">50回線未満</div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f0d970]">¥4,600</span>
                    <span className="text-base sm:text-xl text-white/60">/回線</span>
                  </div>
                  <div className="text-white/80 text-xs sm:text-sm">3ヶ月分・税込</div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[#d4af37]/30">
                <p className="text-white/90 text-sm sm:text-base flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 px-4">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37] mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    SIM登録・個別配送込み
                  </span>
                  <span className="text-[#d4af37] hidden sm:inline">・</span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37] mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    MNP転出0円
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/call-71170_1920.jpg"
            alt="Features Background"
            fill
            className="object-cover opacity-40"
          />
        </div>
        {/* Background overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/40 z-0"></div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-12 sm:mb-16 px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-white">選ばれる</span>
              <span className="text-[#d4af37]">3つの理由</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-4">
            {/* Feature 1 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-[#d4af37]/50 hover:shadow-xl hover:shadow-[#d4af37]/10 transition-all duration-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#d4af37] to-[#f0d970] rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">音声通話込み</h3>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                すべてのプランに音声通話＋SMSが標準搭載。データ専用SIMではありません。定額通話オプションも充実。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-[#d4af37]/50 hover:shadow-xl hover:shadow-[#d4af37]/10 transition-all duration-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#d4af37] to-[#f0d970] rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">選べる設計</h3>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                自動最適化ではなく、容量を自分で選ぶスタイル。使わない月は最小限、使う月は大容量に。無駄なく使える。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-[#d4af37]/50 hover:shadow-xl hover:shadow-[#d4af37]/10 transition-all duration-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#d4af37] to-[#f0d970] rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">請求シンプル</h3>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                基本料は月次、従量分は翌々月合算。明快な料金体系。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Price Table */}
      <PriceTable />

      {/* Network Info */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              ネットワーク仕様
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <div className="text-[#d4af37] font-semibold mb-2">通信網</div>
                <div className="text-white/70">NTTドコモ網系MVNO</div>
              </div>
              <div>
                <div className="text-[#d4af37] font-semibold mb-2">通信速度</div>
                <div className="text-white/70">
                  下り最大375Mbps / 上り最大50Mbps
                  <br />
                  <span className="text-xs">（ベストエフォート）</span>
                </div>
              </div>
              <div>
                <div className="text-[#d4af37] font-semibold mb-2">テザリング</div>
                <div className="text-white/70">可能（端末仕様に依存）</div>
              </div>
              <div>
                <div className="text-[#d4af37] font-semibold mb-2">緊急通報</div>
                <div className="text-white/70">110 / 118 / 119 発信可能</div>
              </div>
              <div>
                <div className="text-[#d4af37] font-semibold mb-2">国際対応</div>
                <div className="text-white/70">
                  国際電話・国際SMS・国際ローミング
                  <br />
                  <span className="text-xs">（要申請 / キャリア実費100%）</span>
                </div>
              </div>
              <div>
                <div className="text-[#d4af37] font-semibold mb-2">提供エリア</div>
                <div className="text-white/70">日本国内（ドコモ網準拠）</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
            今すぐ始めましょう
          </h2>
          <p className="text-white/70 text-lg mb-8">
            シンプルな料金、明確なサービス。BUPPAN MOBILEで快適な通信環境を。
          </p>
          <div className="flex justify-center items-center">
            <Link
              href="/apply?type=new"
              className="px-10 py-5 bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black font-bold text-lg rounded-full hover:shadow-2xl hover:shadow-[#d4af37]/50 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
            >
              申し込む
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
