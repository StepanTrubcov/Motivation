'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTutorial } from '@/context/TutorialContext';

const screenToPath = {
  home: '/profile',
  goals: '/goals',
  achievements: '/achievements',
};

export default function TutorialRouteSync() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, screen } = useTutorial();

  useEffect(() => {
    if (!isOpen || !screen) return;
    const targetPath = screenToPath[screen];
    if (targetPath && pathname !== targetPath) {
      router.push(targetPath);
    }
  }, [isOpen, screen, pathname, router]);

  return null;
}
