'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

export interface AddressSuggestion {
  id: string;
  displayName: string;
  city?: string;
  street?: string;
  latitude?: number;
  longitude?: number;
}

interface AddressAutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  onSelectSuggestion?: (item: AddressSuggestion) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  showIcon?: boolean;
}

export default function AddressAutocompleteInput({
  value,
  onChange,
  onSelectSuggestion,
  placeholder = "e.g. 123 Main St, Pleven, Bulgaria",
  className = "",
  inputClassName = "",
  required = false,
  disabled = false,
  id,
  showIcon = true,
}: AddressAutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/location/autocomplete?q=${encodeURIComponent(value.trim())}`);
        if (res.ok) {
          const json = await res.json();
          const items: AddressSuggestion[] = json.data || [];
          setSuggestions(items);
          if (items.length > 0) {
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.warn("[AddressAutocompleteInput] Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [value]);

  const handleSelect = (item: AddressSuggestion) => {
    onChange(item.displayName);
    if (onSelectSuggestion) {
      onSelectSuggestion(item);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        {showIcon && (
          <MapPin className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-blue-600 pointer-events-none" />
        )}
        <input
          type="text"
          id={id}
          required={required}
          disabled={disabled}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className={
            inputClassName ||
            `w-full rounded-2xl border border-slate-200 bg-slate-50 ${
              showIcon ? "pl-10" : "pl-3.5"
            } pr-10 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all`
          }
        />
        {isLoading && (
          <div className="absolute top-3.5 right-3.5">
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100 animate-fade-in">
          {suggestions.map((item, idx) => (
            <button
              key={item.id || idx}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-2.5 hover:bg-blue-50/70 flex items-start gap-2.5 text-xs text-slate-800 transition-colors cursor-pointer group"
            >
              <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <div className="flex-1">
                <span className="font-semibold block text-slate-900 line-clamp-1">
                  {item.street || item.city || item.displayName.split(",")[0]}
                </span>
                <span className="text-[11px] text-slate-500 line-clamp-1">
                  {item.displayName}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
