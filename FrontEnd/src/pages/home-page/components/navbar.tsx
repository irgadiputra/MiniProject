'use client';

import { useAppSelector } from '@/lib/redux/hooks'; // Importing Redux hook to access state
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaCompass, FaUserCircle } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi';
import React from 'react';
import { apiUrl } from '@/pages/config';

const UserMenuItems = React.lazy(() => import('./userMenuItems'));

export default function Navbar() {
  const auth = useAppSelector((state) => state.auth); // Get auth state from Redux
  const router = useRouter();

  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerMenuRef = useRef<HTMLButtonElement>(null);

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    if (search) params.append('query', search);
    if (location) params.append('location', location);
    if (status) params.append('status', status);
    router.push(`/search?${params.toString()}`);
    setShowSearch(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (hamburgerMenuRef.current && !hamburgerMenuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleHamburgerMenu = () => {
    setShowMenu((prev) => !prev);
  };

  return (
    <>
      <nav className="bg-amber-700 h-16 w-full flex items-center justify-between px-6 relative z-40">
        <div
          className="text-white font-bold text-lg cursor-pointer"
          onClick={() => router.push('/')}
        >
          LoketKita
        </div>

        {/* Desktop search */}
        <div className="hidden md:flex flex-1 justify-center gap-2 max-w-3xl">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Event name..."
            className="px-3 py-2 rounded bg-amber-800 text-white focus:outline-none focus:bg-white focus:text-black"
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="px-3 py-2 rounded bg-amber-800 text-white focus:outline-none focus:bg-white focus:text-black"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded bg-amber-800 text-white focus:outline-none focus:bg-white focus:text-black"
          >
            <option value="">Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="past">Past</option>
          </select>
          <button
            onClick={handleSearchSubmit}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded"
          >
            <FaSearch />
          </button>
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-4 text-white">
          {auth.isLogin ? (
            <div className="relative" ref={userMenuRef}>
              <div className="flex gap-6 items-center">
                <button
                  onClick={() => router.push('/create-event')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FaCompass size={20} />
                  <span>Buat Eventmu!</span>
                </button>
                <button
                  onClick={() => setShowUserMenu((prev) => !prev)}
                  className="flex items-center gap-2"
                >
                  {auth.user?.profile_pict ? (
                    <img
                      src={`${apiUrl}${auth.user.profile_pict}`}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <FaUserCircle size={30} />
                  )}
                  {auth.user?.first_name} {auth.user?.last_name}
                </button>
              </div>
              {showUserMenu && (
                <React.Suspense fallback={<div>Loading...</div>}>
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
                className="flex items-center gap-2 mr-5"
              >
                <FaCompass size={20} />
                <span>Buat Eventmu!</span>
              </button>
              <button onClick={() => router.push('/login')} className="hover:underline">
                Login
              </button>
              <button onClick={() => router.push('/register')} className="hover:underline">
                Register
              </button>
            </>
          )}
        </div>

        {/* Mobile icons */}
        <div className="md:hidden flex gap-4 items-center">
          <button
            onClick={() => router.push('/create-event')}
            className="text-white"
            aria-label="Create"
          >
            <FaCompass />
          </button>
          <button
            onClick={() => setShowSearch(true)}
            className="text-white"
            aria-label="Search"
          >
            <FaSearch />
          </button>
          <button
            ref={hamburgerMenuRef}
            onClick={toggleHamburgerMenu}
            className="text-white"
            aria-label="Menu"
          >
            <GiHamburgerMenu size={24} />
          </button>
        </div>

        {/* Mobile menu */}
        {showMenu && isMobile && (
          <div className="absolute top-16 right-4 bg-white shadow-lg rounded-md py-2 z-50 w-48">
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
            placeholder="Search event name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <input
            type="text"
            className="w-full max-w-lg border border-gray-300 rounded-md px-4 py-2 mb-4"
            placeholder="Location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <select
            className="w-full max-w-lg border border-gray-300 rounded-md px-4 py-2 mb-4"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="past">Past</option>
          </select>
          <div className="flex gap-4">
            <button
              onClick={handleSearchSubmit}
              className="bg-amber-700 text-white px-4 py-2 rounded hover:bg-amber-800"
            >
              Search
            </button>
            <button
              onClick={() => setShowSearch(false)}
              className="text-gray-600 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
