'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ExternalLink, Sparkles, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { devProjectsApi, type DevProject, FALLBACK_PROJECTS } from '@/lib/devProjectsApi';
import { resolveImageUrl } from '@/lib/imageHelper';
import { Reveal } from './AnimationHelpers';

export default function ProjectsSection() {
  const [projects, setProjects] = useState<DevProject[]>(FALLBACK_PROJECTS);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    devProjectsApi
      .getPublic()
      .then((data) => {
        if (isMounted && data && data.length > 0) setProjects(data);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      id="projects"
      className="relative py-28 md:py-36 bg-[#0a0a0a] text-white overflow-visible w-full max-w-full"
    >
      {/* Background ambient lighting - strictly contained to avoid mobile viewport expansion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] max-w-full h-[400px] bg-gradient-to-r from-purple-900/10 via-cyan-900/10 to-transparent blur-[140px]" />
      </div>

      <div className="w-full max-w-none px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 relative z-10">
        {/* Section Header - Clean and professional, no '3D showcase' label */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 sm:mb-20 gap-6 border-b border-white/10 pb-8">
          <Reveal direction="left">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-cyan-400 uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                FEATURED WORK
              </div>
              <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white">
                PROJECTS
              </h2>
            </div>
          </Reveal>
          <Reveal direction="right" delay={0.1}>
            <p className="text-base sm:text-lg text-white/60 max-w-lg font-light leading-relaxed">
              Selected software applications, backend architectures, and production platforms. Scroll through each card to reveal live deployments.
            </p>
          </Reveal>
        </div>

        {/* Stacked Cards Track (Book-style stacking where cards pin & previous project headers stay visible) */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="relative pb-32">
            {projects.map((project, idx) => {
              const num = String(idx + 1).padStart(2, '0');
              const techs = project.technologies
                ? project.technologies.split(',').map((t) => t.trim())
                : [];
              const isHovered = hoveredId === project.id;
              const thumbnailSrc = resolveImageUrl(project.thumbnail);

              // Header stacking offset: each card stops slightly lower than previous so previous headers remain visible
              const topOffset = 70 + idx * 52;

              return (
                <div
                  key={project.id}
                  style={{
                    top: `${topOffset}px`,
                    zIndex: idx + 1,
                  }}
                  className="sticky mb-24 md:mb-32 transition-transform duration-300"
                >
                  <motion.a
                    href={project.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onHoverStart={() => setHoveredId(project.id)}
                    onHoverEnd={() => setHoveredId(null)}
                    whileHover={{ y: -3 }}
                    className="block relative rounded-[28px] md:rounded-[34px] p-[1px] shadow-[0_-12px_45px_rgba(0,0,0,0.85)] group cursor-pointer transition-all duration-300"
                    style={{
                      background: isHovered
                        ? 'linear-gradient(135deg, rgba(168,85,247,0.7), rgba(34,211,238,0.5), rgba(255,255,255,0.2))'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.06), rgba(0,0,0,0.5))',
                    }}
                  >
                    {/* Solid Opaque Card Body so it covers previous card's body while preserving its header */}
                    <div className="rounded-[24px] md:rounded-[33px] bg-[#121212] p-4 sm:p-8 md:p-10 border border-white/10 overflow-hidden relative shadow-2xl max-w-full">
                      {/* Ambient inner glows */}
                      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[90px] pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-[90px] pointer-events-none" />

                      {/* ── CARD HEADER TAB (Always visible when stacked) ── */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-white/10 mb-6 sm:mb-8 relative z-10 min-w-0">
                        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                          <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono tracking-tighter text-white/90 group-hover:text-cyan-400 transition-colors flex-shrink-0">
                            {num}
                          </span>
                          <div className="min-w-0">
                            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-white/40 block truncate">
                              PROJECT &bull; {project.category || 'SOFTWARE APPLICATION'} {project.year ? `• ${project.year}` : ''}
                            </span>
                            <h3 className="text-base sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white mt-0.5 group-hover:text-purple-200 transition-colors truncate">
                              {project.title}
                            </h3>
                          </div>
                        </div>

                        {/* LIVE PROJECT pill button with rounded oval outline */}
                        <div
                          className={`inline-flex items-center gap-2 px-3.5 sm:px-6 py-1.5 sm:py-2.5 rounded-full border text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 self-start sm:self-auto flex-shrink-0 ${
                            isHovered
                              ? 'bg-white text-black border-white shadow-lg'
                              : 'bg-white/5 text-white border-white/25 hover:border-white'
                          }`}
                        >
                          <span>LIVE PROJECT</span>
                          <ExternalLink className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                        </div>
                      </div>

                      {/* ── CARD CONTENT ── */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center relative z-10">
                        {/* Left: Showcase Screenshot */}
                        <div className="lg:col-span-7">
                          <div className="relative w-full h-48 sm:h-80 md:h-96 lg:h-[420px] xl:h-[460px] rounded-2xl overflow-hidden bg-[#181818] border border-white/10 shadow-inner group/thumb">
                            <Image
                              src={thumbnailSrc}
                              alt={project.title}
                              fill
                              unoptimized
                              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between text-xs font-mono text-white/80 pointer-events-none gap-2">
                              <span className="bg-black/85 backdrop-blur px-2.5 sm:px-3 py-1 rounded-full border border-white/10 truncate max-w-[130px] sm:max-w-xs text-[10px] sm:text-xs">
                                {project.external_url.replace(/^https?:\/\//, '')}
                              </span>
                              <span className="bg-black/85 backdrop-blur px-2 sm:px-3 py-1 rounded-full border border-white/10 text-emerald-400 flex items-center gap-1 font-bold flex-shrink-0 text-[10px] sm:text-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                LIVE DEPLOYED
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Technical Information */}
                        <div className="lg:col-span-5 flex flex-col justify-between">
                          <div>
                            <div className="inline-flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-widest mb-3">
                              <Layers className="w-3.5 h-3.5" />
                              SYSTEM DETAILS
                            </div>
                            <p className="text-white/70 text-base md:text-lg font-light leading-relaxed mb-6">
                              {project.description}
                            </p>
                          </div>

                          {/* Tech stack badges */}
                          {techs.length > 0 && (
                            <div>
                              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block mb-2.5 font-bold">
                                TECH STACK &amp; INFRASTRUCTURE
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {techs.map((tech, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="text-xs font-mono px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/80 group-hover:border-purple-500/30 transition-colors"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
