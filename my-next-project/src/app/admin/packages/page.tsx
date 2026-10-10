'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Loader2, Plus, Trash2, Edit3, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  is_popular: boolean;
  features?: string;
  details?: string;
  team_requirements?: any;
}

export default function AdminPackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/packages');
      setPackages(data.packages || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    try {
      await api.delete(`/admin/packages/${id}`);
      setPackages(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete package');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="w-7 h-7 animate-spin text-[#d8c3a5]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-white mb-1">Service Packages</h1>
          <p className="text-sm text-white/40">Manage pricing, coverage details, and featured packages</p>
        </div>
        <button
          onClick={() => router.push('/admin/packages/new')}
          className="inline-flex items-center gap-2 bg-[#d8c3a5] text-black px-4 py-2.5 rounded-lg text-xs uppercase tracking-widest font-medium hover:bg-white transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Package
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {packages.length === 0 ? (
        <div className="bg-[#161616] border border-white/5 rounded-xl p-12 text-center">
          <p className="text-white/40 mb-4">No packages found.</p>
          <button
            onClick={() => router.push('/admin/packages/new')}
            className="inline-flex items-center gap-2 bg-[#d8c3a5] text-black px-4 py-2.5 rounded-lg text-xs uppercase tracking-widest font-medium hover:bg-white transition-all"
          >
            <Plus className="w-4 h-4" /> Create First Package
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className={`bg-[#161616] rounded-xl p-6 border flex flex-col justify-between relative transition-all ${
                pkg.is_popular
                  ? 'border-[#d8c3a5]/50 shadow-lg shadow-[#d8c3a5]/5'
                  : 'border-white/5 hover:border-white/15'
              }`}
            >
              {pkg.is_popular && (
                <div className="absolute -top-3 right-6 bg-[#d8c3a5] text-black text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Star className="w-3 h-3 fill-current" />
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="font-serif text-xl text-white mb-2">{pkg.name}</h3>
                <div className="text-2xl font-sans font-semibold text-[#d8c3a5] mb-4">
                  ৳ {pkg.price.toLocaleString()}
                </div>
                <div className="text-xs text-white/60 whitespace-pre-line leading-relaxed mb-6 font-mono bg-black/20 p-4 rounded-lg border border-white/5 line-clamp-4">
                  {pkg.description || 'No description provided.'}
                </div>
                {pkg.team_requirements && (
                  <div className="text-[10px] text-white/30 space-y-0.5 mb-4">
                    {pkg.team_requirements.chief_photographer > 0 && <div>Chief Photographer: {pkg.team_requirements.chief_photographer}</div>}
                    {pkg.team_requirements.top_photographer > 0 && <div>Top Photographer: {pkg.team_requirements.top_photographer}</div>}
                    {pkg.team_requirements.senior_photographer > 0 && <div>Senior Photographer: {pkg.team_requirements.senior_photographer}</div>}
                    {pkg.team_requirements.top_cinematographer > 0 && <div>Top Cinematographer: {pkg.team_requirements.top_cinematographer}</div>}
                    {pkg.team_requirements.senior_cinematographer > 0 && <div>Senior Cinematographer: {pkg.team_requirements.senior_cinematographer}</div>}
                    {pkg.team_requirements.drone && <div>✓ Drone Coverage</div>}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-2">
                <button
                  onClick={() => router.push(`/admin/packages/${pkg.id}/edit`)}
                  className="p-2 text-white/50 hover:text-[#d8c3a5] hover:bg-white/5 rounded-lg transition-colors"
                  title="Edit Package"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="p-2 text-white/50 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-colors"
                  title="Delete Package"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
