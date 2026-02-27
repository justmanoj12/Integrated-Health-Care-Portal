import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  FiHome,
  FiCalendar,
  FiFileText,
  FiUsers,
  FiUser,
  FiActivity,
  FiSettings,
} from 'react-icons/fi'

const Sidebar = ({ isOpen }) => {
  const location = useLocation()
  const { user } = useSelector(state => state.auth)

  const patientMenu = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/doctors', label: 'Find Doctors', icon: FiUsers },
    { path: '/appointments', label: 'Appointments', icon: FiCalendar },
    { path: '/prescriptions', label: 'Prescriptions', icon: FiFileText },
    { path: '/medical-records', label: 'Medical Records', icon: FiFileText },
    { path: '/profile', label: 'Profile', icon: FiUser },
  ]

  const doctorMenu = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/appointments', label: 'Appointments', icon: FiCalendar },
    { path: '/prescriptions', label: 'Prescriptions', icon: FiFileText },
    { path: '/profile', label: 'Profile', icon: FiUser },
  ]

  const adminMenu = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/admin/doctor-requests', label: 'Doctor Requests', icon: FiActivity },
    { path: '/admin/doctors', label: 'All Doctors', icon: FiUsers },
    { path: '/admin/patients', label: 'All Patients', icon: FiUsers },
    { path: '/appointments', label: 'All Appointments', icon: FiCalendar },
    { path: '/prescriptions', label: 'Prescriptions', icon: FiFileText },
    { path: '/profile', label: 'Profile', icon: FiUser },
  ]

  const menuItems = user?.role === 'patient' 
    ? patientMenu 
    : user?.role === 'doctor' 
    ? doctorMenu 
    : adminMenu

  if (!isOpen) return null

  return (
   <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white/80 backdrop-blur-md shadow-xl overflow-y-auto border-r border-gray-200/50 z-40">
  
  {/* MENU */}
  <nav className="p-4 pt-10">

    <ul className="space-y-2 border-t pt-4">
      {menuItems.map((item, idx) => {
        const Icon = item.icon
        const isActive = location.pathname === item.path

        return (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'}`} />
              <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-blue-600'}`}>
                {item.label}
              </span>

              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  </nav>
</aside>

  )
}

export default Sidebar
