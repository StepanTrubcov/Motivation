'use client';
import React, { useState } from "react";
import c from './GenerationButton.module.css'
import ModalWindowGeneration from "./ModalWindowGeneration/ModalWindowGeneration";
import ModalWindowText from "./ModalWindowText/ModalWindowText";



const GenerationButton = ({ yesterdayReport, telegramId, nerationIsOver, text, addTextGenerationData, goalsDone = [], goalsInProgress = [] }) => {

    const [isModalOpen, setIsModalOpen] = useState(null)
    const [isModalOpenText, setIsModalOpenText] = useState();

    if (goalsInProgress.length !== 0 || goalsDone.length !== 0) {
        return <div className={c.GenerationButton} >
            <button className={c.button} onClick={() => setIsModalOpen('e')} >
                <img className={c.img} src="https://cdn-icons-png.flaticon.com/512/11865/11865338.png" />
                <div className={c.text} > Сгенерировать отчёт</div>
            </button>
            <div>
                <ModalWindowGeneration
                    yesterdayReport={yesterdayReport}
                    telegramId={telegramId}
                    nerationIsOver={nerationIsOver}
                    addTextGenerationData={addTextGenerationData}
                    text={text}
                    goalsDone={goalsDone}
                    goalsInProgress={goalsInProgress}
                    isModalOpen={isModalOpen}
                    closeModal={() => setIsModalOpen(null)}
                    setIsModalOpenText={setIsModalOpenText}
                />
                <ModalWindowText
                    isModalOpenText={isModalOpenText}
                    closeModalText={() => setIsModalOpenText(null)}
                />
            </div>
        </div>
    }
}

export default GenerationButton
