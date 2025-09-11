// Components/Void/LockRequestNotificationManager.jsx
import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, Clock, UserCheck, AlertTriangle } from 'lucide-react'
import useFrameLockStore from '@/stores/useFrameLockStore'

const LockRequestNotification = ({ 
  request, 
  onRespond, 
  onClose, 
  index = 0 
}) => {
  const [responseMessage, setResponseMessage] = React.useState('')
  const [isResponding, setIsResponding] = React.useState(false)
  const [showResponseInput, setShowResponseInput] = React.useState(false)

  // Auto-close after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 30000)
    return () => clearTimeout(timer)
  }, [onClose])

  const handleRespond = async (action) => {
    setIsResponding(true)
    try {
      await onRespond(request.uuid, action, responseMessage)
      onClose()
    } finally {
      setIsResponding(false)
    }
  }

  const timeRemaining = Math.max(0, Math.ceil((new Date(request.expires_at) - new Date()) / 1000 / 60))

  return (
    <div 
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-w-sm w-full mb-3 transform transition-all duration-300 ease-out"
      style={{
        transform: `translateY(${-index * 10}px) scale(${1 - index * 0.02})`,
        zIndex: 1000 - index
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                Frame Access Request
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {timeRemaining} minutes remaining
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Request details */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <img
                src={request.requester.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.requester.name)}&background=random`}
                alt={request.requester.name}
                className="w-6 h-6 rounded-full"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {request.requester.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  wants to access "{request.frame.name}"
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                request.requested_mode === 'forge' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
              }`}>
                {request.requested_mode.toUpperCase()} MODE
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {timeRemaining}m left
              </div>
            </div>

            {request.message && (
              <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                "{request.message}"
              </p>
            )}
          </div>

          {/* Response input (if showing) */}
          {showResponseInput && (
            <div className="space-y-2">
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Optional response message..."
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                maxLength={500}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleRespond('approve')}
              disabled={isResponding}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg transition-colors text-sm font-medium"
            >
              {isResponding ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Approve
                </>
              )}
            </button>
            
            <button
              onClick={() => handleRespond('reject')}
              disabled={isResponding}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg transition-colors text-sm font-medium"
            >
              {isResponding ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <X className="w-4 h-4" />
                  Reject
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowResponseInput(!showResponseInput)}
              className="px-2 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              title="Add message"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const LockRequestNotificationManager = ({ 
  position = 'bottom-right',
  maxVisibleRequests = 3 
}) => {
  const { 
    lockRequests, 
    respondToLockRequest, 
    dismissLockRequest 
  } = useFrameLockStore()

  // Only show the most recent requests
  const visibleRequests = lockRequests.slice(0, maxVisibleRequests)

  if (visibleRequests.length === 0) {
    return null
  }

  const handleRespond = async (requestUuid, action, message) => {
    return await respondToLockRequest(requestUuid, action, message)
  }

  const handleDismiss = (requestUuid) => {
    dismissLockRequest(requestUuid)
  }

  // Calculate position classes
  const getPositionClasses = () => {
    const positions = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6', 
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6'
    }
    return positions[position] || positions['bottom-right']
  }

  return createPortal(
    <div className="lock-request-notifications">
      <div className={`fixed ${getPositionClasses()} z-[9998] space-y-2`}>
        {visibleRequests.map((request, index) => (
          <LockRequestNotification
            key={request.uuid}
            request={request}
            onRespond={handleRespond}
            onClose={() => handleDismiss(request.uuid)}
            index={index}
          />
        ))}
        
        {/* Show count indicator if there are more requests */}
        {lockRequests.length > maxVisibleRequests && (
          <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg text-center">
            +{lockRequests.length - maxVisibleRequests} more requests
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default LockRequestNotificationManager