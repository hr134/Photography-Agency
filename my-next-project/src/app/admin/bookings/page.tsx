'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Loader2, ChevronDown, Eye } from 'lucide-react';

interface BookingEvent {
  id: number;
  event_type: string;
  event_date: string;
  venue: string;
  package_id: number;
  package_name: string;
  team_requirements: Record<string, any>;
  package_team_requirements: Record<string, any>;
}

interface Booking {
  id: number;
  booking_number?: string;
  client_email: string;
  client_username: string;
  client_name: string;
  client_phone: string;
  package_name: string;
  event_date: string;
  status: string;
  total_amount: number;
  advance_paid: number;
  final_amount: number;
  discount: number;
  due_amount: number;
  created_at: string;
  is_read: boolean;
  events: BookingEvent[];
}

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  CONFIRMED: 'text-green-400 bg-green-400/10 border-green-400/20',
  COMPLETED: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  CANCELLED: 'text-red-400 bg-red-400/10 border-red-400/20',
};

/** Format a date string as "02 October 2026" */
function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/bookings');
      setBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      await api.put(`/admin/bookings/${bookingId}`, { status: newStatus });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-60">
      <Loader2 className="w-7 h-7 animate-spin text-[#d8c3a5]" />
    </div>
  );

  if (error) return (
    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-xl">{error}</div>
  );

  // Sort oldest→newest to assign serial numbers correctly (oldest = SL #1)
  const chronological = [...bookings].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  // Display newest on top (reverse of chronological)
  const sortedBookings = [...chronological].reverse().map((booking, displayIndex) => ({
    ...booking,
    _serial: chronological.length - displayIndex, // newest gets highest SL number
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-white mb-1">Bookings</h1>
        <p className="text-sm text-white/40">View and manage all client bookings</p>
      </div>

      {sortedBookings.length === 0 ? (
        <div className="bg-[#161616] border border-white/5 rounded-xl p-12 text-center text-white/40">
          No bookings yet.
        </div>
      ) : (
        <div className="bg-[#161616] border border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-white/30 font-normal">SL No.</th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-white/30 font-normal">Client</th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-white/30 font-normal">Package</th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-white/30 font-normal">Event Date</th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-white/30 font-normal">Amount</th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-white/30 font-normal">Advance</th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-white/30 font-normal">Due</th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-white/30 font-normal">Status</th>
                  <th className="text-right px-6 py-4 text-xs uppercase tracking-widest text-white/30 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedBookings.map((booking) => {
                  const events = booking.events || [];
                  const sortedEvents = [...events].sort((a, b) => new Date(a.event_date || 0).getTime() - new Date(b.event_date || 0).getTime());
                  const isUnread = !booking.is_read && booking.status === 'PENDING';
                  
                  // Compute due: prefer backend due_amount if available
                  const finalAmt = booking.final_amount || booking.total_amount || 0;
                  const due = booking.due_amount !== undefined
                    ? booking.due_amount
                    : finalAmt - (booking.advance_paid || 0);
                  
                  return (
                  <tr key={booking.id} className={`hover:bg-white/5 transition-colors group ${isUnread ? 'bg-[#d8c3a5]/5 border-l-2 border-l-[#d8c3a5]' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="font-mono text-[#d8c3a5] text-xs px-2 py-1 bg-[#d8c3a5]/10 rounded border border-[#d8c3a5]/20">
                          {(booking as any)._serial}
                        </span>
                        {booking.booking_number && (
                          <span className="font-mono text-[#d8c3a5]/60 text-[10px]" title={booking.booking_number}>
                            {booking.booking_number.slice(-6)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {isUnread && <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#d8c3a5] animate-pulse" title="New unread booking" />}
                        <p className="text-white font-medium">{booking.client_username}</p>
                      </div>
                      {booking.client_name && (
                        <p className="text-white/70 text-xs mt-1">
                          {booking.client_name}
                          {booking.created_at ? ` — ${fmtDate(booking.created_at)}` : ''}
                        </p>
                      )}
                      {booking.client_phone && <p className="text-white/50 text-xs">{booking.client_phone}</p>}
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {sortedEvents.length > 0 ? (
                        <div className="space-y-2">
                          {sortedEvents.map((ev, i) => {
                            const reqs = ev.team_requirements || ev.package_team_requirements || {};
                            const team = Object.entries(reqs)
                                .filter(([k, v]) => v && Number(v) > 0 && k !== 'drone')
                                .map(([k, v]) => {
                                  const parts = k.replace(/_/g, ' ').split(' ');
                                  const label = parts.length >= 2
                                    ? `${parts[0]} ${parts[1].substring(0, 3)}`
                                    : k.substring(0, 8);
                                  return `${label}:${v}`;
                                })
                                .join(', ');
                            return (
                              <div key={i} className="text-xs">
                                <span className="font-medium text-white/90">{ev.package_name || booking.package_name}</span>
                                {team && <span className="text-white/40 ml-1">({team})</span>}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        booking.package_name
                      )}
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {sortedEvents.length > 0 ? (
                        <div className="space-y-1">
                          {sortedEvents.map((ev, i) => (
                            <div key={i} className="text-xs">
                              {fmtDate(ev.event_date)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        fmtDate(booking.event_date)
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#d8c3a5]">৳ {(booking.total_amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-green-400">৳ {(booking.advance_paid || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold text-sm ${due > 0 ? 'text-orange-400' : due < 0 ? 'text-purple-400' : 'text-green-400'}`}>
                        ৳ {due.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative inline-flex items-center">
                        <select
                          value={booking.status}
                          onChange={e => handleStatusChange(booking.id, e.target.value)}
                          disabled={updatingId === booking.id}
                          className={`appearance-none border rounded-md pl-3 pr-8 py-1.5 text-xs uppercase tracking-widest font-medium cursor-pointer
                            bg-transparent transition-all focus:outline-none focus:ring-1 focus:ring-[#d8c3a5]/30
                            ${STATUS_STYLES[booking.status] || 'text-white/50 bg-white/5 border-white/10'}
                            disabled:opacity-50`}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s} className="bg-[#1a1a1a] text-white">{s}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 w-3 h-3 pointer-events-none opacity-50" />
                        {updatingId === booking.id && (
                          <Loader2 className="ml-2 w-3 h-3 animate-spin text-[#d8c3a5]" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest bg-white/5 hover:bg-[#d8c3a5] hover:text-black px-3 py-1.5 rounded text-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </Link>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
