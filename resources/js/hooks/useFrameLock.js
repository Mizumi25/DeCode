// hooks/useFrameLock.js
import { useCallback } from 'react'
import useFrameLockStore from '@/stores/useFrameLockStore'

/**
 * Simple hook that wraps the Zustand store for easier component usage
 */
const useFrameLock = (frameUuid = null) => {
  const {
    lockStatuses,
    lockRequests,
    isLoading,
    notifications,
    toggleFrameLock,
    requestFrameAccess,
    respondToLockRequest,
    getFrameLockStatus,
    forceUnlockFrame,
    getLockStatus,
    getPendingRequestsCount,
    hasActiveNotifications,
    dismissLockRequest,
    addNotification,
    removeNotification
  } = useFrameLockStore()

  // Get current frame's lock status
  const currentLockStatus = frameUuid ? getLockStatus(frameUuid) : null

  // Enhanced toggle function with error handling
  const toggleLock = useCallback(async (uuid, mode, reason = null) => {
    const targetUuid = uuid || frameUuid
    if (!targetUuid) {
      console.error('No frame UUID provided for lock toggle')
      return null
    }

    try {
      return await toggleFrameLock(targetUuid, mode, reason)
    } catch (error) {
      console.error('Lock toggle failed:', error)
      return null
    }
  }, [frameUuid, toggleFrameLock])

  // Enhanced request access function
  const requestAccess = useCallback(async (uuid, mode, message = null) => {
    const targetUuid = uuid || frameUuid
    if (!targetUuid) {
      console.error('No frame UUID provided for access request')
      return false
    }

    try {
      return await requestFrameAccess(targetUuid, mode, message)
    } catch (error) {
      console.error('Access request failed:', error)
      return false
    }
  }, [frameUuid, requestFrameAccess])

  // Enhanced respond function
  const respondToRequest = useCallback(async (requestUuid, action, message = null) => {
    if (!requestUuid || !action) {
      console.error('Missing required parameters for request response')
      return false
    }

    try {
      return await respondToLockRequest(requestUuid, action, message)
    } catch (error) {
      console.error('Request response failed:', error)
      return false
    }
  }, [respondToLockRequest])

  // Force unlock function
  const forceUnlock = useCallback(async (uuid) => {
    const targetUuid = uuid || frameUuid
    if (!targetUuid) {
      console.error('No frame UUID provided for force unlock')
      return false
    }

    try {
      return await forceUnlockFrame(targetUuid)
    } catch (error) {
      console.error('Force unlock failed:', error)
      return false
    }
  }, [frameUuid, forceUnlockFrame])

  // Get lock status for specific frame
  const getLockStatusForFrame = useCallback(async (uuid) => {
    const targetUuid = uuid || frameUuid
    if (!targetUuid) return null

    try {
      return await getFrameLockStatus(targetUuid)
    } catch (error) {
      console.error('Failed to get lock status:', error)
      return null
    }
  }, [frameUuid, getFrameLockStatus])

  // Helper functions
  const canUserLock = useCallback((lockStatus = currentLockStatus) => {
    return lockStatus?.can_lock || false
  }, [currentLockStatus])

  const canUserUnlock = useCallback((lockStatus = currentLockStatus) => {
    return lockStatus?.can_unlock || false
  }, [currentLockStatus])

  const canUserRequest = useCallback((lockStatus = currentLockStatus) => {
    return lockStatus?.can_request || false
  }, [currentLockStatus])

  const isFrameLocked = useCallback((lockStatus = currentLockStatus) => {
    return lockStatus?.is_locked || false
  }, [currentLockStatus])

  const isLockedByMe = useCallback((lockStatus = currentLockStatus) => {
    return lockStatus?.locked_by_me || false
  }, [currentLockStatus])

  const hasPendingRequest = useCallback((lockStatus = currentLockStatus) => {
    return lockStatus?.has_pending_request || false
  }, [currentLockStatus])

  // Notification helpers
  const showSuccessNotification = useCallback((title, message) => {
    addNotification({
      type: 'success',
      title,
      message,
    })
  }, [addNotification])

  const showErrorNotification = useCallback((title, message) => {
    addNotification({
      type: 'error',
      title,
      message,
    })
  }, [addNotification])

  const showInfoNotification = useCallback((title, message) => {
    addNotification({
      type: 'info',
      title,
      message,
    })
  }, [addNotification])

  return {
    // State
    lockStatus: currentLockStatus,
    allLockStatuses: lockStatuses,
    lockRequests,
    isLoading,
    notifications,
    pendingRequestsCount: getPendingRequestsCount(),
    hasNotifications: hasActiveNotifications(),

    // Actions
    toggleLock,
    requestAccess,
    respondToRequest,
    forceUnlock,
    getLockStatusForFrame,
    dismissRequest: dismissLockRequest,

    // Helpers
    canUserLock,
    canUserUnlock,
    canUserRequest,
    isFrameLocked,
    isLockedByMe,
    hasPendingRequest,

    // Notifications
    showSuccessNotification,
    showErrorNotification,
    showInfoNotification,
    removeNotification,
  }
}

export default useFrameLock