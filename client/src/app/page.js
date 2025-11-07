'use client';

import { useEffect, useState } from 'react';
import ProfileConteiner from '@/components/Profile/ProfileConteiner';
import { useDispatch } from 'react-redux';
import { addProfile } from '@/redux/profile_reducer';

export default function HomePage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Принудительная установка темной темы для Telegram WebApp
    const initTelegramTheme = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        
        // Принудительная установка темной темы
        document.body.classList.remove('telegram-light', 'telegram-dark');
        document.body.classList.add('telegram-dark');
        
        tg.onEvent('themeChanged', () => {
          document.body.classList.remove('telegram-light', 'telegram-dark');
          document.body.classList.add('telegram-dark');
        });
      }
    };
      initTelegramTheme();
      dispatch(addProfile());
  }, [dispatch, isUpdating]);
  
  return (
    <>
      <ProfileConteiner />
    </>
  );
}
