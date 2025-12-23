'use client';
import React, { useState, useEffect } from "react";
import Goals from "./Goals";
import { connect } from "react-redux";
import Filter from "../../utils/Filter/filter";
import {checkTimeGoalsSaving, addStatusNew, addGoals, addStatus, NewGoals, newSavingGoal, newStatusSavingGoal, deleteGoalsSaving } from '../../redux/goals_reducer';
import { toast } from "react-hot-toast";
import styles from "./Goals.module.css";
import ModalWindow from "../../utils/ModalWindow/ModalWindow";
import { setPoints, deletePoints } from "../../redux/profile_reducer";

const GoalsConteiner = ({ checkTimeGoalsSaving, deletePoints, deleteGoalsSaving, newStatusSavingGoal, newSavingGoal, NewGoals, profile, goals, userId, addStatusNew, addGoals, addStatus, setPoints }) => {

    const [isModalOpen, setIsModalOpen] = useState(null);
    const [loading, setLoading] = useState(true);

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
            const isModalOpenDone = {
                points: goal.points,
                id: goal.id,
                status: goal.status,
            }
            if (loading) {
                addNewStatusDone(isModalOpenDone)
            }
        }
        if (goal.status === "completed") {
            const isModalOpen = goal
            if (loading) {
                addNewStatusInProgress(isModalOpen)
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(null);
    };

    const addNewStatus = async (selectedOption) => {
        try {
            console.log('addNewStatus called with selectedOption:', selectedOption);
            await addStatusNew(isModalOpen.id, userId, "in_progress", selectedOption);
            toast.success(`Цель успешно взята на ${selectedOption} дней!`, {
                style: {
                    background: '#333',
                    color: '#fff',
                }
            });
            setIsModalOpen(null);

            const targetDate = new Date().toISOString().slice(0, 10)
            const goalData = {
                idGoals: isModalOpen.id,
                status: "in_progress",
            }


            await newSavingGoal(profile.telegramId, goalData, targetDate, selectedOption);


        } catch (error) {
            console.error("Ошибка при взятии цели:", error);
            toast.error("Не удалось взять цель. Попробуйте снова.", {
                style: {
                    background: '#333',
                    color: '#fff',
                }
            });
        }
    };

    const addNewStatusDone = async (isModalOpenDone) => {
        const until = new Date().toISOString().slice(0, 10);
        try {
            setLoading(false)
            const loadingToast = toast.loading("Выполняем цель...", {
                style: {
                    background: '#333',
                    color: '#fff',
                },
                icon: <img src="https://media.tenor.com/Pq1cZiuhlEEAAAAi/rajinikanth.gif" alt="Loading" style={{ width: '20px', height: '20px' }} />
            });
            await addStatusNew(isModalOpenDone.id, userId, "done");
            await checkTimeGoalsSaving(profile.telegramId)
            await setPoints(userId, isModalOpenDone.points)
            await addStatus(userId);

            const result = await newStatusSavingGoal(profile.telegramId, until, isModalOpenDone.id, "completed")
            if (result) {
                setLoading(true)
            }
            toast.dismiss(loadingToast);
            toast.success("Цель успешно выполнена!", {
                style: {
                    background: '#333',
                    color: '#fff',
                }
            });
        } catch (error) {
            console.error("Ошибка при выполнении цели:", error);
            toast.error("Не удалось выполнить цель. Попробуйте снова.", {
                style: {
                    background: '#333',
                    color: '#fff',
                }
            });
        }
    };

    const addNewStatusInProgress = async (isModalOpen) => {
        const until = new Date().toISOString().slice(0, 10);
        try {
            setLoading(false)
            const loadingToast = toast.loading("Отменяем выполнение цели...", {
                style: {
                    background: '#333',
                    color: '#fff',
                },
                icon: <img src="https://media.tenor.com/Pq1cZiuhlEEAAAAi/rajinikanth.gif" alt="Loading" style={{ width: '20px', height: '20px' }} />
            });

            await addStatusNew(isModalOpen.id, userId, "in_progress");
            await deletePoints(userId, isModalOpen.points)
            await checkTimeGoalsSaving(profile.telegramId)
            await addStatus(userId);

            const result = await newStatusSavingGoal(profile.telegramId, until, isModalOpen.id, "in_progress")

            toast.dismiss(loadingToast);
            toast.success("Цель успешно перемещена в раздел 'В процессе'!", {
                style: {
                    background: '#333',
                    color: '#fff',
                }
            });

            if (result) {
                setLoading(true)
            }
        } catch (error) {
            console.error("Ошибка при перемещении цели:", error);
            toast.error("Не удалось переместить цель в раздел 'В процессе'. Попробуйте снова.", {
                style: {
                    background: '#333',
                    color: '#fff',
                }
            });
        }
    };

    const addOldStatus = async (goalData) => {
        try {
            const until = new Date().toISOString().slice(0, 10);
            if (goalData.status === "completed") {
                await deletePoints(userId, goalData.points)
                await checkTimeGoalsSaving(profile.telegramId)
            }
            await addStatusNew(goalData.id, userId, "not_started");
            toast.success("Цель успешно убрана!", {
                style: {
                    background: '#333',
                    color: '#fff',
                }
            });
            await deleteGoalsSaving(profile.telegramId, goalData.id)

        } catch (error) {
            console.error("Ошибка при убирании цели:", error);
            toast.error("Не удалось убрать цель. Попробуйте снова.", {
                style: {
                    background: '#333',
                    color: '#fff',
                }
            });
        }
    };

    const All_goals = goals.goals.filter(goal => goal.status === "not_started");
    const goalsSport = All_goals.filter(goal => goal.category === "Sport");
    const goalsDiscipline = All_goals.filter(goal => goal.category === "Discipline");
    const goalsSpirituality = All_goals.filter(goal => goal.category === "Spirituality");
    const goalsSelfDevelopment = All_goals.filter(goal => goal.category === "Self_development");
    return (
        <div className={styles.container}>
            <Goals
                completed={Filter(
                    goals.goals,
                    "completed",
                    Modal,
                    "https://i.postimg.cc/g00CMHm0/png-clipart-information-management-service-compute-no-bg-preview-carve-photos.png", true, addOldStatus
                )}
                inProgress={Filter(goals.goals, "in_progress", Modal, 'https://i.postimg.cc/hP8bTspx/3836f8c0-0e42-4e08-baaa-4d629dbe4995-no-bg-preview-carve-photos-1.png', true, addOldStatus)}
                sportGoals={Filter(goalsSport, "not_started", Modal)}
                disciplineGoals={Filter(goalsDiscipline, "not_started", Modal)}
                spiritualityGoals={Filter(goalsSpirituality, "not_started", Modal)}
                selfDevelopmentGoals={Filter(goalsSelfDevelopment, "not_started", Modal)}
                userId={userId}
                NewGoals={NewGoals}
            />
            <ModalWindow
                isModalOpen={isModalOpen}
                addNewStatus={addNewStatus}
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

export default connect(mapStateToProps, { checkTimeGoalsSaving, deletePoints, deleteGoalsSaving, newStatusSavingGoal, newSavingGoal, NewGoals, addStatusNew, addGoals, addStatus, setPoints })(GoalsConteiner);
