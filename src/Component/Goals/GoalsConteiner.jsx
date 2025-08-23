import React, { useState } from "react";
import Goals from "./Goals";
import { connect } from "react-redux";
import filter from "../../utils/Filter/filter";
import { addStatusNew } from "../../redux/goals_reducer";
import { toast } from "react-hot-toast";


const GoalsConteiner = (props) => {

    const addNewStatus = (goalId) => {
        props.addStatusNew(goalId, props.userId, "in_progress")
        toast.success("Цели добавлены\n в раздел «В процессе» ✅");
    }

    return <Goals completed={filter(props.goals.goals, "done", null, 'https://i.postimg.cc/g00CMHm0/png-clipart-information-management-service-compute-no-bg-preview-carve-photos.png')} inProgress={filter(props.goals.goals, "in_progress")} available={filter(props.goals.goals, "not_started", addNewStatus)} />
}

const mapStateToProps = (state) => ({
    goals: state.goals,
    userId: state.profile.profile.id
})

export default connect(mapStateToProps, { addStatusNew })(GoalsConteiner);