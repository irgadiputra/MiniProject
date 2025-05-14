'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { apiUrl } from '@/pages/config';
import { useAppSelector } from '@/lib/redux/hooks';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

interface VoucherModalProps {
  eventId: number;
  onClose: () => void;
  onVoucherCreated: () => void; // New callback prop to close the EventModal
}

const VoucherModal: React.FC<VoucherModalProps> = ({ eventId, onClose, onVoucherCreated }) => {
  const [discount, setDiscount] = useState<string>(''); // Discount is now a string
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const auth = useAppSelector((state) => state.auth);

  const handleCreateVoucher = async () => {
    if (!discount || !startDate || !endDate || !code) {
      showError('All fields are required');
      return;
    }

    const loadingId = showLoading('Creating voucher...');
    try {
      const token = auth.token;
      if (!token) {
        showError('Authorization token missing');
        return;
      }

      // Remove "%" and ensure the value is treated as a number
      const discountValue = discount.replace('%', '');

      const payload = {
        discount: discountValue + '%', // Ensure the discount is a string with "%" symbol
        start_date: startDate,
        end_date: endDate,
        code,
      };

      await axios.post(`${apiUrl}/event/${eventId}/voucher`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showSuccess('Voucher created successfully!');
      
      // Close both modals after voucher is successfully created
      onVoucherCreated(); // Close the EventModal
      onClose(); // Close the VoucherModal
    } catch (err) {
      showError('Failed to create voucher');
    } finally {
      dismissToast(loadingId);
    }
  };

  const handleClearDiscount = () => {
    setDiscount('');
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm px-4"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={modalVariants}
    >
      <motion.div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative" variants={modalVariants}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white p-2 rounded-full text-2xl text-gray-600 hover:text-gray-900 shadow-lg z-10"
        >
          X
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Voucher</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Voucher Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2 border rounded-md mt-2"
                placeholder="Enter voucher code"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Discount</label>
              <div className="relative">
                <input
                  type="text" // Changed to text input to allow '%' symbol
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full p-2 pr-14 border rounded-md mt-2"
                  placeholder="Enter discount in percent (%)"
                  maxLength={2}
                />
                {/* Clear button */}
                {discount !== '' && (
                  <button
                    type="button"
                    onClick={handleClearDiscount}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  >
                    <span className="text-xl">✖</span>
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border rounded-md mt-2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border rounded-md mt-2"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateVoucher}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md"
            >
              Create Voucher
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VoucherModal;
