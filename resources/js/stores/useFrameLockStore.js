// stores/useFrameLockStore.js
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { router } from '@inertiajs/react'

const useFrameLockStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    lockStatuses: {}, // frameUuid -> lockStatus
    lockRequests: [], // pending requests for current user
    isLoading: false,
    notifications: [], // for UI notifications
    echoConnected: false,

    // Actions
    setLockStatus: (frameUuid, lockStatus) =>
      set((state) => ({
        lockStatuses: {
          ...state.lockStatuses,
          [frameUuid]: lockStatus,
        },
      })),

    setLockRequests: (requests) =>
      set({ lockRequests: requests }),

    addLockRequest: (request) =>
      set((state) => ({
        lockRequests: [request, ...state.lockRequests],
      })),

    removeLockRequest: (requestUuid) =>
      set((state) => ({
        lockRequests: state.lockRequests.filter(req => req.uuid !== requestUuid),
      })),

    setLoading: (isLoading) =>
      set({ isLoading }),

    addNotification: (notification) =>
      set((state) => ({
        notifications: [
          {
            id: Date.now() + Math.random(),
            timestamp: Date.now(),
            ...notification,
          },
          ...state.notifications,
        ].slice(0, 5), // Keep only 5 most recent
      })),

    removeNotification: (notificationId) =>
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== notificationId),
      })),

    clearNotifications: () =>
      set({ notifications: [] }),

    setEchoConnected: (connected) =>
      set({ echoConnected: connected }),

    // Inertia-based API calls
    inertiaPost: (route, data = {}, options = {}) => {
      return new Promise((resolve, reject) => {
        router.post(route, data, {
          preserveScroll: true,
          preserveState: true,
          onSuccess: (page) => {
            // Check for flash messages in page.props.flash
            const flash = page.props.flash || {}
            
            if (flash.success) {
              resolve({ 
                success: true, 
                data: { 
                  message: flash.success,
                  lock_status: flash.lock_status,
                  frame_uuid: flash.frame_uuid
                } 
              })
            } else if (flash.lock_error || flash.request_error) {
              reject(new Error(flash.lock_error || flash.request_error))
            } else {
              // Fallback - assume success if no errors
              resolve({ 
                success: true, 
                data: { 
                  message: 'Operation completed successfully',
                  lock_status: flash.lock_status,
                  frame_uuid: flash.frame_uuid
                } 
              })
            }
          },
          onError: (errors) => {
            const errorMessage = errors.lock_error || 
                               errors.request_error || 
                               errors.message || 
                               Object.values(errors)[0] || 
                               'Request failed'
            reject(new Error(errorMessage))
          },
          ...options
        })
      })
    },

    inertiaGet: (route, options = {}) => {
      return new Promise((resolve, reject) => {
        router.get(route, {
          preserveScroll: true,
          preserveState: true,
          onSuccess: (page) => {
            resolve({ success: true, data: page.props })
          },
          onError: (errors) => {
            reject(new Error(errors.message || Object.values(errors)[0] || 'Request failed'))
          },
          ...options
        })
      })
    },

    // Initialize Echo connections
    initializeEcho: (userId) => {
      if (!window.Echo || !userId || get().echoConnected) return

      try {
        // Listen for lock requests sent to me (as frame owner)
        const userChannel = window.Echo.private(`App.Models.User.${userId}`)
          .listen('.lock.request.created', (e) => {
            console.log('Received lock request:', e)
            get().addLockRequest(e.request)
            
            get().addNotification({
              type: 'lock_request',
              title: 'Frame Access Request',
              message: `${e.request.requester.name} wants to access "${e.request.frame.name}"`,
              data: e.request,
              action: 'request_received',
            })
            
            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
              new Notification('Frame Access Request', {
                body: `${e.request.requester.name} wants to access "${e.request.frame.name}"`,
                icon: '/favicon.ico',
                tag: `lock-request-${e.request.uuid}`,
              })
            }
          })
          .listen('.lock.request.responded', (e) => {
            console.log('Lock request responded:', e)
            get().removeLockRequest(e.request.uuid)
            
            get().addNotification({
              type: 'lock_response',
              title: `Request ${e.response}`,
              message: `Your access request for "${e.request.frame.name}" was ${e.response}`,
              data: e.request,
              action: 'request_responded',
            })
          })

        // Request notification permission
        if (Notification.permission === 'default') {
          Notification.requestPermission()
        }

        set({ echoConnected: true })
        console.log('Frame lock Echo initialized')
      } catch (error) {
        console.error('Failed to initialize Echo for frame locks:', error)
      }
    },

    // Subscribe to frame-specific events
    subscribeToFrame: (frameUuid) => {
      if (!window.Echo || !frameUuid) return

      try {
        const frameChannel = window.Echo.private(`frame.${frameUuid}`)
          .listen('.lock.status.changed', (e) => {
            console.log('Frame lock status changed:', e)
            get().setLockStatus(frameUuid, {
              is_locked: e.frame.is_locked,
              locked_by: e.user,
              locked_at: e.frame.locked_at,
              locked_mode: e.frame.locked_mode,
              // Update with current user permissions (this would need to be calculated client-side)
              locked_by_me: e.user.id === get().getCurrentUserId?.(),
            })

            get().addNotification({
              type: 'lock_status',
              title: `Frame ${e.action}`,
              message: `"${e.frame.name}" was ${e.action} by ${e.user.name}`,
              data: { frame: e.frame, user: e.user },
              action: e.action,
            })
          })

        return () => frameChannel?.stopListening('.lock.status.changed')
      } catch (error) {
        console.error(`Failed to subscribe to frame ${frameUuid}:`, error)
        return () => {}
      }
    },

    // Load pending requests using web routes
    loadPendingRequests: async () => {
      try {
        // Use a web route that returns JSON or redirect to a page with the data
        const response = await fetch('/api/lock-requests/pending', {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Authorization': `Bearer ${document.querySelector('meta[name="api-token"]')?.getAttribute('content') || ''}`,
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            get().setLockRequests(data.requests)
          }
        }
      } catch (error) {
        console.error('Error loading pending requests:', error)
        get().addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load lock requests',
        })
      }
    },

    // Toggle frame lock using web routes
    toggleFrameLock: async (frameUuid, mode, reason = null) => {
      if (get().isLoading) return null
      
      set({ isLoading: true })
      try {
        const response = await get().inertiaPost(route('frames.toggle-lock', frameUuid), { 
          mode, 
          reason,
          frame_uuid: frameUuid 
        })
        
        // The response should contain the updated lock status
        if (response.success && response.data.lock_status) {
          get().setLockStatus(frameUuid, response.data.lock_status)
          
          get().addNotification({
            type: 'success',
            title: 'Success',
            message: response.data.message || 'Frame lock toggled successfully',
          })
          
          return response.data.lock_status
        }
        
        return null
      } catch (error) {
        console.error('Error toggling frame lock:', error)
        get().addNotification({
          type: 'error',
          title: 'Lock Error',
          message: error.message || 'Failed to toggle frame lock',
        })
        return null
      } finally {
        set({ isLoading: false })
      }
    },

    // Request frame access using web routes
    requestFrameAccess: async (frameUuid, mode, message = null) => {
      if (get().isLoading) return false
      
      set({ isLoading: true })
      try {
        const response = await get().inertiaPost(route('frames.request-access', frameUuid), { 
          mode, 
          message,
          frame_uuid: frameUuid 
        })
        
        if (response.success) {
          // Update lock status to show pending request
          const currentStatus = get().lockStatuses[frameUuid] || {}
          get().setLockStatus(frameUuid, {
            ...currentStatus,
            has_pending_request: true
          })

          get().addNotification({
            type: 'success',
            title: 'Request Sent',
            message: 'Access request sent successfully!',
          })
          
          return true
        }
        
        return false
      } catch (error) {
        console.error('Error requesting frame access:', error)
        get().addNotification({
          type: 'error',
          title: 'Request Error',
          message: error.message || 'Failed to send access request',
        })
        return false
      } finally {
        set({ isLoading: false })
      }
    },

    // Respond to lock request using web routes
    respondToLockRequest: async (requestUuid, action, message = null) => {
      if (get().isLoading) return false
      
      set({ isLoading: true })
      try {
        const response = await get().inertiaPost(route('lock-requests.respond', requestUuid), { 
          action, 
          message 
        })
        
        if (response.success) {
          get().removeLockRequest(requestUuid)
          
          get().addNotification({
            type: 'success',
            title: 'Response Sent',
            message: `Request ${action}d successfully`,
          })
          
          return true
        }
        
        return false
      } catch (error) {
        console.error('Error responding to lock request:', error)
        get().addNotification({
          type: 'error',
          title: 'Response Error',
          message: error.message || 'Failed to respond to request',
        })
        return false
      } finally {
        set({ isLoading: false })
      }
    },

    // Get frame lock status using web route
    getFrameLockStatus: async (frameUuid) => {
      try {
        const response = await fetch(route('frames.lock-status', frameUuid), {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            get().setLockStatus(frameUuid, data.lock_status)
            return data.lock_status
          }
        }
      } catch (error) {
        console.error('Error getting frame lock status:', error)
      }
      return null
    },

    // Force unlock frame using web route
    forceUnlockFrame: async (frameUuid) => {
      if (get().isLoading) return false
      
      set({ isLoading: true })
      try {
        const response = await get().inertiaPost(route('frames.force-unlock', frameUuid))
        
        if (response.success && response.data.lock_status) {
          get().setLockStatus(frameUuid, response.data.lock_status)
          
          get().addNotification({
            type: 'success',
            title: 'Force Unlock',
            message: 'Frame force unlocked successfully',
          })
          
          return response.data.lock_status
        }
        
        return false
      } catch (error) {
        console.error('Error force unlocking frame:', error)
        get().addNotification({
          type: 'error',
          title: 'Force Unlock Error',
          message: error.message || 'Failed to force unlock frame',
        })
        return false
      } finally {
        set({ isLoading: false })
      }
    },

    // Dismiss lock request (remove from UI)
    dismissLockRequest: (requestUuid) => {
      get().removeLockRequest(requestUuid)
    },

    // Cleanup expired requests
    cleanupExpired: async () => {
      try {
        const response = await get().inertiaPost(route('lock-requests.cleanup'))
        if (response.success) {
          console.log(`Cleaned up ${response.data.expired_count} expired requests`)
        }
      } catch (error) {
        console.error('Error cleaning up expired requests:', error)
      }
    },

    // Helper selectors
    getLockStatus: (frameUuid) => get().lockStatuses[frameUuid] || null,
    
    getPendingRequestsCount: () => get().lockRequests.length,
    
    getNotifications: () => get().notifications,
    
    hasActiveNotifications: () => get().notifications.length > 0,

    // Auto-cleanup old notifications
    cleanupOldNotifications: () => {
      const now = Date.now()
      const maxAge = 30 * 1000 // 30 seconds
      
      set((state) => ({
        notifications: state.notifications.filter(n => 
          now - n.timestamp < maxAge
        )
      }))
    },

    // Initialize the store
    initialize: (userId) => {
      get().initializeEcho(userId)
      get().loadPendingRequests()
      
      // Setup auto-cleanup interval
      setInterval(() => {
        get().cleanupOldNotifications()
      }, 5000)
    },
  }))
)

export default useFrameLockStore