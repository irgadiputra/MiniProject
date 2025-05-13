type IStatus = "Gratis" | "Berbayar" | ""

export default interface IEvent {
  name: string;
  location: string;
  start_date: string;
  end_date: string;
  quota: number;
  status: IStatus
  description: string;
  price: number;
}
