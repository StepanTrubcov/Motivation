import React, { useState, useEffect, useMemo } from "react";
import c from "./AchievementsMap.module.css";
import { navigator } from "@/utils/Navigators/Navigators";
import { useLanguage } from '@/context/LanguageContext';
import { translateAchievements, getAchievementTranslation, achievementsTranslations } from '@/utils/achievementsTranslations';
import { Check } from "lucide-react";

const AchievementsMap = ({
    achievements,
    activeTab,
    setIsModalOpen,
    setIsModalOpenLocked,
}) => {
    const { t, language } = useLanguage();
    const [active, setActive] = useState("common");
    let rarity = null

    // Переводим весь массив achievements один раз с надежной проверкой
    const translatedAchievements = useMemo(() => {
        if (!achievements || !Array.isArray(achievements) || achievements.length === 0) {
            return [];
        }
        
        try {
            // Создаем глубокую копию массива для безопасности
            const achievementsCopy = achievements.map(a => ({ ...a }));
            const translated = translateAchievements(achievementsCopy, language);
            
            // Убеждаемся, что результат валидный и имеет ту же длину
            if (Array.isArray(translated) && translated.length === achievements.length) {
                // Дополнительная проверка: убеждаемся, что все элементы переведены
                const allTranslated = translated.every((item, index) => {
                    const original = achievements[index];
                    return item && original && (
                        item.title !== undefined && 
                        item.requirement !== undefined
                    );
                });
                
                if (allTranslated) {
                    return translated;
                }
            }
            
            // Если что-то пошло не так, пробуем перевести еще раз
            console.warn('Translation result invalid, retrying...', {
                originalLength: achievements.length,
                translatedLength: translated?.length
            });
            const retryTranslated = translateAchievements(achievementsCopy, language);
            return Array.isArray(retryTranslated) && retryTranslated.length === achievements.length 
                ? retryTranslated 
                : achievementsCopy;
        } catch (error) {
            console.error('Error translating achievements:', error);
            return achievements;
        }
    }, [achievements, language]);

    const handleModal = (info) => {
        if (!info) return;
        
        // Убеждаемся, что используем переведенные данные
        setIsModalOpen({
            active: info.rarity,
            title: info.title || '',
            gif: info.gif || '',
            img: info.image || '',
            points: info.points || 0,
            rarity: rarity,
            id: info.id,
        });
    };

    const handleModalLocked = (info) => {
        if (!info) return;
        
        // Убеждаемся, что используем переведенные данные
        setIsModalOpenLocked({
            active: active,
            title: info.title || '',
            requirement: info.requirement || '',
            gif: info.gif || '',
            points: info.points || 0,
            rarity: rarity,
            id: info.id,
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
                return t('common');
            case "rare":
            case "редкая":
                return t('rare');
            case "legendary":
            case "легендарная":
                return t('legendary');
            case "epic":
            case "эпическая":
                return t('epic');
            default:
                return t('common');
        }
    };

    const [achievementRarities, setAchievementRarities] = useState(null);

    useEffect(() => {
        // Убеждаемся, что translatedAchievements валидный массив
        if (!translatedAchievements || !Array.isArray(translatedAchievements) || translatedAchievements.length === 0) {
            setAchievementRarities([]);
            return;
        }

        // Фильтруем достижения и убеждаемся, что переводы применены
        const filteredAchievements = translatedAchievements
            .filter((a) => {
                if (!a) return false;
                if (activeTab === "Earned" || activeTab === "Заработанные") return a.status === "my";
                if (activeTab === "Все" || activeTab === "All") return true;
                return a.status === "my";
            })
            .map(a => {
                // Дополнительная проверка: если title все еще на русском при английском языке, пытаемся перевести
                if (language !== 'ru' && a.title && a.id) {
                    const ruTranslations = achievementsTranslations.ru;
                    const isRussianTitle = Object.values(ruTranslations).some(
                        trans => trans.title === a.title
                    );
                    
                    // Если title все еще на русском, пытаемся перевести по ID
                    if (isRussianTitle) {
                        const id = a.id.toString();
                        const translatedTitle = getAchievementTranslation(id, language, 'title');
                        const translatedRequirement = getAchievementTranslation(id, language, 'requirement');
                        
                        if (translatedTitle && translatedTitle.trim() !== '') {
                            return {
                                ...a,
                                title: translatedTitle,
                                requirement: translatedRequirement && translatedRequirement.trim() !== '' 
                                    ? translatedRequirement 
                                    : a.requirement
                            };
                        }
                    }
                }
                
                return a;
            });

        if (activeTab === "All") {
            const y = filteredAchievements.filter((r) => {
                return r && r.rarity === active;
            });
            setAchievementRarities(y);
        } else {
            setAchievementRarities(filteredAchievements);
        }
    }, [activeTab, active, translatedAchievements, language]);

    return (
        <div>
            {activeTab === "All" && (
                <div>
                    <div className={c.navigator} data-tutorial-id="achievements-rarities">
                        <div className={c.navHighlight}></div>
                        {navigator("common", setActive, active, t('common'), active)}
                        {navigator("rare", setActive, active, t('rare'), active)}
                        {navigator("legendary", setActive, active, t('legendary'), active)}
                        {navigator("epic", setActive, active, t('epic'), active)}
                    </div>
                </div>
            )}
            <div className={c.container} data-tutorial-id="achievements-cards">
                {achievementRarities && Array.isArray(achievementRarities) && achievementRarities.length > 0 ? (
                    achievementRarities.map((a, index) => {
                        if (!a) return null;
                        
                        const rarityClass = getRarityClass(a.rarity);
                        const rarityText = getRarityLabel(a.rarity)
                        rarity = rarityText
                        
                        // Убеждаемся, что title переведен
                        const displayTitle = a.title || '';
                        
                        return (
                            <div
                                key={a.id || a.title || index}
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
                                        <img className={c.img} src={a.image} alt={displayTitle} />
                                    </div>
                                    <div className={c.ribbon}>
                                        <span>{rarityText}</span>
                                    </div>
                                    <div className={c.title}>{displayTitle}</div>
                                    <div className={c.points}>{a.points || 0} {t('pts')}</div>
                                </div>
                            </div>
                        );
                    })
                ) : null}
            </div>
        </div>
    );
};

export default AchievementsMap;