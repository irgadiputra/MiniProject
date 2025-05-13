import * as Yup from 'yup';

export const profileUpdateSchema= Yup.object({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),

  new_password: Yup.string()
    .min(6, 'New password must be at least 6 characters')
    .test(
      'new-password-required-if-old',
      'New password is required when old password is provided',
      function (value) {
        const { old_password } = this.parent;
        if (old_password && !value?.trim()) {
          return false; // trigger validation error
        }
        return true; // valid
      }
    ),

  old_password: Yup.string().test(
    'old-password-required-if-new',
    'Old password is required when new password is provided',
    function (value) {
      const { new_password } = this.parent;
      if (new_password && !value?.trim()) {
        return false;
      }
      return true;
    }
  ),
});
