import React from "react";
import { navigator } from "../../../utils/Navigators/Navigators";
import c from './Navigator.module.css'

const Navigator = ({ activeIndex, setActiveTab, activeTab }) => {
    return <div className={`${c.navigator} ${c[`tab-${activeIndex}`]}`}>
        <div className={c.navHighlight}></div>
        {navigator("Earned", setActiveTab, activeTab, "Мои", "active")}
        {navigator("All", setActiveTab, activeTab, "Все", "active")}
    </div>
}

export default Navigator;