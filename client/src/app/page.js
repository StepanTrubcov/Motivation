'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import ProfileConteiner from '@/components/Profile/ProfileConteiner';
import BottomNav from '@/components/BottomNav/BottomNav';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';
import { addProfile } from '@/redux/profile_reducer';
import { addGoals, addStatus } from '@/redux/goals_reducer';
import { getInitializeAchievementsData } from '@/redux/assignments_reducer';

export default function HomePage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.profile.profile);
  const ThereAreUsers = useSelector((state) => state.goals.ThereAreUsers);
  const assignments = useSelector((state) => state.assignments.assignments);

  // Загрузка профиля при монтировании
  useEffect(() => {
    dispatch(addProfile());
  }, [dispatch]);

  // Загрузка целей после загрузки профиля
  useEffect(() => {
    if (user && !ThereAreUsers) {
      dispatch(addGoals(user.id));
      dispatch(addStatus(user.id));
    }
  }, [user, ThereAreUsers, dispatch]);

  // Загрузка достижений
  useEffect(() => {
    if (user && assignments.length === 0) {
      dispatch(getInitializeAchievementsData(user.id));
    }
  }, [user, assignments, dispatch]);

  // Показываем загрузку, пока не загрузились данные
  if (!user) {
    return <LoadingScreen title="Загрузка данных пользователя..." />;
  }
  if (!ThereAreUsers) {
    return <LoadingScreen title="Загрузка целей пользователя..." />;
  }
  if (assignments.length === 0) {
    return <LoadingScreen title="Загрузка достижений пользователя..." />;
  }

  return (
    <>
      <ProfileConteiner />
      <BottomNav />
    </>
  );
}
