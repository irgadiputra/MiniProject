"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';

export function useAuthRedirect() {
  const auth = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!auth.isLogin) {
      router.replace('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [auth.isLogin, router]);

  return isAuthorized;
}
