import React from 'react';
import Link from 'next/link';
import { ChevronRight, Heart } from 'lucide-react';

export default function Footer() {
  return (
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
              {[
                { label: 'About Us', href: '/about' },
                // { label: 'Careers', href: '#' },
                { label: 'Caregivers', href: '/get-started' },
                { label: 'Contact', href: '/contact' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group">
                    <ChevronRight className="h-3 w-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources col */}
          <div>
            <span className="text-sm font-bold text-white block mb-5">Resources</span>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Help Center', href: '#' },
                { label: 'FAQs', href: '/faq' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="hover:text-white hover:translate-x-1 transition-all inline-flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="h-3 w-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.label}
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
  );
}