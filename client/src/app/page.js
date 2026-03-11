'use client';

import { useEffect, useState } from 'react';
import ProfileConteiner from '@/components/Profile/ProfileConteiner';
import { useDispatch } from 'react-redux';
import { addProfile } from '@/redux/profile_reducer';

export default function HomePage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    }
    dispatch(addProfile());
  }, [dispatch, isUpdating]);

  return (
      <ProfileConteiner />
  );
}