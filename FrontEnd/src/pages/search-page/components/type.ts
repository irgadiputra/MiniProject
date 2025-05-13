export interface SearchParams {
  name?: string;
  location?: string;
  status?: string;
  page: number;
  limit: number;
}

enum IStatus {
  Gratis = 'gratis',
  Berbayar = 'berbayar'
}


export interface IEvent {
  organizer: string;
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