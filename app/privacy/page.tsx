import React from 'react';
import type { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';

export const metadata: Metadata = {
  title: 'Privacy Policy | DomicCare Legal & Data Protection',
  description:
    'Learn how DomicCare collects, uses, discloses, and safeguards personal information on our home care marketplace platform, including responsibilities of technical service providers.',
  openGraph: {
    title: 'Privacy Policy | DomicCare',
    description:
      'Official Privacy Policy and data protection standards for DomicCare clients, caregivers, and technical service providers.',
    url: 'https://domiccare.com/privacy',
    siteName: 'DomicCare',
    type: 'website',
  },
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
