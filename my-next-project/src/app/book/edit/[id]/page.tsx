'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Loader2, CheckCircle, ArrowRight, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

interface PackageType {
  id: number;
  name: string;
  price: number;
  team_requirements?: {
    chief_photographer?: number;
    top_photographer?: number;
    senior_photographer?: number;
    chief_cinematographer?: number;
    top_cinematographer?: number;
    senior_cinematographer?: number;
    drone?: boolean;
  };
}

interface EventData {
  event_type: string;
  date: string;
  start_time: string;
  end_time: string;
  venue: string;
  location: string;
  notes: string;
  package_id?: number;
  guest_count?: number;
  is_outdoor?: boolean;
}

/* ─── reusable style tokens ─── */
const LBL = 'block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5';
const INP = 'w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#c9ab84] focus:border-[#c9ab84] transition placeholder:text-gray-400';
const RO = 'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed';
const SEC = 'text-base font-bold text-gray-700 uppercase tracking-widest border-l-4 border-[#c9ab84] pl-3 mb-4';
const CARD = 'bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5';

export default function EditBookingPage({ params }: { params: { id: string } }) {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const bookingId = params.id;

  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  // Dynamic Events
  const [numEvents, setNumEvents] = useState(1);
  const [events, setEvents] = useState<EventData[]>([{
    event_type: '', date: '', start_time: '', end_time: '', venue: '', location: '', notes: '',
    package_id: undefined,
    is_outdoor: false
  }]);

  const [formData, setFormData] = useState({
    package_id: '',
    bride_name: '',
    groom_name: '',
    bride_contact: '',
    groom_contact: '',
    // Client Details
    client_full_name: '',
    client_full_address: '',
    client_primary_phone: '',
    client_alternate_phone: '',
    client_email: '',
    // Misc Event
    district: '',
    extra_hours: 0,
    requirements: '',
    // Payment
    total_final_amount: '',
    advance: '',
    payment_system: '',
    payment_date: '',
    payment_notes: '',
    payment_transaction_id: '',
    // T&C
    agreed_tnc: false,
    // Team
    team_requirements: {
      chief_photographer: 0,
      top_photographer: 0,
      senior_photographer: 0,
      chief_cinematographer: 0,
      top_cinematographer: 0,
      senior_cinematographer: 0,
      drone: false,
    },
  });

  const [agencySettings, setAgencySettings] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const EVENT_TYPES = ['Wedding', 'Holud', 'Reception', 'Engagement', 'Nikah', 'Pre-Wedding', 'Post-Wedding', 'Birthday', 'Corporate', 'Product Shoot', 'Other'];
  const PAYMENT_SYSTEMS = ['Cash / Handcash', 'bKash', 'Nagad', 'Bank Transfer', 'Other'];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/book/edit/${bookingId}`);
    } else if (user) {
      setFormData(prev => ({ ...prev, client_email: user.email || '' }));
    }
  }, [isAuthenticated, authLoading, router, bookingId, user]);

  useEffect(() => {
    const fetchInitData = async () => {
      let loadedPackages: PackageType[] = [];
      try {
        const pkgData = await api.get('/packages/');
        loadedPackages = Array.isArray(pkgData) ? pkgData : (pkgData.packages || []);
        setPackages(loadedPackages);
      } catch (err) {
        console.error('Failed to fetch packages:', err);
      }
      try {
        const settingsData = await api.get('/admin/agency-settings/public');
        setAgencySettings(settingsData);
      } catch (err) {
        console.error('Failed to fetch agency settings:', err);
      }

      if (bookingId) {
        try {
          // In client dashboard we fetch booking from the client endpoint? Oh wait, is there a GET /client/bookings/<id>?
          // The bookings.py route has GET / which returns all user bookings.
          // Let's use the one that gets all and find the right one.
          const bData = await api.get('/bookings/');
          const booking = bData.bookings?.find((b: any) => b.id.toString() === bookingId);
          if (booking) {
            if (booking.status !== 'PENDING') {
              setError("This booking is no longer pending and cannot be edited.");
            } else {
              setFormData({
                package_id: booking.package_id?.toString() || '',
                bride_name: booking.bride_name || '',
                groom_name: booking.groom_name || '',
                bride_contact: '',
                groom_contact: '',
                client_full_name: booking.client_name || '',
                client_full_address: booking.client_address || '',
                client_primary_phone: booking.client_phone || '',
                client_alternate_phone: '',
                client_email: user?.email || '',
                district: booking.district || '',
                extra_hours: booking.extra_hours || 0,
                requirements: booking.event_details || '',
                total_final_amount: booking.total_amount?.toString() || '',
                advance: booking.advance_paid?.toString() || '',
                payment_system: booking.payment_method || '',
                payment_date: '',
                payment_notes: booking.payment_notes || '',
                payment_transaction_id: booking.payment_transaction_id || '',
                agreed_tnc: true,
                team_requirements: typeof booking.team_requirements === 'string' ? JSON.parse(booking.team_requirements) : (booking.team_requirements || {
                  chief_photographer: 0,
                  top_photographer: 0,
                  senior_photographer: 0,
                  chief_cinematographer: 0,
                  top_cinematographer: 0,
                  senior_cinematographer: 0,
                  drone: false,
                }),
              });

              if (booking.events && booking.events.length > 0) {
                setNumEvents(booking.events.length);
                setEvents(booking.events.map((ev: any) => ({
                  event_type: ev.event_type || '',
                  date: ev.event_date ? new Date(ev.event_date).toISOString().split('T')[0] : '',
                  start_time: ev.start_time || '',
                  end_time: ev.end_time || '',
                  venue: ev.venue || '',
                  location: ev.location || '',
                  notes: ev.notes || '',
                  package_id: ev.package_id,
                  guest_count: ev.guest_count || 0,
                  is_outdoor: ev.is_outdoor || false
                })));
              }
            }
          } else {
            setError("Booking not found");
          }
        } catch (err: any) {
          setError(err.message || "Failed to fetch booking details");
        }
      }
      setLoadingPackages(false);
    };
    if (user) {
      fetchInitData();
    }
  }, [user, bookingId]);

  // Update price when package, events, or per-event packages change
  useEffect(() => {
    if (formData.package_id && packages.length > 0) {
      const defaultPkg = packages.find(p => p.id.toString() === formData.package_id.toString());
      if (defaultPkg) {
        let total = 0;

        // Sum price for each event (using event-specific package if selected, else default)
        events.forEach(ev => {
          if (ev.package_id) {
            const evPkg = packages.find(p => p.id === ev.package_id);
            total += evPkg ? evPkg.price : defaultPkg.price;
          } else {
            total += defaultPkg.price;
          }
        });

        const suggestedAdvance = Math.ceil(total * 0.2); // 20%
        setFormData(prev => ({
          ...prev,
          team_requirements: defaultPkg.team_requirements ? {
            chief_photographer: defaultPkg.team_requirements.chief_photographer || 0,
            top_photographer: defaultPkg.team_requirements.top_photographer || 0,
            senior_photographer: defaultPkg.team_requirements.senior_photographer || 0,
            chief_cinematographer: defaultPkg.team_requirements.chief_cinematographer || 0,
            top_cinematographer: defaultPkg.team_requirements.top_cinematographer || 0,
            senior_cinematographer: defaultPkg.team_requirements.senior_cinematographer || 0,
            drone: defaultPkg.team_requirements.drone || false,
          } : prev.team_requirements,
          total_final_amount: total.toString(),
          advance: suggestedAdvance.toString(),
        }));
      }
    }
  }, [formData.package_id, packages, numEvents, events]);

  // Adjust events array size when numEvents changes
  useEffect(() => {
    setEvents(prev => {
      const newEvents = [...prev];
      // Sync first event's package_id with formData.package_id if missing
      if (newEvents.length > 0 && !newEvents[0].package_id && formData.package_id) {
        newEvents[0].package_id = parseInt(formData.package_id);
      }
      const defaultPkgId = newEvents[0]?.package_id;
      while (newEvents.length < numEvents) {
        newEvents.push({ event_type: '', date: '', start_time: '', end_time: '', venue: '', location: '', notes: '', package_id: defaultPkgId });
      }
      return newEvents.slice(0, numEvents);
    });
  }, [numEvents, formData.package_id]);

  const totalFinal = parseFloat(formData.total_final_amount) || 0;
  const advanceAmt = parseFloat(formData.advance) || 0;
  const dueAmount = Math.max(totalFinal - advanceAmt, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEventChange = (index: number, field: keyof EventData, value: any) => {
    setEvents(prev => {
      const newEvents = [...prev];
      newEvents[index] = { ...newEvents[index], [field]: value };

      // If changing the first event's package, sync it to formData.package_id
      if (index === 0 && field === 'package_id') {
        setFormData(fd => ({ ...fd, package_id: value.toString() }));
      }
      return newEvents;
    });
  };

  const copyFromEvent1 = (index: number) => {
    if (events.length > 0) {
      const e1 = events[0];
      setEvents(prev => {
        const newEvents = [...prev];
        newEvents[index] = {
          ...newEvents[index],
          venue: e1.venue,
          location: e1.location
        };
        return newEvents;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bride_name || !formData.groom_name || !formData.client_full_name || !formData.client_primary_phone) {
      setError('Please fill in all required fields (*).');
      return;
    }
    // Check if all events have a package selected
    if (events.some(ev => !ev.package_id)) {
      setError('Please select a package for each event.');
      return;
    }
    // Check if event types are filled
    if (events.some(ev => !ev.event_type)) {
      setError('Please select an event type for each event.');
      return;
    }
    // Check if event dates are filled
    if (events.some(ev => !ev.date)) {
      setError('Please provide dates for all selected events.');
      return;
    }

    // Check for time conflicts between events on the same day
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const e1 = events[i];
        const e2 = events[j];
        if (e1.date && e2.date && e1.date === e2.date && e1.start_time && e1.end_time && e2.start_time && e2.end_time) {
          if ((e1.start_time < e2.end_time) && (e2.start_time < e1.end_time)) {
            setError(`Time conflict detected between Event ${i + 1} and Event ${j + 1}. Please adjust the times.`);
            return;
          }
        }
      }
    }

    if (!formData.agreed_tnc) {
      setError('You must agree to the Terms & Conditions to proceed.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const contact_info = [
        `Client: ${formData.client_full_name}`,
        `Address: ${formData.client_full_address}`,
        `Primary Ph: ${formData.client_primary_phone}`,
        `Alternate Ph: ${formData.client_alternate_phone || 'N/A'}`,
        `Email: ${formData.client_email}`,
        `Bride: ${formData.bride_name} (${formData.bride_contact || 'N/A'})`,
        `Groom: ${formData.groom_name} (${formData.groom_contact || 'N/A'})`,
      ].join('\n');

      const primaryPackageId = events[0].package_id!;
      const payload = {
        package_id: primaryPackageId,
        events: events.map(ev => {
          const pkgId = ev.package_id!;
          const evPkg = packages.find(p => p.id === pkgId);
          return {
            ...ev,
            package_id: pkgId,
            team_requirements: evPkg?.team_requirements || null
          };
        }),
        contact_info,
        groom_name: formData.groom_name,
        bride_name: formData.bride_name,
        client_name: formData.client_full_name,
        client_phone: formData.client_primary_phone,
        client_address: formData.client_full_address,
        district: formData.district,
        extra_hours: parseInt(formData.extra_hours.toString()) || 0,
        team_requirements: formData.team_requirements,
        requirements: formData.requirements,
        total_amount: totalFinal,
        payment_system: formData.payment_system,
        payment_transaction_id: formData.payment_transaction_id,
        payment_notes: formData.payment_notes,
        advance_paid: advanceAmt
      };

      if (bookingId) {
        await api.put(`/bookings/${bookingId}`, payload);
      } else {
        await api.post('/bookings/', payload);
      }

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit booking request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingPackages) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-10 h-10 animate-spin text-[#c9ab84]" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border border-gray-100 rounded-2xl p-10 text-center max-w-md w-full shadow-xl"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-serif text-gray-800 mb-3">Booking Requested!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Thank you for choosing us. Your booking request has been received. We will review the details and confirm your session shortly.
          </p>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-24 bg-[#f5f0ea]">
      <div className="container mx-auto px-4 max-w-3xl">

        {/* Page header */}
        <div className="text-center mb-10">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#c9ab84] font-semibold block mb-2">Book a Session</span>
          <h1 className="font-serif text-3xl md:text-4xl text-gray-800 mb-2">Let's Create Magic</h1>
          <p className="text-gray-500 text-sm">Fill out the details below to request a booking.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── 1. Client Details ── */}
          <div className={CARD}>
            <h2 className={SEC}>Client Details</h2>
            <p className="text-xs text-gray-500 mb-4 -mt-2">Information of the person making this booking.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className={LBL}>Name *</label>
                <input type="text" name="client_full_name" value={formData.client_full_name} onChange={handleChange} required placeholder="Full name of the person booking" className={INP} />
              </div>
              <div className="md:col-span-2">
                <label className={LBL}>Address *</label>
                <textarea name="client_full_address" value={formData.client_full_address} onChange={handleChange} rows={2}
                  placeholder="House, Road, Area, District" className={INP + ' resize-none'} required />
              </div>
              <div>
                <label className={LBL}>WhatsApp / Primary Phone *</label>
                <input type="tel" name="client_primary_phone" value={formData.client_primary_phone} onChange={handleChange} required placeholder="+880 1..." className={INP} />
              </div>
              <div>
                <label className={LBL}>Alternate Phone No. <span className="normal-case text-gray-400 font-normal">(Optional)</span></label>
                <input type="tel" name="client_alternate_phone" value={formData.client_alternate_phone} onChange={handleChange} placeholder="+880 1..." className={INP} />
              </div>
              <div className="md:col-span-2">
                <label className={LBL}>Email Address</label>
                <input type="email" name="client_email" value={formData.client_email} onChange={handleChange} placeholder="your@email.com" className={INP} />
              </div>
            </div>
          </div>

          {/* ── 2. Bride & Groom ── */}
          <div className={CARD}>
            <h2 className={SEC}>Bride &amp; Groom Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bride */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-[#c9ab84] uppercase tracking-widest">Bride</p>
                <div>
                  <label className={LBL}>Full Name *</label>
                  <input type="text" name="bride_name" value={formData.bride_name} onChange={handleChange} required placeholder="Bride's full name" className={INP} />
                </div>
                <div>
                  <label className={LBL}>Contact Number <span className="normal-case text-gray-400 font-normal">(Optional)</span></label>
                  <input type="text" name="bride_contact" value={formData.bride_contact} onChange={handleChange} placeholder="+880 1..." className={INP} />
                </div>
              </div>
              {/* Groom */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-[#c9ab84] uppercase tracking-widest">Groom</p>
                <div>
                  <label className={LBL}>Full Name *</label>
                  <input type="text" name="groom_name" value={formData.groom_name} onChange={handleChange} required placeholder="Groom's full name" className={INP} />
                </div>
                <div>
                  <label className={LBL}>Contact Number <span className="normal-case text-gray-400 font-normal">(Optional)</span></label>
                  <input type="text" name="groom_contact" value={formData.groom_contact} onChange={handleChange} placeholder="+880 1..." className={INP} />
                </div>
              </div>
            </div>
          </div>

          {/* ── 4. Event Details (Dynamic) ── */}
          <div className={CARD}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={SEC + " mb-0"}>Event Details</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-600">Total Events:</label>
                <select value={numEvents} onChange={(e) => setNumEvents(parseInt(e.target.value))} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-black font-medium bg-white outline-none cursor-pointer">
                  {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n} className="text-black">{n}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-8">
              {events.map((ev, idx) => {
                const isCustomPackage = ev.package_id && ev.package_id.toString() !== formData.package_id.toString();
                const currentPkg = isCustomPackage ? packages.find(p => p.id === ev.package_id) : packages.find(p => p.id.toString() === formData.package_id.toString());

                return (
                  <div key={idx} className="relative p-5 bg-gray-50/50 border border-gray-100 rounded-xl space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-[#c9ab84] uppercase tracking-widest">Event {idx + 1}</h3>
                      {idx > 0 && (
                        <button type="button" onClick={() => copyFromEvent1(idx)} className="text-[11px] font-medium text-gray-500 hover:text-[#c9ab84] flex items-center gap-1.5 transition">
                          <Copy className="w-3.5 h-3.5" /> Same as Event 1
                        </button>
                      )}
                    </div>

                    {/* Per-event package selector */}
                    <div className="mb-4 bg-white p-3 rounded-lg border border-gray-200">
                      <label className="block text-[11px] uppercase text-gray-400 mb-1">Package for this event *</label>
                      <select
                        value={ev.package_id || (idx === 0 ? formData.package_id : (events[0].package_id || formData.package_id)) || ''}
                        onChange={(e) => handleEventChange(idx, 'package_id', parseInt(e.target.value))}
                        className="w-full text-sm font-medium text-gray-700 bg-transparent outline-none cursor-pointer mb-2"
                        required
                      >
                        <option value="" disabled>-- Select a Package --</option>
                        {packages.map(pkg => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name} — ৳ {pkg.price.toLocaleString()}
                          </option>
                        ))}
                      </select>
                      {currentPkg?.team_requirements && (
                        <div className="text-xs text-gray-500 border-t border-gray-100 pt-2 flex flex-wrap gap-x-4 gap-y-1">
                          {(currentPkg.team_requirements.chief_photographer ?? 0) > 0 && <span>Chief Photo: {currentPkg.team_requirements.chief_photographer}</span>}
                          {(currentPkg.team_requirements.top_photographer ?? 0) > 0 && <span>Top Photo: {currentPkg.team_requirements.top_photographer}</span>}
                          {(currentPkg.team_requirements.senior_photographer ?? 0) > 0 && <span>Senior Photo: {currentPkg.team_requirements.senior_photographer}</span>}
                          {(currentPkg.team_requirements.chief_cinematographer ?? 0) > 0 && <span>Chief Cine: {currentPkg.team_requirements.chief_cinematographer}</span>}
                          {(currentPkg.team_requirements.top_cinematographer ?? 0) > 0 && <span>Top Cine: {currentPkg.team_requirements.top_cinematographer}</span>}
                          {(currentPkg.team_requirements.senior_cinematographer ?? 0) > 0 && <span>Senior Cine: {currentPkg.team_requirements.senior_cinematographer}</span>}
                          {currentPkg.team_requirements.drone && <span>Drone: Yes</span>}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={LBL}>Event Type *</label>
                        <select value={ev.event_type} onChange={(e) => handleEventChange(idx, 'event_type', e.target.value)} required className={INP}>
                          <option value="">— Select Type —</option>
                          {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={LBL}>Event Date *</label>
                        <input type="date" value={ev.date} onChange={(e) => handleEventChange(idx, 'date', e.target.value)} required className={INP + ' [color-scheme:light]'} />
                      </div>
                      <div>
                        <label className={LBL}>Start Time</label>
                        <input type="time" value={ev.start_time} onChange={(e) => handleEventChange(idx, 'start_time', e.target.value)} className={INP + ' [color-scheme:light]'} />
                      </div>
                      <div>
                        <label className={LBL}>End Time</label>
                        <input type="time" value={ev.end_time} onChange={(e) => handleEventChange(idx, 'end_time', e.target.value)} className={INP + ' [color-scheme:light]'} />
                      </div>
                      <div className="md:col-span-2">
                        <label className={LBL}>Venue Name</label>
                        <input type="text" value={ev.venue} onChange={(e) => handleEventChange(idx, 'venue', e.target.value)} placeholder="e.g. Radisson Blu" className={INP} />
                      </div>
                      <div className="md:col-span-2">
                        <label className={LBL}>Location / Area</label>
                        <input type="text" value={ev.location} onChange={(e) => handleEventChange(idx, 'location', e.target.value)} placeholder="e.g. Gulshan, Dhaka" className={INP} />
                      </div>
                      <div>
                        <label className={LBL}>Guests</label>
                        <input type="number" value={ev.guest_count || ''} onChange={(e) => handleEventChange(idx, 'guest_count', e.target.value as any)} placeholder="Estimated guests" className={INP} />
                      </div>
                      <div className="flex items-center pt-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input type="checkbox" checked={ev.is_outdoor || false} onChange={(e) => handleEventChange(idx, 'is_outdoor', e.target.checked)} className="w-4 h-4 accent-[#c9ab84] cursor-pointer" />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-black transition">Outdoor Event</span>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className={LBL}>District (For outside of Dhaka metropolitan area Transportation + Accommodation & 15% shift charge (Package Price) will be added with package price.)</label>
              <input type="text" name="district" value={formData.district} onChange={handleChange} placeholder="e.g. Chittagong, Sylhet" className={INP} />
            </div>
          </div>

          {/* ── 4. Team Setup Adding More ── */}
          <div className={CARD}>
            <h2 className={SEC}>Team Setup Adding More</h2>
            <p className="text-xs text-gray-400 -mt-2">Team is set by admin based on your package. You may add extra hours or mention specific requirements below.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={LBL}>Extra Hours</label>
                <input type="number" name="extra_hours" min="0" value={formData.extra_hours} onChange={handleChange} placeholder="0" className={INP} />
              </div>
            </div>
            <div>
              <label className={LBL}>Specific Requirements / Additional</label>
              <textarea name="requirements" value={formData.requirements} onChange={handleChange} rows={3}
                placeholder="Any specific shots, styles, or details we should know? Or need extra Photographer, Cinematographer, Drone, Print, Album, Pendrive etc"
                className={INP + ' resize-none'} />
            </div>
          </div>

          {/* Client Details section removed from here as it was moved to top */}

          {/* ── 6. Payment Details ── */}
          <div className={CARD}>
            <h2 className={SEC}>Payment Details</h2>

            {/* Info banner — 20% advance suggestion */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-sm text-amber-700 flex items-start gap-3">
              <span className="text-lg">ℹ️</span>
              <span>A minimum <strong>20% advance</strong> is suggested to confirm your booking. The exact amount will be coordinated by the team. All outstanding dues must be settled on or before the event day.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={LBL}>Total Final Amount (৳)</label>
                <input type="number" name="total_final_amount" value={formData.total_final_amount} onChange={handleChange} min="0" placeholder="0" className={INP} />
              </div>
              <div>
                <label className={LBL}>Advance (৳) <span className="normal-case text-gray-400 font-normal">— 20% </span></label>
                <input type="number" name="advance" value={formData.advance} onChange={handleChange} min="0" placeholder="0" className={INP} />
              </div>
              <div>
                <label className={LBL}>Due Amount (৳)</label>
                <input type="number" readOnly value={dueAmount} className={RO} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={LBL}>Payment System</label>
                <select name="payment_system" value={formData.payment_system} onChange={handleChange} className={INP}>
                  <option value="">— Select payment method —</option>
                  {PAYMENT_SYSTEMS.map(ps => <option key={ps} value={ps}>{ps}</option>)}
                </select>
              </div>

              {/* Dynamic Payment Details Display */}
              {formData.payment_system && formData.payment_system !== 'Cash / Handcash' && formData.payment_system !== 'Other' && (
                <div className="md:col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-4">
                  {formData.payment_system === 'bKash' && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">bKash Number</p>
                        <p className="text-lg font-bold text-gray-800">{agencySettings?.bkash_number || 'N/A'}</p>
                      </div>
                      <button type="button" onClick={() => navigator.clipboard.writeText(agencySettings?.bkash_number || '')} className="p-2 hover:bg-gray-200 rounded-lg transition" title="Copy Number">
                        <Copy className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  )}
                  {formData.payment_system === 'Nagad' && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Nagad Number</p>
                        <p className="text-lg font-bold text-gray-800">{agencySettings?.nagad_number || 'N/A'}</p>
                      </div>
                      <button type="button" onClick={() => navigator.clipboard.writeText(agencySettings?.nagad_number || '')} className="p-2 hover:bg-gray-200 rounded-lg transition" title="Copy Number">
                        <Copy className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  )}
                  {formData.payment_system === 'Bank Transfer' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b pb-1">Bank Option 1</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <p className="text-gray-500">Bank Name:</p>
                          <p className="font-semibold text-gray-800">{agencySettings?.bank_name || 'N/A'}</p>
                          <p className="text-gray-500">Account Name:</p>
                          <p className="font-semibold text-gray-800">{agencySettings?.bank_account_name || 'N/A'}</p>
                          <p className="text-gray-500">Account Number:</p>
                          <p className="font-semibold text-gray-800">{agencySettings?.bank_account_number || 'N/A'}</p>
                          <p className="text-gray-500">Branch:</p>
                          <p className="font-semibold text-gray-800">{agencySettings?.bank_branch || 'N/A'}</p>
                          {agencySettings?.bank_routing && (
                            <>
                              <p className="text-gray-500">Routing:</p>
                              <p className="font-semibold text-gray-800">{agencySettings?.bank_routing}</p>
                            </>
                          )}
                        </div>
                      </div>

                      {(agencySettings?.bank2_name || agencySettings?.bank2_account_number) && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b pb-1">Bank Option 2</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <p className="text-gray-500">Bank Name:</p>
                            <p className="font-semibold text-gray-800">{agencySettings?.bank2_name || 'N/A'}</p>
                            <p className="text-gray-500">Account Name:</p>
                            <p className="font-semibold text-gray-800">{agencySettings?.bank2_account_name || 'N/A'}</p>
                            <p className="text-gray-500">Account Number:</p>
                            <p className="font-semibold text-gray-800">{agencySettings?.bank2_account_number || 'N/A'}</p>
                            <p className="text-gray-500">Branch:</p>
                            <p className="font-semibold text-gray-800">{agencySettings?.bank2_branch || 'N/A'}</p>
                            {agencySettings?.bank2_routing && (
                              <>
                                <p className="text-gray-500">Routing:</p>
                                <p className="font-semibold text-gray-800">{agencySettings?.bank2_routing}</p>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Transaction ID */}
              {(formData.payment_system === 'bKash' || formData.payment_system === 'Nagad' || formData.payment_system === 'Bank Transfer') && (
                <div className="md:col-span-2">
                  <label className={LBL}>
                    {formData.payment_system === 'Bank Transfer' ? 'Bank Reference / Transaction No.' : `${formData.payment_system} Transaction ID or Sent From Number`} *
                  </label>
                  <input type="text" name="payment_transaction_id" value={formData.payment_transaction_id} onChange={handleChange} required placeholder="e.g. 8N3X..." className={INP} />
                </div>
              )}

              <div>
                <label className={LBL}>Payment Date</label>
                <input type="date" name="payment_date" value={formData.payment_date} onChange={handleChange} className={INP + ' [color-scheme:light]'} />
              </div>
            </div>
            <div>
              <label className={LBL}>Any Other Instruction</label>
              <textarea name="payment_notes" value={formData.payment_notes} onChange={handleChange} rows={3}
                placeholder="Any special instructions regarding payment or booking confirmation..."
                className={INP + ' resize-none'} />
            </div>
          </div>

          {/* ── 7. T&C ── */}
          <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" name="agreed_tnc" checked={formData.agreed_tnc} onChange={handleChange}
                className="mt-0.5 w-4 h-4 accent-[#c9ab84] flex-shrink-0 cursor-pointer" />
              <span className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors">
                I certify that I am above 18 years old and I agree to the{' '}
                <a href="/terms" target="_blank" className="text-[#c9ab84] underline underline-offset-2 hover:text-gray-800 transition-colors">Terms &amp; Conditions</a>
                {' '}and{' '}
                <a href="/privacy" target="_blank" className="text-[#c9ab84] underline underline-offset-2 hover:text-gray-800 transition-colors">Privacy Policy</a>.
              </span>
            </label>
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={submitting || !formData.agreed_tnc}
            className="w-full bg-[#c9ab84] text-white font-semibold text-sm tracking-widest uppercase py-4 rounded-xl hover:bg-[#b8956c] active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
            ) : (
              <>Update Booking <ArrowRight className="w-4 h-4" /></>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
