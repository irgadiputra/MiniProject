'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { addEvent } from '@/lib/redux/features/eventSlices';
import { EventSchema } from './schema';
import IEvent from './type';
import axios from 'axios';
import { apiUrl } from '../../config';
import { getCookie } from 'cookies-next'; 

export default function CreateEventForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!auth.isLogin) {
      router.replace('/login');
      return;
    }

    if (auth.user.status_role === 'customer') {
      alert('Hanya Untuk Organiser');
      router.replace('/');
      return;
    }

    setIsAuthorized(true);
  }, [auth.isLogin, auth.user.status_role, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    } else {
      alert('Please select a valid image');
      setFile(null);
      setFilePreview(null);
    }
  };

  const handleSubmit = async (
    values: IEvent,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const token = getCookie('access_token'); 
      if (!token) {
        alert('Authorization token not found');
        return;
      }

      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('location', values.location);
      formData.append('start_date', values.start_date.toString());
      formData.append('end_date', values.end_date.toString());
      formData.append('quota', values.quota.toString());
      formData.append('status', values.status);
      formData.append('description', values.description);
      formData.append('price', values.price.toString());
      if (file) {
        formData.append('file', file);
      }

      const response = await axios.post(`${apiUrl}/event`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      dispatch(addEvent(response.data));
      router.push('/');
    } catch (err) {
      console.error('Failed to create event:', err);
      alert('Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthorized !== true) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Create New Event</h2>

      <Formik<IEvent>
        initialValues={{
          name: '',
          location: '',
          start_date: '',
          end_date: '',
          quota: 0,
          status: '',
          description: '',
          price: 0,
        }}
        validationSchema={EventSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <Field name="name" className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
              <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <Field name="location" className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
              <ErrorMessage name="location" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <Field type="date" name="start_date" className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <Field type="date" name="end_date" className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quota</label>
              <Field type="number" name="quota" className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Field as="textarea" name="description" rows={4} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <Field type="number" name="price" className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Radio buttons for status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <Field type="radio" name="status" value="Gratis" className="mr-2" />
                  Gratis
                </label>
                <label className="flex items-center">
                  <Field type="radio" name="status" value="Berbayar" className="mr-2" />
                  Berbayar
                </label>
              </div>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
              <label htmlFor="file-upload" className="cursor-pointer w-fit text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded py-2 px-4 flex items-center justify-center">
                Choose Image
              </label>
              <input
                type="file"
                id="file-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {filePreview && (
                <img src={filePreview} alt="Preview" className="w-32 h-32 object-cover mt-2 rounded" />
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              Create Event
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
