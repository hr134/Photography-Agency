'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Loader2, Plus, Trash2, User, Edit3, X, Check } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  phone: string;
  fb_id?: string;
  whatsapp_number?: string;
  body_model?: string;
  lens?: string;
  gimbal_or_softbox?: string;
  light_setup?: string;
  living_area?: string;
  payment?: string;
  works_experience?: string;
}

const ROLE_OPTIONS = ['Photographer', 'Cinematographer', 'Photo Editor', 'Drone Operator', 'Assistant', 'Others'];
const ROLE_COLORS: Record<string, string> = {
  'Photographer': 'text-[#d8c3a5] bg-[#d8c3a5]/10 border-[#d8c3a5]/20',
  'Cinematographer': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'Photo Editor': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'Drone Operator': 'text-green-400 bg-green-400/10 border-green-400/20',
  'Assistant': 'text-white/50 bg-white/5 border-white/10',
  'Others': 'text-gray-400 bg-gray-400/10 border-gray-400/20',
};

export default function AdminTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<TeamMember>>({ name: '', role: 'Photographer', phone: '', fb_id: '', whatsapp_number: '', body_model: '', lens: '', gimbal_or_softbox: '', light_setup: '', living_area: '', payment: '', works_experience: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editForm, setEditForm] = useState<Partial<TeamMember>>({ name: '', role: '', phone: '', fb_id: '', whatsapp_number: '', body_model: '', lens: '', gimbal_or_softbox: '', light_setup: '', living_area: '', payment: '', works_experience: '' });
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => { fetchTeam(); }, []);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/team');
      setMembers(data.team || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await api.post('/admin/team', form);
      setMembers(prev => [...prev, data.member]);
      setForm({ name: '', role: 'Photographer', phone: '', fb_id: '', whatsapp_number: '', body_model: '', lens: '', gimbal_or_softbox: '', light_setup: '', living_area: '', payment: '', works_experience: '' });
      setShowForm(false);
    } catch (err: any) {
      alert(err.message || 'Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this team member?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/team/${id}`);
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to remove member');
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (member: TeamMember) => {
    setEditingMember(member);
    setEditForm({ 
      name: member.name, 
      role: member.role, 
      phone: member.phone || '',
      fb_id: member.fb_id || '',
      whatsapp_number: member.whatsapp_number || '',
      body_model: member.body_model || '',
      lens: member.lens || '',
      gimbal_or_softbox: member.gimbal_or_softbox || '',
      light_setup: member.light_setup || '',
      living_area: member.living_area || '',
      payment: member.payment || '',
      works_experience: member.works_experience || ''
    });
  };

  const cancelEdit = () => {
    setEditingMember(null);
  };

  const handleEditSave = async () => {
    if (!editingMember) return;
    setEditSaving(true);
    try {
      const res = await api.put(`/admin/team/${editingMember.id}`, editForm);
      setMembers(prev => prev.map(m => m.id === editingMember.id ? res.member : m));
      setEditingMember(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update member');
    } finally {
      setEditSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-60">
      <Loader2 className="w-7 h-7 animate-spin text-[#d8c3a5]" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-white mb-1">Team</h1>
          <p className="text-sm text-white/40">Manage photographers and crew</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#d8c3a5] text-black px-4 py-2.5 text-xs uppercase tracking-widest hover:bg-white transition-colors rounded-md"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Add Member Form */}
      {showForm && (
        <div className="bg-[#161616] border border-[#d8c3a5]/20 rounded-xl p-6">
          <h3 className="text-white font-serif text-lg mb-4">New Team Member</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Full Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full bg-transparent border-b border-white/20 py-2 focus:border-[#d8c3a5] outline-none text-white text-sm transition-colors" placeholder="e.g. Rafiq Ahmed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 py-2 px-3 rounded-md text-white text-sm focus:border-[#d8c3a5] outline-none">
                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Primary Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-transparent border-b border-white/20 py-2 focus:border-[#d8c3a5] outline-none text-white text-sm transition-colors" placeholder="+880 ..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40">WhatsApp Number</label>
              <input value={form.whatsapp_number} onChange={e => setForm({ ...form, whatsapp_number: e.target.value })} className="w-full bg-transparent border-b border-white/20 py-2 focus:border-[#d8c3a5] outline-none text-white text-sm transition-colors" placeholder="WhatsApp Number" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40">FB Profile ID</label>
              <input value={form.fb_id} onChange={e => setForm({ ...form, fb_id: e.target.value })} className="w-full bg-transparent border-b border-white/20 py-2 focus:border-[#d8c3a5] outline-none text-white text-sm transition-colors" placeholder="FB ID or URL" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Body Model</label>
              <input value={form.body_model} onChange={e => setForm({ ...form, body_model: e.target.value })} className="w-full bg-transparent border-b border-white/20 py-2 focus:border-[#d8c3a5] outline-none text-white text-sm transition-colors" placeholder="Camera Body Model" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Lens</label>
              <input value={form.lens} onChange={e => setForm({ ...form, lens: e.target.value })} className="w-full bg-transparent border-b border-white/20 py-2 focus:border-[#d8c3a5] outline-none text-white text-sm transition-colors" placeholder="Lenses used" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Gimbal / Softbox</label>
              <input value={form.gimbal_or_softbox} onChange={e => setForm({ ...form, gimbal_or_softbox: e.target.value })} className="w-full bg-transparent border-b border-white/20 py-2 focus:border-[#d8c3a5] outline-none text-white text-sm transition-colors" placeholder="Equipment Model" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Light Setup</label>
              <input value={form.light_setup} onChange={e => setForm({ ...form, light_setup: e.target.value })} className="w-full bg-transparent border-b border-white/20 py-2 focus:border-[#d8c3a5] outline-none text-white text-sm transition-colors" placeholder="Light setup details" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Living Area</label>
              <input value={form.living_area} onChange={e => setForm({ ...form, living_area: e.target.value })} className="w-full bg-transparent border-b border-white/20 py-2 focus:border-[#d8c3a5] outline-none text-white text-sm transition-colors" placeholder="Current living area" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Payment Info</label>
              <input value={form.payment} onChange={e => setForm({ ...form, payment: e.target.value })} className="w-full bg-transparent border-b border-white/20 py-2 focus:border-[#d8c3a5] outline-none text-white text-sm transition-colors" placeholder="Payment method / rate" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Work Experience</label>
              <input value={form.works_experience} onChange={e => setForm({ ...form, works_experience: e.target.value })} className="w-full bg-transparent border-b border-white/20 py-2 focus:border-[#d8c3a5] outline-none text-white text-sm transition-colors" placeholder="Years or level of experience" />
            </div>
            <div className="col-span-full flex gap-3 pt-2 mt-2">
              <button type="submit" disabled={submitting} className="bg-[#d8c3a5] text-black px-6 py-2 text-xs uppercase tracking-widest hover:bg-white transition-colors rounded-md disabled:opacity-50 flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Save Member
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-white/40 hover:text-white text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl">{error}</div>}

      {/* Team Grid */}
      {members.length === 0 ? (
        <div className="bg-[#161616] border border-white/5 rounded-xl p-12 text-center text-white/40">
          No team members yet. Add your first photographer!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(member => (
            <div key={member.id} className="bg-[#161616] border border-white/5 rounded-xl p-5 flex items-start gap-4 group hover:border-white/10 transition-colors">
              <div className="p-3 bg-white/5 rounded-full flex-shrink-0">
                <User className="w-5 h-5 text-[#d8c3a5]" />
              </div>

              {editingMember?.id === member.id ? (
                /* Edit mode */
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-transparent border-b border-[#d8c3a5]/50 py-1 text-white text-sm outline-none" placeholder="Name" />
                    <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 py-1.5 px-2 rounded text-white text-xs outline-none">
                      {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="Phone" className="w-full bg-transparent border-b border-white/20 py-1 text-white text-xs outline-none" />
                    <input value={editForm.whatsapp_number} onChange={e => setEditForm({ ...editForm, whatsapp_number: e.target.value })} placeholder="WhatsApp" className="w-full bg-transparent border-b border-white/20 py-1 text-white text-xs outline-none" />
                    <input value={editForm.fb_id} onChange={e => setEditForm({ ...editForm, fb_id: e.target.value })} placeholder="FB ID" className="w-full bg-transparent border-b border-white/20 py-1 text-white text-xs outline-none" />
                    <input value={editForm.body_model} onChange={e => setEditForm({ ...editForm, body_model: e.target.value })} placeholder="Body Model" className="w-full bg-transparent border-b border-white/20 py-1 text-white text-xs outline-none" />
                    <input value={editForm.lens} onChange={e => setEditForm({ ...editForm, lens: e.target.value })} placeholder="Lens" className="w-full bg-transparent border-b border-white/20 py-1 text-white text-xs outline-none" />
                    <input value={editForm.gimbal_or_softbox} onChange={e => setEditForm({ ...editForm, gimbal_or_softbox: e.target.value })} placeholder="Gimbal/Softbox" className="w-full bg-transparent border-b border-white/20 py-1 text-white text-xs outline-none" />
                    <input value={editForm.light_setup} onChange={e => setEditForm({ ...editForm, light_setup: e.target.value })} placeholder="Light Setup" className="w-full bg-transparent border-b border-white/20 py-1 text-white text-xs outline-none" />
                    <input value={editForm.living_area} onChange={e => setEditForm({ ...editForm, living_area: e.target.value })} placeholder="Living Area" className="w-full bg-transparent border-b border-white/20 py-1 text-white text-xs outline-none" />
                    <input value={editForm.payment} onChange={e => setEditForm({ ...editForm, payment: e.target.value })} placeholder="Payment" className="w-full bg-transparent border-b border-white/20 py-1 text-white text-xs outline-none" />
                    <input value={editForm.works_experience} onChange={e => setEditForm({ ...editForm, works_experience: e.target.value })} placeholder="Work Exp." className="w-full bg-transparent border-b border-white/20 py-1 text-white text-xs outline-none" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={handleEditSave} disabled={editSaving} className="flex items-center gap-1 bg-[#d8c3a5] text-black px-3 py-1 rounded text-xs hover:bg-white transition-colors disabled:opacity-50">
                      {editSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                    </button>
                    <button onClick={cancelEdit} className="flex items-center gap-1 text-white/40 hover:text-white text-xs">
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium truncate">{member.name}</p>
                      <span className={`text-[9px] uppercase tracking-widest border px-1.5 py-0.5 rounded-sm ${ROLE_COLORS[member.role] || 'text-white/50 bg-white/5 border-white/10'}`}>
                        {member.role}
                      </span>
                    </div>
                    
                    <div className="text-white/50 text-xs grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2">
                      {member.phone && <div>📞 {member.phone}</div>}
                      {member.whatsapp_number && <div>📱 {member.whatsapp_number} (WA)</div>}
                      {member.fb_id && <div>🔗 {member.fb_id}</div>}
                      {member.living_area && <div>📍 {member.living_area}</div>}
                      {member.body_model && <div>📷 Body: {member.body_model}</div>}
                      {member.lens && <div>🔍 Lens: {member.lens}</div>}
                      {member.gimbal_or_softbox && <div>⚙️ Gimbal/Softbox: {member.gimbal_or_softbox}</div>}
                      {member.light_setup && <div>💡 Light: {member.light_setup}</div>}
                      {member.works_experience && <div>💼 Exp: {member.works_experience}</div>}
                      {member.payment && <div>💰 Pay: {member.payment}</div>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                    <button onClick={() => startEdit(member)} className="text-white/30 hover:text-[#d8c3a5] transition-colors p-1" title="Edit">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(member.id)} disabled={deletingId === member.id} className="text-white/20 hover:text-red-400 transition-all p-1" title="Delete">
                      {deletingId === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
