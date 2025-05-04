export type CreateTransaction = {
  eventId: number;
  quantity: number;
  point?: number;
  voucher_code?: string;
  coupon_code?: string;
};

export type AttendeeListQuery = {
  skip: number;
  limit: number;
};