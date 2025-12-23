'use client';
import React, { useState, useEffect } from "react";
import c from './GenerationButton.module.css'
import ModalWindowText from "./ModalWindowText/ModalWindowText";
import { toast } from "react-hot-toast";


const GenerationButton = ({ profile, telegramId, addTextGenerationData, goalsDone = [], goalsInProgress = [] }) => {

    const [loading, setLoading] = useState(false);
    const [generatedText, setGeneratedText] = useState('');
    const [prevGoals, setPrevGoals] = useState({ done: [], inProgress: [] });


    const today = new Date();
    const formattedDate = today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

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

    const generation = async () => {

        setLoading(true)
        const loadingToast = toast.loading("Генерируем отчёт", {
            style: {
                background: '#333',
                color: '#fff',
            },
            icon: <img src="https://media.tenor.com/Pq1cZiuhlEEAAAAi/rajinikanth.gif" alt="Loading" style={{ width: '20px', height: '20px' }} />
        });

        await addTextGenerationData(formattedDate, profile.usersTag, telegramId, goalsDone, goalsInProgress, setGeneratedText, setLoading)

        toast.dismiss(loadingToast);

        toast.success("Готово!", {
            style: {
                background: '#333',
                color: '#fff',
            }
        });

        setLoading(false)
    };


    if (goalsInProgress.length !== 0 || goalsDone.length !== 0) {
        return <div className={c.GenerationButton} >
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
                    Сгенерировать
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
