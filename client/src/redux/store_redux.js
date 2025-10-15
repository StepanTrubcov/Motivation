import { configureStore } from '@reduxjs/toolkit';
import ProfileReducer from './profile_reducer';
import GoalsReducer from './goals_reducer';
import AssignmentsReducer from './assignments_reducer';
import CalendarReducer from './calendar_reducer';
import GenerationReducer from './generation_reducer';

const store = configureStore({
  reducer: {
    profile: ProfileReducer,
    goals: GoalsReducer,
    assignments: AssignmentsReducer,
    calendar: CalendarReducer,
    generation:GenerationReducer,
  },
});

// Только в браузере добавляем store в window для дебаггинга
if (typeof window !== 'undefined') {
  window.store = store;
}

export default store