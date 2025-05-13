// type.ts

export interface IEvent {
  id?: string;
  name: string;
  location: string;
  start_date: string; 
  end_date: string;
  quota: number;
  price: number;
  status: 'gratis' | 'berbayar';
  description: string;
  image?: string;
  transactions: {
    id: string;
    user_id: string;
    status: string;
  }[];
}
