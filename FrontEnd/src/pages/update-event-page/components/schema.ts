import * as Yup from 'yup';

export const EventSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  location: Yup.string().required('Location is required'),
  start_date: Yup.date().required('Start date is required'),
  end_date: Yup.date().required('End date is required'),
  quota: Yup.number().min(1, 'Quota must be at least 1').required('Quota is required'),
  price: Yup.number().min(0, 'Price must be 0 or more').required('Price is required'),
  status: Yup.string().oneOf(['gratis', 'berbayar']).required('Status is required'),
  description: Yup.string().required('Description is required'),
});
