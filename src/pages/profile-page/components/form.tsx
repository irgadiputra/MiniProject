'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { profileUpdateSchema } from './schema';
import { onLogin } from '@/lib/redux/features/authSlices';
import axios from 'axios';
import { apiUrl } from '../../config';
import { getCookie, setCookie } from 'cookies-next';

export default function ProfileForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(auth.user.profile_pict ? `${apiUrl}${auth.user.profile_pict}` : '/default-avatar.png');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const initialValues = useMemo(() => ({
    first_name: auth.user.first_name || '',
    last_name: auth.user.last_name || '',
    email: auth.user.email || '',
    new_password: '',
    old_password: '',
  }), [auth.user]);

  useEffect(() => {
    if (!auth.isLogin) {
      router.replace('/login');
      return;
    }
    setIsAuthorized(true);
  }, [auth.isLogin, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    const maxSizeInBytes = 1 * 1024 * 1024; // 1 MB

    if (!selectedFile.type.startsWith('image/')) {
      alert('Please select a valid image');
      setFile(null);
      setFilePreview(null);
      return;
    }

    if (selectedFile.size > maxSizeInBytes) {
      alert('Image size should not exceed 1 MB');
      setFile(null);
      setFilePreview(null);
      return;
    }

    // Update the file for upload
    setFile(selectedFile);

    // Set the preview image using URL.createObjectURL for local preview
    setFilePreview(URL.createObjectURL(selectedFile));
  };

  const hasChanges = (values: typeof initialValues) => {
    return (
      values.first_name !== initialValues.first_name ||
      values.last_name !== initialValues.last_name ||
      values.email !== initialValues.email ||
      values.new_password.trim() !== '' ||
      values.old_password.trim() !== '' ||
      file !== null
    );
  };

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const token = getCookie('access_token');
      if (!token) {
        alert('Authorization token not found');
        return;
      }

      const formData = new FormData();
      if (values.first_name !== initialValues.first_name)
        formData.append('first_name', values.first_name);
      if (values.last_name !== initialValues.last_name)
        formData.append('last_name', values.last_name);
      if (values.email !== initialValues.email)
        formData.append('email', values.email);
      if (file)
        formData.append('file', file);
      if (values.new_password)
        formData.append('new_password', values.new_password);
      if (values.old_password)
        formData.append('old_password', values.old_password);

      const response = await axios.patch(`${apiUrl}/auth/user`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update token if a new one is returned
      if (response.data.token) {
        setCookie('access_token', response.data.token);
      }

      // Update the user state in Redux and include the updated profile picture URL
      dispatch(onLogin({
        ...auth.user,
        ...response.data,
        profile_pict: response.data.profile_pict || auth.user.profile_pict,
        isLogin: true,
      }));

      // Update profile picture preview with the new URL
      if (response.data.profile_pict) {
        setFilePreview(`${apiUrl}${response.data.profile_pict}`); // Construct the URL for the new profile picture
      }

      alert('Profile updated successfully');
      router.push('/');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthorized !== true) return null;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <img
            src={filePreview || '/default-avatar.png'} 
            alt="Profile Preview"
            className="w-40 h-40 object-cover rounded-full border-4 border-gray-200"
          />
          <label
            htmlFor="file-upload"
            className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow cursor-pointer"
          >
            ✏️
          </label>
          <input
            type="file"
            id="file-upload"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-gray-800">
          {auth.user.first_name} {auth.user.last_name}
        </h3>
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800">
        <div>
          <span className="block text-sm font-medium text-gray-600">Email:</span>
          <span className="text-lg">{auth.user.email}</span>
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-600">Status Role:</span>
          <span className="text-lg capitalize">{auth.user.status_role || 'N/A'}</span>
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-600">Current Point:</span>
          <span className="text-lg">{auth.user.point ?? 0}</span>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-center text-gray-700 mb-8">Update Profile</h2>

      <Formik
        initialValues={initialValues}
        validationSchema={profileUpdateSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, values }) => (
          <Form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <Field
                name="first_name"
                className="w-full p-4 border border-gray-300 rounded-lg"
              />
              <ErrorMessage name="first_name" component="div" className="text-sm text-red-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <Field
                name="last_name"
                className="w-full p-4 border border-gray-300 rounded-lg"
              />
              <ErrorMessage name="last_name" component="div" className="text-sm text-red-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <Field
                type="email"
                name="email"
                className="w-full p-4 border border-gray-300 rounded-lg"
              />
              <ErrorMessage name="email" component="div" className="text-sm text-red-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">New Password (optional)</label>
              <Field
                type="password"
                name="new_password"
                className="w-full p-4 border border-gray-300 rounded-lg"
              />
              <ErrorMessage name="new_password" component="div" className="text-sm text-red-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Old Password (optional)</label>
              <Field
                type="password"
                name="old_password"
                disabled={!values.new_password}
                className="w-full p-4 border border-gray-300 rounded-lg"
              />
              <ErrorMessage name="old_password" component="div" className="text-sm text-red-500" />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || !hasChanges(values)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
