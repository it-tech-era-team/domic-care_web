"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  ChevronDown,
  HeartHandshake,
  HelpCircle,
  LayoutGrid,
  MessageCircle,
  Search,
  Compass,
  UserCheck,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";

type CategoryId = "services" | "caregivers" | "pricing" | "start";

interface FAQItem {
  id: string;
  category: CategoryId;
  question: string;
  answer: string;
}

const categories: { id: CategoryId; label: string; icon: LucideIcon }[] = [
  { id: "services", label: "Our services", icon: HeartHandshake },
  { id: "caregivers", label: "Caregivers & safety", icon: UserCheck },
  { id: "pricing", label: "Pricing & contracts", icon: Wallet },
  { id: "start", label: "Getting started", icon: Compass },
];

const faqs: FAQItem[] = [
  {
    id: "services-offered",
    category: "services",
    question: "What services does Domic Care provide?",
    answer:
      "Domic Care provides a wide range of home care services including personal care, companionship, meal preparation, medication reminders, and specialized care for conditions like Alzheimer's and Dementia.",
  },
  {
    id: "availability",
    category: "services",
    question: "Is Domic Care available 24/7?",
    answer:
      "Absolutely. We offer flexible care options ranging from a few hours a day to round-the-clock 24/7 care, tailored to meet your specific needs.",
  },
  {
    id: "specialized",
    category: "services",
    question: "Do you offer specialized care for Parkinson's or stroke recovery?",
    answer:
      "Yes, many of our caregivers have specialized training and experience in caring for clients with Parkinson's disease, those recovering from strokes, and clients with other complex chronic conditions.",
  },
  {
    id: "facilities",
    category: "services",
    question: "Do you provide care for individuals in assisted living facilities?",
    answer:
      "Yes, our caregivers can provide one-on-one supplemental care in assisted living facilities, nursing homes, and hospitals when families feel their loved ones need additional personal attention.",
  },
  {
    id: "medication",
    category: "services",
    question: "Can caregivers administer medication?",
    answer:
      "Our caregivers cannot directly administer medication, but they can provide medication reminders, assist with opening pill bottles, and ensure medications are taken at the correct times.",
  },
  {
    id: "selection",
    category: "caregivers",
    question: "How do you select your caregivers?",
    answer:
      "Our caregivers undergo a rigorous selection process, including comprehensive background checks, interviews, and skills assessments. We ensure they are not only qualified but also compassionate and dedicated.",
  },
  {
    id: "choose",
    category: "caregivers",
    question: "Can I choose my caregiver?",
    answer:
      "Yes, we strive to make the best match between clients and caregivers based on needs, preferences, and personality. If you ever feel a caregiver isn't the right fit, we are happy to arrange a replacement.",
  },
  {
    id: "bonded",
    category: "caregivers",
    question: "Are your caregivers bonded and insured?",
    answer:
      "Yes, all of our caregivers are fully bonded and insured. We also cover all payroll taxes and worker's compensation, so you don't have to worry about any liabilities as an employer.",
  },
  {
    id: "substitute",
    category: "caregivers",
    question: "What happens if my caregiver is sick or goes on vacation?",
    answer:
      "We have a large team of qualified caregivers. If your regular caregiver is unavailable, we will promptly provide a fully briefed and capable substitute to ensure there is no interruption in your care.",
  },
  {
    id: "emergencies",
    category: "caregivers",
    question: "How do you handle medical emergencies?",
    answer:
      "Our caregivers are trained in emergency protocols. In the event of a medical emergency, they will immediately call 911, ensure the client is as safe as possible, and then promptly contact family members and our agency.",
  },
  {
    id: "updates",
    category: "caregivers",
    question: "How is the family kept updated on their loved one's care?",
    answer:
      "We maintain open lines of communication. We can provide regular updates via phone or email, and we also use care logs in the home so family members can see daily notes from the caregiver.",
  },
  {
    id: "cost",
    category: "pricing",
    question: "How much does home care cost?",
    answer:
      "The cost varies depending on the level of care required and the number of hours. We offer free consultations to assess your needs and provide a customized care plan and transparent pricing.",
  },
  {
    id: "insurance",
    category: "pricing",
    question: "Do you accept insurance?",
    answer:
      "We accept many long-term care insurance policies and can help you understand your coverage. We also accept private pay and can discuss payment options during your consultation.",
  },
  {
    id: "contract",
    category: "pricing",
    question: "Do I have to sign a long-term contract?",
    answer:
      "No, we do not require long-term contracts. Our care agreements are flexible, and you can adjust, pause, or cancel services at any time with appropriate notice as outlined in our agreement.",
  },
  {
    id: "areas",
    category: "start",
    question: "What areas do you serve?",
    answer:
      "We currently provide home care services across multiple counties and neighborhoods in the region. Please contact us directly with your zip code to confirm if we serve your specific area.",
  },
  {
    id: "start-time",
    category: "start",
    question: "How quickly can services begin?",
    answer:
      "In many cases, we can start providing care within 24 to 48 hours of your initial inquiry. If it's an emergency, we will do our utmost to expedite the process and get a caregiver to you sooner.",
  },
];

