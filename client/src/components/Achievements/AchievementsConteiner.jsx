'use client';
import React from "react";
import { connect } from "react-redux";
import { useLanguage } from '@/context/LanguageContext';
import c from "./Achievements.module.css";
import Achievements from "./Achievements";
import { getMakingPicture } from "../../redux/assignments_reducer";

/** Проверка unlock ачивок выполняется один раз в DataInitializer (избегаем дублей). */
const AchievementsConteiner = ({ getMakingPicture, assignments = [], user }) => {
    const { t, language } = useLanguage();
    const items = Array.isArray(assignments) ? assignments : [];
    const earnedCount = items.filter(item => item.status === 'my').length;

    return (
        <div>
            <header className={c.header}>
                <h1 className={c.title}>{t('achievements')}</h1>
                <p className={c.subtitle}>
                    {language === 'en'
                        ? `${earnedCount} earned out of ${items.length}`
                        : `${earnedCount} получено из ${items.length}`}
                </p>
            </header>
            <Achievements getMakingPicture={getMakingPicture} username={user?.username || user?.firstName || t('user')} assignments={assignments} />
        </div>
    );
};

const mapStateToProps = (state) => ({
    assignments: state.assignments.assignments,
    user: state.profile.profile
});

export default connect(mapStateToProps, { getMakingPicture })(AchievementsConteiner);
