'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAppSelector } from '@/lib/redux/hooks';
import { useRouter } from 'next/navigation';
import { apiUrl } from '../config';
import { AiOutlineClose } from 'react-icons/ai';
import { ITransaction } from './components/type';

const TransactionList = () => {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLogin) {
      router.push('/login');
      return;
    }

    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`${apiUrl}/transaction`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setTransactions(response.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [auth, router]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'WAITING_CONFIRMATION':
        return 'bg-yellow-100 text-yellow-800';
      case 'DONE':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-200 text-gray-600';
      case 'EXPIRED':
        return 'bg-gray-300 text-gray-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (isLoading) return <div className="text-center">Loading transactions...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (transactions.length === 0) return <div className="text-center">No transactions found.</div>;

  return (
    <div className="my-transactions-container relative p-4">
      <button
        type="button"
        className="absolute top-4 right-4 text-xl text-slate-400 hover:text-blue-500"
        onClick={() => router.push('/')}
      >
        <AiOutlineClose />
      </button>

      <h2 className="text-2xl font-semibold text-slate-800 mb-4">My Transactions</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 text-sm">Event</th>
              <th className="px-4 py-2 text-sm">Total Price</th>
              <th className="px-4 py-2 text-sm">Status</th>
              <th className="px-4 py-2 text-sm">Date</th>
              <th className="px-4 py-2 text-sm hidden md:table-cell">Location</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="border-b text-center hover:bg-gray-100"
              >
                <td className="px-4 py-2">{tx.event?.name || 'N/A'}</td>
                <td className="px-4 py-2">{formatCurrency(tx.total_price)}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(tx.status)}`}>
                    {tx.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-2">{formatDate(tx.created_at)}</td>
                <td className="px-4 py-2 hidden md:table-cell">{tx.event?.location || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;
