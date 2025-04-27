"use client";

import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { useRouter } from 'next/navigation';
import { onLogout } from '@/lib/redux/features/authSlices';
import { deleteCookie } from 'cookies-next';

export default function Navbar() {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  return (
    <div className='h-[1000px]'>
      <nav className='bg-amber-700 h-10 w-full flex items-center justify-between fixed px-15'>
        <div className='text-white'>
          LoketAcara
        </div>
        <div>
        {auth.isLogin ? (
          <div className='flex gap-6 text-white'>
            {auth.user.firstname} {auth.user.lastname}
            <button
              className='cursor-pointer'
              onClick={() => {
                dispatch(onLogout());
                deleteCookie("access_token");
                } 
              }
                > Logout
            </button>
          </div>
            
        ) : (
          <div className="flex gap-4 text-white">
              <button className ='cursor-pointer' onClick={() => router.push("/login")}>Login</button>
              <button className ='cursor-pointer' onClick={() => router.push("/register")}>Register</button>
          </div>
        )}
        </div>
      </nav>
    </div>
  )
}
