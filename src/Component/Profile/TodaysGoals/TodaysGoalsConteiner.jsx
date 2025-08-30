import React, { useState, useEffect } from "react";
import TodaysGoals from "./TodaysGoals";
import { connect } from "react-redux";
import filter from "../../../utils/Filter/filter";
import { addStatusNew, addGoals, addStatus } from "../../../redux/goals_reducer";
import { toast } from "react-hot-toast";
import ModalWindow from "../../../utils/ModalWindow/ModalWindow";

const TodaysGoalsConteiner = ({ addStatusNew, goals, userId, addStatus, addGoals }) => {

    const [isModalOpen, setIsModalOpen] = useState(null);

    useEffect(() => {
        if (userId) {
            addStatus(userId)
            addGoals(userId)
        }
    }, [userId, addGoals, addStatus]);

    const Modal = (goal) => {
        setIsModalOpen({
            title: 'Выполнить цель',
            description: `Вы уверены, что хотите отметить цель "${goal.title}" как выполненную?`,
            id: goal.id
        });
    };

    const closeModal = () => {
        setIsModalOpen(null);
    };

    const addNewStatusDone = async () => {
        try {
            addStatusNew(isModalOpen.id, userId, "done");
            setIsModalOpen(null);
            toast.success("Цель успешно выполнена!");
            await addStatus(userId);
        } catch (error) {
            console.error("Ошибка при выполнении цели:", error);
            toast.error("Не удалось выполнить цель. Попробуйте снова.");
        }
    };

    return <div>
        <TodaysGoals inProgress={filter(goals.goals, "in_progress", Modal)} />
        <ModalWindow isModalOpen={isModalOpen} buttonText='Выполнить цель' addNewStatus={addNewStatusDone} closeModal={closeModal} />
    </div>
}

const mapStateToProps = (state) => ({
    goals: state.goals,
    userId: state.profile.profile.id,
})

export default connect(mapStateToProps, { addStatusNew, addStatus, addGoals })(TodaysGoalsConteiner);