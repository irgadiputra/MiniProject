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
import { AiOutlineClose } from 'react-icons/ai';

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
    <div className="flex items-center justify-center min-h-screen bg-slate-100 px-4">
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
          <Form className="flex flex-col gap-5 w-full max-w-xl bg-white p-10 rounded-2xl shadow-md relative">
            {/* Close Button */}
            <button
              type="button"
              className="absolute top-4 right-4 text-xl text-slate-400 hover:text-blue-500 transition"
              onClick={() => router.push('/')}
            >
              <AiOutlineClose />
            </button>

            <h2 className="text-2xl font-semibold text-slate-800 mb-2">Create New Event</h2>

            {[
              { label: 'Name', name: 'name', type: 'text' },
              { label: 'Location', name: 'location', type: 'text' },
              { label: 'Quota', name: 'quota', type: 'number' },
              { label: 'Price', name: 'price', type: 'number' },
            ].map(({ label, name, type }) => (
              <div key={name} className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-1">{label}</label>
                <Field
                  name={name}
                  type={type}
                  className="border border-slate-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded-md p-2 h-10 bg-white text-slate-800 outline-none"
                />
                <ErrorMessage name={name} component="div" className="text-red-600 text-xs mt-1" />
              </div>
            ))}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <Field type="date" name="start_date" className="border border-slate-300 rounded-md p-2 h-10" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-1">End Date</label>
                <Field type="date" name="end_date" className="border border-slate-300 rounded-md p-2 h-10" />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700 mb-1">Description</label>
              <Field as="textarea" name="description" rows={3} className="border border-slate-300 rounded-md p-2" />
            </div>

            {/* Status Radio */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700 mb-1">Status</label>
              <div className="flex gap-4">
                {['Gratis', 'Berbayar'].map((status) => (
                  <label key={status} className="flex items-center">
                    <Field type="radio" name="status" value={status} className="mr-2" />
                    {status}
                  </label>
                ))}
              </div>
              <ErrorMessage name="status" component="div" className="text-red-600 text-xs mt-1" />
            </div>

            {/* Image Upload */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700 mb-1">Upload Image</label>
              <label
                htmlFor="file-upload"
                className="cursor-pointer w-fit text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded py-2 px-4"
              >
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
              className="mt-2 p-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
