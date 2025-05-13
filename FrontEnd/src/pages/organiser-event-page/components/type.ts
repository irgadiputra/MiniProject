enum IStatus {
  Gratis = 'gratis',
  Berbayar = 'berbayar'
}

export interface IEvent {
  id: number;
  name: string;
  location: string;
  start_date: string;
  end_date: string;
  price: number;
  status: IStatus;
  description: string;
  image: string;
  quota: number;
  transactions: any[]
}