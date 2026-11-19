'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import { readOnboardingStage, saveOnboardingStage } from '@/lib/firstTimeOnboarding.mjs';
import http from '@/lib/api/http';
import c from './FirstTimeOnboarding.module.css';

const OnboardingContext = createContext({ stage: 'done', rewardsFinished: () => {} });
export const useFirstTimeOnboarding = () => useContext(OnboardingContext);
const getStorage = () => { try { return window.localStorage; } catch { return null; } };

export default function FirstTimeOnboarding({ children }) {
  const user = useSelector(state => state.profile.profile);
  const goals = useSelector(state => state.goals.goals);
  const { t, changeLanguage } = useLanguage();
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);
  const { startTutorial, isOpen: tutorialOpen } = useTutorial();
  const [session, setSession] = useState(null);
  const dialogRef = useRef(null);
  const transitionRef = useRef(false);
  const tutorialStartedRef = useRef(false);
  const buttonRef = useRef(null);
  const stage = session?.userId === user?.id ? session.stage : 'loading';

  useEffect(() => {
    if (!user?.id) return;
    const url = new URL(window.location.href);
    const preview = process.env.NODE_ENV === 'development' && url.searchParams.get('onboardingPreview') === '1';
    if (preview) {
      url.searchParams.delete('onboardingPreview');
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
    setSession(previous => previous?.userId === user.id ? previous : {
      userId: user.id, stage: preview ? 'welcome' : readOnboardingStage(user, goals, getStorage()),
    });
  }, [user?.id]);

  const moveTo = useCallback(async (next, language) => {
    if (transitionRef.current) return false;
    transitionRef.current = true;
    setSaving(true); setSaveError(false);
    try {
    await http.patch('/api/users', { telegramId: user?.telegramId, stage: next, language });
    if (language) changeLanguage(language);
    saveOnboardingStage(user?.id, next, getStorage());
    setSession({ userId: user?.id, stage: next });
    return true;
    } catch { setSaveError(true); return false; } finally { transitionRef.current = false; setSaving(false); }
  }, [user?.id, changeLanguage]);
  const rewardsFinished = useCallback(() => {
    if (stage === 'rewards') moveTo('done');
  }, [stage, moveTo]);
  const showDialog = (stage === 'language' || stage === 'welcome' || stage === 'tutorial-offer') && !tutorialOpen;


  useEffect(() => {
    if (!showDialog) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    buttonRef.current?.focus({ preventScroll: true });
    const trapFocus = event => {
      if (event.key !== 'Tab') return;
      const buttons = [...dialogRef.current.querySelectorAll('button')];
      const first = buttons[0], last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', trapFocus);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', trapFocus);
      if (previous?.isConnected) previous.focus?.({ preventScroll: true });
    };
  }, [showDialog, stage]);

  useEffect(() => {
    if (stage === 'tutorial' && !tutorialOpen && tutorialStartedRef.current) { tutorialStartedRef.current = false; moveTo('rewards'); }
  }, [stage, tutorialOpen, moveTo]);

  const start = async () => {
    if (await moveTo('tutorial')) { tutorialStartedRef.current = true; startTutorial('home'); }
  };
  const value = useMemo(() => ({ stage, rewardsFinished }), [stage, rewardsFinished]);
  return <OnboardingContext.Provider value={value}>
    {children}
    {showDialog && <div className={c.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="onboarding-modal-title">
      <div ref={dialogRef} className={c.modal}>
        {saveError && <p role="alert">Не удалось сохранить. Попробуйте ещё раз. / Please try again.</p>}
        {stage === 'language' ? <><h2>Выберите язык / Choose language</h2><div className={c.modalButtons}><button disabled={saving} className={`${c.modalButton} ${c.primary}`} onClick={() => moveTo('welcome', 'ru')}>Русский</button><button disabled={saving} className={`${c.modalButton} ${c.primary}`} onClick={() => moveTo('welcome', 'en')}>English</button></div></> : <>
        <p className={c.step}>{stage === 'welcome' ? t('onboardingMeetStep') : t('onboardingTutorialStep')}</p>
        <h2 id="onboarding-modal-title" className={c.modalTitle}>{stage === 'welcome' ? t('onboardingHello') : t('onboardingLearnTitle')}</h2>
        <p className={c.intro}>{stage === 'welcome' ? t('onboardingWelcome') : t('onboardingLearnDescription')}</p>
        <div className={c.modalButtons}>
          {stage === 'welcome' ? <button ref={buttonRef} disabled={saving} type="button" className={`${c.modalButton} ${c.primary}`} onClick={() => moveTo('tutorial-offer')}>
            {t('continue')}
          </button> : <>
            <button ref={buttonRef} disabled={saving} type="button" className={`${c.modalButton} ${c.primary}`} onClick={start}>{t('onboardingStartTutorial')}</button>
            <button disabled={saving} type="button" className={`${c.modalButton} ${c.secondary}`} onClick={() => moveTo('rewards')}>{t('onboardingSkip')}</button>
            <p className={c.note}>{t('onboardingTutorialLater')}</p>
          </>}
        </div>
      </>}
      </div>
    </div>}
  </OnboardingContext.Provider>;
}
