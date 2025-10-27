import Header from '../components/Header';
import Footer from '../components/Footer';

export default function LegalPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8">
            <span className="text-white">特定商取引法に基づく</span>
            <span className="text-[#d4af37]">表記</span>
          </h1>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8">
            <div className="space-y-8 text-white/80">
              <div>
                <h2 className="text-[#d4af37] font-semibold mb-2 text-lg">販売業者</h2>
                <p>合同会社ピーチ（BUPPAN MOBILE運営）</p>
              </div>

              <div>
                <h2 className="text-[#d4af37] font-semibold mb-2 text-lg">代表責任者</h2>
                <p>宮崎　忍</p>
              </div>

              <div>
                <h2 className="text-[#d4af37] font-semibold mb-2 text-lg">所在地</h2>
                <p>〒290-0242</p>
                <p>千葉県市原市荻作530-4</p>
              </div>

              <div>
                <h2 className="text-[#d4af37] font-semibold mb-2 text-lg">電話番号</h2>
                <p>090-5997-2623（平日10:00-18:00）</p>
              </div>

              <div>
                <h2 className="text-[#d4af37] font-semibold mb-2 text-lg">メールアドレス</h2>
                <p>
                  <a
                    href="mailto:peach.2023.7.19@gmail.com"
                    className="text-[#d4af37] hover:text-[#f0d970] transition-colors"
                  >
                    peach.2023.7.19@gmail.com
                  </a>
                </p>
              </div>

              <div>
                <h2 className="text-[#d4af37] font-semibold mb-2 text-lg">販売価格</h2>
                <p>各プラン料金表に記載（税込価格）</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>標準プラン: 1GB 880円 〜 100GB目安 4,580円/月</li>
                  <li>100回線以上（継続）専用: 1GB 780円 〜 100GB目安 4,480円/月</li>
                  <li>初期費用（3ヶ月パック）: 50回線以上 4,200円/回線、50回線未満 4,600円/回線</li>
                </ul>
              </div>

              <div>
                <h2 className="text-[#d4af37] font-semibold mb-2 text-lg">商品代金以外の必要料金</h2>
                <ul className="list-disc list-inside space-y-1">
                  <li>ユニバーサルサービス料: 2円/月</li>
                  <li>電話リレーサービス料: 1円/月</li>
                  <li>追加データ: 500MB 770円、1GB 1,320円</li>
                  <li>従量通話: 11円/30秒（税込）</li>
                  <li>各種通話定額オプション</li>
                  <li>銀行振込の場合: 振込手数料（お客様負担）</li>
                </ul>
              </div>

              <div>
                <h2 className="text-[#d4af37] font-semibold mb-2 text-lg">申込方法</h2>
                <p>Webサイトからのオンライン申込</p>
              </div>

              <div>
                <h2 className="text-[#d4af37] font-semibold mb-2 text-lg">支払方法</h2>
                <ul className="list-disc list-inside space-y-1">
                  <li>クレジットカード決済</li>
                  <li>銀行振込（請求書対応可）</li>
                </ul>
              </div>

              <div>
                <h2 className="text-[#d4af37] font-semibold mb-2 text-lg">支払時期</h2>
                <ul className="list-disc list-inside space-y-1">
                  <li>月末締め翌月請求</li>
                  <li>従量通話などの従量課金分は翌々月に合算</li>
                </ul>
              </div>

              <div>
                <h2 className="text-[#d4af37] font-semibold mb-2 text-lg">引き渡し時期</h2>
                <p>物理SIM: 申込後1〜5営業日で発送、到着後の開通手続で利用開始</p>
                <p className="text-white/60 text-sm mt-1">
                  ※eSIMは非対応です
                </p>
              </div>

              <div>
                <h2 className="text-[#d4af37] font-semibold mb-2 text-lg">返品・交換・解約</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>返品:</strong> 通信サービスの性質上、開通後の返品は不可
                  </li>
                  <li>
                    <strong>交換:</strong> 不良SIMの場合は再発行（手数料あり）
                  </li>
                  <li>
                    <strong>解約:</strong> 解約金なし。当月解約申請で当月末解約（日割りなし）
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-[#d4af37] font-semibold mb-2 text-lg">役務提供条件</h2>
                <p>
                  電波状況、設備保守、天災等により一時的にサービスを利用できない場合があります。
                </p>
              </div>

              <div>
                <h2 className="text-[#d4af37] font-semibold mb-2 text-lg">クーリング・オフ</h2>
                <p>
                  本サービスは通信役務・通信販売に該当するため、クーリング・オフの適用外です。
                </p>
              </div>

              <div id="telecom-law" className="pt-6 border-t border-white/10 scroll-mt-24">
                <h2 className="text-[#d4af37] font-semibold mb-6 text-xl">電気通信事業法に基づく表示</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-semibold mb-3">電気通信事業者</h3>
                    <p>合同会社ピーチ</p>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">届出番号</h3>
                    <p>A-07-22969（総務省 届出受理済）</p>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">受理通知</h3>
                    <p className="mb-2">総務省より受理された届出書の受理通知（令和7年10月6日付）</p>
                    <a
                      href="/documents/20251022133036857.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-[#d4af37] hover:text-[#f0d970] transition-colors underline"
                    >
                      受理通知PDF（A-07-22969）を確認する
                    </a>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">提供区域</h3>
                    <p>日本国内（NTTドコモ網の提供エリアに準拠）</p>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">緊急通報（110/118/119）</h3>
                    <p>発信可能</p>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">通話定額の対象外番号</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>0570（ナビダイヤル）</li>
                      <li>0180（テレドーム）</li>
                      <li>104（番号案内）</li>
                      <li>衛星電話・衛星船舶電話</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">フェアユースポリシー（速度制御）</h3>
                    <p className="mb-3">
                      各プランに3日間合計の上限があり、超過時は当該期間256kbpsに速度制御されます。
                    </p>
                    <h4 className="text-white/90 font-semibold mb-2">各プランの3日間上限</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>1GBプラン：100MB/3日</li>
                      <li>3GBプラン：500MB/3日</li>
                      <li>7.5GBプラン：1GB/3日</li>
                      <li>10GBプラン：1.5GB/3日</li>
                      <li>20GBプラン：3GB/3日</li>
                      <li>100GB目安プラン：10GB/3日</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">通信速度（ベストエフォート）</h3>
                    <p>下り最大：375Mbps</p>
                    <p>上り最大：50Mbps</p>
                    <p className="text-white/60 text-sm mt-2">
                      ※ 実際の速度は通信環境や混雑状況により変動します。記載の速度は技術規格上の最大値であり、実効速度を保証するものではありません。
                    </p>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">使用ネットワーク</h3>
                    <p>NTTドコモ網系MVNO</p>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">サービス提供時間</h3>
                    <p>24時間365日（設備保守・障害時を除く）</p>
                    <p className="mt-1">回線切替操作：10:00-19:00</p>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">最低利用期間・解約金</h3>
                    <p>最低利用期間：なし</p>
                    <p>解約金：0円</p>
                    <p className="text-white/60 text-sm mt-2">※ 初回3ヶ月パックは返金不可</p>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">お問い合わせ</h3>
                    <p>
                      メール：
                      <a
                        href="mailto:peach.2023.7.19@gmail.com"
                        className="text-[#d4af37] hover:text-[#f0d970] transition-colors"
                      >
                        peach.2023.7.19@gmail.com
                      </a>
                    </p>
                    <p className="mt-1">受付時間：平日10:00-18:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
