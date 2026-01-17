import React, { useState, useEffect } from "react";
import c from "./AchievementsMap.module.css";
import { navigator } from "@/utils/Navigators/Navigators";
import { Check } from "lucide-react";

const AchievementsMap = ({
    achievements,
    activeTab,
    setIsModalOpen,
    setIsModalOpenLocked,
}) => {

    const [active, setActive] = useState("common");
    let rarity = null

    const handleModal = (info) => {
        setIsModalOpen({
            active: info.rarity,
            title: info.title,
            gif: info.gif,
            img: info.image,
            points: info.points,
            rarity: rarity,
        });
    };

    const handleModalLocked = (info) => {
        setIsModalOpenLocked({
            active: active,
            title: info.title,
            requirement: info.requirement,
            gif: info.gif,
            points: info.points,
            rarity: rarity,
        });
    };

    const getRarityClass = (rarity) => {
        switch (rarity?.toLowerCase()) {
            case "common":
            case "обычная":
                return c.common;
            case "rare":
            case "редкая":
                return c.rare;
            case "legendary":
            case "легендарная":
                return c.legendary;
            case "epic":
            case "эпическая":
                return c.epic;
            default:
                return c.common;
        }
    };

    const getRarityLabel = (rarity) => {
        switch (rarity?.toLowerCase()) {
            case "common":
            case "обычная":
                return "Обычная";
            case "rare":
            case "редкая":
                return "Редкая";
            case "legendary":
            case "легендарная":
                return "Легендарная";
            case "epic":
            case "эпическая":
                return "Эпическая";
            default:
                return "Обычная";
        }
    };

    const [achievementRarities, setAchievementRarities] = useState(null);

    useEffect(() => {
        const filteredAchievements = achievements.filter((a) => {
            if (activeTab === "Earned" || activeTab === "Заработанные") return a.status === "my";
            if (activeTab === "Все" || activeTab === "All") return true;
            return a.status === "my";
        });

        if (activeTab === "All") {
            const y = filteredAchievements.filter((r) => {
                return r.rarity === active;
            });
            setAchievementRarities(y);
        } else {
            setAchievementRarities(filteredAchievements);
        }
    }, [activeTab, active, achievements]);

    return (
        <div>
            {activeTab === "All" && (
                <div>
                    <div className={c.navigator}>
                        <div className={c.navHighlight}></div>
                        {navigator("common", setActive, active, "Обычные", active)}
                        {navigator("rare", setActive, active, "Редкие", active)}
                        {navigator("legendary", setActive, active, "Легендарные", active)}
                        {navigator("epic", setActive, active, "Эпические", active)}
                    </div>
                </div>
            )}
            <div className={c.container}>
                {achievementRarities?.map((a, index) => {
                    const rarityClass = getRarityClass(a.rarity);
                    const rarityText = getRarityLabel(a.rarity)
                    rarity = rarityText
                    return (
                        <div
                            key={a.id || a.title}
                            className={`${c.card} ${rarityClass}`}
                            onClick={() =>
                                a.status === "my" ? handleModal(a) : handleModalLocked(a)
                            }
                            style={{ animationDelay: `${index * 0.15}s` }}
                        >
                            {
                                a.status === "my" &&
                                <div className={c.check} >
                                    <Check size={20} color="#2e2e2e" />
                                </div>
                            }
                            <div className={c.cardInner}>
                                <div className={c.imageWrapper}>
                                    <img className={c.img} src={a.image} alt={a.title} />
                                </div>
                                <div className={c.ribbon}>
                                    <span>{rarityText}</span>
                                </div>
                                <div className={c.title}>{a.title}</div>
                                <div className={c.points}>{a.points} pts</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AchievementsMap;