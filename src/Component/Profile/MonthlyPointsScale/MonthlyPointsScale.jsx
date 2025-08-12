import React from "react";
import c from "./MonthlyPointsScale.module.css";

const MonthlyPointsScale = ({ totalPoints }) => {
    const monthlyGoal = 1000;
    const progress = Math.min((totalPoints / monthlyGoal) * 100, 100);

    return <div className={c.points_scale}>
        <div className={c.progress_bar}>
            <div
                className={c.progress_fill}
                style={{ width: `${progress}%` }}
            ></div>
        </div>
        <div className={c.points_header} >
                {totalPoints}/{monthlyGoal}
            </div>
    </div>
};

export default MonthlyPointsScale;