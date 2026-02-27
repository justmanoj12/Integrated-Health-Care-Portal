import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import appointmentReducer from './slices/appointmentSlice'
import notificationReducer from './slices/notificationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentReducer,
    notifications: notificationReducer,
  },
})

export default store

