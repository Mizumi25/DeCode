// @/Components/Workspaces/WorkspaceChat.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Users, 
  Search,
  AtSign,
  Hash,
  Link,
  Smile
} from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useMessageStore } from '@/stores/useMessageStore';

const WorkspaceChat = () => {
  const { auth, currentWorkspace } = usePage().props;
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState(0);
  const [mentionResults, setMentionResults] = useState([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const mentionPickerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const { 
    messages, 
    unreadCount,
    typingUsers: storeTypingUsers,
    loadMessages,
    setUnreadCount,
    addMessage
  } = useMessageStore();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle outside clicks for mention picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mentionPickerRef.current && !mentionPickerRef.current.contains(event.target)) {
        setShowMentionPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load messages when workspace changes
  useEffect(() => {
    if (currentWorkspace?.id && isOpen) {
      console.log('📨 Loading messages for workspace:', currentWorkspace.id);
      loadMessages(currentWorkspace.id);
    }
  }, [currentWorkspace?.id, isOpen]);
  
  
  // Add this useEffect to check session status
useEffect(() => {
  const checkSession = async () => {
    try {
      const response = await fetch('/api/user', {
        headers: {
          'Accept': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken()
        },
        credentials: 'include'
      });
      
      if (!response.ok && response.status === 419) {
        console.warn('⚠️ Session expired on mount');
        // You could show a persistent warning here
      }
    } catch (error) {
      console.error('Session check failed:', error);
    }
  };

  if (isOpen) {
    checkSession();
  }
}, [isOpen]);
  
  

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpen = () => {
    console.log('🚪 Opening chat for workspace:', currentWorkspace);
    setIsOpen(true);
    
    // Mark messages as read using fetch
    if (currentWorkspace?.id) {
      fetch(`/api/workspaces/${currentWorkspace.id}/messages/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        }
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          setUnreadCount(0);
        }
      })
      .catch(error => console.error('Failed to mark as read:', error));
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowMentionPicker(false);
  };

  const handleSendMessage = async () => {
  console.log('🚀 SEND MESSAGE TRIGGERED');

  if (!message.trim() || isSending) {
    console.log('❌ Empty message or already sending');
    return;
  }

  if (!currentWorkspace?.id) {
    console.error('❌ No workspace ID');
    return;
  }

  const mentions = extractMentions(message);
  const messageContent = message.trim();
  
  console.log('📦 Sending message:', { content: messageContent, mentions });

  setIsSending(true);

  try {
    // Use the store's sendMessage method for consistent CSRF handling
    await useMessageStore.getState().sendMessage(currentWorkspace.id, {
      content: messageContent,
      mentions: mentions.map(mention => ({
        type: mention.type,
        id: mention.id,
        position: mention.position,
        length: mention.length
      }))
    });

    console.log('✅ Message sent successfully!');
    
    // Clear input immediately
    setMessage('');
    setShowMentionPicker(false);
    stopTyping();
    
    // Scroll to bottom
    setTimeout(() => scrollToBottom(), 100);
    
  } catch (error) {
    console.error('❌ Failed to send message:', error);
    
    // Show user-friendly error message
    if (error.message.includes('Session expired')) {
      alert('Your session has expired. Please refresh the page and try again.');
    } else if (error.message.includes('Failed to send message: 419')) {
      alert('Session token expired. Please refresh the page.');
    } else {
      alert(error.message || 'Failed to send message. Please try again.');
    }
  } finally {
    setIsSending(false);
  }
};

  // Debounced search for mentionables
  const searchMentionablesDebounced = useCallback(
    (query) => {
      if (!currentWorkspace?.id) return;

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      setIsSearching(true);

      // Debounce by 300ms
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          console.log('🔍 Searching mentionables:', query);
          
          const response = await fetch(
            `/api/workspaces/${currentWorkspace.id}/messages/mentionables?q=${encodeURIComponent(query || '')}`,
            {
              headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
              }
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch mentionables');
          }

          const result = await response.json();
          console.log('🔍 Search results:', result);

          if (result.success && Array.isArray(result.data)) {
            setMentionResults(result.data);
            setSelectedMentionIndex(0);
          } else {
            setMentionResults([]);
          }
        } catch (error) {
          console.error('Error searching mentionables:', error);
          setMentionResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    },
    [currentWorkspace?.id]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Check for mention trigger
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');
    const lastHashPos = textBeforeCursor.lastIndexOf('#');
    
    // Find the last space before the cursor
    const lastSpace = textBeforeCursor.lastIndexOf(' ');
    
    // Check if we're in a mention (@ or # after last space)
    const triggerPos = Math.max(lastAtPos, lastHashPos);
    
    if (triggerPos > lastSpace && triggerPos !== -1) {
      const query = textBeforeCursor.substring(triggerPos + 1);
      
      // Show picker if query doesn't contain space
      if (!query.includes(' ')) {
        console.log('🎯 Mention triggered! Query:', query);
        setShowMentionPicker(true);
        setMentionQuery(query);
        setMentionPosition(triggerPos);
        
        // Search immediately (will be debounced)
        searchMentionablesDebounced(query);
      } else {
        setShowMentionPicker(false);
      }
    } else {
      setShowMentionPicker(false);
    }

    // Handle typing indicators
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      startTyping();
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      stopTyping();
    }
  };

  const handleKeyDown = (e) => {
    if (showMentionPicker && mentionResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev < mentionResults.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev > 0 ? prev - 1 : mentionResults.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectMention(mentionResults[selectedMentionIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentionPicker(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectMention = (mention) => {
    if (!mention) return;

    const beforeMention = message.substring(0, mentionPosition);
    const afterMention = message.substring(mentionPosition + 1 + mentionQuery.length);
    
    let mentionText = '';
    if (mention.type === 'user') {
      mentionText = `@${mention.name}`;
    } else {
      mentionText = `#${mention.name}`;
    }

    const newMessage = beforeMention + mentionText + ' ' + afterMention;
    setMessage(newMessage);
    setShowMentionPicker(false);
    setMentionQuery('');
    setMentionResults([]);

    // Focus back to input and set cursor position
    setTimeout(() => {
      messageInputRef.current?.focus();
      const newCursorPos = mentionPosition + mentionText.length + 1;
      messageInputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const extractMentions = (text) => {
    const mentions = [];
    
    try {
      // Find user mentions (@username)
      const userMentionRegex = /@(\w+)/g;
      let match;
      while ((match = userMentionRegex.exec(text)) !== null) {
        mentions.push({
          type: 'user',
          id: 0,
          position: match.index,
          length: match[0].length
        });
      }

      // Find project/frame mentions (#name)
      const projectMentionRegex = /#(\w+)/g;
      while ((match = projectMentionRegex.exec(text)) !== null) {
        mentions.push({
          type: 'project',
          id: 0,
          position: match.index,
          length: match[0].length
        });
      }
    } catch (error) {
      console.error('Error extracting mentions:', error);
    }
    
    return mentions;
  };

  const formatMessageContent = (content, mentions = []) => {
    let formattedContent = content;
    let offset = 0;

    mentions.forEach(mention => {
      const mentionable = mention.mentionable;
      if (!mentionable) return;

      const start = mention.position + offset;
      const end = start + mention.length;
      
      let replacement = '';
      if (mentionable.type === 'user' || mentionable.type === 'User') {
        replacement = `<span class="mention user-mention px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded" data-user-id="${mentionable.id}">@${mentionable.name}</span>`;
      } else {
        const url = mentionable.url || '#';
        replacement = `<a href="${url}" class="mention project-mention px-1 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded hover:underline" data-${mentionable.type}-id="${mentionable.id}">#${mentionable.name}</a>`;
      }

      formattedContent = formattedContent.substring(0, start) + replacement + formattedContent.substring(end);
      offset += replacement.length - mention.length;
    });

    return { __html: formattedContent };
  };

  const startTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  const stopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
  };

  // Animation variants
  const slideInVariants = {
    closed: {
      x: '100%',
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  if (!currentWorkspace || currentWorkspace.type === 'personal') {
    return null;
  }

  return (
    <>
      {/* Chat Trigger Button */}
      <div className="fixed right-6 bottom-6 z-40">
        <motion.button
          onClick={handleOpen}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative bg-[var(--color-primary)] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <MessageCircle className="w-6 h-6" />
          
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={slideInVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed right-0 bottom-6 z-50 w-96 h-[600px] max-h-[80vh] bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-text)]">
                    {currentWorkspace.name} Chat
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {messages.length} messages
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
              >
                <X className="w-5 h-5 text-[var(--color-text-muted)]" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3 opacity-50" />
                  <p className="text-[var(--color-text-muted)]">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="flex gap-3 group">
                    <div className="flex-shrink-0">
                      {msg.user?.avatar ? (
                        <img 
                          src={msg.user.avatar} 
                          alt={msg.user.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                          {msg.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-[var(--color-text)]">
                          {msg.user?.name}
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div 
                        className="text-sm text-[var(--color-text)] break-words message-content"
                        dangerouslySetInnerHTML={formatMessageContent(msg.content, msg.mentions)}
                      />
                    </div>
                  </div>
                ))
              )}
              
              {/* Typing Indicators */}
              {storeTypingUsers.length > 0 && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-[var(--color-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1 h-1 bg-[var(--color-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1 h-1 bg-[var(--color-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                  <div className="text-sm text-[var(--color-text-muted)]">
                    {storeTypingUsers.map(u => u.name).join(', ')} {storeTypingUsers.length === 1 ? 'is' : 'are'} typing...
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Mention Picker */}
            <AnimatePresence>
              {showMentionPicker && (
                <motion.div
                  ref={mentionPickerRef}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-20 left-4 right-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto"
                >
                  {isSearching ? (
                    <div className="p-3 text-sm text-[var(--color-text-muted)] text-center">
                      Searching...
                    </div>
                  ) : mentionResults.length === 0 ? (
                    <div className="p-3 text-sm text-[var(--color-text-muted)] text-center">
                      {mentionQuery ? `No results for "${mentionQuery}"` : 'Start typing to search...'}
                    </div>
                  ) : (
                    mentionResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => selectMention(result)}
                        className={`w-full p-3 text-left hover:bg-[var(--color-bg-muted)] transition-colors flex items-center gap-3 ${
                          index === selectedMentionIndex ? 'bg-[var(--color-primary-soft)]' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          result.type === 'user' ? 'bg-blue-500' : 
                          result.type === 'project' ? 'bg-green-500' : 'bg-purple-500'
                        }`}>
                          {result.type === 'user' ? (
                            <AtSign className="w-4 h-4 text-white" />
                          ) : (
                            <Hash className="w-4 h-4 text-white" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-[var(--color-text)] truncate">
                            {result.display}
                          </div>
                          <div className="text-xs text-[var(--color-text-muted)] truncate">
                            {result.description}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="p-4 border-t border-[var(--color-border)]">
              <div className="relative">
                <textarea
                  ref={messageInputRef}
                  value={message}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message... @mention users or #projects/frames"
                  rows={3}
                  disabled={isSending}
                  className="w-full px-3 py-2 pr-10 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none custom-scrollbar disabled:opacity-50"
                />
                
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isSending}
                  className="absolute bottom-2 right-2 p-1.5 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-2 text-xs text-[var(--color-text-muted)]">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      setMessage(message + '@');
                      messageInputRef.current?.focus();
                    }}
                    className="hover:text-[var(--color-text)] transition-colors"
                    title="Mention user"
                  >
                    <AtSign className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setMessage(message + '#');
                      messageInputRef.current?.focus();
                    }}
                    className="hover:text-[var(--color-text)] transition-colors"
                    title="Mention project/frame"
                  >
                    <Hash className="w-4 h-4" />
                  </button>
                </div>
                
                <span>{message.length}/2000</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WorkspaceChat;