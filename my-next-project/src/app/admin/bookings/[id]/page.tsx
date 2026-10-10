'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Loader2, ArrowLeft, Save, FileText, Link2, Package, Users, X, Plus, Check } from 'lucide-react';
import Link from 'next/link';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  phone?: string;
}

interface BookingDetail {
  id: number;
  status: string;
  workflow_status: string;
  payment_status: string;
  total_amount: number;
  advance_paid: number;
  final_amount: number;
  discount: number;
  booking_number: string;
  groom_name: string;
  bride_name: string;
  client_username: string;
  client_email: string;
  contact_info: string;
  district: string;
  extra_hours: number;
  delivery_link: string;
  delivery_status: string;
  team_requirements: any;
  event_details: string;
  client_name: string;
  client_phone: string;
  client_address: string;
  payment_method: string;
  payment_transaction_id: string;
  payment_notes: string;
  deliverables: string;
  events: any[];
  package_id: number;
  assigned_team_members: number[];
}

interface PackageItem {
  id: number;
  name: string;
  price: number;
}

const INP = "w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d8c3a5]/50 transition-colors placeholder:text-white/20";
const LBL = "block text-xs uppercase tracking-widest text-white/50 mb-2";

const ROLE_STYLES: Record<string, { 
  bg: string; 
  unselectedBg: string; 
  text: string; 
  border: string; 
  unselectedBorder: string; 
  dot: string; 
  chip: string; 
  badge: string; 
  unselectedBadge: string;
}> = {
  Photographer: {
    bg: 'bg-blue-500/20',
    unselectedBg: 'bg-blue-500/[0.06] hover:bg-blue-500/[0.14]',
    text: 'text-blue-300',
    border: 'border-blue-400/80',
    unselectedBorder: 'border-blue-500/30 hover:border-blue-500/60',
    dot: 'bg-blue-400',
    chip: 'bg-blue-500/20 border-blue-500/40 text-blue-200',
    badge: 'bg-blue-500/30 text-blue-200 border-blue-400/40',
    unselectedBadge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  },
  Cinematographer: {
    bg: 'bg-purple-500/20',
    unselectedBg: 'bg-purple-500/[0.06] hover:bg-purple-500/[0.14]',
    text: 'text-purple-300',
    border: 'border-purple-400/80',
    unselectedBorder: 'border-purple-500/30 hover:border-purple-500/60',
    dot: 'bg-purple-400',
    chip: 'bg-purple-500/20 border-purple-500/40 text-purple-200',
    badge: 'bg-purple-500/30 text-purple-200 border-purple-400/40',
    unselectedBadge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  'Photo Editor': {
    bg: 'bg-emerald-500/20',
    unselectedBg: 'bg-emerald-500/[0.06] hover:bg-emerald-500/[0.14]',
    text: 'text-emerald-300',
    border: 'border-emerald-400/80',
    unselectedBorder: 'border-emerald-500/30 hover:border-emerald-500/60',
    dot: 'bg-emerald-400',
    chip: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200',
    badge: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40',
    unselectedBadge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  Editor: {
    bg: 'bg-emerald-500/20',
    unselectedBg: 'bg-emerald-500/[0.06] hover:bg-emerald-500/[0.14]',
    text: 'text-emerald-300',
    border: 'border-emerald-400/80',
    unselectedBorder: 'border-emerald-500/30 hover:border-emerald-500/60',
    dot: 'bg-emerald-400',
    chip: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200',
    badge: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40',
    unselectedBadge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  'Drone Operator': {
    bg: 'bg-amber-500/20',
    unselectedBg: 'bg-amber-500/[0.06] hover:bg-amber-500/[0.14]',
    text: 'text-amber-300',
    border: 'border-amber-400/80',
    unselectedBorder: 'border-amber-500/30 hover:border-amber-500/60',
    dot: 'bg-amber-400',
    chip: 'bg-amber-500/20 border-amber-500/40 text-amber-200',
    badge: 'bg-amber-500/30 text-amber-200 border-amber-400/40',
    unselectedBadge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  Assistant: {
    bg: 'bg-rose-500/20',
    unselectedBg: 'bg-rose-500/[0.06] hover:bg-rose-500/[0.14]',
    text: 'text-rose-300',
    border: 'border-rose-400/80',
    unselectedBorder: 'border-rose-500/30 hover:border-rose-500/60',
    dot: 'bg-rose-400',
    chip: 'bg-rose-500/20 border-rose-500/40 text-rose-200',
    badge: 'bg-rose-500/30 text-rose-200 border-rose-400/40',
    unselectedBadge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
  Others: {
    bg: 'bg-[#d8c3a5]/20',
    unselectedBg: 'bg-[#d8c3a5]/[0.06] hover:bg-[#d8c3a5]/[0.14]',
    text: 'text-[#d8c3a5]',
    border: 'border-[#d8c3a5]',
    unselectedBorder: 'border-[#d8c3a5]/30 hover:border-[#d8c3a5]/60',
    dot: 'bg-[#d8c3a5]',
    chip: 'bg-[#d8c3a5]/20 border-[#d8c3a5]/40 text-[#d8c3a5]',
    badge: 'bg-[#d8c3a5]/30 text-[#d8c3a5] border-[#d8c3a5]/40',
    unselectedBadge: 'bg-[#d8c3a5]/15 text-[#d8c3a5] border-[#d8c3a5]/30',
  },
};

function getRoleStyle(role: string = '') {
  const r = (role || '').trim();
  const directMatch = Object.keys(ROLE_STYLES).find(k => k.toLowerCase() === r.toLowerCase());
  if (directMatch && ROLE_STYLES[directMatch]) return ROLE_STYLES[directMatch];

  const lower = r.toLowerCase();
  if (lower.includes('cine')) return ROLE_STYLES['Cinematographer'];
  if (lower.includes('photo') && lower.includes('edit')) return ROLE_STYLES['Photo Editor'];
  if (lower.includes('edit')) return ROLE_STYLES['Editor'];
  if (lower.includes('photo')) return ROLE_STYLES['Photographer'];
  if (lower.includes('drone')) return ROLE_STYLES['Drone Operator'];
  if (lower.includes('assist')) return ROLE_STYLES['Assistant'];
  return ROLE_STYLES['Others'];
}

/** Format a date string as "02 October 2026" */
function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function AdminBookingDetail({ params }: { params: { id: string } }) {
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetchBooking();
    fetchPackages();
    fetchTeamMembers();
  }, [params.id]);

  const fetchPackages = async () => {
    try {
      const data = await api.get('/packages');
      setPackages(Array.isArray(data) ? data : (data.packages || []));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const data = await api.get('/admin/team');
      setTeamMembers(data.team || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBooking = async () => {
    try {
      const data = await api.get(`/admin/bookings/${params.id}`);
      // Ensure assigned_team_members is an array
      if (!data.assigned_team_members) data.assigned_team_members = [];
      setBooking(data);
      window.dispatchEvent(new Event('reload_notifications'));
    } catch (err: any) {
      setError(err.message || 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    setSaving(true);
    try {
      await api.put(`/admin/bookings/${booking.id}`, booking);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update booking');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? Number(value) : value;
    setBooking(prev => {
      if (!prev) return null;
      const updated = { ...prev, [name]: val };
      if (name === 'total_amount' || name === 'discount') {
        updated.final_amount = (updated.total_amount || 0) - (updated.discount || 0);
      }
      return updated as BookingDetail;
    });
  };

  const handleEventChange = (index: number, field: string, value: any) => {
    setBooking(prev => {
      if (!prev) return prev;
      const newEvents = [...prev.events];
      const ev = { ...newEvents[index] };
      
      if (field.startsWith('team.')) {
        const teamField = field.split('.')[1];
        if (!ev.team_requirements) {
          ev.team_requirements = {};
        }
        ev.team_requirements = { ...ev.team_requirements, [teamField]: value };
      } else {
        ev[field] = value;
        
        if (field === 'package_id') {
          const pkg = packages.find(p => p.id === value);
          if (pkg && (pkg as any).team_requirements) {
            ev.team_requirements = { ...(pkg as any).team_requirements };
          }
        }
      }
      
      newEvents[index] = ev;
      return { ...prev, events: newEvents };
    });
  };

  const toggleEventTeamMember = (eventIndex: number, memberId: number) => {
    setBooking(prev => {
      if (!prev) return prev;
      const newEvents = [...prev.events];
      const ev = { ...newEvents[eventIndex] };
      const current = ev.assigned_team_members || [];
      const exists = current.includes(memberId);
      ev.assigned_team_members = exists
        ? current.filter((id: number) => id !== memberId)
        : [...current, memberId];
      newEvents[eventIndex] = ev;
      return { ...prev, events: newEvents };
    });
  };


  if (loading) return (
    <div className="flex items-center justify-center h-60">
      <Loader2 className="w-7 h-7 animate-spin text-[#d8c3a5]" />
    </div>
  );

  if (error || !booking) return (
    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-xl">{error || 'Booking not found'}</div>
  );

  const due = (booking.final_amount || 0) - (booking.advance_paid || 0);
  const assignedMembers = teamMembers.filter(m => (booking.assigned_team_members || []).includes(m.id));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/bookings" className="w-10 h-10 rounded-full bg-[#161616] border border-white/5 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl text-white mb-1">Booking #{booking.booking_number || booking.id}</h1>
            <p className="text-sm text-white/40">{booking.groom_name} & {booking.bride_name} — {booking.client_username} • {booking.client_email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/admin/bookings/${booking.id}/documents`} className="flex items-center gap-2 bg-[#161616] border border-white/10 text-white/80 px-4 py-2.5 rounded-lg text-xs uppercase tracking-widest hover:text-white hover:border-[#d8c3a5]/50 transition-all">
            <FileText className="w-4 h-4" /> Documents
          </Link>
          <button onClick={handleSave} disabled={saving} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest font-medium transition-colors disabled:opacity-50 ${saved ? 'bg-green-500 text-white' : 'bg-[#d8c3a5] text-black hover:bg-white'}`}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        <div className="bg-[#161616] border border-white/5 rounded-xl p-8">
          <h2 className="text-[#d8c3a5] font-serif text-xl mb-6">Workflow & Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={LBL}>Booking Status</label>
              <select name="status" value={booking.status} onChange={handleChange} className={INP}>
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div>
              <label className={LBL}>Payment Status</label>
              <select name="payment_status" value={booking.payment_status} onChange={handleChange} className={INP}>
                <option value="UNPAID">UNPAID</option>
                <option value="PARTIAL">PARTIAL</option>
                <option value="PAID">PAID</option>
                <option value="OVERDUE">OVERDUE</option>
              </select>
            </div>
            <div>
              <label className={LBL}>Workflow Status (Custom)</label>
              <input type="text" name="workflow_status" value={booking.workflow_status || ''} onChange={handleChange} className={INP} placeholder="e.g. Shooting, Editing, Delivering" />
            </div>
          </div>
        </div>

        <div className="bg-[#161616] border border-white/5 rounded-xl p-8">
          <h2 className="text-[#d8c3a5] font-serif text-xl mb-2">Financials</h2>
          <p className="text-white/30 text-xs mb-6">Balance Due: <span className={due > 0 ? 'text-orange-400 font-semibold' : 'text-green-400 font-semibold'}>৳ {due.toLocaleString()}</span></p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className={LBL}>Total Amount (৳)</label>
              <input type="number" name="total_amount" value={booking.total_amount || 0} onChange={handleChange} className={INP} />
            </div>
            <div>
              <label className={LBL}>Advance Paid (৳)</label>
              <input type="number" name="advance_paid" value={booking.advance_paid || 0} onChange={handleChange} className={INP} />
            </div>
            <div>
              <label className={LBL}>Discount (৳)</label>
              <input type="number" name="discount" value={booking.discount || 0} onChange={handleChange} className={INP} />
            </div>
            <div>
              <label className={LBL}>Final Amount (৳)</label>
              <input type="number" name="final_amount" value={booking.final_amount || 0} onChange={handleChange} className={INP} />
            </div>
          </div>
        </div>


        <div className="bg-[#161616] border border-white/5 rounded-xl p-8">
          <h2 className="text-[#d8c3a5] font-serif text-xl mb-6">Client Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={LBL}>Client Name</label>
              <input type="text" name="client_name" value={booking.client_name || ''} onChange={handleChange} className={INP} />
            </div>
            <div>
              <label className={LBL}>Client Phone / WhatsApp</label>
              <input type="text" name="client_phone" value={booking.client_phone || ''} onChange={handleChange} className={INP} />
            </div>
            <div className="md:col-span-2">
              <label className={LBL}>Client Address</label>
              <input type="text" name="client_address" value={booking.client_address || ''} onChange={handleChange} className={INP} />
            </div>
            <div>
              <label className={LBL}>Groom Name</label>
              <input type="text" name="groom_name" value={booking.groom_name || ''} onChange={handleChange} className={INP} />
            </div>
            <div>
              <label className={LBL}>Bride Name</label>
              <input type="text" name="bride_name" value={booking.bride_name || ''} onChange={handleChange} className={INP} />
            </div>
            <div className="md:col-span-2">
              <label className={LBL}>Contact Info (Full)</label>
              <textarea name="contact_info" value={booking.contact_info || ''} onChange={handleChange} className={INP} rows={3} placeholder="Phone, WhatsApp, Address..." />
            </div>
            <div>
              <label className={LBL}>District (Submitted by Client)</label>
              <input type="text" name="district" value={booking.district || ''} onChange={handleChange} className={INP} />
            </div>
            <div className="md:col-span-2">
              <label className={LBL}>Specific Requirements / Additional (Submitted by Client)</label>
              <textarea name="event_details" value={booking.event_details || ''} onChange={handleChange} className={INP} rows={3} />
            </div>
            <div className="md:col-span-2">
              <label className={LBL}>Any Other Instruction (Payment/Booking - Submitted by Client)</label>
              <textarea name="payment_notes" readOnly value={booking.payment_notes || ''} className={INP + ' opacity-60 cursor-default'} rows={2} />
            </div>
            {booking.payment_method && (
              <div>
                <label className={LBL}>Payment Method (Submitted)</label>
                <input type="text" readOnly value={booking.payment_method || ''} className={INP + ' opacity-60 cursor-default'} />
              </div>
            )}
            {booking.payment_transaction_id && (
              <div>
                <label className={LBL}>Transaction ID / Sent Number (Submitted)</label>
                <input type="text" readOnly value={booking.payment_transaction_id || ''} className={INP + ' opacity-60 cursor-default'} />
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#161616] border border-white/5 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-5 h-5 text-[#d8c3a5]" />
            <h2 className="text-[#d8c3a5] font-serif text-xl">Delivery</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={LBL}>Delivery Status</label>
              <select name="delivery_status" value={booking.delivery_status || 'Not Started'} onChange={handleChange} className={INP}>
                <option value="Not Started">Not Started</option>
                <option value="Processing">Processing (Editing)</option>
                <option value="Ready">Ready for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={LBL}>Delivery Link (Google Drive / WeTransfer / Dropbox)</label>
              <div className="flex gap-2">
                <input type="url" name="delivery_link" value={booking.delivery_link || ''} onChange={handleChange} className={INP} placeholder="https://drive.google.com/..." />
                {booking.delivery_link && (
                  <a href={booking.delivery_link} target="_blank" rel="noreferrer" className="flex-shrink-0 flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 px-4 rounded-lg transition-colors text-xs whitespace-nowrap">
                    <Link2 className="w-4 h-4" /> Test
                  </a>
                )}
              </div>
            </div>
            <div className="md:col-span-3">
              <label className={LBL}>Deliverables (For Agreement Paper)</label>
              <textarea 
                name="deliverables" 
                value={booking.deliverables || ''} 
                onChange={handleChange} 
                className={INP} 
                rows={4} 
                placeholder={"• All photos fully edited.\n• One highlight trailer.\n• One full-length wedding film"} 
              />
            </div>
          </div>
        </div>

        <div className="bg-[#161616] border border-white/5 rounded-xl p-8">
          <h2 className="text-[#d8c3a5] font-serif text-xl mb-6">Events ({booking.events.length})</h2>
          <div className="space-y-6">
            {booking.events.map((ev, i) => (
              <div key={i} className="p-5 border border-white/5 rounded-xl bg-white/5 space-y-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-white/50 text-xs uppercase tracking-widest font-bold">
                    Event {i + 1}
                  </h3>
                  <div className="grid grid-cols-1 gap-4 border-b border-white/5 pb-4">
                    <div>
                      <label className={LBL}>Selected Package</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={packages.find(p => p.id == (ev.package_id || booking.package_id))?.name || ev.package_name || '(Inherit Booking Package)'} 
                        className={INP + ' opacity-60 cursor-default'} 
                      />
                    </div>
                  </div>
                  
                  <div className="border-b border-white/5 pb-4">
                    <h4 className="text-[#d8c3a5] text-xs uppercase tracking-widest font-semibold mb-3">Team Requirement (Count)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className={LBL}>Chief Photo</label>
                        <input type="number" min="0" value={ev.team_requirements?.chief_photographer || 0} onChange={(e) => handleEventChange(i, 'team.chief_photographer', parseInt(e.target.value) || 0)} className={INP} />
                      </div>
                      <div>
                        <label className={LBL}>Top Photo</label>
                        <input type="number" min="0" value={ev.team_requirements?.top_photographer || 0} onChange={(e) => handleEventChange(i, 'team.top_photographer', parseInt(e.target.value) || 0)} className={INP} />
                      </div>
                      <div>
                        <label className={LBL}>Senior Photo</label>
                        <input type="number" min="0" value={ev.team_requirements?.senior_photographer || 0} onChange={(e) => handleEventChange(i, 'team.senior_photographer', parseInt(e.target.value) || 0)} className={INP} />
                      </div>
                      <div>
                        <label className={LBL}>Chief Cine</label>
                        <input type="number" min="0" value={ev.team_requirements?.chief_cinematographer || 0} onChange={(e) => handleEventChange(i, 'team.chief_cinematographer', parseInt(e.target.value) || 0)} className={INP} />
                      </div>
                      <div>
                        <label className={LBL}>Top Cine</label>
                        <input type="number" min="0" value={ev.team_requirements?.top_cinematographer || 0} onChange={(e) => handleEventChange(i, 'team.top_cinematographer', parseInt(e.target.value) || 0)} className={INP} />
                      </div>
                      <div>
                        <label className={LBL}>Senior Cine</label>
                        <input type="number" min="0" value={ev.team_requirements?.senior_cinematographer || 0} onChange={(e) => handleEventChange(i, 'team.senior_cinematographer', parseInt(e.target.value) || 0)} className={INP} />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <input type="checkbox" id={`drone-${i}`} checked={ev.team_requirements?.drone || false} onChange={(e) => handleEventChange(i, 'team.drone', e.target.checked)} className="w-4 h-4 accent-[#d8c3a5]" />
                        <label htmlFor={`drone-${i}`} className="text-sm text-white/70">Drone</label>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Team Members for this Event */}
                  <div className="border-b border-white/5 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[#d8c3a5] text-xs uppercase tracking-widest font-semibold">Assigned Team Members</h4>
                      <span className="text-[11px] text-white/40">
                        {teamMembers.filter(m => (ev.assigned_team_members || []).includes(m.id)).length} assigned
                      </span>
                    </div>
                    
                    {/* Currently assigned chips */}
                    {teamMembers.filter(m => (ev.assigned_team_members || []).includes(m.id)).length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {teamMembers.filter(m => (ev.assigned_team_members || []).includes(m.id)).map(m => {
                          const style = getRoleStyle(m.role);
                          return (
                            <span 
                              key={m.id} 
                              className={`inline-flex items-center gap-1.5 border text-xs px-3 py-1.5 rounded-full shadow-sm transition-all ${style.chip}`}
                            >
                              <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                              <span className="font-semibold text-white/95">{m.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-normal ${style.badge}`}>
                                {m.role}
                              </span>
                              <button 
                                type="button" 
                                onClick={() => toggleEventTeamMember(i, m.id)} 
                                className="ml-1 opacity-60 hover:opacity-100 hover:text-red-400 transition-colors p-0.5 rounded-full hover:bg-white/10"
                                title="Remove team member"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* All team members selection grid */}
                    <div className="max-h-64 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                      {teamMembers.map(m => {
                        const isAssigned = (ev.assigned_team_members || []).includes(m.id);
                        const style = getRoleStyle(m.role);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => toggleEventTeamMember(i, m.id)}
                            className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all relative group ${
                              isAssigned 
                                ? `${style.bg} ${style.border} ring-2 ring-white/20 shadow-md` 
                                : `${style.unselectedBg} ${style.unselectedBorder}`
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1.5">
                              <span className={`font-medium text-xs truncate ${isAssigned ? 'text-white font-semibold' : 'text-white/90 group-hover:text-white'}`}>
                                {m.name}
                              </span>
                              {isAssigned ? (
                                <span className={`flex-shrink-0 flex items-center justify-center w-4 h-4 rounded-full ${style.dot} text-black ml-1 shadow-sm`}>
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </span>
                              ) : (
                                <span className={`flex-shrink-0 w-2 h-2 rounded-full ${style.dot} opacity-60 ml-1`} />
                              )}
                            </div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                              isAssigned 
                                ? style.badge 
                                : style.unselectedBadge
                            }`}>
                              {m.role}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className={LBL}>Date</label>
                    <input type="date" value={(ev.event_date || ev.date || '').substring(0, 10)} onChange={(e) => handleEventChange(i, 'event_date', e.target.value)} className={INP + ' [color-scheme:dark]'} />
                  </div>
                  <div>
                    <label className={LBL}>Type</label>
                    <input type="text" value={ev.event_type || ''} onChange={(e) => handleEventChange(i, 'event_type', e.target.value)} className={INP} />
                  </div>
                  <div>
                    <label className={LBL}>Start Time</label>
                    <input type="time" value={ev.start_time || ''} onChange={(e) => handleEventChange(i, 'start_time', e.target.value)} className={INP + ' [color-scheme:dark]'} />
                  </div>
                  <div>
                    <label className={LBL}>End Time</label>
                    <input type="time" value={ev.end_time || ''} onChange={(e) => handleEventChange(i, 'end_time', e.target.value)} className={INP + ' [color-scheme:dark]'} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={LBL}>Venue</label>
                    <input type="text" value={ev.venue || ''} onChange={(e) => handleEventChange(i, 'venue', e.target.value)} className={INP} />
                  </div>
                  <div className="md:col-span-1">
                    <label className={LBL}>Location</label>
                    <input type="text" value={ev.location || ''} onChange={(e) => handleEventChange(i, 'location', e.target.value)} className={INP} />
                  </div>
                  <div className="md:col-span-1">
                    <label className={LBL}>Guests</label>
                    <input type="number" value={ev.guest_count || ''} onChange={(e) => handleEventChange(i, 'guest_count', e.target.value)} className={INP} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </form>
    </div>
  );
}
