'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Search,
  X,
  ChevronDown,
  ArrowRight,
  HeartHandshake,
  UserCheck,
  CreditCard,
  ShieldCheck,
  Sliders,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Check,
  Copy,
  Sparkles,
  ExternalLink,
  MessageSquare,
  BookOpen,
  Headphones,
  Calendar,
  DollarSign,
  Heart,
  ChevronRight
} from 'lucide-react';

type CategoryId = 'all' | 'families' | 'caregivers' | 'billing' | 'safety' | 'account' | 'policies';

interface HelpArticle {
  id: string;
  category: CategoryId;
  categoryName: string;
  title: string;
  summary: string;
  content: string[];
  tips?: string[];
  actionLink?: { label: string; href: string };
  tags: string[];
}

const CATEGORIES: {
  id: CategoryId;
  name: string;
  shortName: string;
  icon: React.ElementType;
  description: string;
  color: string;
}[] = [
  {
    id: 'families',
    name: 'Families & Care Seekers',
    shortName: 'For Families',
    icon: HeartHandshake,
    description: 'Booking care, caregiver matching, personalized care plans, and home nursing.',
    color: 'text-blue-600 bg-blue-50 border-blue-200'
  },
  {
    id: 'caregivers',
    name: 'Caregiver Hub',
    shortName: 'For Caregivers',
    icon: UserCheck,
    description: 'Vetting, shift check-ins, timesheet submission, profile approval, and ratings.',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
  },
  {
    id: 'billing',
    name: 'Billing, Rates & Stripe',
    shortName: 'Billing & Rates',
    icon: CreditCard,
    description: 'Hourly rates, automated Stripe invoicing, long-term care insurance, and receipts.',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
  },
  {
    id: 'safety',
    name: 'Trust, Safety & Insurance',
    shortName: 'Safety & Trust',
    icon: ShieldCheck,
    description: 'Criminal background vetting, bonded coverage, liability insurance, and emergency steps.',
    color: 'text-amber-600 bg-amber-50 border-amber-200'
  },
  {
    id: 'account',
    name: 'Account & App Settings',
    shortName: 'Account & App',
    icon: Sliders,
    description: 'Password reset, profile management, notification alerts, and mobile access.',
    color: 'text-purple-600 bg-purple-50 border-purple-200'
  },
  {
    id: 'policies',
    name: 'Policies & Cancellations',
    shortName: 'Legal & Terms',
    icon: FileText,
    description: '24-hour cancellation rules, service terms, privacy data rights, and code of conduct.',
    color: 'text-sky-600 bg-sky-50 border-sky-200'
  }
];

const POPULAR_GUIDES = [
  {
    id: 'guide-booking',
    title: 'How to Book Your First Caregiver in 3 Easy Steps',
    badge: 'Quick Start',
    readTime: '3 min read',
    icon: Calendar,
    steps: [
      'Submit your care requirements (location, hours, personalized care needs) on the Book Care page.',
      'Review verified caregiver matches with verified background checks, client reviews, and hourly rates.',
      'Confirm the booking with secure Stripe pre-authorization. Your caregiver confirms and arrives on schedule.'
    ],
    link: '/get-started'
  },
  {
    id: 'guide-payouts',
    title: 'How Caregiver Direct Payouts Work via Stripe',
    badge: 'For Caregivers',
    readTime: '2 min read',
    icon: DollarSign,
    steps: [
      'Complete your care shift and log service notes in your Caregiver Portal.',
      'The client approves the timesheet or it automatically confirms after 24 hours of completion.',
      'Payouts are transferred straight into your connected bank account via Stripe Connect within 48 business hours.'
    ],
    link: '/login'
  },
  {
    id: 'guide-late-sick',
    title: 'What to Do If a Caregiver is Running Late or Sick',
    badge: 'Urgent Care',
    readTime: '2 min read',
    icon: Clock,
    steps: [
      'Check in-app live chat or call your caregiver directly from your dashboard.',
      'If the caregiver cannot attend, our automated backup dispatch system immediately locates qualified substitutes.',
      'Call our 24/7 care coordinator hotline at 089 2760944 for immediate priority replacement assignment.'
    ],
    link: '/contact'
  },
  {
    id: 'guide-insurance',
    title: 'How to Submit Invoices for Long-Term Care Insurance',
    badge: 'Insurance & Billing',
    readTime: '4 min read',
    icon: FileText,
    steps: [
      'Download your itemized monthly billing statement and care logs from your Client Portal.',
      'Verify that caregiver license/certification numbers and daily activities are detailed on the statement.',
      'Forward the official PDF claim packet directly to your Long-Term Care insurance carrier for prompt reimbursement.'
    ],
    link: '/faq'
  }
];

