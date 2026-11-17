'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useTutorial } from '@/context/TutorialContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { ChevronLeft } from 'lucide-react';
import styles from './TutorialOverlay.module.css';
import { getAchievementsNewStatus } from '@/redux/assignments_reducer';
import { notifications } from '@/lib/notifications';
import { findTutorialAchievement } from '@/lib/firstTimeOnboarding.mjs';
import { GOALS_TUTORIAL_TARGETS } from '@/lib/tutorialGoals.mjs';
import { tutorialPlacement } from '@/lib/tutorialPlacement.mjs';

const TOAST_STEP_LOCK_MS = 5000;

export default function TutorialOverlay() {
  const dispatch = useDispatch();
  const userId = useSelector((s) => s?.profile?.profile?.id);
  const assignments = useSelector((s) => s?.assignments?.assignments ?? []);
  const [mounted, setMounted] = useState(false);
  const [toastStepLockedUntil, setToastStepLockedUntil] = useState(null);
  useEffect(() => setMounted(true), []);
  const { isOpen, currentStep, stepIndex, steps, isLastStep, nextStep, prevStep, closeTutorial, requireSettingsClick, requireHomeClick, requireGoalsClick, requireAchievementsClick, requireCategoryClick, requireAction, isColorPickerOpenForTutorial, goalModalOpen, goalModalTutorialPhase, createGoalModalTutorialPhase, completeGoalTutorialPhase, achievementHowToGetArrowClicked, isExplanatoryTutorial, hasTodayGoals } = useTutorial();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [targetRect, setTargetRect] = useState(null);
  const [tooltipHeight, setTooltipHeight] = useState(210);
  /** Рект модалки «Создать цель» для дырки в оверлее (стрелка — по targetRect) */
  const [createGoalModalRect, setCreateGoalModalRect] = useState(null);
  /** Рект области анимации в модалке достижения (для подсветки) */
  const [achievementModalAnimationRect, setAchievementModalAnimationRect] = useState(null);
  /** Рект модалки «Как получить ачивку» (для дырки в оверлее) */
  const [achievementHowToGetModalRect, setAchievementHowToGetModalRect] = useState(null);

  const toastStepLockShownRef = React.useRef(false);
  const tutorialCompleteUnlockingRef = useRef(false);

  const handleTutorialCompleteClose = async () => {
    // Антидубль: если уже выдавали (или уже в процессе) — просто закрываем.
    if (tutorialCompleteUnlockingRef.current) return;

    // Выдаём ачивку только на шаге tutorial-complete.
    if (currentStep?.id !== 'tutorial-complete' || !userId) {
      closeTutorial();
      return;
    }

    const ach = findTutorialAchievement(assignments);
    if (!ach) {
      notifications.error(t('tutorialRewardRetry'));
      return;
    }
    if (ach.status === 'my') {
      closeTutorial();
      return;
    }

    tutorialCompleteUnlockingRef.current = true;
    try {
      await dispatch(getAchievementsNewStatus(ach, userId));
      closeTutorial();
    } catch (error) {
      console.error('Tutorial achievement could not be saved', error);
      notifications.error(t('tutorialRewardRetry'));
    } finally {
      tutorialCompleteUnlockingRef.current = false;
    }
  };
  useEffect(() => {
    if (!isOpen) toastStepLockShownRef.current = false;
  }, [isOpen]);
  useEffect(() => {
    if (currentStep?.id === 'goals-toast-success' && isExplanatoryTutorial) {
      if (!toastStepLockShownRef.current) {
        toastStepLockShownRef.current = true;
        setToastStepLockedUntil(Date.now() + TOAST_STEP_LOCK_MS);
        const tId = setTimeout(() => setToastStepLockedUntil(null), TOAST_STEP_LOCK_MS);
        return () => clearTimeout(tId);
      }
      return;
    }
    setToastStepLockedUntil(null);
  }, [currentStep?.id]);

  const toastStepButtonsLocked = isExplanatoryTutorial && currentStep?.id === 'goals-toast-success' && toastStepLockedUntil !== null;
  const hidePrevButton = currentStep?.id === 'goals-toast-success' || currentStep?.id === 'today-goals' || currentStep?.id === 'achievements-cards' || currentStep?.id === 'achievements-earned' || currentStep?.id === 'achievements-earned-modal' || currentStep?.id === 'achievements-all' || currentStep?.id === 'complete-goal';

  const effectiveTargetId = currentStep?.id === 'settings-color' && isColorPickerOpenForTutorial
    ? 'settings-color-picker'
    : currentStep?.id === 'goals-find-added'
      ? 'tutorial-custom-goal'
      : currentStep?.id === 'generate-report'
        ? 'generate-button'
        : currentStep?.id === 'report-view'
          ? 'report-modal'
          : currentStep?.id === 'achievements-earned-choose'
            ? 'achievements-earned-cards'
            : currentStep?.id === 'achievements-earned-modal'
              ? 'achievements-earned-modal'
              : currentStep?.id === 'achievements-how-to-get'
                ? 'achievement-goal-action'
                : currentStep?.id;

  useEffect(() => {
    if (!isOpen || !currentStep) {
      setTargetRect(null);
      return;
    }
    const stepId = currentStep.id;
    if (stepId === 'goals-toast-success' && isExplanatoryTutorial) {
      const w = typeof window !== 'undefined' ? window.innerWidth : 280;
      const cardW = Math.min(280, w - 24);
      const left = Math.max(12, (w - cardW) / 2);
      const tooltipTop = 80;
      const tooltipCardHeight = 100;
      setTargetRect({
        top: tooltipTop,
        left,
        width: cardW,
        height: tooltipCardHeight,
        stepId: 'goals-toast-success',
      });
      return () => {};
    }
    setTargetRect(null);
    if (stepId !== 'achievements-earned-modal') setAchievementModalAnimationRect(null);
    if (stepId !== 'achievements-how-to-get') setAchievementHowToGetModalRect(null);
    if (['intro', 'home-intro', 'goals-catalog-intro'].includes(stepId) || (stepId === 'goals-toast-success' && !isExplanatoryTutorial)) return;

    const delayTimeouts = [];
    if (stepId === 'goals-create' && createGoalModalTutorialPhase) {
      const modalEl = document.querySelector('[data-tutorial-id="goals-create-modal"]');
      const phaseTargetId = ({name:'goals-create-input',category:'goals-create-category',options:'goals-create-options',period:'goals-create-period',button:'goals-create-submit'})[createGoalModalTutorialPhase];
      const targetEl = document.querySelector(`[data-tutorial-id="${phaseTargetId}"]`);
      targetEl?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      const updateBoth = () => {
        if (modalEl) {
          const r = modalEl.getBoundingClientRect();
          setCreateGoalModalRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        }
        if (targetEl) {
          const r = targetEl.getBoundingClientRect();
          setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height, stepId });
        }
      };
      updateBoth();
      const rafId1 = requestAnimationFrame(() => {
        updateBoth();
        requestAnimationFrame(updateBoth);
      });
      delayTimeouts.push(() => cancelAnimationFrame(rafId1));
      [50, 150, 300, 450].forEach((ms) => delayTimeouts.push(window.setTimeout(updateBoth, ms)));
      const obsModal = modalEl ? new ResizeObserver(updateBoth) : null;
      const obsTarget = targetEl ? new ResizeObserver(updateBoth) : null;
      if (obsModal && modalEl) obsModal.observe(modalEl);
      if (obsTarget && targetEl) obsTarget.observe(targetEl);
      window.addEventListener('scroll', updateBoth, true);
      return () => {
        obsModal?.disconnect();
        obsTarget?.disconnect();
        window.removeEventListener('scroll', updateBoth, true);
        delayTimeouts.forEach((id) => (typeof id === 'function' ? id() : window.clearTimeout(id)));
        setCreateGoalModalRect(null);
      };
    }

    setCreateGoalModalRect(null);
    let targetId = GOALS_TUTORIAL_TARGETS[stepId] || effectiveTargetId;
    if ((stepId === 'goals-take-one' || stepId === 'goals-take-added') && goalModalOpen) {
      targetId = goalModalTutorialPhase === 'button' ? 'goals-take-modal-button' : 'goals-take-modal-duration';
    }
    const isInsideSettingsModal = stepId.startsWith('settings-') && stepId !== 'settings-button';

    const updateRect = (element) => {
      if (!element) return;
      let rect = element.getBoundingClientRect();
      if (stepId === 'goals-take-one' && !goalModalOpen) {
        const categories = document.querySelector('[data-tutorial-id="goals-category-tabs"]')?.getBoundingClientRect();
        if (categories) {
          const top = Math.min(rect.top, categories.top);
          const left = Math.min(rect.left, categories.left);
          const right = Math.max(rect.right, categories.right);
          const bottom = Math.max(rect.bottom, categories.bottom);
          rect = { top, left, right, bottom, width: right - left, height: bottom - top };
        }
      }
      const clippedList = ['goals-take-one', 'achievements-earned-choose', 'achievements-cards', 'complete-goal'].includes(stepId) && !goalModalOpen;
      const top = clippedList ? Math.max(8, rect.top) : rect.top;
      const height = clippedList
        ? Math.max(0, Math.min(rect.bottom, window.innerHeight - 76) - top) : rect.height;
      const next = { top, left: rect.left, width: rect.width, height, stepId };
      setTargetRect(previous => previous && Object.keys(next).every(key => previous[key] === next[key]) ? previous : next);
    };

    if ((GOALS_TUTORIAL_TARGETS[stepId] || ['achievements-earned-choose','achievements-cards','complete-goal'].includes(stepId)) && !goalModalOpen) {
      let observed;
      const resize = new ResizeObserver(() => observed && updateRect(observed));
      const update = () => {
        const element = document.querySelector(`[data-tutorial-id="${targetId}"]`);
        if (!element) return;
        if (observed !== element) { resize.disconnect(); observed = element; resize.observe(element); }
        updateRect(element);
      };
      const observer = new MutationObserver(update);
      observer.observe(document.body, { childList: true, subtree: true });
      window.addEventListener('scroll', update, true);
      window.addEventListener('resize', update);
      update();
      return () => {
        observer.disconnect(); resize.disconnect();
        window.removeEventListener('scroll', update, true);
        window.removeEventListener('resize', update);
      };
    }

    let el = document.querySelector(`[data-tutorial-id="${targetId}"]`);
    if (el) {
      updateRect(el);
      if (stepId === 'achievements-earned-modal') {
        const updateAnimationRect = () => {
          const animEl = document.querySelector('[data-tutorial-id="achievements-earned-modal-animation"]');
          if (animEl) {
            const r = animEl.getBoundingClientRect();
            setAchievementModalAnimationRect({ top: r.top, left: r.left, width: r.width, height: r.height });
          }
        };
        updateAnimationRect();
        delayTimeouts.push(window.setTimeout(updateAnimationRect, 50));
        delayTimeouts.push(window.setTimeout(updateAnimationRect, 200));
        const animEl = document.querySelector('[data-tutorial-id="achievements-earned-modal-animation"]');
        if (animEl) {
          const obsAnim = new ResizeObserver(updateAnimationRect);
          obsAnim.observe(animEl);
          delayTimeouts.push(() => obsAnim.disconnect());
        }
      }
      if (stepId === 'achievements-how-to-get') {
        const updateHowToGetModalRect = () => {
          const modalEl = document.querySelector('[data-tutorial-id="achievements-how-to-get-modal"]');
          if (modalEl) {
            const r = modalEl.getBoundingClientRect();
            setAchievementHowToGetModalRect({ top: r.top, left: r.left, width: r.width, height: r.height });
          }
        };
        updateHowToGetModalRect();
        [50, 150, 300].forEach((ms) => delayTimeouts.push(window.setTimeout(updateHowToGetModalRect, ms)));
        const modalEl = document.querySelector('[data-tutorial-id="achievements-how-to-get-modal"]');
        if (modalEl) {
          const obsModal = new ResizeObserver(updateHowToGetModalRect);
          obsModal.observe(modalEl);
          delayTimeouts.push(() => obsModal.disconnect());
        }
      }
      const rafId1 = requestAnimationFrame(() => {
        updateRect(el);
        requestAnimationFrame(() => updateRect(el));
      });
      delayTimeouts.push(() => cancelAnimationFrame(rafId1));
    } else if (stepId === 'calendar') {
      [100, 300, 500].forEach((ms) => {
        delayTimeouts.push(window.setTimeout(() => {
          const calendarEl = document.querySelector('[data-tutorial-id="calendar"]');
          if (calendarEl) updateRect(calendarEl);
        }, ms));
      });
    }

    if (!el && stepId !== 'calendar') return;

    if (el) {
      if (isInsideSettingsModal || targetId === 'settings-color-picker' || stepId === 'goals-find-added' || stepId === 'report-view' || stepId === 'achievements-earned-modal' || stepId === 'achievements-how-to-get') {
        [50, 150, 300, 450].forEach((ms) => {
          delayTimeouts.push(window.setTimeout(() => updateRect(el), ms));
        });
      }
      const obs = new ResizeObserver(() => updateRect(el));
      obs.observe(el);
      const onScroll = () => updateRect(el);
      window.addEventListener('scroll', onScroll, true);
      return () => {
        obs.disconnect();
        window.removeEventListener('scroll', onScroll, true);
        delayTimeouts.forEach((id) => (typeof id === 'function' ? id() : window.clearTimeout(id)));
        if (stepId === 'achievements-earned-modal') setAchievementModalAnimationRect(null);
        if (stepId === 'achievements-how-to-get') setAchievementHowToGetModalRect(null);
      };
    }
    return () => {
      delayTimeouts.forEach((id) => (typeof id === 'function' ? id() : window.clearTimeout(id)));
      if (stepId === 'achievements-earned-modal') setAchievementModalAnimationRect(null);
      if (stepId === 'achievements-how-to-get') setAchievementHowToGetModalRect(null);
    };
  }, [isOpen, currentStep, effectiveTargetId, goalModalOpen, goalModalTutorialPhase, createGoalModalTutorialPhase]);

  useEffect(() => {
    if (!isOpen) return;
    const card = document.querySelector('[data-tutorial-overlay] [data-tutorial-card]');
    if (!card) return;
    const measure = () => setTooltipHeight(card.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    return () => observer.disconnect();
  }, [isOpen, currentStep?.id, targetRect, createGoalModalTutorialPhase, goalModalTutorialPhase]);

  if (!isOpen) return null;
  if (!mounted || typeof document === 'undefined') return null;

  const rectForStep = targetRect?.stepId === currentStep?.id ? targetRect : null;
  const isCreateGoalModalStep = currentStep?.id === 'goals-create' && createGoalModalTutorialPhase;
  const isCreateGoalStep = currentStep?.id === 'goals-create' && !createGoalModalTutorialPhase;
  const isColorPickerStep = effectiveTargetId === 'settings-color-picker';
  const isGoalModalStep = (currentStep?.id === 'goals-take-one' || currentStep?.id === 'goals-take-added') && goalModalTutorialPhase;
  const padding = isGoalModalStep ? 0 : isColorPickerStep ? 16 : isCreateGoalStep ? 10 : 8;
  const holeRect = isCreateGoalModalStep && createGoalModalRect
    ? createGoalModalRect
    : rectForStep;
  const hole = holeRect
    ? {
        top: holeRect.top - padding,
        left: holeRect.left - padding,
        width: holeRect.width + padding * 2,
        height: holeRect.height + padding * 2,
      }
    : null;

  const gap = 14;
  const cardWidth = typeof window !== 'undefined' ? Math.min(280, window.innerWidth - 24) : 280;
  const cardCenter = cardWidth / 2;
  const targetCenterX = rectForStep ? rectForStep.left + rectForStep.width / 2 : 0;
  const cardLeft = typeof window !== 'undefined'
    ? Math.max(12, Math.min(window.innerWidth - cardWidth - 12, targetCenterX - cardCenter))
    : 12;
  const goalModalCardLeft = isGoalModalStep && rectForStep && typeof window !== 'undefined'
    ? Math.max(12, Math.min(window.innerWidth - cardWidth - 12, targetCenterX - cardCenter))
    : cardLeft;
  const goalModalArrowLeft = isGoalModalStep && rectForStep
    ? Math.min(cardWidth - 28, Math.max(28, targetCenterX - goalModalCardLeft - 8))
    : Math.min(cardWidth - 28, Math.max(28, targetCenterX - cardLeft - 8));
  const preferBelow = isGoalModalStep
    ? goalModalTutorialPhase === 'duration'
    : isCreateGoalModalStep
      ? true
      : currentStep?.id === 'home-tab'
        ? false
      : currentStep?.id === 'goals-tab' || currentStep?.id === 'achievements-tab'
        ? false
      : currentStep?.id === 'complete-goal'
        ? false
      : currentStep?.id === 'generate-report' || currentStep?.id === 'report-view'
        ? false
      : currentStep?.id === 'goals-find-added'
        ? false
      : currentStep?.id === 'achievements-earned-choose' || currentStep?.id === 'achievements-earned-modal' || currentStep?.id === 'achievements-cards' || currentStep?.id === 'achievements-how-to-get'
        ? false
        : !!rectForStep && currentStep?.id !== 'calendar' && currentStep?.id !== 'goals-tab' && currentStep?.id !== 'achievements-tab' && currentStep?.id !== 'goals-take-one' && !isColorPickerStep;
  const placement = rectForStep ? tutorialPlacement(rectForStep, tooltipHeight, window.innerHeight, preferBelow) : null;
  const placeBelow = placement?.placeBelow;
  const needsActionLock = requireAction && !(currentStep?.id === 'complete-goal' && completeGoalTutorialPhase === (isExplanatoryTutorial ? 'undo' : 'done')) && !(currentStep?.id === 'achievements-how-to-get' && achievementHowToGetArrowClicked);
  const hideNavButtons = requireSettingsClick || requireHomeClick || requireGoalsClick || requireAchievementsClick || requireCategoryClick || needsActionLock || (currentStep?.id === 'achievements-how-to-get' && !achievementHowToGetArrowClicked);
  const hideNavOnlyOnAchievementsEarnedChoose = currentStep?.id === 'achievements-earned-choose';
  const showNavButtons = !hideNavButtons && !hideNavOnlyOnAchievementsEarnedChoose;
  const showArrowToBlock = !!rectForStep;

  const tutorialDescKey = currentStep?.id === 'settings-color' && isColorPickerOpenForTutorial
    ? 'tutorialStepSettingsColorChoose'
    : currentStep?.id === 'today-goals' && !hasTodayGoals ? 'tutorialTodayEmptyDesc' : currentStep?.descKey;
  const descText = currentStep ? t(tutorialDescKey || currentStep?.descKey) : '';
  const modalPhaseDesc = (currentStep?.id === 'goals-take-one' || currentStep?.id === 'goals-take-added') && goalModalTutorialPhase
    ? (goalModalTutorialPhase === 'button' ? t('tutorialGoalModalClickButton') : t('tutorialGoalModalChooseDays'))
    : '';
  const createGoalModalPhaseDesc = currentStep?.id === 'goals-create' && createGoalModalTutorialPhase
    ? t(({name:'tutorialCreateGoalPhaseName',category:'tutorialCreateGoalPhaseCategory',options:'tutorialCreateGoalPhaseTime',period:'tutorialCreateGoalPhasePeriod',button:'tutorialCreateGoalPhaseButton'})[createGoalModalTutorialPhase])
    : '';
  const isCompactStep = currentStep?.id === 'goals-take-one';
  const completeGoalPhaseDesc = currentStep?.id === 'complete-goal'
    ? t(completeGoalTutorialPhase === 'done' ? 'tutorialCompleteGoalsDone' : completeGoalTutorialPhase === 'undo' ? 'tutorialCompleteGoalsStep2' : 'tutorialCompleteGoalsStep1')
    : '';
  const tooltipDesc = modalPhaseDesc || createGoalModalPhaseDesc || completeGoalPhaseDesc || (descText || '');

  const themeClass = theme === 'light' ? 'light-theme' : 'dark-theme';
  const colorPickerBackdropClass = isColorPickerStep ? ` ${styles.backdropColorPicker}` : '';
  const isNavRequiredStep = currentStep?.id === 'home-tab' || currentStep?.id === 'goals-tab' || currentStep?.id === 'achievements-tab';

  const mainOverlay = createPortal(
    <AnimatePresence>
      <motion.div
        data-tutorial-overlay="true"
        className={`${styles.backdrop} ${themeClass}${colorPickerBackdropClass} ${styles.tutorialStyle}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {!isNavRequiredStep && !['achievements-earned-modal', 'achievements-how-to-get'].includes(currentStep?.id) && (
          <div className={styles.dimNavBlocker} onClick={(e) => e.stopPropagation()} aria-hidden />
        )}
        {rectForStep && hole && currentStep?.id !== 'goals-intro' && currentStep?.id !== 'achievements-earned-modal' && currentStep?.id !== 'achievements-how-to-get' && (
          <>
            {!isColorPickerStep && (
              <>
            <div
              className={`${styles.dimWithHole} ${isGoalModalStep ? styles.dimWithHoleGoalModal : ''} ${isCreateGoalStep ? styles.dimWithHoleCircle : ''}`}
              style={{
                left: hole.left,
                top: hole.top,
                width: hole.width,
                height: hole.height,
              }}
              aria-hidden
            />
            <div
              className={styles.dimClickTop}
              style={{ height: hole.top }}
              onClick={(e) => e.stopPropagation()}
              aria-hidden
            />
            <div
              className={styles.dimClickBottom}
              style={{ top: hole.top + hole.height, height: `calc(100vh - ${hole.top + hole.height}px)` }}
              onClick={(e) => e.stopPropagation()}
              aria-hidden
            />
            <div
              className={styles.dimClickLeft}
              style={{ top: hole.top, left: 0, width: hole.left, height: hole.height }}
              onClick={(e) => e.stopPropagation()}
              aria-hidden
            />
            <div
              className={styles.dimClickRight}
              style={{
                top: hole.top,
                left: hole.left + hole.width,
                width: `calc(100vw - ${hole.left + hole.width}px)`,
                height: hole.height,
              }}
              onClick={(e) => e.stopPropagation()}
              aria-hidden
            />
              </>
            )}
            {!isColorPickerStep && !isGoalModalStep && (
            <motion.div
              className={`${styles.highlight} ${isCreateGoalStep ? styles.highlightCircle : ''}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                top: hole.top,
                left: hole.left,
                width: hole.width,
                height: hole.height,
              }}
            />
            )}
            {['generate-button', 'goals-find-added', 'goals-take-added'].includes(currentStep?.id) && (
              <div
                className={styles.highlightBlock}
                style={{
                  top: hole.top,
                  left: hole.left,
                  width: hole.width,
                  height: hole.height,
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                aria-hidden
              />
            )}
            {!isColorPickerStep && !isGoalModalStep && !(isCreateGoalModalStep && createGoalModalTutorialPhase === 'category') && (placeBelow ? (
            <motion.div
              className={styles.tooltipWrapBelow}
              style={{
                width: cardWidth,
                left: cardLeft,
                top: placement.top,
              }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.arrowTop} style={{ left: Math.min(cardWidth - 28, Math.max(28, targetCenterX - cardLeft - 8)) }} />
              <div data-tutorial-card="true" className={`${styles.tooltipCard} ${isCompactStep && !isGoalModalStep ? styles.tooltipCardCompact : ''} ${(isGoalModalStep || isCreateGoalModalStep) ? styles.tooltipCardSingleLine : ''}`}>
                {!isGoalModalStep && !isCreateGoalModalStep && <span className={styles.stepBadge}>{stepIndex + 1} / {steps.length}</span>}
                {(isGoalModalStep || isCreateGoalModalStep) ? (
                  <h3 className={styles.tooltipTitle}>{isGoalModalStep ? modalPhaseDesc : createGoalModalPhaseDesc}</h3>
                ) : (
                  <>
                    <h3 className={styles.tooltipTitle}>{t(currentStep.titleKey)}</h3>
                    {tooltipDesc ? <p className={styles.tooltipDesc}>{tooltipDesc}</p> : null}
                  </>
                )}
                <div className={styles.actions}>
                  <button type="button" className={styles.btnSkip} onClick={toastStepButtonsLocked ? undefined : (hideNavOnlyOnAchievementsEarnedChoose && !isLastStep ? nextStep : closeTutorial)} disabled={toastStepButtonsLocked}>
                    {t('tutorialSkip')}
                  </button>
                  {showNavButtons && (
                    <div className={styles.navGroup}>
                      {stepIndex > 0 && !hidePrevButton && (
                        <button type="button" className={styles.btnNav} onClick={prevStep} aria-label={t('tutorialPrev')}>
                          <ChevronLeft size={20} />
                        </button>
                      )}
                      <button type="button" className={styles.btnPrimary} onClick={toastStepButtonsLocked ? undefined : nextStep} disabled={toastStepButtonsLocked}>
                        {isLastStep ? t('tutorialDone') : t('tutorialNext')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            ) : (
            <div
              className={styles.tooltipWrapAboveAnchor}
              style={{
                left: cardLeft,
                top: placement.anchorTop,
                width: cardWidth,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className={styles.tooltipWrapAboveInner}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                <div className={styles.arrowBottom} style={{ left: Math.min(cardWidth - 28, Math.max(28, targetCenterX - cardLeft - 8)) }} />
                <div data-tutorial-card="true" className={`${styles.tooltipCard} ${isCompactStep && !isGoalModalStep ? styles.tooltipCardCompact : ''} ${(isGoalModalStep || isCreateGoalModalStep) ? styles.tooltipCardSingleLine : ''}`}>
                  {!isGoalModalStep && !isCreateGoalModalStep && <span className={styles.stepBadge}>{stepIndex + 1} / {steps.length}</span>}
                  {(isGoalModalStep || isCreateGoalModalStep) ? (
                    <h3 className={styles.tooltipTitle}>{isGoalModalStep ? modalPhaseDesc : createGoalModalPhaseDesc}</h3>
                  ) : (
                    <>
                      <h3 className={styles.tooltipTitle}>{t(currentStep.titleKey)}</h3>
                      {tooltipDesc ? <p className={styles.tooltipDesc}>{tooltipDesc}</p> : null}
                    </>
                  )}
                  <div className={styles.actions}>
                    <button type="button" className={styles.btnSkip} onClick={hideNavOnlyOnAchievementsEarnedChoose && !isLastStep ? nextStep : closeTutorial}>
                      {t('tutorialSkip')}
                    </button>
                    {showNavButtons && (
                      <div className={styles.navGroup}>
                        {stepIndex > 0 && !hidePrevButton && (
                          <button type="button" className={styles.btnNav} onClick={prevStep} aria-label={t('tutorialPrev')}>
                            <ChevronLeft size={20} />
                          </button>
                        )}
                        <button type="button" className={styles.btnPrimary} onClick={nextStep}>
                          {isLastStep ? t('tutorialDone') : t('tutorialNext')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
            ))}
          </>
        )}

        {currentStep?.id === 'achievements-earned-modal' && rectForStep && (() => {
          const pad = 8;
          const hole = { top: rectForStep.top - pad, left: rectForStep.left - pad, width: rectForStep.width + pad * 2, height: rectForStep.height + pad * 2 };
          return (
          <>
            <div className={styles.dimWithHole} style={{ left: hole.left, top: hole.top, width: hole.width, height: hole.height }} aria-hidden />
            <div className={styles.dimClickTop} style={{ height: hole.top }} onClick={(e) => e.stopPropagation()} aria-hidden />
            <div className={styles.dimClickBottom} style={{ top: hole.top + hole.height, height: `calc(100vh - ${hole.top + hole.height}px)` }} onClick={(e) => e.stopPropagation()} aria-hidden />
            <div className={styles.dimClickLeft} style={{ top: hole.top, left: 0, width: hole.left, height: hole.height }} onClick={(e) => e.stopPropagation()} aria-hidden />
            <div className={styles.dimClickRight} style={{ top: hole.top, left: hole.left + hole.width, width: `calc(100vw - ${hole.left + hole.width}px)`, height: hole.height }} onClick={(e) => e.stopPropagation()} aria-hidden />
            <motion.div
              className={styles.tooltipWrapBelow}
              style={{
                width: cardWidth,
                left: cardLeft,
                top: placement.top,
              }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.arrowTop} style={{ left: Math.min(cardWidth - 28, Math.max(28, targetCenterX - cardLeft - 8)) }} />
              <div data-tutorial-card="true" className={`${styles.tooltipCard} ${styles.tooltipCardAchievementModal}`}>
                <span className={styles.stepBadge}>{stepIndex + 1} / {steps.length}</span>
                <p className={`${styles.tooltipDescSmall} ${styles.tooltipDescAccent}`}>{t(currentStep.descKey)}</p>
                <div className={styles.actions}>
                  <button type="button" className={styles.btnSkip} onClick={hideNavOnlyOnAchievementsEarnedChoose && !isLastStep ? nextStep : closeTutorial}>
                    {t('tutorialSkip')}
                  </button>
                  {showNavButtons && (
                    <div className={styles.navGroup}>
                      {stepIndex > 0 && !hidePrevButton && (
                        <button type="button" className={styles.btnNav} onClick={prevStep} aria-label={t('tutorialPrev')}>
                          <ChevronLeft size={20} />
                        </button>
                      )}
                      {showNavButtons && <button type="button" className={styles.btnPrimary} onClick={nextStep}>
                        {isLastStep ? t('tutorialDone') : t('tutorialNext')}
                      </button>}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
          );
        })()}

        {currentStep?.id === 'achievements-how-to-get' && rectForStep && achievementHowToGetModalRect && (() => {
          const pad = 8;
          const hole = { top: achievementHowToGetModalRect.top - pad, left: achievementHowToGetModalRect.left - pad, width: achievementHowToGetModalRect.width + pad * 2, height: achievementHowToGetModalRect.height + pad * 2 };
          const targetCenterX = rectForStep.left + rectForStep.width / 2;
          const cardLeft = typeof window !== 'undefined' ? Math.max(12, Math.min(window.innerWidth - cardWidth - 12, targetCenterX - cardWidth / 2)) : 12;
          return (
          <>
            <div className={styles.dimWithHole} style={{ left: hole.left, top: hole.top, width: hole.width, height: hole.height }} aria-hidden />
            <div className={styles.dimClickTop} style={{ height: hole.top }} onClick={(e) => e.stopPropagation()} aria-hidden />
            <div className={styles.dimClickBottom} style={{ top: hole.top + hole.height, height: `calc(100vh - ${hole.top + hole.height}px)` }} onClick={(e) => e.stopPropagation()} aria-hidden />
            <div className={styles.dimClickLeft} style={{ top: hole.top, left: 0, width: hole.left, height: hole.height }} onClick={(e) => e.stopPropagation()} aria-hidden />
            <div className={styles.dimClickRight} style={{ top: hole.top, left: hole.left + hole.width, width: `calc(100vw - ${hole.left + hole.width}px)`, height: hole.height }} onClick={(e) => e.stopPropagation()} aria-hidden />
            <motion.div className={styles.highlight} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} style={{ top: rectForStep.top, left: rectForStep.left, width: rectForStep.width, height: rectForStep.height }} aria-hidden />
            <div className={styles.tooltipWrapAboveAnchor} style={{ left: cardLeft, top: placement.anchorTop, width: cardWidth }} onClick={(e) => e.stopPropagation()}>
              <motion.div className={styles.tooltipWrapAboveInner} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                <div className={styles.arrowBottom} style={{ left: Math.min(cardWidth - 28, Math.max(28, targetCenterX - cardLeft - 8)) }} />
                <div data-tutorial-card="true" className={styles.tooltipCard}>
                  <span className={styles.stepBadge}>{stepIndex + 1} / {steps.length}</span>
                  <p className={`${styles.tooltipDescSmall} ${styles.tooltipDescAccent}`}>{t(currentStep.descKey)}</p>
                  <div className={styles.actions}>
                    <button type="button" className={styles.btnSkip} onClick={closeTutorial}>{t('tutorialSkip')}</button>
                    {achievementHowToGetArrowClicked && (
                      <button type="button" className={styles.btnPrimary} onClick={nextStep}>
                        {isLastStep ? t('tutorialDone') : t('tutorialNext')}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </>
          );
        })()}

        {currentStep?.id === 'tutorial-complete' && (
          <>
            <div className={styles.dimFull} onClick={(e) => e.stopPropagation()} aria-hidden />
            <motion.div
              className={styles.tooltipWrapCenter}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div data-tutorial-card="true" className={`${styles.tooltipCard} ${styles.tooltipCardCenter}`}>
                <h3 className={styles.tooltipTitle}>{t('tutorialCompleteTitle')}</h3>
                <p className={styles.tooltipDesc}>{t('tutorialCompleteDesc')}</p>
                <p className={styles.tooltipDesc}>
                  <a href={t('tutorialSupportBotLink')} target="_blank" rel="noopener noreferrer" className={styles.tutorialBotLink}>
                    {t('tutorialSupportBotLink')}
                  </a>
                </p>
                <div className={`${styles.actions} ${styles.actionsCenter}`}>
                  <button type="button" className={styles.btnPrimary} onClick={handleTutorialCompleteClose}>
                    {t('tutorialCompleteClose')}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {currentStep && (
          (!rectForStep || currentStep.id === 'goals-intro' || currentStep.id === 'goals-catalog-intro' || currentStep.id === 'achievements-intro' || currentStep.id === 'home-two-goals-intro' || currentStep.id === 'goals-delete-intro' || (!rectForStep && (currentStep.id === 'achievements-earned-modal' || currentStep.id === 'achievements-how-to-get')))
          && currentStep.id !== 'tutorial-complete'
        ) && (
          <>
            <div className={styles.dimFull} onClick={(e) => e.stopPropagation()} aria-hidden />
            <motion.div
              className={
                currentStep.id === 'intro' || currentStep.id === 'goals-toast-success' || currentStep.id === 'home-intro' || currentStep.id === 'goals-intro' || currentStep.id === 'goals-catalog-intro' || currentStep.id === 'achievements-intro' || currentStep.id === 'home-two-goals-intro' || currentStep.id === 'goals-delete-intro' || currentStep.id === 'achievements-earned-modal' || currentStep.id === 'achievements-how-to-get'
                  ? styles.tooltipWrapCenter
                  : currentStep.id === 'calendar'
                    ? styles.tooltipWrapTop
                    : styles.tooltipWrap
              }
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div data-tutorial-card="true" className={`${styles.tooltipCard} ${styles.tooltipCardCenter}`}>
                {currentStep.id === 'intro' ? (
                  <>
                    <h3 className={styles.tooltipTitle}>{t(currentStep.titleKey)}</h3>
                    <p className={styles.tooltipDesc}>{t(currentStep.descKey)}</p>
                    <div className={styles.actions}>
                      <button type="button" className={styles.btnSkip} onClick={closeTutorial}>
                        {t('tutorialSkip')}
                      </button>
                      <button type="button" className={styles.btnPrimary} onClick={nextStep}>
                        {t('tutorialIntroButton')}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className={styles.stepBadge}>{stepIndex + 1} / {steps.length}</span>
                    <h3 className={styles.tooltipTitle}>{t(currentStep.titleKey)}</h3>
                    <p className={styles.tooltipDesc}>{t(tutorialDescKey || currentStep?.descKey)}</p>
                    <div className={styles.actions}>
                      <button type="button" className={styles.btnSkip} onClick={closeTutorial}>
                        {t('tutorialSkip')}
                      </button>
                      {showNavButtons && <button type="button" className={styles.btnPrimary} onClick={nextStep}>
                        {isLastStep ? t('tutorialDone') : t('tutorialNext')}
                      </button>}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );

  const goalModalTooltip =
    mounted &&
    (currentStep?.id === 'goals-take-one' || currentStep?.id === 'goals-take-added') &&
    isGoalModalStep &&
    rectForStep &&
    typeof document !== 'undefined' &&
    createPortal(
      <div data-tutorial-overlay="true" className={`${styles.tooltipPortalWrap} ${styles.tutorialStyle}`}>
        {placeBelow ? (
          <motion.div
            className={styles.tooltipWrapBelow}
            style={{
              width: cardWidth,
              left: goalModalCardLeft,
              top: placement.top,
            }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.arrowTop} style={{ left: goalModalArrowLeft }} />
            <div data-tutorial-card="true" className={`${styles.tooltipCard} ${styles.tooltipCardSingleLine}`}>
              <h3 className={styles.tooltipTitle}>{modalPhaseDesc}</h3>
              <div className={styles.actions}>
                <button type="button" className={styles.btnSkip} onClick={closeTutorial}>
                  {t('tutorialSkip')}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div
            className={styles.tooltipWrapAboveAnchor}
            style={{ left: goalModalCardLeft, top: placement.anchorTop, width: cardWidth }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div className={styles.tooltipWrapAboveInner} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
              <div className={styles.arrowBottom} style={{ left: goalModalArrowLeft }} />
              <div data-tutorial-card="true" className={`${styles.tooltipCard} ${styles.tooltipCardSingleLine}`}>
                <h3 className={styles.tooltipTitle}>{modalPhaseDesc}</h3>
                <div className={styles.actions}>
                  <button type="button" className={styles.btnSkip} onClick={closeTutorial}>
                    {t('tutorialSkip')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>,
      document.body
    );

  return (
    <>
      {mainOverlay}
      {goalModalTooltip}
    </>
  );
}
