import React from 'react';
import { useRouter } from 'next/navigation';
import { onLogout } from '@/lib/redux/features/authSlices'; 
import { useAppDispatch } from '@/lib/redux/hooks';
import { showSuccess, showError } from '@/utils/toast'; 

const UserMenuItems = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    try {
      dispatch(onLogout());
      
      showSuccess('Logged out successfully!');
      
      router.push('/');
    } catch (error) {
      showError('Logout failed. Please try again.');
    } finally {
      onClose();
    }
  };

  // Menu items
  const menuItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Profile', path: '/profile' },
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
        onClick={handleLogout} // Using the new handleLogout function
        className="text-left px-4 py-2 text-red-600 hover:bg-gray-100"
      >
        Logout
      </button>
    </div>
  );
};

export default UserMenuItems;
