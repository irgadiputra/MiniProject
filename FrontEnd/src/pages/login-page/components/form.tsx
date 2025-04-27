'use client';

import { useAppDispatch } from '@/lib/redux/hooks';
import { useRouter } from 'next/navigation'
import axios from 'axios';
import ILogin from './type';
import { Formik, Form, Field, FormikProps } from "formik";
import loginSchema from './schema';
import sign from 'jwt-encode'
import { setCookie } from 'cookies-next';
import { onLogin } from '@/lib/redux/features/authSlices';

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const initialValue: ILogin = {
    email: "",
    password: "",
  }

  const login = async(values: ILogin) => {
    try {
     const { data } = await axios.get(
      `http://localhost:7001/users?email=${values.email}&password=${values.password}`
    );

    if (data.length === 0) throw new Error("E-Mail atau Password salah");

    const stateUser = {
      user: {
        email: data[0].email,
        firstname: data[0].firstname,
        lastname: data[0].lastname,
    },
      isLogin: true
    };

    const token = sign(stateUser, "test")
  
    setCookie("access_token", token)
    dispatch(onLogin(stateUser))

      alert("Login Sukses")
      router.push("/")

    } catch (err) {
      alert((err as any).message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Formik
        initialValues={initialValue}
        validationSchema={loginSchema}
        onSubmit={(values, { resetForm }) => {
          login(values);
          resetForm();
        }}
      >
        {(props: FormikProps<ILogin>) => {
          const { values, handleChange, touched, errors } = props;
          return (
            <Form className="flex flex-col gap-2 w-full max-w-[350px] 
                           bg-white border border-gray-300 rounded-lg shadow-lg p-6"
            >
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
