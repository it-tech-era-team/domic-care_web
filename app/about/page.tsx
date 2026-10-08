'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Montserrat, Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, CheckCircle2, Heart, Shield, ShieldCheck, Star, Users } from 'lucide-react';

const heading = Montserrat({ subsets: ['latin'], variable: '--font-heading', weight: ['500', '600', '700', '800'] });
const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });

/* Swap this for your own hero photo (e.g. '/images/about-hero.jpg') */
const HERO_IMAGE = 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=2000&auto=format&fit=crop';

const H = 'font-[family-name:var(--font-heading)]';
const pillCls = 'inline-block rounded-md bg-[#E4F0FF] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1677FF]';
const focusCls = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1677FF]';

const STATS = [
  { to: 5, suffix: 'K+', label: 'Families helped' },
  { to: 99, suffix: '%', label: 'Satisfaction' },
  { to: 24, suffix: '/7', label: 'Support' },
];

const d = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties;

/* All motion is wrapped in no-preference, so reduced-motion users see the final state */
const MOTION_CSS = `
@keyframes rise{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
@keyframes pop{from{opacity:0;transform:translateY(14px) scale(.94)}to{opacity:1;transform:none}}
@keyframes zoom{from{transform:scale(1.12)}to{transform:scale(1)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes draw{to{stroke-dashoffset:0}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes blob{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,-24px) scale(1.1)}}
@media (prefers-reduced-motion:no-preference){
.a-rise{animation:rise .9s cubic-bezier(.22,1,.36,1) both;animation-delay:var(--d,0ms)}
.a-pop{animation:pop .8s cubic-bezier(.22,1,.36,1) both;animation-delay:var(--d,0ms)}
.a-zoom{animation:zoom 1.8s cubic-bezier(.22,1,.36,1) both;animation-delay:200ms}
.a-float{animation:float 6s ease-in-out infinite}
.a-float-slow{animation:float 8s ease-in-out -3s infinite}
.a-draw{stroke-dasharray:240;stroke-dashoffset:240;animation:draw 1.1s ease-out .9s forwards}
.a-spin{animation:spin 70s linear infinite}
.a-blob{animation:blob 16s ease-in-out infinite}
}
@media (prefers-reduced-motion:reduce){.a-draw{stroke-dasharray:none}}
`;

function CountUp({ to, suffix, delay = 650 }: { to: number; suffix: string; delay?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(to);
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min((now - start) / 1600, 1);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    const t = setTimeout(() => (raf = requestAnimationFrame(tick)), delay);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [to, delay]);
  return (
    <>
      {n}
      {suffix}
    </>
  );
}

const PROMISES = [
  { title: 'Rigorous vetting', desc: 'Every caregiver passes identity, background and reference checks.' },
  { title: 'Personalized matching', desc: 'We match on care needs, language, schedule and personality.' },
  { title: 'Clear communication', desc: 'Updates and support are available around the clock.' },
  { title: 'Ongoing training', desc: 'Caregivers keep learning, so your family gets current best practice.' },
];

const VALUES = [
  { icon: Heart, title: 'Empathy first', desc: 'We treat every client as if they were our own family, acting with deep compassion.' },
  { icon: Shield, title: 'Uncompromising safety', desc: 'Trust is our foundation. We hold ourselves to the highest standards of safety and security.' },
  { icon: Users, title: 'Community centric', desc: 'We build strong relationships between caregivers, families and the communities they live in.' },
];

