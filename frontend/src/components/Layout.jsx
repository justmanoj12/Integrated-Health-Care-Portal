import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useState, useMemo } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import NotificationPanel from './NotificationPanel'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const { user } = useSelector(state => state.auth)

  const backgroundClass = useMemo(() => {
    switch (user?.role) {
      case 'patient':
        return 'bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50'
      case 'doctor':
        return 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
      case 'admin':
        return 'bg-gradient-to-br from-slate-50 via-purple-50 to-rose-50'
      default:
        return 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }
  }, [user?.role])

  return (
    <div className={`min-h-screen ${backgroundClass}`}>
      {/* Navbar */}
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onNotificationClick={() => setNotificationOpen(!notificationOpen)}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} />

        {/* Main content */}
        <main
          className={`flex-1 pt-24 px-8 transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Notifications */}
      <NotificationPanel
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />
    </div>
  )
}

export default Layout
