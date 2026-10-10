'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowUpRight } from 'lucide-react';

export default function HarunNav() {
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let currentDone = false;
    let currentScrolled = false;

    let threshold = 0;
    const calculateThreshold = () => {
      const section = document.getElementById('scroll-animation');
      if (section && section.offsetHeight > 0) {
        threshold = section.offsetHeight - 60;
      } else {
        threshold = window.innerHeight * 2.8;
      }
    };

    calculateThreshold();
    window.addEventListener('resize', calculateThreshold, { passive: true });

    const handleScroll = () => {
      const sy = window.scrollY;
      const done = sy >= threshold;
      const isScrolled = done && sy > threshold + 50;

      if (done !== currentDone) {
        currentDone = done;
        setVisible(done);
      }
      if (isScrolled !== currentScrolled) {
        currentScrolled = isScrolled;
        setScrolled(isScrolled);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', calculateThreshold);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { name: 'ABOUT', href: '#about' },
    { name: 'SKILLS', href: '#skills' },
    { name: 'PROJECTS', href: '#projects' },
    { name: 'CV / RESUME', href: '#cv' },
    { name: 'CONTACT', href: '#contact' },
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 transform ${
        !visible
          ? 'opacity-0 -translate-y-8 pointer-events-none'
          : scrolled
          ? 'opacity-100 translate-y-0 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 py-4 shadow-2xl pointer-events-auto'
          : 'opacity-100 translate-y-0 bg-transparent py-6 pointer-events-auto'
      }`}
    >
      <div className="w-full px-6 md:px-12 lg:px-16 xl:px-24 flex items-center justify-between">
        {/* Monogram / Brand */}
        <a
          href="#hero"
          onClick={(e) => handleScrollTo(e, '#hero')}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <span className="font-sans font-black text-xl tracking-tighter text-white group-hover:text-[#a855f7] transition-colors">
            HARUN
          </span>
          <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 animate-pulse" />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-widest text-white/70">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className="hover:text-white transition-colors uppercase tracking-wider relative group py-1"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-purple-500 to-cyan-400 group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="#contact"
            onClick={(e) => handleScrollTo(e, '#contact')}
            className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white overflow-hidden transition-all duration-300 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 p-[1px] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-105"
          >
            <span className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#0a0a0a] group-hover:bg-transparent transition-all duration-300">
              CONTACT ME
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="md:hidden p-2 text-white/80 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 px-6 py-8 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className="text-lg font-bold tracking-widest text-white/80 hover:text-white"
            >
              {link.name}
            </a>
          ))}
          <a
            href="#contact"
            onClick={(e) => handleScrollTo(e, '#contact')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-cyan-500 text-white"
          >
            CONTACT ME
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </header>
  );
}
