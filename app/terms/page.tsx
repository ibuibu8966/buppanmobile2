import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8">
            <span className="text-white">BUPPAN MOBILE</span>
            <span className="text-[#d4af37] ml-2">利用規約</span>
          </h1>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8">
            <div className="space-y-8 text-white/80 leading-relaxed">
              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">第1条（適用）</h2>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                  <li>
                    本規約は、合同会社ピーチ（以下「当社」といいます）が提供する「BUPPAN
                    MOBILE」（以下「本サービス」といいます）の利用に関する条件を定めるものです。
                  </li>
                  <li>
                    本サービスを利用される全ての方（以下「利用者」といいます）は、本規約に同意したものとみなされます。
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">第2条（定義）</h2>
                <p className="mb-2">本規約において使用する用語の定義は、以下のとおりとします。</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>
                    「本サービス」: 当社が提供する移動通信サービス（音声通話、SMS、データ通信を含む）
                  </li>
                  <li>「利用者」: 本サービスの契約者</li>
                  <li>「SIM」: 本サービスで使用する物理SIMカード</li>
                </ul>
              </section>

              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">第3条（契約の成立）</h2>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                  <li>
                    本サービスの利用契約は、利用者が当社所定の方法により申込を行い、当社がこれを承諾したときに成立します。
                  </li>
                  <li>
                    個人の利用者は、最大5回線まで契約できます。
                  </li>
                  <li>
                    法人の利用者が20回線以上の申込を行う場合、当社による審査（与信・運用体制の確認）が必要です。
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">第4条（料金）</h2>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                  <li>
                    利用者は、当社が定める料金表に基づき、利用料金を支払うものとします。
                  </li>
                  <li>
                    初期費用として、3ヶ月パック料金をお支払いいただきます。
                  </li>
                  <li>
                    従量通話料は、ご利用月の翌々月に合算して請求します。
                  </li>
                  <li>
                    申込初月および解約月の料金は日割り計算いたしません。
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">第5条（支払い方法）</h2>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                  <li>
                    利用者は、以下のいずれかの方法により料金を支払うものとします。
                    <ul className="list-disc list-inside pl-8 mt-2">
                      <li>クレジットカード決済</li>
                      <li>銀行振込（請求書対応可）</li>
                    </ul>
                  </li>
                  <li>
                    銀行振込の場合、振込手数料は利用者の負担とします。
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">第6条（通信制限）</h2>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                  <li>
                    各プランには3日間の合計データ通信量の上限があり、上限に達した場合、当該期間は通信速度を256kbpsに制限します。
                  </li>
                  <li>
                    「100GB目安」プランは、厳密な月間容量ではなく「10GB/3日で速度制御」の目安表記です。
                  </li>
                  <li>
                    ネットワークの混雑回避や品質維持のため、通信速度を制御する場合があります。
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">第7条（禁止行為）</h2>
                <p className="mb-2">利用者は、以下の行為を行ってはなりません。</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>法令または公序良俗に違反する行為</li>
                  <li>犯罪行為に関連する行為</li>
                  <li>他者の権利を侵害する行為</li>
                  <li>本サービスの運営を妨害する行為</li>
                  <li>不正アクセス、ウイルスの送信等の行為</li>
                  <li>大量のデータ送受信により、ネットワークに過大な負荷をかける行為</li>
                  <li>転売目的での契約</li>
                </ul>
              </section>

              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">第8条（解約）</h2>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                  <li>
                    利用者は、マイページから当月解約申請を行うことで、当月末に本サービスを解約できます。
                  </li>
                  <li>
                    解約金は発生しませんが、初回3ヶ月パック料金の返金はいたしません。
                  </li>
                  <li>
                    MNP転出手数料は2200円（税込）です。
                  </li>
                  <li>
                    個人向け3ヶ月パックを再度申し込む場合は、利用終了後に当社へご連絡のうえ、3ヶ月以内に回線名義を当社に戻すことが必要です。
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">第9条（サービスの停止・中断）</h2>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                  <li>
                    当社は、以下の場合、本サービスの全部または一部を停止・中断することがあります。
                    <ul className="list-disc list-inside pl-8 mt-2">
                      <li>設備の保守・点検を行う場合</li>
                      <li>天災地変等の不可抗力により提供できない場合</li>
                      <li>料金の未払いがある場合</li>
                    </ul>
                  </li>
                  <li>
                    当社は、本条に基づく停止・中断により利用者に生じた損害について、一切責任を負いません。
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">第10条（免責事項）</h2>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                  <li>
                    当社は、本サービスの提供に関して、通信速度、通信品質、提供エリア等について保証するものではありません。
                  </li>
                  <li>
                    当社は、本サービスの利用により利用者に生じた損害について、当社の故意または重大な過失がある場合を除き、一切責任を負いません。
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">第11条（規約の変更）</h2>
                <p>
                  当社は、利用者の承諾なく本規約を変更できるものとします。変更後の規約は、当社ウェブサイトに掲載した時点で効力を生じます。
                </p>
              </section>

              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">第12条（準拠法・管轄裁判所）</h2>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                  <li>本規約の準拠法は日本法とします。</li>
                  <li>
                    本サービスに関する紛争については、千葉地方裁判所を第一審の専属的合意管轄裁判所とします。
                  </li>
                </ol>
              </section>

              <div className="pt-6 border-t border-white/10 text-right">
                <p className="text-white/60 text-sm">制定日: 2024年1月1日</p>
                <p className="text-white/60 text-sm">最終更新日: 2025年10月27日</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
