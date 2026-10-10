'use client';

import Image from 'next/image';
import { ArrowDown, ArrowUpRight, Terminal } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Reveal } from './AnimationHelpers';

const TECH_STACK = [
  'NEXT.JS', 'REACT', 'TYPESCRIPT', 'PYTHON', 'FLASK',
  'TAILWIND CSS', 'POSTGRESQL', 'SQLITE', 'REST APIS',
  'FRAMER MOTION', 'DOCKER', 'GIT',
];

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Parallax effects
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const avatarY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const avatarScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.85]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative min-h-screen bg-[#0a0a0a] text-white pt-28 pb-16 flex flex-col justify-between overflow-hidden"
    >
      {/* Animated ambient background */}
      <motion.div
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-purple-600/20 via-cyan-500/10 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-pink-600/10 to-transparent rounded-full blur-[100px]" />
      </motion.div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 w-full flex-1 flex flex-col justify-center my-auto relative z-10">
        {/* Top Tagline */}
        <Reveal delay={0.1}>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur text-xs font-mono tracking-wider text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              AVAILABLE FOR PROJECTS
            </div>
            <span className="text-xs font-mono text-white/40 tracking-widest hidden sm:inline-block">
              PORTFOLIO 2026
            </span>
          </div>
        </Reveal>

        {/* Main Title + Avatar */}
        <div className="relative text-center my-4 md:my-8 select-none">
          {/* Giant Parallax Title */}
          <motion.h1
            style={{ y: titleY }}
            className="text-[14vw] sm:text-[13vw] md:text-[12vw] font-black uppercase tracking-tighter leading-[0.85] text-white/95"
          >
            <motion.span
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              HI, I&apos;M
            </motion.span>
            <br />
            <motion.span
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent"
            >
              HARUN
            </motion.span>
          </motion.h1>

          {/* Floating 3D Avatar */}
          <motion.div
            style={{ y: avatarY, scale: avatarScale }}
            className="relative -mt-16 sm:-mt-24 md:-mt-36 z-20 flex justify-center"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-80 lg:h-80">
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
                    src="/harun_avatar.jpg"
                    alt="Harun Rashid - Full-Stack Developer"
                    fill
                    priority
                    className="object-cover object-top scale-105"
                  />
                </div>
              </div>

              {/* Tech badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute -bottom-2 sm:bottom-2 -right-4 sm:right-0 bg-[#0a0a0a]/90 border border-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-xl pointer-events-none"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-mono font-bold text-white tracking-wide">
                  FULL-STACK DEV
                </span>
              </motion.div>

              {/* Year badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="absolute -top-1 -left-4 sm:left-0 bg-[#0a0a0a]/90 border border-white/20 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl pointer-events-none"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span className="text-[11px] font-mono font-bold text-white tracking-wide">
                  2026
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
                SOFTWARE DEVELOPER &amp; ARCHITECT
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-light text-white/80 leading-relaxed max-w-xl">
                I build modern web applications, digital experiences, and practical software solutions with clean architecture and refined interactions.
              </p>
            </div>

            <div className="md:col-span-5 flex flex-wrap md:justify-end items-center gap-4">
              <motion.a
                href="#projects"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-white/20 transition-shadow"
              >
                EXPLORE PROJECTS
                <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
              </motion.a>

              <motion.a
                href="#contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/20 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/10 hover:border-white/40 transition-all"
              >
                CONTACT ME
                <ArrowUpRight className="w-3.5 h-3.5" />
              </motion.a>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Infinite Tech Marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 1 }}
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
