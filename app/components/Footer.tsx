import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-bold mb-4">
              <span className="text-white">BUPPAN</span>
              <span className="text-[#d4af37] ml-2">MOBILE</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              仕入れの相棒。音声込みで&quot;使うぶんだけ&quot;に最適化。
              <br />
              1GB/月880円・音声＋SMS込み。
            </p>
            <div className="mt-4 text-white/60 text-sm">
              <p>合同会社ピーチ（BUPPAN MOBILE運営）</p>
              <p className="mt-2">〒290-0242</p>
              <p>千葉県市原市荻作530-4</p>
              <p className="mt-2">
                サポート:{' '}
                <a
                  href="mailto:peach.2023.7.19@gmail.com"
                  className="text-[#d4af37] hover:text-[#f0d970] transition-colors"
                >
                  peach.2023.7.19@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Links - Service */}
          <div>
            <h3 className="text-white font-semibold mb-4">サービス</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/#pricing"
                  className="text-white/60 hover:text-[#d4af37] transition-colors"
                >
                  料金プラン
                </Link>
              </li>
              <li>
                <Link
                  href="/#features"
                  className="text-white/60 hover:text-[#d4af37] transition-colors"
                >
                  特徴
                </Link>
              </li>
              <li>
                <Link
                  href="/apply"
                  className="text-white/60 hover:text-[#d4af37] transition-colors"
                >
                  お申し込み
                </Link>
              </li>
              <li>
                <Link
                  href="/mypage"
                  className="text-white/60 hover:text-[#d4af37] transition-colors"
                >
                  マイページ
                </Link>
              </li>
            </ul>
          </div>

          {/* Links - Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">法的表記</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-white/60 hover:text-[#d4af37] transition-colors"
                >
                  利用規約
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-white/60 hover:text-[#d4af37] transition-colors"
                >
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link
                  href="/legal"
                  className="text-white/60 hover:text-[#d4af37] transition-colors"
                >
                  特定商取引法表示
                </Link>
              </li>
              <li>
                <Link
                  href="/legal#telecom-law"
                  className="text-white/60 hover:text-[#d4af37] transition-colors"
                >
                  電気通信事業法表示
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} 合同会社ピーチ（BUPPAN MOBILE運営）. All rights reserved.
            </p>
            <div className="text-white/40 text-sm">
              <p>電気通信事業届出番号: A-07-22969</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
