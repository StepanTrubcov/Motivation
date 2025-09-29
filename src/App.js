import React, { useEffect } from "react";
import "./App.css";
import { Route, Routes, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

import ProfileConteiner from "./Component/Profile/ProfileConteiner";
import GoalsConteiner from "./Component/Goals/GoalsConteiner";
import AchievementsConteiner from "./Component/Achievements/AchievementsConteiner";
import BottomNav from "./Component/BottomNav/BottomNav";

import { addProfile } from "./redux/profile_reducer";
import { addGoals, addStatus } from "./redux/goals_reducer";
import { getInitializeAchievementsData } from "./redux/assignments_reducer";

import LoadingScreen from "./Component/LoadingScreen/LoadingScreen";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const App = (props) => {
  const { user, ThereAreUsers, assignments } = props;
  const location = useLocation();

  useEffect(() => {
    props.addProfile();
  }, []);

  useEffect(() => {
    if (user && !ThereAreUsers) {
      props.addGoals(user.id);
      props.addStatus(user.id);
    }
  }, [user, ThereAreUsers]);

  useEffect(() => {
    if (user && assignments.length === 0) {
      props.getInitializeAchievementsData(user.id);
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
});

export default connect(mapStateToProps, {
  addProfile,
  addGoals,
  addStatus,
  getInitializeAchievementsData,
})(App);
