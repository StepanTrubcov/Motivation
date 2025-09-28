import React, { useEffect, useRef } from "react";
import c from "./MonthlyPointsScale.module.css";
import { toast } from "react-hot-toast";

const MonthlyPointsScale = ({ userPoints = 0 }) => {

    const levels = [
        0, 100, 300, 600, 1000, 1500, 2100, 2800, 3700, 4700,
        5800, 7000, 8300, 9700, 11200, 12800, 14500, 16300, 18200, 20200,
        22300, 24500, 26800, 29200, 31700, 34300, 37000, 39800, 42700, 45700,
        48800, 52000, 55300, 58700, 62200, 65800, 69500, 73300, 77200, 81200,
        85300, 89500, 93800, 98200, 102700, 107300, 112000, 116800, 121700, 126700,
        1000000
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

    const prevLevel = useRef(currentLevel);

    useEffect(() => {
        if (prevLevel.current !== currentLevel) {
            toast.success(`Поздравляем! Вы достигли уровня ${currentLevel}! 🎉`);
            prevLevel.current = currentLevel;
        }
    }, [currentLevel]);

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
