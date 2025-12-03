// Components/Notifications/EnhancedToast.jsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Lock, Unlock, UserPlus, Shield, Check, Minimize2, Maximize2 } from 'lucide-react';
import gsap from 'gsap';

const NotificationIcon = ({ type }) => {
  const iconMap = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    lock: Lock,
    unlock: Unlock,
    lock_request: UserPlus,
    lock_granted: Unlock,
    lock_denied: Lock,
    owner_bypass: Shield,
  };

  const Icon = iconMap[type] || Info;
  return <Icon className="w-5 h-5" />;
};

const EnhancedToast = ({ notification, onClose }) => {
  const { 
    type, 
    title, 
    message, 
    userName, 
    duration = 5000, 
    persistent = false, 
    interactive = false, 
    draggable = false,
    actions = []
  } = notification;
  const toastRef = useRef(null);
  const progressRef = useRef(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = React.useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!toastRef.current || !progressRef.current) return;

    // GSAP entrance animation
    const tl = gsap.timeline();
    
    tl.fromTo(
      toastRef.current,
      {
        x: 100,
        opacity: 0,
        scale: 0.8,
      },
      {
        x: position.x,
        y: position.y,
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: 'back.out(1.7)',
      }
    );

    // Only animate progress bar and auto-close if not persistent
    if (!persistent) {
      // Progress bar animation
      gsap.fromTo(
        progressRef.current,
        { scaleX: 1 },
        {
          scaleX: 0,
          duration: duration / 1000,
          ease: 'none',
          transformOrigin: 'left',
        }
      );

      // Auto-close timer
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearTimeout(timer);
        tl.kill();
      };
    }

    return () => {
      tl.kill();
    };
  }, [duration, persistent, position]);

  const handleClose = () => {
    if (!toastRef.current) return;

    // GSAP exit animation
    gsap.to(toastRef.current, {
      x: 100,
      opacity: 0,
      scale: 0.8,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: onClose,
    });
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    if (!draggable || interactive) return; // Don't drag if it has action buttons (user might be clicking them)
    
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;
    
    setPosition({ x: newX, y: newY });
    
    if (toastRef.current) {
      gsap.set(toastRef.current, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const getColorClasses = () => {
    const colorMap = {
      success: {
        bg: 'bg-green-500/10 dark:bg-green-500/20',
        text: 'text-green-700 dark:text-green-300',
        icon: 'text-green-600 dark:text-green-400',
        progress: 'bg-green-500',
      },
      error: {
        bg: 'bg-red-500/10 dark:bg-red-500/20',
        text: 'text-red-700 dark:text-red-300',
        icon: 'text-red-600 dark:text-red-400',
        progress: 'bg-red-500',
      },
      warning: {
        bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
        text: 'text-yellow-700 dark:text-yellow-300',
        icon: 'text-yellow-600 dark:text-yellow-400',
        progress: 'bg-yellow-500',
      },
      info: {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        text: 'text-blue-700 dark:text-blue-300',
        icon: 'text-blue-600 dark:text-blue-400',
        progress: 'bg-blue-500',
      },
      lock: {
        bg: 'bg-purple-500/10 dark:bg-purple-500/20',
        text: 'text-purple-700 dark:text-purple-300',
        icon: 'text-purple-600 dark:text-purple-400',
        progress: 'bg-purple-500',
      },
      unlock: {
        bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
        text: 'text-indigo-700 dark:text-indigo-300',
        icon: 'text-indigo-600 dark:text-indigo-400',
        progress: 'bg-indigo-500',
      },
      lock_request: {
        bg: 'bg-orange-500/10 dark:bg-orange-500/20',
        text: 'text-orange-700 dark:text-orange-300',
        icon: 'text-orange-600 dark:text-orange-400',
        progress: 'bg-orange-500',
      },
      lock_granted: {
        bg: 'bg-teal-500/10 dark:bg-teal-500/20',
        text: 'text-teal-700 dark:text-teal-300',
        icon: 'text-teal-600 dark:text-teal-400',
        progress: 'bg-teal-500',
      },
      lock_denied: {
        bg: 'bg-rose-500/10 dark:bg-rose-500/20',
        text: 'text-rose-700 dark:text-rose-300',
        icon: 'text-rose-600 dark:text-rose-400',
        progress: 'bg-rose-500',
      },
      owner_bypass: {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-700 dark:text-amber-300',
        icon: 'text-amber-600 dark:text-amber-400',
        progress: 'bg-amber-500',
      },
    };

    return colorMap[type] || colorMap.info;
  };

  const colors = getColorClasses();

  return (
    <div
      ref={toastRef}
      onMouseDown={handleMouseDown}
      className={`
        relative overflow-hidden
        rounded-2xl
        ${colors.bg}
        backdrop-blur-xl
        shadow-2xl
        border-0
        ${draggable && !interactive ? 'cursor-move' : ''}
        ${isDragging ? 'cursor-grabbing' : ''}
        ${persistent ? 'ring-2 ring-offset-2 ring-offset-transparent' : ''}
        ${persistent && colors.icon}
        transition-all duration-300
        ${isMinimized ? 'min-w-[80px] max-w-[80px]' : 'min-w-[320px] max-w-md'}
      `}
      style={{
        boxShadow: persistent 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
          : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Progress bar - hide if persistent */}
      {!persistent && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5">
          <div
            ref={progressRef}
            className={`h-full ${colors.progress}`}
            style={{ transformOrigin: 'left' }}
          />
        </div>
      )}

      {/* Content */}
      <div className={`${isMinimized ? 'p-2' : 'p-4 pt-5'}`}>
        {isMinimized ? (
          // Minimized view - just icon
          <div className="flex items-center justify-center">
            <div className={`${colors.icon}`}>
              <NotificationIcon type={type} />
            </div>
          </div>
        ) : (
          // Full view
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`flex-shrink-0 ${colors.icon}`}>
              <NotificationIcon type={type} />
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-sm mb-0.5 ${colors.text}`}>
                {title}
              </h4>
              <p className={`text-sm opacity-90 ${colors.text}`}>
                {message}
              </p>
              {userName && (
                <p className={`text-xs opacity-75 mt-1 ${colors.text}`}>
                  by {userName}
                </p>
              )}
            </div>

            {/* Minimize/Close buttons */}
            <div className="flex-shrink-0 flex gap-1">
              {/* Minimize button for interactive toasts */}
              {interactive && (
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className={`
                    p-1 rounded-lg
                    ${colors.text} opacity-60 hover:opacity-100
                    hover:bg-black/5 dark:hover:bg-white/5
                    transition-all duration-200
                  `}
                  title={isMinimized ? "Expand" : "Minimize"}
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              )}
              
              {/* Close button - only if not interactive */}
              {!interactive && (
                <button
                  onClick={handleClose}
                  className={`
                    p-1 rounded-lg
                    ${colors.text} opacity-60 hover:opacity-100
                    hover:bg-black/5 dark:hover:bg-white/5
                    transition-all duration-200
                  `}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons for interactive toasts - hide when minimized */}
      {interactive && actions && actions.length > 0 && !isMinimized && (
        <div className="px-4 pb-4 pt-2 flex gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`
                flex-1 px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                flex items-center justify-center gap-2
                ${action.variant === 'success' 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : action.variant === 'danger'
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
                }
              `}
            >
              {action.icon === 'check' && <Check className="w-4 h-4" />}
              {action.icon === 'x' && <X className="w-4 h-4" />}
              {action.label}
            </button>
          ))}
        </div>
      )}
      
      {/* Expand button when minimized */}
      {isMinimized && (
        <div className="px-2 pb-2">
          <button
            onClick={() => setIsMinimized(false)}
            className={`
              w-full p-1 rounded-lg
              ${colors.text} opacity-60 hover:opacity-100
              hover:bg-black/5 dark:hover:bg-white/5
              transition-all duration-200
              flex items-center justify-center
            `}
            title="Expand"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Enhanced Toast Container with configurable position
 * @param {string} position - Position of toast container (top-right, top-left, bottom-right, bottom-left, top-center, bottom-center)
 */
const EnhancedToastContainer = ({ position = 'top-right', notifications = [], onRemoveNotification }) => {
  const getPositionClasses = () => {
    const positions = {
      'top-right': 'top-6 right-6 items-end',
      'top-left': 'top-6 left-6 items-start',
      'bottom-right': 'bottom-6 right-6 items-end',
      'bottom-left': 'bottom-6 left-6 items-start',
      'top-center': 'top-6 left-1/2 -translate-x-1/2 items-center',
      'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2 items-center',
    };
    return positions[position] || positions['top-right'];
  };

  if (notifications.length === 0) {
    return null;
  }

  return createPortal(
    <div
      className={`
        fixed ${getPositionClasses()}
        z-[99999]
        flex flex-col gap-3
        pointer-events-none
      `}
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            layout
            className="pointer-events-auto"
          >
            <EnhancedToast
              notification={notification}
              onClose={() => onRemoveNotification(notification.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};

export default EnhancedToastContainer;
export { EnhancedToast };
