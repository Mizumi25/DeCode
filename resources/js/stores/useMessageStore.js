// @/stores/useMessageStore.js
import { create } from 'zustand';

// Enhanced CSRF token helper with refresh capability
const getCsrfToken = () => {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  
  // If no token found, try to refresh the page meta tag
  if (!token) {
    console.warn('⚠️ CSRF token not found in meta tag');
    // This might indicate the page needs a refresh
    return '';
  }
  
  return token;
};

// Helper to check if we should refresh the page
const shouldRefreshPage = (error) => {
  return error.message.includes('Session expired') || 
         error.message.includes('419') ||
         error.message.includes('CSRF token');
};

export const useMessageStore = create((set, get) => ({
  messages: [],
  unreadCount: 0,
  typingUsers: [],
  isLoading: false,
  error: null,
  
  // Load messages for workspace
  loadMessages: async (workspaceId) => {
    console.log('📨 Loading messages for workspace:', workspaceId);
    set({ isLoading: true, error: null });
    
    try {
      const token = getCsrfToken();
      if (!token) {
        throw new Error('CSRF token not available. Please refresh the page.');
      }

      const response = await fetch(`/api/workspaces/${workspaceId}/messages`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token
        },
        credentials: 'include'
      });
      
      console.log('📨 Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 419) {
          throw new Error('Session expired. Please refresh the page.');
        }
        const errorText = await response.text();
        console.error('❌ Failed to load messages:', response.status, errorText);
        throw new Error(`Failed to load messages: ${response.status}`);
      }

      const result = await response.json();
      console.log('📨 Messages loaded:', result);
      
      if (result.success) {
        const messagesArray = Array.isArray(result.data) 
          ? result.data 
          : (result.data.data || []);
        
        set({ 
          messages: messagesArray.reverse(),
          isLoading: false,
          error: null
        });
      } else {
        throw new Error(result.message || 'Failed to load messages');
      }
    } catch (error) {
      console.error('❌ Failed to load messages:', error);
      set({ 
        isLoading: false,
        error: error.message,
        messages: []
      });
      
      // Auto-refresh on session expiry during load
      if (shouldRefreshPage(error)) {
        setTimeout(() => {
          if (confirm('Your session has expired. Refresh the page?')) {
            window.location.reload();
          }
        }, 1000);
      }
    }
  },
  
  // Send message
  sendMessage: async (workspaceId, messageData) => {
    console.log('🚀 Sending message to workspace:', workspaceId, messageData);
    
    try {
      const token = getCsrfToken();
      if (!token) {
        throw new Error('CSRF token not available. Please refresh the page.');
      }

      const response = await fetch(`/api/workspaces/${workspaceId}/messages`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token
        },
        credentials: 'include',
        body: JSON.stringify(messageData)
      });
      
      console.log('📨 Send message response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 419) {
          throw new Error('Session expired. Please refresh the page.');
        }
        
        const errorText = await response.text();
        console.error('❌ Failed to send message:', response.status, errorText);
        
        let errorMessage = `Failed to send message: ${response.status}`;
        try {
          const errorResult = JSON.parse(errorText);
          errorMessage = errorResult.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Message sent successfully:', result);
      
      if (result.success) {
        set(state => ({
          messages: [...state.messages, result.data],
          error: null
        }));
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      set({ error: error.message });
      throw error;
    }
  },
  
  // ... rest of your store methods remain the same
  setUnreadCount: (count) => {
    set({ unreadCount: count });
  },
  
  getUnreadCount: async (workspaceId) => {
    try {
      const token = getCsrfToken();
      const response = await fetch(`/api/workspaces/${workspaceId}/messages/unread-count`, {
        headers: {
          'Accept': 'application/json',
          'X-CSRF-TOKEN': token
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to get unread count');
      }

      const result = await response.json();
      
      if (result.success) {
        set({ unreadCount: result.data.unread_count });
      }
    } catch (error) {
      console.error('Failed to get unread count:', error);
    }
  },
  
  addMessage: (message) => {
    set(state => ({
      messages: [...state.messages, message],
      unreadCount: state.unreadCount + 1
    }));
  },
  
  addTypingUser: (user) => {
    set(state => ({
      typingUsers: [...state.typingUsers.filter(u => u.id !== user.id), user]
    }));
  },
  
  removeTypingUser: (userId) => {
    set(state => ({
      typingUsers: state.typingUsers.filter(u => u.id !== userId)
    }));
  },
  
  clearError: () => {
    set({ error: null });
  }
}));