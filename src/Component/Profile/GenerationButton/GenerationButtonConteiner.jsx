import React from "react";
import GenerationButton from "./GenerationButton";
import { connect } from "react-redux";
import { addTextGenerationData } from "../../../redux/generation_reducer";

const GenerationButtonConteiner = (props) => {
    const goalsDone = props.goals.filter(g => g.status === "completed")
    const goalsInProgress = props.goals.filter(g => g.status === "in_progress")

    return <div>
        <GenerationButton yesterdayReport={props.yesterdayReport} telegramId={props.telegramId} addTextGenerationData={props.addTextGenerationData} text={props.text} generationTextYesterday={props.generationTextYesterday} goalsInProgress={goalsInProgress} goalsDone={goalsDone} />
    </div>
}

const mapStateToProps = (state) => ({
    goals: state.goals.goals,
    text: state.generation.generationText,
    nerationIsOver: state.generation.nerationIsOver,
    telegramId: state.profile.profile.telegramId,
    yesterdayReport:state.profile.profile.yesterdayReport,
})

export default connect(mapStateToProps, { addTextGenerationData })(GenerationButtonConteiner) 