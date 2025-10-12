// @/stores/useFramePresenceStore.js - FIXED VERSION
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axios from 'axios'
import { router } from '@inertiajs/react'

const useFramePresenceStore = create(
  devtools(
    (set, get) => ({
      // State for multiple frames (keyed by frameId)
      frames: {},
      
      // Internal tracking
      heartbeatIntervals: {},
      channels: {},
      reconnectTimeouts: {},
      reconnectAttempts: {},
      isNavigating: false, // ✅ ADD: Track navigation state
      
      // Constants
      maxReconnectAttempts: 5,
      reconnectDelay: 2000,
      heartbeatInterval: 25000,

      // ✅ ADD: Set navigation state
      setNavigating: (isNavigating) => {
        set({ isNavigating }, false, 'setNavigating');
      },

      // Initialize frame state
      initializeFrame: (frameId) => {
        const { frames, isNavigating } = get();
        
        // ✅ CRITICAL: Don't initialize if we're navigating away
        if (isNavigating) {
          console.log('Skipping frame init - navigation in progress');
          return;
        }
        
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
          }), false, 'initializeFrame');
        }
      },

      // ✅ ENHANCED: Clean up frame resources with better error handling
      cleanupFrame: (frameId) => {
        const { 
          heartbeatIntervals, 
          channels, 
          reconnectTimeouts,
          leaveFrame 
        } = get();
        
        console.log('🧹 Cleaning up frame:', frameId);
        
        try {
          // Leave frame via API
          leaveFrame(frameId);
        } catch (error) {
          console.warn('Error leaving frame via API:', error);
        }
        
        try {
          // Clear heartbeat
          if (heartbeatIntervals[frameId]) {
            clearInterval(heartbeatIntervals[frameId]);
          }
        } catch (error) {
          console.warn('Error clearing heartbeat:', error);
        }
        
        try {
          // Clear reconnection timeout
          if (reconnectTimeouts[frameId]) {
            clearTimeout(reconnectTimeouts[frameId]);
          }
        } catch (error) {
          console.warn('Error clearing reconnect timeout:', error);
        }
        
        try {
          // ✅ ENHANCED: Safe Echo channel cleanup
          if (channels[frameId]) {
            const channel = channels[frameId];
            
            // Unbind all listeners first
            if (typeof channel.stopListening === 'function') {
              channel.stopListening('.presence.updated');
            }
            
            // Then leave the channel
            if (typeof channel.leave === 'function') {
              channel.leave();
            }
          }
        } catch (error) {
          console.warn('Error leaving Echo channel:', error);
        }
        
        // Clean up state
        set((state) => {
          const newFrames = { ...state.frames };
          delete newFrames[frameId];
          
          const newHeartbeats = { ...state.heartbeatIntervals };
          delete newHeartbeats[frameId];
          
          const newChannels = { ...state.channels };
          delete newChannels[frameId];
          
          const newTimeouts = { ...state.reconnectTimeouts };
          delete newTimeouts[frameId];
          
          const newAttempts = { ...state.reconnectAttempts };
          delete newAttempts[frameId];
          
          return {
            frames: newFrames,
            heartbeatIntervals: newHeartbeats,
            channels: newChannels,
            reconnectTimeouts: newTimeouts,
            reconnectAttempts: newAttempts
          };
        }, false, 'cleanupFrame');
        
        console.log('✅ Frame cleanup completed:', frameId);
      },

      // ✅ ADD: Cleanup all frames (for navigation)
      cleanupAllFrames: () => {
        const { frames } = get();
        console.log('🧹 Cleaning up all frames before navigation');
        
        Object.keys(frames).forEach(frameId => {
          try {
            get().cleanupFrame(frameId);
          } catch (error) {
            console.warn('Error cleaning up frame:', frameId, error);
          }
        });
        
        // ✅ CRITICAL: Also cleanup any orphaned Echo channels
        if (window.Echo?.connector?.channels) {
          Object.keys(window.Echo.connector.channels).forEach(channelName => {
            if (channelName.startsWith('presence-frame.')) {
              try {
                console.log('Cleaning up orphaned channel:', channelName);
                window.Echo.leave(channelName);
              } catch (error) {
                console.warn('Could not leave channel:', channelName);
              }
            }
          });
        }
      },

      // Join frame
      joinFrame: async (frameId, mode = 'forge', user = null) => {
        if (!frameId || !user) return false;
        
        const { initializeFrame, isNavigating } = get();
        
        // ✅ CRITICAL: Don't join if navigating
        if (isNavigating) {
          console.log('Skipping join - navigation in progress');
          return false;
        }
        
        initializeFrame(frameId);
        
        try {
          const response = await axios.post(`/api/frames/${frameId}/presence/join`, {
            mode
          });
          
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
          }), false, 'joinFrame');
          
          return true;
        } catch (error) {
          console.error('Failed to join frame:', error);
          set((state) => ({
            frames: {
              ...state.frames,
              [frameId]: {
                ...state.frames[frameId],
                error: 'Failed to join frame',
                isJoined: false
              }
            }
          }), false, 'joinFrame:error');
          return false;
        }
      },

      // Leave frame
      leaveFrame: async (frameId, mode = 'forge') => {
        const { frames } = get();
        const frameState = frames[frameId];
        
        if (!frameId || !frameState?.isJoined) return;

        try {
          await axios.post(`/api/frames/${frameId}/presence/leave`, { mode });
        } catch (error) {
          console.error('Failed to leave frame:', error);
        }
        
        set((state) => ({
          frames: {
            ...state.frames,
            [frameId]: {
              ...state.frames[frameId],
              isJoined: false
            }
          }
        }), false, 'leaveFrame');
      },

      // Update mode
      updateMode: async (frameId, newMode) => {
        const { frames, isNavigating } = get();
        const frameState = frames[frameId];
        
        if (!frameId || !frameState?.isJoined || isNavigating) return;

        try {
          await axios.put(`/api/frames/${frameId}/presence/mode`, {
            mode: newMode
          });
          
          set((state) => ({
            frames: {
              ...state.frames,
              [frameId]: {
                ...state.frames[frameId],
                currentMode: newMode
              }
            }
          }), false, 'updateMode');
        } catch (error) {
          console.error('Failed to update mode:', error);
        }
      },

      // Start heartbeat
      startHeartbeat: (frameId) => {
        const { heartbeatIntervals, heartbeatInterval, isNavigating } = get();
        
        if (isNavigating) {
          console.log('Skipping heartbeat start - navigation in progress');
          return;
        }
        
        if (heartbeatIntervals[frameId]) {
          clearInterval(heartbeatIntervals[frameId]);
        }

        const interval = setInterval(async () => {
          const { frames, isNavigating } = get();
          const frameState = frames[frameId];
          
          // ✅ CRITICAL: Stop heartbeat if navigating
          if (isNavigating || !frameId || !frameState?.isJoined) {
            clearInterval(interval);
            return;
          }

          try {
            await axios.post(`/api/frames/${frameId}/presence/heartbeat`, {
              mode: frameState.currentMode
            });
            
            set((state) => ({
              frames: {
                ...state.frames,
                [frameId]: {
                  ...state.frames[frameId],
                  error: null
                }
              }
            }), false, 'heartbeat:success');
          } catch (error) {
            console.error('Heartbeat failed:', error);
            set((state) => ({
              frames: {
                ...state.frames,
                [frameId]: {
                  ...state.frames[frameId],
                  error: 'Connection lost',
                  isJoined: false
                }
              }
            }), false, 'heartbeat:error');
          }
        }, heartbeatInterval);

        set((state) => ({
          heartbeatIntervals: {
            ...state.heartbeatIntervals,
            [frameId]: interval
          }
        }), false, 'startHeartbeat');
      },

      // ✅ ENHANCED: Setup WebSocket with navigation checks
      setupWebSocket: (frameId) => {
        if (!frameId || !window.Echo) return;

        const { 
          cleanupFrame, 
          maxReconnectAttempts, 
          reconnectDelay,
          setupWebSocket,
          isNavigating
        } = get();
        
        // ✅ CRITICAL: Don't setup if navigating
        if (isNavigating) {
          console.log('Skipping WebSocket setup - navigation in progress');
          return;
        }

        try {
          const channel = window.Echo.join(`frame.${frameId}`);
          
          channel
            .here((users) => {
              if (get().isNavigating) return;
              
              console.log('Currently in frame:', users);
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
              }), false, 'websocket:here');
            })
            .joining((user) => {
              if (get().isNavigating) return;
              
              console.log('User joining:', user);
              set((state) => {
                const frameState = state.frames[frameId];
                const exists = frameState.activeUsers.find(u => u.id === user.id);
                
                return {
                  frames: {
                    ...state.frames,
                    [frameId]: {
                      ...frameState,
                      activeUsers: exists ? frameState.activeUsers : [...frameState.activeUsers, user]
                    }
                  }
                };
              }, false, 'websocket:joining');
            })
            .leaving((user) => {
              if (get().isNavigating) return;
              
              console.log('User leaving:', user);
              set((state) => ({
                frames: {
                  ...state.frames,
                  [frameId]: {
                    ...state.frames[frameId],
                    activeUsers: state.frames[frameId].activeUsers.filter(u => u.id !== user.id)
                  }
                }
              }), false, 'websocket:leaving');
            })
            .listen('.presence.updated', (e) => {
              if (get().isNavigating) return;
              
              console.log('Presence updated:', e);
              
              set((state) => {
                const frameState = state.frames[frameId];
                if (!frameState) return state;

                let newActiveUsers = [...frameState.activeUsers];

                if (e.action === 'joined') {
                  const exists = newActiveUsers.find(u => u.id === e.user.id);
                  if (!exists) {
                    newActiveUsers.push({ ...e.user, mode: e.mode });
                  } else {
                    newActiveUsers = newActiveUsers.map(u => 
                      u.id === e.user.id ? { ...u, mode: e.mode } : u
                    );
                  }
                } else if (e.action === 'left') {
                  newActiveUsers = newActiveUsers.filter(u => u.id !== e.user.id);
                } else if (e.action === 'mode_updated') {
                  newActiveUsers = newActiveUsers.map(u => 
                    u.id === e.user.id ? { ...u, mode: e.mode } : u
                  );
                }

                return {
                  frames: {
                    ...state.frames,
                    [frameId]: {
                      ...frameState,
                      activeUsers: newActiveUsers
                    }
                  }
                };
              }, false, 'websocket:presence.updated');
            })
            .error((error) => {
              console.error('Echo channel error:', error);
              
              set((state) => {
                const attempts = state.reconnectAttempts[frameId] || 0;
                
                // ✅ Don't reconnect if navigating
                if (state.isNavigating || attempts >= maxReconnectAttempts) {
                  return {
                    frames: {
                      ...state.frames,
                      [frameId]: {
                        ...state.frames[frameId],
                        isConnected: false,
                        error: 'Connection failed'
                      }
                    }
                  };
                }
                
                const timeout = setTimeout(() => {
                  if (!get().isNavigating) {
                    setupWebSocket(frameId);
                  }
                }, reconnectDelay * (attempts + 1));

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
                };
              }, false, 'websocket:error');
            });

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
          }), false, 'setupWebSocket');

        } catch (error) {
          console.error('Failed to setup WebSocket:', error);
          set((state) => ({
            frames: {
              ...state.frames,
              [frameId]: {
                ...state.frames[frameId],
                error: 'Failed to connect to real-time updates',
                isConnected: false
              }
            }
          }), false, 'setupWebSocket:error');
        }
      },

      // Initialize frame presence (main entry point)
      initializeFramePresence: async (frameId, mode = 'forge', user = null) => {
        if (!frameId || !user) return false;

        const { joinFrame, startHeartbeat, setupWebSocket, isNavigating } = get();
        
        // ✅ CRITICAL: Don't initialize if navigating
        if (isNavigating) {
          console.log('Skipping presence init - navigation in progress');
          return false;
        }
        
        const joined = await joinFrame(frameId, mode, user);
        if (joined && !get().isNavigating) {
          startHeartbeat(frameId);
          setupWebSocket(frameId);
        }
        
        return joined;
      },

      // Getters
      getFrameState: (frameId) => {
        const { frames } = get();
        return frames[frameId] || {
          activeUsers: [],
          isJoined: false,
          isConnected: false,
          error: null,
          currentMode: 'forge'
        };
      },

      getUsersByMode: (frameId, mode, currentUserId = null) => {
        const { frames } = get();
        const frameState = frames[frameId];
        
        if (!frameState) return [];
        
        return frameState.activeUsers.filter(u => 
          u.mode === mode && u.id !== currentUserId
        );
      }
    }),
    {
      name: 'frame-presence-store',
    }
  )
);

//ADD: Setup global navigation listeners
// if (typeof window !== 'undefined') {
//   // Listen for Inertia navigation start
//   router.on('start', (event) => {
//     console.log('🚀 Navigation starting, cleaning up Echo...');
//     useFramePresenceStore.getState().setNavigating(true);
//     useFramePresenceStore.getState().cleanupAllFrames();
//   });
//   
//   // Listen for Inertia navigation finish
//   router.on('finish', (event) => {
//     console.log('✅ Navigation finished');
//     // Small delay to ensure page is ready
//     setTimeout(() => {
//       useFramePresenceStore.getState().setNavigating(false);
//     }, 100);
//   });
//   
//   // Listen for beforeunload (browser navigation/close)
//   window.addEventListener('beforeunload', () => {
//     console.log('🚀 Page unloading, cleaning up Echo...');
//     useFramePresenceStore.getState().cleanupAllFrames();
//   });
// }

export { useFramePresenceStore };