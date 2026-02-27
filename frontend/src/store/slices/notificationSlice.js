import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  notifications: [],
  unreadCount: 0,
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const incoming = action.payload || {}

      // Avoid duplicate notifications by ID if server sends one
      if (incoming.id && state.notifications.some(n => n.id === incoming.id)) {
        return
      }

      const notification = {
        ...incoming,
        id: incoming.id ?? Date.now(),
        read: incoming.read ?? false,
        timestamp: incoming.timestamp ?? new Date().toISOString(),
      }

      state.notifications.unshift(notification)

      if (!notification.read) {
        state.unreadCount += 1
      }
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(
        n => n.id === action.payload
      )
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => {
        if (!n.read) {
          n.read = true
        }
      })
      state.unreadCount = 0
    },
    clearNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
    },
  },
})

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} = notificationSlice.actions
export default notificationSlice.reducer

