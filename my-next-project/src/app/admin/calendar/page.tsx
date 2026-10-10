'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Loader2, ChevronLeft, ChevronRight, CalendarDays, X, Copy, Check } from 'lucide-react';

interface AssignedTeamMember {
  id: number;
  name: string;
  role: string;
}

interface CalendarEvent {
  booking_id: number;
  booking_number: string;
  client_name: string;
  client_username: string;
  client_phone: string;
  groom_name: string;
  bride_name: string;
  event_type: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  location: string;
  package_name: string;
  status: string;
  payment_status: string;
  total_amount: number;
  advance_paid: number;
  due_amount: number;
  assigned_team: AssignedTeamMember[];
}

const EVENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Wedding:        { bg: 'bg-rose-500/20',    text: 'text-rose-300',    border: 'border-rose-500/40' },
  Holud:          { bg: 'bg-yellow-500/20',  text: 'text-yellow-300',  border: 'border-yellow-500/40' },
  Reception:      { bg: 'bg-purple-500/20',  text: 'text-purple-300',  border: 'border-purple-500/40' },
  Engagement:     { bg: 'bg-pink-500/20',    text: 'text-pink-300',    border: 'border-pink-500/40' },
  Nikah:          { bg: 'bg-green-500/20',   text: 'text-green-300',   border: 'border-green-500/40' },
  'Pre-Wedding':  { bg: 'bg-sky-500/20',     text: 'text-sky-300',     border: 'border-sky-500/40' },
  'Post-Wedding': { bg: 'bg-indigo-500/20',  text: 'text-indigo-300',  border: 'border-indigo-500/40' },
  Birthday:       { bg: 'bg-orange-500/20',  text: 'text-orange-300',  border: 'border-orange-500/40' },
  Corporate:      { bg: 'bg-blue-500/20',    text: 'text-blue-300',    border: 'border-blue-500/40' },
  Outdoor:        { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/40' },
  Default:        { bg: 'bg-[#d8c3a5]/20',   text: 'text-[#d8c3a5]',  border: 'border-[#d8c3a5]/40' },
};

const STATUS_DOT: Record<string, string> = {
  PENDING:   'bg-yellow-400',
  CONFIRMED: 'bg-green-400',
  COMPLETED: 'bg-blue-400',
  CANCELLED: 'bg-red-400',
};

/** Format "02 October 2026" */
function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

function DigitalClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="bg-[#161616] border border-white/5 rounded-2xl p-5 mb-4 text-center">
      <div className="text-3xl font-light text-white tracking-widest">
        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
      </div>
      <div className="text-xs text-white/50 uppercase tracking-widest mt-1">
        {fmtDate(time.toISOString().substring(0, 10))} — {time.toLocaleDateString('en-US', { weekday: 'long' })}
      </div>
    </div>
  );
}

function getColor(eventType: string) {
  return EVENT_COLORS[eventType] || EVENT_COLORS.Default;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

function formatTime(t: string) {
  if (!t) return '';
  try {
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : (hour || 12)}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  } catch { return t; }
}

/** Build a plain-text summary of all events for copying */
function buildCopyText(events: CalendarEvent[], dateStr: string): string {
  const lines: string[] = [];
  lines.push(`📅 Events — ${fmtDate(dateStr)}`);
  lines.push('='.repeat(40));
  events.forEach((ev, i) => {
    lines.push('');
    lines.push(`Event ${i + 1}: ${ev.event_type}`);
    lines.push(`Booking #: ${ev.booking_number}`);
    if (ev.client_name)  lines.push(`Client: ${ev.client_name}`);
    if (ev.client_phone) lines.push(`Phone: ${ev.client_phone}`);
    if (ev.groom_name || ev.bride_name) {
      lines.push(`Couple: ${[ev.groom_name, ev.bride_name].filter(Boolean).join(' & ')}`);
    }
    if (ev.venue || ev.location) {
      lines.push(`Venue: ${[ev.venue, ev.location].filter(Boolean).join(', ')}`);
    }
    if (ev.start_time || ev.end_time) {
      lines.push(`Time: ${formatTime(ev.start_time)}${ev.end_time ? ` – ${formatTime(ev.end_time)}` : ''}`);
    }
    if (ev.package_name) lines.push(`Package: ${ev.package_name}`);
    lines.push(`Status: ${ev.status}`);
    lines.push(`Payment: ${ev.payment_status}`);
    lines.push(`Total: ৳${(ev.total_amount || 0).toLocaleString()}`);
    lines.push(`Advance: ৳${(ev.advance_paid || 0).toLocaleString()}`);
    lines.push(`Due: ৳${(ev.due_amount || 0).toLocaleString()}`);
    if (ev.assigned_team && ev.assigned_team.length > 0) {
      lines.push(`Team: ${ev.assigned_team.map(m => `${m.name} (${m.role})`).join(', ')}`);
    }
    lines.push('─'.repeat(30));
  });
  return lines.join('\n');
}

