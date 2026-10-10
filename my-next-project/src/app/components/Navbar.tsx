"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, UserCircle, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  const toggle = () => setOpen(!open);
  const close = () => setOpen(false);

  // Get initials for avatar
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "U";

  return (
    <header className="fixed w-full top-0 z-50 transition-all duration-300 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex flex-col justify-center" onClick={close}>
          <span className="font-serif text-2xl tracking-widest text-[#d8c3a5] leading-none">
            VELOURA
          </span>
          <span className="text-[10px] tracking-widest uppercase font-sans text-white/50 mt-1">
            <span className="text-[#d8c3a5] mr-1">Creations</span>
            Photography
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase text-white/80">
          <Link href="/" className="hover:text-[#d8c3a5] transition-colors" onClick={close}>Home</Link>
          <Link href="/stories" className="hover:text-[#d8c3a5] transition-colors" onClick={close}>Stories</Link>
          <Link href="/photography" className="hover:text-[#d8c3a5] transition-colors" onClick={close}>Photography</Link>
          <Link href="/films" className="hover:text-[#d8c3a5] transition-colors" onClick={close}>Films</Link>
          <Link href="/about" className="hover:text-[#d8c3a5] transition-colors" onClick={close}>About</Link>
          <Link href="/packages" className="hover:text-[#d8c3a5] transition-colors" onClick={close}>Packages</Link>
          {/* <Link href="/journal" className="hover:text-[#d8c3a5] transition-colors" onClick={close}>Journal</Link> */}
          <Link href="/contact" className="hover:text-[#d8c3a5] transition-colors" onClick={close}>Contact</Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3 ml-2">
              {/* User avatar dropdown */}
              <div className="relative group">
              <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full hover:border-[#d8c3a5]/40 transition-all">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-[#d8c3a5]/30"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-[#d8c3a5]/20 text-[#d8c3a5] text-[10px] font-bold flex items-center justify-center">
                    {initials}
                  </span>
                )}
                <span className="text-[10px] tracking-widest text-white/70 max-w-[80px] truncate">
                  {user?.username}
                </span>
              </button>


                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#161616] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden z-50">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={close}
                      className="flex items-center gap-3 px-4 py-3 text-xs text-[#d8c3a5] hover:bg-[#d8c3a5]/10 transition-colors border-b border-white/5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    onClick={close}
                    className="flex items-center gap-3 px-4 py-3 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    My Bookings
                  </Link>
                  <button
                    onClick={() => { logout(); close(); }}
                    className="flex items-center gap-3 px-4 py-3 text-xs text-white/50 hover:text-red-400 hover:bg-red-400/5 transition-colors w-full text-left border-t border-white/5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login" className="hover:text-[#d8c3a5] transition-colors" onClick={close}>Login</Link>
          )}
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d8c3a5]"
          onClick={toggle}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Nav */}
        {open && (
          <nav className="absolute top-full left-0 w-full bg-[#0f0f0f] border-t border-white/10 md:hidden flex flex-col gap-1 py-4 px-6 text-sm">
            <Link href="/" className="py-2 hover:text-[#d8c3a5]" onClick={close}>Home</Link>
            <Link href="/stories" className="py-2 hover:text-[#d8c3a5]" onClick={close}>Stories</Link>
            <Link href="/photography" className="py-2 hover:text-[#d8c3a5]" onClick={close}>Photography</Link>
            <Link href="/films" className="py-2 hover:text-[#d8c3a5]" onClick={close}>Films</Link>
            <Link href="/about" className="py-2 hover:text-[#d8c3a5]" onClick={close}>About</Link>
            <Link href="/packages" className="py-2 hover:text-[#d8c3a5]" onClick={close}>Packages</Link>
            {/* <Link href="/journal" className="py-2 hover:text-[#d8c3a5]" onClick={close}>Journal</Link> */}
            <Link href="/contact" className="py-2 hover:text-[#d8c3a5]" onClick={close}>Contact</Link>

            {isAuthenticated ? (
              <div className="border-t border-white/10 mt-2 pt-4 space-y-2">
                {user && (
                  <div className="flex items-center gap-3 mb-3">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-[#d8c3a5]/40"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-[#d8c3a5]/20 text-[#d8c3a5] text-xs font-bold flex items-center justify-center">
                        {initials}
                      </span>
                    )}
                    <span className="text-sm text-white/70">{user.username}</span>
                    {isAdmin && (
                      <span className="ml-auto text-[9px] uppercase tracking-widest bg-[#d8c3a5]/20 text-[#d8c3a5] px-2 py-0.5 rounded-full">Admin</span>
                    )}
                  </div>
                )}
                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-2 py-2 text-[#d8c3a5]" onClick={close}>
                    <ShieldCheck className="w-4 h-4" /> Admin Panel
                  </Link>
                )}
                <Link href="/dashboard" className="flex items-center gap-2 py-2 hover:text-[#d8c3a5]" onClick={close}>
                  <LayoutDashboard className="w-4 h-4" /> My Bookings
                </Link>
                <button
                  onClick={() => { logout(); close(); }}
                  className="flex items-center gap-2 py-2 text-white/50 hover:text-red-400 text-left w-full"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="py-2 hover:text-[#d8c3a5]" onClick={close}>Login</Link>
            )}
          </nav>
        )}

        {/* CTA */}
        <Link
          href="/contact"
          className="hidden md:block px-6 py-3 border border-[#d8c3a5] text-[#d8c3a5] text-xs uppercase tracking-widest hover:bg-[#d8c3a5] hover:text-[#0f0f0f] transition-all"
        >
          Check Your Date
        </Link>
      </div>
    </header>
  );
}
