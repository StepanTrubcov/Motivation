'use client';

import React, { useState } from "react";
import { FaHome, FaBars, FaTrophy } from "react-icons/fa";
import c from './BottomNav.module.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTutorial } from '@/context/TutorialContext';

const BottomNav = () => {
    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState("home");
    const { isOpen: isTutorialOpen, currentStep, onTutorialNavigateToGoals, onTutorialNavigateToAchievements } = useTutorial();

    const handleGoalsClick = () => {
        if (currentStep?.id === 'goals-tab') {
            onTutorialNavigateToGoals();
        }
        setActiveTab("goals");
    };

    const handleAchievementsClick = (e) => {
        if (currentStep?.id === 'achievements-tab') {
            onTutorialNavigateToAchievements();
        }
        setActiveTab("achievements");
    };

    const isNavRequiredStep = currentStep?.id === 'goals-tab' || currentStep?.id === 'achievements-tab';
    const blockNav = isTutorialOpen && !isNavRequiredStep;

    return (
        <div
            className={`${c.navbar} ${blockNav ? c.navbarUnderTutorial : ''}`}
            onClick={blockNav ? (e) => { e.preventDefault(); e.stopPropagation(); } : undefined}
        >
            <Link
                href='/profile'
                className={`${c.navItem} ${pathname === '/profile' || activeTab === "home" ? c.active : ""}`}
                onClick={(e) => { if (blockNav) { e.preventDefault(); e.stopPropagation(); } else setActiveTab("home"); }}
            >
                <FaHome />
            </Link>
            <Link
                href='/goals'
                className={`${c.navItem} ${pathname === '/goals' || activeTab === "goals" ? c.active : ""}`}
                onClick={(e) => {
                    if (isTutorialOpen && currentStep?.id !== 'goals-tab') { e.preventDefault(); e.stopPropagation(); }
                    else handleGoalsClick(e);
                }}
                data-tutorial-id="goals-tab"
            >
                <FaBars />
            </Link>
            <Link
                href='/achievements'
                className={`${c.navItem} ${pathname === '/achievements' || activeTab === "achievements" ? c.active : ""}`}
                onClick={(e) => {
                    if (isTutorialOpen && currentStep?.id !== 'achievements-tab') { e.preventDefault(); e.stopPropagation(); }
                    else handleAchievementsClick(e);
                }}
                data-tutorial-id="achievements-tab"
            >
                <FaTrophy />
            </Link>
        </div>
    );
};

export default BottomNav;
