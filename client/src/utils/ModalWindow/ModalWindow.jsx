import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import styles from './ModalWindow.module.css'


const ModalWindow = ({ isModalOpen, addNewStatus, closeModal }) => {

    const number = [
        { id: 0, name: '120 дней', value: 120 },
        { id: 1, name: '60 дней', value: 60 },
        { id: 2, name: '30 дней', value: 30 },
    ];

    const [selectedOption, setSelectedOption] = useState(null);

    const handleOptionChange = (id) => {
        setSelectedOption(id);
    };

    const handleAddStatus = () => {
        if (selectedOption !== null) {
            addNewStatus(number[selectedOption]?.value);
        }
    };

    return <AnimatePresence>
        {isModalOpen && (
            <motion.div
                className={styles.modalBackdrop}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={closeModal}
            >
                <motion.div
                    className={styles.modalContent}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={closeModal}
                        className={styles.closeButton}
                        aria-label="Close modal"
                    >
                        <X size={24} />
                    </button>
                    <h2 className={styles.modalTitle}>{isModalOpen.title}</h2>
                    {isModalOpen.image && (<img className={styles.modalImg} src={isModalOpen.image} />)}
                    <p className={styles.modalText}>{isModalOpen.description}</p>
                    {isModalOpen.achievement && <div></div> || <div><div className={styles.radioGroup}>
                        {number.map((item) => (
                            <label key={item.id} className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name="duration"
                                    value={item.id}
                                    checked={selectedOption === item.id}
                                    onChange={() => handleOptionChange(item.id)}
                                    className={styles.radioInput}
                                />
                                <span className={styles.radioButton}></span>
                                {item.name}
                            </label>
                        ))}
                    </div>

                        <button
                            onClick={handleAddStatus}
                            className={styles.actionButton}
                            disabled={selectedOption === null}
                        >
                            Взять цель на {number[selectedOption]?.name}
                        </button></div>}
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
}

export default ModalWindow;