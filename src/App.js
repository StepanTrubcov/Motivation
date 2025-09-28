import React, { useEffect } from 'react';
import './App.css';
import { Route, Routes, useLocation } from 'react-router-dom';
import ProfileConteiner from './Component/Profile/ProfileConteiner';
import { connect } from 'react-redux';
import { addProfile } from './redux/profile_reducer';
import BottomNav from './Component/BottomNav/BottomNav';
import GoalsConteiner from './Component/Goals/GoalsConteiner';
import { addGoals, addStatus } from './redux/goals_reducer';
import { Toaster } from "react-hot-toast";
import AchievementsConteiner from './Component/Achievements/AchievementsConteiner';
import { AnimatePresence, motion } from "framer-motion";
import { getInitializeAchievementsData } from './redux/assignments_reducer';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const App = (props) => {
  const location = useLocation();

  useEffect(() => {
    props.addProfile();
  }, []);

  if (!props.user) {
    return (
      <div className="loading-wrapper">
        <div className="loading-box">
          <h2 className="loading-title">Загрузка данных пользователя...</h2>
          <p className="loading-text">
            Если приложение не запускается попробуйте зайти чуть позже, когда нагрузка уменьшится.
          </p>
          <p className="loading-support">
            Чтобы приложение работало стабильнее, вы можете нас поддержать!
            <br />
            Информация о поддержке доступна в нашем Telegram-боте.
          </p>
        </div>
      </div>
    )
  } else if (!props.ThereAreUsers) {
    props.addGoals(props.user.id)
    props.addStatus(props.user.id)
    return (
      <div className="loading-wrapper">
        <div className="loading-box">
          <h2 className="loading-title">Загрузка целей пользователя...</h2>
          <p className="loading-text">
            Если приложение не запускается попробуйте зайти чуть позже, когда нагрузка уменьшится.
          </p>
          <p className="loading-support">
            Чтобы приложение работало стабильнее, вы можете нас поддержать!
            <br />
            Информация о поддержке доступна в нашем Telegram-боте.
          </p>
        </div>
      </div>
    )
  } else if (props.assignments.length === 0) {
    props.getInitializeAchievementsData(props.user.id)
    return (
      <div className="loading-wrapper">
        <div className="loading-box">
          <h2 className="loading-title">Загрузка достижений пользователя...</h2>
          <p className="loading-text">
            Если приложение не запускается попробуйте зайти чуть позже, когда нагрузка уменьшится.
          </p>
          <p className="loading-support">
            Чтобы приложение работало стабильнее, вы можете нас поддержать!
            <br />
            Информация о поддержке доступна в нашем Telegram-боте.
          </p>
        </div>
      </div>
    )
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
}

const mapStateToProps = (state) => ({
  user: state.profile.profile,
  ThereAreUsers: state.goals.ThereAreUsers,
  theFirstTime: state.profile.theFirstTime,
  assignments: state.assignments.assignments,
})

export default connect(mapStateToProps, { addProfile, addGoals, addStatus, getInitializeAchievementsData })(App);
