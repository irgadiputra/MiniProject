"use client";

import { useAppDispatch } from "@/lib/redux/hooks";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { onLogin } from "@/lib/redux/features/authSlices";

import { IAuth } from "@/lib/redux/features/authSlices";
import { useEffect } from "react";

export default function Auth({children}: {children: React.ReactNode}) {
  const dispatch = useAppDispatch();
  const refreshLogin = async () => {
    const access_token = await getCookie("access_token") || "";

    if (access_token) {
      const auth: IAuth = await jwtDecode(access_token)

      dispatch(onLogin(auth));
    }
  };

  useEffect(() => {
    refreshLogin();
  })
  return (
    <div>{children}</div>
  )
}
