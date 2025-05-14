'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAppSelector } from '@/lib/redux/hooks';
import { useRouter } from 'next/navigation';
import { apiUrl } from '../config';
import EventModal from './components/EventModal';
import { IEvent, ITransaction } from './components/type';
import { AnimatePresence } from 'framer-motion';
import { AiOutlineClose } from 'react-icons/ai'; // Import the close icon

const OrganizerEvents = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedEventData, setSelectedEventData] = useState<IEvent | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);
  const auth = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLogin) {
      router.push('/login');
      return;
    }

    if (auth.user.status_role !== 'organiser') {
      setError('You do not have permission to view events');
      setIsLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        const token = auth.token;
        if (!token) {
          setError('Authorization token missing');
          setIsLoading(false);
          return;
        }

        const response = await axios.get(`${apiUrl}/event/organizer/${auth.user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Fetched events:', response.data.data);
        setEvents(response.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch events. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [auth, router]);

  const handleRowClick = async (eventId: number) => {
    try {
      const token = auth.token;
      const organizerId = auth.user.id;

      const response = await axios.get(`${apiUrl}/event/${eventId}/organizer/${organizerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Full event data:', response.data.data);
      setSelectedEventData(response.data.data);
      setSelectedEventId(eventId);
    } catch (error) {
      console.error('Failed to fetch event details:', error);
      setError('Could not load event details');
    }
  };

  const handleTransactionStatusChange = async (transactionId: number, status: string) => {
    try {
      const token = auth.token;

      const response = await axios.patch(`${apiUrl}/transaction/${transactionId}/status`, 
        { status }, {
          headers: { Authorization: `Bearer ${token}` },
        });

      console.log('Transaction status updated:', response.data);
      setTransactionStatus(status);
      setSelectedTransactionId(null); // Close transaction modal
    } catch (err) {
      console.error('Failed to update transaction status:', err);
      setError('Could not update transaction status');
    }
  };

  const handleCloseModal = () => {
    setSelectedEventId(null);
    setSelectedEventData(null);
    setSelectedTransactionId(null);  // Close transaction modal
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) return <div className="text-center text-lg">Loading events...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (events.length === 0) return <div className="text-center text-lg">No events found.</div>;

  return (
    <div className="my-events-container">
      {/* Close Button */}
      <button
        type="button"
        className="absolute top-4 right-4 text-xl text-slate-400 hover:text-blue-500 transition"
        onClick={() => router.push('/')} // Redirect to the main page
      >
        <AiOutlineClose />
      </button>

      <h2 className="text-2xl font-semibold text-slate-800 mb-4">My Events</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 text-sm sm:text-base">Event Name</th>
              <th className="px-4 py-2 text-sm sm:text-base">Location</th>
              <th className="px-4 py-2 text-sm sm:text-base hidden md:table-cell">Date</th>
              <th className="px-4 py-2 text-sm sm:text-base hidden md:table-cell">Price</th>
              <th className="px-4 py-2 text-sm sm:text-base">Attendees</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr
                key={event.id}
                className="border-b cursor-pointer hover:bg-gray-100 text-center"
                onClick={() => handleRowClick(event.id)}
              >
                <td className="px-4 py-2 text-sm sm:text-base">{event.name}</td>
                <td className="px-4 py-2 text-sm sm:text-base">{event.location}</td>
                <td className="px-4 py-2 text-sm sm:text-base hidden md:table-cell">{`${formatDate(event.start_date)} - ${formatDate(event.end_date)}`}</td>
                <td className="px-4 py-2 text-sm sm:text-base hidden md:table-cell">{formatCurrency(event.price)}</td>
                <td className="px-4 py-2 text-sm sm:text-base">{event.transactions.length} / {event.quota}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedEventId !== null && selectedEventData && (
          <EventModal
            key={selectedEventId}
            event={selectedEventData}
            onClose={handleCloseModal}
            onTransactionStatusChange={handleTransactionStatusChange}  // New prop for handling transaction status change
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrganizerEvents;
