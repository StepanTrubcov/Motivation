import React, { useMemo } from "react";
import GenerationButton from "./GenerationButton";
import { connect } from "react-redux";
import { useLanguage } from '@/context/LanguageContext';
import { translateGoals } from '@/utils/goalsTranslations';
import { addTextGenerationData } from "../../../redux/generation_reducer";
import toast from "react-hot-toast";

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

const GenerationButtonConteiner = (props) => {
    const { language } = useLanguage();
    
    // Переводим цели перед фильтрацией
    const translatedGoals = useMemo(() => {
        if (!props.goals || !Array.isArray(props.goals) || props.goals.length === 0) {
            return [];
        }
        try {
            const goalsCopy = props.goals.map(g => ({ ...g }));
            const translated = translateGoals(goalsCopy, language);
            return Array.isArray(translated) && translated.length === props.goals.length 
                ? translated 
                : goalsCopy;
        } catch (error) {
            console.error('Error translating goals in GenerationButtonConteiner:', error);
            return props.goals;
        }
    }, [props.goals, language]);
    
    const goalsDone = translatedGoals.filter(g => g.status === "completed")
    const goalsInProgress = translatedGoals.filter(g => g.status === "in_progress")
    const series = useMemo(() => computeSeries(props.timeSavingGoals), [props.timeSavingGoals])

    return <div>
        <GenerationButton profile={props.profile} yesterdayReport={props.yesterdayReport} telegramId={props.telegramId} addTextGenerationData={props.addTextGenerationData} text={props.text} generationTextYesterday={props.generationTextYesterday} goalsInProgress={goalsInProgress} goalsDone={goalsDone} series={series} />
    </div>
}

const mapStateToProps = (state) => ({
    profile: state.profile.profile,
    goals: state.goals.goals,
    timeSavingGoals: state.goals.timeGoalsSaving,
    text: state.generation.generationText,
    nerationIsOver: state.generation.nerationIsOver,
    telegramId: state.profile.profile.telegramId,
    yesterdayReport: state.profile.profile.yesterdayReport,
})

export default connect(mapStateToProps, { addTextGenerationData })(GenerationButtonConteiner) 