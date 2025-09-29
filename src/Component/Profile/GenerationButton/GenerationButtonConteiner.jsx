import React from "react";
import GenerationButton from "./GenerationButton";
import { connect } from "react-redux";
import { addTextGenerationData } from "../../../redux/generation_reducer";

const GenerationButtonConteiner = (props) => {

    const goalsDone = props.goals.filter(g => g.status === "done")
    const goalsInProgress = props.goals.filter(g => g.status === "in_progress")

    return <div>
        <GenerationButton nerationIsOver={props.nerationIsOver} addTextGenerationData={props.addTextGenerationData} text={props.text} goalsInProgress={goalsInProgress} goalsDone={goalsDone} />
    </div>
}

const mapStateToProps = (state) => ({
    goals: state.goals.goals,
    text: state.generation.generationText,
    nerationIsOver: state.generation.nerationIsOver,
})

export default connect(mapStateToProps, { addTextGenerationData })(GenerationButtonConteiner) 