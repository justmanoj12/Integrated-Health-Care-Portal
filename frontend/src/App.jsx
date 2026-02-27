import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setUser, clearUser } from './store/slices/authSlice'
import { initializeSocket, getSocket } from './services/socketService'
import { authService } from './services/api'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PatientDashboard from './pages/patient/PatientDashboard'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import AllDoctors from './pages/admin/AllDoctors'
import AllPatients from './pages/admin/AllPatients'
import DoctorRequests from './pages/admin/DoctorRequests'
import Appointments from './pages/Appointments'
import Prescriptions from './pages/Prescriptions'
import Profile from './pages/Profile'
import DoctorsList from './pages/patient/DoctorsList'
import BookAppointment from './pages/patient/BookAppointment'
import MedicalRecords from './pages/patient/MedicalRecords'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

function App() {
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector(state => state.auth)

  useEffect(() => {
    // Check for existing authentication
    const token = localStorage.getItem('token')
    if (token) {
      authService.getCurrentUser()
        .then(response => {
          dispatch(setUser(response.data.user))
          // Initialize socket after user is set
          setTimeout(() => {
            initializeSocket(token)
          }, 100)
        })
        .catch(() => {
          localStorage.removeItem('token')
          dispatch(clearUser())
        })
    }
  }, [dispatch])

  // Re-join socket room when user changes
  useEffect(() => {
    if (user) {
      const currentSocket = getSocket()
      if (currentSocket?.connected) {
        const userId = user._id || user.id
        if (userId) {
          console.log('🔄 User changed, re-joining room:', `user-${userId.toString()}`)
          currentSocket.emit('join-room', userId.toString())
        }
      }
    }
  }, [user])

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
      
      <Route element={<Layout />}>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            {user?.role === 'patient' && <PatientDashboard />}
            {user?.role === 'doctor' && <DoctorDashboard />}
            {user?.role === 'admin' && <AdminDashboard />}
            {!user && <Navigate to="/login" />}
          </ProtectedRoute>
        } />
        
        <Route path="/appointments" element={
          <ProtectedRoute>
            <Appointments />
          </ProtectedRoute>
        } />
        
        <Route path="/prescriptions" element={
          <ProtectedRoute>
            <Prescriptions />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        {/* Patient Routes */}
        <Route path="/doctors" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <DoctorsList />
          </ProtectedRoute>
        } />
        
        <Route path="/book-appointment/:doctorId" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <BookAppointment />
          </ProtectedRoute>
        } />
        
        <Route path="/medical-records" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <MedicalRecords />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/doctors" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AllDoctors />
          </ProtectedRoute>
        } />
        <Route path="/admin/doctor-requests" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DoctorRequests />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/patients" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AllPatients />
          </ProtectedRoute>
        } />
      </Route>
      
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

export default App

