import { configureStore } from '@reduxjs/toolkit';
import ProfileReducer from './profile_reducer';

const store = configureStore({
  reducer: {
    profile:ProfileReducer,
  },
});

window.store = store;

export default store