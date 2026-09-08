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
    <div className="space-y-3 w-full animate-fade-in text-slate-900">
      {label && (
        <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </span>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
          <AlertCircle size={16} className="shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isUploading ? (
        <div className="border-2 border-dashed border-blue-500 bg-blue-50 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-xs font-bold text-blue-700">Compressing & Uploading to Storage...</p>
        </div>
      ) : value ? (
        /* Preview Screen */
        <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center gap-4 shadow-xs">
          {type === 'avatar' ? (
            <img
              src={value}
              alt="Avatar Preview"
              className="h-16 w-16 rounded-2xl object-cover border border-slate-300 bg-slate-100 shadow-xs"
            />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0 shadow-xs">
              <FileText className="h-8 w-8" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <span className="block text-xs font-black text-slate-900 truncate">
              {type === 'avatar' ? 'Profile Avatar Selected' : 'Verification Document Loaded'}
            </span>
            <span className="block text-[10px] text-blue-600 font-mono truncate mt-0.5">
              {isBase64 ? 'Custom base64 file' : value}
            </span>
          </div>

          <button
            type="button"
            onClick={clearSelection}
            className="rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 p-2.5 text-slate-500 transition-all shadow-xs cursor-pointer"
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
            ${dragActive ? 'border-blue-600 bg-blue-100 scale-[1.01]' : 'border-slate-300 bg-blue-50/40 hover:border-blue-500 hover:bg-blue-50/80'}
          `}
        >
          <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center shadow-xs">
            {type === 'avatar' ? <Camera className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-900">
              Drag & drop or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer font-extrabold"
              >
                browse local files
              </button>
            </p>
            <p className="text-[10px] text-slate-500">
              Supports JPEG, PNG, or PDFs up to 5MB.
            </p>
          </div>

          {/* Preset trigger */}
          <div className="pt-2 border-t border-slate-200/80 w-full flex justify-center">
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer bg-blue-100/70 hover:bg-blue-100 px-3.5 py-1.5 rounded-full border border-blue-200 transition-all"
            >
              <Sparkles className="h-3 w-3 text-amber-500" />
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
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3.5 animate-fade-in shadow-xs">
          <span className="block text-[10px] font-black text-blue-700 uppercase tracking-wider">
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
                  className="rounded-xl overflow-hidden border border-slate-200 hover:border-blue-600 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer shrink-0 bg-slate-100"
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
                  className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-left hover:border-blue-500 hover:bg-blue-50 hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer space-y-1"
                >
                  <span className="block font-extrabold text-[10px] text-slate-900 leading-none truncate">{doc.name}</span>
                  <span className="block text-[8px] text-slate-500 truncate">Template link</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

