import React from "react";
import c from "./MonthlyPointsScale.module.css";

const MonthlyPointsScale = ({ userPoints = 0 }) => {

    const levels = [
        0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500,
        5500, 6600, 7800, 9100, 10500, 12000, 13600, 15300, 17100, 19000, Infinity
    ];


    let currentLevel = 1;
    for (let i = 0; i < levels.length - 1; i++) {
        if (userPoints < levels[i + 1]) {
            currentLevel = i + 1;
            break;
        }
    }

    const levelMin = levels[currentLevel - 1];
    const levelMax = levels[currentLevel];
    const progress = Math.min(((userPoints - levelMin) / (levelMax - levelMin)) * 100, 100);

    return (
        <div className={c.points_scale}>
            <div className={c.level}>{currentLevel}</div>
            <div className={c.progress_container}>
                <div className={c.progress_bar}>
                    <div
                        className={c.progress_fill}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className={c.next} >
                    <div className={c.points_text_wrapper}>
                        <div className={c.points_text}>
                            {userPoints}/{levelMax}
                        </div>
                    </div>
                    <div className={c.nextLevel}>
                        {currentLevel + 1}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlyPointsScale;