'use client';
import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";
import { useLanguage } from '@/context/LanguageContext';
import c from "./Achievements.module.css";
import Achievements from "./Achievements";
import axios from "axios";
import { getAchievementsNewStatus, getMakingPicture } from "../../redux/assignments_reducer";
import { toast } from "react-hot-toast";
import { setPoints } from "../../redux/profile_reducer";
import { checkAll } from "../../utils/checkAll/checkAll";

const AchievementsConteiner = ({ getMakingPicture, assignments = [], goals = [], userId, user, getAchievementsNewStatus, setPoints }) => {
   
    const { t } = useLanguage();
    const triggeredRef = useRef(new Set());

    const userRegistrationStub = user?.registrationDate ? new Date(user.registrationDate) : new Date();

    const newStatusAssignment = (achievement, userId) => {
        getAchievementsNewStatus(achievement, userId)
        setPoints(userId, achievement.points)
        toast.success(t('newAchievement'), {
            style: {
                background: '#333',
                color: '#fff',
                marginTop: '80px',
            }
        });
    };

    useEffect(() => {
        if (user && assignments.length > 0) {
            checkAll(assignments, triggeredRef, goals, newStatusAssignment, userId, userRegistrationStub);
        }
    }, [assignments, goals, user]);

    return (
        <div>
            <div className={c.title}>{t('achievements')}</div>
            <Achievements getMakingPicture={getMakingPicture} username={user.username || user.firstName || t('user')} assignments={assignments} />
        </div>
    );
};

const mapStateToProps = (state) => ({
    assignments: state.assignments.assignments,
    goals: state.goals.goals,
    userId: state.profile.profile?.id,
    user: state.profile.profile
});

export default connect(mapStateToProps, { getAchievementsNewStatus, setPoints, getMakingPicture })(AchievementsConteiner);
