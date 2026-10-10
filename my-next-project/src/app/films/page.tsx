"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { resolveImageUrl } from "@/lib/imageHelper";

interface FilmItem {
  id: string | number;
  youtubeId: string;
  title: string;
  location: string;
  category: string;
  thumbnail: string;
}

export default function Films() {
  const [weddingFilms, setWeddingFilms] = useState<FilmItem[]>([]);
  const [activeVideo, setActiveVideo] = useState<FilmItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        const data = await api.get('/portfolio/films');
        setWeddingFilms(data);
      } catch (err) {
        console.error("Failed to load films:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFilms();
  }, []);

  const mainFilm = weddingFilms.length > 0 ? weddingFilms[0] : null;
  const galleryFilms = weddingFilms.length > 0 ? weddingFilms.slice(1) : [];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#0d0d0d] text-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-[#d8c3a5] text-xs uppercase tracking-[0.3em] mb-3">Veloura Creations Cinema</p>
          <h1 className="font-serif text-4xl md:text-6xl text-[#d8c3a5] mb-6">Cinematography</h1>
          <p className="text-white/70 font-light text-base md:text-lg">Real Emotions. In Motion.</p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Main Featured Video */}
          {mainFilm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="relative aspect-video bg-[#161616] mb-16 group overflow-hidden rounded-xl border border-white/10 shadow-2xl"
            >
              {activeVideo?.id === mainFilm.id ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${mainFilm.youtubeId}?autoplay=1&rel=0`}
                  title={mainFilm.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div
                  className="w-full h-full relative cursor-pointer flex items-center justify-center"
                  onClick={() => setActiveVideo(mainFilm)}
                >
                  <img
                    src={resolveImageUrl(mainFilm.thumbnail, '/project_mockup_preview.jpg')}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    alt={mainFilm.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 group-hover:bg-black/40 transition-colors" />
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-20 h-20 rounded-full bg-[#d8c3a5]/90 hover:bg-[#d8c3a5] text-black flex items-center justify-center relative z-10 shadow-xl backdrop-blur-md transition-all"
                  >
                    <span className="ml-1 text-2xl">▶</span>
                  </motion.div>
                  <div className="absolute bottom-8 left-8 right-8 z-10">
                    <span className="bg-black/60 backdrop-blur-md text-[#d8c3a5] text-xs uppercase px-3 py-1 rounded-full border border-[#d8c3a5]/30">
                      {mainFilm.category}
                    </span>
                    <h3 className="font-serif text-2xl md:text-3xl text-white mt-3 mb-1">{mainFilm.title}</h3>
                    <p className="text-[#d8c3a5] text-xs uppercase tracking-widest">{mainFilm.location}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Section description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Wedding Films & Highlights</h2>
            <div className="w-16 h-0.5 bg-[#d8c3a5]/60 mx-auto mb-6" />
            <p className="text-white/70 font-light max-w-2xl mx-auto leading-relaxed">
              Our cinematic films are woven with real dialogue, raw vows, natural soundscapes, and the authentic heartbeat of your special day.
            </p>
          </motion.div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {galleryFilms.map((film, index) => (
              <motion.div
                key={film.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group relative aspect-video bg-[#161616] overflow-hidden rounded-lg border border-white/10 shadow-lg"
              >
                {activeVideo?.id === film.id ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${film.youtubeId}?autoplay=1&rel=0`}
                    title={film.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div
                    className="w-full h-full relative cursor-pointer flex items-center justify-center"
                    onClick={() => setActiveVideo(film)}
                  >
                    <img
                      src={resolveImageUrl(film.thumbnail, '/project_mockup_preview.jpg')}
                      alt={film.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="w-14 h-14 rounded-full border border-white/60 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white group-hover:border-[#d8c3a5] group-hover:bg-[#d8c3a5] group-hover:text-black transition-all">
                      <span className="ml-1 text-lg">▶</span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <h4 className="font-serif text-lg text-white font-medium">{film.title}</h4>
                      <p className="text-[#d8c3a5] text-xs tracking-wider uppercase mt-0.5">{film.location}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
