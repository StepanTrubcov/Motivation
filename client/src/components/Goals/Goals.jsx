'use client';
import React, { useState, useEffect } from "react";
import c from './Goals.module.css'
import { navigator } from "../../utils/Navigators/Navigators";
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import ModalWindowNewGoals from "./ModalWindowNewGoals/ModalWindowNewGoals";

const Goals = ({NewGoals, completed, inProgress, sportGoals, disciplineGoals, spiritualityGoals, selfDevelopmentGoals, userId }) => {
    const { t } = useLanguage();
    const { isOpen: isTutorialOpen, currentStep, nextStep, setCreateGoalModalTutorialPhase, lastCreatedGoalCategory } = useTutorial();
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
        if (step === 'goals-find-added' || step === 'goals-take-added') {
            setActiveTab('Available');
            if (lastCreatedGoalCategory && tabsSections.includes(lastCreatedGoalCategory)) {
                setActiveTabSection(lastCreatedGoalCategory);
            }
        }
        if (step === 'goals-delete' || step === 'goals-delete-intro') setActiveTab('Completed');
    }, [isTutorialOpen, currentStep?.id, lastCreatedGoalCategory]);

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
                <button
                    onClick={() => {
                        setOpenModal('q');
                        if (isTutorialOpen && currentStep?.id === 'goals-create') {
                            setCreateGoalModalTutorialPhase?.('name');
                        }
                    }}
                    className={c.button}
                    data-tutorial-id="goals-create"
                >+</button>
            )}
        </div>
        <ModalWindowNewGoals
            NewGoals={NewGoals}
            isModalOpen={isModalOpen}
            closeModal={() => {
                setOpenModal(null);
                setCreateGoalModalTutorialPhase?.(null);
            }}
            userId={userId}
        />
        <div className={`${c.navigator} ${c[`tab-${activeIndex}`]}`}>
            <div className={c.navHighlight}></div>
            {navigator("Completed", setActiveTab, activeTab, t('completed'), "active", "goals-completed")}
            {navigator("InProgress", setActiveTab, activeTab, t('inProgress'), "active", "goals-in-progress")}
            {navigator("Available", setActiveTab, activeTab, t('available'), "active", "goals-available")}
        </div>
        {
            activeTab === "Completed" && <div data-tutorial-id="goals-delete">{completed}</div> || activeTab === "InProgress" && inProgress || activeTab === "Available" && <div data-tutorial-id="goals-take-one">
                <div>
                    <div className={`${c.navigatorSection} ${c[`tab-${activeTabIndex}`]}`} data-tutorial-id="goals-choose-category">
                        <div className={c.navHighlightSection}></div>
                        {navigator("Sport", handleCategoryClick, activeTabSection, t('sport'), "active")}
                        {navigator("Discipline", handleCategoryClick, activeTabSection, t('discipline'), "active")}
                        {navigator("Spirituality", handleCategoryClick, activeTabSection, t('spirituality'), "active")}
                        {navigator("Self_development", handleCategoryClick, activeTabSection, t('selfDevelopment'), "active")}
                    </div>
                </div>
                <div data-tutorial-id="goals-find-added-list">
                    {activeTabSection === "Sport" && sportGoals || activeTabSection === "Discipline" && disciplineGoals || activeTabSection === "Spirituality" && spiritualityGoals || activeTabSection === "Self_development" && selfDevelopmentGoals}
                </div>
            </div>
        }
    </div>
}

export default Goals;