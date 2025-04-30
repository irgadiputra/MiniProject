'use client';

import { FaSearch } from 'react-icons/fa';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { FaUserCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { deleteCookie } from 'cookies-next';
import { onLogout } from '@/lib/redux/features/authSlices';

export default function NavbarMD() {
  const router = useRouter();

  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [showSearch, setShowSearch] = useState(false);
  const [showNav, setShowNav] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (showSearch && searchRef.current && !searchRef.current.contains(target)) {
        setShowSearch(false);
      }

      if (showNav && navRef.current && !navRef.current.contains(target)) {
        setShowNav(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch, showNav])

   const userName = useMemo(() => {
      if (auth.isLogin) {
        const fullName = `${auth.user.firstname} ${auth.user.lastname}`;
        const name = fullName.length >= 20 ? auth.user.firstname.slice(0, 20) : fullName;
        return name;
      }
      return '';
    }, [auth.user]);

  return (
    <div className="flex md:hidden items-center gap-4 relative">

      <div ref={searchRef}>
        <button className="text-xl" onClick={() => {
          setShowSearch(true);
          setShowNav(false); 
        }}>
          <FaSearch />
        </button>

        {showSearch && (
          <div className="fixed inset-0 bg-white z-50 p-4 flex flex-col">
            <div className="flex items-center gap-2 border-b pb-2">
              <FaSearch className="text-xl" />
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 outline-none text-lg text-black"
                autoFocus
              />
              <button
                className="text-md text-black"
                onClick={() => setShowSearch(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nav Icon */}
      <div ref={navRef}>
        <button
          className="text-2xl"
          onClick={() => {
            setShowNav((prev) => !prev);
            setShowSearch(false);
          }}
        >
          {showNav ? <AiOutlineClose /> : <AiOutlineMenu />}
        </button>

        {showNav && (
          <div className="flex flex-col absolute top-12 right-0 bg-white shadow-md gap-y-4
                          p-4 w-fit rounded-md">
            <div className='flex items-center gap-2 pb-3 border-b'>
              {auth.user.profilepict ? (<img src={auth.user.profilepict} alt="Profile" />
            ) : (<FaUserCircle size={30} />)}
              <div className='flex flex-col text-xs text-black'>
                <span className='min-w-max'>{userName}</span>
                <span>{auth.user.email}</span>
              </div>  
            </div>
            <div className='flex flex-col gap-y-2 items-start'>
              {['profile','my event', 'checkout'].map((route) => (
                <button
                  key={route}
                  className='text-black'
                  onClick={() => router.push(`${route}`)}
                >
                 {route
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
                </button>
              ))}
            </div>
               <button
                  className="px-4 py-1 bg-emerald-900 rounded-2xl text-white"
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
    </div>
  );
}
