'use client';

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useBottomNav } from '@/context/BottomNavContext';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';
import { addProfile } from '@/redux/profile_reducer';
import { addGoals, addStatus } from '@/redux/goals_reducer';
import { getInitializeAchievementsData } from '@/redux/assignments_reducer';
import { addTextGenerationData } from '@/redux/generation_reducer';

const DataInitializer = ({ children }) => {
    const dispatch = useDispatch();
    const { setShowBottomNav } = useBottomNav();
    const user = useSelector((state) => state.profile.profile);
    const ThereAreUsers = useSelector((state) => state.goals.ThereAreUsers);
    const goals = useSelector((state) => state.goals.goals);
    const assignments = useSelector((state) => state.assignments.assignments);
    const assignmentsLoaded = useSelector((state) => state.assignments.assignmentsLoaded);
    const [isUpdatingAchievements, setIsUpdatingAchievements] = useState(false);
    
    const isTextDataInitialized = useRef(false);

    useEffect(() => {
        // Принудительная установка темной темы для Telegram WebApp
        const initTelegramTheme = () => {
            if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
                const tg = window.Telegram.WebApp;
                tg.ready();

                // Принудительно устанавливаем темную тему
                document.body.classList.remove('telegram-light', 'telegram-dark');
                document.body.classList.add('telegram-dark');

                // Отключаем автоматическое переключение тем
                tg.onEvent('themeChanged', () => {
                    document.body.classList.remove('telegram-light', 'telegram-dark');
                    document.body.classList.add('telegram-dark');
                });
            }
        };

        // Убираем проверку обновления достижений
        initTelegramTheme();
        dispatch(addProfile());
    }, [dispatch, isUpdatingAchievements]);

    useEffect(() => {
        if (user && !ThereAreUsers) {
            dispatch(addGoals(user.id));
            dispatch(addStatus(user.id));
        }
    }, [user, ThereAreUsers, dispatch]);

    useEffect(() => {
        if (ThereAreUsers && user && !isTextDataInitialized.current) {
            const goalsDone = goals.filter(g => g.status === "completed");
            const goalsInProgress = goals.filter(g => g.status === "in_progress");
            const telegramId = user.telegramId;
            const loading = false;
            if (goalsDone.length > 0 || goalsInProgress.length > 0) {
                dispatch(addTextGenerationData(user?.usersTag, telegramId, goalsDone, goalsInProgress, null, null, loading));
            }
            isTextDataInitialized.current = true;
            console.log('✅ Данные генерации текста инициализированы один раз');
        }
    }, [ThereAreUsers, user, goals, dispatch]);

    useEffect(() => {
        if (user && !assignmentsLoaded) {
            dispatch(getInitializeAchievementsData(user.id));
        }
    }, [user, assignmentsLoaded, dispatch]);

    useEffect(() => {
        if (user && ThereAreUsers && assignmentsLoaded) {
            setShowBottomNav(true);
        } else {
            setShowBottomNav(false);
        }
    }, [user, ThereAreUsers, assignmentsLoaded, setShowBottomNav]);

    if (!user) {
        return <LoadingScreen title="Загрузка данных пользователя..." />;
    }
    if (!ThereAreUsers) {
        return <LoadingScreen title="Загрузка целей пользователя..." />;
    }
    if (!assignmentsLoaded) {
        return <LoadingScreen title="Загрузка достижений пользователя..." />;
    }

    return <>{children}</>;
};

export default DataInitializer;