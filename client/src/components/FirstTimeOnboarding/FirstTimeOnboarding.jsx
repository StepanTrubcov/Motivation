'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import c from './FirstTimeOnboarding.module.css';

const LANGUAGE_DONE_KEY = 'app-first-time-language-done';
const ONBOARDING_OFFERED_KEY = 'app-onboarding-offered';

export default function FirstTimeOnboarding({ children }) {
  const timeGoalsSaving = useSelector((state) => state.goals.timeGoalsSaving);
  const { t, changeLanguage } = useLanguage();
  const { startTutorial } = useTutorial();

  const isFirstTime = useMemo(
    () =>
      timeGoalsSaving === null ||
      (Array.isArray(timeGoalsSaving) && timeGoalsSaving.length === 0),
    [timeGoalsSaving]
  );

  const [step, setStep] = useState('language');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setReady(true);
    if (!isFirstTime) {
      setStep('done');
      return;
    }
    if (localStorage.getItem(ONBOARDING_OFFERED_KEY)) {
      setStep('done');
    } else if (localStorage.getItem(LANGUAGE_DONE_KEY)) {
      setStep('tutorial-offer');
    } else {
      setStep('language');
    }
  }, [isFirstTime]);

  const handleLanguageSelect = (lang) => {
    changeLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_DONE_KEY, '1');
    }
    setStep('tutorial-offer');
  };

  const handleTutorialYes = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_OFFERED_KEY, '1');
    }
    setStep('done');
    startTutorial('home');
  };

  const handleTutorialLater = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_OFFERED_KEY, '1');
    }
    setStep('done');
  };

  const showLanguageModal = isFirstTime && ready && step === 'language';
  const showTutorialModal = isFirstTime && ready && step === 'tutorial-offer';

  return (
    <>
      {children}
      {showLanguageModal && (
        <div className={c.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="onboarding-language-title">
          <div className={c.modal}>
            <h2 id="onboarding-language-title" className={c.modalTitle}>
              {t('chooseLanguage')}
            </h2>
            <div className={c.modalButtons}>
              <button
                type="button"
                className={`${c.modalButton} ${c.secondary}`}
                onClick={() => handleLanguageSelect('ru')}
                aria-label="Русский"
              >
                Русский
              </button>
              <button
                type="button"
                className={`${c.modalButton} ${c.secondary}`}
                onClick={() => handleLanguageSelect('en')}
                aria-label="English"
              >
                English
              </button>
            </div>
          </div>
        </div>
      )}
      {showTutorialModal && (
        <div className={c.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="onboarding-modal-title">
          <div className={c.modal}>
            <h2 id="onboarding-modal-title" className={c.modalTitle}>
              {t('onboardingTutorialPrompt')}
            </h2>
            <div className={c.modalButtons}>
              <button type="button" className={`${c.modalButton} ${c.primary}`} onClick={handleTutorialYes}>
                {t('yes')}
              </button>
              <button type="button" className={`${c.modalButton} ${c.secondary}`} onClick={handleTutorialLater}>
                {t('later')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
