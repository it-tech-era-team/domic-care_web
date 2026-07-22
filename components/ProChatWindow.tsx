'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useCareConnect, Message, Conversation } from '@/context/useCareConnect';
import {
  Send,
  Paperclip,
  MessageSquare,
  Search,
  Check,
  CheckCheck,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  X,
  Phone,
  AlertCircle
} from 'lucide-react';
import MediaPicker from '@/components/MediaPicker';

interface ProChatWindowProps {
  role: 'user' | 'caregiver';
  initialConvId?: string;
}

export default function ProChatWindow({ role, initialConvId }: ProChatWindowProps) {
  const { currentUser, conversations, messages, sendMessage, createConversation } = useCareConnect();

  const [activeConvId, setActiveConvId] = useState<string | null>(initialConvId || null);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter conversations for current user role
  const userConvs = useMemo(() => {
    return conversations.filter((c) => {
      if (role === 'user') return c.userId === currentUser?.id;
      return c.caregiverId === currentUser?.id;
    });
  }, [conversations, role, currentUser]);

  // Set default active conversation if none selected
  useEffect(() => {
    if (initialConvId) {
      setActiveConvId(initialConvId);
    } else if (userConvs.length > 0 && !activeConvId) {
      setActiveConvId(userConvs[0].id);
    }
  }, [userConvs, activeConvId, initialConvId]);

  // Active conversation object
  const activeConv = useMemo(() => {
    return userConvs.find((c) => c.id === activeConvId);
  }, [userConvs, activeConvId]);

  // Filter & search conversations list
  const filteredConvs = useMemo(() => {
    return userConvs.filter((c) => {
      const peerName = role === 'user' ? c.caregiverFullName : c.userFullName;
      return peerName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [userConvs, searchTerm, role]);

  // Filter messages for active conversation
  const activeMessages = useMemo(() => {
    return messages.filter((m) => m.conversationId === activeConvId);
  }, [messages, activeConvId]);

  // Smooth scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  // Auto poll active conversation every 3.5 seconds for real-time responsiveness
  useEffect(() => {
    if (!activeConvId) return;
    const interval = setInterval(async () => {
      try {
        await fetch(`/api/conversations/${activeConvId}/messages`);
      } catch (e) {
        // silent sync
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [activeConvId]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const contentToSend = selectedImage || inputText.trim();
    if (!contentToSend || !activeConvId || !currentUser) return;

    await sendMessage(activeConvId, currentUser.id, contentToSend);
    setInputText('');
    setSelectedImage(null);
    setShowMediaPicker(false);
  };

  const handleChipClick = (chipText: string) => {
    setInputText(chipText);
  };

  const formatMsgTime = (isoString: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDateHeader = (isoString: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (d.toDateString() === today.toDateString()) return 'Today';
      if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  };

  // Group active messages by Date Header
  const groupedMessages = useMemo(() => {
    const groups: { [dateStr: string]: Message[] } = {};
    activeMessages.forEach((m) => {
      const dateHeader = formatDateHeader(m.createdAt);
      if (!groups[dateHeader]) groups[dateHeader] = [];
      groups[dateHeader].push(m);
    });
    return Object.entries(groups);
  }, [activeMessages]);

  // Quick Action Chips
  const quickChips = role === 'caregiver'
    ? ["I'm on my way!", "Arrived at location", "Care session started", "Care session completed", "Please check vitals", "Running 10 mins late"]
    : ["Thank you!", "Please see instructions", "See you tomorrow", "Are you available now?", "Confirmed time", "Special care needed"];

  const peerName = role === 'user' ? activeConv?.caregiverFullName : activeConv?.userFullName;
  const peerAvatar = role === 'user' ? activeConv?.caregiverAvatar : activeConv?.userAvatar;
  const peerRole = role === 'user' ? 'Caregiver Professional' : 'Family Client';

  return (
    <div className="flex bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden min-h-[calc(100vh-120px)] max-h-[85vh] animate-fade-in">
      
      {/* ================= LEFT SIDEBAR: CONVERSATIONS ================= */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200/80 flex flex-col bg-slate-50/50 shrink-0">
        
        {/* Sidebar Header Banner */}
        <div className="p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-heading font-black text-lg flex items-center gap-2.5 tracking-tight">
              <div className="h-9 w-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black shadow-inner">
                <MessageSquare size={18} className="text-white" />
              </div>
              <span>Care Messages</span>
            </h1>
            <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-black shadow-sm">
              {userConvs.length} Active
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-200" size={15} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contacts..."
              className="w-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md pl-9 pr-3 py-2.5 text-xs text-white placeholder-blue-200 outline-none transition focus:bg-white focus:text-slate-900 focus:placeholder-slate-400"
            />
          </div>
        </div>

        {/* Conversations Feed */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80">
          {filteredConvs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-300">
                <MessageSquare size={24} />
              </div>
              <p className="text-xs font-bold text-slate-600">No active conversations</p>
              <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">
                Once a care booking is accepted, direct chat will automatically open here.
              </p>
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const isActive = conv.id === activeConvId;
              const name = role === 'user' ? conv.caregiverFullName : conv.userFullName;
              const avatar = role === 'user' ? conv.caregiverAvatar : conv.userAvatar;
              const hasUnread = (conv.unreadCount || 0) > 0;

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`
                    w-full p-4 text-left flex items-start gap-3.5 transition-all cursor-pointer relative
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-50/90 to-indigo-50/40 border-l-4 border-blue-600 shadow-sm'
                      : 'hover:bg-slate-100/60'}
                  `}
                >
                  <div className="relative shrink-0">
                    <img
                      src={avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=User'}
                      alt={name}
                      className="h-12 w-12 rounded-2xl object-cover border-2 border-white shadow-md ring-1 ring-slate-200"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-500/20" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className={`block font-extrabold text-xs truncate ${isActive ? 'text-blue-950' : 'text-slate-900'}`}>
                        {name}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 shrink-0 ml-1">
                        {formatMsgTime(conv.updatedAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate leading-tight font-medium">
                      {conv.lastMessage || 'No messages yet.'}
                    </p>

                    {conv.bookingService && (
                      <span className="inline-flex items-center gap-1 mt-2 text-[9px] font-black text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full border border-blue-200/60 uppercase tracking-wider">
                        <ShieldCheck size={11} />
                        {conv.bookingService}
                      </span>
                    )}
                  </div>

                  {hasUnread && (
                    <span className="shrink-0 h-5 min-w-[22px] px-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ================= RIGHT WORKSPACE: CHAT FEED ================= */}
      <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden relative">
        {activeConv ? (
          <>
            {/* Active Chat Header */}
            <div className="bg-white px-6 py-4.5 border-b border-slate-200/80 flex items-center justify-between shadow-xs z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={peerAvatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=User'}
                    alt={peerName}
                    className="h-12 w-12 rounded-2xl object-cover border-2 border-white shadow-md ring-4 ring-emerald-500/20"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-500/30 animate-pulse" />
                </div>

                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-heading font-black text-lg text-slate-900 leading-tight">
                      {peerName}
                    </h2>
                    <span className="rounded-full bg-slate-100 border border-slate-200/60 px-3 py-0.5 text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                      {peerRole}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-semibold">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Active Care Channel
                    </span>
                    {activeConv.bookingService && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-0.5 rounded-full font-bold text-[10px] shadow-sm">
                        <Calendar size={11} />
                        {activeConv.bookingService} • Confirmed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRefreshing(true)}
                  className="p-2.5 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer shadow-xs"
                  title="Sync Messages"
                >
                  <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-blue-600' : ''} />
                </button>
              </div>
            </div>

            {/* Messages Feed Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#F8FAFC] relative">
              {groupedMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                  <div className="h-16 w-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                    <Sparkles size={30} />
                  </div>
                  <p className="text-sm font-extrabold text-slate-800">Direct Care Messaging Channel</p>
                  <p className="text-xs text-slate-500 text-center max-w-md leading-relaxed">
                    Send instructions, confirm arrival times, or discuss medicine scheduling directly with {peerName}.
                  </p>
                </div>
              ) : (
                groupedMessages.map(([dateHeader, msgs]) => (
                  <div key={dateHeader} className="space-y-5">
                    {/* Date Separator Badge */}
                    <div className="flex items-center justify-center my-3">
                      <span className="bg-white border border-slate-200/90 text-slate-700 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        {dateHeader}
                      </span>
                    </div>

                    {msgs.map((m) => {
                      const isMe = m.senderId === currentUser?.id;
                      const isSystemGreeting = m.message.startsWith('Booking Confirmed!');

                      if (isSystemGreeting) {
                        return (
                          <div key={m.id} className="flex justify-center my-4">
                            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50/80 border border-emerald-200/90 text-emerald-950 text-xs p-5 rounded-3xl max-w-xl shadow-md flex items-start gap-3.5">
                              <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-extrabold text-emerald-950 leading-relaxed text-sm">{m.message}</p>
                                <span className="text-[10px] text-emerald-700 font-bold block mt-2">
                                  {formatMsgTime(m.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={m.id}
                          className={`flex items-end gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isMe && (
                            <img
                              src={peerAvatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=User'}
                              alt="Peer"
                              className="h-8 w-8 rounded-2xl object-cover border-2 border-white bg-white shrink-0 shadow-sm mb-1 ring-1 ring-slate-200"
                            />
                          )}

                          <div className={`max-w-[75%] sm:max-w-[65%] space-y-1.5 ${isMe ? 'items-end' : 'items-start'}`}>
                            
                            {/* Image Attachment render */}
                            {m.message.startsWith('data:image') || m.message.match(/\.(jpeg|jpg|png|webp|gif)/i) ? (
                              <div className="p-1.5 rounded-3xl bg-white border border-slate-200 shadow-xl">
                                <img
                                  src={m.message}
                                  alt="Attachment"
                                  className="max-h-64 w-auto rounded-2xl object-cover"
                                />
                              </div>
                            ) : (
                              <div
                                className={`
                                  p-4 rounded-3xl text-xs sm:text-sm font-semibold leading-relaxed shadow-md
                                  ${isMe
                                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-br-xs'
                                    : 'bg-white text-slate-900 border border-slate-200/90 rounded-bl-xs'}
                                `}
                              >
                                {m.message}
                              </div>
                            )}

                            {/* Message Meta Info */}
                            <div className={`flex items-center gap-1.5 text-[10px] font-bold text-slate-400 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <span>{formatMsgTime(m.createdAt)}</span>
                              {isMe && (
                                m.read ? (
                                  <span title="Read"><CheckCheck size={14} className="text-blue-500" /></span>
                                ) : (
                                  <span title="Sent"><Check size={14} className="text-slate-400" /></span>
                                )
                              )}
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Chips Bar */}
            <div className="px-5 py-3 bg-slate-100/90 backdrop-blur-md border-t border-b border-slate-200/80 flex items-center gap-2.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-500" />
                Quick Reply:
              </span>
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChipClick(chip)}
                  className="shrink-0 rounded-full border border-slate-200 bg-white hover:bg-blue-600 hover:border-blue-600 hover:text-white px-4 py-1.5 text-xs font-bold text-slate-700 transition shadow-xs cursor-pointer active:scale-95"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Media Picker Modal Overlay */}
            {showMediaPicker && (
              <div className="p-4 bg-white border-t border-slate-200 animate-slide-in-up">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Attach Image File</span>
                  <button onClick={() => setShowMediaPicker(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                </div>
                <MediaPicker
                  label="Select Image Attachment"
                  value={selectedImage || ''}
                  type="document"
                  onChange={(url: string) => {
                    setSelectedImage(url);
                    setShowMediaPicker(false);
                  }}
                />
              </div>
            )}

            {/* Image Preview Banner */}
            {selectedImage && (
              <div className="px-5 py-3 bg-blue-50 border-t border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <ImageIcon size={16} />
                  <span>Image ready to send</span>
                </div>
                <button onClick={() => setSelectedImage(null)} className="text-blue-600 hover:text-blue-900">
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Message Input Bar */}
            <form onSubmit={handleSend} className="bg-white p-4 border-t border-slate-200/80 flex items-center gap-3 shadow-xl">
              <button
                type="button"
                onClick={() => setShowMediaPicker(!showMediaPicker)}
                className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition cursor-pointer"
                title="Attach image file"
              >
                <Paperclip size={20} />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Type a message to ${peerName}...`}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition"
              />

              <button
                type="submit"
                disabled={!inputText.trim() && !selectedImage}
                className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-3.5 shadow-lg shadow-blue-500/25 disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer font-black text-xs uppercase tracking-wider active:scale-95"
              >
                <span>Send</span>
                <Send size={15} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 space-y-4">
            <div className="h-20 w-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
              <MessageSquare size={38} />
            </div>
            <h3 className="font-heading font-black text-lg text-slate-800">Select a Conversation</h3>
            <p className="text-xs text-slate-500 text-center max-w-sm leading-relaxed">
              Choose a contact from the left list to view messages and direct care updates.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
