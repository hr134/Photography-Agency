'use client';

import Link from 'next/link';
import { Lock, ArrowUp, Mail } from 'lucide-react';

export default function HarunFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#0a0a0a] text-white pt-24 pb-12 border-t border-white/10 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-6">
        {/* Giant Stroke Typography (matching Wix Studio reference Frame 13) */}
        <div className="mb-14 text-center md:text-left">
          <h2 className="text-[12vw] font-black uppercase tracking-tighter stroke-text leading-none">
            HARUN RASHID
          </h2>
        </div>

        {/* Playful Colorful Geometric Shapes Row (Directly inspired by Wix Studio footer symbols in Frame 13) */}
        <div className="flex items-center justify-between gap-3 sm:gap-6 py-8 border-y border-white/10 mb-14 overflow-x-auto scrollbar-none">
          {/* Symbol 1: Purple 4-leaf asterisk */}
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center flex-shrink-0 hover:rotate-90 hover:scale-110 transition-all cursor-pointer">
            <span className="text-purple-400 text-xl font-bold">✤</span>
          </div>

          {/* Symbol 2: Lime green four dots */}
          <div className="grid grid-cols-2 gap-1.5 w-10 h-10 sm:w-14 sm:h-14 p-2.5 rounded-2xl bg-lime-500/20 border border-lime-500/40 flex-shrink-0 hover:rotate-45 hover:scale-110 transition-all cursor-pointer">
            <div className="rounded-full bg-lime-400" />
            <div className="rounded-full bg-lime-400" />
            <div className="rounded-full bg-lime-400" />
            <div className="rounded-full bg-lime-400" />
          </div>

          {/* Symbol 3: Cyan arc / crescent */}
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-cyan-400 border-4 border-[#0a0a0a] flex-shrink-0 hover:scale-110 transition-transform cursor-pointer" />

          {/* Symbol 4: Purple circle */}
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-purple-600 flex-shrink-0 hover:scale-110 transition-transform cursor-pointer" />

          {/* Symbol 5: Orange split arches */}
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-t-full bg-orange-500 flex-shrink-0 hover:-translate-y-2 transition-transform cursor-pointer" />

          {/* Symbol 6: Pink ring / torus */}
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border-[6px] border-pink-500 flex-shrink-0 hover:scale-110 transition-transform cursor-pointer" />

          {/* Symbol 7: Yellow diamond */}
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-yellow-400 rotate-45 flex-shrink-0 hover:rotate-90 hover:scale-110 transition-all cursor-pointer" />
        </div>

        {/* Bottom Information & Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-xs font-mono text-white/50">
          <div className="md:col-span-4">
            <p className="text-white/80 font-bold tracking-wider mb-1">HARUN PORTFOLIO</p>
            <p>© {new Date().getFullYear()} Harun Rashid. All rights reserved.</p>
          </div>

          {/* Social Links */}
          <div className="md:col-span-5 flex flex-wrap items-center gap-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GITHUB</span>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              <span>LINKEDIN</span>
            </a>
            <a
              href="mailto:hr1349891@gmail.com"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>EMAIL</span>
            </a>

          </div>

          {/* Back to top + Discreet Admin Lock */}
          <div className="md:col-span-3 flex md:justify-end items-center gap-4">
            <button
              onClick={scrollToTop}
              className="p-3 rounded-full border border-white/20 hover:border-white hover:text-white transition-all hover:-translate-y-1"
              aria-label="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>

            {/* Discreet Admin Lock Button */}
            <Link
              href="/harun/login"
              title="Admin Access"
              className="p-3 rounded-full border border-white/10 text-white/20 hover:text-purple-400 hover:border-purple-400/40 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
