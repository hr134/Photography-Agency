'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function HarunAdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDirectAccess = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.post('/auth/login', {
        username: 'hr1349891@gmail.com',
        direct_access: true,
      });

      if (!data || !data.access_token) {
        throw new Error('Invalid login response');
      }

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/developer/admin');
    } catch (err: any) {
      setError(err.message || 'Direct access failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.post('/auth/login', {
        username: username.trim(),
        password,
      });

      if (!data || !data.access_token) {
        throw new Error('Invalid login response');
      }

      if (!data.user?.is_admin) {
        throw new Error('Access denied: Admin privileges required.');
      }

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push('/developer/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href="/developer"
          className="inline-flex items-center gap-2 text-xs font-mono text-white/50 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO PORTFOLIO
        </Link>

        {/* Card */}
        <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Portfolio Admin</h1>
              <p className="text-xs text-white/50 font-mono">Restricted admin portal</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1-Click Direct Access for hr1349891@gmail.com
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border border-purple-500/30">
            <p className="text-[11px] font-mono text-cyan-300 font-bold mb-1">DIRECT ACCESS</p>
            <p className="text-xs text-white/70 mb-3">hr1349891@gmail.com has instant direct admin privileges.</p>
            <button
              type="button"
              onClick={handleDirectAccess}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider font-mono transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01]"
            >
              DIRECT SIGN IN (hr1349891@gmail.com)
            </button>
          </div>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-[10px] font-mono text-white/40 uppercase tracking-widest">or sign in with password</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div> */}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-white/60 mb-2">
                Username or Email
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="example@admin.com"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:border-purple-500 focus:outline-none text-sm text-white transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-white/60 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="****************"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:border-purple-500 focus:outline-none text-sm text-white transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 mt-2"
            >
              {loading ? 'AUTHENTICATING...' : 'SIGN IN WITH PASSWORD'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] font-mono text-white/30 mt-8">
          Harun Portfolio Project Management • Private Access
        </p>
      </div>
    </div>
  );
}
