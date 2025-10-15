import React, { useEffect, useRef } from "react";
import "./App.css";
import { Route, Routes, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import ProfileConteiner from "./Component/Profile/ProfileConteiner";
import GoalsConteiner from "./Component/Goals/GoalsConteiner";
import AchievementsConteiner from "./Component/Achievements/AchievementsConteiner";
import BottomNav from "./Component/BottomNav/BottomNav";
import { addProfile, setPoints } from "./redux/profile_reducer";
import { addGoals, addStatus } from "./redux/goals_reducer";
import { getAchievementsNewStatus, getInitializeAchievementsData } from "./redux/assignments_reducer";
import { toast } from "react-hot-toast";
import LoadingScreen from "./Component/LoadingScreen/LoadingScreen";
import { checkAll } from "./utils/checkAll/checkAll";
import { addTextGenerationData } from "./redux/generation_reducer";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const App = ({ addTextGenerationData, getAchievementsNewStatus, setPoints, addProfile, addGoals, addStatus, getInitializeAchievementsData, user, ThereAreUsers, assignments, goals }) => {
  const location = useLocation();
  const triggeredRef = useRef(new Set());

  const userRegistrationStub = user?.registrationDate;

  useEffect(() => {
    addProfile();
  }, []);

  const generation = (goals) => {

    const goalsDone = goals?.filter(g => g.status === "completed")
    const goalsInProgress = goals?.filter(g => g.status === "in_progress")
    const loading = true

    addTextGenerationData(user.telegramId, goalsDone, goalsInProgress, null, null, loading)

  }

  useEffect(() => {
    if (user && !ThereAreUsers) {
      addGoals(user.id);
      addStatus(user.id);
    }
  }, [user, ThereAreUsers]);

  const newStatusAssignment = (achievement, userId) => {
    getAchievementsNewStatus(achievement, userId)
    setPoints(userId, achievement.points)
    toast.success(`Вы получили новое достижение!`);
  };

  useEffect(() => {
    if (goals.length !== 0) {
      generation(goals);
    }
  }, [goals]);


  useEffect(() => {
    if (user && assignments.length === 0) {
      getInitializeAchievementsData(user.id);
    } else if (user && assignments.length !== 0) {
      checkAll(assignments, triggeredRef, goals, newStatusAssignment, user.id, userRegistrationStub);
    }
  }, [user, assignments]);


  if (!user) {
    return <LoadingScreen title="Загрузка данных пользователя..." />;
  }
  if (!ThereAreUsers) {
    return <LoadingScreen title="Загрузка целей пользователя..." />;
  }
  if (assignments.length === 0) {
    return <LoadingScreen title="Загрузка достижений пользователя..." />;
  }

  return (
    <div className="App">
      <Toaster position="top-center" reverseOrder={false} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/Motivation"
            element={
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.1 }}
              >
                <ProfileConteiner />
              </motion.div>
            }
          />
          <Route
            path="/goals"
            element={
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.1 }}
              >
                <GoalsConteiner />
              </motion.div>
            }
          />
          <Route
            path="/achievements"
            element={
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.1 }}
              >
                <AchievementsConteiner />
              </motion.div>
            }
          />
        </Routes>
      </AnimatePresence>
      <BottomNav />
    </div>
  );

};

const mapStateToProps = (state) => ({
  user: state.profile.profile,
  ThereAreUsers: state.goals.ThereAreUsers,
  theFirstTime: state.profile.theFirstTime,
  assignments: state.assignments.assignments,
  goals: state.goals.goals,
});

export default connect(mapStateToProps, {
  addProfile,
  addGoals,
  addStatus,
  getInitializeAchievementsData,
  setPoints,
  getAchievementsNewStatus,
  addTextGenerationData,
})(App);
