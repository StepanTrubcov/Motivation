'use client';
import React, { useState, useEffect } from "react";
import { navigator } from "../../utils/Navigators/Navigators";
import c from './Achievements.module.css'
import { useTutorial } from '@/context/TutorialContext';
import Navigator from "./Navigator/Navigator";
import AchievementsMap from "./AchievementsMap/AchievementsMap";
import ModalWindowMe from "./ModalWindowMe/ModalWindowMe";
import ModalWindowAchievements from "./ModalWindowAchievements/ModalWindowAchievements";

const Achievements = (props) => {

    const [isModalOpen, setIsModalOpen] = useState(null);
    const [isModalOpenLocked, setIsModalOpenLocked] = useState(null);

    const tabs = ["Earned", "All"];
    const [activeTab, setActiveTab] = useState("Earned");
    const activeIndex = tabs.indexOf(activeTab);

    const { isOpen: isTutorialOpen, currentStep } = useTutorial();
    useEffect(() => {
        if (!isTutorialOpen || !currentStep?.id?.startsWith('achievements-')) return;
        const step = currentStep.id;
        if (step === 'achievements-earned') setActiveTab('Earned');
        if (step === 'achievements-all' || step === 'achievements-rarities' || step === 'achievements-cards') setActiveTab('All');
    }, [isTutorialOpen, currentStep?.id]);

    const closeModal = () => {
        setIsModalOpen(null);
    };

    const closeModalLocked = () => {
        setIsModalOpenLocked(null);
    };

    return <div data-tutorial-id="achievements-intro">
        <Navigator activeIndex={activeIndex} activeTab={activeTab} setActiveTab={setActiveTab} />
        <AchievementsMap activeTab={activeTab} setIsModalOpenLocked={setIsModalOpenLocked} setIsModalOpen={setIsModalOpen} achievements={props.assignments} />
        <ModalWindowMe
            getMakingPicture={props.getMakingPicture}
            username={props.username}
            isModalOpen={isModalOpen}
            addNewStatus={closeModal}
            closeModal={closeModal}
        />
        <ModalWindowAchievements
            isModalOpen={isModalOpenLocked}
            closeModal={closeModalLocked}
        />
    </div>
}

export default Achievements;
