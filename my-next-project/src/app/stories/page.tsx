"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection from "@/app/components/AnimatedSection";
import { ChevronDown, SlidersHorizontal, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { resolveImageUrl } from "@/lib/imageHelper";

interface StoryItem {
  id: number;
  couple: string;
  category: string;
  location: string;
  year: string;
  image: string;
  external_link?: string;
}

const filters = ["All Stories", "Weddings", "Pre-Wedding", "Engagement"] as const;

export default function Stories() {
  const [storiesData, setStoriesData] = useState<StoryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("All Stories");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await api.get('/portfolio/stories');
        setStoriesData(data);
      } catch (err) {
        console.error("Failed to load stories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  const filteredStories =
    activeFilter === "All Stories"
      ? storiesData
      : storiesData.filter((item) => item.category === activeFilter);


  const renderStoryCard = (story: StoryItem) => {
    const cardContent = (
      <>
        <div className="overflow-hidden rounded-lg mb-4 relative aspect-[4/3] bg-neutral-900 border border-white/5">
          <img
            src={resolveImageUrl(story.image, '/project_mockup_preview.jpg')}
            alt={story.couple}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-105"
            loading="lazy"
          />
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] uppercase tracking-wider text-primary border border-white/10">
            {story.category}
          </div>
        </div>
        <h3 className="font-serif text-xl md:text-2xl text-white group-hover:text-primary transition-colors mb-1 font-normal">
          {story.couple}
        </h3>
        <p className="text-foreground/50 text-xs uppercase tracking-widest">
          {story.location} • {story.year}
        </p>
      </>
    );

    const commonProps = {
      className: "group cursor-pointer flex flex-col",
    };

    if (story.external_link) {
      return (
        <motion.a
          href={story.external_link}
          target="_blank"
          rel="noopener noreferrer"
          layout
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          {...commonProps}
        >
          {cardContent}
        </motion.a>
      );
    }

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        {...commonProps}
      >
        {cardContent}
      </motion.div>
    );
  };

  return (
    <AnimatedSection>
      <div className="pt-24 pb-24 min-h-screen">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] uppercase tracking-[0.3em] text-primary/80 block mb-3 font-medium">
              Portfolio & Archives
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-primary mb-5 font-normal tracking-wide">
              Our Wedding Stories
            </h1>
            <p className="text-foreground/70 font-light text-sm md:text-base leading-relaxed">
              Real couples. Genuine moments. Timeless memories etched in poetic stillness.
            </p>
          </div>

          {/* Desktop Filter Bar */}
          <div className="hidden md:flex justify-center items-center gap-2 mb-14">
            <div className="inline-flex p-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md">
              {filters.map((f) => {
                const isActive = activeFilter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`relative px-6 py-2.5 rounded-full text-[11px] uppercase tracking-[0.2em] transition-colors duration-300 font-medium ${
                      isActive ? "text-[#0f0f0f]" : "text-foreground/60 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeFilterPill"
                        className="absolute inset-0 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{f}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Filter Toggle & Dropdown */}
          <div className="md:hidden mb-10">
            <div className="flex justify-center">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/15 text-foreground text-xs uppercase tracking-widest hover:border-primary/50 transition-colors"
                aria-expanded={menuOpen}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                <span>Filter: <strong className="text-primary font-normal">{activeFilter}</strong></span>
                <motion.span
                  animate={{ rotate: menuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-white/60" />
                </motion.span>
              </button>
            </div>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="mt-3 mx-auto max-w-xs rounded-2xl bg-[#161616]/95 backdrop-blur-xl border border-white/10 p-2 shadow-2xl z-20 flex flex-col gap-1"
                >
                  {filters.map((f) => {
                    const isActive = activeFilter === f;
                    return (
                      <button
                        key={f}
                        onClick={() => {
                          setActiveFilter(f);
                          setMenuOpen(false);
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs uppercase tracking-widest text-left transition-all ${
                          isActive
                            ? "bg-primary text-[#0f0f0f] font-semibold"
                            : "text-foreground/70 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {f}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stories Animated Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
          >
            <AnimatePresence mode="popLayout">
              {filteredStories.map((story) => (
                <div key={story.id}>
                  {renderStoryCard(story)}
                </div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </AnimatedSection>
  );
}
