'use client';

import React, { useState } from 'react';
import { Montserrat, Inter, Caveat } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, Check, ChevronDown, Clock, Headset, Loader2, Mail, MapPin, Phone, Send, ShieldCheck, Users } from 'lucide-react';

const heading = Montserrat({ subsets: ['latin'], variable: '--font-heading', weight: ['500', '600', '700', '800'] });
const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const script = Caveat({ subsets: ['latin'], variable: '--font-script', weight: ['600'] });

/* Replace this with your own background image (put it in /public/images) */
const HERO_IMAGE = '/images/contact-hero.jpg';

const PHONE = { label: '+1 (833) 728-2576', href: 'tel:+18337282576' };
const EMAIL = 'info@domiccare.com';
const MAX = 500;

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-[#0B2A5B] placeholder:text-slate-400 outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-[#1677FF]/10';
const labelCls = 'mb-1.5 block text-xs font-semibold text-[#0B2A5B]';
const pillCls = 'inline-block rounded-md bg-[#E4F0FF] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1677FF]';

const FEATURES = [
  { icon: ShieldCheck, text: ['Reliable', 'Support'] },
  { icon: Clock, text: ['Quick', 'Response'] },
  { icon: Users, text: ['Dedicated', 'Team'] },
];

const CONTACTS = [
  { icon: Phone, title: 'Phone', main: PHONE.label, href: PHONE.href, sub: 'Mon - Fri, 8:00 AM - 6:00 PM (EST)' },
  { icon: Mail, title: 'Email', main: EMAIL, href: `mailto:${EMAIL}`, sub: 'We’ll respond within 24 hours' },
  { icon: MapPin, title: 'Office Address', main: '2800 Corporate Exchange Dr, Suite 410', sub: 'Columbus, OH 43231, USA' },
];

export default function ContactPage() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    // TODO: replace with fetch('/api/contact', { method: 'POST', body: new FormData(e.currentTarget) })
    await new Promise((r) => setTimeout(r, 1200));
    setStatus('sent');
  };

  return (
    <main
      className={`${heading.variable} ${sans.variable} ${script.variable} min-h-screen bg-white text-[#0B2A5B]`}
      style={{ fontFamily: 'var(--font-sans), system-ui, sans-serif' }}
    >
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#EAF3FF] via-[#F3F8FF] to-white pb-24 pt-28 lg:pb-32 lg:pt-32">
        <div
          className="absolute inset-y-0 right-0 hidden w-[52%] lg:block"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, #000 38%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 38%)',
          }}
        >
          <img src="/Background images/contact-img.png" alt="" className="h-full w-full object-cover object-top" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="max-w-md">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1677FF]">Contact Us</p>
            <h1 className="mt-5 font-[family-name:var(--font-heading)] text-5xl font-extrabold leading-[1.1] tracking-tight lg:text-6xl">
              We’re Here to
              <br />
              <span className="text-[#1677FF]">Help You</span>
            </h1>
            <p className="mt-6 text-[15px] leading-relaxed text-slate-600">
              Have a question, need support, or want to learn more about our services? Our team is just a message or call away. We’re happy to assist you.
            </p>
            <div className="mt-8 flex gap-8">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text[0]} className="flex items-center gap-2.5">
                  <Icon className="h-6 w-6 text-[#1677FF]" strokeWidth={1.75} aria-hidden="true" />
                  <span className="text-[11px] font-medium leading-tight text-slate-600">
                    {text[0]}
                    <br />
                    {text[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute right-[40%] top-4 hidden -rotate-[8deg] lg:block">
            <p className="font-[family-name:var(--font-script)] text-3xl leading-[1.05] text-[#0B2A5B]">
              Your health
              <br />
              is our priority
            </p>
            <svg viewBox="0 0 120 20" className="-mt-1 ml-6 w-28 text-[#1677FF]" fill="none" aria-hidden="true">
              <path d="M2 14C30 4 70 4 118 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="relative -mt-12 rounded-t-[2rem] bg-gradient-to-b from-[#F5F9FF] to-white px-6 pb-24 pt-14 shadow-[0_-8px_30px_rgba(22,119,255,0.06)]">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left */}
          <div>
            <span className={pillCls}>Get in touch</span>
            <h2 className="mt-5 font-[family-name:var(--font-heading)] text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
              Multiple Ways to
              <br />
              Reach Us
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              Choose the method that works best for you. Our team is available and ready to assist.
            </p>

            <ul className="mt-8 space-y-6">
              {CONTACTS.map(({ icon: Icon, title, main, href, sub }) => (
                <li key={title} className="flex items-center gap-5">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#E4F0FF] text-[#1677FF]">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#1677FF]">{title}</p>
                    {href ? (
                      <a href={href} className="text-sm font-semibold hover:underline">
                        {main}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold">{main}</p>
                    )}
                    <p className="text-xs text-slate-500">{sub}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-4 rounded-xl bg-[#E4F0FF]/70 p-5 sm:flex-row sm:items-center">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#1677FF] shadow-sm">
                <Headset className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold">Need immediate support?</p>
                <p className="mt-0.5 max-w-xs text-xs text-slate-600">Our support team is here to help you with any urgent questions.</p>
                <a
                  href={PHONE.href}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#1677FF] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0F62D9]"
                >
                  Call Us Now <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="rounded-2xl border border-[#E4EEFB] bg-white p-7 shadow-[0_20px_50px_rgba(22,119,255,0.08)] sm:p-9">
            {status === 'sent' ? (
              <div role="status" className="py-16 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E4F0FF] text-[#1677FF]">
                  <Check className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-[family-name:var(--font-heading)] text-2xl font-bold">Message sent</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-slate-600">Thank you for reaching out. We’ll get back to you within 24 hours.</p>
                <button
                  type="button"
                  onClick={() => {
                    setStatus('idle');
                    setMessage('');
                  }}
                  className="mt-6 text-sm font-semibold text-[#1677FF] hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit}>
                <span className={pillCls}>Send us a message</span>
                <h3 className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight">We’re Here to Help</h3>
                <p className="mt-2 text-xs text-slate-500">Fill out the form below and we’ll get back to you as soon as possible.</p>

                <div className="mt-7 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className={labelCls}>Full Name <span className="text-red-500">*</span></label>
                      <input id="name" name="name" required autoComplete="name" placeholder="Your full name" className={inputCls} />
                    </div>
                    <div>
                      <label htmlFor="email" className={labelCls}>Email Address <span className="text-red-500">*</span></label>
                      <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className={labelCls}>Phone Number <span className="text-red-500">*</span></label>
                    <input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="Your phone number" className={inputCls} />
                  </div>

                  <div>
                    <label htmlFor="subject" className={labelCls}>Subject <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select id="subject" name="subject" required defaultValue="" className={`${inputCls} appearance-none pr-10 invalid:text-slate-400`}>
                        <option value="" disabled>Select a subject</option>
                        <option>General Inquiry</option>
                        <option>Finding a Caregiver</option>
                        <option>Existing Booking</option>
                        <option>Billing Question</option>
                        <option>Partnerships</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className={labelCls}>Message <span className="text-red-500">*</span></label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      maxLength={MAX}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help you?"
                      className={`${inputCls} resize-none`}
                    />
                    <p className="mt-1 text-right text-[11px] text-slate-400" aria-live="off">{message.length}/{MAX}</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="mt-4 inline-flex items-center gap-2.5 rounded-full bg-[#1677FF] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1677FF]/25 transition hover:bg-[#0F62D9] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1677FF] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === 'sending' ? (
                    <>
                      <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" /> Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" aria-hidden="true" /> Send Message <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}