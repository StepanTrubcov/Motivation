'use client';
import React, { useState, useEffect } from "react";
import c from './GenerationButton.module.css'
import ModalWindowText from "./ModalWindowText/ModalWindowText";
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import { toast } from "react-hot-toast";


const GenerationButton = ({ profile, telegramId, addTextGenerationData, goalsDone = [], goalsInProgress = [], series = 0 }) => {
    const { language, t } = useLanguage();
    const { currentStep, onTutorialActionDone } = useTutorial();
    const [loading, setLoading] = useState(false);
    const [generatedText, setGeneratedText] = useState('');
    const [prevGoals, setPrevGoals] = useState({ done: [], inProgress: [] });

    const today = new Date();
    const locale = language === 'en' ? 'en-US' : 'ru-RU';
    const formattedDate = today.toLocaleDateString(locale, { day: 'numeric', month: 'long' });

    useEffect(() => {
        const currentGoals = {
            done: goalsDone || [],
            inProgress: goalsInProgress || []
        };
        if (JSON.stringify(currentGoals) !== JSON.stringify(prevGoals)) {
            setGeneratedText('');
            setPrevGoals(currentGoals);
        }
    }, [goalsDone, goalsInProgress, prevGoals]);

    useEffect(() => {
        if (generatedText && currentStep?.id === 'generate-report') {
            onTutorialActionDone('generate_report');
        }
    }, [generatedText, currentStep?.id, onTutorialActionDone]);

    const generation = async () => {

        setLoading(true)
        const loadingToast = toast.loading(t('generating'), {
            style: {
                background: '#333',
                color: '#fff',
                marginTop: '80px',
            },
            icon: <img src="https://media.tenor.com/Pq1cZiuhlEEAAAAi/rajinikanth.gif" unoptimized={true} alt="Loading" style={{ width: '20px', height: '20px' }} />
        });

        await addTextGenerationData(formattedDate, profile.usersTag, telegramId, goalsDone, goalsInProgress, setGeneratedText, setLoading, true, series, language)

        toast.dismiss(loadingToast);

        toast.success(t('ready'), {
            style: {
                background: '#333',
                color: '#fff',
                marginTop: '80px',
            }
        });

        setLoading(false)
    };


    if (goalsInProgress.length !== 0 || goalsDone.length !== 0) {
        return <div className={c.GenerationButton} data-tutorial-id="generate-button">
            <button
                className={c.button}
                onClick={generation}
                disabled={loading}
            >
                <div className={c.text}>
                    <img
                        className={c.img}
                        src="https://cdn-icons-png.flaticon.com/512/11865/11865338.png"
                        alt="generate"
                    />
                    {t('generate')}
                </div>
            </button>
            <div>
                <ModalWindowText
                    isModalOpenText={generatedText}
                    closeModalText={() => setGeneratedText('')}
                />
            </div>
        </div>
    }
}

export default GenerationButton
