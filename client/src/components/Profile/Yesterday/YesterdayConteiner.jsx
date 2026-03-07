import React, { useState, useMemo, useEffect } from "react";
import Yesterday from "./Yesterday";
import { connect } from "react-redux";
import { useLanguage } from '@/context/LanguageContext';
import { translateGoals } from '@/utils/goalsTranslations';
import { addStatus, addStatusNew, checkTimeGoalsSaving, newStatusSavingGoal } from "@/redux/goals_reducer";
import { deletePoints, setPoints } from "@/redux/profile_reducer";
import { addTextGenerationData } from "@/redux/generation_reducer";

function computeSeries(timeGoalsSaving) {
    if (!timeGoalsSaving || !Array.isArray(timeGoalsSaving)) return 0;
    const today = new Date().toISOString().split("T")[0];
    const pastDays = timeGoalsSaving
        .filter((item) => item.date < today)
        .sort((a, b) => a.date.localeCompare(b.date));
    let num = 0;
    pastDays.forEach((s) => {
        const r = (s.goalData || []).filter((g) => g.status === "completed");
        if (r.length >= 1) num += 1;
        else num = 0;
    });
    const todayDay = timeGoalsSaving.find((item) => item.date === today);
    if (todayDay && todayDay.goalData) {
        const r = todayDay.goalData.filter((g) => g.status === "completed");
        if (r.length > 0) num += 1;
    }
    return num;
}

const YesterdayConteiner = (props) => {
    const { language } = useLanguage();
    const dates = new Date();
    dates.setDate(dates.getDate() - 1);
    const esterdayDate = dates.toISOString().split('T')[0]

    const [date, setDate] = useState(esterdayDate);
    const [savingGoals, setSavingGoals] = useState(null);

    useEffect(() => {
        checkTimeGoalsSaving(props.profile.telegramId);
    }, [props.timeGoalsSaving])

    const goalsForSelectedDate = useMemo(() => {
        const goalsData = savingGoals || props.timeGoalsSaving;

        if (!date || !goalsData || !props.goals) {
            return [];
        }
        const dateEntry = goalsData.find(entry => entry.date === date);

        if (!dateEntry || !dateEntry.goalData) {
            return [];
        }
        const resultGoals = dateEntry.goalData.map(goalData => {
            const goal = props.goals.find(g => g.id === goalData.idGoals);

            if (goal) {
                return {
                    ...goal,
                    status: goalData.status
                };
            }

            return null;
        }).filter(Boolean);

        // Переводим цели перед возвратом
        try {
            const goalsCopy = resultGoals.map(g => ({ ...g }));
            const translated = translateGoals(goalsCopy, language);
            return Array.isArray(translated) && translated.length === resultGoals.length 
                ? translated 
                : goalsCopy;
        } catch (error) {
            console.error('Error translating goals in YesterdayConteiner:', error);
            return resultGoals;
        }
    }, [date, savingGoals, props.timeGoalsSaving, props.goals, language]);

    const series = useMemo(() => computeSeries(props.timeGoalsSaving), [props.timeGoalsSaving]);

    const isTodayCompleted = useMemo(() => {
        if (!props.timeGoalsSaving || !Array.isArray(props.timeGoalsSaving)) return false;
        const today = new Date().toISOString().split("T")[0];
        const todayDay = props.timeGoalsSaving.find((item) => item.date === today);
        return todayDay?.goalData?.some((g) => g.status === "completed") ?? false;
    }, [props.timeGoalsSaving]);

    return <div>

        {goalsForSelectedDate.length !== 0 && <Yesterday addTextGenerationData={props.addTextGenerationData} series={series} isTodayCompleted={isTodayCompleted} setDisplay={props.setDisplay} deletePoints={props.deletePoints} setSavingGoals={setSavingGoals} newStatusSavingGoal={props.newStatusSavingGoal} profile={props.profile} userId={props.userId} addStatus={props.addStatus} setPoints={props.setPoints} checkTimeGoalsSaving={props.checkTimeGoalsSaving} setDate={setDate} goalsForSelectedDate={goalsForSelectedDate} addStatusNew={props.addStatusNew} />}
    </div>
}

const mapStateToProps = (state) => ({
    timeGoalsSaving: state.goals.timeGoalsSaving,
    userId: state.profile.profile.id,
    profile: state.profile.profile,
    goals: state.goals.goals
})

export default connect(mapStateToProps, { addTextGenerationData, deletePoints, newStatusSavingGoal, addStatusNew, checkTimeGoalsSaving, setPoints, addStatus })(YesterdayConteiner);