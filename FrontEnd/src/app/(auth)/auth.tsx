"use client";

import { useAppDispatch } from "@/lib/redux/hooks";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { onLogin } from "@/lib/redux/features/authSlices";
import { IAuth } from "@/lib/redux/features/authSlices";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Auth({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const refreshLogin = async () => {
    try {
      const access_token = getCookie("access_token") || "";

      if (!access_token || typeof access_token !== "string") {
        console.warn("No access token found");
        router.push("/login");
        return;
      }

      // Decode the token and validate expiration
      const decoded: IAuth & { exp?: number } = jwtDecode(access_token);

      const currentTime = Date.now() / 1000;
      if (!decoded.exp || decoded.exp < currentTime) {
        console.warn("Access token expired");
        router.push("/login");
        return;
      }

      if (!decoded.token || !decoded.user) {
        console.warn("Invalid token payload");
        router.push("/login");
        return;
      }

      dispatch(onLogin({
        user: decoded.user,
        token: decoded.token,
      }));
    } catch (error) {
      // Catching decode or logic failures
      console.error("Token verification failed, redirecting to login:", error);
      router.push("/login");
    }
  };

  useEffect(() => {
    refreshLogin();
  }, []);

  return <div>{children}</div>;
}