const ARTICLES: HelpArticle[] = [
  {
    id: 'booking-how-to-match',
    category: 'families',
    categoryName: 'Families & Care Seekers',
    title: 'How are caregivers matched to my loved one’s specific care needs?',
    summary: 'Our platform matches clients with caregivers based on medical needs, scheduling, location, and language preferences.',
    content: [
      'When you submit a care request on DomicCare, our matching algorithm filters our network of verified professionals based on your specific care plan requirements (such as Alzheimer’s & dementia support, mobility assistance, medication reminders, or post-operative nursing).',
      'You have complete transparency: you can view each caregiver’s detailed biography, verified certifications, background screening status, client reviews, and hourly rates before confirming.',
      'If you prefer a phone consultation first, our care coordinators are happy to assist you in selecting the best caregiver match.'
    ],
    tips: [
      'You can schedule a complimentary 15-minute introductory video call with a caregiver before confirming their first shift.',
      'You can request a replacement caregiver at any time without extra fees if the personality fit is not optimal.'
    ],
    actionLink: { label: 'Start Care Matching', href: '/get-started' },
    tags: ['matching', 'caregiver', 'family', 'elderly', 'booking', 'start']
  },
  {
    id: 'booking-types-of-care',
    category: 'families',
    categoryName: 'Families & Care Seekers',
    title: 'What levels of home care can I book through DomicCare?',
    summary: 'From companion care and assistance with daily living to round-the-clock specialized nursing.',
    content: [
      '1. Companion & Social Care: Meal preparation, light housekeeping, conversation, social outings, and escorting to medical appointments.',
      '2. Personal Care & Mobility: Assistance with bathing, grooming, dressing, toileting, transfers, and physical therapy exercises.',
      '3. Specialized & Memory Care: Compassionate, specialized assistance for individuals living with Alzheimer’s, Dementia, Parkinson’s, or recovering from strokes.',
      '4. Skilled Nursing: Medication administration reminders, wound dressing care, vital sign monitoring, and post-hospital discharge support.'
    ],
    tips: [
      'Care can be scheduled hourly (minimum 3 hours), daily, overnight, or as 24/7 continuous live-in care.'
    ],
    actionLink: { label: 'View All Care Services', href: '/#services' },
    tags: ['services', 'dementia', 'nursing', 'personal care', 'companion', 'levels of care']
  },
  {
    id: 'caregiver-onboarding-process',
    category: 'caregivers',
    categoryName: 'Caregiver Hub',
    title: 'What is the caregiver application and vetting process?',
    summary: 'A rigorous 5-step screening process ensures only top-tier professionals join the DomicCare platform.',
    content: [
      'Step 1: Online Profile & Credential Submission (Resume, caregiver/nursing credentials, professional references).',
      'Step 2: Comprehensive Criminal Background Check (National criminal records, sex offender registry, and elder abuse registry screening).',
      'Step 3: Identity Verification (Government-issued photo ID check with biometric facial verification).',
      'Step 4: Clinical & Skills Interview (Review of caregiving experience, emergency scenario testing, and interpersonal communication).',
      'Step 5: Onboarding & Orientation (Platform compliance training, code of conduct review, and Stripe Connect payout setup).'
    ],
    tips: [
      'Applications are usually reviewed and vetted within 48 to 72 business hours.',
      'All active caregivers must renew background checks annually to maintain active status.'
    ],
    actionLink: { label: 'Join as a Caregiver', href: '/login' },
    tags: ['caregiver application', 'screening', 'vetting', 'onboarding', 'credentials', 'jobs']
  },
  {
    id: 'caregiver-timesheet-payouts',
    category: 'caregivers',
    categoryName: 'Caregiver Hub',
    title: 'How do caregivers submit shift hours and receive payouts?',
    summary: 'Clock in and out using your Caregiver Portal. Payouts are deposited directly to your bank account via Stripe.',
    content: [
      'Caregivers clock in and out using their mobile device when arriving at and departing from the client’s home.',
      'At shift conclusion, complete a short daily care log highlighting meals prepared, vital signs taken, or any client mood changes.',
      'Timesheets are submitted automatically to the client. Funds are processed via Stripe Connect and transferred to your linked bank account every Wednesday.'
    ],
    tips: [
      'Make sure your bank details and tax ID are verified in your Caregiver Portal to prevent payout delays.'
    ],
    actionLink: { label: 'Log into Caregiver Portal', href: '/login' },
    tags: ['timesheet', 'clock in', 'hours', 'earnings', 'payout', 'stripe', 'deposit']
  },
  {
    id: 'billing-hourly-rates',
    category: 'billing',
    categoryName: 'Billing, Rates & Stripe',
    title: 'How are hourly rates determined and when am I charged?',
    summary: 'Transparent, upfront pricing with no surprise agency fees or long-term binding contracts.',
    content: [
      'Hourly rates vary depending on the level of care required (e.g., companion care vs. specialized dementia or licensed nursing) and your geographic location.',
      'You will always see the exact hourly rate and total estimated charge before confirming any booking.',
      'Payments are processed securely via Stripe. A temporary hold is placed prior to the shift, and the actual charge is finalized only after the caregiver completes the shift and the timesheet is confirmed.'
    ],
    tips: [
      'We accept all major credit/debit cards (Visa, MasterCard, American Express) and bank transfers through Stripe.',
      'You can download itemized PDF invoices for tax or insurance records directly from your account dashboard.'
    ],
    actionLink: { label: 'Explore Pricing Details', href: '/faq' },
    tags: ['pricing', 'cost', 'hourly rates', 'stripe', 'invoicing', 'charges', 'credit card']
  },
  {
    id: 'billing-insurance-medicare',
    category: 'billing',
    categoryName: 'Billing, Rates & Stripe',
    title: 'Can I use Long-Term Care (LTC) Insurance or health benefits?',
    summary: 'DomicCare provides fully itemized documentation accepted by most private Long-Term Care insurance carriers.',
    content: [
      'Many private Long-Term Care (LTC) insurance policies reimburse non-medical home care and personal assistance services.',
      'DomicCare operates on a private-pay basis with automatic itemized invoicing. We provide official monthly invoices containing caregiver credentials, tax identifiers, and daily activity logs required by your insurer.',
      'Our team is happy to assist you in preparing the necessary documentation to ensure smooth reimbursement from your insurance provider.'
    ],
    tips: [
      'Contact your insurance provider to confirm your daily policy benefit and elimination period requirements.'
    ],
    actionLink: { label: 'Contact Billing Support', href: '/contact' },
    tags: ['insurance', 'long term care', 'ltc', 'reimbursement', 'medicare', 'private pay']
  },
  {
    id: 'safety-background-insurance',
    category: 'safety',
    categoryName: 'Trust, Safety & Insurance',
    title: 'Are caregivers bonded, insured, and background-checked?',
    summary: 'Every professional on DomicCare is rigorously background-screened, bonded, and insured.',
    content: [
      '100% Background Screened: Every caregiver undergoes multi-county, state, and federal criminal history checks, sex offender registry checks, and motor vehicle record evaluations.',
      'Fully Bonded & Insured: DomicCare maintains comprehensive general liability insurance and dishonesty bonding, protecting your family and home against unexpected incidents.',
      'Reference Checks: We verify at least two professional healthcare references and confirm verified past employment history for every caregiver.'
    ],
    tips: [
      'Look for the verified checkmark badge on a caregiver’s profile to view their screening completion date.'
    ],
    actionLink: { label: 'Read Our Safety Standards', href: '/privacy' },
    tags: ['safety', 'background check', 'insurance', 'bonded', 'screening', 'trust']
  },
  {
    id: 'safety-medical-emergency',
    category: 'safety',
    categoryName: 'Trust, Safety & Insurance',
    title: 'What emergency protocols do caregivers follow during an incident?',
    summary: 'Caregivers are trained in rapid-response emergency protocols and CPR/First Aid.',
    content: [
      'In any acute medical emergency (such as sudden chest pain, breathing difficulty, severe fall, or stroke symptoms), the caregiver’s immediate priority is to call 911.',
      'Once emergency responders are notified and the client is safely stabilized, the caregiver immediately contacts the designated emergency family contacts listed on the client profile.',
      'The caregiver then notifies DomicCare’s 24/7 care coordination desk, where a supervisor will assist and log an official incident report.'
    ],
    tips: [
      'Please ensure your emergency contacts, primary care physician, and hospital preferences are kept up to date in your Client Portal.'
    ],
    actionLink: { label: 'Emergency Contact Info', href: '/contact' },
    tags: ['emergency', '911', 'incident', 'medical crisis', 'fall', 'hospital', 'safety']
  },
  {
    id: 'account-reset-password',
    category: 'account',
    categoryName: 'Account & App Settings',
    title: 'How do I reset my password or update my contact details?',
    summary: 'Easily manage your login credentials, emergency phone numbers, and notification preferences.',
    content: [
      'To reset your password, visit the login page and click "Forgot Password". Enter your registered email address to receive a secure one-time password reset link.',
      'To update your address, phone number, or authorized emergency contacts, navigate to your Profile Settings inside your Client or Caregiver Dashboard.',
      'Changes to emergency contact information take effect immediately across all active caregiver dispatch systems.'
    ],
    tips: [
      'If you do not receive the password reset email within 5 minutes, please check your spam folder or contact support@domiccare.com.'
    ],
    actionLink: { label: 'Go to Login', href: '/login' },
    tags: ['password', 'login', 'account', 'reset', 'email', 'profile', 'settings']
  },
  {
    id: 'account-mobile-app',
    category: 'account',
    categoryName: 'Account & App Settings',
    title: 'Is there a mobile app available for DomicCare?',
    summary: 'Access DomicCare on iPhone and Android for real-time shift alerts and caregiver messaging.',
    content: [
      'The DomicCare platform is fully responsive and optimized for all modern mobile smartphones, tablets, and desktop browsers.',
      'Our dedicated iOS and Android mobile apps will be downloadable from the Apple App Store and Google Play Store soon.',
      'You can also add DomicCare directly to your smartphone home screen for a fast, app-like one-tap experience.'
    ],
    tips: [
      'Enable push notifications or SMS alerts to receive real-time updates when your caregiver arrives or leaves.'
    ],
    actionLink: { label: 'Download App', href: '#download' },
    tags: ['mobile', 'app', 'iphone', 'android', 'tablet', 'notifications', 'sms']
  },
  {
    id: 'policies-cancellation-notice',
    category: 'policies',
    categoryName: 'Policies & Cancellations',
    title: 'What is the cancellation and rescheduling policy for care shifts?',
    summary: 'Flexible scheduling with no cancellation penalty when given at least 24 hours advance notice.',
    content: [
      'Free Cancellation & Rescheduling: You can cancel or reschedule any upcoming shift at no cost as long as notice is submitted at least 24 hours prior to the scheduled shift start time.',
      'Short Notice Cancellations (Under 24 Hours): If a shift is cancelled with less than 24 hours notice, a short-notice fee equivalent to 2 hours of care is applied to compensate the caregiver who reserved their time.',
      'Medical Emergencies & Hospitalization: In cases of documented sudden hospital admission or acute medical emergencies, short-notice cancellation fees are waived upon review.'
    ],
    tips: [
      'You can reschedule shifts directly through your Client Portal with a single click.'
    ],
    actionLink: { label: 'View Terms of Service', href: '/terms' },
    tags: ['cancellation', 'reschedule', 'policy', 'fees', 'refund', '24 hours', 'rules']
  },
  {
    id: 'policies-code-of-conduct',
    category: 'policies',
    categoryName: 'Policies & Cancellations',
    title: 'What are the caregiver professional conduct and confidentiality standards?',
    summary: 'Our strict code of conduct protects dignity, confidentiality, and professional boundaries.',
    content: [
      'All caregivers adhere to DomicCare’s strict Professional Code of Ethics and Patient Rights Charter.',
      'Confidentiality & HIPAA Compliance: Caregivers are strictly prohibited from sharing personal, medical, or financial information regarding clients with any unauthorized third parties.',
      'Financial Protection: Caregivers are prohibited from accepting personal loans, gifts of high monetary value, or acting as financial power of attorney for clients.',
      'Zero Tolerance for Abuse: DomicCare maintains an absolute zero-tolerance policy for neglect, verbal disrespect, or mistreatment of any kind.'
    ],
    tips: [
      'If you ever have a concern regarding a caregiver’s conduct, our confidential ethics supervisor is available 24/7 at legal@domiccare.com.'
    ],
    actionLink: { label: 'Read Privacy Standards', href: '/privacy' },
    tags: ['ethics', 'conduct', 'hipaa', 'confidentiality', 'privacy', 'standards', 'trust']
  }
];

