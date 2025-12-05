// Components/Notifications/NotificationsModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Check, Trash2, CheckCheck, UserPlus, Lock, Frame as FrameIcon } from 'lucide-react';
import { usePage } from '@inertiajs/react';

const NotificationIcon = ({ type }) => {
  const icons = {
    invite_accepted: UserPlus,
    welcome: Bell,
    frame_access: Lock,
    frame_mention: FrameIcon,
    default: Bell,
  };
  
  const Icon = icons[type] || icons.default;
  return <Icon className="w-5 h-5" />;
};

const NotificationItem = ({ notification, onDelete, onMarkRead }) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const constraintsRef = useRef(null);

  const handleDragEnd = (event, info) => {
    // If swiped more than 100px to the right, delete
    if (info.offset.x > 100) {
      onDelete(notification.uuid);
    } else {
      setSwipeX(0);
    }
    setIsSwiping(false);
  };

  const getTypeColors = () => {
    const colors = {
      invite_accepted: 'bg-green-500/10 text-green-600 dark:text-green-400',
      welcome: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      frame_access: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      frame_mention: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      default: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
    };
    return colors[notification.type] || colors.default;
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 200 }}
      dragElastic={0.2}
      onDragStart={() => setIsSwiping(true)}
      onDragEnd={handleDragEnd}
      onDrag={(e, info) => setSwipeX(info.offset.x)}
      className="relative"
    >
      {/* Delete indicator when swiping */}
      <div
        className="absolute inset-y-0 left-0 flex items-center justify-center bg-red-500 rounded-lg transition-all"
        style={{ width: Math.max(0, swipeX) }}
      >
        {swipeX > 50 && (
          <Trash2 className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Notification Card */}
      <motion.div
        className={`
          relative p-4 rounded-lg border border-[var(--color-border)]
          ${notification.read ? 'bg-[var(--color-bg-muted)] opacity-70' : 'bg-[var(--color-surface)]'}
          hover:shadow-md transition-all duration-200
          cursor-pointer
        `}
        onClick={() => !notification.read && onMarkRead(notification.uuid)}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getTypeColors()}`}>
            <NotificationIcon type={notification.type} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-sm text-[var(--color-text)]">
                {notification.title}
              </h4>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
              )}
            </div>
            
            <p className="text-sm text-[var(--color-text-muted)] mb-2">
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-text-muted)]">
                {new Date(notification.created_at).toLocaleString()}
              </span>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.uuid);
                }}
                className="p-1 hover:bg-red-500/10 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const NotificationsModal = ({ isOpen, onClose }) => {
  const { auth } = usePage().props;
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications', {
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.data);
          setUnreadCount(data.unread_count);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (uuid) => {
    try {
      const response = await fetch(`/api/notifications/${uuid}/read`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.uuid === uuid ? { ...n, read: true, read_at: new Date().toISOString() } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDelete = async (uuid) => {
    try {
      const response = await fetch(`/api/notifications/${uuid}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.uuid !== uuid));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-2xl max-h-[80vh] bg-[var(--color-surface)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Notifications
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--color-bg-muted)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[var(--color-text-muted)]" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="w-16 h-16 text-[var(--color-text-muted)] opacity-30 mb-4" />
              <p className="text-[var(--color-text-muted)]">No notifications yet</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                You'll see updates and alerts here
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-xs text-[var(--color-text-muted)] px-2">
                💡 Tip: Swipe right to delete
              </div>
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.uuid}
                  notification={notification}
                  onDelete={handleDelete}
                  onMarkRead={handleMarkRead}
                />
              ))}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default NotificationsModal;
