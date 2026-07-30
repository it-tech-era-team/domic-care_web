'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCareConnect } from '@/context/useCareConnect';
import {
  Heart, LayoutDashboard, Search, CalendarDays,
  MessageSquare, UserCircle, Bell, ShieldCheck,
  ClipboardList, LogOut, Menu, X, Users
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

  // Sidebar link configurations
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
      {/* Mobile Top Header (Sidebar Toggle) */}
      <div className="flex md:hidden items-center justify-between bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Heart className="h-4.5 w-4.5 fill-white" />
          </div>
          <span className="font-heading text-lg font-bold text-slate-900">DomicCare</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNotifPopover(!showNotifPopover)}
            className="relative p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-slate-200 bg-white p-5 flex flex-col justify-between
          transition-transform duration-300 md:translate-x-0 md:sticky md:h-screen
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="space-y-6">
          {/* Logo & Notification Section */}
          <div className="hidden md:flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/10">
                <Heart className="h-5.5 w-5.5 fill-white" />
              </div>
              <div>
                <span className="font-heading text-lg font-bold tracking-tight text-slate-900 block leading-none">
                  DomicCare
                </span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-1 block">
                  {role === 'user' ? 'Family Portal' : role === 'caregiver' ? 'Caregiver Portal' : 'Admin Panel'}
                </span>
              </div>
            </div>

            {/* Desktop Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifPopover(!showNotifPopover)}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center animate-pulse">
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
                    flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span>{item.label}</span>
                  </div>
                  
                  {item.badgeCount && badgeNum > 0 && (
                    <span className={`
                      text-[10px] font-bold px-2 py-0.5 rounded-full
                      ${isActive ? 'bg-white text-blue-600' : item.label === 'Messages' ? 'bg-blue-600 text-white' : 'bg-red-500 text-white'}
                    `}>
                      {badgeNum}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          {currentUser && (
            <div className="flex items-center gap-3 px-1.5 py-1">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={currentUser.fullName}
                className="h-10 w-10 rounded-xl border-2 border-slate-100 object-cover shadow-sm bg-slate-100"
              />
              <div className="overflow-hidden">
                <span className="font-semibold text-sm text-slate-800 block truncate leading-none">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] text-slate-400 truncate block mt-1 capitalize">
                  {currentUser.role} Account
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Global Notifications Popover overlay */}
      {showNotifPopover && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 md:p-6 pointer-events-none">
          <div className="w-80 md:w-96 rounded-3xl bg-white border border-slate-200 p-5 shadow-2xl space-y-4 pointer-events-auto animate-fade-in mt-12 md:mt-2 md:mr-64">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4.5 w-4.5 text-blue-600" />
                <span className="text-sm font-extrabold text-slate-900">Notifications</span>
                {unreadNotifsCount > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                    {unreadNotifsCount} New
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadNotifsCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead()}
                    className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowNotifPopover(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {unreadNotifs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <Bell className="h-8 w-8 text-slate-300 mx-auto opacity-50" />
                <p className="text-xs font-bold text-slate-600">No unread notifications</p>
                <p className="text-[10px] text-slate-400">You are all caught up!</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                {unreadNotifs.map(n => (
                  <div
                    key={n.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1 relative group hover:bg-blue-50/40 transition-colors"
                  >
                    <div className="flex items-center justify-between pr-4">
                      <span className="font-extrabold text-slate-900">{n.title}</span>
                      <button
                        onClick={() => markNotificationRead(n.id)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                        title="Mark as read"
                      >
                        Read
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
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
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
        />
      )}
    </>
  );
}
