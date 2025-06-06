"use client";

import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/lib/redux/hooks";
import OrganizerEventsPage from "@/pages/organiser-event-page";
import { useRouter } from "next/navigation";
import TransactionList from "@/pages/customer-event-page";

export default function MyEventPage() {
  const auth = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return <div>Loading...</div>; 
  }

  if (!auth.token || !auth.isLogin) {
    router.push("/login");
    return null;
  }

  return auth.user.status_role === "organiser" ? (
    <OrganizerEventsPage />
  ) : (
    <TransactionList />
  );
}
