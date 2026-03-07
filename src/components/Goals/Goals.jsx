'use client';
import React, { useState, useEffect } from "react";
import c from './Goals.module.css'
import { navigator } from "../../utils/Navigators/Navigators";
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import ModalWindowNewGoals from "./ModalWindowNewGoals/ModalWindowNewGoals";

const Goals = ({NewGoals, completed, inProgress, sportGoals, disciplineGoals, spiritualityGoals, selfDevelopmentGoals, userId }) => {
    const { t } = useLanguage();
    const { isOpen: isTutorialOpen, currentStep, nextStep } = useTutorial();
    const [isModalOpen, setOpenModal] = useState(null);

    const tabs = ["Completed", "InProgress", "Available"];
    const [activeTab, setActiveTab] = useState("Completed");

    const tabsSections = ["Sport", "Discipline", "Spirituality", "Self_development"];
    const [activeTabSection, setActiveTabSection] = useState("Sport");

    useEffect(() => {
        if (!isTutorialOpen || !currentStep?.id?.startsWith('goals-')) return;
        const step = currentStep.id;
        if (step === 'goals-available' || step === 'goals-take-one' || step === 'goals-choose-category') setActiveTab('Available');
        if (step === 'goals-create') setActiveTab('Available');
        if (step === 'goals-delete') setActiveTab('InProgress');
    }, [isTutorialOpen, currentStep?.id]);

    const handleCategoryClick = (category) => {
        if (isTutorialOpen && currentStep?.id === 'goals-choose-category') {
            nextStep();
        }
        setActiveTabSection(category);
    };

    const activeIndex = tabs.indexOf(activeTab);
    const activeTabIndex = tabsSections.indexOf(activeTabSection);

    return <div className={c.container} data-tutorial-id="goals-intro">
        <div className={c.nameContainer}>
            <div className={c.centeredText}>{t('goals')}</div>
            {activeTab === "Available" && (
                <button onClick={() => setOpenModal('q')} className={c.button} data-tutorial-id="goals-create">+</button>
            )}
        </div>
        <ModalWindowNewGoals NewGoals={NewGoals} isModalOpen={isModalOpen} closeModal={() => setOpenModal(null)} userId={userId} />
        <div className={`${c.navigator} ${c[`tab-${activeIndex}`]}`}>
            <div className={c.navHighlight}></div>
            {navigator("Completed", setActiveTab, activeTab, t('completed'), "active", "goals-completed")}
            {navigator("InProgress", setActiveTab, activeTab, t('inProgress'), "active", "goals-in-progress")}
            {navigator("Available", setActiveTab, activeTab, t('available'), "active", "goals-available")}
        </div>
        {
            activeTab === "Completed" && completed || activeTab === "InProgress" && <div data-tutorial-id="goals-delete">{inProgress}</div> || activeTab === "Available" && <div data-tutorial-id="goals-take-one">
                <div>
                    <div className={`${c.navigatorSection} ${c[`tab-${activeTabIndex}`]}`} data-tutorial-id="goals-choose-category">
                        <div className={c.navHighlightSection}></div>
                        {navigator("Sport", handleCategoryClick, activeTabSection, t('sport'), "active")}
                        {navigator("Discipline", handleCategoryClick, activeTabSection, t('discipline'), "active")}
                        {navigator("Spirituality", handleCategoryClick, activeTabSection, t('spirituality'), "active")}
                        {navigator("Self_development", handleCategoryClick, activeTabSection, t('selfDevelopment'), "active")}
                    </div>
                </div>
                {activeTabSection === "Sport" && sportGoals || activeTabSection === "Discipline" && disciplineGoals || activeTabSection === "Spirituality" && spiritualityGoals || activeTabSection === "Self_development" && selfDevelopmentGoals}
            </div>
        }
    </div>
}

export default Goals;