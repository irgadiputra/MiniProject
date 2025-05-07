'use client';

import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaCompass, FaUserCircle } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi';
import React from 'react';

const UserMenuItems = React.lazy(() => import('./userMenuItems'));

export default function Navbar() {
  const auth = useAppSelector((state) => state.auth);
  const router = useRouter();

  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstDebounceRun = useRef(true);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  useEffect(() => {
    if (firstDebounceRun.current) {
      firstDebounceRun.current = false;
      return;
    }

    if (debouncedSearch) {
      console.log('Searching for:', debouncedSearch);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = () => {
    console.log('Searching for:', search);
    setShowSearch(false);
  };

  return (
    <>
      <nav className="bg-amber-700 h-16 w-full flex items-center justify-between px-6 relative z-40">
        <div className="text-white font-bold text-lg">LoketAcara</div>

        {/* Desktop search */}
        <div className="relative hidden md:flex items-center gap-2 flex-1 justify-center max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="px-3 py-2 pl-10 pr-12 rounded-md w-full bg-amber-800 text-white focus:outline-none focus:bg-white focus:text-black"
            />
            <button className="absolute top-0 bottom-0 right-0 w-12 flex items-center justify-center rounded-r-md bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:scale-105 transition cursor-pointer">
              <FaSearch />
            </button>
          </div>
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-4 text-white">
          {auth.isLogin ? (
            <div className="relative" ref={userMenuRef}>
              <div className="flex gap-6 items-center">
                <button
                  onClick={() => router.push('/create-event')}
                  className="flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FaCompass size={30} />
                  <span>Buat Eventmu!</span>
                </button>
                <button
                  onClick={() => setShowUserMenu((prev) => !prev)}
                  className="cursor-pointer flex gap-2 items-center"
                >
                  {auth.user?.profile_pict ? (
                   <img 
                    src={`http://localhost:8080${auth.user.profile_pict}`} 
                    alt="Avatar"
                    className='w-8 h-8 rounded-full'
                  />
                  ) : (
                    <FaUserCircle size={30} />
                  )}
                  {auth.user?.first_name} {auth.user?.last_name}
                </button>
              </div>
              {showUserMenu && (
                <React.Suspense>
                  <div className="absolute top-full right-0 mt-2 w-[200px] bg-white shadow-lg rounded-md py-2 z-50">
                    <UserMenuItems onClose={() => setShowUserMenu(false)} />
                  </div>
                </React.Suspense>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => router.push('/create-event')}
                className="flex items-center justify-center gap-2 cursor-pointer mr-5"
              >
                <FaCompass size={30} />
                <span>Buat Eventmu!</span>
              </button>
              <button onClick={() => router.push('/login')} className="cursor-pointer hover:underline">
                Login
              </button>
              <button onClick={() => router.push('/register')} className="cursor-pointer hover:underline">
                Register
              </button>
            </>
          )}
        </div>

        {/* Mobile icons */}
        <div className="flex md:hidden gap-4 items-center">
          <button className="text-white" aria-label="Explore Events" onClick={() => { router.push('create-event'); }}>
            <FaCompass className="w-6 h-6" />
          </button>
          <button onClick={() => setShowSearch(true)} className="text-white" aria-label="Search">
            <FaSearch className="w-6 h-6" />
          </button>
          <button onClick={() => setShowMenu((prev) => !prev)} className="text-white" aria-label="Menu">
            <GiHamburgerMenu size={24} />
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {showMenu && (
          <div ref={menuRef} className="absolute top-16 right-4 bg-white shadow-lg rounded-md py-2 z-50 w-48">
            {auth.isLogin ? (
              <React.Suspense>
                <UserMenuItems onClose={() => setShowMenu(false)} />
              </React.Suspense>
            ) : (
              <>
                <button
                  onClick={() => { router.push('/login'); setShowMenu(false); }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Login
                </button>
                <button
                  onClick={() => { router.push('/register'); setShowMenu(false); }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Register
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Mobile search overlay */}
      {showSearch && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-4 md:hidden">
          <input
            type="text"
            className="w-full max-w-lg border border-gray-300 rounded-md px-4 py-2 mb-4"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className="flex gap-4">
            <button onClick={handleSearchSubmit} className="bg-amber-700 text-white px-4 py-2 rounded hover:bg-amber-800">
              Search
            </button>
            <button onClick={() => setShowSearch(false)} className="text-gray-600 hover:underline">
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
