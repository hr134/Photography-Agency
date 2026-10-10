'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await api.post('/auth/forgot-password', { email });
      setMessage(data.message || 'If your email is registered, a reset link has been sent.');
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white uppercase tracking-widest mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-light mb-4">Reset Password</h1>
          <p className="text-white/60 text-sm">Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 mb-8 text-sm flex items-center justify-between">
            <span>{error}</span>
          </div>
        )}

        {message ? (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 mb-8 flex flex-col items-center text-center gap-4">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
            <div>
              <h3 className="font-medium mb-1">Check your inbox</h3>
              <p className="text-sm opacity-80">{message}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest uppercase text-white/50 ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-white/20 pb-2 focus:border-[#d8c3a5] outline-none transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex items-center justify-center gap-2 bg-[#d8c3a5] text-black py-4 mt-8 hover:bg-white transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span className="text-sm tracking-widest uppercase font-medium">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
