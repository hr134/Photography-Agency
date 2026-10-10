'use client';

import { useState, useEffect, useRef } from 'react';
import { Code2, Cpu, Layers, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { devProjectsApi, type PortfolioAbout, DEFAULT_ABOUT_DATA } from '@/lib/devProjectsApi';
import { resolveImageUrl } from '@/lib/imageHelper';
import { Reveal, Stagger, StaggerItem } from './AnimationHelpers';

const PILLARS_CONFIG = [
  { icon: Code2, number: '01', color: 'purple', defaultTitle: 'FULL-STACK FOCUS', defaultDesc: 'Seamlessly connecting reactive React / Next.js frontends with robust Python, Flask, and database backends.' },
  { icon: Cpu, number: '02', color: 'cyan', defaultTitle: 'ARCHITECTURE & SCALE', defaultDesc: 'Designing clean relational schemas, secure auth flows, and resilient API endpoints engineered for production reliability.' },
  { icon: Layers, number: '03', color: 'pink', defaultTitle: 'MOTION & UX', defaultDesc: 'Crafting fluid micro-animations, accessible interfaces, and refined interactions inspired by editorial design.' },
];

const colorMap: Record<string, string> = {
  purple: 'from-purple-500/10 border-purple-500/20 text-purple-400 hover:border-purple-500/60',
  cyan:   'from-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:border-cyan-500/60',
  pink:   'from-pink-500/10 border-pink-500/20 text-pink-400 hover:border-pink-500/60',
};

export default function AboutSection() {
  const ref = useRef<HTMLElement>(null);
  // CSS-based line — animates in when section enters viewport (no scroll listener)
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) line.style.width = '100%'; },
      { threshold: 0.3 }
    );
    obs.observe(line);
    return () => obs.disconnect();
  }, []);

  const [avatarUrl, setAvatarUrl] = useState<string>('/harun_avatar.jpg');
  const [about, setAbout] = useState<PortfolioAbout>(DEFAULT_ABOUT_DATA);

  useEffect(() => {
    try {
      const localAvatar = localStorage.getItem('harun_avatar');
      if (localAvatar) setAvatarUrl(localAvatar);

      const localAbout = localStorage.getItem('harun_about');
      if (localAbout) setAbout(JSON.parse(localAbout));
    } catch {}

    devProjectsApi
      .getAbout()
      .then((data) => {
        if (data && data.headline) setAbout(data);
      })
      .catch(() => {});

    devProjectsApi
      .getContactInfo()
      .then((c) => {
        if (c?.avatar_url) {
          setAvatarUrl(c.avatar_url);
          try {
            localStorage.setItem('harun_avatar', c.avatar_url);
          } catch {}
        }
      })
      .catch(() => {});
  }, []);


  return (
    <section
      id="about"
      className="relative py-28 md:py-36 bg-[#0a0a0a] text-white overflow-hidden w-full max-w-full"
    >
      {/* Ambient blobs - strictly contained */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-10 -translate-y-1/2 w-72 h-72 bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Star 1: Floating glassmorphic badge (Visible on MOBILE & Desktop) */}
      <motion.div
        animate={{ y: [-8, 8, -8], rotate: [8, 16, 8] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 sm:top-20 left-4 sm:left-12 md:left-20 opacity-80 pointer-events-none z-20"
      >
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-purple-500/40 via-cyan-400/30 to-white/20 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" />
        </div>
      </motion.div>

      {/* Star 2: 4-pointed rotating cosmic star (Visible on MOBILE & Desktop) */}
      <motion.div
        animate={{ rotate: 360, y: [6, -6, 6] }}
        transition={{ rotate: { duration: 16, repeat: Infinity, ease: 'linear' }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
        className="absolute top-12 sm:top-24 right-5 sm:right-16 md:right-28 pointer-events-none z-20 text-cyan-400 drop-shadow-[0_0_16px_rgba(34,211,238,0.7)]"
      >
        <span className="text-3xl sm:text-4xl md:text-5xl font-black select-none">✦</span>
      </motion.div>

      {/* Star 3: Additional floating sparkle near the center top (Visible on MOBILE & Desktop) */}
      <motion.div
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none z-20 text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]"
      >
        <span className="text-2xl sm:text-3xl font-black select-none">✧</span>
      </motion.div>

      <div className="w-full max-w-none px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 relative z-10 text-center">
        {/* Animated 4-point star above heading */}
        <motion.div
          animate={{ rotate: [0, 180, 360], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-flex items-center justify-center mb-2"
        >
          <span className="text-2xl sm:text-3xl text-purple-400 drop-shadow-[0_0_14px_rgba(168,85,247,0.8)]">✦</span>
        </motion.div>

        {/* Stroke heading with scroll line */}
        <Reveal direction="up" distance={60}>
          <h2 className="text-[12vw] sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight stroke-text mb-4 select-none">
            ABOUT ME
          </h2>
        </Reveal>

        {/* Animated underline — CSS transition, not scroll-driven (eliminates lag) */}
        <div className="h-px bg-white/10 mb-12 lg:mb-16 overflow-hidden mx-auto max-w-md w-full">
          <div
            ref={lineRef}
            style={{ width: '0%', transition: 'width 1.2s cubic-bezier(0.25,0.46,0.45,0.94)' }}
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-400"
          />
        </div>

        {/* Photo + text side-by-side using full width grid on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center text-left mb-20 lg:mb-24">
          {/* Avatar (Generous responsive frame) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <Reveal direction="left" delay={0.1}>
              <div className="relative mx-auto lg:mx-0 w-full max-w-xs sm:max-w-sm lg:max-w-none h-72 sm:h-96 lg:h-[440px] xl:h-[480px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/10 group">
                <img
                  src={resolveImageUrl(avatarUrl, '/harun_avatar.jpg')}
                  alt="Harun Rashid - Engineer"
                  className="w-full h-full object-cover object-top contrast-[1.05] group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/harun_avatar.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                {/* Clean Engineer name overlay (No IUBAT, No BSc) */}
                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
                  <p className="text-[10px] sm:text-[11px] font-mono text-cyan-300 tracking-widest font-bold">ENGINEER</p>
                  <p className="text-lg sm:text-2xl font-black text-white">HARUN RASHID</p>
                  <p className="text-[10px] sm:text-xs font-mono text-white/60">SOFTWARE &amp; SYSTEMS</p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Text (Expansive widescreen editorial layout) */}
          <div className="lg:col-span-7 xl:col-span-8">
            <Reveal direction="right" delay={0.2}>
              <div className="space-y-6">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 block">
                  SYSTEMS PHILOSOPHY &amp; BACKGROUND
                </span>
                <p className="text-xl sm:text-2xl lg:text-3xl font-light text-white/90 leading-relaxed">
                  {about.bio_long || 'I am an engineer dedicated to designing robust software systems, computational workflows, and scalable architectures. With a disciplined engineering background, I bridge foundational engineering principles with modern full-stack technologies to deliver software that is reliable, secure, and built for scale.'}
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        {/* 3 Pillar Cards - Spread edge-to-edge */}
        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 xl:gap-10 text-left w-full" staggerDelay={0.12}>
          {PILLARS_CONFIG.map((p, idx) => {
            const Icon = p.icon;
            const colors = colorMap[p.color];
            const pNum = idx + 1;
            const pTitle = (about as any)[`pillar${pNum}_title`] || p.defaultTitle;
            const pDesc = (about as any)[`pillar${pNum}_desc`] || p.defaultDesc;

            return (
              <StaggerItem key={p.number}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`p-8 lg:p-10 rounded-2xl bg-gradient-to-br ${colors} bg-white/[0.02] border transition-all group cursor-default h-full flex flex-col justify-between`}
                >
                  <div>
                    <div className={`w-12 h-12 rounded-xl bg-white/5 border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${colors}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-mono uppercase tracking-wider text-white mb-3 font-bold">
                      {p.number} — {pTitle}
                    </h3>
                    <p className="text-sm md:text-base text-white/65 leading-relaxed">{pDesc}</p>
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </Stagger>

      </div>
    </section>
  );
}
