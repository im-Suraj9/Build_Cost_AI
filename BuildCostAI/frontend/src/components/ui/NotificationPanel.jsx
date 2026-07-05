import { useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

const iconMap = {
  info: <Info className="w-4 h-4 text-blue-500" />,
  success: <CheckCircle className="w-4 h-4 text-green-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  error: <XCircle className="w-4 h-4 text-red-500" />
}

export default function NotificationPanel({ onClose }) {
  const { user, refreshUser } = useAuth()
  const panelRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const markRead = async (id) => {
    try {
      await api.put(`/auth/notifications/${id}/read`)
      refreshUser()
    } catch {}
  }

  const notifications = user?.notifications?.slice().reverse() || []
  const unread = notifications.filter(n => !n.read)

  return (
    <div ref={panelRef} className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-50 overflow-hidden animate-slide-in-right">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          <span className="font-display font-semibold text-gray-900 dark:text-white text-sm">Notifications</span>
          {unread.length > 0 && (
            <span className="w-5 h-5 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unread.length}
            </span>
          )}
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto scrollbar-thin">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No notifications yet
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif._id}
              onClick={() => !notif.read && markRead(notif._id)}
              className={`flex items-start gap-3 p-4 border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!notif.read ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}
            >
              <div className="mt-0.5 shrink-0">
                {iconMap[notif.type] || iconMap.info}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-relaxed ${notif.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200 font-medium'}`}>
                  {notif.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notif.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                </p>
              </div>
              {!notif.read && <div className="w-2 h-2 bg-brand-500 rounded-full mt-1.5 shrink-0" />}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
