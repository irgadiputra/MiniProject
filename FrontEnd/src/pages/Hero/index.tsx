'use client';

import { useAppSelector } from '@/lib/redux/hooks';
import React, { useEffect, useState } from 'react';
import { fetchEvents } from './components/event';
import { IEvent } from './components/type';
import { apiUrl } from '../config';

export default function Hero() {
  const auth = useAppSelector((state) => state.auth);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const data = await fetchEvents();
        setEvents(data);
      } catch (error) {
        console.error('Failed to fetch events', error);
      } finally {
        setLoading(false);
      }
    };

    if (auth.isLogin) {
      loadEvents();
    }
  }, [auth.isLogin]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {auth.isLogin ? (
        <div>
          <h1 className="text-2xl font-bold mb-2">
            Welcome, {auth.user?.first_name} {auth.user?.last_name}!
          </h1>
          <div className="mb-6 text-sm text-gray-700">
            <p><strong>Email:</strong> {auth.user?.email}</p>
            <p><strong>Role:</strong> {auth.user?.status_role}</p>
            <p><strong>Referral code:</strong> {auth.user?.referal_code}</p>
            <p><strong>Point:</strong> {auth.user?.point}</p>
            <p><strong>Is Verified:</strong> {auth.user.is_verified ? 'True' : 'False'}</p>
          </div>

          <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>

          {loading ? (
            <p>Loading events...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <EventCard key={index} event={event} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <h1 className="text-xl font-semibold">Please log in</h1>
      )}
    </div>
  );
}

function EventCard({ event }: { event: IEvent }) {
  const fallbackImage = 'https://via.placeholder.com/400x200?text=No+Image';

  const now = new Date();
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  let status = 'Upcoming';
  if (now >= startDate && now <= endDate) {
    status = 'Ongoing';
  } else if (now > endDate) {
    status = 'Finished';
  }

  return (
    <div className="flex flex-col rounded-xl shadow-md overflow-hidden bg-white transition-transform transform hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <img
          src={event.image ? `${apiUrl}${event.image}` : fallbackImage}
          alt={event.name}
          className="w-full h-48 object-cover"
        />
        <span className={`absolute top-2 left-2 text-white text-xs font-semibold px-2 py-1 rounded
          ${status === 'Upcoming' ? 'bg-indigo-600' :
            status === 'Ongoing' ? 'bg-green-600' :
            'bg-gray-500'}
        `}>
          {status}
        </span>
      </div>
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{event.name}</h3>
          {event.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>
          )}
          <div className="mt-3 space-y-1 text-sm text-gray-700">
            <div>
              📍 <strong>Location:</strong> {event.location}
            </div>
            <div>
              📅 <strong>Date:</strong>{' '}
              {startDate.toLocaleDateString('id', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })} - {endDate.toLocaleDateString('id', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded transition">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
