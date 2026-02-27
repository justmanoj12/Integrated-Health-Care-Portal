import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { clearError } from '../store/slices/authSlice'

import PatientDashboard from './patient/PatientDashboard'
import DoctorDashboard from './doctor/DoctorDashboard'
import AdminDashboard from './admin/AdminDashboard'



const Dashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)

  useEffect(() => {
    dispatch(clearError())   // ✅ THIS IS THE FIX
  }, [])

  if (user?.role === 'patient') return <PatientDashboard />
  if (user?.role === 'doctor') return <DoctorDashboard />
  if (user?.role === 'admin') return <AdminDashboard />

  return <div>Loading...</div>
}


export default Dashboard

