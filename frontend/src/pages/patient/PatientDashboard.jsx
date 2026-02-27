import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { appointmentService } from '../../services/api'
import { setAppointments } from '../../store/slices/appointmentSlice'
import { FiCalendar, FiFileText, FiUsers, FiClock, FiArrowRight, FiTrendingUp } from 'react-icons/fi'
import { format } from 'date-fns'

const PatientDashboard = () => {
  const dispatch = useDispatch()

const { user } = useSelector(state => state.auth)   // ✅ ADD THIS
const { appointments } = useSelector(state => state.appointments)

  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    pending: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getAll()
      dispatch(setAppointments(response.data.appointments))
      
      const stats = {
        upcoming: response.data.appointments.filter(
          apt => apt.status === 'confirmed' && new Date(apt.appointmentDate) > new Date()
        ).length,
        completed: response.data.appointments.filter(apt => apt.status === 'completed').length,
        pending: response.data.appointments.filter(apt => apt.status === 'pending').length,
      }
      setStats(stats)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'confirmed' && new Date(apt.appointmentDate) > new Date())
    .slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-5xl font-bold gradient-text mb-3">
  Welcome back, {user?.profile?.firstName || user?.email || 'there'} 
</h1>

        <p className="text-xl text-gray-600">Here's your health overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card group animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Upcoming</p>
              <p className="text-4xl font-bold text-blue-600 mb-1">{stats.upcoming}</p>
              <p className="text-xs text-gray-500">Appointments</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FiCalendar className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>

        <div className="stat-card group animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Completed</p>
              <p className="text-4xl font-bold text-green-600 mb-1">{stats.completed}</p>
              <p className="text-xs text-gray-500">Visits</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FiFileText className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>

        <div className="stat-card group animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Pending</p>
              <p className="text-4xl font-bold text-yellow-600 mb-1">{stats.pending}</p>
              <p className="text-xs text-gray-500">Requests</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FiClock className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="card animate-scale-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Upcoming Appointments</h2>
            <Link 
              to="/appointments" 
              className="text-blue-600 hover:text-indigo-600 text-sm font-semibold flex items-center gap-1 group"
            >
              View all
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-12">
              <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming appointments</p>
              <Link to="/doctors" className="text-blue-600 hover:underline mt-2 inline-block">
                Book one now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((apt, idx) => (
                <div 
                  key={apt._id} 
                  className="border-l-4 border-blue-500 pl-4 py-3 rounded-r-xl bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${0.5 + idx * 0.1}s` }}
                >
                  <p className="font-semibold text-gray-800 mb-1">{apt.reason}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <FiCalendar className="w-4 h-4" />
                    {format(new Date(apt.appointmentDate), 'PPP')} at {apt.appointmentTime}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card animate-scale-in" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <Link
              to="/doctors"
              className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <FiUsers className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Find Doctors</p>
                <p className="text-sm text-gray-600">Book an appointment with a doctor</p>
              </div>
              <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>
            <Link
              to="/prescriptions"
              className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <FiFileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">View Prescriptions</p>
                <p className="text-sm text-gray-600">Access your prescriptions</p>
              </div>
              <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDashboard
