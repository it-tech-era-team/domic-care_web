'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Camera, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { uploadMediaToStorage } from '@/lib/storage';

interface MediaPickerProps {
  value: string;
  onChange: (val: string) => void;
  type: 'avatar' | 'document';
  label?: string;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', // Female companion
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', // Male caregiver
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', // Female nurse
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', // Male nurse
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', // Female user
];

const PRESET_DOCUMENTS = [
  { name: 'CNIC / Identity Mock', url: 'https://placehold.co/600x400/png?text=CNIC+Verification+Mock' },
  { name: 'Nursing License Mock', url: 'https://placehold.co/600x400/png?text=LPN+Nursing+License+Mock' },
  { name: 'CPR Training Cert Mock', url: 'https://placehold.co/600x400/png?text=CPR+Training+Certificate+Mock' },
];

export default function MediaPicker({ value, onChange, type, label }: MediaPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setErrorMsg(null);
    try {
      const bucket = type === 'avatar' ? 'avatars' : 'documents';
      const uploadedUrl = await uploadMediaToStorage(file, bucket, type);
      onChange(uploadedUrl);
    } catch (err: any) {
      console.error('[MediaPicker] Upload error:', err);
      setErrorMsg(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const clearSelection = () => {
    onChange('');
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isBase64 = value.startsWith('data:');

  return (
    <div className="space-y-3 w-full animate-fade-in text-white">
      {label && (
        <span className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          {label}
        </span>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs flex items-center gap-2 font-medium">
          <AlertCircle size={16} className="shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isUploading ? (
        <div className="border-2 border-dashed border-purple-400 bg-purple-500/10 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
          <p className="text-xs font-bold text-purple-300">Compressing & Uploading to Storage...</p>
        </div>
      ) : value ? (
        /* Preview Screen */
        <div className="relative rounded-2xl border border-white/15 bg-[#171b42] p-4 flex items-center gap-4 shadow-xl">
          {type === 'avatar' ? (
            <img
              src={value}
              alt="Avatar Preview"
              className="h-16 w-16 rounded-2xl object-cover border border-white/20 bg-slate-800 shadow-md"
            />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-400/30 shrink-0 shadow-md">
              <FileText className="h-8 w-8" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <span className="block text-xs font-black text-white truncate">
              {type === 'avatar' ? 'Profile Avatar Selected' : 'Verification Document Loaded'}
            </span>
            <span className="block text-[10px] text-purple-300/80 font-mono truncate mt-0.5">
              {isBase64 ? 'Custom base64 file' : value}
            </span>
          </div>

          <button
            type="button"
            onClick={clearSelection}
            className="rounded-xl border border-white/15 bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-400/30 p-2.5 text-slate-300 transition-all shadow-sm cursor-pointer"
            title="Remove File"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      ) : (
        /* Upload Area */
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-3xl p-6 text-center transition-all flex flex-col items-center justify-center gap-3 select-none
            ${dragActive ? 'border-purple-400 bg-purple-500/20 scale-[1.01]' : 'border-white/15 bg-[#171b42] hover:border-purple-500/50 hover:bg-[#1e2352]'}
          `}
        >
          <div className="h-12 w-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-400/30 flex items-center justify-center shadow-inner">
            {type === 'avatar' ? <Camera className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-white">
              Drag & drop or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-purple-400 hover:text-purple-300 hover:underline cursor-pointer font-extrabold"
              >
                browse local files
              </button>
            </p>
            <p className="text-[10px] text-slate-400">
              Supports JPEG, PNG, or PDFs up to 5MB.
            </p>
          </div>

          {/* Preset trigger */}
          <div className="pt-2 border-t border-white/10 w-full flex justify-center">
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-purple-300 hover:text-white cursor-pointer bg-purple-500/20 px-3.5 py-1.5 rounded-full border border-purple-400/30 transition-all"
            >
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Or choose from sandbox presets</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={type === 'avatar' ? 'image/*' : 'image/*,application/pdf'}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Presets Grid */}
      {showPresets && !value && (
        <div className="rounded-2xl border border-white/15 bg-[#171b42] p-4 space-y-3.5 animate-fade-in shadow-xl">
          <span className="block text-[10px] font-black text-purple-300 uppercase tracking-wider">
            Sandbox Templates Library
          </span>
          
          {type === 'avatar' ? (
            <div className="flex flex-wrap gap-2.5">
              {PRESET_AVATARS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(url);
                    setShowPresets(false);
                  }}
                  className="rounded-xl overflow-hidden border border-white/20 hover:border-purple-400 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer shrink-0 bg-slate-900"
                >
                  <img src={url} alt={`Preset ${i}`} className="h-10 w-10 object-cover" />
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PRESET_DOCUMENTS.map((doc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(doc.url);
                    setShowPresets(false);
                  }}
                  className="rounded-xl border border-white/10 bg-[#111433] p-2.5 text-left hover:border-purple-400 hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer space-y-1"
                >
                  <span className="block font-extrabold text-[10px] text-white leading-none truncate">{doc.name}</span>
                  <span className="block text-[8px] text-slate-400 truncate">Template link</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

