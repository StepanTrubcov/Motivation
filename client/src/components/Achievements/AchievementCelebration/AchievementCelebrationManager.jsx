'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import { useFirstTimeOnboarding } from '@/components/FirstTimeOnboarding/FirstTimeOnboarding';
import { translateAchievements } from '@/utils/achievementsTranslations';
import { acknowledgeAchievement, achievementCelebrationId, celebrationStorageKey, pendingAchievements, readSeenAchievements } from '@/lib/achievementCelebrations.mjs';
import { resolveAchievementImage } from '@/lib/achievementImages';
import AchievementCelebration from './AchievementCelebration';
import ModalWindowMe from '../ModalWindowMe/ModalWindowMe';

const getStorage = () => { try { return window.localStorage; } catch { return null; } };

export default function AchievementCelebrationManager() {
  const userId = useSelector(state => state.profile.profile?.id);
  const achievements = useSelector(state => state.assignments.assignments);
  const { language } = useLanguage();
  const { isOpen: tutorialOpen } = useTutorial();
  const { stage: onboardingStage, rewardsFinished } = useFirstTimeOnboarding();
  const [session, setSession] = useState(null);
  const [blocked, setBlocked] = useState(true);
  const [visible, setVisible] = useState(false);
  const [shareAchievement, setShareAchievement] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const url = new URL(window.location.href);
    const replay = url.searchParams.get('achievementReplay') === '1';
    if (replay) {
      url.searchParams.delete('achievementReplay');
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
    const refresh = () => setSession({ userId, seen: readSeenAchievements(userId, getStorage()) });
    setSession(previous => previous?.userId === userId ? previous : {
      userId, seen: replay ? new Set() : readSeenAchievements(userId, getStorage()),
    });
    const storageEvent = event => {
      if (!event.key || event.key === celebrationStorageKey(userId)) refresh();
    };
    window.addEventListener('storage', storageEvent);
    return () => window.removeEventListener('storage', storageEvent);
  }, [userId]);

  useEffect(() => {
    const check = () => {
      setVisible(!document.hidden);
      // Wait for onboarding, streak celebrations and other dialogs to close.
      const otherDialog = [...document.querySelectorAll('[role="dialog"][aria-modal="true"]')].some(element =>
        !element.closest('[data-achievement-celebration]') &&
        element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden'
      );
      setBlocked(otherDialog);
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-modal', 'hidden'] });
    document.addEventListener('visibilitychange', check);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', check); };
  }, []);

  const translated = useMemo(() => translateAchievements(achievements || [], language), [achievements, language]);
  const pending = session?.userId === userId ? pendingAchievements(translated, session.seen) : [];
  const achievement = pending[0];
  useEffect(() => {
    if (onboardingStage === 'rewards' && session?.userId === userId && !pending.length && !shareAchievement) rewardsFinished();
  }, [onboardingStage, session, userId, pending.length, shareAchievement, rewardsFinished]);
  const acknowledge = () => {
    if (!achievement) return;
    acknowledgeAchievement(userId, achievement, getStorage());
    setSession(previous => ({ userId, seen: new Set([
      ...(previous?.userId === userId ? previous.seen : []),
      achievementCelebrationId(achievement),
    ]) }));
  };
  const share = () => {
    setShareAchievement({
      ...achievement, active: achievement.rarity,
      img: resolveAchievementImage(achievement.image, achievement),
      celebrationUserId: userId,
    });
    acknowledge();
  };

  return <>
    {achievement && ['done', 'rewards'].includes(onboardingStage) && visible && !blocked && !tutorialOpen && !shareAchievement && (
      <AchievementCelebration key={achievementCelebrationId(achievement)} achievement={achievement} onClose={acknowledge} onShare={share} />
    )}
    {shareAchievement?.celebrationUserId === userId && <ModalWindowMe isModalOpen={shareAchievement} closeModal={() => setShareAchievement(null)} />}
  </>;
}
