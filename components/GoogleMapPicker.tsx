'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, LocateFixed, Search, Loader2, AlertCircle } from 'lucide-react';

interface GoogleMapPickerProps {
  address: string;
  city: string;
  onAddressChange: (address: string) => void;
  onCityChange: (city: string) => void;
  onLocationChange: (coords: { latitude: number; longitude: number }) => void;
  /** Previously saved lat/lng (e.g. from an existing profile). Marker starts here if provided. */
  savedLatitude?: number | null;
  savedLongitude?: number | null;
  defaultZoom?: number;
}

declare global {
  interface Window {
    __leafletScriptLoading__?: Promise<void>;
  }
}

// Fallback center used only when there's no saved location, no address, and geolocation isn't available
const FALLBACK_LAT = 33.6844; // Islamabad
const FALLBACK_LNG = 73.0479;

const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

function loadLeaflet(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  if ((window as any).L) {
    return Promise.resolve();
  }

  if (window.__leafletScriptLoading__) {
    return window.__leafletScriptLoading__;
  }

  window.__leafletScriptLoading__ = new Promise((resolve, reject) => {
    // Leaflet CSS (needed for correct tile/marker rendering)
    if (!document.querySelector(`link[data-leaflet-css="true"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS_URL;
      link.setAttribute('data-leaflet-css', 'true');
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = LEAFLET_JS_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Leaflet script'));
    document.head.appendChild(script);
  });

  return window.__leafletScriptLoading__;
}

interface NominatimSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
}

export default function GoogleMapPicker({
  address,
  city,
  onAddressChange,
  onCityChange,
  onLocationChange,
  savedLatitude = null,
  savedLongitude = null,
  defaultZoom = 15,
}: GoogleMapPickerProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const suggestionsBoxRef = useRef<HTMLDivElement | null>(null);

  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  const cityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cityAbortRef = useRef<AbortController | null>(null);

  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Extract city name from Nominatim's address object
  const extractCity = (addr?: Record<string, string>): string => {
    if (!addr) return '';
    return (
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.county ||
      addr.state ||
      ''
    );
  };

  const updateMarkerPosition = useCallback((lat: number, lng: number) => {
    if (!mapInstanceRef.current || !markerInstanceRef.current) return;
    markerInstanceRef.current.setLatLng([lat, lng]);
    mapInstanceRef.current.panTo([lat, lng]);
  }, []);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      try {
        const url = `${NOMINATIM_REVERSE_URL}?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;
        const res = await fetch(url, {
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) throw new Error('Reverse geocode request failed');

        const data = await res.json();

        if (data && data.display_name) {
          onAddressChange(data.display_name);
          const cityName = extractCity(data.address);
          if (cityName) onCityChange(cityName);
        } else {
          setError('Could not determine address for this location, but coordinates were saved.');
        }
      } catch {
        setError('Could not determine address for this location, but coordinates were saved.');
      } finally {
        onLocationChange({ latitude: lat, longitude: lng });
      }
    },
    [onAddressChange, onCityChange, onLocationChange]
  );

  // Step 1: Load Leaflet (JS + CSS) from CDN — no API key required for OpenStreetMap
  useEffect(() => {
    let cancelled = false;

    loadLeaflet()
      .then(() => {
        if (!cancelled) setIsScriptLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load the map library. Check your network connection.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Step 2: Initialize the map once Leaflet is loaded
  useEffect(() => {
    if (!isScriptLoaded || !mapRef.current) return;

    const L = (window as any).L;

    // Priority for initial position: saved location > fallback
    const initialLat = savedLatitude ?? FALLBACK_LAT;
    const initialLng = savedLongitude ?? FALLBACK_LNG;

    const map = L.map(mapRef.current, {
      center: [initialLat, initialLng],
      zoom: defaultZoom,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);

    mapInstanceRef.current = map;
    markerInstanceRef.current = marker;

    // Draggable marker -> reverse geocode on drop
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      reverseGeocode(pos.lat, pos.lng);
    });

    // Click on map -> move marker there
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      updateMarkerPosition(lat, lng);
      reverseGeocode(lat, lng);
    });

    // If we have a saved location, immediately report it upward (without re-geocoding on mount)
    if (savedLatitude != null && savedLongitude != null) {
      onLocationChange({ latitude: savedLatitude, longitude: savedLongitude });
    }

    setIsMapReady(true);

    // --- Proper cleanup on unmount ---
    return () => {
      map.off();
      map.remove();
      mapInstanceRef.current = null;
      markerInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScriptLoaded]);

  // Clear any pending debounced searches on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
      if (searchAbortRef.current) searchAbortRef.current.abort();
      if (cityAbortRef.current) cityAbortRef.current.abort();
    };
  }, []);

  // Debounced address search using Nominatim (OpenStreetMap's free geocoder)
  const runSearch = useCallback((query: string) => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!query.trim() || query.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      if (searchAbortRef.current) searchAbortRef.current.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;

      setIsSearching(true);
      try {
        const url = `${NOMINATIM_SEARCH_URL}?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(
          query
        )}`;
        const res = await fetch(url, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error('Search request failed');

        const data: NominatimSuggestion[] = await res.json();
        setSuggestions(data || []);
        setShowSuggestions(true);

        // Live update: as soon as results come back, move the map/marker to the
        // best match so the map reflects what's typed, without waiting for a click.
        if (data && data.length > 0) {
          const top = data[0];
          const lat = parseFloat(top.lat);
          const lng = parseFloat(top.lon);
          if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
            updateMarkerPosition(lat, lng);
            onLocationChange({ latitude: lat, longitude: lng });
            const cityName = extractCity(top.address);
            if (cityName) onCityChange(cityName);
          }
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setError('Could not search for that address. Please try again.');
        }
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }, []);

  const handleAddressInputChange = (value: string) => {
    onAddressChange(value);
    setError(null);
    runSearch(value);
  };

  // Debounced city search — as the user types a city name, recenter the
  // map/marker on that city even if they haven't touched the address field.
  const runCitySearch = useCallback((query: string) => {
    if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);

    if (!query.trim() || query.trim().length < 3) return;

    cityDebounceRef.current = setTimeout(async () => {
      if (cityAbortRef.current) cityAbortRef.current.abort();
      const controller = new AbortController();
      cityAbortRef.current = controller;

      try {
        const url = `${NOMINATIM_SEARCH_URL}?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(
          query
        )}`;
        const res = await fetch(url, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error('City search request failed');

        const data: NominatimSuggestion[] = await res.json();
        if (data && data.length > 0) {
          const top = data[0];
          const lat = parseFloat(top.lat);
          const lng = parseFloat(top.lon);
          if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
            updateMarkerPosition(lat, lng);
            onLocationChange({ latitude: lat, longitude: lng });
            if (mapInstanceRef.current) mapInstanceRef.current.setZoom(12);
          }
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          // Silent — city-level live preview shouldn't block the user with errors
        }
      }
    }, 500);
  }, [onLocationChange, updateMarkerPosition]);

  const handleCityInputChange = (value: string) => {
    onCityChange(value);
    runCitySearch(value);
  };

  const handleSuggestionSelect = (suggestion: NominatimSuggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    const cityName = extractCity(suggestion.address);

    onAddressChange(suggestion.display_name);
    if (cityName) onCityChange(cityName);
    onLocationChange({ latitude: lat, longitude: lng });

    updateMarkerPosition(lat, lng);
    if (mapInstanceRef.current) mapInstanceRef.current.setZoom(16);

    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setError(null);
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateMarkerPosition(latitude, longitude);
        reverseGeocode(latitude, longitude);
        setIsLocating(false);
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError('Location access denied. Please allow location permissions in your browser.');
        } else {
          setError('Unable to retrieve your location. Please try again or search manually.');
        }
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3 w-full">
      {/* Address search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={address}
          onChange={(e) => handleAddressInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onBlur={() => {
            // Delay so a suggestion click can register before we hide the list
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          placeholder="Search your address..."
          disabled={!isMapReady}
          autoComplete="off"
          className="w-full rounded-xl border border-slate-200 pl-9 pr-9 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
        )}

        {/* Suggestions dropdown (Nominatim results) */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsBoxRef}
            className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden max-h-64 overflow-y-auto"
          >
            {suggestions.map((s, idx) => (
              <button
                key={`${s.lat}-${s.lon}-${idx}`}
                type="button"
                onMouseDown={(e) => {
                  // onMouseDown fires before the input's onBlur, so the click registers
                  e.preventDefault();
                  handleSuggestionSelect(s);
                }}
                className="w-full text-left px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 border-b border-slate-50 last:border-b-0 cursor-pointer"
              >
                {s.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* City (auto-filled, still editable) */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={city}
          onChange={(e) => handleCityInputChange(e.target.value)}
          placeholder="City"
          className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Use current location button */}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={isLocating || !isMapReady}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLocating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <LocateFixed className="h-3.5 w-3.5" />
        )}
        {isLocating ? 'Locating...' : 'Use Current Location'}
      </button>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Map container */}
      <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
        {!isMapReady && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
            <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
            <span className="text-[11px] font-semibold text-slate-400">Loading map...</span>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>

      <p className="text-[11px] text-slate-400 font-medium">
        Drag the marker, click on the map, or search above to set your exact location.
      </p>
    </div>
  );
}