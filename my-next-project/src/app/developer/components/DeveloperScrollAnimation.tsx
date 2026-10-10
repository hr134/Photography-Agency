'use client';

import { useEffect, useRef, useState } from 'react';

const TOTAL_FRAMES = 300;

// Format frame URL: /frames/ezgif-frame-001.jpg -> /frames/ezgif-frame-300.jpg
function getFrameUrl(index: number): string {
  const frameNum = String(index + 1).padStart(3, '0');
  return `/frames/ezgif-frame-${frameNum}.jpg`;
}

export default function DeveloperScrollAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const welcomeRef = useRef<HTMLDivElement>(null);
  const letsBeginRef = useRef<HTMLDivElement>(null);

  // Reactive scroll height for mobile vs desktop
  const [scrollHeight, setScrollHeight] = useState('380vh');

  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const currentFrameRef = useRef<number>(0);
  const targetProgressRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(false);
  // DPR stored in ref — re-applied before every canvas draw
  const dprRef = useRef<number>(1);
  // FIX: Cache scrollY in onScroll, read in animateLoop — avoids forced layout in RAF
  const scrollYRef = useRef<number>(0);
  const scrollDistanceRef = useRef<number>(0);
  // FIX: Track hidden state to avoid repeated style.display reads in hot path
  const stickyHiddenRef = useRef<boolean>(false);
  // Cache isMobile in a ref — avoids reading window.innerWidth every RAF frame
  const isMobileRef = useRef<boolean>(false);

  // Store last drawn image as fallback so frame scrubs never drop to blank or freeze
  const lastDrawnImgRef = useRef<HTMLImageElement | null>(null);

  // Responsive canvas draw helper with object-fit: cover
  const drawImageCover = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    cssWidth: number,
    cssHeight: number
  ) => {
    const dpr = dprRef.current;
    // Re-apply DPR transform — canvas.width assignment resets the context transform
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    // Mobile GPUs perform best with medium/bilinear smoothing (zero frame drops)
    ctx.imageSmoothingQuality = isMobileRef.current ? 'medium' : 'high';

    const imgWidth = img.naturalWidth || 1920;
    const imgHeight = img.naturalHeight || 1080;

    // Perfect cover calculation in CSS pixel space
    const scale = Math.max(cssWidth / imgWidth, cssHeight / imgHeight);
    const nw = imgWidth * scale;
    const nh = imgHeight * scale;
    const cx = (cssWidth - nw) * 0.5;
    const cy = (cssHeight - nh) * 0.5;

    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.drawImage(img, cx, cy, nw, nh);
  };

  // O(1) bounded frame fallback
  const getBestAvailableImage = (targetIndex: number): HTMLImageElement | null => {
    const images = imagesRef.current;
    if (images[targetIndex]?.complete && images[targetIndex]?.naturalWidth) {
      return images[targetIndex];
    }
    // Search backward (already-loaded frames)
    for (let offset = 1; offset <= 30; offset++) {
      const prev = targetIndex - offset;
      if (prev >= 0 && images[prev]?.complete && images[prev]?.naturalWidth) return images[prev];
    }
    // Then forward
    for (let offset = 1; offset <= 30; offset++) {
      const next = targetIndex + offset;
      if (next < TOTAL_FRAMES && images[next]?.complete && images[next]?.naturalWidth) return images[next];
    }
    return lastDrawnImgRef.current;
  };

  const renderFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let img = getBestAvailableImage(frameIndex);
    if (!img && lastDrawnImgRef.current) {
      img = lastDrawnImgRef.current;
    }

    if (img) {
      lastDrawnImgRef.current = img;
      const cssW = parseInt(canvas.style.width) || window.innerWidth;
      const cssH = parseInt(canvas.style.height) || window.innerHeight;
      drawImageCover(ctx, img, cssW, cssH);
    }
  };

  // Update canvas resolution matching viewport
  const updateCanvasSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isMobile = window.innerWidth < 768;
    isMobileRef.current = isMobile;

    // Cap DPR at 2 on mobile to prevent creating massive multi-megapixel framebuffers that lag mobile GPUs
    const rawDpr = window.devicePixelRatio || 1;
    const dpr = isMobile ? Math.min(rawDpr, 2) : rawDpr;
    dprRef.current = dpr;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Setting canvas.width resets context transform
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    renderFrame(currentFrameRef.current);
  };

  // Restore previous setup: full 380vh scroll track on BOTH mobile and desktop
  // so all 300 frames finish smoothly before the website contents appear.
  const updateBreakpoint = () => {
    const mobile = window.innerWidth < 768;
    isMobileRef.current = mobile;
    setScrollHeight('380vh');
  };

  useEffect(() => {
    // 0. Set breakpoint + scroll height
    updateBreakpoint();

    // 1. Initial canvas size
    updateCanvasSize();

    const handleResize = () => {
      updateBreakpoint();
      updateCanvasSize();
      // Recalculate after layout settles on resize/orientation change
      if (containerRef.current) {
        scrollDistanceRef.current = containerRef.current.offsetHeight - window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    // 2. Preload first frame immediately for instant first-paint
    const firstImg = new Image();
    firstImg.src = getFrameUrl(0);
    firstImg.onload = () => {
      imagesRef.current[0] = firstImg;
      lastDrawnImgRef.current = firstImg;
      renderFrame(0);
    };

    // 3. Progressive preloading of all frames in background
    let isCancelled = false;

    const loadBatch = (indices: number[]) => {
      indices.forEach((index) => {
        if (imagesRef.current[index]) return;
        const img = new Image();
        img.src = getFrameUrl(index);
        img.onload = () => {
          if (!isCancelled) {
            imagesRef.current[index] = img;
            if (currentFrameRef.current === index) {
              renderFrame(index);
            }
          }
        };
      });
    };

    // Priority 1: first 40 frames for immediate responsiveness
    loadBatch(Array.from({ length: 40 }, (_, i) => i));

    // Priority 2: stream remaining frames in steady chunks of 30
    // so mobile network and image decoder never stall or freeze the UI
    let currentBatchIndex = 40;
    const loadNextBatch = () => {
      if (isCancelled || currentBatchIndex >= TOTAL_FRAMES) return;
      const nextBatch = [];
      const end = Math.min(TOTAL_FRAMES, currentBatchIndex + 30);
      for (let i = currentBatchIndex; i < end; i++) {
        nextBatch.push(i);
      }
      currentBatchIndex = end;
      loadBatch(nextBatch);
      if (currentBatchIndex < TOTAL_FRAMES) {
        setTimeout(loadNextBatch, 80);
      }
    };
    const timer = setTimeout(loadNextBatch, 120);

    // 4. Smooth scroll calculation loop with cached metrics & zero overhead when past
    const updateMetrics = () => {
      if (containerRef.current) {
        // FIX: Store into ref so animateLoop reads from ref, not window.scrollY
        scrollDistanceRef.current = containerRef.current.offsetHeight - window.innerHeight;
      }
    };
    updateMetrics();

    const onScroll = () => {
      const scrollY = window.scrollY;
      // FIX: Cache into ref — animateLoop reads scrollYRef.current instead of
      // calling window.scrollY itself, which causes forced layout on mobile.
      scrollYRef.current = scrollY;
      const scrollDistance =
        scrollDistanceRef.current > 0 ? scrollDistanceRef.current : window.innerHeight * 2.8;

      if (scrollDistance <= 0) return;

      const progress = Math.max(0, Math.min(1, scrollY / scrollDistance));

      const mobile = isMobileRef.current;
      const hideThreshold = mobile ? scrollDistance + 290 : scrollDistance;

      // If user has scrolled completely past the animation into the website contents,
      // completely hide the canvas layer so it never lags or sits underneath website contents.
      // On mobile, keep it visible until initial hero content ('AVAILABLE FOR PROJECTS' and headline)
      // has arisen on the screen so 'Let's Begin' transitions smoothly.
      if (scrollY >= hideThreshold && currentProgressRef.current >= 0.999) {
        // FIX: Guard write with stickyHiddenRef — avoids repeated display reads/writes
        if (stickyRef.current && !stickyHiddenRef.current) {
          stickyRef.current.style.display = 'none';
          stickyHiddenRef.current = true;
        }
        if (letsBeginRef.current && letsBeginRef.current.style.display !== 'none') {
          letsBeginRef.current.style.opacity = '0';
          letsBeginRef.current.style.display = 'none';
        }
        return;
      }

      // Restore display if user scrolls back up toward the animation
      if (stickyRef.current && stickyHiddenRef.current) {
        stickyRef.current.style.display = 'block';
        stickyHiddenRef.current = false;
      }

      targetProgressRef.current = progress;

      // Trigger animation loop if idle
      if (!isRunningRef.current) {
        isRunningRef.current = true;
        animFrameIdRef.current = requestAnimationFrame(animateLoop);
      }
    };

    const animateLoop = () => {
      const target = targetProgressRef.current;
      const current = currentProgressRef.current;
      const mobile = isMobileRef.current;

      // Lerp interpolation for buttery smooth inertial motion (snappy touch tracking on mobile)
      const diff = target - current;
      currentProgressRef.current += diff * (mobile ? 0.16 : 0.12);

      // Once close enough, snap to target
      if (Math.abs(diff) < 0.0004) {
        currentProgressRef.current = target;
      }

      const progress = currentProgressRef.current;

      // Map progress to frame index (0 to TOTAL_FRAMES - 1)
      const targetFrame = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.floor(progress * (TOTAL_FRAMES - 1)))
      );

      if (targetFrame !== currentFrameRef.current) {
        currentFrameRef.current = targetFrame;
        renderFrame(targetFrame);
      }

      // ── Welcome word: disappears fast / immediately as user starts scrolling ──
      if (welcomeRef.current) {
        // Fast fade: gone within first 3% of scroll progress (was 7%)
        const wFade = Math.max(0, 1 - progress * 35);
        const wY = -progress * 500;
        welcomeRef.current.style.opacity = wFade.toFixed(4);
        welcomeRef.current.style.transform = `translateY(${wY.toFixed(1)}px)`;
        welcomeRef.current.style.display = wFade <= 0.001 ? 'none' : 'flex';
      }

      // ── Mobile Transition Overlay: Welcoming attractive 'Let's Begin' ─────────
      if (mobile) {
        // FIX: Read from ref — no forced layout inside RAF
        const scrollY = scrollYRef.current;
        const scrollDistance =
          scrollDistanceRef.current > 0 ? scrollDistanceRef.current : window.innerHeight * 2.8;
        const extraScroll = Math.max(0, scrollY - scrollDistance);

        // 1. Canvas fade to black between 0.88 and 0.94
        if (canvasRef.current) {
          if (progress >= 0.88) {
            const cFade = Math.max(0, 1 - (progress - 0.88) / 0.06);
            canvasRef.current.style.opacity = cFade.toFixed(4);
          } else {
            canvasRef.current.style.opacity = '1';
          }
        }

        // 2. 'Let's Begin' welcoming text
        // - Appears smoothly around progress 0.86 - 0.92 as frames darken
        // - Stays prominently visible through the end of the scroll track (progress 1.0)
        // - Stays visible as portfolio contents start arising from the bottom (extraScroll 0 -> ~130px)
        // - Fades out & is gone once "AVAILABLE FOR PROJECTS" and headline arise on screen (~130px - 260px)
        if (letsBeginRef.current) {
          if (extraScroll >= 260) {
            // Completely gone after hero contents have arisen
            letsBeginRef.current.style.opacity = '0';
            letsBeginRef.current.style.display = 'none';
          } else if (extraScroll > 130) {
            // Smooth exit as 'AVAILABLE FOR PROJECTS' and headline ('HI, I'M') arise on screen
            const exitFade = Math.max(0, 1 - (extraScroll - 130) / 130);
            letsBeginRef.current.style.opacity = exitFade.toFixed(4);
            letsBeginRef.current.style.display = 'flex';
          } else if (progress >= 0.92) {
            // Solidly visible during outro and as top hero content begins arising
            letsBeginRef.current.style.opacity = '1';
            letsBeginRef.current.style.transform = 'translateY(0px)';
            letsBeginRef.current.style.display = 'flex';
          } else if (progress >= 0.86) {
            // Smooth entrance in center of screen
            const lbProgress = Math.min(1, Math.max(0, (progress - 0.86) / 0.06));
            const lbY = (1 - lbProgress) * 16;
            letsBeginRef.current.style.opacity = lbProgress.toFixed(4);
            letsBeginRef.current.style.transform = `translateY(${lbY.toFixed(1)}px)`;
            letsBeginRef.current.style.display = 'flex';
          } else {
            letsBeginRef.current.style.opacity = '0';
            letsBeginRef.current.style.display = 'none';
          }
        }

        if (stickyRef.current) {
          stickyRef.current.style.opacity = '1';
          stickyRef.current.style.transform = 'scale(1)';
          stickyRef.current.style.filter = 'none';
          // FIX: Guard display writes with stickyHiddenRef
          if (extraScroll >= 280 && !stickyHiddenRef.current) {
            stickyRef.current.style.display = 'none';
            stickyHiddenRef.current = true;
          } else if (extraScroll < 280 && stickyHiddenRef.current) {
            stickyRef.current.style.display = 'block';
            stickyHiddenRef.current = false;
          }
        }
      } else {
        // Desktop handling
        if (canvasRef.current) {
          canvasRef.current.style.opacity = '1';
        }
        if (letsBeginRef.current) {
          letsBeginRef.current.style.display = 'none';
        }

        if (stickyRef.current) {
          const FADE_START = 0.94;
          if (progress >= FADE_START) {
            const fp = (progress - FADE_START) / (1 - FADE_START);
            const opacity = Math.max(0, 1 - fp);
            const scale = 1 + fp * 0.04;
            const blur = fp * 8;
            stickyRef.current.style.opacity = opacity.toFixed(4);
            stickyRef.current.style.transform = `scale(${scale.toFixed(4)})`;
            stickyRef.current.style.filter = blur > 0.1 ? `blur(${blur.toFixed(1)}px)` : 'none';
            if (progress >= 0.999 && !stickyHiddenRef.current) {
              stickyRef.current.style.display = 'none';
              stickyHiddenRef.current = true;
            } else if (progress < 0.999 && stickyHiddenRef.current) {
              stickyRef.current.style.display = 'block';
              stickyHiddenRef.current = false;
            }
          } else {
            stickyRef.current.style.opacity = '1';
            stickyRef.current.style.transform = 'scale(1)';
            stickyRef.current.style.filter = 'none';
            if (stickyHiddenRef.current) {
              stickyRef.current.style.display = 'block';
              stickyHiddenRef.current = false;
            }
          }
        }
      }

      // ── Signal nav: write done state only when changed ────────────────────
      if (containerRef.current) {
        const isDone = progress >= 0.98 ? 'true' : 'false';
        if (containerRef.current.dataset.done !== isDone) {
          containerRef.current.dataset.done = isDone;
        }
      }

      // FIX: Removed needsMobileContinuation.
      // The previous code kept the RAF loop alive for 300px of extra scroll
      // past the animation end — running canvas draws & DOM writes at 60fps
      // right as the hero section mounted. This was the primary cause of the
      // mobile freeze. onScroll fires on native scroll events and handles
      // the extraScroll range without needing a self-perpetuating RAF loop.
      if (Math.abs(target - currentProgressRef.current) > 0.0004) {
        animFrameIdRef.current = requestAnimationFrame(animateLoop);
      } else {
        isRunningRef.current = false;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial call to set up starting position
    onScroll();

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', onScroll);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  return (
    /*
     * z-index intentionally left at 0 on this scroll section.
     * The <main z-10> content sits above, so once this section scrolls
     * past the viewport the sticky canvas never bleeds over main content
     * — fixing the mobile "content inside scroll" bug.
     */
    <section
      ref={containerRef}
      id="scroll-animation"
      style={{ height: scrollHeight }}
      className="relative w-full bg-[#0a0a0a]"
      aria-hidden="true"
    >
      {/* Sticky canvas — z-0, main content z-10 always wins */}
      <div
        ref={stickyRef}
        className="sticky top-0 left-0 w-full overflow-hidden bg-[#0a0a0a] will-change-[opacity,transform,filter]"
        style={{ height: '100dvh' }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block"
          style={{ imageRendering: 'auto' }}
        />

        {/* ── Welcome overlay ── */}
        <div
          ref={welcomeRef}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-10"
          style={{ willChange: 'opacity, transform' }}
        >
          {/* Glowing label */}
          <p className="text-[10px] sm:text-xs font-mono tracking-[0.4em] text-cyan-400/80 uppercase mb-5 animate-pulse">
            PORTFOLIO
          </p>

          {/* Giant gradient welcome word */}
          <h2
            className="font-black uppercase leading-none text-center"
            style={{
              fontSize: 'clamp(3.2rem, 13vw, 9rem)',
              background: 'linear-gradient(135deg, #fff 0%, #c4b5fd 40%, #67e8f9 75%, #fff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.03em',
              filter: 'drop-shadow(0 0 50px rgba(168,85,247,0.45))',
            }}
          >
            WELCOME
          </h2>

          {/* Scroll hint */}
          <div className="mt-10 flex flex-col items-center gap-2 opacity-50">
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/60 to-transparent animate-pulse" />
            <p className="text-[9px] sm:text-[10px] font-mono tracking-[0.35em] text-white/50 uppercase">
              Scroll to explore
            </p>
          </div>
        </div>

        {/* ── Mobile Outro Transition Overlay: Welcoming Attractive 'Let's Begin' ── */}
        <div
          ref={letsBeginRef}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-20 md:hidden px-6"
          style={{ opacity: 0, display: 'none', willChange: 'opacity, transform' }}
        >
          {/* Ambient luminous glow backdrop */}
          <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-purple-600/20 via-pink-500/15 to-cyan-500/20 blur-3xl -z-10 pointer-events-none" />

          {/* Attractive Welcoming Typography: Editorial Serif Italic + Bold Modern Sans */}
          <h2 className="text-center select-none tracking-tight">
            <span
              className="block font-serif italic font-normal text-white leading-[0.92]"
              style={{
                fontSize: 'clamp(3.8rem, 17vw, 5.4rem)',
                textShadow: '0 2px 25px rgba(255,255,255,0.45), 0 0 50px rgba(168,85,247,0.3)',
              }}
            >
              Let&apos;s
            </span>
            <span
              className="block font-sans font-black tracking-[-0.03em] uppercase text-white leading-[0.88] mt-1"
              style={{
                fontSize: 'clamp(4.2rem, 19vw, 5.8rem)',
                textShadow: '0 2px 30px rgba(255,255,255,0.4), 0 0 60px rgba(103,232,249,0.3)',
              }}
            >
              Begin
            </span>
          </h2>

          {/* Subtle scroll hint */}
          <div className="mt-5 flex flex-col items-center gap-1.5 opacity-60">
            <div className="w-px h-6 bg-gradient-to-b from-cyan-400 to-transparent animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
