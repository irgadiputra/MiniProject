export interface IUser {
  id: number;
  email: string;
}

export interface ITransaction {
  id: number;
  user_id: number;
  quantity: number;
  original_amount: number;
  discounted_amount: number;
  event_id: number;
  status: string; // Possible values: 'PENDING', 'DONE', 'REJECTED'
  total_price: number;
  point_reward: number;
  point: number;
  payment_proof: string | null;
  payment_uploaded_at: string;
  confirmed_at: string | null;
  expired_at: string;
  voucher_id: number | null;
  coupon_id: number | null;
  created_at: string;
  user: IUser;
  event: {
    id: number;
    name: string;
    location: string;
  };
  voucher: {
    id: number;
    code: string;
    discount: number;
  } | null;
  coupon: {
    id: number;
    code: string;
    discount: number;
  } | null;
}

export interface IEvent {
  id: number;
  name: string;
  location: string;
  price: number;
  start_date: string;
  end_date: string;
  quota: number;
  status: string; // Possible values: 'ACTIVE', 'INACTIVE'
  description: string;
  image: string | null;
  transactions: ITransaction[];
  voucher_event: {
    id: number;
    code: string;
    discount: number;
    event_id: number;
    start_date: string;
    end_date: string;
    created_at: string;
  }[];
}
