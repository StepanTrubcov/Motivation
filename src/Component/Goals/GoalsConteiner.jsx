import React, { useState, useEffect } from "react";
import Goals from "./Goals";
import { connect } from "react-redux";
import filter from "../../utils/Filter/filter";
import { addStatusNew, addGoals, addStatus } from '../../redux/goals_reducer';
import { toast } from "react-hot-toast";
import styles from "./Goals.module.css";
import ModalWindow from "../../utils/ModalWindow/ModalWindow";
import { setPoints } from "../../redux/profile_reducer";
import { addCalendarDataNew } from "../../redux/calendar_reducer";

const GoalsConteiner = ({ profile, goals, userId, addStatusNew, addGoals, addStatus, setPoints, addCalendarDataNew }) => {

    const [isModalOpen, setIsModalOpen] = useState(null);
    const [isModalOpenDone, setIsModalOpenDone] = useState(null);

    useEffect(() => {
        if (userId) {
            addStatus(userId)
            addGoals(userId)
        }
    }, [userId, addGoals, addStatus]);

    const Modal = (goal) => {
        if (goal.status === "not_started") {
            setIsModalOpen(goal);
        }
        if (goal.status === "in_progress") {
            setIsModalOpenDone({
                title: "Выполнить цель",
                description: `Вы уверены, что хотите отметить цель "${goal.title}" как выполненную?`,
                points: goal.points,
                id: goal.id,
                status: goal.status,
            });
        }
    };

    const closeModal = () => {
        setIsModalOpen(null);
        setIsModalOpenDone(null);
    };

    const addNewStatus = async () => {
        try {
            await addStatusNew(isModalOpen.id, userId, "in_progress");
            toast.success("Цель успешно взята на 30 дней!");
            setIsModalOpen(null);
        } catch (error) {
            console.error("Ошибка при взятии цели:", error);
            toast.error("Не удалось взять цель. Попробуйте снова.");
        }
    };

    const addNewStatusDone = async () => {
        const until = new Date().toISOString().slice(0, 10);
        try {
            await addStatusNew(isModalOpenDone.id, userId, "done");
            await addCalendarDataNew(profile.telegramId, until)
            await setPoints(userId, isModalOpenDone.points)
            toast.success("Цель успешно выполнена!");
            setIsModalOpenDone(null);
            await addStatus(userId);
        } catch (error) {
            console.error("Ошибка при выполнении цели:", error);
            toast.error("Не удалось выполнить цель. Попробуйте снова.");
        }
    };

    return (
        <div className={styles.container}>
            <Goals
                completed={filter(
                    goals.goals,
                    "completed",
                    () => { toast.success("Эта цель уже выполнена!"); },
                    "https://i.postimg.cc/g00CMHm0/png-clipart-information-management-service-compute-no-bg-preview-carve-photos.png"
                )}
                inProgress={filter(goals.goals, "in_progress", Modal)}
                available={filter(goals.goals, "not_started", Modal)}
            />
            <ModalWindow
                isModalOpen={isModalOpen}
                addNewStatus={addNewStatus}
                buttonText={'Взять цель на 30 дней'}
                closeModal={closeModal}
            />
            <ModalWindow
                isModalOpen={isModalOpenDone}
                addNewStatus={addNewStatusDone}
                buttonText={'Выполнить цель'}
                closeModal={closeModal}
            />
        </div>
    );
};

const mapStateToProps = (state) => ({
    profile: state.profile.profile,
    goals: state.goals,
    userId: state.profile.profile?.id,
});

export default connect(mapStateToProps, { addStatusNew, addGoals, addStatus, setPoints, addCalendarDataNew })(GoalsConteiner);