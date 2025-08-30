import React, { useState } from "react";
import { navigator } from "../../utils/Navigators/Navigators";
import c from './Achievements.module.css'

const Achievements = (props) => {
    const tabs = ["Earned", "All"];
    const [activeTab, setActiveTab] = useState("Earned");
    const activeIndex = tabs.indexOf(activeTab);
    return <div>
        <div className={c.title} >
            Достижения
        </div>
        <div className={`${c.navigator} ${c[`tab-${activeIndex}`]}`}>
            <div className={c.navHighlight}></div>
            {navigator("Earned", setActiveTab, activeTab, "Заработанные")}
            {navigator("All", setActiveTab, activeTab, "Все")}
        </div>
    </div>
}

export default Achievements;