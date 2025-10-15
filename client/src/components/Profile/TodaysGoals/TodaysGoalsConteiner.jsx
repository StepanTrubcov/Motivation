'use client';
import React, { useState, useEffect } from "react";
import TodaysGoals from "./TodaysGoals";
import { connect } from "react-redux";
import filter from "../../../utils/Filter/filter";
import { addStatusNew, addGoals, addStatus } from "../../../redux/goals_reducer";
import { toast } from "react-hot-toast";
import ModalWindow from "../../../utils/ModalWindow/ModalWindow";
import { setPoints } from "../../../redux/profile_reducer";
import { addCalendarDataNew } from "../../../redux/calendar_reducer";

const TodaysGoalsConteiner = ({ profile, addCalendarDataNew, addStatusNew, goals, userId, addStatus, addGoals, setPoints }) => {

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
            points: goal.points,
            id: goal.id
        });
    };

    const closeModal = () => {
        setIsModalOpen(null);
    };

    const addNewStatusDone = async () => {
        const until = new Date().toISOString().slice(0, 10);
        try {
            addStatusNew(isModalOpen.id, userId, "done");
            addCalendarDataNew(profile.telegramId, until)
            setPoints(userId, isModalOpen.points)
            setIsModalOpen(null);
            toast.success("Цель успешно выполнена!");
            await addStatus(userId);
        } catch (error) {
            console.error("Ошибка при выполнении цели:", error);
            toast.error("Не удалось выполнить цель. Попробуйте снова.");
        }
    };

    return <div>
        <TodaysGoals inProgress={filter(goals.goals, "in_progress", Modal,)} />
        <ModalWindow isModalOpen={isModalOpen} buttonText='Выполнить цель' addNewStatus={addNewStatusDone} closeModal={closeModal} />
    </div>
}

const mapStateToProps = (state) => ({
    profile: state.profile.profile,
    goals: state.goals,
    userId: state.profile.profile.id,
})

export default connect(mapStateToProps, { addCalendarDataNew, addStatusNew, addStatus, addGoals, setPoints })(TodaysGoalsConteiner);