const ROLE_COLORS: Record<string, string> = {
  Photographer: 'text-blue-300 border-blue-500/40 bg-blue-500/15',
  Cinematographer: 'text-purple-300 border-purple-500/40 bg-purple-500/15',
  'Photo Editor': 'text-emerald-300 border-emerald-500/40 bg-emerald-500/15',
  Editor: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/15',
  'Drone Operator': 'text-amber-300 border-amber-500/40 bg-amber-500/15',
  Assistant: 'text-rose-300 border-rose-500/40 bg-rose-500/15',
  Others: 'text-[#d8c3a5] border-[#d8c3a5]/40 bg-[#d8c3a5]/15',
};

function getRoleColor(role: string = '') {
  const r = (role || '').trim();
  const direct = Object.keys(ROLE_COLORS).find(k => k.toLowerCase() === r.toLowerCase());
  if (direct && ROLE_COLORS[direct]) return ROLE_COLORS[direct];
  const lower = r.toLowerCase();
  if (lower.includes('cine')) return ROLE_COLORS['Cinematographer'];
  if (lower.includes('photo') && lower.includes('edit')) return ROLE_COLORS['Photo Editor'];
  if (lower.includes('edit')) return ROLE_COLORS['Editor'];
  if (lower.includes('photo')) return ROLE_COLORS['Photographer'];
  if (lower.includes('drone')) return ROLE_COLORS['Drone Operator'];
  if (lower.includes('assist')) return ROLE_COLORS['Assistant'];
  return ROLE_COLORS['Others'];
}

