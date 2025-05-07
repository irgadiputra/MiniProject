'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { getCookie } from 'cookies-next';
import { decodeTokenToAuth } from './decodedToken';
import { onLogin } from '@/lib/redux/features/authSlices';

export default function Auth({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refreshLogin = async () => {
      const token = (await getCookie('access_token')) as string || '';

      if (!token || !token.includes('.')) {
        setLoading(false);
        return;
      }

      try {
        const auth = decodeTokenToAuth(token);  // Decode token to IAuth object

        if (!auth || !auth.token) {
          setLoading(false);
          return;
        }

        dispatch(onLogin({ user: auth.user, token: auth.token }));  // Dispatch updated auth state
      } catch (error) {
        console.error('Invalid token:', error);
      } finally {
        setLoading(false);
      }
    };

    refreshLogin();
  }, [dispatch]);

  return loading ? <div>Loading...</div> : <>{children}</>;
}
