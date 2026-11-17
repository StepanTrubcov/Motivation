import React, { useEffect, useMemo, useState } from 'react';
import Lights from './Lights';
import { connect } from 'react-redux';
import { getStreakSnapshot, getStreakToday } from '@/lib/streakCelebrations.mjs';

const LightsConteiner = ({ timeGoalsSaving, userId }) => {
    const [today, setToday] = useState(getStreakToday);
    useEffect(() => {
        const updateDay = () => setToday(getStreakToday());
        const timer = window.setInterval(updateDay, 30000);
        window.addEventListener('focus', updateDay);
        document.addEventListener('visibilitychange', updateDay);
        return () => {
            window.clearInterval(timer);
            window.removeEventListener('focus', updateDay);
            document.removeEventListener('visibilitychange', updateDay);
        };
    }, []);
    const snapshot = useMemo(() => getStreakSnapshot(timeGoalsSaving, today), [timeGoalsSaving, today]);
    return <Lights snapshot={snapshot} userId={userId} />;
};

const mapStateToProps = (state) => ({
    timeGoalsSaving: state.goals.timeGoalsSaving,
    userId: state.profile.profile?.id,
});

export default connect(mapStateToProps)(LightsConteiner);
