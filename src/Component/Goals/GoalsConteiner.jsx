import React, { useState, useEffect } from "react";
import Goals from "./Goals";
import { connect } from "react-redux";
import filter from "../../utils/Filter/filter";
import { addStatusNew } from "../../redux/goals_reducer";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import styles from "./Goals.module.css";

const GoalsConteiner = (props) => {
    const [isModalOpen, setIsModalOpen] = useState(null);

    const Modal = (goal) => {
        setIsModalOpen(goal)
    };

    const closeModal = () => {
        setIsModalOpen(null);
    };

    const addNewStatus = () => {
        props.addStatusNew(isModalOpen.id,props.userId,"in_progress")
        setIsModalOpen(null);
        toast.success("Цель успешно взята на 30 дней!");
    }

    return (
        <div className={styles.container}>
            <Goals
                completed={filter(
                    props.goals.goals,
                    "done",
                    null,
                    "https://i.postimg.cc/g00CMHm0/png-clipart-information-management-service-compute-no-bg-preview-carve-photos.png"
                )}
                inProgress={filter(props.goals.goals, "in_progress")}
                available={filter(props.goals.goals, "not_started", Modal)}
            />
            <AnimatePresence>
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

                            <h2 className={styles.modalTitle}>
                                {isModalOpen.title}
                            </h2>
                            <p className={styles.modalText}>
                                {isModalOpen.description}
                            </p>
                            <button
                                onClick={() => {
                                    addNewStatus()
                                }}
                                className={styles.actionButton}
                            >
                                Взять цель на 30 дней
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const mapStateToProps = (state) => ({
    goals: state.goals,
    userId: state.profile.profile.id
});

export default connect(mapStateToProps, { addStatusNew })(GoalsConteiner);