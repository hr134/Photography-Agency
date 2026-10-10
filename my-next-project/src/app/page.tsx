import Image from "next/image";
import Link from "next/link";
import { Camera, Heart, Users, Sparkles, BookOpen } from "lucide-react";
import FeaturedStories from "@/app/components/FeaturedStories";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[90vh] w-full flex items-center justify-start overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop" 
          alt="Wedding Couple"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="relative z-20 container mx-auto px-6">
          <div className="max-w-2xl">
            <h2 className="text-[#d8c3a5] uppercase tracking-widest text-xs mb-4">Wedding Photography & Films</h2>
            <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 leading-tight">
              Stories of love, <br /> captured beautifully.
            </h1>
            <p className="text-white/80 text-lg mb-10 max-w-md font-light">
              We&apos;re not just photographers. We&apos;re storytellers, capturing the real moments, emotions and details that make your day unforgettable.
            </p>
            <Link href="/stories" className="inline-flex items-center gap-4 text-xs tracking-widest uppercase text-white hover:text-[#d8c3a5] transition-colors border border-white/20 hover:border-[#d8c3a5] px-8 py-4 rounded-full">
              View Our Stories &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 2. FEATURED STORIES */}
      <section className="py-24 bg-[#0f0f0f]">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h3 className="text-[#d8c3a5] uppercase tracking-widest text-[10px] mb-2">Featured Stories</h3>
              <h2 className="font-serif text-4xl text-white">Real People.<br />Beautiful Stories.</h2>
            </div>
            <Link href="/stories" className="text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors">View All Stories &rarr;</Link>
          </div>

          <FeaturedStories />
        </div>
      </section>

      {/* 3. WHAT WE CAPTURE */}
      <section className="py-20 bg-[#161616]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-[#d8c3a5] uppercase tracking-widest text-[10px] mb-2">What We Capture</h3>
            <h2 className="font-serif text-3xl text-white">More Than Just Photos</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center text-white/70">
            <div className="flex flex-col items-center">
              <Camera className="w-8 h-8 mb-4 text-[#d8c3a5] font-light" strokeWidth={1} />
              <h4 className="text-xs uppercase tracking-widest text-white mb-2">The Glances</h4>
              <p className="text-xs font-light">The moments nobody planned.</p>
            </div>
            <div className="flex flex-col items-center">
              <Sparkles className="w-8 h-8 mb-4 text-[#d8c3a5] font-light" strokeWidth={1} />
              <h4 className="text-xs uppercase tracking-widest text-white mb-2">The Details</h4>
              <p className="text-xs font-light">The hands, rings, flowers, fabrics.</p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="w-8 h-8 mb-4 text-[#d8c3a5] font-light" strokeWidth={1} />
              <h4 className="text-xs uppercase tracking-widest text-white mb-2">The People</h4>
              <p className="text-xs font-light">The family and friends who make your day.</p>
            </div>
            <div className="flex flex-col items-center">
              <Heart className="w-8 h-8 mb-4 text-[#d8c3a5] font-light" strokeWidth={1} />
              <h4 className="text-xs uppercase tracking-widest text-white mb-2">The Celebration</h4>
              <p className="text-xs font-light">The laughter, dancing, and music.</p>
            </div>
            <div className="flex flex-col items-center">
              <BookOpen className="w-8 h-8 mb-4 text-[#d8c3a5] font-light" strokeWidth={1} />
              <h4 className="text-xs uppercase tracking-widest text-white mb-2">The Story</h4>
              <p className="text-xs font-light">Everything that happens between the big moments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PHOTOGRAPHY & CINEMATOGRAPHY SPLIT */}
      <section className="flex flex-col md:flex-row min-h-[100vh] md:min-h-0 md:h-[70vh]">
        <div className="flex-1 relative group overflow-hidden border-r border-[#0f0f0f] flex flex-col justify-center">
          <div className="absolute inset-0 bg-black/60 z-10 group-hover:bg-black/40 transition-colors duration-500"></div>
          <img src="https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Photography" />
          <div className="relative z-20 flex flex-col items-center justify-center text-center p-12 md:p-8 h-full">
            <h3 className="text-[#d8c3a5] uppercase tracking-widest text-[10px] mb-4">Photography</h3>
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Timeless photographs.<br/>Real emotions.</h2>
            <p className="text-white/70 font-light mb-8">Beautifully preserved.</p>
            <Link href="/photography" className="border border-white/20 hover:border-[#d8c3a5] text-xs uppercase tracking-widest text-white hover:text-[#d8c3a5] px-8 py-3 rounded-full transition-all">
              Explore Photography
            </Link>
          </div>
        </div>
        <div className="flex-1 relative group overflow-hidden flex flex-col justify-center">
          <div className="absolute inset-0 bg-black/60 z-10 group-hover:bg-black/40 transition-colors duration-500"></div>
          <img src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Cinematography" />
          <div className="relative z-20 flex flex-col items-center justify-center text-center p-12 md:p-8 h-full">
            <h3 className="text-[#d8c3a5] uppercase tracking-widest text-[10px] mb-4">Cinematography</h3>
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4 md:mb-8">Some memories<br/>should move.</h2>
            <div className="md:hidden h-[24px]"></div> {/* Spacer to perfectly align buttons visually on mobile since Photography has a subtitle p tag */}
            <Link href="/films" className="border border-white/20 hover:border-[#d8c3a5] text-xs uppercase tracking-widest text-white hover:text-[#d8c3a5] px-8 py-3 rounded-full transition-all">
              Watch Our Films
            </Link>
          </div>
        </div>
      </section>

      {/* 5. APPROACH */}
      <section className="py-24 bg-[#0f0f0f] relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-20" alt="Background" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] to-transparent"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-xl">
            <h3 className="text-[#d8c3a5] uppercase tracking-widest text-[10px] mb-4">Our Approach</h3>
            <h2 className="font-serif text-4xl text-white mb-6">Not just photographs.</h2>
            <p className="text-white/70 font-light leading-relaxed mb-8">
              We don&apos;t want you to remember your wedding as a collection of poses. We want you to remember the feeling. The nervous smiles, your mother&apos;s tears, your friends laughing when nobody was watching.
            </p>
            <Link href="/about" className="border border-[#d8c3a5] text-[#d8c3a5] text-xs uppercase tracking-widest px-8 py-3 rounded-full hover:bg-[#d8c3a5] hover:text-[#0f0f0f] transition-all">
              Our Philosophy &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS & CONTACT CTA */}
      <section className="py-24 bg-[#161616]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1">
              <img src="https://images.unsplash.com/photo-1606214470395-502a55b33107?q=80&w=2070&auto=format&fit=crop" alt="Couple" className="w-full h-auto" />
            </div>
            <div className="flex-1">
              <h3 className="text-[#d8c3a5] uppercase tracking-widest text-[10px] mb-6">What Our Couples Say</h3>
              <p className="font-serif text-2xl md:text-3xl text-white mb-6 leading-relaxed italic">
                &quot;They didn&apos;t just photograph our wedding. They somehow captured exactly how that day felt. Every time we look at our photos, we relive it all over again.&quot;
              </p>
              <div className="text-[#d8c3a5] mb-2 text-xl">★★★★★</div>
              <p className="text-white text-sm uppercase tracking-widest font-light">— Afrin & Sayeef</p>
              <p className="text-white/50 text-[10px] uppercase tracking-widest mt-1">Dhaka • 2026</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. QUICK CONTACT */}
      <section className="py-24 bg-[#d8c3a5] text-[#0f0f0f]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-serif text-4xl mb-6">Let&apos;s Create Something Beautiful.</h2>
          <p className="max-w-lg mx-auto font-light mb-10">We take a limited number of weddings each year to ensure we give our couples the best possible experience. Let&apos;s talk about your day.</p>
          <Link href="/contact" className="bg-[#0f0f0f] text-[#d8c3a5] text-xs uppercase tracking-widest px-10 py-4 hover:bg-black transition-colors">
            Check Availability
          </Link>
        </div>
      </section>

    </div>
  );
}
