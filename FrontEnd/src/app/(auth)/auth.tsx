"use client";

import { useAppDispatch } from "@/lib/redux/hooks";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { onLogin } from "@/lib/redux/features/authSlices";
import { IAuth } from "@/lib/redux/features/authSlices";
import { useEffect } from "react";

export default function Auth({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  const refreshLogin = async () => {
    const access_token = await getCookie("access_token") || "";

    if (access_token) {
      try {
        const auth: IAuth = jwtDecode(access_token);

        // Ensure token is a valid string before dispatching
        if (auth.token) {
          dispatch(onLogin({
            user: auth.user,
            token: auth.token
          }));
        }
      } catch (error) {
        console.error("Error decoding JWT token:", error);
      }
    }
  };

  useEffect(() => {
    refreshLogin();
  }, []); // Add an empty dependency array to run only once on component mount

  return <div>{children}</div>;
}
