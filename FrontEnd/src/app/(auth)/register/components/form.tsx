'use client';

import React from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios';
import IRegister from './type';
import { Formik, Form, Field, FormikProps } from "formik";
import registerSchema from './schema';

export default function RegisterForm() {
  const router = useRouter();

  const initialValue: IRegister = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  };
  

  const register = async(values: IRegister) => {
    try {
      const { data } = await axios.get(
        `http://localhost:7001/users?email=${values.email}`
      );

      if (data.length > 0) throw new Error("E-Mail sudah Terdaftar");

      await axios.post(`http://localhost:7001/users`, values);

      alert("Registrasi Sukses")
      router.push("/login")

    } catch (err) {
      alert((err as any).message);
    }
  };
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
          const { values, handleChange, touched, errors } = props;
          return (
            <Form className="flex flex-col gap-2 w-full max-w-md bg-white border border-gray-300 rounded-lg shadow-lg p-6">
              <div className="flex gap-5">
                <div className="flex flex-col w-full">
                  <label>First Name:</label>
                  <Field
                    type="text"
                    name="firstname"
                    onChange={handleChange}
                    value={values.firstname}
                    className="border border-black rounded-[6px] p-1 h-[30px] w-full"
                  />
                  {touched.firstname && errors.firstname && (
                    <div className="text-red-500">{errors.firstname}</div>
                  )}
                </div>
                <div className="flex flex-col w-full">
                  <label>Last Name:</label>
                  <Field
                    type="text"
                    name="lastname"
                    onChange={handleChange}
                    value={values.lastname}
                    className="border border-black rounded-[6px] h-[30px] p-1 w-full"
                  />
                  {touched.lastname && errors.lastname && (
                    <div className="text-red-500">{errors.lastname}</div>
                  )}
                </div>
              </div>
  
              <div className="flex flex-col w-full">
                <label>E-Mail:</label>
                <Field
                  type="text"
                  name="email"
                  onChange={handleChange}
                  value={values.email}
                  className="border border-black rounded-[6px] h-[30px] p-1 w-full"
                />
                {touched.email && errors.email && (
                  <div className="text-red-500">{errors.email}</div>
                )}
              </div>
  
              <div className="flex flex-col w-full">
                <label>Password:</label>
                <Field
                  type="password"
                  name="password"
                  onChange={handleChange}
                  value={values.password}
                  className="border border-black rounded-[6px] h-[30px] p-1 w-full"
                />
                {touched.password && errors.password && (
                  <div className="text-red-500">{errors.password}</div>
                )}
              </div>

              <div className="flex flex-col w-full">
                <label>Confirm Password</label>
                <Field
                  type="password"
                  name="confirmPassword"
                  onChange={handleChange}
                  value={values.confirmPassword}
                  className="border border-black rounded-[6px] h-[30px] p-1 w-full"
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <div className="text-red-500">{errors.confirmPassword}</div>
                )}
              </div>

              <div className="flex flex-col w-full">
                <label>Role</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <Field
                      type="radio"
                      name="role"
                      value="customer"
                      id="customer"
                      className="form-radio cursor-pointer"
                    />
                    <label htmlFor="customer" className="ml-2 text-md">Customer</label>
                  </div>
                  <div className="flex items-center">
                    <Field
                      type="radio"
                      name="role"
                      value="organiser"
                      id="organiser"
                      className="form-radio cursor-pointer"
                    />
                    <label htmlFor="organiser" className="ml-2 text-md">Organiser</label>
                  </div>
                </div>
                {touched.role && errors.role && (
                  <div className="text-red-500">{errors.role}</div>
                )}
              </div>

              <button 
                type="submit" 
                className="mt-4 p-2 bg-blue-500 text-white rounded w-full cursor-pointer"
              >
                Submit
              </button>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
