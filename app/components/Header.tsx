'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
      <nav className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20 max-w-[1400px] mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center group flex-shrink-0">
            <div className="font-bold whitespace-nowrap">
              <span className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl">BUPPAN</span>
              <span className="text-[#d4af37] ml-1 sm:ml-2 text-lg sm:text-xl md:text-2xl lg:text-3xl">MOBILE</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-8">
            <Link
              href="/#pricing"
              className="text-white/80 hover:text-[#d4af37] transition-colors duration-200 font-medium text-sm xl:text-base whitespace-nowrap"
            >
              料金プラン
            </Link>
            <Link
              href="/#features"
              className="text-white/80 hover:text-[#d4af37] transition-colors duration-200 font-medium text-sm xl:text-base whitespace-nowrap"
            >
              特徴
            </Link>
            <Link
              href="/#faq"
              className="text-white/80 hover:text-[#d4af37] transition-colors duration-200 font-medium text-sm xl:text-base whitespace-nowrap"
            >
              よくある質問
            </Link>
            <Link
              href="/mypage"
              className="text-white/80 hover:text-[#d4af37] transition-colors duration-200 font-medium text-sm xl:text-base whitespace-nowrap"
            >
              マイページ
            </Link>
            <Link
              href="/apply"
              className="px-4 xl:px-6 py-2 xl:py-2.5 bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black font-bold text-sm xl:text-base rounded-full hover:shadow-lg hover:shadow-[#d4af37]/50 transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
            >
              今すぐ申し込む
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white p-2 flex-shrink-0"
            aria-label="メニュー"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              <Link
                href="/#pricing"
                className="text-white/80 hover:text-[#d4af37] transition-colors duration-200 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                料金プラン
              </Link>
              <Link
                href="/#features"
                className="text-white/80 hover:text-[#d4af37] transition-colors duration-200 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                特徴
              </Link>
              <Link
                href="/#faq"
                className="text-white/80 hover:text-[#d4af37] transition-colors duration-200 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                よくある質問
              </Link>
              <Link
                href="/mypage"
                className="text-white/80 hover:text-[#d4af37] transition-colors duration-200 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                マイページ
              </Link>
              <Link
                href="/apply"
                className="px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f0d970] text-black font-bold rounded-full text-center hover:shadow-lg hover:shadow-[#d4af37]/50 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                今すぐ申し込む
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
