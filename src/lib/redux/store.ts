import { configureStore } from '@reduxjs/toolkit';
import { studyGroupSlice } from './slices/studyGroupSlice';
import { notificationSlice } from './slices/notificationSlice';
import { userSlice } from './slices/userSlice';
import { studyGroupApi } from './slices/studyGroupApi';

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    studyGroups: studyGroupSlice.reducer,
    notifications: notificationSlice.reducer,
    [studyGroupApi.reducerPath]: studyGroupApi.reducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(studyGroupApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 