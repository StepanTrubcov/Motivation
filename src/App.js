import React, { useEffect, useState } from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import ProfileConteiner from './Component/Profile/ProfileConteiner';
import { connect } from 'react-redux';
import { addProfile } from './redux/profile_reducer';
import BottomNav from './Component/BottomNav/BottomNav';
import GoalsConteiner from './Component/Goals/GoalsConteiner';
import { addGoals } from './redux/goals_reducer';
import { Toaster } from "react-hot-toast";
import AchievementsConteiner from './Component/Achievements/AchievementsConteiner';


const App = (props) => {
  useEffect(() => {
    props.addProfile();
  }, []);

  if (!props.user) {
    return <div className="loading-wrapper">
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
  }
  else if (!props.ThereAreUsers) {
    props.addGoals(props.user.id)
    return <div className="loading-wrapper">
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
  }

  // if (props.theFirstTime) {
  //   return <About />
  // }

  return (
    <div className="App">
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/Motivation" element={<ProfileConteiner />} />
        <Route path="/goals" element={<GoalsConteiner />} />
        <Route path="/achievements" element={<AchievementsConteiner />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

const mapStateToProps = (state) => ({
  user: state.profile.profile,
  ThereAreUsers: state.goals.ThereAreUsers,
  theFirstTime: state.profile.theFirstTime
})

export default connect(mapStateToProps, { addProfile, addGoals })(App);