'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { addEvent } from '@/lib/redux/features/eventSlices';
import { EventSchema } from './schema';
import IEvent from './type';
import axios from 'axios';
import { apiUrl } from '../../config';
import { AiOutlineClose } from 'react-icons/ai';
import toast from 'react-hot-toast';

interface IEventWithImage extends IEvent {
  image: File | null;
}

export default function CreateEventForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!auth.isLogin) {
      toast.error('You need to be logged in');
      router.replace('/login');
      return;
    }

    if (auth.user.status_role === 'customer') {
      toast.error('Only organisers can create events');
      router.replace('/');
      return;
    }

    setIsAuthorized(true);
  }, [auth.isLogin, auth.user.status_role, router]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void,
    setFieldError: (field: string, message: string | undefined) => void
  ) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(selectedFile));
      setFieldValue('image', selectedFile);
      setFieldError('image', undefined);
    } else {
      toast.error('Please select a valid image file');
      setFieldValue('image', null);
      setFilePreview(null);
      setFieldError('image', 'Invalid file type');
    }
  };

  const handleSubmit = async (
    values: IEventWithImage,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      if (!auth.token) {
        toast.error('Authorization token missing');
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
      if (values.image) formData.append('image', values.image);

      const response = await axios.post(`${apiUrl}/event`, formData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      dispatch(addEvent(response.data));
      toast.success('Event created successfully!');
      router.push('/');
    } catch (err) {
      console.error('Event creation failed:', err);
      toast.error('Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthorized !== true) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 px-4">
      <Formik<IEventWithImage>
        initialValues={{
          name: '',
          location: '',
          start_date: '',
          end_date: '',
          quota: 0,
          status: '',
          description: '',
          price: 0,
          image: null,
        }}
        validationSchema={EventSchema}
        onSubmit={handleSubmit}
        validateOnBlur={false}
        validateOnChange={false}
      >
        {(props: FormikProps<IEventWithImage>) => {
          const {
            values,
            errors,
            touched,
            setFieldValue,
            setFieldError,
            isSubmitting,
          } = props;

          const isGratis = values.status === 'gratis' // Check if the event is free (gratis)

          return (
            <Form className="flex flex-col gap-5 w-full max-w-xl bg-white p-10 rounded-2xl shadow-md relative">
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
              ].map(({ label, name, type }) => (
                <div key={name} className="flex flex-col">
                  <label className="text-sm font-medium text-slate-700 mb-1">{label}</label>
                  <Field
                    name={name}
                    type={type}
                    className="border border-slate-300 rounded-md p-2 h-10 bg-white text-slate-800"
                  />
                  <ErrorMessage name={name} component="div" className="text-red-600 text-xs mt-1" />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                {['start_date', 'end_date'].map((name) => (
                  <div key={name} className="flex flex-col">
                    <label className="text-sm font-medium text-slate-700 mb-1">
                      {name === 'start_date' ? 'Start Date' : 'End Date'}
                    </label>
                    <Field
                      type="date"
                      name={name}
                      className="border border-slate-300 rounded-md p-2 h-10"
                    />
                    <ErrorMessage name={name} component="div" className="text-red-600 text-xs mt-1" />
                  </div>
                ))}
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-1">Description</label>
                <Field
                  as="textarea"
                  name="description"
                  rows={3}
                  className="border border-slate-300 rounded-md p-2"
                />
                <ErrorMessage name="description" component="div" className="text-red-600 text-xs mt-1" />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-1">Status</label>
                <div className="flex gap-4">
                  {['gratis', 'berbayar'].map((statusOption) => (
                    <label key={statusOption} className="flex items-center">
                      <Field
                        type="radio"
                        name="status"
                        value={statusOption}
                        className="mr-2"
                      />
                      {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                    </label>
                  ))}
                </div>
                <ErrorMessage name="status" component="div" className="text-red-600 text-xs mt-1" />
              </div>

              {/* Price Field */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-1">Price</label>
                <Field
                  name="price"
                  type="number"
                  disabled={isGratis}
                  className={`border border-slate-300 rounded-md p-2 h-10 ${isGratis ? 'bg-slate-200' : 'bg-white'} text-slate-800`}
                />
                <ErrorMessage name="price" component="div" className="text-red-600 text-xs mt-1" />
              </div>

              {/* Image Upload */}
              <Field name="image">
                {() => (
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-slate-700 mb-1">Upload Image</label>
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer w-fit text-sm bg-slate-50 border border-slate-300 rounded py-2 px-4"
                    >
                      Choose Image
                    </label>
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setFieldValue, setFieldError)}
                      className="hidden"
                    />
                    {filePreview && (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover mt-2 rounded"
                      />
                    )}
                    <ErrorMessage name="image" component="div" className="text-red-600 text-xs mt-1" />
                  </div>
                )}
              </Field>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 p-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </button>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
