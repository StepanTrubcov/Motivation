import React, { useEffect, useState } from "react";
import { useLanguage } from '@/context/LanguageContext';
import c from "./Lights.module.css";

const Lights = ({ num, isTodayCompleted }) => {
    const { t } = useLanguage();

    const levelsOfLights = [
        { url: "https://i.postimg.cc/ncn6QWvg/1-uroven'.png", daysMin: 2, daysMax: 4 },
        { url: "https://i.postimg.cc/wx5BpSqS/2-uroven'.png", daysMin: 5, daysMax: 8 },
        { url: "https://i.postimg.cc/7ZhPShgW/3-uroven'.png", daysMin: 9, daysMax: 12 },
        { url: "https://i.postimg.cc/hjLKKdBP/4-uroven'.png", daysMin: 13, daysMax: 16 },
        { url: "https://i.postimg.cc/SRVqMbjL/5-uroven'.png", daysMin: 17, daysMax: 22 },
        { url: "https://i.postimg.cc/XYr3phbR/6-uroven'.png", daysMin: 23, daysMax: 30 },
        { url: "https://i.postimg.cc/8PFgzyxr/7-uroven'.png", daysMin: 31, daysMax: 45 },
        { url: "https://i.postimg.cc/DzRB5gBM/8-uroven'.png", daysMin: 46, daysMax: 60 },
        { url: "https://i.postimg.cc/MZ7db1R4/9-uroven'.png", daysMin: 61, daysMax: 89 },
        { url: "https://i.postimg.cc/9QnpFb5p/10-uroven'.png", daysMin: 90, daysMax: 120 },
    ];

    const grayLightUrl = "https://i.postimg.cc/gJDK9gn6/752049b9-f85f-4d4e-a777-58c12ac42fbd.png";

    const milestones = [2, 5, 10, 30, 60, 100, 120];

    const milestoneTexts = {
        2: {
            title: t('milestone2Title'),
            subtitle: t('milestone2Subtitle')
        },
        5: {
            title: t('milestone5Title'),
            subtitle: t('milestone5Subtitle')
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
        }
    };

    const [showCongrats, setShowCongrats] = useState(false);

    useEffect(() => {
        if (milestones.includes(num) && isTodayCompleted) {
            const shownMilestones = JSON.parse(localStorage.getItem('shownMilestones') || '[]');
            if (!shownMilestones.includes(num)) {
                setShowCongrats(true);
                localStorage.setItem('shownMilestones', JSON.stringify([...shownMilestones, num]));
            }
        }
    }, [num, isTodayCompleted]);

    if (num < 2) return null;

    const currentLight =
        levelsOfLights.find(
            (level) => num >= level.daysMin && num <= level.daysMax
        ) || levelsOfLights[levelsOfLights.length - 1];

    const finalUrl = isTodayCompleted
        ? currentLight.url
        : grayLightUrl;

    const currentText = milestoneTexts[num];

    return (
        <>
            <div className={c.Lights}>
                <img className={c.img} src={finalUrl} alt={t('seriesFire')} />
                <div className={`${c.text} ${isTodayCompleted ? c.orange : c.grey}`}>
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

                        <h1 className={c.number}>{num}</h1>
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