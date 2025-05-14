export interface ITransaction {
  id: number;
  user_id: number;
  event_id: number;
  quantity: number;
  original_amount: number;
  discounted_amount: number;
  total_price: number;
  point_reward: number;
  point: number;
  status: string;
  payment_proof: string | null;
  payment_uploaded_at: string | null;
  confirmed_at: string | null;
  expired_at: string | null;
  created_at: string;
  event: {
    id: number;
    name: string;
    price: number;
    location: string;
    start_date: string;
    end_date: string;
    image: string;
  };
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_pict: string;
  };
}