export default function FAQPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryId | "all">("all");
  const [openId, setOpenId] = useState<string | null>(faqs[0].id);

  const normalizedQuery = query.trim().toLowerCase();

  // FAQs matching the search text (ignores the selected category, used for counts)
  const searchMatches = useMemo(
    () =>
      faqs.filter(
        (f) =>
          !normalizedQuery ||
          f.question.toLowerCase().includes(normalizedQuery) ||
          f.answer.toLowerCase().includes(normalizedQuery)
      ),
    [normalizedQuery]
  );

  const visibleFaqs = useMemo(
    () =>
      activeCategory === "all"
        ? searchMatches
        : searchMatches.filter((f) => f.category === activeCategory),
    [searchMatches, activeCategory]
  );

  const countFor = (id: CategoryId | "all") =>
    id === "all"
      ? searchMatches.length
      : searchMatches.filter((f) => f.category === id).length;

  const navItems: { id: CategoryId | "all"; label: string; icon: LucideIcon }[] = [
    { id: "all", label: "All questions", icon: LayoutGrid },
    ...categories,
  ];

  const resetFilters = () => {
    setQuery("");
    setActiveCategory("all");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(191,219,254,0.9) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              maskImage:
                "radial-gradient(ellipse 70% 80% at 50% 0%, black 30%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 70% 80% at 50% 0%, black 30%, transparent 75%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 left-1/2 h-64 w-[70%] -translate-x-1/2 rounded-full bg-blue-500/30 blur-3xl"
          />

          <div className="relative mx-auto max-w-3xl px-4 pb-14 pt-16 text-center sm:px-6 sm:pb-16 sm:pt-24 lg:px-8">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-lg backdrop-blur">
              <HelpCircle className="h-7 w-7 text-blue-100" aria-hidden="true" />
            </div>
            <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Frequently asked questions
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-blue-100 sm:text-lg">
              Answers about our home care services, caregivers, pricing, and how
              to get started for your loved one.
            </p>

            {/* Search */}
            <div className="relative mx-auto mt-9 max-w-xl">
              <label htmlFor="faq-search" className="sr-only">
                Search questions
              </label>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="faq-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for costs, insurance, caregivers…"
                className="h-14 w-full rounded-2xl border border-white/20 bg-white pl-12 pr-12 text-base text-slate-900 placeholder:text-slate-400 shadow-xl shadow-blue-950/30 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-400/40 [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pb-28 lg:pt-16">
          <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
            {/* Mobile / tablet: horizontal chips */}
            <nav
              aria-label="FAQ categories"
              className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:hidden [&::-webkit-scrollbar]:hidden"
            >
              {navItems.map(({ id, label }) => {
                const active = activeCategory === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveCategory(id)}
                    aria-pressed={active}
                    className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${active
                        ? "border-blue-700 bg-blue-700 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-800"
                      }`}
                  >
                    {label}
                    <span
                      className={`rounded-full px-1.5 text-xs tabular-nums ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                    >
                      {countFor(id)}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Desktop: sticky sidebar */}
            <aside className="hidden lg:block">
              <nav
                aria-label="FAQ categories"
                className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
              >
                <ul className="space-y-1">
                  {navItems.map(({ id, label, icon: Icon }) => {
                    const active = activeCategory === id;
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={() => setActiveCategory(id)}
                          aria-pressed={active}
                          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${active
                              ? "bg-blue-50 text-blue-800"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                        >
                          <Icon
                            className={`h-4 w-4 shrink-0 ${active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                              }`}
                            aria-hidden="true"
                          />
                          <span className="flex-1">{label}</span>
                          <span
                            className={`text-xs tabular-nums ${active ? "text-blue-600" : "text-slate-400"
                              }`}
                          >
                            {countFor(id)}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>

            {/* Accordion */}
            <div className="min-w-0">
              <p
                className="mb-4 text-sm text-slate-500 lg:mt-2"
                role="status"
                aria-live="polite"
              >
                {visibleFaqs.length === 0
                  ? "No questions found"
                  : `Showing ${visibleFaqs.length} ${visibleFaqs.length === 1 ? "question" : "questions"
                  }`}
                {normalizedQuery && (
                  <>
                    {" "}
                    for <span className="font-medium text-slate-700">“{query.trim()}”</span>
                  </>
                )}
              </p>

              {visibleFaqs.length > 0 ? (
                <ul className="space-y-3 sm:space-y-4">
                  {visibleFaqs.map((faq) => {
                    const isOpen = openId === faq.id;
                    const buttonId = `faq-btn-${faq.id}`;
                    const panelId = `faq-panel-${faq.id}`;
                    return (
                      <li
                        key={faq.id}
                        className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 motion-reduce:transition-none ${isOpen
                            ? "border-blue-200 shadow-lg shadow-blue-900/5 ring-1 ring-blue-100"
                            : "border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md"
                          }`}
                      >
                        <h3>
                          <button
                            id={buttonId}
                            type="button"
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            onClick={() => setOpenId(isOpen ? null : faq.id)}
                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 sm:px-6 sm:py-5"
                          >
                            <span
                              className={`text-base font-semibold leading-snug transition-colors sm:text-lg ${isOpen ? "text-blue-900" : "text-slate-800"
                                }`}
                            >
                              {faq.question}
                            </span>
                            <span
                              aria-hidden="true"
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 motion-reduce:transition-none ${isOpen
                                  ? "rotate-180 bg-blue-600 text-white"
                                  : "bg-slate-100 text-slate-500"
                                }`}
                            >
                              <ChevronDown className="h-5 w-5" />
                            </span>
                          </button>
                        </h3>

                        <div
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                          className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                            }`}
                        >
                          <div className="overflow-hidden">
                            <p className="px-5 pb-6 pt-0 text-[15px] leading-relaxed text-slate-600 sm:px-6 sm:text-base sm:leading-7">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    We couldn’t find a match
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
                    Try a different word, or clear your filters to see every question.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {/* CTA */}
              <div className="relative mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 to-blue-700 p-6 text-white shadow-xl shadow-blue-900/15 sm:mt-16 sm:p-10">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-400/25 blur-3xl"
                />
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 sm:flex">
                      <MessageCircle className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold sm:text-2xl">Still have questions?</h2>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-blue-100 sm:text-base">
                        Talk to our friendly team. We’ll walk you through your options and
                        help you build the right care plan.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/contact"
                    className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-blue-800 shadow-sm transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-800"
                  >
                    Contact us
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}