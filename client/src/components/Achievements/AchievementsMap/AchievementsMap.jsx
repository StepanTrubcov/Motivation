import React, { useState, useEffect, useMemo } from "react";
import c from "./AchievementsMap.module.css";
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import { translateAchievements, getAchievementTranslation, achievementsTranslations } from '@/utils/achievementsTranslations';
import { resolveAchievementImage } from '@/lib/achievementImages';
import { Check } from "lucide-react";

const AchievementsMap = ({
    achievements,
    activeTab,
    setIsModalOpen,
    setIsModalOpenLocked,
}) => {
    const { t, language } = useLanguage();
    const { currentStep, onTutorialActionDone, isOpen: isTutorialOpen } = useTutorial();
    const [active, setActive] = useState("common");

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
            const retryTranslated = translateAchievements(achievementsCopy, language);
            return Array.isArray(retryTranslated) && retryTranslated.length === achievements.length 
                ? retryTranslated 
                : achievementsCopy;
        } catch (error) {
            console.error('Error translating achievements:', error);
            return achievements;
        }
    }, [achievements, language]);

    useEffect(() => {
        if (isTutorialOpen && currentStep?.id === 'achievements-cards') {
            const locked = translatedAchievements.find(a => a.status !== 'my');
            if (locked?.rarity) setActive(locked.rarity);
        }
    }, [isTutorialOpen, currentStep?.id, translatedAchievements]);

    const handleModal = (info) => {
        if (!info) return;
        if (currentStep?.id === 'achievements-earned-choose') {
            onTutorialActionDone('click_achievement');
        }
        // Убеждаемся, что используем переведенные данные
        setIsModalOpen({
            active: info.rarity,
            title: info.title || '',
            description: info.description || '',
            gif: info.gif || '',
            img: resolveAchievementImage(info.image, info) || '',
            rarity: info.rarity || '',
            id: info.id,
            earnedAt: info.earnedAt || info.updatedAt || null,
        });
    };

    const handleModalLocked = (info) => {
        if (!info) return;
        if (currentStep?.id === 'achievements-cards') {
            onTutorialActionDone('open_locked_achievement');
        }
        // Убеждаемся, что используем переведенные данные
        setIsModalOpenLocked({
            active: active,
            title: info.title || '',
            description: info.description || '',
            requirement: info.requirement || '',
            progress: info.progress,
            type: info.type,
            goalIds: info.goalIds || [],
            gif: info.gif || '',
            img: resolveAchievementImage(info.image, info) || '',
            rarity: info.rarity || '',
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
        const key = rarity?.toLowerCase();
        const russianLabels = {
            common: 'Обычная',
            'обычная': 'Обычная',
            rare: 'Редкая',
            'редкая': 'Редкая',
            legendary: 'Легендарная',
            'легендарная': 'Легендарная',
            epic: 'Эпическая',
            'эпическая': 'Эпическая',
        };

        if (language === 'ru' && russianLabels[key]) return russianLabels[key];

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
                <div className={c.rarityTabs} role="tablist" aria-label={language === 'en' ? 'Achievement rarity' : 'Категория ачивок'} data-tutorial-id="achievements-rarities">
                    {[
                        ['common', t('common')],
                        ['rare', t('rare')],
                        ['legendary', t('legendary')],
                        ['epic', t('epic')],
                    ].map(([rarity, label]) => (
                        <button
                            key={rarity}
                            type="button"
                            role="tab"
                            aria-selected={active === rarity}
                            className={`${c.rarityTab} ${c[`rarityTab-${rarity}`]} ${active === rarity ? c.rarityTabActive : ''}`}
                            onClick={() => setActive(rarity)}
                        >
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            )}
            <div className={c.container} data-tutorial-id={activeTab === 'Earned' ? 'achievements-earned-cards' : 'achievements-cards'}>
                {achievementRarities && Array.isArray(achievementRarities) && achievementRarities.length > 0 ? (
                    achievementRarities.map((a, index) => {
                        if (!a) return null;

                        const rarityClass = getRarityClass(a.rarity);
                        const rarityText = getRarityLabel(a.rarity)
                        const displayTitle = a.title || '';
                        const earnedDate = a.status === 'my' && (a.earnedAt || a.updatedAt)
                            ? new Date(a.earnedAt || a.updatedAt).toLocaleDateString('ru-RU', {
                                day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC',
                            })
                            : '';
                        const progress = a.progress;
                        const progressLabel = progress
                            ? language === 'en'
                                ? progress.kind === 'level'
                                    ? `Level ${progress.current} of ${progress.target}`
                                    : progress.kind === 'time'
                                        ? `${progress.current} of ${progress.target} days`
                                        : progress.kind === 'streak'
                                            ? `${progress.current} of ${progress.target} consecutive days`
                                        : progress.kind === 'collection'
                                            ? `${progress.current} of ${progress.target} achievements`
                                            : progress.kind === 'category'
                                                ? `${progress.current} of ${progress.target} categories`
                                            : `${progress.current} of ${progress.target} completions`
                                : progress.kind === 'level'
                                    ? `Уровень ${progress.current} из ${progress.target}`
                                    : progress.kind === 'time'
                                        ? `${progress.current} из ${progress.target} дней`
                                        : progress.kind === 'streak'
                                            ? `${progress.current} из ${progress.target} дней подряд`
                                        : progress.kind === 'collection'
                                            ? `${progress.current} из ${progress.target} ачивок`
                                        : progress.kind === 'category'
                                            ? `${progress.current} из ${progress.target} категорий`
                                            : `${progress.current} из ${progress.target} выполнений`
                            : '';

                        return (
                            <button
                                type="button"
                                key={a.id || a.title || index}
                                className={`${c.card} ${rarityClass}`}
                                onClick={() =>
                                    isTutorialOpen && currentStep?.id === 'achievements-cards' && a.status === 'my' ? undefined : a.status === "my" ? handleModal(a) : handleModalLocked(a)
                                }
                                aria-label={`${displayTitle}, ${rarityText}${a.status === 'my' ? `, ${language === 'en' ? 'Earned' : 'Получено'}` : ''}`}
                            >
                                {a.status === "my" && (
                                    <span className={c.checkBadge} aria-hidden="true">
                                        <Check size={23} strokeWidth={3} />
                                    </span>
                                )}
                                <div className={c.cardInner}>
                                    <div className={`${c.imageWrapper} ${rarityClass}`}>
                                        <img className={c.img} src={resolveAchievementImage(a.image, a)} alt="" loading="lazy" decoding="async" />
                                    </div>
                                    <div className={c.cardContent}>
                                        <div className={c.title}>{displayTitle}</div>
                                        {a.status === "my" ? (
                                            <div className={c.earned}>
                                                <span>{earnedDate}</span>
                                            </div>
                                        ) : progress ? (
                                            <div className={c.progressBlock}>
                                                <div className={c.progressRow}>
                                                    <div
                                                        className={c.progressTrack}
                                                        role="progressbar"
                                                        aria-label={language === 'en' ? `${displayTitle} progress` : `Прогресс: ${displayTitle}`}
                                                        aria-valuemin={0}
                                                        aria-valuemax={100}
                                                        aria-valuenow={progress.percent}
                                                    >
                                                        <span style={{ width: `${progress.percent}%` }} />
                                                    </div>
                                                    <span className={c.percent}>{progress.percent}%</span>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                ) : null}
            </div>
        </div>
    );
};

export default AchievementsMap;
