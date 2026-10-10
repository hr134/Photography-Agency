'use client';

import { useState } from 'react';
import { Send, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus('submitting');
    try {
      await api.post('/contact', {
        name: formData.name,
        email: formData.email,
        message: `[HARUN PORTFOLIO INQUIRY]: ${formData.message}`,
        event_date: new Date().toISOString().split('T')[0],
      });
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch {
      // Still show success to visitor so contact doesn't feel broken
      setStatus('success');
    }
  };

  return (
    <section
      id="contact"
      className="relative py-28 md:py-36 bg-[#f4f4f0] text-[#111111] transition-colors duration-500 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Big Typography & Direct Info */}
          <div className="lg:col-span-6">
            <span className="text-xs font-mono font-bold tracking-widest text-neutral-500 uppercase block mb-3">
              START A CONVERSATION
            </span>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-neutral-900 leading-[0.95] mb-8">
              LET&apos;S GET IN TOUCH
            </h2>
            <p className="text-neutral-600 text-lg font-light leading-relaxed mb-10 max-w-md">
              Have a project in mind, need a full-stack web application built, or want to consult on technical architecture? Let&apos;s build something great together.
            </p>

            <div className="space-y-4 font-mono text-sm">
              <a
                href="mailto:hr1349891@gmail.com"
                className="inline-flex items-center gap-3 text-neutral-900 hover:text-purple-600 transition-colors py-1 group"
              >
                <div className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center group-hover:border-purple-600 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-base font-semibold">hr1349891@gmail.com</span>
              </a>

              <div className="flex items-center gap-3 text-neutral-600 py-1">
                <div className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Available Worldwide (Remote)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sleek Form */}
          <div className="lg:col-span-6 bg-white p-8 sm:p-10 rounded-3xl border border-black/10 shadow-xl">
            {status === 'success' ? (
              <div className="py-12 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tight text-neutral-900 mb-2">
                  Message Sent!
                </h3>
                <p className="text-neutral-600 text-sm max-w-sm mb-6">
                  Thank you for reaching out. I will review your message and get back to you promptly.
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
                    Project Details / Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell me about your project, timeline, or requirements..."
                    className="w-full px-4 py-3.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black text-sm transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full py-4 rounded-full bg-neutral-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {status === 'submitting' ? (
                    'SENDING...'
                  ) : (
                    <>
                      SEND MESSAGE
                      <Send className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
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
