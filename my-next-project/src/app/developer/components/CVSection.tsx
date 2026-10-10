'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, Sparkles, CheckCircle2, ShieldCheck, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { devProjectsApi, type PortfolioCV, DEFAULT_CVS_DATA } from '@/lib/devProjectsApi';
import { resolveImageUrl } from '@/lib/imageHelper';
import { Reveal, Stagger, StaggerItem } from './AnimationHelpers';

export default function CVSection() {
  const [cvs, setCvs] = useState<PortfolioCV[]>(DEFAULT_CVS_DATA);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);


  useEffect(() => {
    let isMounted = true;
    devProjectsApi
      .getCVs()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setCvs(data.filter((c) => c.published !== false));
        }
      })
      .catch(() => { })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDownload = async (cv: PortfolioCV) => {
    setDownloadingId(cv.id);
    const rawUrl = cv.file_url || '/Harun_Rashid_CV.pdf';
    const resolved = resolveImageUrl(rawUrl, '/Harun_Rashid_CV.pdf');
    const targetFilename = cv.filename || 'Harun_Rashid_Engineering_Resume.pdf';

    try {
      const response = await fetch(resolved);
      if (!response.ok) throw new Error('Fetch failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = targetFilename.endsWith('.pdf') ? targetFilename : `${targetFilename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      const fallbackUrl = resolved.includes('?') ? `${resolved}&download=1` : `${resolved}?download=1`;
      const link = document.createElement('a');
      link.href = fallbackUrl;
      link.download = targetFilename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setTimeout(() => setDownloadingId(null), 500);
    }
  };


  return (
    <section
      id="cv"
      className="relative py-28 md:py-36 bg-[#0c0c0c] text-white overflow-hidden border-t border-white/10 w-full max-w-full"
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-purple-900/15 via-cyan-900/15 to-transparent blur-[160px]" />
      </div>

      {/* ── Widely Spread Cosmic Stars & Glassmorphic Badges (Mobile & Desktop) ── */}

      {/* Star 1: Top-Left Floating glassmorphic badge */}
      <motion.div
        animate={{ y: [-7, 7, -7], rotate: [6, 14, 6] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-8 sm:top-14 left-3 sm:left-10 md:left-16 opacity-85 pointer-events-none z-20"
      >
        <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-purple-500/40 via-cyan-400/30 to-white/20 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" />
        </div>
      </motion.div>

      {/* Star 2: Top-Right 4-pointed rotating cyan cosmic star */}
      <motion.div
        animate={{ rotate: 360, y: [6, -6, 6] }}
        transition={{ rotate: { duration: 16, repeat: Infinity, ease: 'linear' }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
        className="absolute top-10 sm:top-16 right-3 sm:right-12 md:right-20 pointer-events-none z-20 text-cyan-400 drop-shadow-[0_0_16px_rgba(34,211,238,0.8)]"
      >
        <span className="text-3xl sm:text-4xl md:text-5xl font-black select-none">✦</span>
      </motion.div>

      {/* Star 3: Top-Center pulsing purple sparkle */}
      <motion.div
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6], y: [-4, 4, -4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 pointer-events-none z-20 text-purple-400 drop-shadow-[0_0_14px_rgba(168,85,247,0.85)]"
      >
        <span className="text-2xl sm:text-3xl font-black select-none">✧</span>
      </motion.div>

      {/* Star 4: Mid-Left rotating pink/purple cosmic star */}
      <motion.div
        animate={{ rotate: -360, y: [-5, 5, -5] }}
        transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' } }}
        className="absolute top-[48%] left-2.5 sm:left-6 md:left-12 pointer-events-none z-20 text-pink-400 drop-shadow-[0_0_14px_rgba(244,114,182,0.75)]"
      >
        <span className="text-2.5xl sm:text-3xl md:text-4xl font-black select-none">✦</span>
      </motion.div>

      {/* Star 5: Mid-Right floating glassmorphic cyan badge */}
      <motion.div
        animate={{ y: [6, -6, 6], rotate: [-8, -16, -8] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[52%] right-2.5 sm:right-6 md:right-12 opacity-85 pointer-events-none z-20"
      >
        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/40 via-purple-400/30 to-white/20 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
        </div>
      </motion.div>

      {/* Star 6: Bottom-Left glowing cyan sparkle */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.95, 0.5], rotate: [0, 45, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 sm:bottom-16 left-4 sm:left-12 md:left-20 pointer-events-none z-20 text-cyan-300 drop-shadow-[0_0_14px_rgba(34,211,238,0.7)]"
      >
        <span className="text-2xl sm:text-3xl font-black select-none">✧</span>
      </motion.div>

      {/* Star 7: Bottom-Right 4-pointed rotating purple cosmic star */}
      <motion.div
        animate={{ rotate: 360, y: [5, -5, 5] }}
        transition={{ rotate: { duration: 18, repeat: Infinity, ease: 'linear' }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
        className="absolute bottom-10 sm:bottom-18 right-4 sm:right-14 md:right-24 pointer-events-none z-20 text-purple-400 drop-shadow-[0_0_16px_rgba(168,85,247,0.75)]"
      >
        <span className="text-3xl sm:text-4xl md:text-5xl font-black select-none">✦</span>
      </motion.div>

      {/* Star 8: Bottom-Center subtle twinkle */}
      <motion.div
        animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.9, 1.15, 0.9] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-4 sm:bottom-8 left-1/3 pointer-events-none z-20 text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]"
      >
        <span className="text-xl sm:text-2xl font-black select-none">✦</span>
      </motion.div>

      <div className="w-full max-w-none px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-white/10 pb-8">
          <Reveal direction="left">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-purple-400 uppercase mb-3">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                ACADEMIC &amp; PROFESSIONAL CREDENTIALS
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white">
                CV &amp; RESUME
              </h2>
            </div>
          </Reveal>
          <Reveal direction="right" delay={0.1}>
            <p className="text-base sm:text-lg text-white/60 max-w-lg font-light leading-relaxed">
              Available for direct download and preview.
            </p>
          </Reveal>
        </div>

        {/* CV Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : cvs.length === 0 ? (
          <div className="text-center py-16 bg-[#141414] rounded-3xl border border-white/10 p-8">
            <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">CV Updating</h3>
            <p className="text-xs text-white/50 font-mono">
              The updated CV is being finalized and will be uploaded shortly. Please reach out via contact below.
            </p>
          </div>
        ) : (
          <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 xl:gap-10" staggerDelay={0.12}>
            {cvs.map((cv) => {
              const fileHref = resolveImageUrl(cv.file_url, '/Harun_Rashid_CV.pdf');
              return (
                <StaggerItem key={cv.id}>
                  <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/50 via-purple-500/20 to-cyan-500/50 shadow-[0_0_35px_rgba(168,85,247,0.22)] sm:from-white/20 sm:via-white/5 sm:to-transparent sm:shadow-xl sm:hover:from-purple-500/50 sm:hover:to-cyan-500/50 sm:hover:shadow-[0_0_35px_rgba(168,85,247,0.25)] transition-all duration-500 group">
                    <div className="rounded-[23px] bg-[#141414] p-6 sm:p-8 flex flex-col justify-between h-full border border-purple-500/20 sm:border-white/5 sm:group-hover:border-purple-500/30 transition-colors">
                      <div>
                        {/* Top Meta */}
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] sm:text-cyan-400 sm:drop-shadow-none sm:group-hover:text-cyan-300 sm:group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] transition-all">
                            <FileText className="w-3.5 h-3.5 text-purple-400" />
                            PDF DOCUMENT {cv.file_size ? `• ${cv.file_size}` : ''}
                          </span>
                          {cv.is_primary && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              PRIMARY
                            </span>
                          )}
                        </div>

                        {/* Title & Subtitle */}
                        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-purple-200 sm:text-white sm:group-hover:text-purple-200 transition-colors">
                          {cv.title}
                        </h3>
                        {cv.subtitle && (
                          <p className="text-white/60 text-xs sm:text-sm font-light leading-relaxed mb-6">
                            {cv.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleDownload(cv)}
                          disabled={downloadingId === cv.id}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,255,255,0.25)] sm:shadow-md sm:hover:scale-105 disabled:opacity-60 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {downloadingId === cv.id ? 'DOWNLOADING...' : 'DOWNLOAD PDF'}
                        </button>

                        <a
                          href={fileHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-white/30 bg-white/10 text-white sm:border-white/15 sm:bg-transparent sm:text-white/80 sm:hover:text-white sm:hover:bg-white/5 sm:hover:border-white/30 text-xs font-mono tracking-wider transition-all"
                        >
                          PREVIEW
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        {cv.filename && (
                          <span className="text-[10px] font-mono text-white/30 truncate max-w-[150px] ml-auto hidden sm:inline-block">
                            {cv.filename}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </div>

    </section>
  );
}
