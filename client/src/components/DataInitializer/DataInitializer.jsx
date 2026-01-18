'use client';

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useBottomNav } from '@/context/BottomNavContext';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';
import { addProfile, setPoints } from '@/redux/profile_reducer';
import { addGoals, addStatus, checkTimeGoalsSaving } from '@/redux/goals_reducer';
import { getAchievementsNewStatus, getInitializeAchievementsData } from '@/redux/assignments_reducer';
import { checkAll } from '@/utils/checkAll/checkAll';
import { toast } from 'react-hot-toast';

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
    const triggeredRef = useRef(new Set());

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

        initTelegramTheme();
        dispatch(addProfile());
    }, [dispatch, isUpdatingAchievements]);

    useEffect(() => {
        if (user && !ThereAreUsers) {
            dispatch(checkTimeGoalsSaving(user.telegramId));
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
            const newStatusAssignment = (achievement, userId) => {
                dispatch(getAchievementsNewStatus(achievement, userId))
                dispatch(setPoints(userId, achievement.points))
                toast.success(`Вы получили новое достижение!`, {
                    style: {
                        background: '#333',
                        color: '#fff',
                        marginTop: '80px',
                    }
                });
            };
            checkAll(assignments, triggeredRef, goals, newStatusAssignment, user.id, user.registrationDate);
        } else {
            setShowBottomNav(false);
        }
    }, [user, ThereAreUsers, assignmentsLoaded, setShowBottomNav, assignments, goals]);

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