export default function HelpClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [openArticleId, setOpenArticleId] = useState<string | null>(ARTICLES[0].id);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'helpful' | 'not_helpful'>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);


  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('help-search-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ARTICLES.filter((article) => {
      const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
      if (!matchesCategory) return false;

      if (!q) return true;

      const matchesTitle = article.title.toLowerCase().includes(q);
      const matchesSummary = article.summary.toLowerCase().includes(q);
      const matchesContent = article.content.some((c) => c.toLowerCase().includes(q));
      const matchesTags = article.tags.some((t) => t.toLowerCase().includes(q));

      return matchesTitle || matchesSummary || matchesContent || matchesTags;
    });
  }, [searchQuery, activeCategory]);

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/help#${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (id: string, type: 'helpful' | 'not_helpful') => {
    setFeedbackGiven((prev) => ({ ...prev, [id]: type }));
  };


  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 text-white pt-12 pb-16 sm:pt-20 sm:pb-24">
          {/* Ambient radial mesh & glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage: 'radial-gradient(rgba(191,219,254,0.85) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              maskImage: 'radial-gradient(ellipse 70% 80% at 50% 0%, black 30%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 50% 0%, black 30%, transparent 75%)'
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-36 left-1/2 h-80 w-[80%] -translate-x-1/2 rounded-full bg-blue-500/25 blur-3xl"
          />

          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Breadcrumbs */}
            <nav className="flex items-center justify-center gap-2 text-xs font-medium text-blue-200 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3 text-blue-400" />
              <span className="text-white font-semibold">Help Center</span>
            </nav>

            {/* Live badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur-md border border-white/15 mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span>24/7 DomicCare Support & Knowledge Base</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
              How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-sky-200 to-white">help you</span> today?
            </h1>

            <p className="mt-4 sm:mt-5 text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Find instant answers for booking home care, caregiver onboarding, Stripe payments, and safety standards.
            </p>

            {/* Search Input Box */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="relative group">
                <label htmlFor="help-search-input" className="sr-only">
                  Search help topics
                </label>
                <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  id="help-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles (e.g. matching, stripe, hourly rate, cancellations)..."
                  className="w-full h-14 sm:h-16 pl-12 sm:pl-14 pr-24 sm:pr-28 rounded-2xl bg-white text-slate-900 text-sm sm:text-base placeholder:text-slate-400 shadow-2xl shadow-blue-950/40 border border-white/20 focus:outline-none focus:ring-4 focus:ring-blue-400/40 transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center gap-1.5">
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-md">
                      Ctrl K
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Search Tags */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs">
                <span className="text-blue-200/80 mr-1 hidden sm:inline">Popular:</span>
                {[
                  'Matching with Caregivers',
                  'Stripe Payouts',
                  'Hourly Rates',
                  'Background Checks',
                  'Cancellations'
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/15 backdrop-blur-sm transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* URGENT CARE & SAFETY DISPATCH CALLOUT */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-10">
          <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-4 sm:p-5 shadow-lg shadow-amber-900/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 shrink-0 mt-0.5 sm:mt-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-amber-950 flex items-center gap-2">
                    Need Immediate or Urgent Care Assistance?
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-800/90 mt-0.5 leading-relaxed">
                    For life-threatening medical emergencies, please call <span className="font-bold underline">911</span> immediately. For urgent same-day caregiver dispatch or shift delays, call our coordinator hotline.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 sm:self-center">
                <a
                  href="tel:+0892760944"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-amber-600/20 hover:scale-[1.02] transition-all"
                >
                  <Phone className="h-4 w-4" />
                  Call 089 2760944
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORY EXPLORER TILES */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore by Topic
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Select a category below to filter relevant articles and step-by-step guides.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;
              const count = ARTICLES.filter((a) => a.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(isSelected ? 'all' : cat.id);
                    // scroll to articles section smoothly
                    const el = document.getElementById('articles-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`group text-left p-5 sm:p-6 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-400 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200/80 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl border ${cat.color} group-hover:scale-105 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                      {count} {count === 1 ? 'article' : 'articles'}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                    {cat.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                    <span>{isSelected ? 'Viewing topic' : 'Browse articles'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* STEP-BY-STEP POPULAR GUIDES */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
          <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-xl">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"
            />
            <div className="relative">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 border border-blue-800/80 px-3 py-1 rounded-full mb-3">
                    <Sparkles className="h-3.5 w-3.5" /> Featured Walkthroughs
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Step-by-Step Care Guides
                  </h2>
                  <p className="text-sm text-slate-300 mt-1.5 max-w-xl">
                    Clear, chronological steps to help you navigate the DomicCare platform with confidence.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {POPULAR_GUIDES.map((guide) => {
                  const Icon = guide.icon;
                  return (
                    <div
                      key={guide.id}
                      className="rounded-2xl border border-slate-800 bg-slate-800/70 backdrop-blur p-5 sm:p-6 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-bold text-blue-400 bg-blue-950/60 border border-blue-900/50 px-2.5 py-0.5 rounded-md">
                          {guide.badge}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {guide.readTime}
                        </span>
                      </div>

                      <h3 className="font-heading text-base sm:text-lg font-bold text-white mb-3">
                        {guide.title}
                      </h3>

                      <ol className="space-y-2.5 text-xs sm:text-sm text-slate-300 mb-5">
                        {guide.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[11px] font-bold mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-snug">{step}</span>
                          </li>
                        ))}
                      </ol>

                      <Link
                        href={guide.link}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <span>Take action</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* MAIN KNOWLEDGE BASE ACCORDION */}
        <section id="articles-section" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Knowledge Base & FAQs
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {searchQuery
                  ? `Showing results matching "${searchQuery}"`
                  : activeCategory === 'all'
                  ? 'All help articles and standard platform policies'
                  : `Showing articles under ${CATEGORIES.find((c) => c.id === activeCategory)?.name}`}
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                All Topics ({ARTICLES.length})
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategory === c.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {c.shortName}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          {filteredArticles.length > 0 ? (
            <div className="space-y-4">
              {filteredArticles.map((article) => {
                const isOpen = openArticleId === article.id;
                const feedback = feedbackGiven[article.id];
                const isCopied = copiedId === article.id;

                return (
                  <article
                    key={article.id}
                    id={article.id}
                    className={`rounded-2xl border bg-white transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? 'border-blue-300 shadow-md ring-1 ring-blue-500/10'
                        : 'border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow'
                    }`}
                  >
                    <button
                      onClick={() => setOpenArticleId(isOpen ? null : article.id)}
                      className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                    >
                      <div className="space-y-1.5 pr-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full">
                            {article.categoryName}
                          </span>
                        </div>
                        <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 leading-snug">
                          {article.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 line-clamp-2">
                          {article.summary}
                        </p>
                      </div>

                      <div
                        className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                          isOpen ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                    </button>

                    {/* Expandable answer */}
                    {isOpen && (
                      <div className="border-t border-slate-100 bg-slate-50/50 px-5 sm:px-6 py-5 text-sm text-slate-700 space-y-4 animate-fade-in">
                        <div className="space-y-3 leading-relaxed">
                          {article.content.map((paragraph, idx) => (
                            <p key={idx} className="text-slate-700 text-sm sm:text-base leading-relaxed">
                              {paragraph}
                            </p>
                          ))}
                        </div>

                        {/* Tips box if any */}
                        {article.tips && article.tips.length > 0 && (
                          <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 space-y-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5" /> Helpful Recommendation
                            </span>
                            <ul className="space-y-1 text-xs sm:text-sm text-blue-900">
                              {article.tips.map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-blue-500 mt-1">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Action link */}
                        {article.actionLink && (
                          <div className="pt-2">
                            <Link
                              href={article.actionLink.href}
                              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs sm:text-sm font-semibold transition-all shadow-sm"
                            >
                              <span>{article.actionLink.label}</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        )}

                        {/* Article Footer: Was this helpful? & Share */}
                        <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                          <div className="flex items-center gap-3">
                            <span>Was this article helpful?</span>
                            {feedback ? (
                              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Thank you for your feedback!
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleFeedback(article.id, 'helpful')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
                                >
                                  <ThumbsUp className="h-3 w-3" /> Yes
                                </button>
                                <button
                                  onClick={() => handleFeedback(article.id, 'not_helpful')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
                                >
                                  <ThumbsDown className="h-3 w-3" /> No
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyLink(article.id)}
                              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors"
                            >
                              {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                              <span>{isCopied ? 'Link copied!' : 'Copy link'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 bg-white">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                No matching articles found
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                We couldn’t find any help articles matching &ldquo;{searchQuery}&rdquo;. Try another search term or reach out to our team directly.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Clear all filters
                </button>
                <Link
                  href="/contact"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  Contact Support Directly
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* DIRECT SUPPORT CHANNELS (PHONE, EMAIL, VISIT) */}
        <section className="bg-slate-100 border-t border-slate-200/80 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                Direct Human Support
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
                Still have questions? We’re here to help.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2">
                Our compassionate care coordinators and technical support team are ready to assist you anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Phone card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <Phone className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">
                    Phone Support
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Direct line for families, care seekers, and registered caregivers.
                  </p>
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="font-heading text-lg font-bold text-blue-600">
                      089 2760944
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Mon – Fri, 8:00 AM – 6:00 PM (EST)
                    </p>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                      24/7 on-call for active shift emergencies
                    </p>
                  </div>
                </div>
                <a
                  href="tel:+0892760944"
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-sm"
                >
                  <Phone className="h-4 w-4" /> Call Now
                </a>
              </div>

              {/* Email card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">
                    Email Desk
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Send detailed inquiries, billing documents, or compliance notices.
                  </p>
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="font-mono text-xs font-bold text-slate-900">
                      legal@domiccare.com
                    </p>
                    <p className="text-xs text-slate-500">
                      Typical response in under 24 hours
                    </p>
                    <p className="text-[11px] text-blue-600 font-medium">
                      Encrypted and HIPAA-aligned channel
                    </p>
                  </div>
                </div>
                <a
                  href="mailto:legal@domiccare.com"
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-800 hover:text-blue-700 px-4 py-2.5 text-xs sm:text-sm font-bold transition-all"
                >
                  <Mail className="h-4 w-4" /> Send Email
                </a>
              </div>

              {/* Submit Ticket / Office */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">
                    Online Support Ticket
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Open a tracked support ticket directly with our care operations team.
                  </p>
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" /> Pleven Headquarters
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Street G.S.Rakovski 48, Pleven, 5800, Bulgaria
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Priority ticket handling queue
                    </p>
                  </div>
                </div>
                <Link
                  href="/contact"
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-sm"
                >
                  <MessageSquare className="h-4 w-4" /> Go to Contact Form
                </Link>
              </div>
            </div>

            {/* Platform status indicator */}
            <div className="mt-10 rounded-2xl bg-white border border-slate-200/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="font-semibold text-slate-900">System Status: All Services Operational</span>
                <span className="hidden md:inline text-slate-400">•</span>
                <span className="hidden md:inline text-slate-500">Stripe Payments & Care Matching Active</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <Link href="/faq" className="text-blue-600 hover:underline">
                  Visit FAQs
                </Link>
                <span className="text-slate-300">•</span>
                <Link href="/contact" className="text-blue-600 hover:underline">
                  Contact Form
                </Link>
                <span className="text-slate-300">•</span>
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>


      <Footer />
    </div>
  );
}
