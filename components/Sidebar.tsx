'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCareConnect } from '@/context/useCareConnect';
import {
  LayoutDashboard, Search, CalendarDays,
  MessageSquare, UserCircle, Bell, Trash2,
  CheckCircle2, ShieldCheck, AlertCircle,
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
  const { currentUser, logout, notifications, conversations, markNotificationRead, deleteNotification } = useCareConnect();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadNotifsCount = notifications.filter(n => !n.isRead && n.userId === currentUser?.id).length;
  const unreadMessagesCount = conversations.reduce((total, conversation) => total + (conversation.unreadCount || 0), 0);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

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
          <Image
            src="/Logo.png"
            alt="DomicCare Logo"
            width={48}
            height={48}
            className="h-12 w-12 object-cover"
          />
          <span className="font-heading text-lg font-bold text-slate-900">DomicCare</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <Bell className="h-5 w-5 text-slate-600" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
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
          {/* Logo Section */}
          <div className="hidden md:flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Image
              src="/Logo.png"
              alt="DomicCare Logo"
              width={60}
              height={60}
              className="h-15 w-15 object-cover"
            />
            <div>
              <span className="font-heading text-lg font-bold tracking-tight text-slate-900 block leading-none">
                DomicCare
              </span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-1 block">
                {role === 'user' ? 'Family Portal' : role === 'caregiver' ? 'Caregiver Portal' : 'Admin Panel'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {activeMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
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

                  {item.badgeCount && unreadMessagesCount > 0 && (
                    <span
                      className={`
                        text-[10px] font-bold px-1.5 py-0.5 rounded-full
                        ${isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}
                      `}
                    >
                      {unreadMessagesCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card with Logout */}
        <div className="border-t border-slate-100 pt-4">
          {currentUser && (
            <div className="flex items-center gap-3 px-1.5 py-1">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={currentUser.fullName}
                className="h-10 w-10 rounded-xl border-2 border-slate-100 object-cover shadow-sm bg-slate-100"
              />
              <div className="overflow-hidden flex-1">
                <span className="font-semibold text-sm text-slate-800 block truncate leading-none">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] text-slate-400 truncate block mt-1 capitalize">
                  {currentUser.role} Account
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
        />
      )}

      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-white md:hidden overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-bold text-lg">Notifications</h2>
            <button onClick={() => setShowNotifications(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-4">
            {notifications
              .filter(n => n.userId === currentUser?.id)
              .map((n) => (
                <div
                  key={n.id}
                  className={`relative rounded-2xl border p-4 mb-3 transition-all
                    ${n.isRead ? 'bg-white border-slate-200' : 'bg-blue-50 border-blue-200'}`}
                >
                  <div className="flex gap-3">
                    <div className="mt-1">
                      {n.type === 'booking_update' ? (
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                      ) : n.type === 'chat_message' ? (
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                      ) : (
                        <Bell className="h-5 w-5 text-slate-500" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    {!n.isRead && (
                      <button
                        onClick={() => markNotificationRead(n.id)}
                        className="flex items-center gap-1 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 px-3 py-1.5 text-xs font-semibold transition"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Read
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(n.id)}
                      className="flex items-center gap-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 text-xs font-semibold transition"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}