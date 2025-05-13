export interface IOrganizer {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
}

export interface IEvent {
  name: string;
  price: number;
  image: string;
  location: string;
  start_date: string;
  end_date: string;
  quota: number;
  status: string;
  description: string;
  organizer: IOrganizer;
}
