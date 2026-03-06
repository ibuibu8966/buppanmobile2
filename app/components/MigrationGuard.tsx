'use client'

import { usePathname } from 'next/navigation'

export default function MigrationGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-center">
      {/* 装飾ライン */}
      <div className="flex items-center justify-center mb-8">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#d4af37]"></div>
        <div className="mx-4 text-[#d4af37] text-xs font-semibold tracking-widest uppercase">BUPPAN MOBILE</div>
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#d4af37]"></div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
        サイト移転のお知らせ
      </h1>

      <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
        このサイトは以下のURLに移転しました。<br />
        ブックマーク等の更新をお願いいたします。
      </p>

      <a
        href="https://supermobile-lines-buppan.vercel.app/"
        className="px-10 py-4 bg-gradient-to-r from-[#d4af37] via-[#f0d970] to-[#d4af37] text-black font-bold text-base sm:text-lg rounded-full hover:shadow-2xl hover:shadow-[#d4af37]/50 transition-all duration-300 transform hover:scale-105"
      >
        新しいサイトへ移動する
      </a>

      <p className="mt-6 text-white/40 text-sm break-all">
        https://supermobile-lines-buppan.vercel.app/
      </p>
    </div>
  )
}
