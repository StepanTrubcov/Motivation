import React from "react";
import c from './TodaysGoals.module.css'

const TodaysGoals = ({ inProgress, completed }) => {
    return <div>
        <div className={c.name} >
            Сегодняшние цели
        </div>
        <div className={c.goals} >
            {completed}
            {inProgress}
        </div>
    </div>
}

export default TodaysGoals;