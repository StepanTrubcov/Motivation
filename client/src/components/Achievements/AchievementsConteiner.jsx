'use client';
import React from "react";
import { connect } from "react-redux";
import { useLanguage } from '@/context/LanguageContext';
import c from "./Achievements.module.css";
import Achievements from "./Achievements";
import { getMakingPicture } from "../../redux/assignments_reducer";

/** Проверка unlock ачивок выполняется один раз в DataInitializer (избегаем дублей). */
const AchievementsConteiner = ({ getMakingPicture, assignments = [], user }) => {
    const { t } = useLanguage();

    return (
        <div>
            <div className={c.title}>{t('achievements')}</div>
            <Achievements getMakingPicture={getMakingPicture} username={user?.username || user?.firstName || t('user')} assignments={assignments} />
        </div>
    );
};

const mapStateToProps = (state) => ({
    assignments: state.assignments.assignments,
    user: state.profile.profile
});

export default connect(mapStateToProps, { getMakingPicture })(AchievementsConteiner);
