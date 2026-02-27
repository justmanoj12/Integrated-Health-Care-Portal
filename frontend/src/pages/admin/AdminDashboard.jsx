import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { adminService } from '../../services/api'
import { FiUsers, FiCalendar, FiFileText, FiActivity, FiBell, FiArrowRight, FiTrendingUp, FiEye, FiSend, FiX } from 'react-icons/fi'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import toast from 'react-hot-toast'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const AdminDashboard = () => {
  const { user } = useSelector(state => state.auth)
  const [analytics, setAnalytics] = useState(null)
  const [sqlSnapshots, setSqlSnapshots] = useState([])
  const [loading, setLoading] = useState(true)
  const [sqlStatus, setSqlStatus] = useState('loading')
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  // Default to Patients so we don't accidentally broadcast to everyone
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    recipientRole: 'patient',
    type: 'info'
  })

  useEffect(() => {
    fetchDashboardData()
    fetchSqlSnapshots()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await adminService.getDashboard()
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchSqlSnapshots = async () => {
    try {
      const response = await adminService.getSqlSnapshots()
      setSqlSnapshots(response.data.snapshots || [])
      setSqlStatus('ready')
    } catch (error) {
      if (error.response?.status === 503) {
        setSqlStatus('disabled')
      } else {
        setSqlStatus('error')
      }
    }
  }

  const handleSendNotification = async (e) => {
    e.preventDefault()
    try {
      await adminService.sendNotification(notificationForm)
      toast.success('Notification sent successfully!')
      setShowNotificationModal(false)
      // Reset to safe defaults (patients only)
      setNotificationForm({ title: '', message: '', recipientRole: 'patient', type: 'info' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notification')
    }
  }

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

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading dashboard</p>
      </div>
    )
  }

  const userChartData = {
    labels: Object.keys(analytics.analytics.users),
    datasets: [{
      label: 'Users by Role',
      data: Object.values(analytics.analytics.users),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 191, 36, 0.8)',
      ],
      borderWidth: 0,
    }],
  }

  const appointmentChartData = {
    labels: Object.keys(analytics.analytics.appointments.byStatus),
    datasets: [{
      label: 'Appointments by Status',
      data: Object.values(analytics.analytics.appointments.byStatus),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderRadius: 8,
    }],
  }

  const stats = [
    {
      label: 'Total Patients',
      value: analytics.analytics.users.patient || 0,
      icon: FiUsers,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      link: '/admin/patients'
    },
    {
      label: 'Total Doctors',
      value: analytics.analytics.users.doctor || 0,
      icon: FiActivity,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      link: '/admin/doctors'
    },
    {
      label: 'Total Appointments',
      value: analytics.analytics.appointments.total || 0,
      icon: FiCalendar,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      link: '/appointments'
    },
    {
      label: 'Total Prescriptions',
      value: analytics.analytics.prescriptions || 0,
      icon: FiFileText,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      link: '/prescriptions'
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">



      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide mb-1">
            Welcome back, {user?.profile?.firstName || user?.email || 'Admin'}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
            System overview & insights
          </h1>
          <p className="text-lg text-gray-600">Monitor users, appointments, and performance at a glance.</p>
        </div>
        <button
          onClick={() => setShowNotificationModal(true)}
          className="btn-primary flex items-center gap-2 animate-zoom-in"
        >
          <FiBell className="w-5 h-5" />
          Send Notification
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              to={stat.link}
              className="stat-card group hover-lift animate-scale-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-medium mb-2">{stat.label}</p>
                  <p className="text-4xl font-bold mb-1 gradient-text">{stat.value}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <FiTrendingUp className="w-3 h-3" />
                    <span>View all</span>
                  </div>
                </div>
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
            </Link>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-2xl font-bold mb-6 gradient-text">Users by Role</h2>
          <div className="h-64">
            <Doughnut 
              data={userChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="card animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-2xl font-bold mb-6 gradient-text">Appointments by Status</h2>
          <div className="h-64">
            <Bar 
              data={appointmentChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Appointments & SQL Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text">Recent Appointments</h2>
            <Link 
              to="/appointments" 
              className="text-blue-600 hover:text-indigo-600 text-sm font-semibold flex items-center gap-1 group"
            >
              View all
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <div className="space-y-3">
              {analytics.recentAppointments?.slice(0, 5).map((apt, idx) => (
                <div
                  key={apt._id}
                  className="p-4 border-l-4 border-blue-500 rounded-r-xl bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 transition-all duration-300 animate-slide-in-right"
                  style={{ animationDelay: `${0.7 + idx * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{apt.reason}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {apt.patientId?.profile?.firstName} {apt.patientId?.profile?.lastName} • 
                        {new Date(apt.appointmentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      apt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <h2 className="text-2xl font-bold mb-6 gradient-text">SQL Analytics Snapshots</h2>
          {sqlStatus === 'disabled' && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">PostgreSQL not configured</p>
            </div>
          )}
          {sqlStatus === 'ready' && sqlSnapshots.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No snapshots captured yet</p>
            </div>
          )}
          {sqlStatus === 'ready' && sqlSnapshots.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 font-semibold text-gray-700">Captured</th>
                    <th className="text-left py-3 font-semibold text-gray-700">Patients</th>
                    <th className="text-left py-3 font-semibold text-gray-700">Doctors</th>
                    <th className="text-left py-3 font-semibold text-gray-700">Appointments</th>
                    <th className="text-left py-3 font-semibold text-gray-700">Prescriptions</th>
                  </tr>
                </thead>
                <tbody>
                  {sqlSnapshots.slice(0, 5).map((snap, idx) => (
                    <tr 
                      key={`${snap.captured_at}-${idx}`} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 text-gray-600">{new Date(snap.captured_at).toLocaleString()}</td>
                      <td className="py-3 font-semibold text-blue-600">{snap.patients}</td>
                      <td className="py-3 font-semibold text-green-600">{snap.doctors}</td>
                      <td className="py-3 font-semibold text-yellow-600">{snap.appointments}</td>
                      <td className="py-3 font-semibold text-purple-600">{snap.prescriptions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-zoom-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold gradient-text">Send Notification</h3>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                  className="input-field"
                  required
                  placeholder="Notification title"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                  className="input-field min-h-[100px]"
                  required
                  placeholder="Notification message"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Recipient</label>
                <select
                  value={notificationForm.recipientRole}
                  onChange={(e) => setNotificationForm({ ...notificationForm, recipientRole: e.target.value })}
                  className="input-field"
                >
                  <option value="all">All Users</option>
                  <option value="patient">Patients Only</option>
                  <option value="doctor">Doctors Only</option>
                  <option value="admin">Admins Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <select
                  value={notificationForm.type}
                  onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value })}
                  className="input-field"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNotificationModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <FiSend className="w-4 h-4" />
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
