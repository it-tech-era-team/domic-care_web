'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCareConnect, CaregiverProfile } from '@/context/useCareConnect';
import GoogleMap from '@/components/GoogleMap';
import {
  Search, Filter, SlidersHorizontal, MapPin,
  Star, Briefcase, DollarSign, Calendar, Eye
} from 'lucide-react';

export default function SearchCaregivers() {
  const { caregivers, services, caregiverFilters, updateCaregiverFilters } = useCareConnect();
  
  // Local temporary states for filter inputs
  const [searchQuery, setSearchQuery] = useState(caregiverFilters.searchQuery || '');
  const [selectedService, setSelectedService] = useState(caregiverFilters.selectedService || 'All');
  const [maxRate, setMaxRate] = useState(caregiverFilters.maxRate || 40);
  const [minExperience, setMinExperience] = useState(caregiverFilters.minExperience || 0);
  const [maxDistance, setMaxDistance] = useState(caregiverFilters.maxDistance || 15);
  const [selectedDay, setSelectedDay] = useState(caregiverFilters.selectedDay || 'All');
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string | null>(null);

  const handleApplyFilters = () => {
    updateCaregiverFilters({
      searchQuery,
      selectedService,
      maxRate,
      minExperience,
      maxDistance,
      selectedDay,
      isActive: true,
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedService('All');
    setMaxRate(40);
    setMinExperience(0);
    setMaxDistance(15);
    setSelectedDay('All');
    updateCaregiverFilters({
      searchQuery: '',
      selectedService: 'All',
      maxRate: 40,
      minExperience: 0,
      maxDistance: 15,
      selectedDay: 'All',
      isActive: false,
    });
  };

  const daysOfWeek = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const servicesList = ['All', ...services.map(s => s.name)];

  const filteredCaregivers = useMemo(() => {
    return caregivers;
  }, [caregivers]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 sm:gap-8 max-w-7xl w-full mx-auto animate-fade-in min-h-[calc(100vh-100px)] text-slate-900">
      
      {/* Left Column: Filter Sidebar & Listing */}
      <div className="w-full lg:w-3/5 flex flex-col gap-6">
        
        {/* Search & Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 text-slate-900">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Find Verified Caregivers
            </h1>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Browse qualified caregivers, check availability, and schedule sessions.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute top-3.5 left-4.5 h-4.5 w-4.5 text-blue-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search caregivers by name, city, bio..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5 text-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4.5 w-4.5 text-blue-600" />
              <span className="text-xs font-black text-slate-900">Advanced Match Filters</span>
            </div>
            {caregiverFilters.isActive && (
              <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider animate-fade-in">
                Filters Applied
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Service Filter */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Service Needed</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 font-semibold focus:border-blue-600 focus:outline-none"
              >
                {servicesList.map(s => <option key={s} value={s} className="bg-white text-slate-900">{s}</option>)}
              </select>
            </div>

            {/* Day Availability */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">Day Needed</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 font-semibold focus:border-blue-600 focus:outline-none"
              >
                {daysOfWeek.map(d => <option key={d} value={d} className="bg-white text-slate-900">{d}</option>)}
              </select>
            </div>

            {/* Hourly Rate Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <span>Max Hourly Rate</span>
                <span className="text-blue-600 font-extrabold">${maxRate}/hr</span>
              </div>
              <input
                type="range"
                min="15"
                max="50"
                value={maxRate}
                onChange={(e) => setMaxRate(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Distance Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <span>Max Distance</span>
                <span className="text-blue-600 font-extrabold">Within {maxDistance} km</span>
              </div>
              <input
                type="range"
                min="2"
                max="25"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Experience Slider */}
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <span>Min Experience</span>
                <span className="text-blue-600 font-extrabold">{minExperience} Years</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={minExperience}
                onChange={(e) => setMinExperience(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Apply / Reset Buttons */}
            <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="px-5 py-2 text-xs font-black text-white nav-pill-active rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                Apply Filters
              </button>
            </div>

          </div>
        </div>

        {/* Caregivers Cards List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-600 font-bold px-2">
            <span>Showing {filteredCaregivers.length} results</span>
            <span>Sorted by Distance</span>
          </div>

          {filteredCaregivers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-slate-900">No Caregivers Match Filters</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed font-medium">
                Try widening your distance slider, adjusting hourly rate parameters, or choosing different day availability options.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCaregivers.map((cg) => {
                const isSelected = selectedCaregiverId === cg.id;
                return (
                  <div
                    key={cg.id}
                    onMouseEnter={() => setSelectedCaregiverId(cg.id)}
                    className={`
                      bg-white rounded-3xl border p-5 flex flex-col sm:flex-row sm:items-start gap-4 shadow-xs hover:shadow-md transition-all text-slate-900
                      ${isSelected ? 'border-blue-600 ring-2 ring-blue-500/20 scale-[1.005]' : 'border-slate-200'}
                    `}
                  >
                    {/* Avatar */}
                    <img
                      src={cg.avatarUrl}
                      alt={cg.fullName}
                      className="h-16 w-16 rounded-2xl object-cover shrink-0 border border-slate-200 bg-slate-100 mx-auto sm:mx-0 shadow-xs"
                    />

                    {/* Content Details */}
                    <div className="flex-1 space-y-2.5 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div>
                          <span className="block font-heading font-black text-base text-slate-900 leading-none">
                            {cg.fullName}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-semibold mt-1">
                            <MapPin className="h-3.5 w-3.5 text-blue-600" />
                            <span>{cg.address}, {cg.city} • <strong className="text-blue-600 font-bold">{cg.distance}km away</strong></span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1 justify-center sm:justify-start bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full self-center">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                          <span className="text-xs font-bold text-amber-700">{cg.rating}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-medium">
                        {cg.bio}
                      </p>

                      {/* Badges & Price */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 pt-2">
                        <div className="flex flex-wrap gap-1.5">
                          {cg.services.map((s) => (
                            <span key={s} className="rounded-lg bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                              {s}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="block text-[9px] font-extrabold text-slate-400 uppercase leading-none">Hourly Rate</span>
                            <span className="text-sm font-black text-slate-900">${cg.hourlyRate}<span className="text-[10px] text-slate-500 font-semibold">/hr</span></span>
                          </div>
                          
                          <Link
                            href={`/user/caregiver/${cg.id}`}
                            className="rounded-xl nav-pill-active p-2.5 text-white transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                            title="View Profile"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </Link>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Right Column: Google Live Map Widget */}
      <div className="w-full lg:w-2/5 h-[350px] lg:h-auto lg:sticky lg:top-8 rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
        <GoogleMap
          caregivers={filteredCaregivers}
          selectedCaregiverId={selectedCaregiverId}
          onSelectCaregiver={(id) => setSelectedCaregiverId(id)}
          searchDistance={maxDistance}
        />
      </div>

    </div>
  );
}
