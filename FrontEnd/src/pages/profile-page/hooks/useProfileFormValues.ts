'use client'

import { useMemo } from 'react';
import { useAppSelector } from '@/lib/redux/hooks';

export function useProfileFormValues() {
  const { user } = useAppSelector((state) => state.auth);

  const initialValues = useMemo(() => ({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    new_password: '',
    old_password: '',
  }), [user]);

  const hasChanges = (values: typeof initialValues, file: File | null) => {
    return (
      values.first_name !== initialValues.first_name ||
      values.last_name !== initialValues.last_name ||
      values.email !== initialValues.email ||
      values.new_password.trim() !== '' ||
      values.old_password.trim() !== '' ||
      file !== null
    );
  };

  return { initialValues, hasChanges };
}
