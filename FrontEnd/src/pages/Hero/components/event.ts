'use client'

import axios from 'axios';
import { IEvent } from './type';
import { apiUrl } from '@/pages/config';

export async function fetchEvents(page = 1, limit = 10): Promise<IEvent[]> {

  const response = await axios.get<{ message: string; data: IEvent[] }>(
    `${apiUrl}/event?page=${page}&limit=${limit}`,
    {
      withCredentials: true, // Include if using auth cookies
    }
  );
  return response.data.data;
}
