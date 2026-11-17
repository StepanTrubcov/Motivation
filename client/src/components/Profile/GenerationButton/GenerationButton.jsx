'use client';
import React, { useState, useEffect } from "react";
import c from './GenerationButton.module.css'
import ModalWindowText from "./ModalWindowText/ModalWindowText";
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import { notifications } from "@/lib/notifications";
import { FileText } from 'lucide-react';


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
        if (loading) return;
        const notice = notifications.begin(t('generating'));
        setLoading(true);
        try {


        await addTextGenerationData(formattedDate, profile.usersTag, telegramId, goalsDone, goalsInProgress, setGeneratedText, setLoading, true, series, language)


        notice.success(t('ready'));

        } catch (error) {
            console.error(error);
            notice.error(t('generationError'));
        } finally {
            setLoading(false);
        }
    };


    if (goalsInProgress.length !== 0 || goalsDone.length !== 0) {
        return <div className={c.GenerationButton} data-tutorial-id="generate-button">
            <button
                className={c.button}
                onClick={generation}
                disabled={loading}
            >
                <div className={c.text}>
                <FileText className={c.icon} aria-hidden="true" />
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
