'use client';
import React, { useState, useEffect, useRef } from "react";
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
    const prevStepIdRef = useRef(currentStep?.id);

    useEffect(() => {
        if (!isTutorialOpen || !currentStep?.id?.startsWith('achievements-')) return;
        const step = currentStep.id;
        if (step === 'achievements-earned' || step === 'achievements-earned-choose' || step === 'achievements-earned-modal') setActiveTab('Earned');
        if (step === 'achievements-all' || step === 'achievements-rarities' || step === 'achievements-cards' || step === 'achievements-how-to-get' || step === 'tutorial-complete') setActiveTab('All');
    }, [isTutorialOpen, currentStep?.id]);

    useEffect(() => {
        if (prevStepIdRef.current === 'achievements-earned-modal' && currentStep?.id !== 'achievements-earned-modal') {
            setIsModalOpen(null);
        }
        if (prevStepIdRef.current === 'achievements-how-to-get' && currentStep?.id !== 'achievements-how-to-get') {
            setIsModalOpenLocked(null);
        }
        prevStepIdRef.current = currentStep?.id;
    }, [currentStep?.id]);

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
