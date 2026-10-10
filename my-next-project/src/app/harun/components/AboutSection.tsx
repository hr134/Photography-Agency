'use client';

import Image from 'next/image';
import { Code2, Cpu, Layers, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Reveal, Stagger, StaggerItem } from './AnimationHelpers';

const PILLARS = [
  {
    icon: Code2,
    number: '01',
    title: 'FULL-STACK FOCUS',
    desc: 'Seamlessly connecting reactive React / Next.js frontends with robust Python, Flask, and database backends.',
    color: 'purple',
  },
  {
    icon: Cpu,
    number: '02',
    title: 'ARCHITECTURE & SCALE',
    desc: 'Designing clean relational schemas, secure auth flows, and resilient API endpoints engineered for production reliability.',
    color: 'cyan',
  },
  {
    icon: Layers,
    number: '03',
    title: 'MOTION & UX',
    desc: 'Crafting fluid micro-animations, accessible interfaces, and refined interactions inspired by editorial design.',
    color: 'pink',
  },
];

const colorMap: Record<string, string> = {
  purple: 'from-purple-500/10 border-purple-500/20 text-purple-400 hover:border-purple-500/60',
  cyan:   'from-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:border-cyan-500/60',
  pink:   'from-pink-500/10 border-pink-500/20 text-pink-400 hover:border-pink-500/60',
};

export default function AboutSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const lineWidth = useTransform(scrollYProgress, [0.1, 0.6], ['0%', '100%']);

  return (
    <section
      ref={ref}
      id="about"
      className="relative py-28 md:py-36 bg-[#0a0a0a] text-white overflow-hidden"
    >
      {/* Ambient blobs */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-72 h-72 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating shape */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [12, 18, 12] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 left-8 md:left-20 opacity-70 pointer-events-none hidden sm:block"
      >
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-tr from-purple-500/40 via-cyan-400/30 to-white/20 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Sparkles className="w-6 h-6 text-purple-300" />
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        {/* Stroke heading with scroll line */}
        <Reveal direction="up" distance={60}>
          <h2 className="text-[12vw] sm:text-7xl md:text-8xl font-black uppercase tracking-tight stroke-text mb-4 select-none">
            ABOUT ME
          </h2>
        </Reveal>

        {/* Animated underline */}
        <div className="h-px bg-white/10 mb-10 overflow-hidden mx-auto max-w-xs">
          <motion.div style={{ width: lineWidth }} className="h-full bg-gradient-to-r from-purple-500 to-cyan-400" />
        </div>

        {/* Photo + text side-by-side on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left mb-16">
          {/* Avatar */}
          <Reveal direction="left" delay={0.1}>
            <div className="relative mx-auto lg:mx-0 w-64 h-72 sm:w-72 sm:h-80 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/10">
              <Image
                src="/harun_avatar.jpg"
                alt="Harun Rashid"
                fill
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              {/* Name overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-xs font-mono text-white/60 tracking-widest">FULL-STACK DEVELOPER</p>
                <p className="text-lg font-black text-white">HARUN RASHID</p>
              </div>
            </div>
          </Reveal>

          {/* Text */}
          <Reveal direction="right" delay={0.2}>
            <div>
              <p className="text-xl sm:text-2xl font-light text-white/85 leading-relaxed mb-6">
                I am a software engineer dedicated to building modern web applications, scalable backend systems, and responsive user interfaces.
              </p>
              <p className="text-sm text-white/50 leading-relaxed">
                I bridge thoughtful design with resilient architecture to deliver software that feels fast, intuitive, and built to last. Every line of code I write is a deliberate step toward solving real problems elegantly.
              </p>
            </div>
          </Reveal>
        </div>

        {/* 3 Pillar Cards */}
        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left" staggerDelay={0.12}>
          {PILLARS.map((p) => {
            const Icon = p.icon;
            const colors = colorMap[p.color];
            return (
              <StaggerItem key={p.number}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`p-8 rounded-2xl bg-gradient-to-br ${colors} bg-white/[0.02] border transition-all group cursor-default`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-white/5 border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${colors}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-mono uppercase tracking-wider text-white mb-2">
                    {p.number} — {p.title}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">{p.desc}</p>
                </motion.div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
