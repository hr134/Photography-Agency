'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, ArrowUp, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { devProjectsApi } from '@/lib/devProjectsApi';

export default function HarunFooter() {
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [email, setEmail] = useState<string>('hr1349891@gmail.com');
  const [githubUrl, setGithubUrl] = useState<string>('https://github.com');
  const [linkedinUrl, setLinkedinUrl] = useState<string>('https://linkedin.com');

  useEffect(() => {
    let isMounted = true;
    devProjectsApi
      .getContactInfo()
      .then((data) => {
        if (!isMounted || !data) return;
        if (data.email) {
          setEmail(data.email);
        }
        if (data.whatsapp) {
          setWhatsapp(data.whatsapp);
        }
        if (data.socials && Array.isArray(data.socials)) {
          const gh = data.socials.find(
            (s) =>
              s.platform?.toLowerCase().includes('github') ||
              s.url?.toLowerCase().includes('github.com')
          );
          if (gh?.url) setGithubUrl(gh.url);

          const li = data.socials.find(
            (s) =>
              s.platform?.toLowerCase().includes('linkedin') ||
              s.url?.toLowerCase().includes('linkedin.com')
          );
          if (li?.url) setLinkedinUrl(li.url);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const cleanWhatsApp = whatsapp.replace(/[^0-9]/g, '');
  const whatsappUrl = cleanWhatsApp
    ? `https://wa.me/${cleanWhatsApp}`
    : '#contact';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full max-w-full overflow-hidden -mt-10 sm:-mt-16 md:-mt-20">
      {/* Curved circle arch touching full device width from edge to edge */}
      <div className="w-full overflow-hidden leading-none -mb-[1px] relative z-20 pointer-events-none">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-12 sm:h-20 md:h-28 text-[#0a0a0a] block"
        >
          {/* Subtle luminous border line tracing the curve */}
          <path
            d="M0,120 Q720,10 1440,120"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Main filled curve body that touches full device width */}
          <path
            d="M0,120 Q720,10 1440,120 L1440,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <footer className="relative bg-[#0a0a0a] text-white pt-6 sm:pt-10 pb-12 overflow-hidden select-none">
        {/* Ambient glow accent */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-purple-600/15 via-cyan-500/10 to-transparent rounded-full blur-[90px]" />
        </div>

        <div className="w-full max-w-none px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 relative z-10">
          {/* Giant Stroke Typography (matching Wix Studio reference Frame 13) */}
          <div className="mb-10 sm:mb-14 text-center md:text-left">
            <h2 className="text-[11vw] sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight stroke-text leading-none break-normal">
              HARUN RASHID
            </h2>
          </div>


        {/* Playful Colorful Geometric Shapes Row with Continuous Fluid Movements */}
        {/* Perfectly contained within project width across all viewports (including 320px+ mobile) */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-4 md:gap-6 py-6 sm:py-8 border-y border-white/10 mb-12 sm:mb-14 w-full max-w-full justify-items-center items-center">
          {/* Symbol 1: Purple 4-leaf asterisk (Continuous rotation + bounce) */}
          <motion.div
            animate={{ rotate: 360, y: [-3, 3, -3] }}
            transition={{
              rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
              y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            }}
            whileHover={{ scale: 1.25, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            className="w-7 h-7 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-lg sm:rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center cursor-pointer shadow-lg shadow-purple-500/20"
          >
            <span className="text-purple-400 text-sm sm:text-xl font-bold select-none">✤</span>
          </motion.div>

          {/* Symbol 2: Lime green four dots (Continuous alternating spin & scale pulse) */}
          <motion.div
            animate={{ rotate: [0, 45, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.2, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="grid grid-cols-2 gap-0.5 sm:gap-1.5 w-7 h-7 sm:w-11 sm:h-11 md:w-14 md:h-14 p-1 sm:p-2.5 rounded-lg sm:rounded-2xl bg-lime-500/20 border border-lime-500/40 cursor-pointer shadow-lg shadow-lime-500/10"
          >
            <div className="rounded-full bg-lime-400" />
            <div className="rounded-full bg-lime-400" />
            <div className="rounded-full bg-lime-400" />
            <div className="rounded-full bg-lime-400" />
          </motion.div>

          {/* Symbol 3: Cyan arc / crescent (Float & gentle tilt) */}
          <motion.div
            animate={{ y: [-5, 5, -5], rotate: [-12, 12, -12] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.25, rotate: 45 }}
            whileTap={{ scale: 0.9 }}
            className="w-7 h-7 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full bg-cyan-400 border-2 sm:border-4 border-[#0a0a0a] cursor-pointer shadow-lg shadow-cyan-400/30"
          />

          {/* Symbol 4: Purple circle (Breathing pulse & gentle bob) */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], y: [4, -4, 4] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            className="w-7 h-7 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full bg-purple-600 cursor-pointer shadow-lg shadow-purple-600/30"
          />

          {/* Symbol 5: Orange split arches (Vertical hop / bounce) */}
          <motion.div
            animate={{ y: [0, -7, 0], scaleY: [1, 1.12, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ y: -10, scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="w-7 h-7 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-t-full bg-orange-500 cursor-pointer shadow-lg shadow-orange-500/25"
          />

          {/* Symbol 6: Pink ring / torus (Reverse spin & scale wave) */}
          <motion.div
            animate={{ rotate: -360, scale: [1, 0.92, 1] }}
            transition={{
              rotate: { duration: 9, repeat: Infinity, ease: 'linear' },
              scale: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
            }}
            whileHover={{ scale: 1.25, rotate: -180 }}
            whileTap={{ scale: 0.9 }}
            className="w-7 h-7 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full border-[3px] sm:border-[6px] border-pink-500 cursor-pointer shadow-lg shadow-pink-500/20"
          />

          {/* Symbol 7: Yellow diamond (Rocking rotation & float) */}
          <motion.div
            animate={{ rotate: [45, 135, 45], scale: [1, 1.12, 1] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.25, rotate: 225 }}
            whileTap={{ scale: 0.9 }}
            className="w-7 h-7 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-md sm:rounded-xl bg-yellow-400 cursor-pointer shadow-lg shadow-yellow-400/20"
          />
        </div>

        {/* Bottom Information & Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-xs font-mono text-white/50 text-center md:text-left">
          <div className="md:col-span-4">
            <p className="text-white/80 font-bold tracking-wider mb-1">
              HARUN RASHID &bull;{' '}
              <a
                href={whatsappUrl}
                target={cleanWhatsApp ? '_blank' : undefined}
                rel={cleanWhatsApp ? 'noopener noreferrer' : undefined}
                className="text-white hover:text-emerald-400 transition-colors underline decoration-white/30 hover:decoration-emerald-400 cursor-pointer"
                title="Connect via WhatsApp"
              >
                CONTACT
              </a>
            </p>
            <p>© {new Date().getFullYear()} Harun Rashid. All rights reserved.</p>
          </div>

          {/* Social Links */}
          <div className="md:col-span-5 flex flex-wrap justify-center md:justify-start items-center gap-6">
            <a
              href={githubUrl}
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
              href={linkedinUrl}
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
              href={email ? `mailto:${email}` : 'mailto:hr1349891@gmail.com'}
              className="flex items-center gap-1.5 hover:text-purple-400 transition-colors"
              title={email ? `Email: ${email}` : 'Email'}
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
              href="/developer/login"
              title="Admin Access"
              className="p-3 rounded-full border border-white/10 text-white/20 hover:text-purple-400 hover:border-purple-400/40 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
    </div>
  );
}

