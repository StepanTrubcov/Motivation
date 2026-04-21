'use client';
import React, { useEffect, useRef } from "react";
import c from "./MonthlyPointsScale.module.css";
import { toast } from "react-hot-toast";
import { LEVEL_THRESHOLDS, calcLevelFromPts } from "@/utils/levels";

const MonthlyPointsScale = ({ userPoints = 0 }) => {
    const levels = LEVEL_THRESHOLDS;
    const currentLevel = calcLevelFromPts(userPoints);

    const levelMin = levels[currentLevel - 1];
    const levelMax = levels[currentLevel];
    const progress = Math.min(((userPoints - levelMin) / (levelMax - levelMin)) * 100, 100);

    const prevLevel = useRef(currentLevel)
    return (
        <div className={c.points_scale} data-tutorial-id="points-scale">
            <div className={c.level}>{currentLevel}<div className={c.level_text} >lvl</div></div>
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
