import * as Yup from 'yup';

export const EventSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  location: Yup.string().required('Location is required'),
  start_date: Yup.date().required('Start date is required'),
  end_date: Yup.date().required('End date is required'),
  quota: Yup.number()
    .required('Quota is required')
    .positive('Quota must be positive')
    .integer('Quota must be an integer'),
  description: Yup.string().required('Description is required'),
  price: Yup.number().required('Price is required').min(0, 'Price must be at least 0'),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['gratis', 'berbayar'], 'Status must be either Gratis or Berbayar'),
  image: Yup.mixed()
    .required('Image is required')
    .test('fileType', 'Invalid file type', (value) => {
      if (!value) return false;
      return typeof value === 'object' && 'type' in value && (value as File).type.startsWith('image/');
    }),
});
