'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Loader2, ArrowLeft, Save } from 'lucide-react';

interface TeamReq {
  chief_photographer: number;
  top_photographer: number;
  senior_photographer: number;
  chief_cinematographer: number;
  top_cinematographer: number;
  senior_cinematographer: number;
  drone: boolean;
}

interface FormState {
  name: string;
  price: string;
  description: string;
  is_popular: boolean;
  features: string;
  details: string;
  team_requirements: TeamReq;
}

interface Props {
  initialData?: FormState & { id?: number };
  mode: 'create' | 'edit';
}

const defaultTeam: TeamReq = {
  chief_photographer: 0,
  top_photographer: 0,
  senior_photographer: 0,
  chief_cinematographer: 0,
  top_cinematographer: 0,
  senior_cinematographer: 0,
  drone: false,
};

const INP = 'w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:border-[#d8c3a5] focus:outline-none transition-colors';
const LBL = 'block text-xs uppercase tracking-widest text-white/50 mb-1.5 font-medium';
const TEAM_INP = 'w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#d8c3a5] focus:outline-none transition-colors';

export default function PackageForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<FormState>({
    name: initialData?.name || '',
    price: initialData?.price || '',
    description: initialData?.description || '',
    is_popular: initialData?.is_popular || false,
    features: initialData?.features || '',
    details: initialData?.details || '',
    team_requirements: initialData?.team_requirements || { ...defaultTeam },
  });

  const setTeam = (key: keyof TeamReq, value: number | boolean) => {
    setFormData(prev => ({
      ...prev,
      team_requirements: { ...prev.team_requirements, [key]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      setError('Package name and price are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        description: formData.description,
        is_popular: formData.is_popular,
        features: formData.features,
        details: formData.details,
        team_requirements: formData.team_requirements,
      };

      if (mode === 'edit' && initialData?.id) {
        await api.put(`/admin/packages/${initialData.id}`, payload);
      } else {
        await api.post('/admin/packages', payload);
      }
      router.push('/admin/packages');
    } catch (err: any) {
      setError(err.message || 'Failed to save package.');
    } finally {
      setSaving(false);
    }
  };

  const teamFields: { label: string; key: keyof TeamReq }[] = [
    { label: 'Chief Photographer', key: 'chief_photographer' },
    { label: 'Top Photographer', key: 'top_photographer' },
    { label: 'Senior Photographer', key: 'senior_photographer' },
    { label: 'Chief Cinematographer', key: 'chief_cinematographer' },
    { label: 'Top Cinematographer', key: 'top_cinematographer' },
    { label: 'Senior Cinematographer', key: 'senior_cinematographer' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/admin/packages')}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Packages
        </button>
      </div>

      <h1 className="font-serif text-3xl text-white mb-1">
        {mode === 'edit' ? 'Edit Package' : 'Create New Package'}
      </h1>
      <p className="text-sm text-white/40 mb-8">
        {mode === 'edit' ? 'Update the package details below.' : 'Fill in the details to create a new package.'}
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── Basic Info ── */}
        <div className="bg-[#161616] border border-white/5 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#d8c3a5] border-b border-white/5 pb-3">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={LBL}>Package Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Wedding Package"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className={INP}
              />
            </div>
            <div>
              <label className={LBL}>Price (BDT ৳) *</label>
              <input
                type="number"
                required
                min="0"
                step="500"
                placeholder="e.g. 75000"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className={INP}
              />
            </div>
          </div>

          <div>
            <label className={LBL}>Short Description</label>
            <textarea
              rows={3}
              placeholder="Brief overview of what's included in this package..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className={INP + ' resize-none'}
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="is_popular"
              checked={formData.is_popular}
              onChange={e => setFormData({ ...formData, is_popular: e.target.checked })}
              className="w-4 h-4 accent-[#d8c3a5] cursor-pointer rounded"
            />
            <label htmlFor="is_popular" className="text-sm text-white/70 cursor-pointer select-none">
              Mark as <span className="text-[#d8c3a5] font-medium">Most Popular</span> (shows badge on packages page)
            </label>
          </div>
        </div>

        {/* ── Features & Details ── */}
        <div className="bg-[#161616] border border-white/5 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#d8c3a5] border-b border-white/5 pb-3">
            Features &amp; Details
          </h2>

          <div>
            <label className={LBL}>Features (one per line)</label>
            <textarea
              rows={6}
              placeholder={`✓ 2 Chief Photographers\n✓ Full Day Coverage (8 hrs)\n✓ Cinematic Highlight Film\n✓ Online Gallery Access\n✓ Same-day Sneak Peek`}
              value={formData.features}
              onChange={e => setFormData({ ...formData, features: e.target.value })}
              className={INP + ' resize-none font-mono'}
            />
          </div>

          <div>
            <label className={LBL}>Extended Details (optional)</label>
            <textarea
              rows={5}
              placeholder="Longer description, terms, delivery timeline, etc."
              value={formData.details}
              onChange={e => setFormData({ ...formData, details: e.target.value })}
              className={INP + ' resize-none'}
            />
          </div>
        </div>

        {/* ── Team Setup ── */}
        <div className="bg-[#161616] border border-white/5 rounded-2xl p-6 space-y-5">
          <div className="border-b border-white/5 pb-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[#d8c3a5]">Default Team Setup</h2>
            <p className="text-xs text-white/30 mt-1">Clients will see these as read-only on the booking form.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {teamFields.map(({ label, key }) => (
              <div key={key}>
                <label className="text-[10px] uppercase text-white/40 block mb-1.5">{label}</label>
                <input
                  type="number"
                  min="0"
                  value={formData.team_requirements[key] as number}
                  onChange={e => setTeam(key, parseInt(e.target.value) || 0)}
                  className={TEAM_INP}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-1 border-t border-white/5">
            <input
              type="checkbox"
              id="team_drone"
              checked={formData.team_requirements.drone}
              onChange={e => setTeam('drone', e.target.checked)}
              className="w-4 h-4 accent-[#d8c3a5] cursor-pointer"
            />
            <label htmlFor="team_drone" className="text-sm text-white/70 cursor-pointer select-none">
              Include Drone Coverage
            </label>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/admin/packages')}
            className="px-6 py-3 text-sm text-white/50 hover:text-white border border-white/10 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#d8c3a5] text-black px-8 py-3 rounded-xl text-sm uppercase tracking-widest font-semibold hover:bg-white transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {mode === 'edit' ? 'Update Package' : 'Create Package'}
          </button>
        </div>
      </form>
    </div>
  );
}
