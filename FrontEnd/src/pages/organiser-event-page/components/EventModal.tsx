'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { IEvent } from './type';
import { apiUrl } from '../../config';
import { MdClose, MdDateRange, MdAttachMoney, MdPeople, MdLocationOn } from 'react-icons/md';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const EventModal: React.FC<{ event: IEvent; onClose: () => void }> = ({ event, onClose }) => {
  const router = useRouter();

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

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm px-4"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={backdropVariants}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative"
        variants={modalVariants}
      >
        {event.image && (
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={`${apiUrl}${event.image}`}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white p-2 rounded-full text-2xl text-gray-600 hover:text-gray-900 shadow-lg z-10"
            >
              <MdClose />
            </button>
          </div>
        )}

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{event.name}</h2>

          <div className="space-y-1 text-gray-700 text-sm">
            <div className="flex items-center">
              <MdLocationOn className="text-gray-600 mr-2" />
              <p className="text-sm text-gray-500">{event.location}</p>
            </div>
            <div className="flex items-center">
              <MdDateRange className="text-gray-600 mr-2" />
              <span>
                {`${formatDate(event.start_date)} - ${formatDate(event.end_date)}`}
              </span>
            </div>
            <div className="flex items-center">
              <MdAttachMoney className="text-gray-600 mr-2" />
              <span>{formatCurrency(event.price)}</span>
            </div>
            <div className="flex items-center">
              <MdPeople className="text-gray-600 mr-2" />
              <span>{event.transactions.length} / {event.quota}</span>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-800">Description</h3>
            <p className="text-gray-600 text-sm">{event.description}</p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => router.push(`/my-event/update/${event.id}`)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Update
            </button>
            <button
              onClick={() => console.log('Delete clicked')}
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => console.log('Voucher clicked')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Voucher
            </button>
            <button
              onClick={() => console.log('Verify clicked')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Verify Attendees
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EventModal;
