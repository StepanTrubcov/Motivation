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

    // Проверяем, выполнялось ли уже обновление
    const hasUpdated = sessionStorage.getItem('achievementsUpdated');
    
    if (!hasUpdated && !isUpdating) {
      setIsUpdating(true);
      
      // Вызываем API endpoint для обновления достижений
      fetch('/api/update-achievements', {
        method: 'POST'
      })
      .then(response => response.json())
      .then(data => {
        console.log('Результат обновления достижений:', data);
        sessionStorage.setItem('achievementsUpdated', 'true');
        setIsUpdating(false);
        initTelegramTheme();
        dispatch(addProfile());
      })
      .catch(error => {
        console.error('Ошибка при обновлении достижений:', error);
        sessionStorage.setItem('achievementsUpdated', 'true');
        setIsUpdating(false);
        initTelegramTheme();
        dispatch(addProfile());
      });
    } else {
      initTelegramTheme();
      dispatch(addProfile());
    }
  }, [dispatch, isUpdating]);
  
  return (
    <>
      <ProfileConteiner />
    </>
  );
}