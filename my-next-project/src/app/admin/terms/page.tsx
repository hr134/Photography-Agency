'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, Plus, FileText, CheckCircle, Clock } from 'lucide-react';

interface AgreementTerms {
  id: number;
  version: string;
  content: string;
  effective_from: string;
  is_active: boolean;
  created_at: string;
}

export default function AgreementTermsPage() {
  const [terms, setTerms] = useState<AgreementTerms[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [newVersion, setNewVersion] = useState('');
  const [newContent, setNewContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const data = await api.get('/admin/agreement-terms');
      setTerms(data || []);
    } catch (err) {
      console.error('Failed to load terms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      await api.post('/admin/agreement-terms', {
        version: newVersion,
        content: newContent
      });
      setShowForm(false);
      setNewVersion('');
      setNewContent('');
      await fetchTerms();
    } catch (err: any) {
      setError(err.message || 'Failed to create new terms');
    } finally {
      setSaving(false);
    }
  };

  const activeTerms = terms.find(t => t.is_active);
  const historyTerms = terms.filter(t => !t.is_active);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9ab84]" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#d8c3a5] font-serif">Agreement Terms</h1>
          <p className="text-white/50 text-sm mt-1">Manage standard terms and conditions for client bookings.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setNewVersion(activeTerms ? `v${parseFloat(activeTerms.version.replace('v', '')) + 1.0}` : 'v1.0');
              setNewContent(activeTerms ? activeTerms.content : '');
              setShowForm(true);
            }}
            className="bg-[#d8c3a5] text-black px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-medium hover:bg-white transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Version
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#161616] border border-white/5 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <h2 className="text-lg font-semibold text-[#d8c3a5] font-serif">Create New Agreement Terms</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-white/50 hover:text-white transition-colors">Cancel</button>
          </div>
          
          {error && <div className="p-3 bg-red-900/30 text-red-400 text-sm rounded-lg border border-red-900">{error}</div>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Version *</label>
              <input required type="text" value={newVersion} onChange={(e) => setNewVersion(e.target.value)} placeholder="e.g. v2.0" className="w-1/3 border border-white/10 bg-[#0f0f0f] text-white rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#d8c3a5] outline-none transition placeholder-white/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Terms &amp; Conditions (Markdown/HTML supported if rendering allows) *</label>
              <textarea required value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={15} className="w-full border border-white/10 bg-[#0f0f0f] text-white rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#d8c3a5] outline-none font-mono transition placeholder-white/30" placeholder="Enter terms content here..." />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2 border-t border-white/10 mt-4">
            <button
              type="submit"
              disabled={saving}
              className="mt-4 bg-[#d8c3a5] text-black px-6 py-2 rounded-lg text-xs uppercase tracking-widest font-medium hover:bg-white disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save &amp; Make Active
            </button>
          </div>
        </form>
      )}

      {/* Active Terms */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 font-serif">
          <CheckCircle className="w-5 h-5 text-green-400" /> Active Version
        </h3>
        {activeTerms ? (
          <div className="bg-[#161616] border border-[#d8c3a5]/50 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
              <div>
                <span className="bg-[#d8c3a5]/10 text-[#d8c3a5] border border-[#d8c3a5]/20 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">{activeTerms.version}</span>
                <p className="text-xs text-white/50 mt-3">Effective from: {new Date(activeTerms.effective_from).toLocaleString()}</p>
              </div>
            </div>
            <div className="prose prose-sm max-w-none text-white/80 bg-[#0f0f0f] p-4 rounded-lg whitespace-pre-wrap max-h-96 overflow-y-auto border border-white/5 custom-scrollbar">
              {activeTerms.content}
            </div>
          </div>
        ) : (
          <div className="bg-[#161616] border border-white/10 border-dashed rounded-xl p-8 text-center text-white/50 text-sm">
            No active terms set. Create a version to start generating agreements.
          </div>
        )}
      </div>

      {/* History */}
      {historyTerms.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 font-serif">
            <Clock className="w-5 h-5 text-white/50" /> Version History
          </h3>
          <div className="bg-[#161616] border border-white/5 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-white/80">
              <thead className="bg-[#0f0f0f] text-xs uppercase text-white/50 font-semibold border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Version</th>
                  <th className="px-6 py-4">Effective From</th>
                  <th className="px-6 py-4">Created At</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {historyTerms.map(t => (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium flex items-center gap-2 text-[#d8c3a5]">
                      <FileText className="w-4 h-4 text-white/50" /> {t.version}
                    </td>
                    <td className="px-6 py-4 text-white/70">{new Date(t.effective_from).toLocaleString()}</td>
                    <td className="px-6 py-4 text-white/70">{new Date(t.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4"><span className="text-white/50 bg-white/10 px-2 py-0.5 rounded text-xs uppercase tracking-wider">Archived</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
