'use client';
import React, { useState, useEffect } from "react";
import c from './Goals.module.css'
import { navigator } from "../../utils/Navigators/Navigators";
import ModalWindowNewGoals from "./ModalWindowNewGoals/ModalWindowNewGoals";

const Goals = ({NewGoals, completed, inProgress, sportGoals, disciplineGoals, spiritualityGoals, selfDevelopmentGoals, userId }) => {

    const [isModalOpen, setOpenModal] = useState(null);

    const tabs = ["Completed", "InProgress", "Available"];
    const [activeTab, setActiveTab] = useState("Completed");

    const tabsSections = ["Sport", "Discipline", "Spirituality", "Self_development"];
    const [activeTabSection, setActiveTabSection] = useState("Sport");

    const activeIndex = tabs.indexOf(activeTab);
    const activeTabIndex = tabsSections.indexOf(activeTabSection);

    return <div className={c.container} >
        <div className={c.nameContainer}>
            <div className={c.centeredText}>Цели</div>
            {activeTab === "Available" && (
                <button onClick={() => setOpenModal('q')} className={c.button}>+</button>
            )}
        </div>
        <ModalWindowNewGoals NewGoals={NewGoals} isModalOpen={isModalOpen} closeModal={() => setOpenModal(null)} userId={userId} />
        <div className={`${c.navigator} ${c[`tab-${activeIndex}`]}`}>
            <div className={c.navHighlight}></div>
            {navigator("Completed", setActiveTab, activeTab, "Завершенные")}
            {navigator("InProgress", setActiveTab, activeTab, "В процессе")}
            {navigator("Available", setActiveTab, activeTab, "Доступные")}
        </div>
        {
            activeTab === "Completed" && completed || activeTab === "InProgress" && inProgress || activeTab === "Available" && <div>
                <div>
                    <div className={`${c.navigatorSection} ${c[`tab-${activeTabIndex}`]}`}>
                        <div className={c.navHighlightSection}></div>
                        {navigator("Sport", setActiveTabSection, activeTabSection, "Спорт")}
                        {navigator("Discipline", setActiveTabSection, activeTabSection, "Дисциплина")}
                        {navigator("Spirituality", setActiveTabSection, activeTabSection, "Духовность")}
                        {navigator("Self_development", setActiveTabSection, activeTabSection, "Саморазвитие")}
                    </div>
                </div>
                {activeTabSection === "Sport" && sportGoals || activeTabSection === "Discipline" && disciplineGoals || activeTabSection === "Spirituality" && spiritualityGoals || activeTabSection === "Self_development" && selfDevelopmentGoals}
            </div>
        }
    </div>
}

export default Goals;