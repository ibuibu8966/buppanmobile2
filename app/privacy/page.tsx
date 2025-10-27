import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8">
            <span className="text-white">プライバシー</span>
            <span className="text-[#d4af37]">ポリシー</span>
          </h1>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8">
            <div className="space-y-8 text-white/80 leading-relaxed">
              <section>
                <p>
                  合同会社ピーチ（以下「当社」といいます）は、BUPPAN
                  MOBILEサービス（以下「本サービス」といいます）の提供にあたり、利用者の個人情報の重要性を認識し、個人情報保護法その他の関係法令を遵守するとともに、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定め、個人情報の適切な取り扱いに努めます。
                </p>
              </section>

              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">1. 収集する情報</h2>
                <p className="mb-2">当社は、以下の情報を収集します。</p>

                <h3 className="text-white font-semibold mt-4 mb-2">（1）契約時に収集する情報</h3>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>氏名、生年月日、住所、電話番号、メールアドレス</li>
                  <li>本人確認書類の記載内容</li>
                  <li>法人の場合: 会社名、登記番号、担当者情報</li>
                  <li>支払い情報（クレジットカード情報、銀行口座情報）</li>
                </ul>

                <h3 className="text-white font-semibold mt-4 mb-2">（2）サービス利用時に収集する情報</h3>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>通信量、通話時間、接続先情報（通信の秘密に該当しない範囲）</li>
                  <li>位置情報（緊急通報時等、法令で認められた範囲）</li>
                  <li>アクセスログ、IPアドレス、端末情報</li>
                </ul>

                <h3 className="text-white font-semibold mt-4 mb-2">（3）Cookie等の技術情報</h3>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Cookieによる識別子</li>
                  <li>広告識別子（IDFA、AAID等）</li>
                  <li>ウェブサイトの閲覧履歴</li>
                </ul>
              </section>

              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">2. 利用目的</h2>
                <p className="mb-2">収集した個人情報は、以下の目的で利用します。</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>本サービスの提供、維持、改善</li>
                  <li>契約の締結、履行、料金請求</li>
                  <li>本人確認、年齢確認</li>
                  <li>カスタマーサポート対応</li>
                  <li>ネットワークの維持管理、通信品質の向上</li>
                  <li>不正利用の防止、セキュリティ対策</li>
                  <li>新サービス、キャンペーン等の案内（同意をいただいた場合）</li>
                  <li>統計データの作成（個人を特定できない形式）</li>
                  <li>法令に基づく対応</li>
                </ul>
              </section>

              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">3. 第三者提供</h2>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                  <li>
                    当社は、以下の場合を除き、利用者の個人情報を第三者に提供しません。
                    <ul className="list-disc list-inside pl-8 mt-2">
                      <li>利用者の同意がある場合</li>
                      <li>法令に基づく場合</li>
                      <li>人の生命、身体または財産の保護のために必要がある場合</li>
                      <li>
                        国の機関等への協力が必要であり、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがある場合
                      </li>
                    </ul>
                  </li>
                  <li>
                    本サービス提供のため、以下の委託先に個人情報を提供することがあります。
                    <ul className="list-disc list-inside pl-8 mt-2">
                      <li>MVNO接続先事業者（NTTドコモ等）</li>
                      <li>決済代行事業者</li>
                      <li>配送業者</li>
                      <li>カスタマーサポート業務委託先</li>
                    </ul>
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">4. 個人情報の管理</h2>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                  <li>
                    当社は、個人情報への不正アクセス、紛失、破壊、改ざん、漏洩等を防止するため、適切な安全管理措置を講じます。
                  </li>
                  <li>
                    個人情報を取り扱う従業員および委託先に対して、適切な監督を行います。
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">5. Cookie・広告識別子について</h2>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                  <li>
                    当社のウェブサイトでは、利用者の利便性向上やアクセス解析のため、Cookieを使用することがあります。
                  </li>
                  <li>
                    広告配信事業者がCookieや広告識別子を使用して、利用者に最適な広告を表示することがあります。
                  </li>
                  <li>
                    利用者は、ブラウザの設定によりCookieを無効化できますが、一部機能が利用できなくなる場合があります。
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">6. 開示・訂正・削除等の請求</h2>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                  <li>
                    利用者は、当社が保有する自己の個人情報について、開示、訂正、削除、利用停止等を請求できます。
                  </li>
                  <li>
                    請求方法については、以下のお問い合わせ先までご連絡ください。
                  </li>
                  <li>
                    請求にあたっては、本人確認のため、当社所定の手続きが必要となります。
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">7. 保存期間</h2>
                <p>
                  個人情報は、利用目的の達成に必要な期間、または法令で定められた期間保存します。保存期間経過後は、適切な方法で削除または匿名化します。
                </p>
              </section>

              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">8. 未成年者の個人情報</h2>
                <p>
                  18歳未満の方が本サービスを利用する場合、保護者の同意が必要です。当社は、保護者の同意なく未成年者の個人情報を収集しません。
                </p>
              </section>

              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">9. プライバシーポリシーの変更</h2>
                <p>
                  当社は、法令の変更、サービス内容の変更等に伴い、本ポリシーを変更することがあります。変更後のポリシーは、当社ウェブサイトに掲載した時点で効力を生じます。
                </p>
              </section>

              <section>
                <h2 className="text-[#d4af37] font-semibold mb-3 text-xl">10. お問い合わせ窓口</h2>
                <p className="mb-2">個人情報の取り扱いに関するお問い合わせは、以下までご連絡ください。</p>
                <div className="bg-white/5 rounded-2xl p-6 mt-4">
                  <p className="font-semibold text-white mb-2">合同会社ピーチ 個人情報お問い合わせ窓口</p>
                  <p>〒290-0242 千葉県市原市荻作530-4</p>
                  <p className="mt-2">
                    メールアドレス:{' '}
                    <a
                      href="mailto:peach.2023.7.19@gmail.com"
                      className="text-[#d4af37] hover:text-[#f0d970] transition-colors"
                    >
                      peach.2023.7.19@gmail.com
                    </a>
                  </p>
                </div>
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
