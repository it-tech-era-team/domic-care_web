'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCareConnect } from '@/context/useCareConnect';
import {
  LayoutDashboard, Search, CalendarDays,
  MessageSquare, UserCircle, Bell, ShieldCheck,
  ClipboardList, LogOut, Menu, X, Users, Globe,
  BarChart3, Store, FileText, Settings
} from 'lucide-react';

interface SidebarProps {
  role: 'user' | 'caregiver' | 'admin';
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badgeCount?: boolean;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, notifications, conversations, markNotificationRead, markAllNotificationsRead } = useCareConnect();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifPopover, setShowNotifPopover] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.isRead && n.userId === currentUser?.id);
  const unreadNotifsCount = unreadNotifs.length;

  const unreadMessagesCount = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Sidebar link configurations matching image
  const menuItems: Record<'user' | 'caregiver' | 'admin', MenuItem[]> = {
    user: [
      { label: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
      { label: 'Find Caregivers', href: '/user/search-caregivers', icon: Search },
      { label: 'Bookings', href: '/user/bookings', icon: CalendarDays },
      { label: 'Messages', href: '/user/messages', icon: MessageSquare, badgeCount: true },
      { label: 'Profile', href: '/user/profile', icon: UserCircle },
    ],
    caregiver: [
      { label: 'Dashboard', href: '/caregiver/dashboard', icon: LayoutDashboard },
      { label: 'My Profile', href: '/caregiver/profile', icon: UserCircle },
      { label: 'Requests', href: '/caregiver/bookings', icon: ClipboardList },
      { label: 'Calendar', href: '/caregiver/calendar', icon: CalendarDays },
      { label: 'Messages', href: '/caregiver/messages', icon: MessageSquare, badgeCount: true },
    ],
    admin: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Caregivers', href: '/admin/caregivers', icon: Users },
      { label: 'Users', href: '/admin/users', icon: UserCircle },
    ],
  };

  const activeMenuItems = menuItems[role] || [];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="flex md:hidden items-center justify-between bg-[#0c0e25] border-b border-white/10 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <div className="h-full w-full bg-[#0c0e25] rounded-[10px] flex items-center justify-center overflow-hidden p-0.5">
              <img
                src="/domic_care_logo_without_text-removebg-preview.png"
                alt="DomicCare Logo"
                className="h-full w-full object-contain filter drop-shadow"
              />
            </div>
          </div>
          <div>
            <span className="font-heading text-base font-extrabold text-white leading-none block">DomicCare</span>
            <span className="text-[9px] font-extrabold text-purple-400 uppercase tracking-widest block">
              {role === 'user' ? 'FAMILY PORTAL' : role === 'caregiver' ? 'CAREGIVER PORTAL' : 'ADMIN PANEL'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNotifPopover(!showNotifPopover)}
            className="relative p-2 text-slate-300 hover:bg-white/10 rounded-xl cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-pink-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-300 hover:bg-white/10 rounded-xl cursor-pointer"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-white/10 bg-[#0c0e25] p-5 flex flex-col justify-between
          transition-transform duration-300 md:translate-x-0 md:sticky md:h-screen overflow-hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="space-y-6 relative z-10">
          {/* Logo & Notification Section */}
          <div className="hidden md:flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <div className="h-full w-full bg-[#0c0e25] rounded-[10px] flex items-center justify-center overflow-hidden p-0.5">
                  <img
                    src="/domic_care_logo_without_text-removebg-preview.png"
                    alt="DomicCare Logo"
                    className="h-full w-full object-contain filter drop-shadow"
                  />
                </div>
              </div>
              <div>
                <span className="font-heading text-lg font-extrabold tracking-tight text-white block leading-none">
                  DomicCare
                </span>
                <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-widest mt-1 block">
                  {role === 'user' ? 'FAMILY PORTAL' : role === 'caregiver' ? 'CAREGIVER PORTAL' : 'ADMIN PANEL'}
                </span>
              </div>
            </div>


            {/* Desktop Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifPopover(!showNotifPopover)}
                className="relative p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-pink-500 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center animate-pulse shadow-lg shadow-pink-500/50">
                    {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {activeMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const badgeNum = item.label === 'Messages' ? unreadMessagesCount : unreadNotifsCount;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all cursor-pointer
                    ${isActive 
                      ? 'nav-pill-active' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                    <span>{item.label}</span>
                  </div>
                  
                  {item.badgeCount && badgeNum > 0 && (
                    <span className={`
                      text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm
                      ${isActive ? 'bg-white text-purple-700' : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'}
                    `}>
                      {badgeNum}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Dynamic Neon Mountain/Wave Illumination Background Graphics at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-44 opacity-40 pointer-events-none overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#2563eb" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="waveGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <path d="M0,130 C80,90 150,170 300,100 L300,200 L0,200 Z" fill="url(#waveGrad1)" />
            <path d="M0,160 C120,110 200,190 300,140 L300,200 L0,200 Z" fill="url(#waveGrad2)" />
          </svg>
        </div>

        {/* User Profile Footer & Logout */}
        <div className="border-t border-white/10 pt-4 space-y-3 relative z-10 bg-[#0c0e25]/60 backdrop-blur-md rounded-2xl p-2">
          {currentUser && (
            <div className="flex items-center gap-3 px-1">
              <div className="relative">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={currentUser.fullName}
                  className="h-10 w-10 rounded-xl border border-white/20 object-cover shadow-md bg-slate-800"
                />
                <span className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-400 rounded-full border-2 border-[#0c0e25] shadow-sm animate-pulse" />
              </div>
              <div className="overflow-hidden">
                <span className="font-extrabold text-sm text-white block truncate leading-none">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] font-semibold text-purple-300 truncate block mt-1 capitalize">
                  {currentUser.role} Account
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-400 hover:bg-red-500/20 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Global Notifications Popover overlay */}
      {showNotifPopover && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 md:p-6 pointer-events-none">
          <div className="w-80 md:w-96 rounded-3xl glass-panel border border-white/10 p-5 shadow-2xl space-y-4 pointer-events-auto animate-fade-in mt-12 md:mt-2 md:mr-64">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4.5 w-4.5 text-purple-400" />
                <span className="text-sm font-extrabold text-white">Notifications</span>
                {unreadNotifsCount > 0 && (
                  <span className="rounded-full bg-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-400/20">
                    {unreadNotifsCount} New
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadNotifsCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead()}
                    className="text-[10px] font-bold text-cyan-400 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowNotifPopover(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {unreadNotifs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <Bell className="h-8 w-8 text-slate-600 mx-auto opacity-50" />
                <p className="text-xs font-bold text-slate-300">No unread notifications</p>
                <p className="text-[10px] text-slate-500">You are all caught up!</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                {unreadNotifs.map(n => (
                  <div
                    key={n.id}
                    className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs space-y-1 relative group hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between pr-4">
                      <span className="font-extrabold text-white">{n.title}</span>
                      <button
                        onClick={() => markNotificationRead(n.id)}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                        title="Mark as read"
                      >
                        Read
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop for Mobile Sidebar */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}
    </>
  );
}
