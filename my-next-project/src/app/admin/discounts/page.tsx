'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Loader2, Plus, Trash2, Edit3, Tag } from 'lucide-react';

interface Discount {
  id: number;
  package_id: number | null;
  package_name: string;
  discount_type: 'percent' | 'fixed';
  value: number;
  active_from: string | null;
  active_to: string | null;
  is_active: boolean;
}

interface Package {
  id: number;
  name: string;
}

const INP = 'w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:border-[#d8c3a5] focus:outline-none transition-colors';
const LBL = 'block text-xs uppercase tracking-widest text-white/50 mb-1.5 font-medium';

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    package_id: '',
    discount_type: 'percent',
    value: '',
    active_from: '',
    active_to: '',
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [discRes, packRes] = await Promise.all([
        api.get('/admin/discounts'),
        api.get('/admin/packages')
      ]);
      setDiscounts(discRes.discounts || []);
      setPackages(packRes.packages || []);
    } catch (err: any) {
      alert(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (discount?: Discount) => {
    if (discount) {
      setIsEditing(true);
      setCurrentId(discount.id);
      setFormData({
        package_id: discount.package_id?.toString() || '',
        discount_type: discount.discount_type,
        value: discount.value.toString(),
        active_from: discount.active_from ? discount.active_from.split('T')[0] : '',
        active_to: discount.active_to ? discount.active_to.split('T')[0] : '',
        is_active: discount.is_active
      });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({
        package_id: '',
        discount_type: 'percent',
        value: '',
        active_from: '',
        active_to: '',
        is_active: true
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      package_id: formData.package_id ? parseInt(formData.package_id) : null,
      discount_type: formData.discount_type,
      value: parseFloat(formData.value),
      active_from: formData.active_from ? new Date(formData.active_from).toISOString() : null,
      active_to: formData.active_to ? new Date(formData.active_to).toISOString() : null,
      is_active: formData.is_active
    };

    try {
      if (isEditing && currentId) {
        await api.put(`/admin/discounts/${currentId}`, payload);
      } else {
        await api.post('/admin/discounts', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to save discount');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this discount?')) return;
    try {
      await api.delete(`/admin/discounts/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
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
          <h1 className="font-serif text-3xl text-white mb-1">Discounts</h1>
          <p className="text-sm text-white/40">Manage global or package-specific discounts</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 bg-[#d8c3a5] text-black px-4 py-2.5 rounded-lg text-xs uppercase tracking-widest font-medium hover:bg-white transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Discount
        </button>
      </div>

      <div className="bg-[#161616] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-4 text-xs uppercase tracking-widest font-medium text-white/40">Package</th>
                <th className="p-4 text-xs uppercase tracking-widest font-medium text-white/40">Value</th>
                <th className="p-4 text-xs uppercase tracking-widest font-medium text-white/40">Validity</th>
                <th className="p-4 text-xs uppercase tracking-widest font-medium text-white/40">Status</th>
                <th className="p-4 text-right text-xs uppercase tracking-widest font-medium text-white/40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {discounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/40">
                    No discounts found.
                  </td>
                </tr>
              ) : (
                discounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-medium text-white">
                      {discount.package_id ? discount.package_name : <span className="text-[#d8c3a5]">All Packages</span>}
                    </td>
                    <td className="p-4 text-white/80">
                      {discount.discount_type === 'percent' ? `${discount.value}%` : `৳${discount.value}`}
                    </td>
                    <td className="p-4 text-sm text-white/60">
                      {discount.active_from ? new Date(discount.active_from + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Always'} – 
                      {discount.active_to ? new Date(discount.active_to + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Forever'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${discount.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {discount.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openModal(discount)} className="p-2 text-white/40 hover:text-white transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(discount.id)} className="p-2 text-white/40 hover:text-red-400 transition-colors ml-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161616] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/5">
              <h2 className="font-serif text-2xl text-white">
                {isEditing ? 'Edit Discount' : 'New Discount'}
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="discount-form" onSubmit={handleSubmit} className="space-y-5">
                
                <div>
                  <label className={LBL}>Package</label>
                  <select
                    className={INP}
                    value={formData.package_id}
                    onChange={(e) => setFormData({ ...formData, package_id: e.target.value })}
                  >
                    <option value="">All Packages</option>
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LBL}>Type</label>
                    <select
                      className={INP}
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (৳)</option>
                    </select>
                  </div>
                  <div>
                    <label className={LBL}>Value</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className={INP}
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LBL}>Valid From (Optional)</label>
                    <input
                      type="date"
                      className={INP}
                      value={formData.active_from}
                      onChange={(e) => setFormData({ ...formData, active_from: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={LBL}>Valid To (Optional)</label>
                    <input
                      type="date"
                      className={INP}
                      value={formData.active_to}
                      onChange={(e) => setFormData({ ...formData, active_to: e.target.value })}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer mt-4">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d8c3a5]"></div>
                  </div>
                  <span className="text-sm font-medium text-white/80">Active</span>
                </label>
              </form>
            </div>

            <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="discount-form"
                className="bg-[#d8c3a5] text-black px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors"
              >
                Save Discount
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
