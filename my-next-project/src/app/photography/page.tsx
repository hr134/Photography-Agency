export default function Photography() {
  return (
    <div className="pt-24 pb-20">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-[#d8c3a5] mb-6">Photography</h1>
          <p className="text-white/70 font-light">Timeless. Authentic. Yours.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 mb-24 items-center">
          <div className="flex-1 grid grid-cols-2 gap-4">
            <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800" className="w-full h-[400px] object-cover" alt="Photo" />
            <div className="grid grid-rows-2 gap-4">
              <img src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800" className="w-full h-full object-cover" alt="Photo" />
              <img src="https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=800" className="w-full h-full object-cover" alt="Photo" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-3xl text-white mb-6">More Than Just Photos</h2>
            <p className="text-white/70 font-light mb-8 leading-relaxed">
              We approach every wedding as a unique story. We blend photojournalism with fine art portraiture to create a collection of images that are both authentic and beautifully crafted.
            </p>
            <ul className="text-white/70 space-y-4 font-light">
              <li>✓ Candid Moments</li>
              <li>✓ Portraits</li>
              <li>✓ Details</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
