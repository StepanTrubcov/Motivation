'use client';

import { useBottomNav } from '@/context/BottomNavContext';
import BottomNav from './BottomNav';

const BottomNavWrapper = () => {
  const { showBottomNav } = useBottomNav();

  if (!showBottomNav) {
    return null;
  }

  return <BottomNav />;
};

export default BottomNavWrapper;
