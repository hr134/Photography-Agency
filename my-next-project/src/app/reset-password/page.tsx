'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.post('/auth/reset-password', { token, new_password: password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link might have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-8 flex flex-col items-center text-center gap-6">
          <CheckCircle2 className="w-16 h-16 text-green-400" />
          <div>
            <h3 className="text-xl font-medium mb-2">Password Reset Successful</h3>
            <p className="text-sm opacity-80 mb-8">You can now sign in with your new password.</p>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center gap-2 bg-green-400 text-black px-8 py-3 rounded-full hover:bg-green-300 transition-colors font-medium text-sm tracking-widest uppercase"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-light mb-4">Set New Password</h1>
        <p className="text-white/60 text-sm">Please enter your new password below.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 mb-8 text-sm flex items-center justify-between">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] tracking-widest uppercase text-white/50 ml-1">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border-b border-white/20 pb-2 focus:border-[#d8c3a5] outline-none transition-colors"
            required
            disabled={!token}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] tracking-widest uppercase text-white/50 ml-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-transparent border-b border-white/20 pb-2 focus:border-[#d8c3a5] outline-none transition-colors"
            required
            disabled={!token}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !token || !password || !confirmPassword}
          className="w-full flex items-center justify-center gap-2 bg-[#d8c3a5] text-black py-4 mt-8 hover:bg-white transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          <span className="text-sm tracking-widest uppercase font-medium">
            {loading ? 'Updating...' : 'Reset Password'}
          </span>
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-[#d8c3a5]" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
