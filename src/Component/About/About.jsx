import React from "react";
import "./About.css";

const About = () => {
    return (
        <div className="about-container">
            <h1 className="title">Привет новый пользователь!</h1>
            <h4 className="about-title">О приложении</h4>
            <p className="about-text">
                Это приложение создано для того, чтобы помочь вам выработать полезные
                привычки и достигать целей каждый день.
            </p>

            <div className="about-section">
                <h2 className="about-subtitle">Как это работает?</h2>
                <ul className="about-list">
                    <li>Выбирайте цели из предложенных или создавайте свои.</li>
                    <li>Выполняйте их каждый день и получайте очки.</li>
                    <li>За достижения вы получаете награды и бейджи.</li>
                    <li>Каждый новый день — новый шанс начать заново.</li>
                </ul>
            </div>

            <div className="about-section">
                <h2 className="about-subtitle">Почему это важно?</h2>
                <p className="about-text">
                    Маленькие шаги ежедневно помогают достигать больших целей.
                    Приложение мотивирует вас оставаться последовательным и
                    отслеживать прогресс.
                </p>
            </div>

            <div className="about-footer">
                <p className="about-footer-text">
                    💡 Совет: выбирайте не больше 3–4 целей в день, чтобы сохранять
                    баланс и получать удовольствие от процесса!
                </p>
            </div>
        </div>
    );
};

export default About;
