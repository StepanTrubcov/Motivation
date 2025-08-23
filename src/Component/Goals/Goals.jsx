import React, { useState } from "react";
import c from './Goals.module.css'
import { navigator } from "../../utils/Navigators/Navigators";

const Goals = ({ completed, inProgress, available }) => {

    const tabs = ["Completed", "InProgress", "Available"];
    const [activeTab, setActiveTab] = useState("Completed");

    const activeIndex = tabs.indexOf(activeTab);

    return <div>
        <div className={c.name} >Цели</div>
        <div className={`${c.navigator} ${c[`tab-${activeIndex}`]}`}>
            <div className={c.navHighlight}></div>
            {navigator("Completed", setActiveTab, activeTab, "Завершенные")}
            {navigator("InProgress", setActiveTab, activeTab, "В процессе")}
            {navigator("Available", setActiveTab, activeTab, "Доступные")}
        </div>
        {
            activeTab === "Completed" && completed || activeTab === "InProgress" && inProgress || activeTab === "Available" && available
        }
    </div>
}

export default Goals;