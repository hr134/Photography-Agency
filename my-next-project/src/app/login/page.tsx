'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useSearchParams } from 'next/navigation';

function LoginContent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.post('/auth/login', { username, password });
      if (data.access_token) {
        login(data.access_token, data.user, redirectUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setLoading(true);
    try {
      const data = await api.post('/auth/google', { id_token: credentialResponse.credential });
      if (data.access_token) {
        login(data.access_token, data.user, redirectUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl mb-4">Welcome Back</h1>
          <p className="text-white/60 text-sm tracking-wide">Enter your details to access your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-4 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-white/50 ml-1">Username Or Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 pb-2 focus:border-[#d8c3a5] outline-none transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] tracking-widest uppercase text-white/50">Password</label>
              <Link href="/forgot-password" className="text-[10px] text-[#d8c3a5] hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 pb-2 focus:border-[#d8c3a5] outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#d8c3a5] text-black py-4 mt-8 hover:bg-white transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span className="text-sm tracking-widest uppercase font-medium">
              {loading ? 'Signing In...' : 'Sign In'}
            </span>
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center w-full">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-4 text-xs text-white/50 uppercase tracking-widest">or</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google authentication failed.')}
            theme="filled_black"
            shape="rectangular"
            text="signin_with"
          />
        </div>

        <p className="text-center text-sm text-white/50 mt-8">
          Don't have an account?{' '}
          <Link href={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register"} className="text-[#d8c3a5] hover:text-white transition-colors">
            Create one
          </Link>
        </p>

        {/* Admin Login Info */}
        {/* <div className="mt-8 p-4 rounded bg-white/5 border border-white/10 text-center">
          <p className="text-xs text-white/40 mb-2 uppercase tracking-widest">Default Admin Login</p>
          <div className="text-sm text-white/60">
            <p>Username: <span className="text-[#d8c3a5]">admin</span></p>
            <p>Password: <span className="text-[#d8c3a5]">admin123</span></p>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-white/50" /></div>}>
      <LoginContent />
    </Suspense>
  );
}


