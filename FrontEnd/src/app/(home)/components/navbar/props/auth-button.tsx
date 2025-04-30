'use client';

import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { useRouter } from 'next/navigation';
import { onLogout } from '@/lib/redux/features/authSlices';
import { deleteCookie } from 'cookies-next';
import { FaUserCircle } from 'react-icons/fa';
import { useMemo, useState, useRef, useEffect } from 'react';

export default function AuthButton() {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [showProfile, setShowProfile] = useState(false);
  const showProfileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showProfile &&
        showProfileRef.current &&
        !showProfileRef.current.contains(event.target as Node)
      ) {
        setShowProfile(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfile]);

  const userName = useMemo(() => {
    if (auth.isLogin) {
      const fullName = `${auth.user.firstname} ${auth.user.lastname}`;
      return fullName.length >= 20 ? auth.user.firstname.slice(0, 20) : fullName;
    }
    return '';
  }, [auth.user]);

  return (
    <div className="hidden md:flex items-center gap-6 flex-shrink-0">
      {auth.isLogin ? (
        <div ref={showProfileRef} className="relative">
          <button
            className="flex gap-2 ml-6 items-center cursor-pointer"
            onClick={() => setShowProfile((prev) => !prev)}
          >
            {auth.user.profilepict ? (
              <img src={auth.user.profilepict} alt="Profile" className="w-8 h-8 rounded-full" />
            ) : (
              <FaUserCircle size={30} />
            )}
            <span>{userName}</span>
          </button>
          {showProfile && (
            <div className="flex flex-col absolute top-12 right-0 bg-white shadow-md gap-y-4 p-4 w-fit rounded-md z-50">
              <div className="flex items-center gap-2 pb-3 border-b">
                {auth.user.profilepict ? (
                  <img src={auth.user.profilepict} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                  <FaUserCircle size={30} />
                )}
                <div className="flex flex-col text-xs text-gray-600">
                  <span className="min-w-max">{userName}</span>
                  <span>{auth.user.email}</span>
                </div>
              </div>
              <div className="flex flex-col gap-y-2 items-start">
                {['profile', 'my event', 'checkout'].map((route) => (
                  <button
                    key={route}
                    className="text-black"
                    onClick={() => {
                      setShowProfile(false);
                      router.push(`/${route}`);
                    }}
                  >
                    {route
                      .split(' ')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                  </button>
                ))}
              </div>
              <button
                className="px-4 py-1 bg-emerald-900 rounded-2xl hover:bg-emerald-600 cursor-pointer text-white"
                onClick={() => {
                  dispatch(onLogout());
                  deleteCookie('access_token');
                  router.push('/');
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-4">
          {['login', 'register'].map((route) => (
            <button
              key={route}
              className="px-4 py-1 bg-emerald-900 rounded-2xl hover:bg-emerald-600 text-white"
              onClick={() => router.push(`/${route}`)}
            >
              {route.charAt(0).toUpperCase() + route.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
