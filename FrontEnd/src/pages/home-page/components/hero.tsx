"use client"

import { useAppSelector } from "@/lib/redux/hooks"
import React from 'react'

export default function Hero() {
  const auth = useAppSelector((state) => state.auth)
  return (
    <div>
      {auth.isLogin ? (
        <div>
          <h1>Welcome, {auth.user?.first_name} {auth.user?.last_name}!</h1>
          <p>email: {auth.user?.email}</p>
          <p>role: {auth.user?.status_role}</p>
          <p>referral code: {auth.user?.referal_code}</p>
          <p>Point: {auth.user?.point}</p>
          <p>Is Verified: {auth.user.is_verified ? <span>True</span> : <span>False</span>}</p>
        </div>
      ) : (
        <h1>Please log in</h1>
      )}
    </div>
  )
}
