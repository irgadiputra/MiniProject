'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { profileUpdateSchema } from './schema';
import { onLogin } from '@/lib/redux/features/authSlices';
import axios from 'axios';
import { apiUrl } from '@/pages/config';
import { getCookie, setCookie } from 'cookies-next';
import { ClipLoader } from 'react-spinners';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useProfileFormValues } from '../hooks/useProfileFormValues';
import { useImageUpload } from '../hooks/useImageUpload';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { ProfilePictureUploader } from './ProfilePictureUploader';
import { AiOutlineClose } from 'react-icons/ai';

export default function ProfileForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const { initialValues, hasChanges } = useProfileFormValues();
  const { file, filePreview, setFilePreview, handleFileChange } = useImageUpload(auth.user.profile_pict ? `${apiUrl}${auth.user.profile_pict}` : '/default-avatar.png');
  const isAuthorized = useAuthRedirect();

  const [loading, setLoading] = React.useState(false);
  const [toastVisible, setToastVisible] = React.useState(false);

  // Toast event handlers
  React.useEffect(() => {
    const handleOpen = () => setToastVisible(true);
    const handleClose = () => setToastVisible(false);

    toast.onChange(({ status }) => {
      if (status === 'added') handleOpen();
      if (status === 'removed') handleClose();
    });
  }, []);

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
      if (values.first_name !== initialValues.first_name) formData.append('first_name', values.first_name);
      if (values.last_name !== initialValues.last_name) formData.append('last_name', values.last_name);
      if (values.email !== initialValues.email) formData.append('email', values.email);
      if (file) formData.append('profile_pict', file);
      if (values.new_password) formData.append('new_password', values.new_password);
      if (values.old_password) formData.append('old_password', values.old_password);

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

      toast.success('Profile updated successfully');
      router.push('/');
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error('Failed to update profile, reverting to current profile picture.');
      setFilePreview(filePreview);
    } finally {
      setSubmitting(false);
    }
  };

  const proceedResendVerification = async () => {
    try {
      setLoading(true);
      const token = getCookie('access_token');
      if (!token) {
        toast.error('Authorization token not found');
        return;
      }

      const response = await axios.post(`${apiUrl}/auth/verify-email`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        toast.success('Verification email sent successfully');
      } else {
        toast.error('Failed to send verification email');
      }
    } catch (err) {
      console.error('Error sending verification email:', err);
      toast.error('Error sending verification email');
    } finally {
      setLoading(false);
    }
  };

  // Toast confirm
  const handleResendVerification = () => {
    toast.info(
      ({ closeToast }) => (
        <div className="flex flex-col space-y-2">
          <p>Do you want to resend the verification email?</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                proceedResendVerification();
                closeToast?.();
              }}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              OK
            </button>
            <button
              onClick={closeToast}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
      }
    );
  };

  if (isAuthorized !== true) return null;

  const statusRoleStyles = auth.user.status_role === 'customer'
    ? 'bg-blue-100 text-blue-700'
    : auth.user.status_role === 'organiser'
    ? 'bg-green-100 text-green-700'
    : 'bg-gray-100 text-gray-600';

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />

      <div className={`flex justify-center items-center min-h-screen bg-gray-50 transition-all duration-300 ${toastVisible ? 'blur-sm pointer-events-none' : ''}`}>
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg relative">
          <button
            type="button"
            className="absolute top-4 right-4 text-xl text-slate-400 hover:text-blue-500 transition"
            onClick={() => router.push('/')}
          >
            <AiOutlineClose />
          </button>

          <div className="flex flex-col items-center mb-6">
            <ProfilePictureUploader filePreview={filePreview} onChange={handleFileChange} />
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <Field name="first_name" className="w-full p-4 border border-gray-300 rounded-lg" />
                  <ErrorMessage name="first_name" component="div" className="text-sm text-red-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <Field name="last_name" className="w-full p-4 border border-gray-300 rounded-lg" />
                  <ErrorMessage name="last_name" component="div" className="text-sm text-red-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <Field type="email" name="email" className="w-full p-4 border border-gray-300 rounded-lg" />
                  <ErrorMessage name="email" component="div" className="text-sm text-red-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password (optional)</label>
                  <Field type="password" name="new_password" className="w-full p-4 border border-gray-300 rounded-lg" />
                  <ErrorMessage name="new_password" component="div" className="text-sm text-red-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Old Password (optional)</label>
                  <Field type="password" name="old_password" disabled={!values.new_password} className="w-full p-4 border border-gray-300 rounded-lg" />
                  <ErrorMessage name="old_password" component="div" className="text-sm text-red-500" />
                </div>

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

                <div>
                  <label className="block text-sm font-medium text-gray-700">Verification Status</label>
                  <div className={`w-full p-4 border border-gray-300 rounded-lg ${
                    auth.user.is_verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {auth.user.is_verified ? 'Verified' : 'Not Verified'}
                  </div>
                </div>

                {!auth.user.is_verified && (
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={loading}
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition disabled:opacity-50"
                    >
                      {loading ? <ClipLoader size={18} color="#fff" /> : 'Resend Verification Email'}
                    </button>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !hasChanges(values, file)}
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
    </>
  );
}
