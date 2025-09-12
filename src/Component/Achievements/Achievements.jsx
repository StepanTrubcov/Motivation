import React, { useState } from "react";
import { navigator } from "../../utils/Navigators/Navigators";
import c from './Achievements.module.css'
import Navigator from "./Navigator/Navigator";
import AchievementsMap from "./AchievementsMap/AchievementsMap";
import ModalWindow from "../../utils/ModalWindow/ModalWindow";

const Achievements = (props) => {

    const [isModalOpen, setIsModalOpen] = useState(null);
    const [isModalOpenLocked, setIsModalOpenLocked] = useState(null);

    const tabs = ["Earned", "All"];
    const [activeTab, setActiveTab] = useState("Earned");
    const activeIndex = tabs.indexOf(activeTab);

    const closeModal = () => {
        setIsModalOpen(null);
    };

    const closeModalLocked = () => {
        setIsModalOpenLocked(null);
    };

    return <div>
        <div className={c.title} >
            Достижения
        </div>
        <Navigator activeIndex={activeIndex} activeTab={activeTab} setActiveTab={setActiveTab} />
        <AchievementsMap activeTab={activeTab} setIsModalOpenLocked={setIsModalOpenLocked} setIsModalOpen={setIsModalOpen} achievements={props.assignments} />
        <ModalWindow
            isModalOpen={isModalOpen}
            buttonText="Понятно"
            addNewStatus={closeModal}
            closeModal={closeModal}
        />
        <ModalWindow
            isModalOpen={isModalOpenLocked}
            buttonText="Действовать"
            addNewStatus={closeModalLocked}
            closeModal={closeModalLocked}
        />
    </div>
}

export default Achievements;