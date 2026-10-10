import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-32 text-center relative overflow-hidden">
      <img src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071" className="absolute inset-0 w-full h-full object-cover opacity-10" alt="Background" />
      <div className="relative z-10 px-6">
        <h1 className="font-serif text-6xl md:text-8xl text-white mb-6">404</h1>
        <h2 className="font-serif text-3xl text-[#d8c3a5] mb-6">This moment couldn&apos;t be found.</h2>
        <p className="text-white/70 font-light mb-10 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link href="/" className="border border-[#d8c3a5] text-[#d8c3a5] text-xs uppercase tracking-widest px-8 py-3 rounded-full hover:bg-[#d8c3a5] hover:text-[#0f0f0f] transition-all inline-block">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
