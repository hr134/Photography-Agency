export default function About() {
  return (
    <div className="pt-24 pb-20">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-[#d8c3a5] mb-6">About Us</h1>
          <p className="text-white/70 font-light">The people behind your memories.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-16 max-w-5xl mx-auto mb-24 items-center">
          <div className="flex-1">
            <h2 className="font-serif text-3xl text-white mb-6">Our Story</h2>
            <p className="text-white/70 font-light mb-6 leading-relaxed">
              We started Veloura Creations with a simple vision: to create wedding imagery that feels as genuine as the moments themselves.
            </p>
            <p className="text-white/70 font-light leading-relaxed">
              Based in Dhaka, Bangladesh, our team of dedicated photographers and cinematographers travel nationwide and internationally to capture love stories. We believe in the beauty of unposed moments, the power of a stolen glance, and the timelessness of a printed photograph.
            </p>
          </div>
          <div className="flex-1">
            <img src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?q=80&w=800" className="w-full h-auto" alt="Our Team" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl text-white mb-12 text-center">Our Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="aspect-square bg-[#161616] rounded-full overflow-hidden mb-4 mx-auto w-32 md:w-48">
                  <img src={`https://images.unsplash.com/photo-${1500000000000 + i * 5000}?q=80&w=400&auto=format&fit=crop`} alt="Team Member" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                </div>
                <h3 className="font-serif text-xl text-white mb-1">Team Member</h3>
                <p className="text-[#d8c3a5] text-[10px] uppercase tracking-widest">Lead Photographer</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
