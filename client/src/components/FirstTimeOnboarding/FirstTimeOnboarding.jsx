'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import c from './FirstTimeOnboarding.module.css';

const LANGUAGE_DONE_KEY = 'app-first-time-language-done';
const ONBOARDING_OFFERED_KEY = 'app-onboarding-offered';

export default function FirstTimeOnboarding({ children }) {
  const savingGoals = useSelector((state) => state.profile.profile?.savingGoals);
  const { t, changeLanguage } = useLanguage();
  const { startTutorial } = useTutorial();

  const isFirstTime = useMemo(
    () =>
      savingGoals == null ||
      (Array.isArray(savingGoals) && savingGoals.length === 0),
    [savingGoals]
  );

  const [step, setStep] = useState('language');

  useEffect(() => {
    if (!isFirstTime) setStep('done');
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

  const showLanguageModal = isFirstTime && step === 'language';
  const showTutorialModal = isFirstTime && step === 'tutorial-offer';

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
            <p id="onboarding-modal-title" className={c.modalTitle}>
              {t('onboardingWelcome')}
            </p>
            <div className={c.modalButtons}>
              <button type="button" className={`${c.modalButton} ${c.primary}`} onClick={handleTutorialYes}>
                {t('onboardingStartTutorial')}
              </button>
              <button type="button" className={`${c.modalButton} ${c.secondary}`} onClick={handleTutorialLater}>
                {t('onboardingSkip')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
