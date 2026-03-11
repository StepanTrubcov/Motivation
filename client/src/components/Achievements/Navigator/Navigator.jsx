import React from "react";
import { navigator } from "../../../utils/Navigators/Navigators";
import { useLanguage } from '@/context/LanguageContext';
import c from './Navigator.module.css'

const Navigator = ({ activeIndex, setActiveTab, activeTab, disableAllTab }) => {
    const { t } = useLanguage();
    return <div className={`${c.navigator} ${c[`tab-${activeIndex}`]}`} data-tutorial-id="achievements-earned">
        <div className={c.navHighlight}></div>
        {navigator("Earned", setActiveTab, activeTab, t('myAchievements'), "active", "achievements-earned")}
        {navigator("All", setActiveTab, activeTab, t('allAchievements'), "active", "achievements-all", disableAllTab)}
    </div>
}

export default Navigator;