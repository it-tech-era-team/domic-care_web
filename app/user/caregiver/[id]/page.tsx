import React from 'react';
import CaregiverClient from './CaregiverClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default async function CaregiverProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CaregiverClient id={id} />;
}
