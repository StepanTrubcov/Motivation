'use client';

import React from "react";
import { CalendarDays, Target, Trophy } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import c from './BottomNav.module.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTutorial } from '@/context/TutorialContext';

const BottomNav = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { t } = useLanguage();
    const { isOpen: isTutorialOpen, currentStep, onTutorialNavigateToHome, onTutorialNavigateToGoals, onTutorialNavigateToAchievements } = useTutorial();

    const handleGoalsClick = (e) => {
        if (currentStep?.id === 'goals-tab') {
            e?.preventDefault?.();
            onTutorialNavigateToGoals();
            router.push('/goals');
        }
    };

    const handleAchievementsClick = (e) => {
        if (currentStep?.id === 'achievements-tab') {
            onTutorialNavigateToAchievements();
        }
    };

    const isNavRequiredStep = currentStep?.id === 'home-tab' || currentStep?.id === 'goals-tab' || currentStep?.id === 'achievements-tab';
    const blockNav = isTutorialOpen && !isNavRequiredStep;

    return (
        <nav
            aria-label={t('mainNavigation')}
            className={`${c.navbar} ${blockNav ? c.navbarUnderTutorial : ''}`}
            onClick={blockNav ? (e) => { e.preventDefault(); e.stopPropagation(); } : undefined}
        >
            <Link
                href='/profile'
                aria-current={pathname === '/profile' || pathname === '/' ? 'page' : undefined}
                className={`${c.navItem} ${pathname === '/profile' || pathname === '/' ? c.active : ""}`}
                onClick={(e) => {
                    if (isTutorialOpen && currentStep?.id !== 'home-tab') { e.preventDefault(); e.stopPropagation(); return; }
                    if (currentStep?.id === 'home-tab') onTutorialNavigateToHome?.();
                }}
                data-tutorial-id="home-tab"
            >
                <CalendarDays size={26} strokeWidth={1.8} aria-hidden="true" />
                <span>{t('navToday')}</span>
            </Link>
            <Link
                href='/goals'
                aria-current={pathname === '/goals' ? 'page' : undefined}
                className={`${c.navItem} ${pathname === '/goals' ? c.active : ""}`}
                onClick={(e) => {
                    if (isTutorialOpen && currentStep?.id !== 'goals-tab') { e.preventDefault(); e.stopPropagation(); }
                    else handleGoalsClick(e);
                }}
                data-tutorial-id="goals-tab"
            >
                <Target size={26} strokeWidth={1.8} aria-hidden="true" />
                <span>{t('goals')}</span>
            </Link>
            <Link
                href='/achievements'
                aria-current={pathname === '/achievements' ? 'page' : undefined}
                className={`${c.navItem} ${pathname === '/achievements' ? c.active : ""}`}
                onClick={(e) => {
                    if (isTutorialOpen && currentStep?.id !== 'achievements-tab') { e.preventDefault(); e.stopPropagation(); }
                    else handleAchievementsClick(e);
                }}
                data-tutorial-id="achievements-tab"
            >
                <Trophy size={26} strokeWidth={1.8} aria-hidden="true" />
                <span>{t('achievements')}</span>
            </Link>
        </nav>
    );
};

export default BottomNav;
