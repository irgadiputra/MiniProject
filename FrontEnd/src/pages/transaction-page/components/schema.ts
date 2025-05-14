import * as Yup from 'yup';

export const transactionValidationSchema = (availablePoints: number) => {
  return Yup.object({
    quantity: Yup.number()
      .min(1, 'Quantity must be at least 1')
      .required('Quantity is required'),
    point: Yup.number()
      .min(0, 'Points cannot be negative')
      .max(availablePoints, `You cannot use more than ${availablePoints} points.`)
      .optional(),
    voucherCode: Yup.string().optional(),
    couponCode: Yup.string().optional(),
  });
};
