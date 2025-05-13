// app/components/ClientProviders.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import StoreProvider from './storeProvider';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <StoreProvider>{children}</StoreProvider>
    </SessionProvider>
  );
}
