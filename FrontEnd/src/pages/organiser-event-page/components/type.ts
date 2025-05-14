interface IVoucher {
  id: number;
  code: string;
  discount: string;
  event_id: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface IEvent {
  id: number;
  name: string;
  location: string;
  price: number;
  start_date: string;
  end_date: string;
  quota: number;
  status: string;
  description: string;
  image: string;
  transactions: any[];  
  voucher_event: IVoucher[];  
}
