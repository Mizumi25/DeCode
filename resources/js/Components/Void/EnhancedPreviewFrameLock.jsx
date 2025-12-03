// Components/Void/EnhancedPreviewFrameLock.jsx
import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Shield } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import useFrameLockStore from '@/stores/useFrameLockStore';
import ConfirmDialog from '@/Components/ConfirmDialog';

/**
 * Enhanced Lock Button for Preview Frame in Void Page
 * - Owner can lock/unlock from outside (void)
 * - Editor cannot interact from outside (must be inside)
 * - Viewer cannot interact at all
 */
const EnhancedPreviewFrameLock = ({ frameUuid, className = '' }) => {
  const { props } = usePage();
  const { auth } = props;
  const user = auth?.user;

  const {
    getLockStatus,
    toggleFrameLock,
    getFrameLockStatus,
    addNotification,
  } = useFrameLockStore();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const lockStatus = getLockStatus(frameUuid);

  // Load lock status on mount and when it changes
  useEffect(() => {
    if (frameUuid) {
      getFrameLockStatus(frameUuid);
    }
  }, [frameUuid, getFrameLockStatus]);
  
  // Subscribe to lock status changes
  useEffect(() => {
    if (!frameUuid) return;
    
    // Poll for updates to ensure UI stays in sync
    const interval = setInterval(() => {
      getFrameLockStatus(frameUuid);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [frameUuid, getFrameLockStatus]);

  const handleLockClick = async (e) => {
    e.stopPropagation(); // Prevent frame navigation

    if (!lockStatus || isLoading) return;

    const userRole = lockStatus.user_role;

    // Only owner can interact with lock from void page
    if (userRole !== 'owner') {
      // Show tooltip or do nothing - editor/viewer can't interact from outside
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmToggle = async () => {
    setShowConfirmDialog(false);
    setIsLoading(true);

    try {
      // Owner can lock/unlock in any mode, default to 'forge' (unified lock)
      const result = await toggleFrameLock(frameUuid, 'forge');

      if (result?.success) {
        // Wait a bit for the store to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Refresh lock status to ensure UI is in sync
        await getFrameLockStatus(frameUuid);
        
        const action = lockStatus.is_locked ? 'unlocked' : 'locked';
        addNotification({
          type: action === 'locked' ? 'lock' : 'unlock',
          title: `Frame ${action}`,
          message: `You have ${action} this frame from outside.`,
          userName: user?.name,
        });
      }
    } catch (error) {
      console.error('Failed to toggle lock:', error);
      addNotification({
        type: 'error',
        title: 'Lock Error',
        message: error.message || 'Failed to change lock status.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!lockStatus) {
    return null;
  }

  const isLocked = lockStatus.is_locked;
  const userRole = lockStatus.user_role;
  const isOwner = userRole === 'owner';
  const lockedByMe = lockStatus.locked_by_me;

  // Determine if button should be interactive
  const isInteractive = isOwner;

  return (
    <>
      <button
        onClick={handleLockClick}
        disabled={!isInteractive || isLoading}
        className={`
          relative group
          p-2 rounded-xl
          transition-all duration-300
          ${isLocked ? 'bg-purple-500/20 hover:bg-purple-500/30' : 'bg-gray-500/10 hover:bg-gray-500/20'}
          ${!isInteractive ? 'cursor-default' : 'cursor-pointer'}
          ${className}
        `}
        title={
          !isInteractive
            ? isLocked
              ? `Locked by ${lockStatus.locked_by?.name || 'someone'} (${lockStatus.locked_mode} mode)`
              : 'Frame unlocked'
            : isLocked
            ? 'Click to unlock frame (Owner only)'
            : 'Click to lock frame (Owner only)'
        }
        style={{ pointerEvents: 'auto' }}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {isLocked ? (
              <Lock
                className={`
                  w-5 h-5 transition-all duration-300
                  ${isOwner ? 'text-purple-400 group-hover:text-purple-300' : 'text-purple-500'}
                  ${isOwner && 'group-hover:scale-110'}
                `}
              />
            ) : (
              <Unlock
                className={`
                  w-5 h-5 transition-all duration-300
                  ${isOwner ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-500'}
                  ${isOwner && 'group-hover:scale-110'}
                `}
              />
            )}

            {/* Owner badge indicator */}
            {isOwner && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                <Shield className="w-2.5 h-2.5 text-white" />
              </div>
            )}

            {/* Lock status indicator */}
            {isLocked && (
              <div
                className={`
                  absolute -bottom-1 -right-1 w-3 h-3 rounded-full
                  ${lockedByMe ? 'bg-green-500' : 'bg-red-500'}
                  ring-2 ring-[var(--color-surface)]
                `}
              />
            )}
          </>
        )}
      </button>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmToggle}
        title={isLocked ? 'Unlock Frame' : 'Lock Frame'}
        message={
          isLocked
            ? `Are you sure you want to unlock this frame? Users inside will be notified.`
            : `Are you sure you want to lock this frame? This will prevent editors from entering until unlocked.`
        }
        confirmText={isLocked ? 'Unlock' : 'Lock'}
        variant={isLocked ? 'info' : 'warning'}
        isLoading={isLoading}
      />
    </>
  );
};

export default EnhancedPreviewFrameLock;
