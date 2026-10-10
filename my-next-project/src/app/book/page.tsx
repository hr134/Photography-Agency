'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
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

interface DiscountType {
  id: number;
  package_id: number | null;
  discount_type: 'percent' | 'fixed';
  value: number;
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

function BookForm() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageIdParam = searchParams.get('package_id');

  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [discounts, setDiscounts] = useState<DiscountType[]>([]);
  const [appliedDiscount, setAppliedDiscount] = useState<{ amount: number; label: string; originalTotal: number } | null>(null);

  // Dynamic Events
  const [numEvents, setNumEvents] = useState(1);
  const [events, setEvents] = useState<EventData[]>([{
    event_type: '', date: '', start_time: '', end_time: '', venue: '', location: '', notes: '',
    package_id: packageIdParam ? parseInt(packageIdParam) : undefined,
    is_outdoor: false
  }]);

  const [formData, setFormData] = useState({
    package_id: packageIdParam || '',
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

  const EVENT_TYPES = ['Wedding', 'Holud', 'Reception', 'Engagement', 'Nikah', 'Pre-Wedding', 'Post-Wedding', 'Birthday', 'Corporate', 'Product Shoot', 'Outdoor', 'Other'];
  const PAYMENT_SYSTEMS = ['Cash / Handcash', 'bKash', 'Nagad', 'Bank Transfer', 'Other'];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/book${packageIdParam ? `?package_id=${packageIdParam}` : ''}`);
    } else if (user) {
      setFormData(prev => ({ ...prev, client_email: user.email || '' }));
    }
  }, [isAuthenticated, authLoading, router, packageIdParam, user]);

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const pkgData = await api.get('/packages/');
        const list: PackageType[] = Array.isArray(pkgData) ? pkgData : (pkgData.packages || []);
        setPackages(list);
      } catch (err) {
        console.error('Failed to fetch packages:', err);
      }
      // Agency settings (payment info) - fetch separately with graceful fail
      try {
        const settingsData = await api.get('/admin/agency-settings/public');
        setAgencySettings(settingsData);
      } catch (err) {
        console.error('Failed to fetch agency settings:', err);
      }
      // Fetch active discounts
      try {
        const discountData = await api.get('/admin/discounts/active');
        setDiscounts(discountData.discounts || []);
      } catch (err) {
        console.error('Failed to fetch discounts:', err);
      }
      setLoadingPackages(false);
    };
    fetchInitData();
  }, []);

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

        // Apply best available discount
        const pkgId = parseInt(formData.package_id);
        const specificDiscount = discounts.find(d => d.package_id === pkgId);
        const globalDiscount = discounts.find(d => d.package_id === null);
        const best = specificDiscount || globalDiscount;
        let discountAmount = 0;
        let discountLabel: string | null = null;
        if (best) {
          if (best.discount_type === 'percent') {
            discountAmount = Math.round(total * best.value / 100);
            discountLabel = `${best.value}% discount applied`;
          } else {
            discountAmount = Math.min(best.value, total);
            discountLabel = `৳${best.value.toLocaleString()} discount applied`;
          }
          setAppliedDiscount({ amount: discountAmount, label: discountLabel, originalTotal: total });
        } else {
          setAppliedDiscount(null);
        }

        const finalTotal = Math.max(total - discountAmount, 0);
        const suggestedAdvance = Math.ceil(finalTotal * 0.2); // 20%
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
          total_final_amount: finalTotal.toString(),
          advance: suggestedAdvance.toString(),
        }));
      }
    }
  }, [formData.package_id, packages, numEvents, events, discounts]);

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
      await api.post('/bookings/', {
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
        advance_paid: advanceAmt,
        client_email: formData.client_email
      });

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

                    {/* Inline discount pill — visible immediately when a discount applies */}
                    {appliedDiscount && idx === 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                          🏷️ {appliedDiscount.label}
                        </span>
                        <span className="text-gray-400 text-xs line-through">৳{appliedDiscount.originalTotal.toLocaleString()}</span>
                        <span className="text-emerald-600 font-bold text-sm">→ ৳{(appliedDiscount.originalTotal - appliedDiscount.amount).toLocaleString()}</span>
                      </div>
                    )}

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
              <label className={LBL}>District (For outside of Dhaka metropolitan area: Transportation + Accommodation & 15% shift charge will be added with the final price.)</label>
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
              <span>A minimum <strong>20% advance</strong> is suggested to confirm your booking. All outstanding dues must be settled <strong>on or before the event day.</strong></span>
            </div>

            {/* Discount banner - Premium Design */}
            {appliedDiscount && (
              <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-[0_8px_30px_rgb(16,185,129,0.12)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(16,185,129,0.2)]">
                {/* Decorative background accent */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>

                {/* Animated shimmer stripe */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />

                {/* Top ribbon */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-yellow-300 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    <span className="text-white text-xs font-bold tracking-widest uppercase">Special Offer Applied</span>
                  </div>
                  <span className="text-emerald-100 text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">{appliedDiscount.label}</span>
                </div>

                <div className="px-6 py-5 relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">New Total Price</p>
                    <div className="flex items-end gap-3 flex-wrap">
                      <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-700 tracking-tight">
                        ৳{(appliedDiscount.originalTotal - appliedDiscount.amount).toLocaleString()}
                      </span>
                      <span className="text-gray-400 text-sm line-through decoration-red-500/40 decoration-2 mb-1">৳{appliedDiscount.originalTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm border border-emerald-200/50 rounded-xl px-4 py-3 shadow-sm self-start sm:self-center">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-0.5">Total Savings</p>
                      <p className="text-xl font-black text-emerald-600">৳{appliedDiscount.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
              <>Confirm Booking Request <ArrowRight className="w-4 h-4" /></>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9ab84]" />
      </div>
    }>
      <BookForm />
    </Suspense>
  );
}
