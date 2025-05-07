'use client';

import React from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios';
import IRegister from '@/pages/register-page/components/type';
import { Formik, Form, Field, FormikProps } from "formik";
import registerSchema from '@/pages/register-page/components/schema';
import { useState } from 'react';

export default function RegisterForm() {

  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter();

  const initialValue: IRegister = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    status_role: '',
  };
  
  const register = async (values: IRegister) => {
    try {
      setLoading(true)
      const { data } = await axios.post(`http://localhost:8080/auth/register`, values);
  
      alert("Registrasi Sukses");
  
      router.push("/");

    } catch (err: any) {
      const statusCode = err?.response?.status;
      const errorMessage = err?.response?.data?.message || "Registrasi gagal. Silakan coba lagi.";
      
      if (statusCode === 409) {
        alert("Email sudah terdaftar.");
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false)
    }
  };
  

  const TextInput = ({
    label,
    name,
    type = 'text',
    handleChange,
    handleFocus,
    value,
    error,
    touched,
  }: {
    label: string;
    name: keyof IRegister;
    type?: string;
    handleChange: React.ChangeEventHandler<HTMLInputElement>;
    handleFocus: (name: keyof IRegister) => void;
    value?: string;
    error?: string;
    touched?: boolean;
  }) => (
    <div className="flex flex-col w-full">
      <label>{label}</label>
      <Field
        type={type}
        name={name}
        onChange={handleChange}
        onFocus={() => handleFocus(name)}
        value={value || ''}
        className="border border-black rounded-[6px] p-1 h-[25px] w-full"
      />
      {touched && error && <div className="text-red-500">{error}</div>}
    </div>
  );

  return (
      <div className="flex items-center justify-center min-h-screen">
      <Formik
        initialValues={initialValue}
        validationSchema={registerSchema}
        onSubmit={(values, { resetForm }) => {
          register(values);
          resetForm();
        }}
      >
        {(props: FormikProps<IRegister>) => {
          const {
            values,
            handleChange,
            touched,
            errors,
            setFieldTouched,
            setFieldError,
          } = props;

          const handleFocus = (field: keyof IRegister) => {
            setFieldError(field, '');
            setFieldTouched(field, false);
          };

          return (
            <Form className="flex flex-col gap-2 w-full max-w-md bg-white border border-gray-300 rounded-lg shadow-lg p-4">
              <div className="flex gap-5">
                <TextInput
                  label="First Name:*"
                  name="first_name"
                  handleChange={handleChange}
                  handleFocus={handleFocus}
                  value={values.first_name}
                  error={errors.first_name}
                  touched={touched.first_name}
                />
                <TextInput
                  label="Last Name:*"
                  name="last_name"
                  handleChange={handleChange}
                  handleFocus={handleFocus}
                  value={values.last_name}
                  error={errors.last_name}
                  touched={touched.last_name}
                />
              </div>

              <TextInput
                label="E-Mail:*"
                name="email"
                type="email"
                handleChange={handleChange}
                handleFocus={handleFocus}
                value={values.email}
                error={errors.email}
                touched={touched.email}
              />

              <TextInput
                label="Password:*"
                name="password"
                type="password"
                handleChange={handleChange}
                handleFocus={handleFocus}
                value={values.password}
                error={errors.password}
                touched={touched.password}
              />

              <TextInput
                label="Confirm Password:*"
                name="confirmPassword"
                type="password"
                handleChange={handleChange}
                handleFocus={handleFocus}
                value={values.confirmPassword}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
              />

              <div className="flex flex-col w-full">
                <label>Role:*</label>
                <div className="flex items-center gap-4">
                  {['customer', 'organiser'].map((role) => (
                    <div className="flex items-center" key={role}>
                      <Field
                        type="radio"
                        name="status_role"
                        value={role}
                        className="form-radio"
                        onFocus={() => handleFocus('status_role')}
                      />
                      <label className="ml-2 text-md capitalize">{role}</label>
                    </div>
                  ))}
                </div>
                {touched.status_role && errors.status_role && (
                  <div className="text-red-500">{errors.status_role}</div>
                )}
              </div>

              <TextInput
                label="Kode Referal:"
                name="referral_code"
                handleChange={handleChange}
                handleFocus={handleFocus}
                value={values.referral_code}
              />

              <button
                type="submit"
                className="mt-4 p-2 bg-blue-500 text-white rounded w-full cursor-pointer"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </Form>
          );
        }}
      </Formik>
    </div>
);

}
