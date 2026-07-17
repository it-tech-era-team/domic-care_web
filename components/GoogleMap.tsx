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

        // Use standard OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.06,
        weight: 1.5,
        radius: searchDistance * 1000, // convert km to meters
      }).addTo(layersGroup);

      // 2b. Add User Pulsing Marker
      const userPulseIcon = L.divIcon({
        className: 'custom-pulse-icon',
        html: `
          <div class="relative flex h-5 w-5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-white shadow-md"></span>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([centerLat, centerLng], { icon: userPulseIcon })
        .addTo(layersGroup)
        .bindPopup('<b>Your Location</b><br/>New York City');

      // 2c. Add Caregivers Markers
      caregivers.forEach((cg) => {
        const isSelected = selectedCaregiverId === cg.id;

        const caregiverIcon = L.divIcon({
          className: 'custom-caregiver-marker',
          html: `
            <div class="relative flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-110">
              <div class="h-10 w-10 rounded-2xl border-2 ${
                isSelected
                  ? 'border-blue-600 scale-110 shadow-lg shadow-blue-500/35'
                  : 'border-white shadow-md'
              } overflow-hidden bg-slate-50 transition-all">
                <img src="${cg.avatarUrl}" class="h-full w-full object-cover" />
              </div>
              <div class="absolute -bottom-1 h-2.5 w-2.5 rounded-full ${
                isSelected ? 'bg-blue-600' : 'bg-slate-400 border border-white'
              }"></div>
            </div>
          `,
          iconSize: [40, 44],
          iconAnchor: [20, 44],
        });

        const marker = L.marker([cg.latitude, cg.longitude], { icon: caregiverIcon }).addTo(layersGroup);

        const popupContent = `
          <div style="font-family: Inter, sans-serif; min-width: 160px; padding: 4px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <img src="${cg.avatarUrl}" style="width: 32px; height: 32px; border-radius: 8px; object-fit: cover;" />
              <div>
                <b style="font-size: 12.5px; color: #0f172a; display: block; line-height: 1.2;">${cg.fullName}</b>
                <span style="font-size: 11px; color: #2563eb; font-weight: 700;">$${cg.hourlyRate}/hr</span>
              </div>
            </div>
            <div style="font-size: 10px; color: #64748b; margin-bottom: 8px;">
              ⭐ ${cg.rating} Rating • ${cg.experienceYears} yrs exp
            </div>
            <button id="btn-popup-${cg.id}" style="width: 100%; border: none; background: #2563eb; color: #ffffff; padding: 5.5px 0; border-radius: 6.5px; font-size: 10.5px; font-weight: 600; cursor: pointer; transition: background 0.15s;">
              Select Caregiver
            </button>
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: false,
          offset: [0, -32],
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
      <div className="w-full h-full bg-slate-100 rounded-3xl flex items-center justify-center border border-slate-200">
        <span className="text-xs font-semibold text-slate-500">Failed to render Map Engine</span>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-3xl shadow-md border border-slate-200 overflow-hidden bg-slate-50"
    />
  );
}
