'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// --- TypeScript Interfaces ---
export type Role = 'user' | 'caregiver' | 'admin';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  role: Role;
}

export interface CaregiverProfile {
  id: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  experienceYears: number;
  hourlyRate: number;
  gender: string;
  dob: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  services: string[]; // Nursing, Companionship, Daily care, Medical assistance
  rating: number;
  reviewsCount: number;
  availability: {
    [day: string]: { start: string; end: string; isAvailable: boolean };
  };
  documents: {
    id: string;
    type: string;
    fileUrl: string;
    status: 'pending' | 'approved' | 'rejected';
  }[];
  distance?: number;
}

export interface Booking {
  id: string;
  userId: string;
  userFullName: string;
  caregiverId: string;
  caregiverFullName: string;
  caregiverAvatar: string;
  serviceId: string;
  serviceName: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
  rating?: number;
  comment?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  userFullName: string;
  userAvatar: string;
  caregiverId: string;
  caregiverFullName: string;
  caregiverAvatar: string;
  lastMessage?: string;
  unreadCount?: number;
  bookingStatus?: string | null;
  bookingService?: string;
  bookingStartDate?: string | null;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking_request' | 'booking_update' | 'chat_message' | 'approval_update';
  isRead: boolean;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
}

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetId: string;
  targetName: string;
  createdAt: string;
}

interface CareConnectContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  caregivers: CaregiverProfile[];
  bookings: Booking[];
  conversations: Conversation[];
  messages: Message[];
  notifications: Notification[];
  adminLogs: AdminLog[];
  services: Service[];
  toasts: Toast[];
  showToast: (title: string, message: string, type?: Toast['type']) => void;
  addService: (name: string, description: string) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  login: (email: string, password: string) => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  signupUser: (fullName: string, email: string, phone: string, password: string, role: Role) => Promise<boolean>;
  requestBooking: (caregiverId: string, serviceName: string, date: string, timeSlot: string, notes: string) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  submitReview: (bookingId: string, rating: number, comment: string) => Promise<void>;
  sendMessage: (conversationId: string, senderId: string, text: string) => Promise<void>;
  createConversation: (caregiverId: string) => Promise<string>;
  markNotificationRead: (id: string) => Promise<void>;
  approveCaregiver: (caregiverId: string) => Promise<void>;
  rejectCaregiver: (caregiverId: string) => Promise<void>;
  updateCaregiverProfile: (profile: Partial<CaregiverProfile>) => Promise<void>;
  submitCaregiverApplication: (data: Omit<CaregiverProfile, 'id' | 'approvalStatus' | 'rating' | 'reviewsCount'>) => Promise<boolean>;
  updateUserProfile: (profileData: { fullName?: string; email?: string; phone?: string; avatarUrl?: string }) => Promise<boolean>;
  caregiverFilters: any;
  updateCaregiverFilters: (filters: any) => Promise<void>;
}

const CareConnectContext = createContext<CareConnectContextType | undefined>(undefined);

