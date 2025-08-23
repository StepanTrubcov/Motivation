import { configureStore } from '@reduxjs/toolkit';
import ProfileReducer from './profile_reducer';
import GoalsReducer from './goals_reducer';

const store = configureStore({
  reducer: {
    profile:ProfileReducer,
    goals:GoalsReducer,
  },
});

window.store = store;

export default store