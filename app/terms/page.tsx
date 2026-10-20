import React from 'react';
import type { Metadata } from 'next';
import TermsClient from '@/app/terms/TermsClient';

export const metadata: Metadata = {
  title: 'Terms of Service | DomicCare Legal Policy',
  description:
    'Read the official Terms of Service for DomicCare. Clear legal framework governing platform access, caregiver directory services, technical responsibilities, and client safety.',
  openGraph: {
    title: 'Terms of Service | DomicCare',
    description: 'Official Terms of Service and legal policies for DomicCare platform users, clients, and caregivers.',
    url: 'https://domiccare.com/terms',
    siteName: 'DomicCare',
    type: 'website',
  },
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return <TermsClient />;
}