export default function AdminCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CalendarEvent[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const data = await api.get('/admin/calendar-events');
      setEvents(data.events || []);
    } catch (err: any) {
      console.error('Failed to load calendar events', err);
    } finally {
      setLoading(false);
    }
  };

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(ev => {
      if (!ev.event_date) return;
      const key = ev.event_date.substring(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    return map;
  }, [events]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const handleDayClick = (day: number | null) => {
    if (!day) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = eventsByDate[dateStr];
    if (dayEvents && dayEvents.length > 0) {
      setSelected(dayEvents);
      setSelectedDate(dateStr);
    } else {
      setSelected(null);
      setSelectedDate(null);
    }
  };

  const handleCopyAll = async () => {
    if (!selected || !selectedDate) return;
    const text = buildCopyText(selected, selectedDate);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + 30);
    return events
      .filter(ev => {
        const d = new Date(ev.event_date);
        return d >= now && d <= future && ev.status !== 'CANCELLED';
      })
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
      .slice(0, 10);
  }, [events]);

  if (loading) return (
    <div className="flex items-center justify-center h-60">
      <Loader2 className="w-7 h-7 animate-spin text-[#d8c3a5]" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl text-white mb-1">Calendar</h1>
          <p className="text-sm text-white/40">All booked events at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white font-medium text-lg min-w-[160px] text-center">{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="xl:col-span-2 bg-[#161616] border border-white/5 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-white/5">
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="py-3 text-center text-xs uppercase tracking-widest text-white/30 font-medium">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
              const dayEvents = day ? (eventsByDate[dateStr] || []) : [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-[90px] border-b border-r border-white/5 p-2 transition-colors ${day ? 'cursor-pointer hover:bg-white/[0.03]' : ''} ${isSelected ? 'bg-[#d8c3a5]/10' : ''}`}
                >
                  {day && (
                    <>
                      <div className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-sm font-medium mb-1 ${isToday ? 'bg-[#d8c3a5] text-black font-bold' : 'text-white/70'}`}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map((ev, i) => {
                          const c = getColor(ev.event_type);
                          return (
                            <div key={i} className={`text-[10px] px-1.5 py-0.5 rounded border ${c.bg} ${c.text} ${c.border} leading-tight`}>
                              <div className="font-semibold truncate">{ev.event_type} – {ev.client_name || ev.client_username}</div>
                              <div className="text-[9px] opacity-80 truncate">📞 {ev.client_phone || 'N/A'}</div>
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && <div className="text-[10px] text-white/40 pl-1">+{dayEvents.length - 3} more</div>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <DigitalClock />

          {/* Day Detail or Upcoming */}
          {selected && selectedDate ? (
            <div className="bg-[#161616] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-medium">
                    {fmtDate(selectedDate)} — {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}
                  </h3>
                  <p className="text-white/40 text-xs">{selected.length} event{selected.length > 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Copy All Button */}
                  <button
                    onClick={handleCopyAll}
                    title="Copy all event details"
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all
                      ${copied
                        ? 'bg-green-500/20 border-green-500/40 text-green-400'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-[#d8c3a5]/10 hover:border-[#d8c3a5]/30 hover:text-[#d8c3a5]'
                      }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy All'}
                  </button>
                  <button onClick={() => { setSelected(null); setSelectedDate(null); }} className="p-1 text-white/30 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {selected.map((ev, i) => {
                  const c = getColor(ev.event_type);
                  const due = ev.due_amount ?? ((ev.total_amount || 0) - (ev.advance_paid || 0));
                  return (
                    <div key={i} className={`rounded-xl border p-4 ${c.bg} ${c.border}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className={`text-xs font-semibold uppercase tracking-widest ${c.text}`}>{ev.event_type}</span>
                          <p className="text-white font-medium text-sm mt-0.5">{ev.client_name || ev.client_username}</p>
                          {(ev.groom_name || ev.bride_name) && (
                            <p className="text-white/60 text-xs">{[ev.groom_name, ev.bride_name].filter(Boolean).join(' & ')}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`w-2 h-2 rounded-full ${STATUS_DOT[ev.status] || 'bg-gray-400'}`} />
                          <span className="text-white/50 text-xs">{ev.status}</span>
                        </div>
                      </div>
                      <p className="text-white/50 text-xs mb-1">📞 {ev.client_phone || 'N/A'}</p>
                      {(ev.venue || ev.location) && <p className="text-white/50 text-xs mb-1">📍 {[ev.venue, ev.location].filter(Boolean).join(', ')}</p>}
                      {(ev.start_time || ev.end_time) && (
                        <p className="text-white/50 text-xs mb-1">🕐 {formatTime(ev.start_time)}{ev.end_time ? ` – ${formatTime(ev.end_time)}` : ''}</p>
                      )}
                      {ev.package_name && <p className="text-white/40 text-xs mb-1">📦 {ev.package_name}</p>}
                      
                      {/* Financial summary */}
                      <div className="mt-2 pt-2 border-t border-white/10 grid grid-cols-3 gap-1 text-xs">
                        <div>
                          <span className="text-white/30 block">Total</span>
                          <span className="text-white/80">৳{(ev.total_amount || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-white/30 block">Advance</span>
                          <span className="text-green-400">৳{(ev.advance_paid || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-white/30 block">Due</span>
                          <span className={due > 0 ? 'text-orange-400 font-semibold' : 'text-green-400 font-semibold'}>
                            ৳{due.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Assigned Team */}
                      {ev.assigned_team && ev.assigned_team.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <p className="text-white/30 text-xs mb-1">👥 Team</p>
                          <div className="flex flex-wrap gap-1">
                            {ev.assigned_team.map(m => {
                              const roleColor = getRoleColor(m.role);
                              return (
                                <span key={m.id} className={`inline-flex items-center gap-1 text-[10px] border rounded-full px-2 py-0.5 ${roleColor}`}>
                                  <span className="font-medium">{m.name}</span>
                                  <span className="opacity-70">({m.role})</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <Link href={`/admin/bookings/${ev.booking_id}`} className="inline-flex items-center gap-1 text-xs text-[#d8c3a5] hover:text-white transition-colors mt-3">
                        View Booking →
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-[#161616] border border-white/5 rounded-2xl p-5">
              <h3 className="text-white/50 text-xs uppercase tracking-widest font-medium mb-4 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" /> Upcoming (30 days)
              </h3>
              {upcomingEvents.length === 0 ? (
                <p className="text-white/30 text-sm">No upcoming events</p>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map((ev, i) => {
                    const c = getColor(ev.event_type);
                    return (
                      <Link key={i} href={`/admin/bookings/${ev.booking_id}`} className={`block rounded-xl border p-3 transition-opacity hover:opacity-80 ${c.bg} ${c.border}`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className={`text-xs font-semibold ${c.text}`}>{ev.event_type}</p>
                            <p className="text-white text-sm font-medium truncate">{ev.client_name || ev.client_username}</p>
                            <p className="text-white/50 text-xs truncate">📞 {ev.client_phone || 'N/A'}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-white/60 text-xs">{fmtDate(ev.event_date)}</p>
                            {ev.start_time && <p className="text-white/40 text-xs">{formatTime(ev.start_time)}</p>}
                            {ev.due_amount > 0 && (
                              <p className="text-orange-400 text-[10px] font-semibold mt-0.5">Due: ৳{ev.due_amount.toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="bg-[#161616] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white/50 text-xs uppercase tracking-widest font-medium mb-3">Event Types</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(EVENT_COLORS).filter(([k]) => k !== 'Default').map(([type, c]) => (
                <div key={type} className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border ${c.bg} ${c.border}`}>
                  <span className={`text-[9px] font-semibold ${c.text}`}>{type}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/5">
              <h3 className="text-white/50 text-xs uppercase tracking-widest font-medium mb-2">Status</h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(STATUS_DOT).map(([s, cls]) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${cls}`} />
                    <span className="text-white/60">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
