import React, { useEffect, useState } from "react";
import c from './Yesterday.module.css';
import { useLanguage } from '@/context/LanguageContext';
import toast from "react-hot-toast";
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import { X, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Yesterday = ({ addTextGenerationData, setDisplay, deletePoints, setSavingGoals, newStatusSavingGoal, profile, userId, setDate, goalsForSelectedDate, checkTimeGoalsSaving, setPoints, addStatus, series = 0, isTodayCompleted = false }) => {
    const { language, t } = useLanguage();
    const [esterday, setEsterday] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isModalOpenText, setIsModalOpenText] = useState(null)
    const [button, setButton] = useState(true);

    const [generatedText, setGeneratedText] = useState("");

    const date = new Date();
    date.setDate(date.getDate() - 1);
    const esterdayDate = date.toISOString().split('T')[0]
    const locale = language === 'en' ? 'en-US' : 'ru-RU';
    const formattedDate = date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });

    useEffect(() => {
        setDate(esterdayDate);
    }, [goalsForSelectedDate])

    const clicGoals = (goalsData) => {
        if (loading) {
            if (goalsData.status === 'in_progress') {
                addNewStatusDone(goalsData)
            } else if (goalsData.status === "completed") {
                addNewStatusInProgress(goalsData)
            }
        }
    }

    const addNewStatusDone = async (isModalOpenDone) => {
        try {
            setLoading(false)
            const loadingToast = toast.loading(t('completingGoal'), {
                style: {
                    background: '#333',
                    color: '#fff',
                    marginTop: '80px',
            
                },
                icon: <LoadingSpinner size={20} />
            });

            await checkTimeGoalsSaving(profile.telegramId)
            await setPoints(userId, isModalOpenDone.points)
            await addStatus(userId);

            const result = await newStatusSavingGoal(profile.telegramId, esterdayDate, isModalOpenDone.id, "completed")

            if (result.success) {
                setLoading(true)
            }
            setSavingGoals(result.data.savingGoals)
            toast.dismiss(loadingToast);
            toast.success(t('goalCompleted'), {
                style: {
                    background: '#333',
                    color: '#fff',
                    marginTop: '80px',
                }
            });
        } catch (error) {
            console.error(t('goalError'), error);
            toast.error(t('goalErrorRetry'), {
                style: {
                    background: '#333',
                    color: '#fff',
                    marginTop: '80px',
                }
            });
        }
    };

    const addNewStatusInProgress = async (isModalOpen) => {
        try {
            setLoading(false)
            const loadingToast = toast.loading(t('cancelingGoal'), {
                style: {
                    background: '#333',
                    color: '#fff',
                    marginTop: '80px',
                },
                icon: <LoadingSpinner size={20} />
            });

            await deletePoints(userId, isModalOpen.points)
            await checkTimeGoalsSaving(profile.telegramId)
            await addStatus(userId);

            const result = await newStatusSavingGoal(profile.telegramId, esterdayDate, isModalOpen.id, "in_progress")

            toast.dismiss(loadingToast);
            toast.success(t('goalCanceled'), {
                style: {
                    background: '#333',
                    color: '#fff',
                    marginTop: '80px',
                }
            });

            if (result.success) {
                setLoading(true)
            }
            setSavingGoals(result.data.savingGoals)
        } catch (error) {
            console.error(t('goalMoveError'), error);
            toast.error(t('goalMoveErrorRetry'), {
                style: {
                    background: '#333',
                    color: '#fff',
                    marginTop: '80px',
                }
            });
        }
    };

    const map = goalsForSelectedDate.map(g => {
        return <div
            key={g.id}
            onClick={() => { clicGoals(g) }}
        >
            <div
                className={c.blok}
            >
                <div>
                    <div className={c.title}>{g.title}</div>
                    <div className={c.pts}>{g.points} pts</div>
                </div>
                {g.status === 'in_progress' && <div>
                    <img className={c.img} src='https://i.postimg.cc/hP8bTspx/3836f8c0-0e42-4e08-baaa-4d629dbe4995-no-bg-preview-carve-photos-1.png' alt="button" />
                </div> ||
                    <div>
                        <div className={c.circleCheck} aria-hidden="true" />
                    </div>
                }
            </div>
        </div>
    })

    const rollback = () => {
        setEsterday(true)
        setDisplay(false)
        setButton(false)
    }

    const back = () => {
        setEsterday(false)
        setDisplay(true)
        setButton(true)
    };

    const generation = async () => {
        if (loading) {

            const loadingToast = toast.loading(t('generating'), {
                style: {
                    background: '#333',
                    color: '#fff',
                    marginTop: '80px',
                },
                icon: <LoadingSpinner size={20} />
            });

            const goalsDone = goalsForSelectedDate.filter(g => g.status === 'completed');

            const goalsInProgress = goalsForSelectedDate.filter(g => g.status === 'in_progress');

            const seriesForYesterday = isTodayCompleted && series > 0 ? series - 1 : series;

            await addTextGenerationData(formattedDate, profile.usersTag, profile.telegramId, goalsDone, goalsInProgress, setGeneratedText, setLoading, true, seriesForYesterday, language)

            toast.dismiss(loadingToast);

            toast.success(t('ready'), {
                style: {
                    background: '#333',
                    color: '#fff',
                    marginTop: '80px',
                }
            });

            setLoading(true)
        }
    };

    const copyToClipboard = async (text) => {
        await navigator.clipboard.writeText(text);
        toast.success(t('reportCopied'), {
            style: {
                background: '#333',
                color: '#fff',
                marginTop: '80px',
            },
        });
        setIsModalOpenText(null)
    };

    return (
        <div>
            <div className={c.home} >
                {esterday && <div>
                    <div className={c.text}>
                        {t('yesterdayGoals')}
                    </div>
                    {map}
                    <div className={c.GenerationButton} >
                        <button className={c.button} onClick={generation} >
                        📊 <div className={c.textButton} > {t('generateReport')}</div>
                        </button>
                    </div>
                    {generatedText &&
                        <div>
                            <div className={c.generatedBox}>
                                <div onClick={() => setIsModalOpenText(generatedText)} className={c.previewWrapper}>
                                    <pre className={c.previewText}>
                                        {generatedText.split("\n").slice(0, 1).join("\n")}
                                        {generatedText.split("\n").length > 1 ? "\n..." : ""}
                                    </pre>
                                </div>
                                <button
                                    className={c.copyButton}
                                    onClick={() => copyToClipboard(generatedText)}
                                    aria-label={t('copy')}
                                >
                                    <Copy size={28} />
                                </button>
                            </div>
                        </div>
                    }
                </div>
                }
            </div>
            <div className={c.wrapper}>
                <button disabled={!button} className={c.arrowBtn} onClick={rollback} style={!button ? { backgroundColor: '#1d1d1d', color: '#666666' } : {}}>
                    <span>{"<"}</span>
                </button>
                {button && <div className={c.label}>{t('rollback')} </div> || <div className={c.label}>{t('back')} </div>}
                <button disabled={button} onClick={back} className={c.arrowBtn} style={button ? { backgroundColor: '#1d1d1d', color: '#666666' } : {}}>
                    <span>{">"}</span>
                </button>
            </div >

            {isModalOpenText && <AnimatePresence>
                <motion.div
                    className={c.modalBackdrop}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setIsModalOpenText(null)}
                >
                    <motion.div
                        className={c.modalContent}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsModalOpenText(null)}
                            className={c.closeButton}
                            aria-label={t('close')}
                        >
                            <X size={24} />
                        </button>
                        <pre className={c.previewText}>
                            {isModalOpenText}
                        </pre>
                        <div className={c.copyButtonIsModalBlok}>
                            <button
                                className={c.copyButtonIsModal}
                                onClick={() => copyToClipboard(generatedText)}
                                aria-label={t('copy')}
                            >
                                {t('copy')}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
            }
        </div >
    );
};

export default Yesterday;
