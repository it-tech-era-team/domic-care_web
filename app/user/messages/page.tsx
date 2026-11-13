'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProChatWindow from '@/components/ProChatWindow';

function UserMessagesContent() {
  const searchParams = useSearchParams();
  const convId = searchParams.get('conv');

  return (
    <div className="flex-1 min-h-0 w-full h-full flex flex-col overflow-hidden">
      <ProChatWindow role="user" initialConvId={convId || undefined} />
    </div>
  );
}

export default function UserMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <UserMessagesContent />
    </Suspense>
  );
}
