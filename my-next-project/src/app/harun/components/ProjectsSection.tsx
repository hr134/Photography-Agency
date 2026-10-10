'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ExternalLink, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { devProjectsApi, type DevProject, FALLBACK_PROJECTS } from '@/lib/devProjectsApi';
import { Reveal, Stagger, StaggerItem } from './AnimationHelpers';

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
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  return (
    <section
      id="projects"
      className="relative py-28 md:py-36 bg-[#0a0a0a] text-white overflow-hidden"
    >
      {/* BG accent */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-r from-purple-900/10 via-cyan-900/10 to-transparent blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-white/10 pb-8">
          <Reveal direction="left">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-cyan-400 uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                DYNAMIC WORK SHOWCASE
              </div>
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white">
                PROJECTS
              </h2>
            </div>
          </Reveal>
          <Reveal direction="right" delay={0.1}>
            <p className="text-sm md:text-base text-white/60 max-w-md font-light leading-relaxed">
              A curated selection of live software applications, full-stack systems, and digital platforms. Click any card to launch the live project.
            </p>
          </Reveal>
        </div>

        {/* Project Cards */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <Stagger className="space-y-12" staggerDelay={0.15}>
            {projects.map((project, idx) => {
              const num = String(idx + 1).padStart(2, '0');
              const techs = project.technologies
                ? project.technologies.split(',').map((t) => t.trim())
                : [];
              const isHovered = hoveredId === project.id;

              return (
                <StaggerItem key={project.id}>
                  <motion.a
                    href={project.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onHoverStart={() => setHoveredId(project.id)}
                    onHoverEnd={() => setHoveredId(null)}
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="group block relative rounded-3xl p-[1px] shadow-2xl"
                    style={{
                      background: isHovered
                        ? 'linear-gradient(135deg, rgba(168,85,247,0.6), rgba(34,211,238,0.3), rgba(255,255,255,0.1))'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
                      transition: 'background 0.5s ease',
                    }}
                  >
                    <div className="rounded-[23px] bg-[#121212] p-6 sm:p-8 md:p-10 border border-white/10 overflow-hidden">
                      {/* Card Top Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
                        <div className="flex items-baseline gap-4 sm:gap-6">
                          <motion.span
                            animate={{ color: isHovered ? 'rgb(34,211,238)' : 'rgba(255,255,255,0.3)' }}
                            className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-tighter"
                          >
                            {num}
                          </motion.span>
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">
                              {project.category || 'SOFTWARE APPLICATION'} {project.year ? `• ${project.year}` : ''}
                            </span>
                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white mt-0.5">
                              {project.title}
                            </h3>
                          </div>
                        </div>

                        <motion.span
                          animate={{
                            backgroundColor: isHovered ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.05)',
                            color: isHovered ? '#000' : '#fff',
                          }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-xs font-bold uppercase tracking-wider shadow-md flex-shrink-0"
                        >
                          LIVE PROJECT
                          <ExternalLink className="w-3.5 h-3.5" />
                        </motion.span>
                      </div>

                      {/* Description + Tags */}
                      <div className="mb-8">
                        <p className="text-white/70 text-base sm:text-lg max-w-2xl font-light leading-relaxed mb-6">
                          {project.description}
                        </p>
                        {techs.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {techs.map((tech, tIdx) => (
                              <motion.span
                                key={tIdx}
                                animate={{
                                  borderColor: isHovered ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.1)',
                                }}
                                className="text-xs font-mono px-3 py-1 rounded-full bg-white/[0.04] border text-white/70"
                              >
                                {tech}
                              </motion.span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Thumbnail */}
                      <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[420px] rounded-2xl overflow-hidden bg-[#181818] border border-white/10">
                        <motion.div
                          animate={{ scale: isHovered ? 1.05 : 1 }}
                          transition={{ duration: 0.7, ease: 'easeOut' }}
                          className="absolute inset-0"
                        >
                          <Image
                            src={project.thumbnail || '/project_mockup_preview.jpg'}
                            alt={project.title}
                            fill
                            className="object-cover object-center"
                          />
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-500" />

                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-white/60 pointer-events-none">
                          <span className="bg-black/70 backdrop-blur px-3 py-1 rounded-full border border-white/10">
                            {project.external_url.replace(/^https?:\/\//, '')}
                          </span>
                          <span className="bg-black/70 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-emerald-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            DEPLOYED
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.a>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </div>
    </section>
  );
}
