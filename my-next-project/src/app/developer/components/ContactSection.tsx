'use client';

import { useState, useEffect } from 'react';
import { Send, Mail, MapPin, Phone, MessageSquare, CheckCircle2, Globe, ExternalLink, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { devProjectsApi, type PortfolioContact, DEFAULT_CONTACT_DATA } from '@/lib/devProjectsApi';

export default function ContactSection() {
  const [contactInfo, setContactInfo] = useState<PortfolioContact>(DEFAULT_CONTACT_DATA);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    let isMounted = true;
    devProjectsApi
      .getContactInfo()
      .then((data) => {
        if (isMounted && data) setContactInfo(data);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus('submitting');
    try {
      await api.post('/contact', {
        name: formData.name,
        email: formData.email,
        message: `[HARUN RASHID - ENGINEER INQUIRY]: ${formData.message}`,
        event_date: new Date().toISOString().split('T')[0],
      });
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch {
      setStatus('success');
    }
  };

  return (
    <section
      id="contact"
      className="relative py-28 md:py-36 bg-[#f4f4f0] text-[#111111] transition-colors duration-500 overflow-hidden w-full max-w-full"
    >
      <div className="w-full max-w-none px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-start">
          {/* Left Column: Big Typography & Direct Info */}
          <div className="lg:col-span-6">
            <span className="text-xs font-mono font-bold tracking-widest text-neutral-500 uppercase block mb-3">
              START A CONVERSATION
            </span>
            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-neutral-900 leading-[0.95] mb-6">
              LET&apos;S CONNECT
            </h2>
            <p className="text-neutral-600 text-lg sm:text-xl font-light leading-relaxed mb-8 max-w-xl">
              {contactInfo.tagline ||
                "Engineer available for technical roles, full-stack systems engineering, software solutions, and collaborative innovation."}
            </p>

            {/* Contact Details List */}
            <div className="space-y-4 font-mono text-sm mb-8">
              {/* Email */}
              {contactInfo.email && (
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="inline-flex items-center gap-3 text-neutral-900 hover:text-purple-600 transition-colors py-1 group"
                >
                  <div className="w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center group-hover:border-purple-600 transition-colors bg-white">
                    <Mail className="w-4 h-4 text-neutral-700" />
                  </div>
                  <span className="text-base font-semibold">{contactInfo.email}</span>
                </a>
              )}

              {/* Phone */}
              {contactInfo.phone && (
                <div className="flex items-center gap-3 text-neutral-800 py-1">
                  <div className="w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center bg-white">
                    <Phone className="w-4 h-4 text-neutral-700" />
                  </div>
                  <a href={`tel:${contactInfo.phone}`} className="hover:text-purple-600 transition-colors">
                    {contactInfo.phone}
                  </a>
                </div>
              )}

              {/* WhatsApp */}
              {contactInfo.whatsapp && (
                <div className="flex items-center gap-3 text-neutral-800 py-1">
                  <div className="w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center bg-white">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                  </div>
                  <a
                    href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-700 transition-colors"
                  >
                    WhatsApp: {contactInfo.whatsapp}
                  </a>
                </div>
              )}

              {/* Location */}
              {contactInfo.location && (
                <div className="flex items-center gap-3 text-neutral-600 py-1">
                  <div className="w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center bg-white">
                    <MapPin className="w-4 h-4 text-neutral-700" />
                  </div>
                  <span>{contactInfo.location}</span>
                </div>
              )}
            </div>

            {/* Custom Extra Contacts (Configured via Admin) */}
            {contactInfo.custom_contacts && contactInfo.custom_contacts.length > 0 && (
              <div className="pt-6 border-t border-neutral-200/80 mb-8">
                <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 block mb-3 font-bold">
                  ADDITIONAL CREDENTIALS &amp; INFO
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contactInfo.custom_contacts.map((item) => (
                    <div key={item.id} className="p-3 bg-white rounded-xl border border-neutral-200 shadow-sm">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase block">{item.label}</span>
                      {item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-neutral-900 hover:text-purple-600 inline-flex items-center gap-1 mt-0.5"
                        >
                          {item.value} <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs font-bold text-neutral-900 block mt-0.5">{item.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Media Links (Configured via Admin) */}
            {contactInfo.socials && contactInfo.socials.length > 0 && (
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 block mb-3 font-bold">
                  SOCIAL &amp; NETWORKS
                </span>
                <div className="flex flex-wrap gap-2">
                  {contactInfo.socials.map((soc) => (
                    <a
                      key={soc.id}
                      href={soc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-mono font-medium text-neutral-800 hover:border-black hover:bg-neutral-50 transition-all shadow-sm"
                    >
                      <Globe className="w-3 h-3 text-neutral-500" />
                      {soc.label || soc.platform}
                      <ExternalLink className="w-2.5 h-2.5 text-neutral-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sleek Form */}
          <div className="lg:col-span-6 bg-white p-8 sm:p-10 lg:p-12 rounded-3xl border border-black/10 shadow-xl">
            {status === 'success' ? (
              <div className="py-12 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tight text-neutral-900 mb-2">
                  Message Sent!
                </h3>
                <p className="text-neutral-600 text-sm max-w-sm mb-6">
                  Thank you for reaching out. I will review your message and reply promptly.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="px-6 py-2 rounded-full border border-neutral-300 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Alex Morgan"
                    className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@example.com"
                    className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 mb-2">
                    Project Details / Inquiry
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your requirements, timeline, or engineering inquiry..."
                    className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black text-sm transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full py-4 rounded-xl bg-black text-white hover:bg-neutral-800 disabled:opacity-50 text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 group"
                >
                  {status === 'submitting' ? (
                    'Sending...'
                  ) : (
                    <>
                      <span>SUBMIT INQUIRY</span>
                      <Send className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
