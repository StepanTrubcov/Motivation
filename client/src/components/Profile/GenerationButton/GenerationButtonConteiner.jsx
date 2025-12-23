import React from "react";
import GenerationButton from "./GenerationButton";
import { connect } from "react-redux";
import { addTextGenerationData } from "../../../redux/generation_reducer";
import toast from "react-hot-toast";

const GenerationButtonConteiner = (props) => {
    const goalsDone = props.goals.filter(g => g.status === "completed")
    const goalsInProgress = props.goals.filter(g => g.status === "in_progress")


    return <div>
        <GenerationButton profile={props.profile} yesterdayReport={props.yesterdayReport} telegramId={props.telegramId} addTextGenerationData={props.addTextGenerationData} text={props.text} generationTextYesterday={props.generationTextYesterday} goalsInProgress={goalsInProgress} goalsDone={goalsDone} />
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