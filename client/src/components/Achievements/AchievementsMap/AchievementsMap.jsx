import React from "react";
import c from './AchievementsMap.module.css'


const AchievementsMap = ({ achievements, activeTab, setIsModalOpen, setIsModalOpenLocked }) => {

    const Modal = (info) => {
        setIsModalOpen(info);
    };

    const ModalLocked = (info) => {
        setIsModalOpenLocked({
            title: info.title,
            description: info.requirement,
            image: info.image
        });
    };

    const achievementsMap = achievements.map(a => {
        if (activeTab === 'Earned') {
            if (a.status === "my") {
                return <div className={c.blok} onClick={() => Modal(a)} >
                    <div>
                        <img className={c.img} src={a.image} />
                    </div>
                    <div className={c.title} >
                        {a.title}
                    </div>
                    <div className={c.points} >
                        {a.points} pts
                    </div>
                </div>
            }
        }

        if (activeTab === 'All') {
            if (a.status === "locked") {
                return <div className={c.blok} onClick={() => ModalLocked(a)} >
                    <div>
                        <img className={c.img} src={a.image} />
                    </div>
                    <div className={c.title} >
                        {a.title}
                    </div>
                    <div className={c.points} >
                        {a.points} pts
                    </div>
                </div>
            }
        }
    }
    )

    return <div className={c.achievements} >
        {achievementsMap}
    </div>
}

export default AchievementsMap;