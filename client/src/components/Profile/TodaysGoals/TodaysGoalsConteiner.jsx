'use client';
import React, { useState, useEffect } from "react";
import TodaysGoals from "./TodaysGoals";
import { connect } from "react-redux";
import Filter from "../../../utils/Filter/filter";
import { addStatusNew, addGoals, addStatus, newStatusSavingGoal, deleteGoalsSaving,checkTimeGoalsSaving } from "../../../redux/goals_reducer";
import { toast } from "react-hot-toast";
import ModalWindow from "../../../utils/ModalWindow/ModalWindow";
import { setPoints, deletePoints } from "../../../redux/profile_reducer";

const TodaysGoalsConteiner = ({checkTimeGoalsSaving,  deletePoints, deleteGoalsSaving, newStatusSavingGoal, profile, addStatusNew, goals, userId, addStatus, addGoals, setPoints }) => {

    const [home, setHome] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            addStatus(userId)
            addGoals(userId)
        }
    }, [userId, addGoals, addStatus]);

    const Modal = (goal) => {
        if (goal.status === "in_progress") {
            const goalData = {
                points: goal.points,
                id: goal.id
            }
            if (loading) {
                addNewStatusDone(goalData)
            }
        }

        if (goal.status === "completed") {
            const goalData = {
                points: goal.points,
                id: goal.id
            }
            if (loading) {
                addNewStatusInProgress(goalData)
            }
        }

    };

    const addNewStatusInProgress = async (goalData) => {
        const until = new Date().toISOString().slice(0, 10);
        try {
            setLoading(false)
            const loadingToast = toast.loading("Отменяем выполнение цели...", {
                style: {
                    background: '#333',
                    color: '#fff',
                },
                icon: <img src="https://media.tenor.com/Pq1cZiuhlEEAAAAi/rajinikanth.gif" unoptimized alt="Loading" style={{ width: '20px', height: '20px' }} />
            });
            await addStatusNew(goalData.id, userId, "in_progress");
            await deletePoints(userId, goalData.points)
            await checkTimeGoalsSaving(profile.telegramId)
            await addStatus(userId);

            const result = await newStatusSavingGoal(profile.telegramId, until, goalData.id, "in_progress")

            if (result) {
                setLoading(true)
            }
            toast.dismiss(loadingToast);
            toast.success("Цель успешно перемещена в раздел 'В процессе'!", {
                style: {
                    background: '#333',
                    color: '#fff',
                }
            });

        } catch (error) {
            console.error("Ошибка при изменении статуса цели цели:", error);
            toast.error("Не удалось переместить цель в раздел 'В процессе'. Попробуйте снова.", {
                style: {
                    background: '#333',
                    color: '#fff',
                }
            });
        }
    };

    const addNewStatusDone = async (isModalOpen) => {
        const until = new Date().toISOString().slice(0, 10);
        try {
            setLoading(false)
            const loadingToast = toast.loading("Выполняем цель...", {
                style: {
                    background: '#333',
                    color: '#fff',
                },
                icon: <img src="https://media.tenor.com/Pq1cZiuhlEEAAAAi/rajinikanth.gif" unoptimized alt="Loading" style={{ width: '20px', height: '20px' }} />
            });
            addStatusNew(isModalOpen.id, userId, "done");
            checkTimeGoalsSaving(profile.telegramId)
            setPoints(userId, isModalOpen.points)
            await addStatus(userId);
            addGoals(userId)

            const result = await newStatusSavingGoal(profile.telegramId, until, isModalOpen.id, "completed")

            if (result) {
                setLoading(true)
            }
            toast.dismiss(loadingToast);
            toast.success("Цель успешно выполнена!", {
                style: {
                    background: '#333',
                    color: '#fff',
                }
            })
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

    return <div>
        <TodaysGoals
            completed={Filter(
                goals.goals,
                "completed",
                Modal,
                "https://i.postimg.cc/g00CMHm0/png-clipart-information-management-service-compute-no-bg-preview-carve-photos.png",
                false,
                addOldStatus
            )}
            inProgress={Filter(goals.goals, "in_progress", Modal, 'https://i.postimg.cc/hP8bTspx/3836f8c0-0e42-4e08-baaa-4d629dbe4995-no-bg-preview-carve-photos-1.png', false, addOldStatus)} />
    </div>
}

const mapStateToProps = (state) => ({
    profile: state.profile.profile,
    goals: state.goals,
    userId: state.profile.profile.id,
})

export default connect(mapStateToProps, { checkTimeGoalsSaving, deletePoints, deleteGoalsSaving, newStatusSavingGoal, addStatusNew, addStatus, addGoals, setPoints })(TodaysGoalsConteiner);