'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { IEvent } from './components/type';
import { apiUrl } from '../config';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { FaTimes } from 'react-icons/fa'; // Import X icon

const EventDetails = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;  // Safely access `id` from params

  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Event ID is missing');
      setLoading(false);
      return;
    }

    const loadEventDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${apiUrl}/event/${id}`);
        setEvent(response.data.data);
      } catch (err) {
        setError('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };

    loadEventDetails();
  }, [id]);

  if (loading) return <p className="text-center text-gray-500">Loading event details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!event) return <p className="text-center text-gray-500">Event not found.</p>;

  const formattedStartDate = format(new Date(event.start_date), 'd MMM yyyy');
  const formattedEndDate = format(new Date(event.end_date), 'd MMM yyyy');

  const attendees = `${event.transactions.length} / ${event.quota}`;

  // Handle the close button
  const handleClose = () => {
    router.push('/'); 
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        
        {/* Close Button (X) */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-900"
        >
          <FaTimes size={20} />
        </button>

        {/* Event Image */}
        <div className="flex justify-center mb-6 md:mb-0">
          <img
            src={event.image ? `${apiUrl}${event.image}` : 'https://via.placeholder.com/800x400?text=No+Image'}
            alt={event.name}
            className="w-full h-64 object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Event Details */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-4">{event.name}</h1>

          {/* Event Description */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-600">Description</p>
            <p className="text-base text-gray-800">{event.description}</p>
          </div>

          {/* Event Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Location</p>
              <p className="text-base text-gray-800">{event.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Date</p>
              <p className="text-base text-gray-800">{formattedStartDate} - {formattedEndDate}</p>
            </div>
          </div>

          {/* Price and Attendees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Price</p>
              <p className="text-lg font-semibold text-blue-600">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(event.price)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Attendees</p>
              <p className="text-base text-gray-800">{attendees}</p>
            </div>
          </div>

          {/* Purchase Button */}
          <div className="flex justify-center">
            <button
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => router.push(`/event/${id}/transaction`)}
            >
              Purchase Tickets
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EventDetails;
