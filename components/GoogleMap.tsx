'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CaregiverProfile } from '@/context/useCareConnect';

declare global {
  interface Window {
    L?: any;
  }
}

interface GoogleMapProps {
  caregivers: CaregiverProfile[];
  selectedCaregiverId: string | null;
  onSelectCaregiver: (id: string) => void;
  searchDistance: number; // in km
}

export default function GoogleMap({
  caregivers,
  selectedCaregiverId,
  onSelectCaregiver,
  searchDistance,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [apiError, setApiError] = useState(false);

  const mapInstanceRef = useRef<any>(null);
  const layersGroupRef = useRef<any>(null);

  // Center coordinate (simulate New York center)
  const centerLat = 40.7128;
  const centerLng = -74.0060;

  // 1. Dynamically load Leaflet Assets (CSS and JS)
  useEffect(() => {
    // Load CSS
    const existingLink = document.getElementById('leaflet-css');
    if (!existingLink) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load JS script
    if (window.L) {
      setMapLoaded(true);
      return;
    }

    const existingScript = document.getElementById('leaflet-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => setMapLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'leaflet-script';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => setApiError(true);
    document.head.appendChild(script);

    return () => {
      // Keep script and css tags in DOM to avoid reloading on page navigate
    };
  }, []);

  // 2. Initialize Map Instance and update layers dynamically
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.L) return;

    try {
      const L = window.L;

      // Initialize map instance once
      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView([centerLat, centerLng], 12);

        mapInstanceRef.current = map;

        // Use CartoDB Dark Matter tile layer for cosmic dark theme
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }).addTo(map);

        // Put Zoom Control on bottom-right instead of top-left
        L.control.zoom({
          position: 'bottomright',
        }).addTo(map);

        layersGroupRef.current = L.layerGroup().addTo(map);
      }

      const map = mapInstanceRef.current;
      const layersGroup = layersGroupRef.current;

      // Clear existing markers/circles before drawing updated set
      layersGroup.clearLayers();

      // 2a. Add Search distance radius circle
      L.circle([centerLat, centerLng], {
        color: '#a855f7',
        fillColor: '#a855f7',
        fillOpacity: 0.08,
        weight: 1.5,
        radius: searchDistance * 1000, // convert km to meters
      }).addTo(layersGroup);

      // 2b. Add User Pulsing Marker
      const userPulseIcon = L.divIcon({
        className: 'custom-pulse-icon',
        html: `
          <div class="relative flex h-5 w-5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-5 w-5 bg-cyan-500 border-2 border-white shadow-md"></span>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([centerLat, centerLng], { icon: userPulseIcon })
        .addTo(layersGroup)
        .bindPopup('<div style="color:#ffffff; font-family: Inter, sans-serif; font-size:12px; font-weight:700; padding:4px;"><b style="color:#38bdf8;">Your Location</b><br/>New York City</div>');

      // 2c. Add Caregivers Markers
      caregivers.forEach((cg) => {
        const isSelected = selectedCaregiverId === cg.id;

        const caregiverIcon = L.divIcon({
          className: 'custom-caregiver-marker',
          html: `
            <div class="relative flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-110">
              <div class="h-11 w-11 rounded-2xl border-2 ${
                isSelected
                  ? 'border-purple-400 scale-110 shadow-lg shadow-purple-500/50 ring-4 ring-purple-500/30'
                  : 'border-white/40 shadow-md bg-[#171b42]'
              } overflow-hidden bg-slate-900 transition-all">
                <img src="${cg.avatarUrl}" class="h-full w-full object-cover" />
              </div>
              <div class="absolute -bottom-1 h-3 w-3 rounded-full ${
                isSelected ? 'bg-purple-500 border-2 border-white' : 'bg-cyan-400 border border-white'
              }"></div>
            </div>
          `,
          iconSize: [44, 48],
          iconAnchor: [22, 48],
        });

        const marker = L.marker([cg.latitude, cg.longitude], { icon: caregiverIcon }).addTo(layersGroup);

        const popupContent = `
          <div style="font-family: Inter, sans-serif; min-width: 175px; padding: 6px; color: #ffffff;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <img src="${cg.avatarUrl}" style="width: 38px; height: 38px; border-radius: 10px; object-fit: cover; border: 1.5px solid rgba(255,255,255,0.2); background: #171b42;" />
              <div>
                <b style="font-size: 13px; color: #ffffff; display: block; line-height: 1.2; font-weight: 800;">${cg.fullName}</b>
                <span style="font-size: 11.5px; color: #38bdf8; font-weight: 800;">$${cg.hourlyRate}/hr</span>
              </div>
            </div>
            <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 10px; font-weight: 600; display: flex; align-items: center; gap: 4px;">
              <span style="color: #fbbf24;">⭐ ${cg.rating} Rating</span> • <span style="color: #94a3b8;">${cg.experienceYears} yrs exp</span>
            </div>
            <button id="btn-popup-${cg.id}" style="width: 100%; border: none; background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: #ffffff; padding: 7.5px 0; border-radius: 10px; font-size: 11px; font-weight: 800; cursor: pointer; transition: transform 0.15s, opacity 0.15s; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
              Select Caregiver
            </button>
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: false,
          offset: [0, -34],
        });

        marker.on('click', () => {
          onSelectCaregiver(cg.id);
        });

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-popup-${cg.id}`);
          if (btn) {
            btn.onclick = (e) => {
              e.stopPropagation();
              onSelectCaregiver(cg.id);
            };
          }
        });

        // Open popup and center if selected
        if (isSelected) {
          marker.openPopup();
          map.setView([cg.latitude, cg.longitude], 13, {
            animate: true,
            duration: 1,
          });
        }
      });
    } catch (err) {
      console.error('Error rendering Leaflet Map layers:', err);
      setApiError(true);
    }
  }, [mapLoaded, caregivers, selectedCaregiverId, searchDistance, onSelectCaregiver]);

  // Clean up map when component unmounts
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (apiError) {
    return (
      <div className="w-full h-full bg-[#111433] rounded-3xl flex items-center justify-center border border-white/15 p-6 text-center">
        <span className="text-xs font-bold text-slate-300">Failed to render Live Map Engine</span>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-3xl shadow-2xl border border-white/15 overflow-hidden bg-[#08091a]"
    />
  );
}

