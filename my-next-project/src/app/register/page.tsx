'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';

function RegisterContent() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', { username, email, password });
      if (redirectUrl) {
        router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      } else {
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
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
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl mb-4">Create Account</h1>
          <p className="text-white/60 text-sm tracking-wide">Join us to access exclusive features.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-4 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-white/50 ml-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 pb-2 focus:border-[#d8c3a5] outline-none transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-white/50 ml-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 pb-2 focus:border-[#d8c3a5] outline-none transition-colors"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-white/50 ml-1">Password</label>
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
              {loading ? 'Creating Account...' : 'Create Account'}
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
            text="signup_with"
          />
        </div>

        <p className="text-center text-sm text-white/50 mt-8">
          Already have an account?{' '}
          <Link href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : "/login"} className="text-[#d8c3a5] hover:text-white transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-white/50" /></div>}>
      <RegisterContent />
    </Suspense>
  );
}
