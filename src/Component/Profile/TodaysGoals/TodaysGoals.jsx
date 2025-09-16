import React from "react";
import c from './TodaysGoals.module.css'

const TodaysGoals = ({ inProgress }) => {
    return <div>
        <div className={c.name} >
            Сегодняшние цели
        </div>
        <div className={c.goals} >
            {inProgress}
        </div>
    </div>
}

export default TodaysGoals;