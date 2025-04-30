import * as Yup from 'yup'

const isEmailRegistered = async (email: string) => {
  const res = await fetch(`http://localhost:7001/users?email=${encodeURIComponent(email)}`);
  const data = await res.json();
  return data.length > 0;
};

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Format E-mail Salah')
    .test('', 'Email tidak terdaftar',
      async function (value) {
        if (!value) return false;
        const registered = await isEmailRegistered(value);
        return registered;
      }
    ),
  password: Yup.string()
})

export default loginSchema