'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import axios from 'axios';
import { IEvent } from './type';
import { apiUrl } from '../../config';
import { MdClose, MdDateRange, MdAttachMoney, MdPeople, MdLocationOn } from 'react-icons/md';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/lib/redux/hooks';
import VoucherModal from './VoucherModal'; // Import the VoucherModal component

// Define the Voucher interface
interface Voucher {
  code: string;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const EventModal: React.FC<{ event: IEvent; onClose: () => void }> = ({ event, onClose }) => {
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<string | null>(null);
  const router = useRouter();
  const auth = useAppSelector((state) => state.auth);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleDelete = () => {
    toast.custom((t) => (
      <div className="bg-white px-4 py-3 shadow-md rounded-md border text-xs text-gray-700 flex flex-col gap-2 w-64">
        <p>Are you sure you want to delete this event?</p>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-xs px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const loadingId = showLoading('Deleting event...');
              try {
                const token = auth.token;
                if (!token) {
                  showError('Authorization token missing');
                  return;
                }
                await axios.delete(`${apiUrl}/event/${event.id}`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
                showSuccess('Event deleted successfully!');
                router.push('/my-event'); // Redirect after deletion
                onClose(); // Close the modal after deletion
              } catch (err) {
                showError('Failed to delete event');
              } finally {
                dismissToast(loadingId);
              }
            }}
            className="text-xs px-2 py-1 rounded-md bg-rose-600 text-white hover:bg-rose-700"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    ));
  };

  const handleDeleteVoucher = async (voucherCode: string) => {
    const loadingId = showLoading('Deleting voucher...');
    try {
      const token = auth.token;
      if (!token) {
        showError('Authorization token missing');
        return;
      }
      await axios.delete(`${apiUrl}/event/${event.id}/voucher/${voucherCode}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccess('Voucher deleted successfully!');
      setVoucherToDelete(null); // Reset voucher state after deletion
    } catch (err) {
      showError('Failed to delete voucher');
    } finally {
      dismissToast(loadingId);
    }
  };

  const handleVoucherClick = () => {
    setShowVoucherModal(true); // Open the VoucherModal
  };

  const handleVoucherCreated = () => {
    onClose(); // Close the EventModal when a voucher is created
    setShowVoucherModal(false); // Close the VoucherModal as well
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm px-4"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={backdropVariants}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden relative"
        variants={modalVariants}
      >
        {event.image && (
          <div className="relative h-40 w-full overflow-hidden">
            <img
              src={`${apiUrl}${event.image}`}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-2 right-2 bg-white p-1 rounded-full text-xl text-gray-600 hover:text-gray-900 shadow-lg z-10"
            >
              <MdClose />
            </button>
          </div>
        )}

        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{event.name}</h2>

          <div className="space-y-1 text-gray-700 text-xs">
            <div className="flex items-center">
              <MdLocationOn className="text-gray-600 mr-2" />
              <p className="text-xs text-gray-500">{event.location}</p>
            </div>
            <div className="flex items-center">
              <MdDateRange className="text-gray-600 mr-2" />
              <span>{`${formatDate(event.start_date)} - ${formatDate(event.end_date)}`}</span>
            </div>
            <div className="flex items-center">
              <MdAttachMoney className="text-gray-600 mr-2" />
              <span>{formatCurrency(event.price)}</span>
            </div>
            <div className="flex items-center">
              <MdPeople className="text-gray-600 mr-2" />
              <span>
                {event.transactions.length} / {event.quota}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-800">Description</h3>
            <p className="text-gray-600 text-xs">{event.description}</p>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <button
              onClick={() => router.push(`/my-event/update/${event.id}`)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1 px-3 rounded-md transition-colors text-xs"
            >
              Update
            </button>
            <button
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium py-1 px-3 rounded-md transition-colors text-xs"
            >
              Delete
            </button>
            <button
              onClick={handleVoucherClick} // Open the VoucherModal
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1 px-3 rounded-md transition-colors text-xs"
            >
              Create Voucher
            </button>
            <button
              onClick={() => console.log('Verify clicked')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded-md transition-colors text-xs"
            >
              Verify Attendees
            </button>

            {/* Render Delete Voucher Button */}
            {event.voucher_event && event.voucher_event.length > 0 ? (
              event.voucher_event.map((voucher: Voucher) => (
                <button
                  key={voucher.code}
                  onClick={() => handleDeleteVoucher(voucher.code)}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-3 rounded-md transition-colors text-xs"
                >
                  Delete Voucher: {voucher.code}
                </button>
              ))
            ) : (
              <p className="text-center text-xs">No vouchers available</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Render VoucherModal if the state is true */}
      {showVoucherModal && (
        <VoucherModal
          eventId={event.id}
          onClose={() => setShowVoucherModal(false)}
          onVoucherCreated={handleVoucherCreated} // Pass the callback to close EventModal
        />
      )}
    </motion.div>
  );
};

export default EventModal;
