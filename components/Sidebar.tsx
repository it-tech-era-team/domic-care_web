'use client';

import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const handleOpenNotifications = () => setShowNotifPopover(true);
    window.addEventListener('open-notifications', handleOpenNotifications);
    return () => window.removeEventListener('open-notifications', handleOpenNotifications);
  }, []);

  const myNotifs = notifications.filter(n => n.userId === currentUser?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const unreadNotifs = myNotifs.filter(n => !n.isRead);
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
      { label: 'Profile Settings', href: '/admin/profile', icon: Settings },
    ],
  };

  const activeMenuItems = menuItems[role] || [];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="flex md:hidden items-center justify-between bg-white/80 backdrop-blur-2xl border-b border-slate-200/80 px-5 py-3 sticky top-0 z-40 shadow-sm text-slate-900 transition-all">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 flex items-center justify-center shadow-inner border border-blue-100/60 p-1">
            <div className="h-full w-full bg-white rounded-[11px] flex items-center justify-center overflow-hidden p-0.5 shadow-[0_2px_8px_-2px_rgba(37,99,235,0.15)]">
              <img
                src="/domic_care_logo_without_text-removebg-preview.png"
                alt="DomicCare Logo"
                className="h-full w-full object-contain filter drop-shadow-sm"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-heading text-[17px] font-black text-slate-900 leading-tight tracking-tight">DomicCare</span>
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none mt-0.5">
              {role === 'user' ? 'Family Portal' : role === 'caregiver' ? 'Caregiver Portal' : 'Admin Panel'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotifPopover(!showNotifPopover)}
            className="relative p-2.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-2xl cursor-pointer transition-colors"
            title="Notifications"
          >
            <Bell className="h-[22px] w-[22px] stroke-[2.2]" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-2 right-2.5 h-2.5 w-2.5 bg-rose-500 border-[2px] border-white rounded-full animate-pulse shadow-sm" />
            )}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-blue-600 rounded-xl cursor-pointer transition-all shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] active:scale-95"
          >
            {isOpen ? <X className="h-5 w-5 stroke-[2.5]" /> : <Menu className="h-5 w-5 stroke-[2.5]" />}
          </button>
        </div>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-blue-900/30 bg-gradient-to-b from-blue-700 via-blue-800 to-indigo-900 text-white p-5 flex flex-col justify-between
          transition-transform duration-300 md:translate-x-0 md:sticky md:h-screen overflow-hidden shadow-xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="space-y-6 relative z-10">
          {/* Logo & Notification Section */}
          <div className="hidden md:flex items-center justify-between pb-4 border-b border-white/15">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-md p-0.5 flex items-center justify-center shadow-inner border border-white/20">
                <div className="h-full w-full bg-white rounded-[10px] flex items-center justify-center overflow-hidden p-0.5">
                  <img
                    src="/domic_care_logo_without_text-removebg-preview.png"
                    alt="DomicCare Logo"
                    className="h-full w-full object-contain filter drop-shadow"
                  />
                </div>
              </div>
              <div>
                <span className="font-heading text-lg font-black tracking-tight text-white block leading-none">
                  DomicCare
                </span>
                <span className="text-[10px] font-extrabold text-blue-200 uppercase tracking-widest mt-1 block">
                  {role === 'user' ? 'FAMILY PORTAL' : role === 'caregiver' ? 'CAREGIVER PORTAL' : 'ADMIN PANEL'}
                </span>
              </div>
            </div>

            {/* Desktop Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifPopover(!showNotifPopover)}
                className="relative p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-amber-400 text-slate-900 rounded-full text-[9px] font-black flex items-center justify-center animate-pulse shadow-md">
                    {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
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
                      ? 'bg-white text-blue-700 font-extrabold shadow-lg shadow-blue-950/30 scale-[1.02]' 
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-blue-700' : 'text-blue-200 group-hover:text-white'}`} />
                    <span>{item.label}</span>
                  </div>
                  
                  {item.badgeCount && badgeNum > 0 && (
                    <span className={`
                      text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs
                      ${isActive ? 'bg-blue-700 text-white' : 'bg-white/20 text-white border border-white/30'}
                    `}>
                      {badgeNum}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Dynamic Blue Wave Illumination Background Graphics at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 opacity-20 pointer-events-none overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="blueWaveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="blueWaveGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <path d="M0,130 C80,90 150,170 300,100 L300,200 L0,200 Z" fill="url(#blueWaveGrad1)" />
            <path d="M0,160 C120,110 200,190 300,140 L300,200 L0,200 Z" fill="url(#blueWaveGrad2)" />
          </svg>
        </div>

        {/* User Profile Footer & Logout */}
        <div className="border border-white/15 bg-white/10 backdrop-blur-md pt-3.5 pb-3 px-3 space-y-3 relative z-10 rounded-2xl shadow-inner text-white">
          {currentUser && (
            <div className="flex items-center gap-3 px-1">
              <div className="relative">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={currentUser.fullName}
                  className="h-10 w-10 rounded-xl border-2 border-white/30 object-cover shadow-xs bg-blue-900"
                />
                <span className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-400 rounded-full border-2 border-blue-900 shadow-xs animate-pulse" />
              </div>
              <div className="overflow-hidden">
                <span className="font-extrabold text-sm text-white block truncate leading-none">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] font-semibold text-blue-200 truncate block mt-1 capitalize">
                  {currentUser.role} Account
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-blue-100 hover:bg-rose-500/20 hover:text-white hover:border hover:border-rose-400/30 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-blue-200" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Global Notifications Popover overlay */}
      {showNotifPopover && (
        <div className="fixed inset-0 z-50 flex items-start justify-end md:justify-start p-4 md:p-6 pointer-events-none">
          <div className="w-80 md:w-96 rounded-3xl bg-white border border-slate-200 p-5 shadow-2xl space-y-4 pointer-events-auto animate-fade-in mt-12 md:mt-2 md:ml-64 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4.5 w-4.5 text-blue-600" />
                <span className="text-sm font-extrabold text-slate-900">Notifications</span>
                {unreadNotifsCount > 0 && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-200">
                    {unreadNotifsCount} New
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {myNotifs.length > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead()}
                    className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Read All
                  </button>
                )}
                <button
                  onClick={() => setShowNotifPopover(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {myNotifs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <Bell className="h-8 w-8 text-slate-300 mx-auto opacity-70" />
                <p className="text-xs font-bold text-slate-700">No notifications</p>
                <p className="text-[10px] text-slate-400">You are all caught up!</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                {myNotifs.map(n => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-2xl border text-xs space-y-1 relative group transition-colors ${n.isRead ? 'bg-white border-slate-100 text-slate-500' : 'bg-slate-50 border-blue-100 hover:bg-blue-50/50'}`}
                  >
                    <div className="flex items-center justify-between pr-4">
                      <span className={`font-extrabold ${n.isRead ? 'text-slate-600' : 'text-slate-900'}`}>{n.title}</span>
                      {!n.isRead && (
                        <button
                          onClick={() => markNotificationRead(n.id)}
                          className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                          title="Mark as read"
                        >
                          Read
                        </button>
                      )}
                    </div>
                    <p className={`text-[11px] leading-relaxed ${n.isRead ? 'text-slate-400' : 'text-slate-600'}`}>{n.message}</p>
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
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}
    </>
  );
}
