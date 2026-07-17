'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCareConnect, Message, Conversation } from '@/context/useCareConnect';
import { Send, Paperclip, MessageSquare, Heart, Clock } from 'lucide-react';

export default function UserMessages() {
  const { currentUser, conversations, messages, sendMessage, createConversation } = useCareConnect();
  
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter conversations for the current user
  const userConvs = conversations.filter(c => c.userId === currentUser?.id);

  // Set first conversation active by default if none selected
  useEffect(() => {
    if (userConvs.length > 0 && !activeConvId) {
      setActiveConvId(userConvs[0].id);
    }
  }, [userConvs, activeConvId]);

  // Find active conversation
  const activeConv = userConvs.find(c => c.id === activeConvId);

  // Filter messages for active conversation
  const activeMessages = messages.filter(m => m.conversationId === activeConvId);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  // Trigger sending message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId || !currentUser) return;

    sendMessage(activeConvId, currentUser.id, inputText.trim());
    setInputText('');
  };

  const formatMsgTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex overflow-hidden min-h-[calc(100vh-120px)] animate-fade-in">
      
      {/* Left Column: Conversations List */}
      <div className="w-1/3 border-r border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-50">
          <h1 className="font-heading font-extrabold text-lg text-slate-900 flex items-center gap-1.5">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span>Conversations</span>
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {userConvs.length === 0 ? (
            <div className="p-6 text-center text-slate-400 space-y-2">
              <p className="text-xs font-semibold">No active conversations</p>
              <p className="text-[10px]">Open a caregiver profile to send a direct message.</p>
            </div>
          ) : (
            userConvs.map((conv) => {
              const isActive = conv.id === activeConvId;
              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveConvId(conv.id);
                  }}
                  className={`
                    w-full p-4 text-left flex items-center gap-3 transition-colors cursor-pointer
                    ${isActive ? 'bg-blue-50/20' : 'hover:bg-slate-50/50'}
                  `}
                >
                  <img
                    src={conv.caregiverAvatar}
                    alt={conv.caregiverFullName}
                    className="h-10 w-10 rounded-xl object-cover shrink-0 bg-slate-50 border border-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="block font-bold text-slate-800 text-xs truncate">
                        {conv.caregiverFullName}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold">
                        {conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate leading-none">
                      {conv.lastMessage || 'No messages yet.'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Chat Window */}
      <div className="flex-1 flex flex-col bg-slate-50/40">
        {activeConv ? (
          <>
            {/* Header */}
            <div className="bg-white px-5 py-3.5 border-b border-slate-100 flex items-center gap-3">
              <img
                src={activeConv.caregiverAvatar}
                alt={activeConv.caregiverFullName}
                className="h-10 w-10 rounded-xl object-cover border border-slate-100 bg-slate-50"
              />
              <div>
                <span className="block font-heading font-extrabold text-sm text-slate-900 leading-none">
                  {activeConv.caregiverFullName}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Online Simulator</span>
                </span>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {activeMessages.map((m) => {
                const isMe = m.senderId === currentUser?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <img
                        src={activeConv.caregiverAvatar}
                        alt="Caregiver"
                        className="h-6 w-6 rounded-md object-cover border border-slate-100 bg-slate-100"
                      />
                    )}
                    
                    <div className="max-w-[70%] space-y-0.5">
                      <div className={`
                        p-3 rounded-2xl text-xs leading-relaxed
                        ${isMe
                          ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-500/10'
                          : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'}
                      `}>
                        {m.message}
                      </div>
                      <span className={`block text-[9px] text-slate-400 font-bold ${isMe ? 'text-right' : 'text-left'}`}>
                        {formatMsgTime(m.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Bar */}
            <form onSubmit={handleSend} className="bg-white p-3 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl cursor-pointer"
                title="Mock Attachment"
              >
                <Paperclip className="h-4.5 w-4.5" />
              </button>
              
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message to caregiver..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10"
              />

              <button
                type="submit"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white p-2.5 shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 transition-all flex items-center justify-center cursor-pointer"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <MessageSquare className="h-12 w-12 text-slate-300" />
            <h3 className="font-bold text-slate-800">Select a Conversation</h3>
            <p className="text-xs text-slate-400">Choose a contact from the left list to begin messaging.</p>
          </div>
        )}
      </div>

    </div>
  );
}
