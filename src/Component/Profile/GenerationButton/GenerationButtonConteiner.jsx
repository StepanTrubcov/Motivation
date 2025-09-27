import React from "react";
import GenerationButton from "./GenerationButton";
import { connect } from "react-redux";

const GenerationButtonConteiner = (props) => {

    const goalsDone = props.goals.filter(g => g.status === "done")
    const goalsInProgress = props.goals.filter(g => g.status === "in_progress")

    return <div>
        <GenerationButton goalsInProgress={goalsInProgress} goalsDone={goalsDone} />
    </div>
}

const mapStateToProps = (state) => ({
    goals: state.goals.goals
})

export default connect(mapStateToProps)(GenerationButtonConteiner) 