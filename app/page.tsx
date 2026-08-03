'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useCareConnect, Service } from '@/context/useCareConnect';
import {
  Shield,
  Calendar,
  MessageSquare,
  MapPin,
  Heart,
  ArrowRight,
  UserCheck,
  Star,
  Sparkles,
  Activity,
  Stethoscope,
  HeartHandshake,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Users,
  Clock,
  Phone,
  Search,
  CalendarCheck,
  ClipboardList,
  UserSearch,
  Home as HomeIcon,
  ChevronLeft,
  Quote,
  BadgeCheck,
  Zap,
  TrendingUp,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FeaturedCaregiver {
  id: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  experienceYears: number;
  hourlyRate: number;
  city: string;
  services: string[];
  rating: number;
  reviewsCount: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_CHIPS = [
  'Home Nursing',
  'Personal Care',
  'Companionship',
  'Dementia Care',
  'Medication',
  'Physiotherapy',
  'Post Surgery',
  'Respite Care',
];

const STATIC_FALLBACK_CAREGIVERS: FeaturedCaregiver[] = [
  {
    id: 'fc-1',
    fullName: 'Sarah Mitchell, RN',
    avatarUrl: '',
    bio: 'Registered nurse with 12 years of home care experience.',
    experienceYears: 12,
    hourlyRate: 25,
    city: 'Karachi',
    services: ['Home Nursing', 'Medication'],
    rating: 4.9,
    reviewsCount: 93,
  },
  {
    id: 'fc-2',
    fullName: 'Ahmed Raza',
    avatarUrl: '',
    bio: 'Certified elder care specialist and physiotherapist.',
    experienceYears: 8,
    hourlyRate: 22,
    city: 'Lahore',
    services: ['Personal Care', 'Physiotherapy'],
    rating: 4.8,
    reviewsCount: 71,
  },
  {
    id: 'fc-3',
    fullName: 'Maria Gonzalez',
    avatarUrl: '',
    bio: 'Compassionate companion for seniors and post-surgery patients.',
    experienceYears: 6,
    hourlyRate: 20,
    city: 'Islamabad',
    services: ['Companionship', 'Post Surgery'],
    rating: 4.9,
    reviewsCount: 110,
  },
  {
    id: 'fc-4',
    fullName: 'James Okonkwo',
    avatarUrl: '',
    bio: 'Dementia care specialist with clinical nursing background.',
    experienceYears: 7,
    hourlyRate: 21,
    city: 'Karachi',
    services: ['Dementia Care', 'Home Nursing'],
    rating: 4.7,
    reviewsCount: 48,
  },
];

const TESTIMONIALS = [
  {
    id: 't1',
    name: 'Fatima Malik',
    city: 'Lahore',
    rating: 5,
    text: 'DomicCare has been a blessing for our family. The caregiver is kind, professional, and always on time. My mother adores her!',
    initials: 'FM',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 't2',
    name: 'Hassan Qureshi',
    city: 'Karachi',
    rating: 5,
    text: 'Great service and amazing caregivers. My father feels safe and well cared for. Very easy to book through the platform.',
    initials: 'HQ',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 't3',
    name: 'Nadia Akhtar',
    city: 'Islamabad',
    rating: 5,
    text: 'Very easy to book and the support team is always helpful. Highly recommend DomicCare for anyone looking for trustworthy home care.',
    initials: 'NA',
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 't4',
    name: 'Omar Siddiqui',
    city: 'Rawalpindi',
    rating: 4,
    text: 'The caregiver assigned to my grandmother is exceptional. Gentle, patient, and incredibly skilled. We feel at peace.',
    initials: 'OS',
    color: 'from-rose-500 to-pink-600',
  },
];

const SERVICE_ICONS = [HeartHandshake, Stethoscope, Activity, Sparkles, Shield, UserCheck, Heart, Users];
const SERVICE_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-teal-500 to-emerald-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-500',
  'from-cyan-500 to-blue-600',
];

const getServiceBullets = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('elder') || lower.includes('senior'))
    return ['Personal care & daily assistance', 'Companionship & emotional support', 'Mobility & safety support'];
  if (lower.includes('physio') || lower.includes('rehab'))
    return ['Pain management & recovery', 'Exercise & mobility training', 'Post-op rehabilitation'];
  if (lower.includes('nurs') || lower.includes('medic'))
    return ['Medication administration', 'Wound care & vitals check', 'Post-op clinical support'];
  if (lower.includes('companion'))
    return ['Social interaction & outings', 'Meal prep & light housekeeping', 'Emotional wellbeing support'];
  return ['Personalized family care', 'Certified professional helper', 'Flexible scheduling & safety'];
};

