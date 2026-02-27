import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { clearUser } from '../store/slices/authSlice'
import { authService } from '../services/api'
import { disconnectSocket } from '../services/socketService'
import { FiMenu, FiBell, FiLogOut, FiUser, FiHeart } from 'react-icons/fi'

const roleStyles = {
  patient: {
    badgeText: 'Patient Portal',
    badgeClasses:
      'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
  },
  doctor: {
    badgeText: 'Doctor Portal',
    badgeClasses:
      'bg-gradient-to-r from-sky-500 to-blue-600 text-white',
  },
  admin: {
    badgeText: 'Admin Panel',
    badgeClasses:
      'bg-gradient-to-r from-purple-500 to-pink-600 text-white',
  },
}

const Navbar = ({ onMenuClick, onNotificationClick }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { unreadCount } = useSelector(state => state.notifications)

  const handleLogout = async () => {
    try {
      await authService.logout()
      dispatch(clearUser())
      disconnectSocket()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      dispatch(clearUser())
      disconnectSocket()
      navigate('/login')
    }
  }

  const currentRole = user?.role
  const roleStyle = currentRole ? roleStyles[currentRole] : null

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg fixed top-0 left-0 right-0 z-50 border-b border-gray-200/50">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <FiMenu className="w-6 h-6 text-gray-700" />
          </button>
          <Link
            to="/dashboard"
            className="flex items-center gap-3 text-2xl font-bold gradient-text hover:scale-105 transition-transform duration-300"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiHeart className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span>Health Portal</span>
              {roleStyle && (
                <span
                  className={`mt-0.5 inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold shadow-sm ${roleStyle.badgeClasses}`}
                >
                  {roleStyle.badgeText}
                </span>
              )}
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={onNotificationClick}
              className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 relative group"
            >
              <FiBell className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-bounce-in">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-105 group"
            >
              {user?.profile?.profilePicture ? (
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={(() => {
                      const pic = user.profile.profilePicture;

                      // Fix: If DB has hardcoded localhost:5000 or 127.0.0.1:5000, strip it
                      let cleanPic = pic;
                      if (pic && pic.includes('5000') && pic.includes('/uploads/')) {
                        cleanPic = pic.split('/uploads/')[1];
                      } else if (pic && pic.startsWith('http')) {
                        return pic;
                      }

                      cleanPic = cleanPic ? cleanPic.replace(/^uploads[\\\/]/, '') : '';
                      return `/uploads/${cleanPic}?t=${new Date().getTime()}`;
                    })()}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://ui-avatars.com/api/?name=' + (user.profile.firstName || 'User');
                    }}
                  />

                </div>
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <FiUser className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="hidden md:block font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                {user?.profile?.firstName || user?.email}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-105 text-red-600 hover:text-red-700 group"
            >
              <FiLogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="hidden md:block font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
