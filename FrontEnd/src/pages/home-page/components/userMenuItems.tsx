import React from 'react';
import { useRouter } from 'next/navigation';
import { onLogout } from '@/lib/redux/features/authSlices';
import { useAppDispatch } from '@/lib/redux/hooks';
import { deleteCookie } from 'cookies-next';

const UserMenuItems = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(onLogout());
    deleteCookie('access_token');
    router.push('/');
  };

  const menuItems = [
    { label: 'Profile', path: '/profile' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My Event', path: '/my-event' },
    { label: 'Transaction', path: '/transaction' },
  ];

  return (
    <div className="flex flex-col gap-1 p-2">
      {menuItems.map((item) => (
        <button
          key={item.path}
          onClick={() => {
            router.push(item.path);
            onClose();
          }}
          className="text-left px-4 py-2 text-black hover:bg-gray-100"
        >
          {item.label}
        </button>
      ))}

      <hr className="my-2" />

      <button
        onClick={() => {
          handleLogout();
          onClose();
        }}
        className="text-left px-4 py-2 text-red-600 hover:bg-gray-100"
      >
        Logout
      </button>
    </div>
  );
};

export default UserMenuItems;
