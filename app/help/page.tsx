import React from 'react';
import type { Metadata } from 'next';
import HelpClient from '@/app/help/HelpClient';

export const metadata: Metadata = {
  title: 'Help Center & Support | DomicCare',
  description:
    'Find answers, guides, and support for families, clients, and caregivers. Get help with booking care, payments, safety verification, and account settings.',
  openGraph: {
    title: 'Help Center & Support | DomicCare',
    description:
      'Official Help Center for DomicCare clients and caregivers. Explore guides, FAQs, and get 24/7 dedicated support.',
    url: 'https://domiccare.com/help',
    siteName: 'DomicCare',
    type: 'website',
  },
  alternates: {
    canonical: '/help',
  },
};

export default function HelpPage() {
  return <HelpClient />;
}
