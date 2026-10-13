import { configureStore } from '@reduxjs/toolkit';
import assignmentsReducer from '../features/assignments/assignmentsSlice';
import { logger } from 'redux-logger';

const isDev = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV);

export const store = configureStore({
  reducer: {
    assignments: assignmentsReducer,
    deadlines: assignmentsReducer
  },
  middleware: (getDefaultMiddleware) => {
    const middlewares = getDefaultMiddleware();
    if (isDev) {
      return middlewares.concat(logger);
    }
    return middlewares;
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export function setupTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      assignments: assignmentsReducer,
      deadlines: assignmentsReducer
    },
    preloadedState: preloadedState as RootState | undefined
  });
}
