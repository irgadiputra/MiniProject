'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import { useAppSelector } from '@/lib/redux/hooks';
import { useRouter } from 'next/navigation';
import { apiUrl } from '../../config';
import EventModal from './EventModal';
import { IEvent } from './type';
import { AnimatePresence } from 'framer-motion';

const OrganizerEvents = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const auth = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLogin) {
      router.push('/login');
      return;
    }

    const fetchEvents = async () => {
      try {
        const token = getCookie('access_token');
        if (!token) {
          setError('Authorization token not found');
          return;
        }

        const response = await axios.get(`${apiUrl}/event/organizer/${auth.user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEvents(response.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [auth, router]);

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

  const handleRowClick = (eventId: number) => {
    setSelectedEventId((prevId) => (prevId === eventId ? null : eventId));
  };

  const handleCloseModal = () => {
    setSelectedEventId(null);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (events.length === 0) return <div>No events found.</div>;

  return (
    <div className="my-events-container">
      <h2 className="text-2xl font-semibold text-slate-800 mb-4">My Events</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2">Event Name</th>
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Attendees</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr
                key={event.id}
                className="border-b cursor-pointer hover:bg-gray-100 text-center"
                onClick={() => handleRowClick(event.id)}
              >
                <td className="px-4 py-2">{event.name}</td>
                <td className="px-4 py-2">{event.location}</td>
                <td className="px-4 py-2">{`${formatDate(event.start_date)} - ${formatDate(event.end_date)}`}</td>
                <td className="px-4 py-2">{formatCurrency(event.price)}</td>
                <td className="px-4 py-2">{event.transactions.length} / {event.quota}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AnimatePresence for Modal Transitions */}
      <AnimatePresence>
        {selectedEventId !== null && (
          <EventModal
            key={selectedEventId}
            event={events.find((event) => event.id === selectedEventId)!}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrganizerEvents;
