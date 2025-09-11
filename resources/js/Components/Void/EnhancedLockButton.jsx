// Components/Void/EnhancedLockButton.jsx
import React, { useState, useEffect } from 'react'
import { Lock, Unlock, UserPlus, Clock, AlertTriangle, Shield } from 'lucide-react'
import useFrameLockStore from '@/stores/useFrameLockStore'

const EnhancedLockButton = ({ 
  frameUuid,
  currentMode = 'forge', // 'forge' or 'source'
  className = "",
  size = 'sm' // 'sm', 'md', 'lg'
}) => {
  const {
    getLockStatus,
    toggleFrameLock,
    requestFrameAccess,
    getFrameLockStatus,
    isLoading
  } = useFrameLockStore()

  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [localLoading, setLocalLoading] = useState(false)

  const lockStatus = getLockStatus(frameUuid)

  // Load lock status on mount if not available
  useEffect(() => {
    if (!lockStatus && frameUuid) {
      getFrameLockStatus(frameUuid)
    }
  }, [frameUuid, lockStatus, getFrameLockStatus])

  // Handle lock/unlock toggle
  const handleLockToggle = async () => {
    if (!lockStatus) return
    
    setLocalLoading(true)
    try {
      await toggleFrameLock(frameUuid, currentMode)
    } finally {
      setLocalLoading(false)
    }
  }

  // Handle access request
  const handleRequestAccess = async () => {
    setLocalLoading(true)
    try {
      const success = await requestFrameAccess(frameUuid, currentMode, requestMessage)
      if (success) {
        setShowRequestDialog(false)
        setRequestMessage('')
        // Force refresh to show pending status if not updated
        await getFrameLockStatus(frameUuid)
      }
    } finally {
      setLocalLoading(false)
    }
  }

  // Handle button click based on lock status
  const handleButtonClick = () => {
    if (!lockStatus) return

    if (lockStatus.can_lock || lockStatus.can_unlock) {
      // User can lock/unlock - toggle directly
      handleLockToggle()
    } else if (lockStatus.can_request && !lockStatus.has_pending_request) {
      // User can request access - show request dialog
      setShowRequestDialog(true)
    }
  }

  // Size configurations
  const sizeConfig = {
    sm: {
      buttonSize: 'p-1.5',
      iconSize: 'w-3.5 h-3.5',
      dialogPadding: 'p-4',
      textSize: 'text-sm'
    },
    md: {
      buttonSize: 'p-2',
      iconSize: 'w-4 h-4',
      dialogPadding: 'p-6',
      textSize: 'text-base'
    },
    lg: {
      buttonSize: 'p-3',
      iconSize: 'w-5 h-5',
      dialogPadding: 'p-8',
      textSize: 'text-lg'
    }
  }

  const config = sizeConfig[size]

  if (!lockStatus) {
    return (
      <div className={`${config.buttonSize} rounded-lg ${className}`}>
        <div className={`${config.iconSize} bg-gray-300 rounded animate-pulse`}></div>
      </div>
    )
  }

  // Determine button appearance and behavior
  let buttonIcon, buttonColor, buttonTitle, isClickable = true

  if (lockStatus.is_locked) {
    if (lockStatus.locked_by_me) {
      // I locked it - show unlock button
      buttonIcon = <Unlock className={config.iconSize} />
      buttonColor = 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg border-blue-600'
      buttonTitle = `Click to unlock frame (${lockStatus.locked_mode} mode)`
    } else if (lockStatus.can_unlock) {
      // I can unlock someone else's lock
      buttonIcon = <Shield className={config.iconSize} />
      buttonColor = 'bg-orange-500 hover:bg-orange-600 text-white border-orange-600'
      buttonTitle = `Force unlock frame (locked by ${lockStatus.locked_by?.name})`
    } else if (lockStatus.has_pending_request) {
      // I have a pending request
      buttonIcon = <Clock className={config.iconSize} />
      buttonColor = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300'
      buttonTitle = 'Access request pending'
      isClickable = false
    } else if (lockStatus.can_request) {
      // I can request access
      buttonIcon = <UserPlus className={config.iconSize} />
      buttonColor = 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
      buttonTitle = `Request access (locked by ${lockStatus.locked_by?.name})`
    } else {
      // Locked and I can't do anything
      buttonIcon = <Lock className={config.iconSize} />
      buttonColor = 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-700'
      buttonTitle = `Locked by ${lockStatus.locked_by?.name}`
      isClickable = false
    }
  } else {
    // Frame is unlocked
    if (lockStatus.can_lock) {
      buttonIcon = <Lock className={config.iconSize} />
      buttonColor = 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'
      buttonTitle = 'Click to lock frame'
    } else {
      buttonIcon = <Lock className={config.iconSize} />
      buttonColor = 'text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700'
      buttonTitle = 'Cannot lock frame'
      isClickable = false
    }
  }

  const isButtonLoading = isLoading || localLoading

  return (
    <>
      <button 
        onClick={isClickable ? handleButtonClick : undefined}
        disabled={isButtonLoading || !isClickable}
        className={`${config.buttonSize} rounded-lg border transition-all duration-300 relative ${buttonColor} ${
          isClickable && !isButtonLoading ? 'cursor-pointer' : 'cursor-not-allowed'
        } ${className}`}
        title={buttonTitle}
      >
        {isButtonLoading ? (
          <div className={`${config.iconSize} border-2 border-current/30 border-t-current rounded-full animate-spin`} />
        ) : (
          buttonIcon
        )}

        {/* Lock indicator animations */}
        {lockStatus.is_locked && lockStatus.locked_by_me && (
          <>
            <div className="absolute inset-0 bg-blue-400 rounded-lg animate-ping opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg opacity-30 animate-pulse"></div>
          </>
        )}
        
        {/* Pending request indicator */}
        {lockStatus.has_pending_request && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        )}

        {/* Lock duration indicator for locked frames */}
        {lockStatus.is_locked && lockStatus.lock_duration_minutes !== null && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
            <div className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 px-1 py-0.5 rounded text-xs font-mono">
              {lockStatus.lock_duration_minutes}m
            </div>
          </div>
        )}
      </button>

      {/* Request Access Dialog */}
      {showRequestDialog && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className={config.dialogPadding}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className={`font-semibold text-gray-900 dark:text-white ${config.textSize}`}>
                    Request Frame Access
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This frame is locked by {lockStatus.locked_by?.name}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Mode indicator */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Requesting access to: 
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    currentMode === 'forge' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                  }`}>
                    {currentMode.toUpperCase()} MODE
                  </span>
                </div>

                {/* Message input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message (optional)
                  </label>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Let them know why you need access..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {requestMessage.length}/500 characters
                  </p>
                </div>

                {/* Warning */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Your request will expire in 10 minutes if not responded to.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowRequestDialog(false)
                      setRequestMessage('')
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    disabled={localLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestAccess}
                    disabled={localLoading}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors font-medium"
                  >
                    {localLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending...
                      </div>
                    ) : (
                      'Send Request'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default EnhancedLockButton