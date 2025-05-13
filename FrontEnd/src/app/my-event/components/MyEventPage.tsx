"use client"

import React from 'react'
import { useAppSelector } from '@/lib/redux/hooks'
import OrganizerEventsPage from '@/pages/organiser-event-page'

export default function MyEventPage() {
  const auth = useAppSelector((state) => (state.auth))
  return (
    auth.user.status_role === 'organiser' ? <OrganizerEventsPage /> : <div>user</div>
  )
}
