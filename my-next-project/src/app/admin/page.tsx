'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Loader2, TrendingUp, Calendar, Users, Clock } from 'lucide-react';

interface Stats {
  total_bookings: number;
  pending: number;
  confirmed: number;
  completed: number;
  total_revenue: number;
  total_paid: number;
  total_clients: number;
  total_team: number;
}

function StatCard({ label, value, icon: Icon, accent = false }: {
  label: string;
  value: string | number;
  icon: any;
  accent?: boolean;
}) {
  return (
    <div className={`bg-[#161616] border rounded-xl p-6 flex items-start gap-4 ${accent ? 'border-[#d8c3a5]/30' : 'border-white/5'}`}>
      <div className={`p-3 rounded-lg ${accent ? 'bg-[#d8c3a5]/10' : 'bg-white/5'}`}>
        <Icon className={`w-5 h-5 ${accent ? 'text-[#d8c3a5]' : 'text-white/50'}`} />
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-white/40 mb-1">{label}</p>
        <p className="text-2xl font-serif text-white">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/admin/stats');
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load stats. Are you an Admin?');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="w-7 h-7 animate-spin text-[#d8c3a5]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-xl">
        <p className="font-medium mb-1">Access Denied</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-white mb-1">Overview</h1>
        <p className="text-sm text-white/40 tracking-wide">Agency performance at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`৳ ${(stats!.total_revenue).toLocaleString()}`} icon={TrendingUp} accent />
        <StatCard label="Total Bookings" value={stats!.total_bookings} icon={Calendar} />
        <StatCard label="Clients" value={stats!.total_clients} icon={Users} />
        <StatCard label="Pending" value={stats!.pending} icon={Clock} />
      </div>

      {/* Revenue breakdown */}
      <div className="bg-[#161616] border border-white/5 rounded-xl p-6">
        <h2 className="font-serif text-lg text-white mb-6">Revenue Breakdown</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50">Total Revenue</span>
            <span className="text-[#d8c3a5] font-medium">৳ {stats!.total_revenue.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50">Advance Collected</span>
            <span className="text-green-400 font-medium">৳ {stats!.total_paid.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <span className="text-sm text-white/50">Balance Due</span>
            <span className="text-white font-medium">৳ {(stats!.total_revenue - stats!.total_paid).toLocaleString()}</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-6">
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#d8c3a5] to-white/60 rounded-full transition-all"
              style={{ width: stats!.total_revenue > 0 ? `${Math.min((stats!.total_paid / stats!.total_revenue) * 100, 100)}%` : '0%' }}
            />
          </div>
          <p className="text-xs text-white/30 mt-2">
            {stats!.total_revenue > 0
              ? `${Math.round((stats!.total_paid / stats!.total_revenue) * 100)}% collected`
              : 'No revenue yet'}
          </p>
        </div>
      </div>

      {/* Booking status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Pending', count: stats!.pending, color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
          { label: 'Confirmed', count: stats!.confirmed, color: 'text-green-400 bg-green-400/10 border-green-400/20' },
          { label: 'Completed', count: stats!.completed, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`border rounded-xl p-5 ${color}`}>
            <p className="text-xs uppercase tracking-widest opacity-70 mb-2">{label}</p>
            <p className="text-3xl font-serif">{count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
