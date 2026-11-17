import GoalStatusIcon from '@/components/GoalStatusIcon/GoalStatusIcon';
import GoalIcon from '@/components/GoalIcon/GoalIcon';
import { pointsLabelKey } from '@/lib/formatPoints';
import { formatGoalDuration } from '@/lib/goalTimeOptions';
import React, { useEffect, useState, useRef } from "react";
import c from './Yesterday.module.css';
import { useDispatch } from 'react-redux';
import { changeGoalCompletion } from '@/redux/goals_reducer';
import { useLanguage } from '@/context/LanguageContext';
import { notifications } from "@/lib/notifications";
import { ArrowLeft, FileText } from "lucide-react";
import ModalWindowText from "../GenerationButton/ModalWindowText/ModalWindowText";

const Yesterday = ({ addTextGenerationData, setDisplay, deletePoints, setSavingGoals, newStatusSavingGoal, profile, userId, setDate, goalsForSelectedDate, checkTimeGoalsSaving, setPoints, addStatus, series = 0, isTodayCompleted = false }) => {
    const { language, t } = useLanguage();
    const dispatch = useDispatch();
    const completionBusy = useRef(false);
    const [esterday, setEsterday] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isModalOpenText, setIsModalOpenText] = useState(null)


    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 1);
    const esterdayDate = date.toISOString().split('T')[0]
    const locale = language === 'en' ? 'en-US' : 'ru-RU';
    const formattedDate = date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
    const weekday = date.toLocaleDateString(locale, { weekday: 'long' });
    const completedCount = goalsForSelectedDate.filter(g => g.status === 'completed').length;

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

    const performCompletion = async (goal, action) => {
        if (completionBusy.current) return;
        completionBusy.current = true;
        setLoading(false);
        const completing = action === 'complete';
        const notice = notifications.begin(t(completing ? 'completingGoal' : 'cancelingGoal'));
        try {
            const result = await dispatch(changeGoalCompletion(userId, goal.id, action, esterdayDate));
            setSavingGoals(result.user.savingGoals);
            notice.success(t(completing ? 'goalCompleted' : 'goalCanceled'));
        } catch (error) {
            console.error('Could not save yesterday goal:', error);
            notice.error(t(completing ? 'goalErrorRetry' : 'goalMoveErrorRetry'));
        } finally {
            completionBusy.current = false;
            setLoading(true);
        }
    };
    const addNewStatusDone = goal => performCompletion(goal, 'complete');
    const addNewStatusInProgress = goal => performCompletion(goal, 'undo');

    const map = goalsForSelectedDate.map(g => {
        return <div
            key={g.id}
            onClick={() => { clicGoals(g) }}
        >
            <div
                className={`${c.blok} ${c.goalCard}`}
                data-completed={g.status === 'completed' ? 'true' : undefined}
            >
                <GoalIcon goal={g} />
                <div className={c.goalText}>
                    <div className={c.title} title={g.title}>
                        {g.durationMinutes != null || g.targetTime
                            ? (g.targetTime ? g.timeBaseTitle : g.durationBaseTitle) || g.baseTitle || g.title
                            : g.title}
                    </div>
                    {(g.durationMinutes != null || g.targetTime) ? (
                        <div className={c.goalTime}>{g.targetTime || formatGoalDuration(g.durationMinutes, language)}</div>
                    ) : null}
                    <div className={c.pts}>{g.points} {t(language === 'ru' ? pointsLabelKey(g.points, language) : 'pts')}</div>
                </div>
                {g.status === 'in_progress' && <div>
                    <GoalStatusIcon />
                </div> ||
                    <div>
                        <GoalStatusIcon completed />
                    </div>
                }
            </div>
        </div>
    })

    const rollback = () => {
        setEsterday(true)
        setDisplay(false)
    }

    const back = () => {
        setEsterday(false)
        setDisplay(true)
    };

    const generation = async () => {
        if (loading) {
            const notice = notifications.begin(t('generating'));
            setLoading(false);
            try {



            const goalsDone = goalsForSelectedDate.filter(g => g.status === 'completed');

            const goalsInProgress = goalsForSelectedDate.filter(g => g.status === 'in_progress');

            const seriesForYesterday = isTodayCompleted && series > 0 ? series - 1 : series;

            await addTextGenerationData(formattedDate, profile.usersTag, profile.telegramId, goalsDone, goalsInProgress, setIsModalOpenText, setLoading, true, seriesForYesterday, language)


            notice.success(t('ready'));

            } catch (error) {
                console.error(error);
                notice.error(t('generationError'));
            } finally {
                setLoading(true);
            }
        }
    };

    return (
        <div>
            <div className={`${c.home} ${esterday ? c.historyHome : ''}`} >
                {esterday && <div>
                    <div className={c.pageHeader}>
                        <button className={c.backButton} onClick={back} aria-label={t('returnToToday')}>
                            <ArrowLeft size={20} aria-hidden="true" />
                        </button>
                        <div className={c.headingGroup}>
                            <h2 className={c.pageTitle}>{t('yesterdayGoals')}</h2>
                            <div className={c.dateLabel}>{formattedDate} · {weekday}</div>
                        </div>
                    </div>
                    <div className={c.summary}>
                        {t('yesterdayCompletedCount').replace('{done}', completedCount).replace('{total}', goalsForSelectedDate.length)}
                    </div>
                    {map}
                    <div className={c.GenerationButton} >
                        <button className={c.button} onClick={generation} disabled={!loading}>
                            <FileText size={20} className={c.reportIcon} aria-hidden="true" />
                            <span>{t('generateReport')}</span>
                        </button>
                    </div>

                </div>
                }
            </div>
            {esterday ? (
                <button className={c.returnButton} onClick={back}>{t('returnToToday')}</button>
            ) : (
                <div className={c.wrapper}>
                    <button className={c.historyLink} onClick={rollback}>
                        <ArrowLeft size={20} aria-hidden="true" />
                        <span>{t('viewYesterdayGoals')}</span>
                    </button>
                </div>
            )}

            <ModalWindowText
                isModalOpenText={isModalOpenText}
                closeModalText={() => setIsModalOpenText(null)}
            />
        </div >
    );
};

export default Yesterday;
