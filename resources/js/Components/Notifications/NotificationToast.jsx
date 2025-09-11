// Components/Notifications/NotificationToast.jsx
import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Lock, Unlock } from 'lucide-react'
import useFrameLockStore from '@/stores/useFrameLockStore'

const NotificationIcon = ({ type }) => {
  const iconMap = {
    success: CheckCircle,
    error: AlertCircle, 
    warning: AlertTriangle,
    info: Info,
    lock_request: Lock,
    lock_response: Unlock,
    lock_status: Lock
  }
  
  const Icon = iconMap[type] || Info
  return <Icon className="w-5 h-5" />
}

const NotificationToast = ({ notification, onClose }) => {
  const { type, title, message } = notification

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000) // Auto-close after 5 seconds
    
    return () => clearTimeout(timer)
  }, [onClose])

  const getColorClasses = () => {
    const colorMap = {
      success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
      error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
      warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
      info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
      lock_request: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200',
      lock_response: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200',
      lock_status: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200'
    }
    
    return colorMap[type] || colorMap.info
  }

  return (
    <div className={`max-w-sm w-full bg-white dark:bg-gray-800 border rounded-lg shadow-lg ${getColorClasses()} mb-3 transform transition-all duration-300 ease-out`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <NotificationIcon type={type} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm">
                {title}
              </h4>
              <p className="text-sm opacity-90 mt-1">
                {message}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-2 text-current opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

const NotificationToastContainer = ({ position = 'top-right' }) => {
  const { 
    notifications, 
    removeNotification 
  } = useFrameLockStore()

  if (notifications.length === 0) {
    return null
  }

  const getPositionClasses = () => {
    const positions = {
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6',
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6',
      'top-center': 'top-6 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2'
    }
    return positions[position] || positions['top-right']
  }

  return createPortal(
    <div className={`fixed ${getPositionClasses()} z-[9999] space-y-2`}>
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>,
    document.body
  )
}

export default NotificationToastContainer