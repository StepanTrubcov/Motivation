import React from "react";
import { navigator } from "../../../utils/Navigators/Navigators";
import c from './Navigator.module.css'

const Navigator = ({ activeIndex, setActiveTab, activeTab }) => {
    return <div className={`${c.navigator} ${c[`tab-${activeIndex}`]}`}>
        <div className={c.navHighlight}></div>
        {navigator("Earned", setActiveTab, activeTab, "Заработанные")}
        {navigator("All", setActiveTab, activeTab, "Все")}
    </div>
}

export default Navigator;