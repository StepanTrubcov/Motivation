import React, { useEffect, useState } from 'react';
import './App.css';
import ProfileConteiner from './Component/Profile/ProfileConteiner';
import { connect } from 'react-redux';
import { addProfile } from './redux/profile_reducer';
import BottomNav from './Component/BottomNav/BottomNav'

const App = (props) => {


  useEffect(() => {
    props.addProfile();
  }, []);

  if (!props.user) {
    return <div className="App">Загрузка данных пользователя...</div>;
  }

  return (
    <div className="App">
      <ProfileConteiner />
      <BottomNav />
    </div>
  );
}

const mapStateToProps = (state) => ({
  user: state.profile.profile
})

export default connect(mapStateToProps, { addProfile })(App);