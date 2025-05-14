'use client';

import { useParams, useRouter } from 'next/navigation';  // Import useRouter
import { useState } from 'react';
import axios from 'axios';
import { FaTicketAlt, FaCheckCircle, FaTimesCircle, FaUpload, FaSpinner, FaTimes } from 'react-icons/fa';  // Import X icon
import { useAppSelector } from '@/lib/redux/hooks';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { transactionValidationSchema } from './components/schema';
import { TransactionFormValues } from './components/type';
import { motion } from 'framer-motion'; // Import Framer Motion
import toast from 'react-hot-toast';

export default function TransactionPage() {
  const params = useParams();
  const router = useRouter();  // Use useRouter hook for navigation
  const id = params?.id;
  const auth = useAppSelector((state) => state.auth);
  const token = auth.token;

  const [transaction, setTransaction] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const initialValues: TransactionFormValues = {
    quantity: 1,
    point: 0,
    voucherCode: '',
    couponCode: '',
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
  };

  const handleCreateTransaction = async (values: TransactionFormValues) => {
    if (!token) {
      showMessage('You must be logged in to create a transaction.', 'error');
      return;
    }

    if (!id || isNaN(Number(id))) {
      showMessage('Invalid event ID', 'error');
      return;
    }

    if (values.quantity < 1) {
      showMessage('Quantity must be at least 1', 'error');
      return;
    }

    setMessage(null);
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:8080/transaction',
        {
          eventId: parseInt(id as string),
          quantity: values.quantity,
          point: values.point,
          voucher_code: values.voucherCode || undefined,
          coupon_code: values.couponCode || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTransaction(response.data.data);
      showMessage('Transaction created! Now upload payment proof.', 'success');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to create transaction';
      showMessage(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async () => {
    if (!file || !transaction?.id) {
      showMessage('Please select a file before uploading.', 'error');
      return;
    }

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.patch(
        `http://localhost:8080/transaction/${transaction.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      showMessage('Payment proof uploaded successfully!', 'success');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Upload failed';
      showMessage(msg, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    router.push(`/event/${id}`);  // Navigate back to the event details page
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 px-4">
      <motion.div className="flex flex-col gap-5 w-full max-w-xl bg-white p-10 rounded-2xl shadow-md relative">
        {/* Close button (X) */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-2 text-gray-600 hover:text-gray-900"
        >
          <FaTimes size={20} />
        </button>

        <h1 className="text-2xl font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <FaTicketAlt className="text-blue-600" /> Purchase Tickets
        </h1>

        <Formik
          initialValues={initialValues}
          validationSchema={transactionValidationSchema(auth.user.point)} // Call schema function here
          onSubmit={handleCreateTransaction}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <Field
                  type="number"
                  name="quantity"
                  className="border border-slate-300 rounded-md p-2 h-10 bg-white text-slate-800"
                  min={1}
                />
                <ErrorMessage name="quantity" component="div" className="text-red-600 text-xs mt-1" />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-1">Use Points</label>
                <Field
                  type="number"
                  name="point"
                  className="border border-slate-300 rounded-md p-2 h-10 bg-white text-slate-800"
                  min={0}
                />
                <ErrorMessage name="point" component="div" className="text-red-600 text-xs mt-1" />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-1">Voucher Code (optional)</label>
                <Field
                  type="text"
                  name="voucherCode"
                  className="border border-slate-300 rounded-md p-2 h-10 bg-white text-slate-800"
                />
                <ErrorMessage name="voucherCode" component="div" className="text-red-600 text-xs mt-1" />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-1">Coupon Code (optional)</label>
                <Field
                  type="text"
                  name="couponCode"
                  className="border border-slate-300 rounded-md p-2 h-10 bg-white text-slate-800"
                />
                <ErrorMessage name="couponCode" component="div" className="text-red-600 text-xs mt-1" />
              </div>

              <button
                type="submit"
                className="mt-4 p-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                disabled={isSubmitting || loading}
              >
                {loading ? 'Processing...' : 'Create Transaction'}
              </button>
            </Form>
          )}
        </Formik>

        {transaction && (
          <motion.div className="mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <p className="text-green-600 font-medium">Transaction #{transaction.id} created.</p>

            <div className="mt-4 flex flex-col">
              <label className="text-sm font-medium text-slate-700 mb-1">Upload Payment Proof</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="border border-slate-300 rounded-md p-2 h-10 bg-white text-slate-800"
              />
            </div>

            <button
              onClick={handleUploadProof}
              className="mt-2 p-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition disabled:opacity-50"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Proof'}
            </button>
          </motion.div>
        )}

        {message && (
          <motion.div
            className={`p-3 rounded flex items-center gap-2 mt-4 ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {messageType === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
            {message}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
