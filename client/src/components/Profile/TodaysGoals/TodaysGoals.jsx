import React from "react";
import c from './TodaysGoals.module.css'

const TodaysGoals = ({ inProgress, completed }) => {

    if (inProgress.length === 0 && completed.length === 0) {
        return <div>
            <div className={c.name} >
                Сегодняшние цели
            </div>
            <div className={c.blok}>У вас нет таких целей</div>
        </div>
    }

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