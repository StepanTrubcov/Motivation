'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useBottomNav } from '@/context/BottomNavContext';
import { useLanguage } from '@/context/LanguageContext';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';
import FirstTimeOnboarding from '@/components/FirstTimeOnboarding/FirstTimeOnboarding';
import { addProfile, setPoints } from '@/redux/profile_reducer';
import { addGoals, addStatus, checkTimeGoalsSaving } from '@/redux/goals_reducer';
import { getAchievementsNewStatus, getInitializeAchievementsData } from '@/redux/assignments_reducer';
import { checkAll } from '@/utils/checkAll/checkAll';
import { toast } from 'react-hot-toast';

const DataInitializer = ({ children }) => {
    const dispatch = useDispatch();
    const { setShowBottomNav } = useBottomNav();
    const { t, changeLanguage } = useLanguage();
    const user = useSelector((state) => state.profile.profile);
    const ThereAreUsers = useSelector((state) => state.goals.ThereAreUsers);
    const timeGoalsSaving = useSelector((state) => state.goals.timeGoalsSaving);
    const goals = useSelector((state) => state.goals.goals);
    const assignments = useSelector((state) => state.assignments.assignments);
    const assignmentsLoaded = useSelector((state) => state.assignments.assignmentsLoaded);

    const triggeredRef = useRef(new Set());
    const lastLoadedTelegramIdRef = useRef(null);
    const lastAppliedDbLanguageRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            if (!tg.isExpanded) {
                tg.expand();
            }
        }
        dispatch(addProfile());
    }, [dispatch]);

    // Синхронизируем язык интерфейса с БД только когда именно значение в БД изменилось.
    // Это предотвращает откат UI-языка при локальном переключении до прихода обновленного профиля.
    useEffect(() => {
        if (!user?.language) return;
        if (lastAppliedDbLanguageRef.current === user.language) return;

        lastAppliedDbLanguageRef.current = user.language;
        const targetLang = user.language === 'ang' ? 'en' : 'ru';
        changeLanguage(targetLang);
    }, [user?.language]);

    useEffect(() => {
        const telegramId = user?.telegramId;
        if (!telegramId) return;

        // Загружаем историю выполнений независимо от ThereAreUsers.
        // Это фиксит гонку при старте, когда goals успевают загрузиться раньше.
        if (lastLoadedTelegramIdRef.current !== telegramId || !Array.isArray(timeGoalsSaving)) {
            lastLoadedTelegramIdRef.current = telegramId;
            dispatch(checkTimeGoalsSaving(telegramId));
        }
    }, [user?.telegramId, dispatch, timeGoalsSaving]);

    useEffect(() => {
        if (user && !ThereAreUsers) {
            dispatch(addGoals(user.id));
            dispatch(addStatus(user.id));
        }
    }, [user, ThereAreUsers, dispatch]);

    useEffect(() => {
        if (user && !assignmentsLoaded) {
            dispatch(getInitializeAchievementsData(user.id));
        }
    }, [user, assignmentsLoaded, dispatch]);

    useEffect(() => {
        if (user && ThereAreUsers && assignmentsLoaded) {
            setShowBottomNav(true);
            const newStatusAssignment = async (achievement, userId) => {
                await dispatch(getAchievementsNewStatus(achievement, userId));
                await dispatch(setPoints(userId, achievement.points));
                toast.success(t('newAchievement'), {
                    style: {
                        background: '#333',
                        color: '#fff',
                        marginTop: '80px',
                    }
                });
            };
            (async () => {
                await checkAll(
                    assignments,
                    triggeredRef,
                    goals,
                    newStatusAssignment,
                    user.id,
                    user.registrationDate
                );
            })();
        } else {
            setShowBottomNav(false);
        }
    }, [user, ThereAreUsers, assignmentsLoaded, setShowBottomNav, assignments, goals, t, dispatch]);

    if (!user) {
        return <LoadingScreen title={t('loadingUser')} />;
    }
    if (!ThereAreUsers) {
        return <LoadingScreen title={t('loadingGoalsInProgress')} />;
    }
    if (!assignmentsLoaded) {
        return <LoadingScreen title={t('loadingAchievements')} />;
    }

    return (
        <FirstTimeOnboarding>
            {children}
        </FirstTimeOnboarding>
    );
};

export default DataInitializer;