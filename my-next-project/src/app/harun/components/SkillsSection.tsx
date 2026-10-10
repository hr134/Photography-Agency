'use client';

import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Reveal, Stagger, StaggerItem } from './AnimationHelpers';

const SERVICES = [
  {
    number: '01',
    title: 'FULL-STACK WEB DEVELOPMENT',
    description: 'End-to-end responsive web applications built with Next.js, React, TypeScript, and modern ecosystem tooling with fast load times and clean structure.',
    tags: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    number: '02',
    title: 'WEB APPLICATION ARCHITECTURE',
    description: 'Modern Single-Page and Server-Rendered web app solutions with scalable state management, modular components, and seamless routing.',
    tags: ['App Router', 'State Management', 'Component Architecture'],
  },
  {
    number: '03',
    title: 'BACKEND & API ENGINEERING',
    description: 'Robust RESTful API design, authentication systems (JWT, OAuth, secure session cookies), middleware, and service layers with Python and Flask.',
    tags: ['Python', 'Flask', 'REST APIs', 'JWT Security'],
  },
  {
    number: '04',
    title: 'DATABASE & DATA MODELING',
    description: 'Relational schema design, database migrations, efficient queries, and data integrity safeguards using PostgreSQL, SQLite, and SQLAlchemy.',
    tags: ['PostgreSQL', 'SQLite', 'SQLAlchemy', 'Alembic'],
  },
  {
    number: '05',
    title: 'UI / UX & INTERACTIVE MOTION',
    description: 'Editorial-grade typography, micro-interactions, responsive fluid layouts, and smooth animations that elevate the product experience.',
    tags: ['Framer Motion', 'Micro-interactions', 'Accessible Design'],
  },
];

export default function SkillsSection() {
  return (
    <section
      id="skills"
      className="relative py-28 md:py-36 bg-[#f4f4f0] text-[#111111] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-black/15 pb-8">
          <Reveal direction="left">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-neutral-500 uppercase block mb-3">
                WHAT I DO / EXPERTISE
              </span>
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-neutral-900">
                SERVICES
              </h2>
            </div>
          </Reveal>
          <Reveal direction="right" delay={0.1}>
            <p className="text-sm md:text-base text-neutral-600 max-w-md font-light leading-relaxed">
              Delivering practical software engineering solutions from initial system architecture to the final pixel and interaction.
            </p>
          </Reveal>
        </div>

        {/* Numbered Service Rows with stagger */}
        <Stagger className="divide-y divide-black/15" staggerDelay={0.08}>
          {SERVICES.map((service) => (
            <StaggerItem key={service.number}>
              <motion.div
                whileHover={{ x: 8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="py-10 md:py-12 group cursor-default"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Number */}
                  <div className="md:col-span-2">
                    <motion.span
                      className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-tighter text-neutral-300 group-hover:text-neutral-900 transition-colors duration-300"
                    >
                      {service.number}
                    </motion.span>
                  </div>

                  {/* Title & Description */}
                  <div className="md:col-span-7">
                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-neutral-600 text-sm md:text-base leading-relaxed max-w-xl font-light mb-4">
                      {service.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {service.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-mono tracking-wide px-2.5 py-1 rounded-full bg-black/5 text-neutral-700 border border-black/10 group-hover:border-black/20 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="md:col-span-3 flex md:justify-end items-center pt-2">
                    <motion.span
                      whileHover={{ rotate: 45, scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="w-10 h-10 rounded-full border border-black/15 flex items-center justify-center text-neutral-500 group-hover:text-black group-hover:border-black transition-colors"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