export const CareConnectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(null);
  const [caregiverFilters, setCaregiverFiltersState] = useState<any>({ isActive: false });
  const [caregivers, setCaregivers] = useState<CaregiverProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (title: string, message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const refreshData = async (user = currentUser, filters = caregiverFilters) => {
    if (!user) return;
    try {
      // 1. Fetch available services
      const servRes = await fetch('/api/services');
      if (servRes.ok) {
        const data = await servRes.json();
        setServices(data.services || []);
      }

      // 2. Fetch bookings
      const bookingsRes = await fetch('/api/bookings');
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings(data.bookings || []);
      }

      // 3. Fetch conversations
      const convRes = await fetch('/api/conversations');
      if (convRes.ok) {
        const data = await convRes.json();
        setConversations(data.conversations || []);
      }

      // 4. Fetch notifications and check for newly received ones to display Toast
      const notifRes = await fetch('/api/notifications');
      if (notifRes.ok) {
        const data = await notifRes.json();
        const nextNotifs = data.notifications || [];
        setNotifications(prev => {
          if (prev.length > 0 && nextNotifs.length > prev.length) {
            const newlyAdded = nextNotifs.filter((n: Notification) => !prev.some(p => p.id === n.id));
            newlyAdded.forEach((n: Notification) => {
              if (!n.isRead) {
                showToast(n.title, n.message, n.type === 'booking_update' ? 'success' : 'info');
              }
            });
          }
          return nextNotifs;
        });
      }

      // 5. Fetch caregiver listings (admins fetch all, users/caregivers fetch approved list)
      let url = user.role === 'admin' ? '/api/admin/caregivers' : '/api/caregivers';
      if (user.role !== 'admin') {
        const params = new URLSearchParams();
        // Always include user Lat / Lng for distance calculation and sorting by distance
        params.append('userLat', '40.7128');
        params.append('userLng', '-74.0060');

        if (filters && filters.isActive) {
          if (filters.searchQuery) params.append('search', filters.searchQuery);
          if (filters.selectedService && filters.selectedService !== 'All') params.append('service', filters.selectedService);
          if (filters.maxRate) params.append('maxRate', String(filters.maxRate));
          if (filters.minExperience) params.append('minExperience', String(filters.minExperience));
          if (filters.maxDistance) params.append('maxDistance', String(filters.maxDistance));
          if (filters.selectedDay && filters.selectedDay !== 'All') params.append('day', filters.selectedDay);
        }

        url += '?' + params.toString();
      }

      const cgRes = await fetch(url);
      if (cgRes.ok) {
        const data = await cgRes.json();
        let list: CaregiverProfile[] = data.caregivers || [];

        // If current user is a caregiver, fetch their own profile so it's always in state even if pending/rejected
        if (user.role === 'caregiver') {
          try {
            const myProfRes = await fetch('/api/caregivers/profile');
            if (myProfRes.ok) {
              const myData = await myProfRes.json();
              if (myData.profile) {
                const idx = list.findIndex(c => c.id === myData.profile.id);
                if (idx !== -1) {
                  list[idx] = myData.profile;
                } else {
                  list = [myData.profile, ...list];
                }
              }
            }
          } catch (e) {
            console.error('Error fetching own caregiver profile:', e);
          }
        }

        setCaregivers(list);
      }

      // 6. Fetch admin logs if role is admin
      if (user.role === 'admin') {
        const logsRes = await fetch('/api/admin/logs');
        if (logsRes.ok) {
          const data = await logsRes.json();
          setAdminLogs(data.adminLogs || []);
        }
      }
    } catch (err) {
      console.error('Error fetching CareConnect state:', err);
    }
  };

  // Hydrate session on mount
  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setCurrentUserState(data.user);
          await refreshData(data.user);
        }
      } catch (err) {
        console.error('Session hydration failed', err);
      }
    };
    hydrateSession();
  }, []);

  // Periodic polling for real-time messages / status updates
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      refreshData(currentUser, caregiverFilters);
    }, 6000);
    return () => clearInterval(interval);
  }, [currentUser, caregiverFilters]);

  // If viewing a dynamic chat screen, auto-refresh messages when conversations change
  useEffect(() => {
    if (conversations.length > 0 && currentUser) {
      // Find the first conversation if active to hydrate messages
      const activeConv = conversations[0];
      if (activeConv) {
        fetch(`/api/conversations/${activeConv.id}/messages`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data?.messages) setMessages(data.messages);
          })
          .catch(err => console.error("Error fetching message history:", err));
      }
    }
  }, [conversations, currentUser]);

  const setCurrentUser = (user: UserProfile | null) => {
    setCurrentUserState(user);
  };

  // Auth Operations
  const login = async (email: string, password: string): Promise<UserProfile | null> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const loggedInUser: UserProfile = {
          id: data.user.id,
          fullName: data.user.fullName,
          email: data.user.email,
          phone: data.user.phone || '',
          avatarUrl: data.user.avatarUrl || '',
          role: data.user.role,
        };
        setCurrentUserState(loggedInUser);
        showToast('Login Success', `Logged in as ${data.user.fullName}`, 'success');
        await refreshData(loggedInUser);
        return loggedInUser;
      } else {
        const data = await res.json().catch(() => ({}));
        showToast('Login Failed', data.error || 'Invalid credentials', 'error');
        return null;
      }
    } catch (err) {
      showToast('Login Error', 'Failed to connect to authentication server', 'error');
      return null;
    }
  };

  const signupUser = async (fullName: string, email: string, phone: string, password: string, role: Role): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, password, role }),
      });

      if (res.ok) {
        showToast('Sign Up Success', 'Registering details...', 'success');
        const user = await login(email, password);
        return !!user;
      } else {
        const data = await res.json().catch(() => ({}));
        showToast('Registration Failed', data.error || 'Failed to create user', 'error');
        return false;
      }
    } catch (err) {
      showToast('Registration Error', 'Failed to connect to sign-up server', 'error');
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUserState(null);
      setCaregivers([]);
      setBookings([]);
      setConversations([]);
      setMessages([]);
      setNotifications([]);
      setAdminLogs([]);
      showToast('Logged Out', 'Successfully logged out.', 'info');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Booking Operations
  const requestBooking = async (caregiverId: string, serviceName: string, date: string, timeSlot: string, notes: string) => {
    try {
      const times = timeSlot.split('-');
      const startTimeStr = times[0]?.trim() || '09:00';
      const endTimeStr = times[1]?.trim() || '13:00';

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId,
          serviceName,
          startDate: `${date}T${startTimeStr}:00.000Z`,
          endDate: `${date}T${endTimeStr}:00.000Z`,
          notes,
        }),
      });

      if (res.ok) {
        showToast('Booking Requested', 'Your booking request has been submitted.', 'success');
        await refreshData();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast('Request Failed', data.error || 'Failed to send booking request', 'error');
      }
    } catch (err) {
      showToast('Booking Error', 'Could not request booking.', 'error');
    }
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        showToast('Booking Status Updated', `Booking has been marked as ${status}.`, status === 'accepted' ? 'success' : 'warning');
        await refreshData();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast('Update Failed', data.error || 'Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Update Error', 'Could not update booking status.', 'error');
    }
  };

  const submitReview = async (bookingId: string, rating: number, comment: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });

      if (res.ok) {
        showToast('Review Submitted', 'Thank you for your rating and feedback!', 'success');
        await refreshData();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast('Review Failed', data.error || 'Failed to submit review', 'error');
      }
    } catch (err) {
      showToast('Review Error', 'Could not submit review.', 'error');
    }
  };

  // Messaging Operations
  const createConversation = async (caregiverId: string): Promise<string> => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId }),
      });

      if (res.ok) {
        const data = await res.json();
        await refreshData();
        return data.conversationId || '';
      }
      return '';
    } catch (err) {
      console.error('Error starting conversation:', err);
      return '';
    }
  };

  const sendMessage = async (conversationId: string, senderId: string, text: string) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (res.ok) {
        const data = await res.json();
        // Optimistically add to message state for instant render
        setMessages(prev => [...prev, data.message]);
        await refreshData();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  // Admin Operations
  const approveCaregiver = async (caregiverId: string) => {
    try {
      const res = await fetch(`/api/admin/caregivers/${caregiverId}/approve`, {
        method: 'POST',
      });

      if (res.ok) {
        showToast('Caregiver Approved', 'Application status updated to approved.', 'success');
        await refreshData();
      }
    } catch (err) {
      console.error('Approve caregiver failed:', err);
    }
  };

  const rejectCaregiver = async (caregiverId: string) => {
    try {
      const res = await fetch(`/api/admin/caregivers/${caregiverId}/reject`, {
        method: 'POST',
      });

      if (res.ok) {
        showToast('Caregiver Rejected', 'Application status updated to rejected.', 'warning');
        await refreshData();
      }
    } catch (err) {
      console.error('Reject caregiver failed:', err);
    }
  };

  const updateCaregiverProfile = async (profile: Partial<CaregiverProfile>) => {
    try {
      const res = await fetch('/api/caregivers/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        showToast('Profile Updated', 'Your profile details have been saved.', 'success');
        await refreshData();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast('Update Failed', data.error || 'Failed to update details', 'error');
      }
    } catch (err) {
      showToast('Profile Error', 'Could not update caregiver profile.', 'error');
    }
  };

  const submitCaregiverApplication = async (data: Omit<CaregiverProfile, 'id' | 'approvalStatus' | 'rating' | 'reviewsCount'>): Promise<boolean> => {
    try {
      // First update the profile details
      const updateRes = await fetch('/api/caregivers/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!updateRes.ok) {
        const errData = await updateRes.json().catch(() => ({}));
        showToast('Update Failed', errData.error || 'Failed to save profile documents', 'error');
        return false;
      }

      // Then submit the application to reset status to pending
      const submitRes = await fetch('/api/caregivers/application', {
        method: 'POST',
      });

      if (!submitRes.ok) {
        const errData = await submitRes.json().catch(() => ({}));
        showToast('Submission Failed', errData.error || 'Failed to submit application', 'error');
        return false;
      }

      showToast('Application Submitted', 'Admin will review your verification details shortly.', 'success');
      await refreshData();
      return true;
    } catch (err) {
      console.error('Application submission failed:', err);
      showToast('Submission Error', 'An error occurred while saving your application.', 'error');
      return false;
    }
  };

  const updateUserProfile = async (profileData: { fullName?: string; email?: string; phone?: string; avatarUrl?: string }): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUserState({
            id: data.user.id,
            fullName: data.user.fullName,
            email: data.user.email,
            phone: data.user.phone || '',
            avatarUrl: data.user.avatarUrl || '',
            role: data.user.role,
          });
        }
        showToast('Profile Updated', 'Your profile details have been saved.', 'success');
        await refreshData(data.user);
        return true;
      } else {
        const data = await res.json().catch(() => ({}));
        showToast('Update Failed', data.error || 'Failed to update details', 'error');
        return false;
      }
    } catch (err) {
      showToast('Profile Error', 'Could not update profile.', 'error');
      return false;
    }
  };

  const updateCaregiverFilters = async (filters: any) => {
    setCaregiverFiltersState(filters);
    await refreshData(currentUser, filters);
  };

  const addService = async (name: string, description: string) => {
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        showToast('Service Type Added', `Added ${name} category successfully`, 'success');
        await refreshData();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast('Submission Failed', data.error || 'Failed to add service', 'error');
      }
    } catch (err) {
      console.error('Add service type failed:', err);
    }
  };

  const deleteService = async (id: string) => {
    try {
      const res = await fetch(`/api/services?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast('Service Type Deleted', 'Category has been deleted.', 'warning');
        await refreshData();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast('Deletion Failed', data.error || 'Failed to delete service', 'error');
      }
    } catch (err) {
      console.error('Delete service type failed:', err);
    }
  };

  return (
    <CareConnectContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        caregivers,
        bookings,
        conversations,
        messages,
        notifications,
        adminLogs,
        services,
        toasts,
        showToast,
        addService,
        deleteService,
        login,
        logout,
        signupUser,
        requestBooking,
        updateBookingStatus,
        submitReview,
        sendMessage,
        createConversation,
        markNotificationRead,
        approveCaregiver,
        rejectCaregiver,
        updateCaregiverProfile,
        submitCaregiverApplication,
        updateUserProfile,
        caregiverFilters,
        updateCaregiverFilters,
      }}
    >
      {children}

      {/* Global Realtime Toast Notifications Overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bgColor = 'bg-white';
          let borderColor = 'border-slate-200';
          let textColor = 'text-slate-900';
          let iconColor = 'text-blue-600';
          let iconBg = 'bg-blue-50';

          if (toast.type === 'success') {
            bgColor = 'bg-white';
            borderColor = 'border-emerald-100';
            iconColor = 'text-emerald-600';
            iconBg = 'bg-emerald-50';
          } else if (toast.type === 'warning') {
            bgColor = 'bg-white';
            borderColor = 'border-amber-100';
            iconColor = 'text-amber-600';
            iconBg = 'bg-amber-50';
          } else if (toast.type === 'error') {
            bgColor = 'bg-white';
            borderColor = 'border-red-100';
            iconColor = 'text-red-600';
            iconBg = 'bg-red-50';
          }

          return (
            <div
              key={toast.id}
              className={`
                flex items-start gap-3.5 p-4 rounded-2xl border shadow-lg pointer-events-auto
                backdrop-blur-md transition-all duration-300 animate-slide-in-right ${bgColor} ${borderColor} ${textColor}
              `}
            >
              <div className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs ${iconColor} ${iconBg}`}>
                {toast.type === 'success' ? '✓' : toast.type === 'warning' ? '⚠' : toast.type === 'error' ? '✖' : 'ℹ'}
              </div>

              <div className="flex-1 min-w-0">
                <span className="block text-xs font-bold text-slate-800 leading-none mb-1">{toast.title}</span>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">{toast.message}</p>
              </div>

              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg p-0.5 transition-colors cursor-pointer self-start"
              >
                ✖
              </button>
            </div>
          );
        })}
      </div>
    </CareConnectContext.Provider>
  );
};

export const useCareConnect = () => {
  const context = useContext(CareConnectContext);
  if (!context) {
    throw new Error('useCareConnect must be used within a CareConnectProvider');
  }
  return context;
};
