'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  Users,
  Package,
  LogOut,
  Menu,
  Mail,
  Image,
  FileText,
  Tag
} from 'lucide-react';
import { api } from '@/lib/api';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badgeKey?: string;
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/portfolio', label: 'Portfolio', icon: Image },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck, badgeKey: 'bookings' },
  { href: '/admin/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/admin/team', label: 'Team', icon: Users },
  { href: '/admin/packages', label: 'Packages', icon: Package },
  { href: '/admin/discounts', label: 'Discounts', icon: Tag },
  { href: '/admin/messages', label: 'Messages', icon: Mail, badgeKey: 'messages' },
  { href: '/admin/settings', label: 'Settings', icon: Menu },
  { href: '/admin/terms', label: 'Agreements', icon: FileText },
];


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badges, setBadges] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/');
      }
    }
  }, [isAuthenticated, loading, isAdmin, router]);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.get('/admin/notifications');
      if (data) setBadges(data);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    const handleReload = () => fetchNotifications();
    window.addEventListener('reload_notifications', handleReload);
    return () => window.removeEventListener('reload_notifications', handleReload);
  }, [fetchNotifications]);

  // Refresh notifications whenever we change routes (e.g. going back to the bookings list)
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      // Small delay ensures API updates (like marking a booking read on fetch) complete first
      const t = setTimeout(() => {
        fetchNotifications();
      }, 300);
      return () => clearTimeout(t);
    }
  }, [pathname, isAuthenticated, isAdmin, fetchNotifications]);

  if (loading) return null;

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]" style={{ paddingTop: 0 }}>
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen z-50 w-64 bg-[#111111] border-r border-white/5 flex flex-col transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:sticky md:top-[80px] md:h-[calc(100vh-80px)] md:flex`}>
        {/* Logo */}
        <div className="px-6 py-7 border-b border-white/5">
          <span className="font-serif text-xl tracking-widest text-[#d8c3a5]">VELOURA</span>
          <p className="text-[10px] uppercase tracking-widest text-white/30 mt-0.5">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon, badgeKey }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            const badgeCount = badgeKey ? (badges[badgeKey] || 0) : 0;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm tracking-wide transition-all relative
                  ${active
                    ? 'bg-[#d8c3a5]/10 text-[#d8c3a5] border border-[#d8c3a5]/20'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {badgeCount > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-[#d8c3a5] text-black text-[10px] font-bold leading-none">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 text-sm text-white/40 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-[80px] z-30 bg-[#0a0a0a]/80 backdrop-blur border-b border-white/5 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-white/60 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs uppercase tracking-widest text-white/30">Admin</span>
          </div>
          
          <button 
            onClick={fetchNotifications}
            className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors"
            title="Reload Notifications"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Reload</span>
          </button>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