// ─── Render helpers ────────────────────────────────────────────────────────────
function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'xs' }) {
  const cls = size === 'sm' ? 'h-4 w-4' : 'h-3 w-3';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${cls} ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
        />
      ))}
    </div>
  );
}

function AvatarFallback({ name, gradient }: { name: string; gradient: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('');
  return (
    <div
      className={`h-full w-full flex items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white font-bold text-lg`}
    >
      {initials}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const { services: contextServices } = useCareConnect();
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [featuredCaregivers, setFeaturedCaregivers] = useState<FeaturedCaregiver[]>([]);
  const [activeChip, setActiveChip] = useState<string>('All');
  const [careTypeOptions, setCareTypeOptions] = useState<string[]>([]);
  const [searchWho, setSearchWho] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchCareType, setSearchCareType] = useState('');
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const chipRowRef = useRef<HTMLDivElement>(null);

  // Fetch services
  useEffect(() => {
    fetch('/api/services')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.services?.length > 0) {
          setServicesList(data.services);
          setCareTypeOptions(data.services.map((s: Service) => s.name));
        } else if (contextServices?.length > 0) {
          setServicesList(contextServices);
          setCareTypeOptions(contextServices.map((s) => s.name));
        }
      })
      .catch(() => {
        if (contextServices?.length > 0) {
          setServicesList(contextServices);
          setCareTypeOptions(contextServices.map((s) => s.name));
        }
      });
  }, [contextServices]);

  // Fetch featured caregivers
  useEffect(() => {
    fetch('/api/caregivers/featured')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.caregivers?.length > 0) {
          setFeaturedCaregivers(data.caregivers);
        } else {
          setFeaturedCaregivers(STATIC_FALLBACK_CAREGIVERS);
        }
      })
      .catch(() => setFeaturedCaregivers(STATIC_FALLBACK_CAREGIVERS));
  }, []);

  // Default services fallback
  const displayServices =
    servicesList.length > 0
      ? servicesList
      : [
          { id: 'd1', name: 'Elder Care', description: 'Comprehensive support for older adults facing physical or mental challenges.' },
          { id: 'd2', name: 'Physiotherapy', description: 'Treatment through exercise, massage, and heat therapy for recovery.' },
          { id: 'd3', name: 'Nursing & Medical Care', description: 'Registered nurses providing wound care, medication, and vitals monitoring.' },
          { id: 'd4', name: 'Companionship & Social Support', description: 'Engaging conversations, meal prep, and emotional wellbeing support.' },
        ];

  const filteredServices =
    activeChip === 'All'
      ? displayServices
      : displayServices.filter((s) => s.name.toLowerCase().includes(activeChip.toLowerCase()));

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchWho) params.set('who', searchWho);
    if (searchLocation) params.set('location', searchLocation);
    if (searchDate) params.set('date', searchDate);
    if (searchCareType) params.set('service', searchCareType);
    window.location.href = `/get-started?${params.toString()}`;
  };

  const prevTestimonial = () => setTestimonialIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const nextTestimonial = () => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length);

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1 — HERO (Depth-Layered)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden min-h-[88vh] flex items-center"
        style={{
          background:
            'linear-gradient(120deg, #0f172a 0%, #1e3a8a 30%, #1d4ed8 60%, #2563eb 100%)',
        }}
      >

        {/* Layer 2 — Blurred orbs (z-0, inside stacking context) */}
        <div className="absolute top-[-80px] right-[-80px] z-0 h-[500px] w-[500px] rounded-full bg-blue-400/25 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] z-0 h-[400px] w-[400px] rounded-full bg-indigo-300/20 blur-[100px] pointer-events-none" />
        <div className="absolute top-[40%] left-[30%] z-0 h-[300px] w-[300px] rounded-full bg-sky-200/15 blur-[80px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-20">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">

            {/* ── Left column ── */}
            <div className="lg:col-span-6 space-y-7 text-center lg:text-left z-10 relative">

              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-1.5 text-sm font-bold text-white shadow-sm">
                <div className="flex -space-x-1.5">
                  {['#3b82f6','#10b981','#f59e0b'].map((c, i) => (
                    <span key={i} className="h-5 w-5 rounded-full border-2 border-white/80" style={{ background: c }} />
                  ))}
                </div>
                Trusted by 1,200+ Families
              </div>

              {/* Star rating */}
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400 star-glow" />
                  ))}
                </div>
                <span className="text-white font-bold text-sm">4.9</span>
                <span className="text-blue-100 text-sm">(230 reviews)</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
                Compassionate Care{' '}
                <span className="text-amber-300">Right at Home</span>
              </h1>

              <p className="text-white/85 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                Professional caregivers you can trust. Personalized care your loved ones deserve — verified, background-checked, and available 24/7.
              </p>

              {/* Trust pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {[
                  { icon: ShieldCheck, label: 'Verified Caregivers' },
                  { icon: BadgeCheck, label: 'Background Checked' },
                  { icon: Clock, label: 'Available 24/7' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/40 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm"
                  >
                    <Icon className="h-4 w-4 text-amber-300" />
                    {label}
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Link
                  href="/get-started"
                  className="flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-blue-700 hover:bg-blue-50 shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all"
                >
                  Book a Caregiver <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="flex items-center justify-center gap-2 rounded-full border-2 border-white/60 bg-white/15 backdrop-blur-sm px-8 py-3.5 text-sm font-bold text-white hover:bg-white/25 hover:border-white transition-all"
                >
                  Learn How It Works
                </Link>
              </div>
            </div>

            {/* ── Right column — Hero image with floating cards ── */}
            <div className="mt-14 lg:mt-0 lg:col-span-6 relative flex justify-center lg:justify-end z-10">

              {/* Dot grid matrix */}
              <div className="absolute -top-8 -left-8 grid grid-cols-6 gap-2.5 opacity-20 hidden lg:grid">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-white" />
                ))}
              </div>

              {/* Layer 3 — Hero image (slightly overflows right) */}
              <div
                className="relative animate-float"
                style={{ filter: 'drop-shadow(0 32px 64px rgba(30,64,175,0.45))' }}
              >
                <div className="relative w-[340px] sm:w-[420px] h-[460px] sm:h-[520px] rounded-[32px] overflow-hidden border-4 border-white/60 lg:translate-x-6">
                  <img
                    src="/Background images/Caregiver_assisting_elderly_woma%E2%80%A6_202607311845.jpeg"
                    alt="Professional caregiver assisting elderly woman"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      // Fallback to another image if first fails
                      (e.target as HTMLImageElement).src =
                        '/Background images/Caregiver_and_woman_with_tablet_202607311853.jpeg';
                    }}
                  />
                  {/* Dark vignette at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-blue-900/50 to-transparent" />
                </div>

                {/* Layer 4A — Glass card: 24/7 Support (top-right) */}
                <div className="glass-card absolute -top-4 -right-4 sm:-right-8 z-20 rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3 min-w-[170px]">
                  <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold text-slate-900 leading-none">24/7 Support</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">We are here to help</p>
                  </div>
                </div>

                {/* Layer 4B — Glass card: Rating (bottom-left) */}
                <div className="glass-card absolute -bottom-4 -left-4 sm:-left-8 z-20 rounded-2xl px-4 py-3 shadow-2xl min-w-[160px]">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400 star-glow" />
                    <span className="text-sm font-extrabold text-slate-900">4.9 Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                      {['#3b82f6','#10b981','#f59e0b','#ec4899'].map((c, i) => (
                        <span key={i} className="h-5 w-5 rounded-full border-2 border-white" style={{ background: c }} />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium ml-1">230+ reviews</span>
                  </div>
                </div>

                {/* Layer 4C — Glass card: Verified (mid-left) */}
                <div className="glass-card absolute top-1/2 -translate-y-1/2 -left-6 sm:-left-10 z-20 rounded-2xl px-3 py-2.5 shadow-2xl flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
                    <ShieldCheck className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold text-slate-900 leading-none">Verified &</p>
                    <p className="text-[11px] font-extrabold text-slate-900 leading-none">Trusted Care</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2 — SMART SEARCH BAR (overlapping hero bottom)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-20 px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="mx-auto max-w-5xl">
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 sm:p-5"
            style={{ boxShadow: '0 20px 60px rgba(30,64,175,0.18), 0 4px 16px rgba(0,0,0,0.06)' }}
          >
            <div className="flex flex-col md:flex-row items-stretch gap-3">

              {/* Who needs care? */}
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Who needs care?</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                  <select
                    value={searchWho}
                    onChange={(e) => setSearchWho(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all appearance-none"
                  >
                    <option value="">Select person</option>
                    <option value="myself">Myself</option>
                    <option value="parent">Parent</option>
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="hidden md:block w-px bg-slate-100" />

              {/* Where? */}
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">📍 Where?</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="City or area"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="hidden md:block w-px bg-slate-100" />

              {/* Date */}
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">📅 Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              <div className="hidden md:block w-px bg-slate-100" />

              {/* Care Type */}
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">🩺 Care Type</label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                  <select
                    value={searchCareType}
                    onChange={(e) => setSearchCareType(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all appearance-none"
                  >
                    <option value="">Select care type</option>
                    {careTypeOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                    {careTypeOptions.length === 0 && CATEGORY_CHIPS.map((chip) => (
                      <option key={chip} value={chip}>{chip}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search button */}
              <button
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 px-7 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.04] active:scale-[0.98] transition-all shrink-0 cursor-pointer"
              >
                <Search className="h-4.5 w-4.5" />
                <span>Search Caregivers</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3 — STATS BAR
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 border-y border-slate-100 bg-gradient-to-b from-slate-50 to-white mt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, value: '1,200+', label: 'Happy Families', color: 'bg-blue-50 text-blue-600' },
              { icon: UserCheck, value: '400+', label: 'Professional Caregivers', color: 'bg-teal-50 text-teal-600' },
              { icon: Heart, value: '98%', label: 'Satisfaction Rate', color: 'bg-rose-50 text-rose-600' },
              { icon: Clock, value: '24/7', label: 'Support Available', color: 'bg-amber-50 text-amber-600' },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="flex items-center gap-4 group">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
                  <p className="text-sm text-slate-500 font-medium mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4 — CATEGORY CHIPS
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="chip-row-mask overflow-x-auto scrollbar-hide">
            <div ref={chipRowRef} className="flex items-center gap-3 pb-2 min-w-max px-4">
              {['All', ...CATEGORY_CHIPS].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setActiveChip(chip)}
                  className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap border transition-all duration-200 cursor-pointer ${
                    activeChip === chip
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-[1.03]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:shadow-md'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 5 — SERVICES + TOP RATED CAREGIVERS (2-col)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section id="services" className="py-16 sm:py-20 bg-gradient-to-b from-white via-blue-50/20 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 xl:gap-16">

            {/* ── Left: Services ── */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">What We Offer</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Our Services</h2>
                </div>
                <Link href="/get-started" className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 group whitespace-nowrap">
                  View All Services
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {(filteredServices.length > 0 ? filteredServices : displayServices).slice(0, 4).map((service, idx) => {
                  const IconComp = SERVICE_ICONS[idx % SERVICE_ICONS.length];
                  const grad = SERVICE_GRADIENTS[idx % SERVICE_GRADIENTS.length];
                  const bullets = getServiceBullets(service.name);
                  return (
                    <div
                      key={service.id || idx}
                      className="group relative flex flex-col rounded-2xl border border-slate-100 bg-white/80 backdrop-blur-sm p-6 shadow-lg hover-glow hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
                    >
                      {/* Background watermark */}
                      <div className="absolute -bottom-4 -right-4 opacity-[0.04] pointer-events-none">
                        <IconComp className="h-28 w-28 text-blue-600" strokeWidth={1} />
                      </div>

                      {/* Gradient icon */}
                      <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-md mb-4 group-hover:scale-105 transition-transform duration-300`}>
                        <IconComp className="h-6 w-6 text-white" />
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                        {service.name}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium mb-3 line-clamp-2">
                        {service.description || 'Professional care tailored to your family\'s unique needs.'}
                      </p>

                      <ul className="space-y-1.5 mb-4">
                        {bullets.slice(0,2).map((b, bi) => (
                          <li key={bi} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            {b}
                          </li>
                        ))}
                      </ul>

                      <Link
                        href={`/get-started?service=${encodeURIComponent(service.name)}`}
                        className="mt-auto flex items-center gap-1.5 text-xs font-extrabold text-blue-600 hover:text-blue-700 group/link"
                      >
                        Learn More
                        <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
                      </Link>

                      {/* Bottom glow bar */}
                      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${grad} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Right: Top Rated Caregivers ── */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Top Performers</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Top Rated Caregivers</h2>
                </div>
                <Link href="/get-started" className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 group whitespace-nowrap">
                  View All
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="space-y-4">
                {(featuredCaregivers.length > 0 ? featuredCaregivers : STATIC_FALLBACK_CAREGIVERS).slice(0, 4).map((cg, idx) => {
                  const grad = SERVICE_GRADIENTS[idx % SERVICE_GRADIENTS.length];
                  return (
                    <div
                      key={cg.id}
                      className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="h-14 w-14 rounded-full ring-2 ring-blue-100 overflow-hidden bg-slate-100">
                          {cg.avatarUrl ? (
                            <img src={cg.avatarUrl} alt={cg.fullName} className="h-full w-full object-cover" />
                          ) : (
                            <AvatarFallback name={cg.fullName} gradient={grad} />
                          )}
                        </div>
                        {/* Verified badge */}
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-extrabold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                              {cg.fullName}
                            </p>
                            <p className="text-xs text-slate-500 font-medium truncate">
                              {cg.services[0] || 'Professional Caregiver'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 bg-amber-50 rounded-full px-2 py-0.5 border border-amber-100">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-extrabold text-amber-700">{cg.rating}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {cg.experienceYears} Yrs Exp
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            {cg.city || 'Available'}
                          </span>
                          <span className="text-[11px] font-extrabold text-blue-600">
                            ${cg.hourlyRate}/hr
                          </span>
                        </div>
                      </div>

                      {/* Book Now button */}
                      <Link
                        href={`/get-started?caregiver=${cg.id}`}
                        className="shrink-0 flex items-center gap-1 rounded-full bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:scale-[1.05] transition-all"
                      >
                        Book Now
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 6 — IMMEDIATE CARE CTA BANNER
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-24 sm:py-32 min-h-[500px] flex items-center"
        style={{ background: 'linear-gradient(135deg, #090d16 0%, #1e3a8a 50%, #172554 100%)' }}
      >
        {/* Background image overlay - clearer visibility & full cover */}
        <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
          <img
            src="/Background images/Nurse_checking_senior_woman%27s_bl%E2%80%A6_202607311853.jpeg"
            alt="Nurse checking senior woman"
            className="w-full h-full object-cover object-center"
          />
          {/* Gentle vignette gradient to guarantee text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-blue-950/60 to-slate-950/70" />
        </div>

        {/* Orbs */}
        <div className="absolute top-0 right-0 z-0 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 z-0 h-96 w-96 rounded-full bg-indigo-500/25 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

            {/* Left */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 shadow-sm">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                Immediate 24/7 Response
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight">
                Need Immediate Care?
              </h2>
              <p className="text-slate-200 font-medium text-base sm:text-lg leading-relaxed max-w-lg">
                We're here for you. Get compassionate, certified professional care right at home, whenever you need it most.
              </p>
              <div className="pt-2">
                <a
                  href="tel:+923000000000"
                  className="inline-flex items-center gap-3.5 rounded-2xl border-2 border-blue-400/70 bg-blue-600/30 hover:bg-blue-600/50 backdrop-blur-md px-7 py-4 text-base font-bold text-white shadow-xl transition-all hover:scale-[1.03] active:scale-[0.98]"
                >
                  <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/40 shrink-0">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="block text-base font-extrabold text-white leading-none">+92 300 000 0000</span>
                    <span className="block text-xs font-semibold text-blue-200 mt-1">Call Now for Immediate Assistance</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Center — metric pills */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {[
                { icon: Clock, label: 'Caregiver Availability', value: '24/7 Immediate Dispatch' },
                { icon: Zap, label: 'Average Response Time', value: 'Within 30 Minutes' },
                { icon: MapPin, label: 'Nearby Caregivers', value: 'Verified & Local To You' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md px-6 py-4.5 shadow-lg hover:bg-white/15 transition-all">
                  <div className="h-12 w-12 rounded-xl bg-blue-600/60 border border-blue-400/40 flex items-center justify-center shrink-0 shadow-md">
                    <Icon className="h-6 w-6 text-blue-200" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-200 font-semibold">{label}</p>
                    <p className="text-base font-extrabold text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right — 30min badge */}
            <div className="lg:col-span-3 flex justify-center lg:justify-end">
              <div className="relative flex items-center justify-center py-6">
                {/* Pulsing rings */}
                <div className="absolute h-56 w-56 rounded-full border-2 border-blue-400/30 animate-pulse-slow" />
                <div className="absolute h-44 w-44 rounded-full border-2 border-blue-400/50 animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
                {/* Main badge */}
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex flex-col items-center justify-center shadow-2xl shadow-blue-500/60 border-4 border-white/20 animate-pulse-ring">
                  <span className="text-4xl font-black text-white leading-none">30</span>
                  <span className="text-xs font-bold text-blue-100 uppercase tracking-wider mt-0.5">min arrival</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 7 — HOW IT WORKS (Visual Icon Timeline)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative py-20 sm:py-28 bg-gradient-to-b from-slate-50 via-white to-blue-50/30 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-indigo-100/30 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-600 border border-blue-100">
              <Sparkles className="h-3.5 w-3.5" />
              Simple. Fast. Reliable.
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              How <span className="text-blue-600">DomicCare</span> Works
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-blue-200 rounded-full" />
              <Heart className="h-4 w-4 text-blue-400 fill-blue-400" />
              <span className="h-px w-8 bg-blue-200 rounded-full" />
            </div>
            <p className="text-slate-500 font-medium text-base">Four simple steps to coordinate quality care for your family.</p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-[52px] left-[18%] right-[18%] h-px border-t-2 border-dashed border-blue-300/60 z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { num: '1', icon: ClipboardList, label: 'Choose Care', desc: 'Select the type of care you need for your loved one.' },
                { num: '2', icon: UserSearch, label: 'Find Caregiver', desc: 'Browse and choose your perfect verified caregiver.' },
                { num: '3', icon: CalendarCheck, label: 'Book & Confirm', desc: 'Pick date, time and confirm your booking securely.' },
                { num: '4', icon: HomeIcon, label: 'Receive Care', desc: 'Caregiver arrives and provides the best quality care.' },
              ].map(({ num, icon: Icon, label, desc }, i) => (
                <div
                  key={num}
                  className="group relative flex flex-col items-center text-center rounded-3xl border border-slate-100 bg-white p-8 pt-12 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 z-10"
                >
                  {/* Number badge */}
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-lg shadow-blue-500/30 border-4 border-white z-20">
                    {num}
                  </div>

                  {/* Icon circle */}
                  <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-blue-100 transition-all duration-300 shadow-inner">
                    <Icon className="h-9 w-9 text-blue-600" />
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors mb-1">
                    {label}
                  </h3>
                  <div className="h-0.5 w-6 bg-blue-600 rounded-full mx-auto my-2" />
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>

                  {/* Bottom accent bar */}
                  <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href="/get-started"
              className="flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:scale-[1.03] transition-all"
            >
              Get Started Today <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 8 — WHAT FAMILIES SAY (Mixed: Stats + Text Reviews)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 sm:py-28 bg-white overflow-hidden">
        <div className="absolute top-0 left-0 -z-10 h-96 w-96 rounded-full bg-blue-50/60 blur-3xl" />
        <div className="absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-50/60 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Quote className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Reviews</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                What Families Say
              </h2>
            </div>
            <Link href="/get-started" className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 group">
              View All Reviews <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 3-column grid: review, stats card, review */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

            {/* Review card 1 */}
            <div className="group rounded-3xl border border-slate-100 bg-white p-7 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <Quote className="h-8 w-8 text-blue-100 mb-4" />
              <StarRow rating={TESTIMONIALS[0].rating} />
              <p className="text-sm text-slate-600 font-medium leading-relaxed mt-3 mb-5 line-clamp-4">
                "{TESTIMONIALS[0].text}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${TESTIMONIALS[0].color} flex items-center justify-center text-white text-sm font-extrabold shrink-0`}>
                  {TESTIMONIALS[0].initials}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">{TESTIMONIALS[0].name}</p>
                  <p className="text-xs text-slate-500 font-medium">{TESTIMONIALS[0].city}</p>
                </div>
              </div>
            </div>

            {/* Stats card (center — animated blue gradient) */}
            <div
              className="relative rounded-3xl p-8 flex flex-col justify-between overflow-hidden shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)' }}
            >
              {/* Decorative orb */}
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-blue-800/30 blur-xl" />

              <div className="relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="text-4xl font-black text-white">20K+</p>
                    <p className="text-blue-200 text-sm font-medium">Families Served</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-4xl font-black text-white">4.9</p>
                      <Star className="h-7 w-7 fill-amber-400 text-amber-400" />
                    </div>
                    <p className="text-blue-200 text-sm font-medium">Average Rating</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black text-white">98%</p>
                    <p className="text-blue-200 text-sm font-medium">Satisfaction Rate</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-white/20">
                <p className="text-xs text-blue-200 font-semibold">Trusted since 2024 · Growing every day</p>
              </div>
            </div>

            {/* Review card 2 */}
            <div className="group rounded-3xl border border-slate-100 bg-white p-7 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <Quote className="h-8 w-8 text-blue-100 mb-4" />
              <StarRow rating={TESTIMONIALS[1].rating} />
              <p className="text-sm text-slate-600 font-medium leading-relaxed mt-3 mb-5 line-clamp-4">
                "{TESTIMONIALS[1].text}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${TESTIMONIALS[1].color} flex items-center justify-center text-white text-sm font-extrabold shrink-0`}>
                  {TESTIMONIALS[1].initials}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">{TESTIMONIALS[1].name}</p>
                  <p className="text-xs text-slate-500 font-medium">{TESTIMONIALS[1].city}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Second row: 2 more review cards + a wider CTA card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.slice(2, 4).map((t) => (
              <div key={t.id} className="group rounded-3xl border border-slate-100 bg-white p-7 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <Quote className="h-8 w-8 text-blue-100 mb-4" />
                <StarRow rating={t.rating} />
                <p className="text-sm text-slate-600 font-medium leading-relaxed mt-3 mb-5 line-clamp-3">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-extrabold shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 9 — CAREGIVER CTA BANNER
      ══════════════════════════════════════════════════════════════════════════ */}
      <section id="for-caregivers" className="py-16 sm:py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl px-8 py-14 sm:px-14 shadow-2xl" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #7c3aed 100%)' }}>
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-blue-900/40 blur-2xl" />

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-bold text-white mb-4">
                <UserCheck className="h-3.5 w-3.5 text-amber-300" />
                For Professionals
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
                Are you a professional caregiver?
              </h2>
              <p className="text-blue-200 font-medium mb-6 text-base leading-relaxed">
                Join DomicCare to offer nursing, companionship, or daily care services. Set your hourly rates, upload verification documents, and connect with local families.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/get-started"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-blue-700 hover:bg-blue-50 shadow-xl hover:scale-[1.03] transition-all"
                >
                  Join as Caregiver <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-all"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 10 — FOOTER
      ══════════════════════════════════════════════════════════════════════════ */}
      <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-14">

            {/* Brand col */}
            <div className="col-span-2 md:col-span-3 lg:col-span-1 space-y-5">
              <Link href="/" className="flex items-center gap-2.5">
                <img
                  src="/domic_care_logo_without_text.jpeg"
                  alt="DomicCare Logo"
                  className="h-9 w-9 rounded-xl object-cover bg-slate-800 p-0.5"
                />
                <span className="font-heading text-lg font-bold text-white">
                  Domic<span className="text-blue-400">Care</span>
                </span>
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed max-w-[220px]">
                Compassionate care at home. Because your loved ones deserve the best.
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-3">
                {[
                  { label: 'Facebook', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
                  { label: 'Instagram', path: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z' },
                  { label: 'LinkedIn', path: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
                ].map(({ label, path }) => (
                  <a key={label} href="#" aria-label={label} className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 hover:bg-blue-600 hover:border-blue-600 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Services col */}
            <div>
              <span className="text-sm font-bold text-white block mb-5">Services</span>
              <ul className="space-y-3 text-sm">
                {['Home Nursing', 'Personal Care', 'Elderly Care', 'Specialized Care'].map((s) => (
                  <li key={s}>
                    <Link href={`/get-started?service=${encodeURIComponent(s)}`} className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group">
                      <ChevronRight className="h-3 w-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company col */}
            <div>
              <span className="text-sm font-bold text-white block mb-5">Company</span>
              <ul className="space-y-3 text-sm">
                {['About Us', 'Careers', 'Blog', 'Contact'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group">
                      <ChevronRight className="h-3 w-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources col */}
            <div>
              <span className="text-sm font-bold text-white block mb-5">Resources</span>
              <ul className="space-y-3 text-sm">
                {['Help Center', 'FAQs', 'Privacy Policy', 'Terms of Service'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group">
                      <ChevronRight className="h-3 w-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Download App col */}
            <div>
              <span className="text-sm font-bold text-white block mb-5">Download App</span>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">Get the DomicCare app for a better experience.</p>
              <div className="space-y-3">
                {/* Google Play */}
                <a href="#" className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:border-slate-600 px-4 py-2.5 transition-all group">
                  <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.18 23.76c.24.13.52.17.81.1l11.5-6.63-2.47-2.47-9.84 9zm15.54-8.97l2.32-1.34c.67-.38.67-1.02 0-1.4L18.72 10.5l-2.71 2.71 2.71 2.58zM3 .24L13.5 6.77l-2.47 2.47L3.18.34A1 1 0 0 0 3 .24zm9.79 9.29l1.71-1.71-9.5-5.48-1.71 1.71 9.5 5.48z" />
                  </svg>
                  <div>
                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">Get it on</p>
                    <p className="text-xs font-bold text-white">Google Play</p>
                  </div>
                </a>
                {/* App Store */}
                <a href="#" className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:border-slate-600 px-4 py-2.5 transition-all group">
                  <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div>
                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">Download on the</p>
                    <p className="text-xs font-bold text-white">App Store</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Footer bottom */}
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs gap-4">
            <p className="text-slate-500">© 2026 DomicCare. All rights reserved.</p>
            <p className="text-slate-500 flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-rose-400 fill-rose-400" /> for better care
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
