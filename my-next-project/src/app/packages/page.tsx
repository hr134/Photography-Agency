'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Loader2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Package {
  id: number;
  name: string;
  price: number;
  description?: string;
  features?: string;
  details?: string;
  is_popular?: boolean;
  team_requirements?: {
    drone?: boolean;
    [key: string]: any;
  };
}

interface Discount {
  id: number;
  package_id: number | null;
  discount_type: 'percent' | 'fixed';
  value: number;
}

export default function Packages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkgData, discountData] = await Promise.all([
          api.get('/packages/'),
          api.get('/admin/discounts/active').catch(() => ({ discounts: [] })),
        ]);
        setPackages(pkgData);
        setDiscounts(discountData.discounts || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load packages');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDiscount = (pkg: Package): { discountedPrice: number; label: string; saving: number } | null => {
    const specific = discounts.find(d => d.package_id === pkg.id);
    const global = discounts.find(d => d.package_id === null);
    const best = specific || global;
    if (!best) return null;
    if (best.discount_type === 'percent') {
      const saving = Math.round(pkg.price * best.value / 100);
      return { discountedPrice: pkg.price - saving, label: `${best.value}% OFF`, saving };
    } else {
      const saving = Math.min(best.value, pkg.price);
      return { discountedPrice: pkg.price - saving, label: `৳${best.value.toLocaleString()} OFF`, saving };
    }
  };


  const handleBookClick = (pkg: Package) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/book?package_id=${pkg.id}`);
      return;
    }
    router.push(`/book?package_id=${pkg.id}`);
  };

  return (
    <div className="pt-24 pb-20 relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h1 className="font-serif text-4xl md:text-5xl text-[#d8c3a5] mb-6">Our Packages</h1>
          <p className="text-white/70 font-light">Beautiful memories. Thoughtfully crafted.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-[#d8c3a5]" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => {
              const discount = getDiscount(pkg);
              return (
                <div key={pkg.id} className={`border p-10 transition-colors relative ${pkg.is_popular ? 'border-[#d8c3a5] bg-[#0f0f0f]' : 'border-white/10 hover:border-[#d8c3a5]/50 bg-[#161616]'}`}>
                  {pkg.is_popular && (
                    <div className="absolute top-0 right-10 -translate-y-1/2 bg-[#d8c3a5] text-black text-[10px] uppercase tracking-widest px-4 py-1">Most Popular</div>
                  )}
                  {/* Discount badge - Premium Design */}
                  {discount && (
                    <div className="absolute -top-3 -right-3 z-10 animate-bounce-slow">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-yellow-500 rounded-full blur opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <span className="relative flex items-center justify-center gap-1.5 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border border-[#d8c3a5]/50 text-[#d8c3a5] text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-2xl overflow-hidden">
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d8c3a5]/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></span>
                          <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                          {discount.label}
                        </span>
                      </div>
                    </div>
                  )}
                  <h3 className="text-[#d8c3a5] uppercase tracking-widest text-[10px] mb-2">{pkg.is_popular ? 'Signature' : (index === 0 ? 'Essential' : 'Bespoke')}</h3>
                  <h2 className="font-serif text-2xl text-white mb-6">{pkg.name}</h2>
                  <div className="mb-8">
                    <span className="text-white/50 text-sm block mb-2">Starting from</span>
                    {discount ? (
                      <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 backdrop-blur-sm relative overflow-hidden">
                        {/* Decorative background accent */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d8c3a5]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        
                        <div className="flex items-end gap-3 relative z-10">
                          <span className="text-white/30 text-lg line-through decoration-red-500/50 decoration-2">৳ {pkg.price.toLocaleString()}</span>
                          <span className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-[#d8c3a5] to-white font-bold font-serif tracking-tight">৳ {discount.discountedPrice.toLocaleString()}</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-md border border-emerald-500/20 relative z-10">
                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                           You save ৳{discount.saving.toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-3xl text-white font-serif tracking-tight block p-4">৳ {pkg.price.toLocaleString()}</span>
                    )}
                  </div>
                  <ul className="text-white/70 font-light space-y-4 mb-10 text-sm">
                    {pkg.features ? (() => {
                      try {
                        const feats = JSON.parse(pkg.features!);
                        return feats.map((f: string, i: number) => <li key={i}>✓ {f}</li>);
                      } catch {
                        return pkg.features!.split('\n').map((line, i) => <li key={i}>✓ {line}</li>);
                      }
                    })() : pkg.description ? pkg.description.split('\n').map((line, i) => (
                      <li key={i}>✓ {line}</li>
                    )) : (
                      <>
                        <li>✓ Professional Photographer</li>
                        <li>✓ Event Coverage</li>
                        <li>✓ Edited Images</li>
                        <li>✓ Online Gallery</li>
                      </>
                    )}
                  </ul>
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleBookClick(pkg)}
                      className={`w-full block text-center text-xs uppercase tracking-widest py-4 transition-colors ${pkg.is_popular ? 'bg-[#d8c3a5] text-black border border-[#d8c3a5] hover:bg-white hover:border-white' : 'border border-white/20 text-white hover:bg-white hover:text-black'}`}>
                      Book Now
                    </button>
                    <button 
                      onClick={() => setSelectedPackage(pkg)}
                      className="w-full block text-center text-xs uppercase tracking-widest py-4 transition-colors border border-transparent text-white/50 hover:text-white">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-6 p-4">
          <div className="bg-[#161616] border border-white/10 rounded-2xl max-w-2xl w-full relative flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-3xl text-[#d8c3a5] mb-2">{selectedPackage.name}</h2>
                <p className="text-white/70 text-sm">Package Details</p>
              </div>
              <button 
                onClick={() => setSelectedPackage(null)}
                className="text-white/50 hover:text-white bg-white/5 p-2 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 text-white/80 whitespace-pre-wrap leading-relaxed space-y-8">
              
              <div>
                <h3 className="text-[#d8c3a5] font-serif text-xl mb-2">Short Description</h3>
                {selectedPackage.description ? (
                  <p className="font-light">{selectedPackage.description}</p>
                ) : (
                  <p className="text-white/30 italic font-light text-sm">No short description available.</p>
                )}
              </div>

              <div>
                <h3 className="text-[#d8c3a5] font-serif text-xl mb-2">Features Included</h3>
                {selectedPackage.features ? (
                  <ul className="space-y-2 font-light">
                    {(() => {
                      try {
                        const feats = JSON.parse(selectedPackage.features);
                        return feats.map((f: string, i: number) => <li key={i} className="flex items-start gap-2"><span className="text-[#d8c3a5]">✓</span> {f}</li>);
                      } catch {
                        return selectedPackage.features.split('\n').map((line, i) => <li key={i} className="flex items-start gap-2"><span className="text-[#d8c3a5]">✓</span> {line}</li>);
                      }
                    })()}
                  </ul>
                ) : (
                  <p className="text-white/30 italic font-light text-sm">No features listed.</p>
                )}
              </div>

              <div>
                <h3 className="text-[#d8c3a5] font-serif text-xl mb-2">Special Equipment & Team</h3>
                {(() => {
                  let reqs: any = selectedPackage.team_requirements;
                  if (typeof reqs === 'string') {
                    try { reqs = JSON.parse(reqs); } catch {}
                  }
                  
                  if (!reqs) return <p className="text-white/30 italic font-light text-sm">No special equipment listed.</p>;
                  
                  const teamMembers = [];
                  if (reqs.chief_photographer) teamMembers.push(`${reqs.chief_photographer} Chief Photographer(s)`);
                  if (reqs.top_photographer) teamMembers.push(`${reqs.top_photographer} Top Photographer(s)`);
                  if (reqs.senior_photographer) teamMembers.push(`${reqs.senior_photographer} Senior Photographer(s)`);
                  if (reqs.chief_cinematographer) teamMembers.push(`${reqs.chief_cinematographer} Chief Cinematographer(s)`);
                  if (reqs.top_cinematographer) teamMembers.push(`${reqs.top_cinematographer} Top Cinematographer(s)`);
                  if (reqs.senior_cinematographer) teamMembers.push(`${reqs.senior_cinematographer} Senior Cinematographer(s)`);
                  if (reqs.drone) teamMembers.push(`Drone Coverage Included`);

                  if (teamMembers.length === 0) {
                    return <p className="text-white/30 italic font-light text-sm">No special equipment listed.</p>;
                  }

                  return (
                    <ul className="space-y-2 font-light">
                      {teamMembers.map((member, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-[#d8c3a5]">✓</span> {member}
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>

              <div>
                <h3 className="text-[#d8c3a5] font-serif text-xl mb-2">Extended Details</h3>
                {selectedPackage.details ? (
                  <div className="font-light bg-black/20 p-5 rounded-lg border border-white/5" dangerouslySetInnerHTML={{ __html: selectedPackage.details }} />
                ) : (
                  <p className="text-white/30 italic font-light text-sm bg-black/20 p-5 rounded-lg border border-white/5">No extended details provided for this package.</p>
                )}
              </div>
            </div>

            <div className="p-8 border-t border-white/5 bg-black/20 rounded-b-2xl">
              <button 
                onClick={() => handleBookClick(selectedPackage)}
                className="w-full bg-[#d8c3a5] text-black py-4 uppercase text-xs tracking-widest hover:bg-white transition-colors rounded-lg font-medium"
              >
                Book This Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
