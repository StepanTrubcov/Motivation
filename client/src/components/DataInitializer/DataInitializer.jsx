'use client';

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useBottomNav } from '@/context/BottomNavContext';
import { useLanguage } from '@/context/LanguageContext';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';
import FirstTimeOnboarding from '@/components/FirstTimeOnboarding/FirstTimeOnboarding';
import { addProfile } from '@/redux/profile_reducer';
import { addStatus, checkTimeGoalsSaving } from '@/redux/goals_reducer';
import { ensureAchievementsInitialized, checkAchievementsInBackground } from '@/redux/assignments_reducer';
import AchievementCelebrationManager from '@/components/Achievements/AchievementCelebration/AchievementCelebrationManager';

const DataInitializer = ({ children }) => {
    const dispatch = useDispatch();
    const { setShowBottomNav } = useBottomNav();
    const { t, changeLanguage } = useLanguage();
    const user = useSelector((state) => state.profile.profile);
    const ThereAreUsers = useSelector((state) => state.goals.ThereAreUsers);
    const timeGoalsSaving = useSelector((state) => state.goals.timeGoalsSaving);
    const goals = useSelector((state) => state.goals.goals);
    const assignmentsLoaded = useSelector((state) => state.assignments.assignmentsLoaded);

    const [loadError, setLoadError] = useState(null);
    const [retry, setRetry] = useState(0);
    const [loadedOwner, setLoadedOwner] = useState(() => user?.id && ThereAreUsers && assignmentsLoaded ? user.id : null);
    const lastDayRef = useRef(new Date().toISOString().slice(0, 10));
    const lastAppliedDbLanguageRef = useRef(null);

    useEffect(() => {
        let active = true;
        setLoadError(null);
        const tg = window.Telegram?.WebApp;
        tg?.ready();
        if (tg && !tg.isExpanded) tg.expand();
        if (user?.id && retry === 0) return;
        dispatch(addProfile()).catch(error => {
            const unauthorized = [401, 403].includes(error.response?.status) || error.message?.includes('через Telegram');
            if (active) setLoadError(unauthorized ? 'Откройте приложение через Telegram заново.' : 'Не удалось загрузить приложение. Проверьте соединение и попробуйте ещё раз.');
        });
        return () => { active = false; };
    }, [dispatch, retry, user?.id]);

    useEffect(() => {
        if (!user?.id) return;
        setLoadedOwner(null);
        let active = true;
        setLoadError(null);
        Promise.all([
            dispatch(addStatus(user.id)),
            dispatch(checkTimeGoalsSaving(user.telegramId)),
            dispatch(ensureAchievementsInitialized(user.id)),
        ]).then(() => { if (active) setLoadedOwner(user.id); }).catch(() => {
            if (active) setLoadError('Не удалось загрузить данные. Проверьте соединение и попробуйте ещё раз.');
        });
        return () => { active = false; };
    }, [dispatch, user?.id, user?.telegramId, retry]);

    useEffect(() => {
        const key = `${user?.id}:${user?.language}`;
        if (!user?.language || lastAppliedDbLanguageRef.current === key) return;
        lastAppliedDbLanguageRef.current = key;
        changeLanguage(user.language === 'ang' ? 'en' : 'ru');
    }, [user?.id, user?.language, changeLanguage]);

    const ready = Boolean(user?.id && loadedOwner === user.id && ThereAreUsers && assignmentsLoaded);
    useEffect(() => { setShowBottomNav(ready); }, [ready, setShowBottomNav]);

    useEffect(() => {
        if (ready) void dispatch(checkAchievementsInBackground(user.id));
    }, [ready, user?.id, user?.pts, user?.registrationDate, goals, timeGoalsSaving, dispatch]);

    useEffect(() => {
        if (!ready) return;
        const refresh = async () => {
            if (document.visibilityState !== 'visible') return;
            const today = new Date().toISOString().slice(0, 10);
            try {
                if (lastDayRef.current !== today) {
                    await dispatch(addStatus(user.id));
                    await dispatch(checkTimeGoalsSaving(user.telegramId));
                    lastDayRef.current = today;
                }
                await dispatch(checkAchievementsInBackground(user.id));
            } catch (error) { console.error('Не удалось обновить данные после смены дня:', error); }
        };
        const interval = window.setInterval(refresh, 60000);
        window.addEventListener('focus', refresh);
        document.addEventListener('visibilitychange', refresh);
        return () => {
            window.clearInterval(interval);
            window.removeEventListener('focus', refresh);
            document.removeEventListener('visibilitychange', refresh);
        };
    }, [ready, user?.id, user?.telegramId, dispatch]);

    useEffect(() => {
        if (ready || loadError) return;
        const timer = window.setTimeout(() => setLoadError('Загрузка заняла слишком много времени. Попробуйте ещё раз. / Loading timed out. Please try again.'), 45000);
        return () => window.clearTimeout(timer);
    }, [ready, loadError, retry]);

    if (!ready || loadError) {
        return <LoadingScreen title={t('loadingGoalsInProgress')} error={loadError} onRetry={() => setRetry(value => value + 1)} />;
    }

    return (
        <FirstTimeOnboarding>
            {children}
            <AchievementCelebrationManager />
        </FirstTimeOnboarding>
    );
};

export default DataInitializer;
