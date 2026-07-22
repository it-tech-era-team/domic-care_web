'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import ProChatWindow from '@/components/ProChatWindow';

export default function UserMessagesPage() {
  const searchParams = useSearchParams();
  const convId = searchParams.get('conv');

  return (
    <div className="space-y-6">
      <ProChatWindow role="user" initialConvId={convId || undefined} />
    </div>
  );
}
