'use client';

import { useEffect, useState } from 'react';
import ProfileConteiner from '@/components/Profile/ProfileConteiner';

export default function HomePage() {
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
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
      })
      .catch(error => {
        console.error('Ошибка при обновлении достижений:', error);
        sessionStorage.setItem('achievementsUpdated', 'true');
        setIsUpdating(false);
      });
    }
  }, [isUpdating]);
  
  return (
    <>
      <ProfileConteiner />
    </>
  );
}