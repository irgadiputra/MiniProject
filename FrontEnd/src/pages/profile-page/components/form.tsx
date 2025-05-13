'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { profileUpdateSchema } from './schema';
import { onLogin } from '@/lib/redux/features/authSlices';
import axios from 'axios';
import { apiUrl } from '@/pages/config';
import { getCookie, setCookie } from 'cookies-next';
import ImageCompression from 'browser-image-compression';
import { AiOutlineClose } from 'react-icons/ai'; // Close icon

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

  // Image compression function
  const compressImage = async (image: File) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };

    try {
      const compressedFile = await ImageCompression(image, options);
      return compressedFile;
    } catch (error) {
      console.error('Image compression failed:', error);
      alert('Image compression failed.');
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;

    if (!selectedFile) return;

    const compressedFile = await compressImage(selectedFile);

    if (compressedFile && compressedFile.size <= 1 * 1024 * 1024) {
      setFile(compressedFile);
      setFilePreview(URL.createObjectURL(compressedFile));
    } else {
      alert('Compressed image exceeds 1MB');
      setFile(null);
      setFilePreview(null);
    }
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
        formData.append('profile_pict', file);
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

      if (response.data.token) {
        setCookie('access_token', response.data.token);
      }

      dispatch(onLogin({
        ...auth.user,
        ...response.data,
        profile_pict: response.data.profile_pict || auth.user.profile_pict,
        isLogin: true,
      }));

      if (response.data.profile_pict) {
        setFilePreview(`${apiUrl}${response.data.profile_pict}`);
      } else {
        setFilePreview(filePreview);
      }

      alert('Profile updated successfully');
      router.push('/');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile, reverting to current profile picture.');
      setFilePreview(filePreview);
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthorized !== true) return null;

  // Conditional styling based on status_role
  const statusRoleStyles = auth.user.status_role === 'customer'
    ? 'bg-blue-100 text-blue-700'  
    : auth.user.status_role === 'organiser'
    ? 'bg-green-100 text-green-700'   
    : 'bg-gray-100 text-gray-600'; 
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg relative">
        {/* Close Button */}
        <button
          type="button"
          className="absolute top-4 right-4 text-xl text-slate-400 hover:text-blue-500 transition"
          onClick={() => router.push('/')}
        >
          <AiOutlineClose />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={filePreview || '/default-avatar.png'}
              alt="Profile Preview"
              className="w-32 h-32 object-cover rounded-full border-4 border-gray-200 cursor-pointer"
              onClick={() => document.getElementById('file-upload')?.click()}
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

        <Formik
          initialValues={initialValues}
          validationSchema={profileUpdateSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values }) => (
            <Form className="space-y-6">
              {/* Editable Fields */}
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

              {/* Read-Only Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Status Role</label>
                <div className={`w-full p-4 border border-gray-300 rounded-lg ${statusRoleStyles}`}>
                  {auth.user.status_role || 'Not assigned'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Referral Code</label>
                <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-100 text-gray-600">
                  {auth.user.referal_code || 'No referral code'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Points</label>
                <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-100 text-gray-600">
                  {auth.user.point}
                </div>
              </div>

              {/* Submit Button */}
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
    </div>
  );
}
