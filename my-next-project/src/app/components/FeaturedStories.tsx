"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface StoryItem {
  id: number;
  couple: string;
  category: string;
  location: string;
  year: string;
  image: string;
  external_link?: string;
}

export default function FeaturedStories() {
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await api.get('/portfolio/stories');
        // Use the last 3 added items (reverse order to show newest first)
        const latestStories = Array.isArray(data) ? data.slice(-3).reverse() : [];
        setStories(latestStories);
      } catch (err) {
        console.error("Failed to load stories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  if (loading) {
    return <div className="text-white/50 text-sm text-center py-10">Loading stories...</div>;
  }

  if (stories.length === 0) {
    return <div className="text-white/50 text-sm text-center py-10">No stories available.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {stories.map((story) => {
        const imageUrl = story.image && story.image.startsWith('/') 
          ? `http://localhost:5000${story.image}` 
          : (story.image || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop');

        const cardContent = (
          <>
            <div className="overflow-hidden mb-4 relative aspect-[4/3] bg-neutral-900 border border-white/5">
              <img 
                src={imageUrl} 
                alt={story.couple} 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" 
              />
            </div>
            <h3 className="font-serif text-xl text-white mb-1">{story.couple}</h3>
            <p className="text-[#d8c3a5] text-xs uppercase tracking-wider mb-3">
              {story.location} • {story.category} • {story.year}
            </p>
            <span className="text-[10px] uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
              View Story &rarr;
            </span>
          </>
        );

        if (story.external_link) {
          return (
            <a 
              key={story.id} 
              href={story.external_link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group cursor-pointer block"
            >
              {cardContent}
            </a>
          );
        }

        return (
          <div key={story.id} className="group cursor-pointer">
            {cardContent}
          </div>
        );
      })}
    </div>
  );
}
