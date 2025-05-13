import * as Yup from 'yup';

export const EventSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  location: Yup.string().required('Required'),
  start_date: Yup.date().required('Required'),
  end_date: Yup.date().required('Required'),
  quota: Yup.number().required('Required').positive().integer(),
  description: Yup.string().required('Required'),
  price: Yup.number().required('Required').min(0),
  tickets: Yup.array().of(
    Yup.object().shape({
      type: Yup.string().required('Required'),
      price: Yup.number().required('Required').min(0),
    })
  ),
});