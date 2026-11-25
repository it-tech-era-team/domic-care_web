'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, FileText, Camera, Loader2, AlertCircle } from 'lucide-react';
import { uploadMediaToStorage } from '@/lib/storage';

interface MediaPickerProps {
  value: string;
  onChange: (val: string) => void;
  type: 'avatar' | 'document';
  label?: string;
  required?: boolean;
}

export default function MediaPicker({ value, onChange, type, label, required }: MediaPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

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
      const bucket = type === 'avatar' ? 'avatars' : 'caregiver-documents';
      const uploadedUrl = await uploadMediaToStorage(file, bucket, type);
      onChange(uploadedUrl);
    } catch (err: any) {
      console.error('[MediaPicker] Upload error:', err);
      setErrorMsg(err.message || 'Failed to upload file. Please try again.');
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

  return (
    <div className="space-y-3 w-full animate-fade-in text-slate-900">
      {label && (
        <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label} {required && <span className="text-red-500 font-black ml-0.5">*</span>}
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
    </div>
  );
}
