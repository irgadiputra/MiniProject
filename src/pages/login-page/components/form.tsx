'use client';

import { useRouter } from 'next/navigation';
import axios from 'axios';
import ILogin from './type';
import { Formik, Form, Field, FormikProps } from "formik";
import { setCookie } from 'cookies-next'; // If you're manually handling the token (not recommended if backend sets the token)
import { useState } from 'react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { onLogin } from '@/lib/redux/features/authSlices'; // Ensure you're using the correct import
import Link from 'next/link';
import { loginSchema } from './schema';
import { apiUrl } from '@/pages/config';

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessages, setErrorMessages] = useState<{ email?: string, password?: string }>({});

  const initialValue: ILogin = {
    email: "",
    password: "",
  };

  const login = async (values: ILogin) => {
    try {
      setLoading(true);
      setErrorMessages({}); // Reset previous error messages
      const { data } = await axios.post(`${apiUrl}/auth/login`, {
        email: values.email,
        password: values.password,
      });

      if (!data.token) {
        throw new Error("Token not received");
      }

      const stateUser = {
        user: {
          id: data.user.id,
          email: data.user.email,
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          status_role: data.user.status_role,
          profile_pict: data.user.profile_pict,
          referal_code: data.user.referal_code,
          point: data.user.point
        },
        token: data.token,  // Ensure token is correctly added here
        isLogin: true
      };

      setCookie("access_token", data.token); // Manually store token in cookies (if required)

      // Dispatch login action with updated stateUser structure
      dispatch(onLogin(stateUser));

      alert("Login successful!");
      router.push("/"); // Redirect after login
    } catch (err: any) {
      console.error('Login Error:', err);
      const statusCode = err?.response?.status;
      const errorMessage = err?.response?.data?.message || "Login failed, please try again.";

      // Handle error based on status code
      if (statusCode === 404) {
        setErrorMessages((prev) => ({ ...prev, email: "Unregistered email" }));
      } else if (statusCode === 401) {
        setErrorMessages((prev) => ({ ...prev, password: "Incorrect password" }));
      } else {
        setErrorMessages((prev) => ({ ...prev, general: errorMessage }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Formik
        initialValues={initialValue}
        validationSchema={loginSchema}
        validateOnBlur={false}
        validateOnChange={false}
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          await login(values);
          resetForm(); // Reset the form on successful login
          setSubmitting(false); // Set submitting to false after form submission
        }}
      >
        {(props: FormikProps<ILogin>) => {
          const { touched, errors, setFieldError } = props;
          return (
            <Form className="flex flex-col gap-2 w-full max-w-[350px] bg-white border border-gray-300 rounded-lg shadow-lg p-6">
              <div className="flex flex-col w-full">
                <label htmlFor="email">E-Mail:</label>
                <Field
                  type="text"
                  name="email"
                  className="border border-black rounded-[6px] h-[30px] p-1 w-full"
                  onFocus={() => {
                    setErrorMessages((prev) => ({ ...prev, email: "" })); // Clear email error on focus
                    setFieldError("email", ""); // Clear Formik error on focus
                  }}
                />
                {touched.email && errors.email && (
                  <div className="text-red-500 text-sm">{errors.email}</div>
                )}
                {errorMessages.email && (
                  <div className="text-red-500 text-sm">{errorMessages.email}</div>
                )}
              </div>

              <div className="flex flex-col w-full">
                <label htmlFor="password">Password:</label>
                <div className="relative w-full">
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="border border-black rounded-[6px] h-[30px] p-1 w-full"
                    onFocus={() => {
                      setErrorMessages((prev) => ({ ...prev, password: "" })); // Clear password error on focus
                      setFieldError("password", ""); // Clear Formik error on focus
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-500"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <div className="text-red-500 text-sm">{errors.password}</div>
                )}
                {errorMessages.password && (
                  <div className="text-red-500 text-sm">{errorMessages.password}</div>
                )}
              </div>

              <button
                type="submit"
                className="mt-4 p-2 bg-blue-500 text-white rounded w-full cursor-pointer disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Submit"}
              </button>

              <Link 
                href={"/register"}
                className="underline mx-auto cursor-pointer text-sm p-2 hover:text-blue-600"
              >
                Don't have an account? Sign Up Here
              </Link>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
