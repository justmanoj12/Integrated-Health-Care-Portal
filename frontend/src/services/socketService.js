import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { store } from '../store/store'

import { addNotification } from '../store/slices/notificationSlice'
import { updateAppointment } from '../store/slices/appointmentSlice'

let socket = null

const joinUserRoom = () => {
  if (!socket?.connected) {
    console.warn('⚠️ Socket not connected, cannot join room')
    return false
  }

  const user = store.getState().auth.user
  // Support both _id (MongoDB) and id formats
  const userId = user?._id || user?.id

  if (userId) {
    // Join per-user room so backend can target notifications correctly
    // Convert to string to ensure consistent format
    const userIdString = userId.toString()
    console.log('🔌 Joining room:', `user-${userIdString}`, 'for user:', user?.email || user?.profile?.firstName || 'unknown')
    socket.emit('join-room', userIdString)
    return true
  } else {
    console.warn('⚠️ No user ID found, cannot join notification room')
    console.log('Current user state:', user)
    return false
  }
}

export const initializeSocket = (token) => {
  if (socket?.connected) {
    // If already connected, try to join room again (in case user changed)
    joinUserRoom()
    return socket
  }

  // Socket server runs on the same host as API (Express)
  // Socket.IO cannot use HTTP proxy, must connect directly to backend port
  // IMPORTANT: Socket must connect to the SAME port as your backend server
  
  // First, check if VITE_API_SOCKET_URL is explicitly set
  let SOCKET_URL = import.meta.env.VITE_API_SOCKET_URL
  
  // If not set, extract from VITE_API_URL
  if (!SOCKET_URL) {
    const apiUrl = import.meta.env.VITE_API_URL
    
    if (apiUrl && typeof apiUrl === 'string' && apiUrl.startsWith('http')) {
      // Extract port from API URL - socket must use same port
      // Example: http://localhost:5001/api -> http://localhost:5001
      const urlMatch = apiUrl.match(/^(https?:\/\/[^\/]+)/)
      if (urlMatch) {
        SOCKET_URL = urlMatch[1] // Gets http://localhost:5001
      } else {
        // Fallback: remove /api suffix
        SOCKET_URL = apiUrl.replace(/\/api\/?$/, '')
      }
    } else {
      // Fallback: try to use vite proxy target (port 5000)
      SOCKET_URL = 'http://localhost:5000'
    }
  }

  // Log for debugging
  console.log('🔌 Socket Configuration:')
  console.log('  - VITE_API_SOCKET_URL:', import.meta.env.VITE_API_SOCKET_URL || '(not set)')
  console.log('  - VITE_API_URL:', import.meta.env.VITE_API_URL || '(not set)')
  console.log('  - Final SOCKET_URL:', SOCKET_URL)
  console.log('  - User:', store.getState().auth.user?.email || 'Not logged in')
  
  // Warn if there's a port mismatch
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.includes('5001') && SOCKET_URL.includes('5000')) {
    console.error('❌ PORT MISMATCH: API is on 5001 but socket connecting to 5000!')
    console.error('   Fix: Set VITE_API_SOCKET_URL=http://localhost:5001 or ensure backend runs on 5000')
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  })

  socket.on('connect', () => {
    console.log('✅ Socket connected, socket ID:', socket.id)
    // Try to join room immediately
    joinUserRoom()
    
    // Also try again after a short delay in case user isn't loaded yet
    setTimeout(() => {
      joinUserRoom()
    }, 1000)
  })

  socket.on('room-joined', (data) => {
    console.log('✅ Successfully joined room:', data.roomName, 'for user:', data.userId)
  })

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error)
    console.error('❌ Attempted to connect to:', SOCKET_URL)
    console.error('❌ Error details:', error.message)
  })

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason)
    if (reason === 'io server disconnect') {
      // Server disconnected the socket, try to reconnect manually
      socket.connect()
    }
  })

  socket.on('reconnect', (attemptNumber) => {
    console.log('✅ Socket reconnected after', attemptNumber, 'attempts')
    joinUserRoom()
  })

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('🔄 Reconnection attempt', attemptNumber)
  })

  socket.on('reconnect_error', (error) => {
    console.error('❌ Reconnection error:', error)
  })

  socket.on('reconnect_failed', () => {
    console.error('❌ Socket reconnection failed after all attempts')
  })

  socket.on('new-appointment', (data) => {
    toast.success(data.message || 'New appointment request')
    store.dispatch(addNotification({
      type: 'appointment',
      title: 'New Appointment',
      message: data.message,
      data: data.appointment,
    }))
  })

  socket.on('appointment-updated', (data) => {
    toast.success(data.message || 'Appointment updated')
    store.dispatch(updateAppointment(data.appointment))
    store.dispatch(addNotification({
      type: 'appointment',
      title: 'Appointment Updated',
      message: data.message,
      data: data.appointment,
    }))
  })

  socket.on('prescription-created', (data) => {
    toast.success(data.message || 'New prescription available')
    store.dispatch(addNotification({
      type: 'prescription',
      title: 'New Prescription',
      message: data.message,
      data: data.prescription,
    }))
  })

  // Real-time admin → user notifications
  socket.on('notification', (data) => {
    console.log('🔔 Notification received:', data)
    
    // Show toast notification
    const toastMessage = data.title || 'New notification'
    if (data.type === 'success') {
      toast.success(toastMessage)
    } else if (data.type === 'error') {
      toast.error(toastMessage)
    } else if (data.type === 'warning') {
      toast(toastMessage, { icon: '⚠️' })
    } else {
      toast(toastMessage, { icon: 'ℹ️' })
    }
    
    // Add to Redux store
    store.dispatch(addNotification({
      id: data.id,
      type: data.type || 'info',
      title: data.title || 'Notification',
      message: data.message || '',
      timestamp: data.timestamp || new Date().toISOString(),
      read: false,
    }))
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const reconnectSocket = (token) => {
  console.log('🔄 Manually reconnecting socket...')
  if (socket) {
    socket.disconnect()
    socket = null
  }
  return initializeSocket(token)
}

export const getSocket = () => socket

export const isSocketConnected = () => {
  return socket?.connected || false
}
