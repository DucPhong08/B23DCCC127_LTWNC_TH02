import { configureStore, type Middleware } from '@reduxjs/toolkit';
import assignmentsReducer from '../features/assignments/assignmentsSlice';
import logger from 'redux-logger';

// Chỉ bật redux-logger ở môi trường development
const isDev = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV);

// Xử lý ESM/CJS interop cho redux-logger
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reduxLoggerMiddleware = (logger as any)?.default || (logger as any)?.logger || logger;

export const store = configureStore({
  reducer: {
    assignments: assignmentsReducer,
    deadlines: assignmentsReducer
  },
  middleware: (getDefaultMiddleware) => {
    const middlewares = getDefaultMiddleware();
    if (isDev && typeof reduxLoggerMiddleware === 'function') {
      return middlewares.concat(reduxLoggerMiddleware as Middleware);
    }
    return middlewares;
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export function setupTestStore(preloadedState?: Partial<RootState>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: any = {
    reducer: {
      assignments: assignmentsReducer,
      deadlines: assignmentsReducer
    }
  };
  if (preloadedState) {
    options.preloadedState = preloadedState;
  }
  return configureStore(options);
}
