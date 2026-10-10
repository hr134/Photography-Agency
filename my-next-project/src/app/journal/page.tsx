import Link from "next/link";

export default function Journal() {
  return (
    <div className="pt-24 pb-20">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-[#d8c3a5] mb-6">Our Journal</h1>
          <p className="text-white/70 font-light">Tips, stories, and inspiration.</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Featured Article */}
          <div className="mb-16 group cursor-pointer">
            <div className="overflow-hidden mb-6 relative aspect-[21/9]">
              <img src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200" alt="Journal" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-[#d8c3a5] mb-3">
              <span>Wedding Tips</span>
              <span>•</span>
              <span>Sep 15, 2026</span>
            </div>
            <h2 className="font-serif text-3xl text-white mb-4 group-hover:text-[#d8c3a5] transition-colors">10 Moments Every Wedding Photographer Looks For</h2>
            <p className="text-white/70 font-light mb-6">
              When we document a wedding, we are always searching for those fleeting, unscripted moments that tell the real story of the day. Here is a look at what we are constantly watching for...
            </p>
            <span className="text-xs uppercase tracking-widest text-white border-b border-white pb-1">Read More</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group cursor-pointer">
                <div className="overflow-hidden mb-4 relative aspect-video">
                  <img src={`https://images.unsplash.com/photo-${1500000000000 + i * 3000}?q=80&w=600&auto=format&fit=crop`} alt="Journal" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-[#d8c3a5] mb-2">
                  <span>Inspiration</span>
                </div>
                <h3 className="font-serif text-xl text-white mb-3 group-hover:text-[#d8c3a5] transition-colors">A Dhaka Wedding at Sunset</h3>
                <span className="text-[10px] uppercase tracking-widest text-white/50 group-hover:text-white pb-1">Read More &rarr;</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
