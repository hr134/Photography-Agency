'use client';

import Image from 'next/image';
import { ArrowDown, ArrowUpRight, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { devProjectsApi, type PortfolioAbout, DEFAULT_ABOUT_DATA } from '@/lib/devProjectsApi';
import { resolveImageUrl } from '@/lib/imageHelper';
import { Reveal } from './AnimationHelpers';

const TECH_STACK = [
  'NEXT.JS', 'REACT', 'TYPESCRIPT', 'PYTHON', 'FLASK',
  'TAILWIND CSS', 'POSTGRESQL', 'SQLITE', 'REST APIS',
  'FRAMER MOTION', 'DOCKER', 'GIT',
];

export default function HeroSection() {
  const [avatarUrl, setAvatarUrl] = useState('/harun_avatar.jpg');
  const [about, setAbout] = useState<PortfolioAbout>(DEFAULT_ABOUT_DATA);

  useEffect(() => {
    // Check localStorage first for instant display
    const cachedAvatar = localStorage.getItem('harun_avatar');
    if (cachedAvatar) setAvatarUrl(resolveImageUrl(cachedAvatar));

    const cachedAbout = localStorage.getItem('harun_about');
    if (cachedAbout) {
      try {
        setAbout(JSON.parse(cachedAbout));
      } catch { }
    }

    devProjectsApi
      .getAbout()
      .then((data) => {
        if (data && data.headline) setAbout(data);
      })
      .catch(() => { });

    devProjectsApi.getContactInfo().then((contact) => {
      if (contact && contact.avatar_url) {
        setAvatarUrl(resolveImageUrl(contact.avatar_url));
      }
    }).catch(() => { });
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen bg-[#0a0a0a] text-white pt-16 sm:pt-28 pb-16 flex flex-col justify-between w-full max-w-full overflow-hidden"
    >
      {/* Ambient background glow - lightweight on mobile, rich on desktop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-purple-600/20 via-cyan-500/10 to-transparent rounded-full blur-[60px] md:blur-[140px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-pink-600/10 to-transparent rounded-full blur-[40px] md:blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="w-full max-w-none px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 flex-1 flex flex-col justify-center my-auto relative z-10">
        {/* Top Tagline */}
        <Reveal delay={0.1}>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur text-xs font-mono tracking-wider text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              AVAILABLE FOR PROJECTS
            </div>
            <span className="text-xs font-mono text-white/40 tracking-widest hidden sm:inline-block">
              Portfolio
            </span>
          </div>
        </Reveal>

        {/* Main Title + Avatar */}
        <div className="relative text-center my-4 md:my-8 select-none">
          {/* Giant Title */}
          <h1 className="text-[14vw] sm:text-[13vw] md:text-[12vw] font-black uppercase tracking-tighter leading-[0.85] text-white/95">
            <motion.span
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px 0px' }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              HI, I&apos;M
            </motion.span>
            <br />
            <motion.span
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px 0px' }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent"
            >
              HARUN
            </motion.span>
          </h1>

          {/* Floating 3D Avatar */}
          <motion.div
            className="relative -mt-10 sm:-mt-24 md:-mt-36 z-20 flex justify-center"
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-40px 0px' }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80">
              {/* Spinning ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-[-8px] rounded-full border-2 border-dashed border-purple-500/30"
              />
              {/* Avatar glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-cyan-400 p-[3px] shadow-[0_0_60px_rgba(168,85,247,0.4)]">
                <div className="w-full h-full rounded-full overflow-hidden relative bg-[#121212] ring-4 ring-[#0a0a0a]">
                  <Image
                    src={avatarUrl}
                    alt="Harun Rashid - Engineer"
                    fill
                    priority
                    unoptimized
                    className="object-cover object-top scale-105 contrast-[1.06] brightness-[1.02]"
                  />
                  {/* Project thematic color glow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 via-transparent to-cyan-400/25 mix-blend-overlay pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]/30 pointer-events-none" />
                </div>
              </div>

              {/* Engineering badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px 0px' }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="absolute -bottom-2 sm:bottom-2 -right-4 sm:right-0 bg-[#0a0a0a]/90 border border-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-xl pointer-events-none"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-mono font-bold text-white tracking-wide">
                  {about.avatar_badge || 'SOFT. ENGINEER'}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Sub-content Row */}
        <Reveal delay={0.5} direction="up" distance={30}>
          <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-end border-t border-white/10 pt-8">
            <div className="md:col-span-7">
              <p className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">
                {about.subheadline || 'SOFTWARE & SYSTEMS ENGINEER'}
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-light text-white/80 leading-relaxed max-w-2xl xl:max-w-3xl">
                {about.bio_short || 'Engineer focused on architecting resilient software systems, scalable backends, and modern computational platforms with high technical precision.'}
              </p>

            </div>

            <div className="md:col-span-5 flex flex-wrap md:justify-end items-center gap-3">
              <motion.a
                href="#projects"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-white/20 transition-shadow"
              >
                PROJECTS
                <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
              </motion.a>

              <motion.a
                href="#cv"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border border-purple-500/40 text-white text-xs font-bold uppercase tracking-wider hover:border-cyan-400 transition-all shadow-md"
              >
                VIEW CV
                <ArrowUpRight className="w-3.5 h-3.5 text-cyan-300" />
              </motion.a>

              <motion.a
                href="#contact"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/20 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/10 hover:border-white/40 transition-all"
              >
                CONTACT
                <ArrowUpRight className="w-3.5 h-3.5" />
              </motion.a>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Infinite Tech Marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-20px 0px' }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="w-full border-y border-white/10 bg-white/[0.02] py-4 mt-12 overflow-hidden select-none"
      >
        <motion.div
          animate={{ x: ['0%', '-33.333%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="flex gap-8 whitespace-nowrap"
        >
          {[...TECH_STACK, ...TECH_STACK, ...TECH_STACK].map((tech, idx) => (
            <div key={idx} className="flex items-center gap-8">
              <span className="text-xs md:text-sm font-mono tracking-widest text-white/50 hover:text-white transition-colors">
                {tech}
              </span>
              <span className="text-white/20 text-xs">✦</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