export default function AboutPage() {
  return (
    <main
      className={`${heading.variable} ${sans.variable} min-h-screen bg-white text-[#0B2A5B] selection:bg-[#1677FF] selection:text-white`}
      style={{ fontFamily: 'var(--font-sans), system-ui, sans-serif' }}
    >
      <style>{MOTION_CSS}</style>
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-gradient-to-br from-[#E6F1FF] via-[#F3F8FF] to-white pb-16 pt-[72px] sm:pt-20 lg:pb-[20svh] lg:pt-[68px]">
        <div className="a-blob pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-[#BFDBFF]/40 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <div>
            <span className={`${pillCls} a-rise`} style={d(0)}>About DomicCare</span>

            <h1 className={`${H} a-rise mt-5 font-extrabold leading-[1.08] tracking-tight`}
              style={{ ...d(120), fontSize: 'clamp(2.1rem, min(3.4vw + 0.6rem, 7.4svh), 3.5rem)' }}>
              Redefining{' '}
              <span className="relative inline-block text-[#1677FF]">
                Home Care
                <svg viewBox="0 0 220 14" className="absolute -bottom-2 left-0 w-full" fill="none" aria-hidden="true" preserveAspectRatio="none">
                  <path className="a-draw" d="M3 10C50 3 120 2 217 8" stroke="#1677FF" strokeOpacity="0.35" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>{' '}
              for the Modern Era.
            </h1>

            <p className="a-rise mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg" style={d(240)}>
              Everyone deserves to age and heal with dignity, comfort and safety in their own home. We connect families with caregivers they can trust.
            </p>

            <div className="a-rise mt-7 flex flex-col gap-3 sm:flex-row" style={d(360)}>
              <Link
                href="/user/caregivers"
                className={`group inline-flex items-center justify-center gap-2 rounded-full bg-[#1677FF] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1677FF]/25 transition duration-300 hover:-translate-y-0.5 hover:bg-[#0F62D9] hover:shadow-xl hover:shadow-[#1677FF]/30 ${focusCls}`}
              >
                Find a caregiver
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className={`inline-flex items-center justify-center rounded-full border border-[#BFD7F5] bg-white/70 px-7 py-3.5 text-sm font-semibold backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-[#1677FF] hover:text-[#1677FF] ${focusCls}`}
              >
                Contact us
              </Link>
            </div>

            <dl className="a-rise mt-8 flex max-w-md divide-x divide-[#CFE0F5] lg:mt-10" style={d(480)}>
              {STATS.map((s, i) => (
                <div key={s.label} className={i === 0 ? 'pr-4 sm:pr-8' : 'px-4 sm:px-8'}>
                  <dd className={`${H} text-2xl font-extrabold tracking-tight tabular-nums sm:text-3xl lg:text-4xl`}>
                    <CountUp to={s.to} suffix={s.suffix} />
                  </dd>
                  <dt className="mt-1 text-xs text-slate-500 sm:text-sm">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          {/* Visual */}
          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <svg className="a-spin absolute -right-10 -top-10 -z-10 h-56 w-56 text-[#1677FF]/25 sm:h-72 sm:w-72" viewBox="0 0 200 200" fill="none" aria-hidden="true">
              <circle cx="100" cy="100" r="98" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 9" strokeLinecap="round" />
              <circle cx="100" cy="100" r="68" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <div className="absolute -inset-3 -z-10 rounded-[2.25rem] bg-[#CFE3FF]/60 lg:-inset-4" aria-hidden="true" />

            <div className="a-rise overflow-hidden rounded-[1.5rem] shadow-[0_30px_60px_-20px_rgba(11,42,91,0.35)] sm:rounded-[2rem] lg:h-[min(62svh,580px)]" style={d(200)}>
              <img
                src="\Background images/about-img.jpg"
                alt="A caregiver sitting with an elderly woman at home"
                fetchPriority="high"
                className="a-zoom aspect-[4/3] w-full object-cover sm:aspect-[16/10] lg:aspect-auto lg:h-full"
              />
            </div>

            <div className="a-pop absolute -bottom-6 left-4 sm:-left-6" style={d(1000)}>
              <div className="a-float flex items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_16px_40px_rgba(11,42,91,0.15)]">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E4F0FF] text-[#1677FF]">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-sm font-bold leading-tight">
                  Every caregiver
                  <br />
                  <span className="font-medium text-slate-500">is background-checked</span>
                </p>
              </div>
            </div>

            <div className="a-pop absolute -top-5 right-4 sm:-right-4" style={d(1200)}>
              <div className="a-float-slow rounded-2xl bg-white px-4 py-3 shadow-[0_16px_40px_rgba(11,42,91,0.15)]">
                <div className="flex gap-0.5 text-[#FFB020]" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <Star key={n} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="mt-1 text-sm font-bold">
                  4.9 <span className="font-medium text-slate-500">family rating</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[5fr_6fr] lg:gap-20">
          <div>
            <span className={pillCls}>Our story</span>
            <h2 className={`${H} mt-5 text-3xl font-bold leading-tight tracking-tight lg:text-4xl`}>
              Empowering lives through compassionate care
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-slate-600">
              Our journey began with a simple idea: finding reliable, skilled care for a loved one shouldn’t be stressful. We built DomicCare to connect families who need help with professionals who love to give it.
            </p>
          </div>

          <ul className="divide-y divide-[#E2ECF8] border-y border-[#E2ECF8]">
            {PROMISES.map((p) => (
              <li key={p.title} className="flex gap-4 py-6">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[#1677FF]" aria-hidden="true" />
                <div>
                  <h3 className="font-bold">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{p.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gradient-to-b from-[#F3F8FF] to-white px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <span className={pillCls}>Our values</span>
            <h2 className={`${H} mt-5 text-3xl font-bold leading-tight tracking-tight lg:text-4xl`}>What guides every placement</h2>
            <p className="mt-4 leading-relaxed text-slate-600">The principles behind every interaction and every decision we make.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-[#E2ECF8] bg-white p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E4F0FF] text-[#1677FF]">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className={`${H} mt-6 text-lg font-bold`}>{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-[#1677FF] px-8 py-14 text-center text-white sm:px-16 sm:py-16">
          <h2 className={`${H} mx-auto max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl`}>
            Ready to find the right caregiver?
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-blue-50">
            Join thousands of families who found peace of mind with DomicCare.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/user/caregivers"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#1677FF] transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
            >
              Find a caregiver <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}