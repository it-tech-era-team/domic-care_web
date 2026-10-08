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
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
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
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
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

        // Use OpenStreetMap standard tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          subdomains: 'abcd',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Put Zoom Control on bottom-right instead of top-left
        L.control.zoom({
          position: 'bottomright',
        }).addTo(map);

        layersGroupRef.current = L.layerGroup().addTo(map);

        // Observe resize events to fix grey boxes
        const resizeObserver = new ResizeObserver(() => {
          map.invalidateSize();
        });
        resizeObserver.observe(mapRef.current);
        (map as any)._resizeObserver = resizeObserver;

        // Force invalidate size after delays to ensure Leaflet CSS is fully applied.
        // This solves the common grey boxes issue when CSS loads asynchronously.
        setTimeout(() => map.invalidateSize(), 150);
        setTimeout(() => map.invalidateSize(), 600);
      }

      const map = mapInstanceRef.current;
      const layersGroup = layersGroupRef.current;

      // Clear existing markers/circles before drawing updated set
      layersGroup.clearLayers();

      // 2a. Add Search distance radius circle
      L.circle([centerLat, centerLng], {
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        weight: 1.5,
        radius: searchDistance * 1000, // convert km to meters
      }).addTo(layersGroup);

      // 2b. Add User Pulsing Marker
      const userPulseIcon = L.divIcon({
        className: 'custom-pulse-icon',
        html: `
          <div class="relative flex h-5 w-5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-5 w-5 bg-blue-600 border-2 border-white shadow-md"></span>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([centerLat, centerLng], { icon: userPulseIcon })
        .addTo(layersGroup)
        .bindPopup('<div style="color:#0f172a; font-family: Inter, sans-serif; font-size:12px; font-weight:700; padding:4px;"><b style="color:#2563eb;">Your Location</b><br/>New York City</div>');

      // 2c. Add Caregivers Markers
      caregivers.forEach((cg) => {
        if (cg.latitude === undefined || cg.longitude === undefined || cg.latitude === null || cg.longitude === null) {
          return; // Skip if no valid coordinates
        }
        
        const isSelected = selectedCaregiverId === cg.id;

        const caregiverIcon = L.divIcon({
          className: 'custom-caregiver-marker',
          html: `
            <div class="relative flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-110">
              <div class="h-11 w-11 rounded-2xl border-2 ${
                isSelected
                  ? 'border-blue-600 scale-110 shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20'
                  : 'border-slate-200 shadow-md bg-white'
              } overflow-hidden bg-slate-100 transition-all">
                <img src="${cg.avatarUrl}" class="h-full w-full object-cover" />
              </div>
              <div class="absolute -bottom-1 h-3 w-3 rounded-full ${
                isSelected ? 'bg-blue-600 border-2 border-white' : 'bg-cyan-500 border border-white'
              }"></div>
            </div>
          `,
          iconSize: [44, 48],
          iconAnchor: [22, 48],
        });

        const marker = L.marker([cg.latitude, cg.longitude], { icon: caregiverIcon }).addTo(layersGroup);

        const popupContent = `
          <div style="font-family: Inter, sans-serif; min-width: 175px; padding: 6px; color: #0f172a;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <img src="${cg.avatarUrl}" style="width: 38px; height: 38px; border-radius: 10px; object-fit: cover; border: 1.5px solid #e2e8f0; background: #f8fafc;" />
              <div>
                <b style="font-size: 13px; color: #0f172a; display: block; line-height: 1.2; font-weight: 800;">${cg.fullName}</b>
                <span style="font-size: 11.5px; color: #2563eb; font-weight: 800;">$${cg.hourlyRate}/hr</span>
              </div>
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 10px; font-weight: 600; display: flex; align-items: center; gap: 4px;">
              <span style="color: #d97706;">⭐ ${cg.rating} Rating</span> • <span style="color: #64748b;">${cg.experienceYears} yrs exp</span>
            </div>
            <button id="btn-popup-${cg.id}" style="width: 100%; border: none; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; padding: 7.5px 0; border-radius: 10px; font-size: 11px; font-weight: 800; cursor: pointer; transition: transform 0.15s, opacity 0.15s; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);">
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
      // setApiError(true); // Disable global error state to prevent UI crash if one marker fails
    }
  }, [mapLoaded, caregivers, selectedCaregiverId, searchDistance, onSelectCaregiver]);

  // Clean up map when component unmounts
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        if (mapInstanceRef.current._resizeObserver) {
          mapInstanceRef.current._resizeObserver.disconnect();
        }
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (apiError) {
    return (
      <div className="w-full h-full bg-slate-100 rounded-3xl flex items-center justify-center border border-slate-200 p-6 text-center">
        <span className="text-xs font-bold text-slate-500">Failed to render Live Map Engine</span>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-3xl shadow-xs border border-slate-200 overflow-hidden bg-slate-100"
    />
  );
}

