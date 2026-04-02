import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from '@/context/LanguageContext';
import c from "./Lights.module.css";

const Lights = ({ num, isTodayCompleted }) => {
    const { t } = useLanguage();

    const levelsOfLights = [
        { url: "https://i.postimg.cc/KYgdfzYy/2-1-no-bg-preview-(carve-photos).png", daysMin: 2, daysMax: 9 },
        { url: "https://i.postimg.cc/SRt1ybVn/2-2-no-bg-preview-(carve-photos)-edited-free-(carve-photos).png", daysMin: 10, daysMax: 19 },
        { url: "https://i.postimg.cc/KvRQBWjz/2-3-no-bg-preview-(carve-photos).png", daysMin: 20, daysMax: 35 },
        { url: "https://i.postimg.cc/Sx9rtzcV/2-4-edited-free-(carve-photos).png", daysMin: 36, daysMax: 50 },
        { url: "https://i.postimg.cc/BvB0JtFx/2-5-no-bg-preview-(carve-photos)-edited-free-(carve-photos).png", daysMin: 51, daysMax: 65 },
        { url: "https://i.postimg.cc/wxbQqk2j/2-6-no-bg-preview-(carve-photos).png", daysMin: 66, daysMax: 80 },
        { url: "https://i.postimg.cc/Jhqj9309/2-7-no-bg-preview-(carve-photos).png", daysMin: 81, daysMax: 95 },
        { url: "https://i.postimg.cc/NGVRqjsV/2-8-edited-free-(carve-photos).png", daysMin: 96, daysMax: 110 },
        { url: "https://i.postimg.cc/YSpWf4R3/2-9-no-bg-preview-(carve-photos).png", daysMin: 111, daysMax: 140 },
        { url: "https://i.postimg.cc/Gts8hvL5/2-10-no-bg-preview-(carve-photos).png", daysMin: 141, daysMax: 190 },
    ];

    const grayLightUrl = "https://i.postimg.cc/gJDK9gn6/752049b9-f85f-4d4e-a777-58c12ac42fbd.png";

    const milestones = [2, 5, 10, 30, 60, 100, 120, 150, 180, 210, 240, 270, 300, 330, 365];

    const milestoneTexts = {
        2: {
            title: t('milestone2Title'),
            subtitle: t('milestone2Subtitle')
        },
        5: {
            title: t('milestone4Title'),
            subtitle: t('milestone4Subtitle')
        },
        10: {
            title: t('milestone10Title'),
            subtitle: t('milestone10Subtitle')
        },
        30: {
            title: t('milestone30Title'),
            subtitle: t('milestone30Subtitle')
        },
        60: {
            title: t('milestone60Title'),
            subtitle: t('milestone60Subtitle')
        },
        100: {
            title: t('milestone100Title'),
            subtitle: t('milestone100Subtitle')
        },
        120: {
            title: t('milestone120Title'),
            subtitle: t('milestone120Subtitle')
        },
        150: {
            title: t('milestone150Title'),
            subtitle: t('milestone150Subtitle')
        },
        180: {
            title: t('milestone180Title'),
            subtitle: t('milestone180Subtitle')
        },
        210: {
            title: t('milestone210Title'),
            subtitle: t('milestone210Subtitle')
        },
        240: {
            title: t('milestone240Title'),
            subtitle: t('milestone240Subtitle')
        },
        270: {
            title: t('milestone270Title'),
            subtitle: t('milestone270Subtitle')
        },
        300: {
            title: t('milestone300Title'),
            subtitle: t('milestone300Subtitle')
        },
        330: {
            title: t('milestone330Title'),
            subtitle: t('milestone330Subtitle')
        },
        365: {
            title: t('milestone365Title'),
            subtitle: t('milestone365Subtitle')
        }
    };

    const [showCongrats, setShowCongrats] = useState(false);
    const prevNumRef = useRef(num);

    useEffect(() => {
        if (prevNumRef.current >= 2 && num < 2) {
            try {
                localStorage.removeItem('shownMilestones');
            } catch (e) {
                // localStorage может быть недоступен — не валим UI
            }
            setShowCongrats(false);
            prevNumRef.current = num;
            return;
        }

        if (milestones.includes(num) && isTodayCompleted) {
            const shownMilestones = JSON.parse(localStorage.getItem('shownMilestones') || '[]');
            if (!shownMilestones.includes(num)) {
                setShowCongrats(true);
                localStorage.setItem('shownMilestones', JSON.stringify([...shownMilestones, num]));
            }
        }

        prevNumRef.current = num;
    }, [num, isTodayCompleted]);

    if (num < 2) return <div className={c.Lights}><img className={c.img} src={grayLightUrl} alt={t('seriesFire')} /></div>;

    const currentLight =
        levelsOfLights.find(
            (level) => num >= level.daysMin && num <= level.daysMax
        ) || levelsOfLights[levelsOfLights.length - 1];

    const currentLightIndex = Math.max(
        0,
        levelsOfLights.findIndex((level) => level === currentLight)
    );

    const levelNumberStyles = [
        { color: "#ff6a00", textShadow: "0 0 8px rgba(255, 153, 0, 0.95)" },
        { color: "#ff8a00", textShadow: "0 0 8px rgba(255, 180, 0, 0.95)" },
        { color: "#ffb300", textShadow: "0 0 8px rgba(255, 210, 0, 0.95)" },
        { color: "#ffd000", textShadow: "0 0 10px rgba(255, 235, 59, 0.95)" },
        { color: " #ffdd00", textShadow: "0 0 10px rgba(255, 247, 4, 0.85)" },
        { color: " #ffae00", textShadow: "0 0 10px rgba(255, 183, 0, 0.85)" },
        { color: "rgb(255, 0, 0)", textShadow: "0 0 10px rgba(255, 132, 0, 0.85)" },
        { color: "rgb(255, 77, 104)", textShadow: "0 0 12px rgba(255, 77, 219, 0.8)" },
        { color: "rgb(245, 64, 255)", textShadow: "0 0 12px rgba(255, 64, 129, 0.8)" },
        { color: "rgb(170, 23, 255)", textShadow: "0 0 12px rgba(189, 23, 255, 0.85)" },
    ];

    const activeNumberStyle =
        levelNumberStyles[currentLightIndex] || levelNumberStyles[levelNumberStyles.length - 1];

    const finalUrl = isTodayCompleted
        ? currentLight.url
        : grayLightUrl;

    const currentText = milestoneTexts[num];

    return (
        <>
            <div className={c.Lights}>
                <img className={c.img} src={finalUrl} alt={t('seriesFire')} />
                <div
                    className={`${c.text} ${isTodayCompleted ? c.orange : c.grey}`}
                    style={isTodayCompleted ? activeNumberStyle : undefined}
                >
                    {num}
                </div>
            </div>

            {showCongrats && currentText && (
                <div className={c.fullscreen}>
                    <div className={c.modal}>
                        <img
                            className={c.modalImg}
                            src={currentLight.url}
                            alt="Fire"
                        />

                        <h1
                            className={c.number}
                            style={isTodayCompleted ? activeNumberStyle : undefined}
                        >
                            {num}
                        </h1>
                        <p className={c.title}>{currentText.title}</p>
                        <p className={c.subtitle}>{currentText.subtitle}</p>

                        <button
                            className={c.button}
                            onClick={() => setShowCongrats(false)}
                        >
                            {t('continue')}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Lights;