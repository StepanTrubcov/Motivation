import React from "react";
import { useLanguage } from '@/context/LanguageContext';
import c from './TodaysGoals.module.css'

const TodaysGoals = ({ inProgress, completed }) => {
    const { t, language } = useLanguage();

    if (inProgress.length === 0 && completed.length === 0) {
        return <div data-tutorial-id="today-goals">
            <div className={c.name} >
                {t('todayGoals')}
            </div>
            <div className={c.blok}>{t('noSuchGoals')}</div>
        </div>
    }

    return <div data-tutorial-id="today-goals">
        <div className={c.name} >
            {t('todayGoals')}
        </div>
        <div className={c.goals} >
            {completed}
            {inProgress}
        </div>
    </div>
}

export default TodaysGoals;