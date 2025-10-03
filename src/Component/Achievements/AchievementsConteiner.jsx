import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";
import c from "./Achievements.module.css";
import Achievements from "./Achievements";
import axios from "axios";
import { getAchievementsNewStatus } from "../../redux/assignments_reducer";
import { toast } from "react-hot-toast";
import { setPoints } from "../../redux/profile_reducer";
import { checkAll } from "../../utils/checkAll/checkAll";

const AchievementsConteiner = ({ assignments = [], goals = [], userId, user, getAchievementsNewStatus, setPoints }) => {
    const triggeredRef = useRef(new Set());

    const userRegistrationStub =  new Date(Date.now() - 100 * 24 * 60 * 60 * 1000);
    console.log( user.registrationDate)

    const newStatusAssignment = (achievement, userId) => {
        getAchievementsNewStatus(achievement, userId)
        setPoints(userId, achievement.points)
        toast.success(`Вы получили новое достижение!`);
    };

    useEffect(() => {
        checkAll(assignments, triggeredRef, goals, newStatusAssignment, userId, userRegistrationStub);
    }, [assignments, goals]);

    return (
        <div>
            <div className={c.title}>Достижения</div>
            <Achievements assignments={assignments} />
        </div>
    );
};

const mapStateToProps = (state) => ({
    assignments: state.assignments.assignments,
    goals: state.goals.goals,
    userId: state.profile.profile?.id,
    user: state.profile.profile
});

export default connect(mapStateToProps, { getAchievementsNewStatus, setPoints })(AchievementsConteiner);
