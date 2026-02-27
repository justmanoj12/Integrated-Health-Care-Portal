import { useSelector, useDispatch } from 'react-redux'
import { markAsRead, markAllAsRead } from '../store/slices/notificationSlice'
import { format } from 'date-fns'
import { FiX, FiCheck, FiBell } from 'react-icons/fi'

const NotificationPanel = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const { notifications } = useSelector(state => state.notifications)

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-16 w-96 h-[calc(100vh-4rem)] bg-white/90 backdrop-blur-md shadow-2xl z-40 flex flex-col border-l border-gray-200/50 animate-slide-up">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <FiBell className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={() => dispatch(markAllAsRead())}
              className="text-sm text-blue-600 hover:text-indigo-600 font-semibold px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <FiX className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiBell className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No notifications</p>
            <p className="text-sm text-gray-400 mt-2">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification, idx) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-300 group ${
                  !notification.read ? 'bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-l-4 border-blue-500' : ''
                }`}
                style={{ animationDelay: `${idx * 0.05}s` }}
                onClick={() => {
                  if (!notification.read) {
                    dispatch(markAsRead(notification.id))
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    !notification.read 
                      ? 'bg-blue-500 animate-pulse' 
                      : 'bg-gray-300'
                  }`}></div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-800 group-hover:text-blue-600 transition-colors">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      {format(new Date(notification.timestamp), 'PPp')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationPanel
