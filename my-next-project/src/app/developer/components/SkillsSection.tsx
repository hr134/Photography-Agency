'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { devProjectsApi, type PortfolioService, DEFAULT_SERVICES_DATA } from '@/lib/devProjectsApi';
import { Reveal, Stagger, StaggerItem } from './AnimationHelpers';

export default function SkillsSection() {
  const [services, setServices] = useState<PortfolioService[]>(DEFAULT_SERVICES_DATA);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('harun_services');
      if (cached) setServices(JSON.parse(cached));
    } catch {}

    devProjectsApi
      .getServices()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setServices(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section
      id="skills"
      className="relative py-28 md:py-36 bg-[#f4f4f0] text-[#111111] overflow-hidden w-full max-w-full"
    >
      <div className="w-full max-w-none px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-black/15 pb-8">
          <Reveal direction="left">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-neutral-500 uppercase block mb-3">
                WHAT I DO / EXPERTISE
              </span>
              <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-neutral-900">
                SERVICES
              </h2>
            </div>
          </Reveal>
          <Reveal direction="right" delay={0.1}>
            <p className="text-base sm:text-lg text-neutral-600 max-w-lg font-light leading-relaxed">
              Delivering practical software engineering solutions from initial system architecture to the final pixel and interaction.
            </p>
          </Reveal>
        </div>

        {/* Numbered Service Rows with stagger */}
        <Stagger className="divide-y divide-black/15" staggerDelay={0.08}>
          {services.map((service) => {
            const tagList = Array.isArray(service.tags)
              ? service.tags
              : typeof service.tags === 'string'
              ? service.tags.split(',').map((t) => t.trim()).filter(Boolean)
              : [];

            return (
              <StaggerItem key={service.number}>
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="py-8 md:py-12 group cursor-default"
                >
                  {/* Full-width row: number | content | arrow */}
                  <div className="flex items-start gap-4 sm:gap-8 w-full">
                    {/* Number */}
                    <div className="flex-shrink-0 w-10 sm:w-16 md:w-20">
                      <span className="text-2xl sm:text-4xl md:text-5xl font-black font-mono tracking-tighter text-neutral-300 group-hover:text-neutral-900 transition-colors duration-300">
                        {service.number}
                      </span>
                    </div>

                    {/* Title & Description - takes all remaining space */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-neutral-900 mb-2 sm:mb-3 leading-tight">
                        {service.title}
                      </h3>
                      <p className="text-neutral-600 text-sm sm:text-base md:text-lg leading-relaxed font-light mb-3 sm:mb-4">
                        {service.description}
                      </p>
                      {tagList.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tagList.map((tag) => (
                            <span
                              key={tag}
                              className="text-[11px] font-mono tracking-wide px-2.5 py-1 rounded-full bg-black/5 text-neutral-700 border border-black/10 group-hover:border-black/20 transition-colors"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>


                  {/* Arrow — always pinned to the far right */}
                  <div className="flex-shrink-0 flex items-start pt-1 sm:pt-2">
                    <motion.span
                      whileHover={{ rotate: 45, scale: 1.15 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-black/15 flex items-center justify-center text-neutral-500 group-hover:text-black group-hover:border-black transition-colors"
                    >
                      <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.span>
                  </div>
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
