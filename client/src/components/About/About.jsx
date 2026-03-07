import React from "react";
import { useLanguage } from '@/context/LanguageContext';
import "./About.css";
import { Link } from "react-router-dom";

const About = (props) => {
    const { t, language } = useLanguage();
    return (
        <div className="about-container">
            <h1 className="title">{language === 'en' ? 'Hello new user!' : 'Привет новый пользователь!'}</h1>
            <h4 className="about-title">{language === 'en' ? 'About the app' : 'О приложении'}</h4>
            <p className="about-text">
                {language === 'en' ? 'This app is designed to help you develop useful habits and achieve goals every day.' : 'Это приложение создано для того, чтобы помочь вам выработать полезные привычки и достигать целей каждый день.'}
            </p>

            <div className="about-section">
                <h2 className="about-subtitle">{language === 'en' ? 'How does it work?' : 'Как это работает?'}</h2>
                <ul className="about-list">
                    <li>{language === 'en' ? 'Choose goals from the suggested ones.' : 'Выбирайте цели из предложенных.'}</li>
                    <li>{language === 'en' ? 'Complete them every day and earn points.' : 'Выполняйте их каждый день и получайте очки.'}</li>
                    <li>{language === 'en' ? 'For achievements you get rewards and badges.' : 'За достижения вы получаете награды и бейджи.'}</li>
                    <li>{language === 'en' ? 'Each new day is a new chance to start over.' : 'Каждый новый день — новый шанс начать заново.'}</li>
                </ul>
            </div>

            <div className="about-section">
                <h2 className="about-subtitle">{language === 'en' ? 'Why is this important?' : 'Почему это важно?'}</h2>
                <p className="about-text">
                    {language === 'en' ? 'Small steps daily help achieve big goals. The app motivates you to stay consistent and track progress.' : 'Маленькие шаги ежедневно помогают достигать больших целей. Приложение мотивирует вас оставаться последовательным и отслеживать прогресс.'}
                </p>
            </div>
            <div className="about-footer">
                <p className="about-footer-text">
                    {language === 'en' ? '💡 Tip: choose no more than 3–4 goals for 30 days to maintain balance and enjoy the process!' : '💡 Совет: выбирайте не больше 3–4 целей на 30 дней, чтобы сохранять баланс и получать удовольствие от процесса!'}
                </p>
            </div>
            <div onClick={() => props.setTheFirstTime()} >{t('next')}</div>
        </div>
    );
};

export default About;
