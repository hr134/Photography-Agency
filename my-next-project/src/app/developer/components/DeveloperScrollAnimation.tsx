'use client';

import { useEffect, useRef, useState } from 'react';

const TOTAL_FRAMES = 300;
const VIDEO_SRC_MP4 = '/scroll.mp4';
const VIDEO_SRC_WEBM = '/scroll.webm';

// Helper to format frame URLs for mobile 300-image sequence
function getFrameUrl(index: number): string {
  const frameNum = String(index + 1).padStart(3, '0');
  return `/frames/ezgif-frame-${frameNum}.jpg`;
}

export default function DeveloperScrollAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const welcomeRef = useRef<HTMLDivElement>(null);

  // Video ref for desktop view
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoInitializedRef = useRef<boolean>(false);
  const lastSeekTimeRef = useRef<number>(-1);

  // Image frames ref for mobile view
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const currentFrameRef = useRef<number>(0);
  const lastDrawnImgRef = useRef<HTMLImageElement | null>(null);
  const imagesLoadedRef = useRef<boolean>(false);

  // Animation & scroll states
  const [scrollHeight] = useState('380vh');
  const targetProgressRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(false);
  const dprRef = useRef<number>(1);
  const scrollYRef = useRef<number>(0);
  const scrollDistanceRef = useRef<number>(0);
  const stickyHiddenRef = useRef<boolean>(false);
  const isMobileRef = useRef<boolean>(false);

  // ── Desktop video drawing helper ──────────────────────────────────────────
  const drawVideoFrame = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || video.readyState < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = dprRef.current;
    const cssW = parseInt(canvas.style.width) || window.innerWidth;
    const cssH = parseInt(canvas.style.height) || window.innerHeight;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const vW = video.videoWidth || 1920;
    const vH = video.videoHeight || 1080;
    const scale = Math.max(cssW / vW, cssH / vH);
    const nw = vW * scale;
    const nh = vH * scale;
    const cx = (cssW - nw) * 0.5;
    const cy = (cssH - nh) * 0.5;
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.drawImage(video, cx, cy, nw, nh);
  };

  const seekVideo = (time: number) => {
    const video = videoRef.current;
    if (!video || video.readyState < 1) return;
    if (Math.abs(time - lastSeekTimeRef.current) < 0.016) return;
    lastSeekTimeRef.current = time;
    if (typeof (video as any).fastSeek === 'function') {
      (video as any).fastSeek(time);
    } else {
      video.currentTime = time;
    }
  };

  // ── Mobile image drawing helper (object-fit: cover) ────────────────────────
  const drawImageCover = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    cssWidth: number,
    cssHeight: number
  ) => {
    const dpr = dprRef.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';

    const imgWidth = img.naturalWidth || 1920;
    const imgHeight = img.naturalHeight || 1080;

    const scale = Math.max(cssWidth / imgWidth, cssHeight / imgHeight);
    const nw = imgWidth * scale;
    const nh = imgHeight * scale;
    const cx = (cssWidth - nw) * 0.5;
    const cy = (cssHeight - nh) * 0.5;

    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.drawImage(img, cx, cy, nw, nh);
  };

  const getBestAvailableImage = (targetIndex: number): HTMLImageElement | null => {
    const images = imagesRef.current;
    if (images[targetIndex]?.complete && images[targetIndex]?.naturalWidth) {
      return images[targetIndex];
    }
    // Search backward
    for (let offset = 1; offset <= 30; offset++) {
      const prev = targetIndex - offset;
      if (prev >= 0 && images[prev]?.complete && images[prev]?.naturalWidth) return images[prev];
    }
    // Search forward
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

  // ── Canvas resize ──────────────────────────────────────────────────────────
  const updateCanvasSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const isMobile = window.innerWidth < 768;
    isMobileRef.current = isMobile;
    const rawDpr = window.devicePixelRatio || 1;
    const dpr = isMobile ? Math.min(rawDpr, 2) : rawDpr;
    dprRef.current = dpr;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    if (isMobile) {
      renderFrame(currentFrameRef.current);
    } else {
      drawVideoFrame();
    }
  };

  useEffect(() => {
    let isCancelled = false;
    let batchTimer: NodeJS.Timeout | null = null;

    isMobileRef.current = window.innerWidth < 768;
    updateCanvasSize();

    // ── Function to initialize mobile 300-image preloading ───────────────────
    const initMobileImages = () => {
      if (imagesLoadedRef.current) return;
      imagesLoadedRef.current = true;

      const firstImg = new Image();
      firstImg.src = getFrameUrl(0);
      firstImg.onload = () => {
        if (isCancelled) return;
        imagesRef.current[0] = firstImg;
        lastDrawnImgRef.current = firstImg;
        if (isMobileRef.current) renderFrame(0);
      };

      const loadBatch = (indices: number[]) => {
        indices.forEach((index) => {
          if (imagesRef.current[index]) return;
          const img = new Image();
          img.src = getFrameUrl(index);
          img.onload = () => {
            if (!isCancelled) {
              imagesRef.current[index] = img;
              if (isMobileRef.current && currentFrameRef.current === index) {
                renderFrame(index);
              }
            }
          };
        });
      };

      // Priority 1: first 40 frames for instant touch responsiveness
      loadBatch(Array.from({ length: 40 }, (_, i) => i));

      // Priority 2: stream remaining frames in chunks of 30
      let currentBatchIndex = 40;
      const loadNextBatch = () => {
        if (isCancelled || currentBatchIndex >= TOTAL_FRAMES) return;
        const nextBatch = [];
        const end = Math.min(TOTAL_FRAMES, currentBatchIndex + 30);
        for (let i = currentBatchIndex; i < end; i++) nextBatch.push(i);
        currentBatchIndex = end;
        loadBatch(nextBatch);
        if (currentBatchIndex < TOTAL_FRAMES) {
          batchTimer = setTimeout(loadNextBatch, 80);
        }
      };
      batchTimer = setTimeout(loadNextBatch, 120);
    };

    // ── Function to initialize desktop video scrubbing ──────────────────────
    const initDesktopVideo = () => {
      if (videoInitializedRef.current) return;
      videoInitializedRef.current = true;

      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.loop = false;
      video.setAttribute('webkit-playsinline', 'true');
      video.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;';

      const srcWebm = document.createElement('source');
      srcWebm.src = VIDEO_SRC_WEBM;
      srcWebm.type = 'video/webm';
      const srcMp4 = document.createElement('source');
      srcMp4.src = VIDEO_SRC_MP4;
      srcMp4.type = 'video/mp4';
      video.appendChild(srcWebm);
      video.appendChild(srcMp4);

      document.body.appendChild(video);
      videoRef.current = video;

      const onLoadedMetadata = () => {
        if (!isMobileRef.current) seekVideo(0);
      };
      const onSeeked = () => {
        if (!isMobileRef.current) drawVideoFrame();
      };
      video.addEventListener('loadedmetadata', onLoadedMetadata);
      video.addEventListener('seeked', onSeeked);
      video.load();
    };

    // Initial setup according to current viewport
    if (isMobileRef.current) {
      initMobileImages();
    } else {
      initDesktopVideo();
    }

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      isMobileRef.current = mobile;
      if (mobile) {
        initMobileImages();
      } else {
        initDesktopVideo();
      }
      updateCanvasSize();
      if (containerRef.current) {
        scrollDistanceRef.current = containerRef.current.offsetHeight - window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    if (containerRef.current) {
      scrollDistanceRef.current = containerRef.current.offsetHeight - window.innerHeight;
    }

    const onScroll = () => {
      const scrollY = window.scrollY;
      scrollYRef.current = scrollY;
      const scrollDistance =
        scrollDistanceRef.current > 0 ? scrollDistanceRef.current : window.innerHeight * 2.8;
      if (scrollDistance <= 0) return;

      const progress = Math.max(0, Math.min(1, scrollY / scrollDistance));
      const hideThreshold = scrollDistance + 10;

      if (scrollY >= hideThreshold && currentProgressRef.current >= 0.999) {
        if (stickyRef.current && !stickyHiddenRef.current) {
          stickyRef.current.style.display = 'none';
          stickyHiddenRef.current = true;
        }
        return;
      }
      if (stickyRef.current && stickyHiddenRef.current) {
        stickyRef.current.style.display = 'block';
        stickyHiddenRef.current = false;
      }
      targetProgressRef.current = progress;
      if (!isRunningRef.current) {
        isRunningRef.current = true;
        animFrameIdRef.current = requestAnimationFrame(animateLoop);
      }
    };

    const animateLoop = () => {
      const target = targetProgressRef.current;
      const current = currentProgressRef.current;
      const mobile = isMobileRef.current;

      const diff = target - current;
      currentProgressRef.current += diff * (mobile ? 0.16 : 0.12);
      if (Math.abs(diff) < 0.0004) currentProgressRef.current = target;

      const progress = currentProgressRef.current;

      if (mobile) {
        // Mobile view: 300 pictures scroll exactly as before
        const targetFrame = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(0, Math.floor(progress * (TOTAL_FRAMES - 1)))
        );
        if (targetFrame !== currentFrameRef.current) {
          currentFrameRef.current = targetFrame;
          renderFrame(targetFrame);
        }
      } else {
        // Desktop & other views: scrub video
        const vid = videoRef.current;
        if (vid && vid.readyState >= 2 && vid.duration > 0) {
          seekVideo(progress * vid.duration);
          drawVideoFrame();
        }
      }

      if (welcomeRef.current) {
        const wFade = Math.max(0, 1 - progress * 35);
        welcomeRef.current.style.opacity = wFade.toFixed(4);
        welcomeRef.current.style.transform = `translateY(${(-progress * 500).toFixed(1)}px)`;
        welcomeRef.current.style.display = wFade <= 0.001 ? 'none' : 'flex';
      }

      if (stickyRef.current) {
        const FADE_START = 0.94;
        if (progress >= FADE_START) {
          const fp = (progress - FADE_START) / (1 - FADE_START);
          const opacity = Math.max(0, 1 - fp);
          const scale = 1 + fp * 0.04;
          const blur = mobile ? 0 : fp * 8;
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

      if (containerRef.current) {
        const isDone = progress >= 0.98 ? 'true' : 'false';
        if (containerRef.current.dataset.done !== isDone) {
          containerRef.current.dataset.done = isDone;
        }
      }

      if (Math.abs(target - currentProgressRef.current) > 0.0004) {
        animFrameIdRef.current = requestAnimationFrame(animateLoop);
      } else {
        isRunningRef.current = false;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      isCancelled = true;
      if (batchTimer) clearTimeout(batchTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', onScroll);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (videoRef.current) {
        const v = videoRef.current;
        v.pause();
        if (document.body.contains(v)) document.body.removeChild(v);
        videoRef.current = null;
      }
    };
  }, []);

  return (
    <section
      ref={containerRef}
      id="scroll-animation"
      style={{ height: scrollHeight }}
      className="relative w-full bg-[#0a0a0a]"
      aria-hidden="true"
    >
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
        <div
          ref={welcomeRef}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-10"
          style={{ willChange: 'opacity, transform' }}
        >
          <p className="text-[10px] sm:text-xs font-mono tracking-[0.4em] text-cyan-400/80 uppercase mb-5 animate-pulse">
            PORTFOLIO
          </p>
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
          <div className="mt-10 flex flex-col items-center gap-2 opacity-50">
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/60 to-transparent animate-pulse" />
            <p className="text-[9px] sm:text-[10px] font-mono tracking-[0.35em] text-white/50 uppercase">
              Scroll to explore
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
