// @/stores/useFramePresenceStore.js
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axios from 'axios'

const useFramePresenceStore = create(
  devtools(
    (set, get) => ({
      // State for multiple frames (keyed by frameId)
      frames: {}, // { frameId: { activeUsers: [], isJoined: false, isConnected: false, error: null } }
      
      // Internal tracking
      heartbeatIntervals: {},
      channels: {},
      reconnectTimeouts: {},
      reconnectAttempts: {},
      
      // Constants
      maxReconnectAttempts: 5,
      reconnectDelay: 2000,
      heartbeatInterval: 25000,

      // Initialize frame state
      initializeFrame: (frameId) => {
        const { frames } = get()
        if (!frames[frameId]) {
          set((state) => ({
            frames: {
              ...state.frames,
              [frameId]: {
                activeUsers: [],
                isJoined: false,
                isConnected: false,
                error: null,
                currentMode: 'forge'
              }
            }
          }), false, 'initializeFrame')
        }
      },

      // Clean up frame resources
      cleanupFrame: (frameId) => {
        const { 
          heartbeatIntervals, 
          channels, 
          reconnectTimeouts,
          leaveFrame 
        } = get()
        
        // Leave frame first
        leaveFrame(frameId)
        
        // Clear heartbeat
        if (heartbeatIntervals[frameId]) {
          clearInterval(heartbeatIntervals[frameId])
        }
        
        // Clear reconnection timeout
        if (reconnectTimeouts[frameId]) {
          clearTimeout(reconnectTimeouts[frameId])
        }
        
        // Leave WebSocket channel
        if (channels[frameId]) {
          channels[frameId].leave()
        }
        
        // Clean up state
        set((state) => {
          const newFrames = { ...state.frames }
          delete newFrames[frameId]
          
          const newHeartbeats = { ...state.heartbeatIntervals }
          delete newHeartbeats[frameId]
          
          const newChannels = { ...state.channels }
          delete newChannels[frameId]
          
          const newTimeouts = { ...state.reconnectTimeouts }
          delete newTimeouts[frameId]
          
          const newAttempts = { ...state.reconnectAttempts }
          delete newAttempts[frameId]
          
          return {
            frames: newFrames,
            heartbeatIntervals: newHeartbeats,
            channels: newChannels,
            reconnectTimeouts: newTimeouts,
            reconnectAttempts: newAttempts
          }
        }, false, 'cleanupFrame')
      },

      // Join frame
      joinFrame: async (frameId, mode = 'forge', user = null) => {
        if (!frameId || !user) return false
        
        const { initializeFrame } = get()
        initializeFrame(frameId)
        
        try {
          const response = await axios.post(`/api/frames/${frameId}/presence/join`, {
            mode
          })
          
          set((state) => ({
            frames: {
              ...state.frames,
              [frameId]: {
                ...state.frames[frameId],
                activeUsers: response.data.active_users || [],
                isJoined: true,
                error: null,
                currentMode: mode
              }
            },
            reconnectAttempts: {
              ...state.reconnectAttempts,
              [frameId]: 0
            }
          }), false, 'joinFrame')
          
          return true
        } catch (error) {
          console.error('Failed to join frame:', error)
          set((state) => ({
            frames: {
              ...state.frames,
              [frameId]: {
                ...state.frames[frameId],
                error: 'Failed to join frame',
                isJoined: false
              }
            }
          }), false, 'joinFrame:error')
          return false
        }
      },

      // Leave frame
      leaveFrame: async (frameId, mode = 'forge') => {
        const { frames } = get()
        const frameState = frames[frameId]
        
        if (!frameId || !frameState?.isJoined) return

        try {
          await axios.post(`/api/frames/${frameId}/presence/leave`, { mode })
        } catch (error) {
          console.error('Failed to leave frame:', error)
        }
        
        set((state) => ({
          frames: {
            ...state.frames,
            [frameId]: {
              ...state.frames[frameId],
              isJoined: false
            }
          }
        }), false, 'leaveFrame')
      },

      // Update mode
      updateMode: async (frameId, newMode) => {
        const { frames } = get()
        const frameState = frames[frameId]
        
        if (!frameId || !frameState?.isJoined) return

        try {
          await axios.put(`/api/frames/${frameId}/presence/mode`, {
            mode: newMode
          })
          
          set((state) => ({
            frames: {
              ...state.frames,
              [frameId]: {
                ...state.frames[frameId],
                currentMode: newMode
              }
            }
          }), false, 'updateMode')
        } catch (error) {
          console.error('Failed to update mode:', error)
        }
      },

      // Start heartbeat
      startHeartbeat: (frameId) => {
        const { heartbeatIntervals, heartbeatInterval } = get()
        
        if (heartbeatIntervals[frameId]) {
          clearInterval(heartbeatIntervals[frameId])
        }

        const interval = setInterval(async () => {
          const { frames } = get()
          const frameState = frames[frameId]
          
          if (!frameId || !frameState?.isJoined) return

          try {
            await axios.post(`/api/frames/${frameId}/presence/heartbeat`, {
              mode: frameState.currentMode
            })
            
            set((state) => ({
              frames: {
                ...state.frames,
                [frameId]: {
                  ...state.frames[frameId],
                  error: null
                }
              }
            }), false, 'heartbeat:success')
          } catch (error) {
            console.error('Heartbeat failed:', error)
            set((state) => ({
              frames: {
                ...state.frames,
                [frameId]: {
                  ...state.frames[frameId],
                  error: 'Connection lost',
                  isJoined: false
                }
              }
            }), false, 'heartbeat:error')
          }
        }, heartbeatInterval)

        set((state) => ({
          heartbeatIntervals: {
            ...state.heartbeatIntervals,
            [frameId]: interval
          }
        }), false, 'startHeartbeat')
      },

      // Setup WebSocket
      setupWebSocket: (frameId) => {
        if (!frameId || !window.Echo) return

        const { 
          cleanupFrame, 
          maxReconnectAttempts, 
          reconnectDelay,
          setupWebSocket 
        } = get()

        try {
          const channel = window.Echo.join(`frame.${frameId}`)
          
          channel
            .here((users) => {
              console.log('Currently in frame:', users)
              set((state) => ({
                frames: {
                  ...state.frames,
                  [frameId]: {
                    ...state.frames[frameId],
                    activeUsers: users,
                    isConnected: true,
                    error: null
                  }
                }
              }), false, 'websocket:here')
            })
            .joining((user) => {
              console.log('User joining:', user)
              set((state) => {
                const frameState = state.frames[frameId]
                const exists = frameState.activeUsers.find(u => u.id === user.id)
                
                return {
                  frames: {
                    ...state.frames,
                    [frameId]: {
                      ...frameState,
                      activeUsers: exists ? frameState.activeUsers : [...frameState.activeUsers, user]
                    }
                  }
                }
              }, false, 'websocket:joining')
            })
            .leaving((user) => {
              console.log('User leaving:', user)
              set((state) => ({
                frames: {
                  ...state.frames,
                  [frameId]: {
                    ...state.frames[frameId],
                    activeUsers: state.frames[frameId].activeUsers.filter(u => u.id !== user.id)
                  }
                }
              }), false, 'websocket:leaving')
            })
            .listen('.presence.updated', (e) => {
              console.log('Presence updated:', e)
              
              set((state) => {
                const frameState = state.frames[frameId]
                if (!frameState) return state

                let newActiveUsers = [...frameState.activeUsers]

                if (e.action === 'joined') {
                  const exists = newActiveUsers.find(u => u.id === e.user.id)
                  if (!exists) {
                    newActiveUsers.push({ ...e.user, mode: e.mode })
                  } else {
                    newActiveUsers = newActiveUsers.map(u => 
                      u.id === e.user.id ? { ...u, mode: e.mode } : u
                    )
                  }
                } else if (e.action === 'left') {
                  newActiveUsers = newActiveUsers.filter(u => u.id !== e.user.id)
                } else if (e.action === 'mode_updated') {
                  newActiveUsers = newActiveUsers.map(u => 
                    u.id === e.user.id ? { ...u, mode: e.mode } : u
                  )
                }

                return {
                  frames: {
                    ...state.frames,
                    [frameId]: {
                      ...frameState,
                      activeUsers: newActiveUsers
                    }
                  }
                }
              }, false, 'websocket:presence.updated')
            })
            .error((error) => {
              console.error('Echo channel error:', error)
              
              set((state) => {
                const attempts = state.reconnectAttempts[frameId] || 0
                
                if (attempts < maxReconnectAttempts) {
                  const timeout = setTimeout(() => {
                    setupWebSocket(frameId)
                  }, reconnectDelay * (attempts + 1))

                  return {
                    frames: {
                      ...state.frames,
                      [frameId]: {
                        ...state.frames[frameId],
                        isConnected: false,
                        error: 'WebSocket connection failed'
                      }
                    },
                    reconnectAttempts: {
                      ...state.reconnectAttempts,
                      [frameId]: attempts + 1
                    },
                    reconnectTimeouts: {
                      ...state.reconnectTimeouts,
                      [frameId]: timeout
                    }
                  }
                }
                
                return {
                  frames: {
                    ...state.frames,
                    [frameId]: {
                      ...state.frames[frameId],
                      isConnected: false,
                      error: 'Connection failed after multiple attempts'
                    }
                  }
                }
              }, false, 'websocket:error')
            })

          set((state) => ({
            channels: {
              ...state.channels,
              [frameId]: channel
            },
            frames: {
              ...state.frames,
              [frameId]: {
                ...state.frames[frameId],
                isConnected: true,
                error: null
              }
            }
          }), false, 'setupWebSocket')

        } catch (error) {
          console.error('Failed to setup WebSocket:', error)
          set((state) => ({
            frames: {
              ...state.frames,
              [frameId]: {
                ...state.frames[frameId],
                error: 'Failed to connect to real-time updates',
                isConnected: false
              }
            }
          }), false, 'setupWebSocket:error')
        }
      },

      // Initialize frame presence (main entry point)
      initializeFramePresence: async (frameId, mode = 'forge', user = null) => {
        if (!frameId || !user) return false

        const { joinFrame, startHeartbeat, setupWebSocket } = get()
        
        const joined = await joinFrame(frameId, mode, user)
        if (joined) {
          startHeartbeat(frameId)
          setupWebSocket(frameId)
        }
        
        return joined
      },

      // Getters
      getFrameState: (frameId) => {
        const { frames } = get()
        return frames[frameId] || {
          activeUsers: [],
          isJoined: false,
          isConnected: false,
          error: null,
          currentMode: 'forge'
        }
      },

      getUsersByMode: (frameId, mode, currentUserId = null) => {
        const { frames } = get()
        const frameState = frames[frameId]
        
        if (!frameState) return []
        
        return frameState.activeUsers.filter(u => 
          u.mode === mode && u.id !== currentUserId
        )
      }
    }),
    {
      name: 'frame-presence-store',
    }
  )
)

export { useFramePresenceStore }