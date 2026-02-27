import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { appointmentService } from '../../services/api'
import { setAppointments } from '../../store/slices/appointmentSlice'
import { FiCalendar, FiUsers, FiClock, FiCheckCircle, FiArrowRight, FiTrendingUp, FiStar } from 'react-icons/fi'
import { format } from 'date-fns'

const DoctorDashboard = () => {
  const dispatch = useDispatch()
  const { appointments } = useSelector(state => state.appointments)
  const { user } = useSelector(state => state.auth)
  const [stats, setStats] = useState({
    today: 0,
    pending: 0,
    completed: 0,
    upcoming: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      const response = await appointmentService.getAll()
      dispatch(setAppointments(response.data.appointments))

      const allAppointments = response.data.appointments
      const todayAppts = allAppointments.filter(
        apt => format(new Date(apt.appointmentDate), 'yyyy-MM-dd') === today
      )

      const stats = {
        today: todayAppts.length,
        pending: allAppointments.filter(apt => apt.status === 'pending').length,
        completed: allAppointments.filter(apt => apt.status === 'completed').length,
        upcoming: allAppointments.filter(
          apt => apt.status === 'confirmed' && new Date(apt.appointmentDate) > new Date()
        ).length,
      }
      setStats(stats)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const todayAppointments = appointments
    .filter(apt => format(new Date(apt.appointmentDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: "Today's Appointments",
      value: stats.today,
      icon: FiCalendar,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: FiClock,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: FiCheckCircle,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Upcoming',
      value: stats.upcoming,
      icon: FiTrendingUp,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Avg Rating',
      value: user?.doctorInfo?.averageRating ? user.doctorInfo.averageRating.toFixed(1) : 'N/A',
      icon: FiStar,
      color: 'from-yellow-400 to-orange-400',
      bgColor: 'bg-yellow-50',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="animate-slide-up">
        <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-1">
          Welcome back, {user?.profile?.firstName ? `Dr. ${user.profile.firstName}` : 'Doctor'}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
          Your clinic at a glance
        </h1>
        <p className="text-lg text-gray-600">
          Review today&apos;s schedule and manage upcoming appointments.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="stat-card group hover-lift animate-scale-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-medium mb-2">{stat.label}</p>
                  <p className="text-4xl font-bold mb-1 gradient-text">{stat.value}</p>
                </div>
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
            </div>
          )
        })}
      </div>

      {/* Today's Schedule */}
      <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">Today's Schedule</h2>
          <Link
            to="/appointments"
            className="text-blue-600 hover:text-indigo-600 text-sm font-semibold flex items-center gap-1 group"
          >
            View all
            <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        {todayAppointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCalendar className="w-10 h-10 text-blue-600" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No appointments scheduled for today</p>
            <p className="text-gray-400 text-sm mt-2">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((apt, idx) => (
              <div
                key={apt._id}
                className="p-4 border-l-4 border-blue-500 rounded-r-xl bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 transition-all duration-300 animate-slide-in-right group"
                style={{ animationDelay: `${0.5 + idx * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                      {apt.reason}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FiClock className="w-4 h-4" />
                        <span className="font-medium">{apt.appointmentTime}</span>
                      </div>
                      {apt.patientId && (
                        <div className="flex items-center gap-2">
                          <FiUsers className="w-4 h-4" />
                          <span className="font-medium">
                            {apt.patientId.profile?.firstName} {apt.patientId.profile?.lastName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/appointments"
          className="card hover-lift animate-scale-in group"
          style={{ animationDelay: '0.6s' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <FiCalendar className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                Manage Appointments
              </h3>
              <p className="text-sm text-gray-600 mt-1">View and manage all appointments</p>
            </div>
            <FiArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          to="/prescriptions"
          className="card hover-lift animate-scale-in group"
          style={{ animationDelay: '0.7s' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <FiCheckCircle className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                Prescriptions
              </h3>
              <p className="text-sm text-gray-600 mt-1">Create and manage prescriptions</p>
            </div>
            <FiArrowRight className="w-6 h-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>
    </div>
  )
}

export default DoctorDashboard
