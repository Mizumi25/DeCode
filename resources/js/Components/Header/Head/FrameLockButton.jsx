// Components/Header/Head/FrameLockButton.jsx
import React, { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import useFrameLockStore from '@/stores/useFrameLockStore';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

/**
 * Frame Lock Button for Header (Forge & Source pages)
 * Allows Owner and Editor to lock/unlock the frame from inside
 */
const FrameLockButton = ({ frameUuid, currentMode = 'forge' }) => {
  const { props } = usePage();
  const { auth } = props;
  const user = auth?.user;
  
  const { currentWorkspace } = useWorkspaceStore();
  const [myRole, setMyRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    getLockStatus,
    toggleFrameLock,
    getFrameLockStatus,
    addNotification,
  } = useFrameLockStore();

  const lockStatus = getLockStatus(frameUuid);

  // Fetch user's workspace role
  useEffect(() => {
    const fetchMyRole = async () => {
      if (!currentWorkspace?.uuid) return;

      try {
        const response = await fetch(
          `/api/workspaces/${currentWorkspace.uuid}/roles/my-role`,
          {
            headers: { Accept: 'application/json' },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setMyRole(data.data.role);
          }
        }
      } catch (error) {
        console.error('Failed to fetch role:', error);
      }
    };

    if (currentWorkspace?.uuid) {
      fetchMyRole();
    }
  }, [currentWorkspace?.uuid]);

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

  const handleToggleLock = async () => {
    if (!lockStatus || isLoading) return;

    // Check permissions - only owner and editor can lock/unlock
    if (myRole !== 'owner' && myRole !== 'editor') {
      addNotification({
        type: 'error',
        title: 'Permission Denied',
        message: 'Only workspace owners and editors can lock/unlock frames.',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Use 'forge' mode for unified lock (both forge and source share same lock state)
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
          message: `You have ${action} this frame.`,
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

  // Don't show button if user is not owner or editor
  if (!myRole || (myRole !== 'owner' && myRole !== 'editor')) {
    return null;
  }

  if (!lockStatus) {
    return null;
  }

  const isLocked = lockStatus.is_locked;
  const canToggle = isLocked ? lockStatus.can_unlock : lockStatus.can_lock;

  return (
    <button
      onClick={handleToggleLock}
      disabled={!canToggle || isLoading}
      className={`
        p-0.5 rounded transition-colors
        ${
          isLocked
            ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
            : 'hover:bg-[var(--color-bg-muted)] text-[var(--color-text)]'
        }
        ${!canToggle || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      title={
        isLocked
          ? `Unlock frame (locked in ${lockStatus.locked_mode} mode)`
          : 'Lock frame'
      }
    >
      {isLoading ? (
        <div className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin" />
      ) : isLocked ? (
        <Lock className="w-2.5 h-2.5" />
      ) : (
        <Unlock className="w-2.5 h-2.5" />
      )}
    </button>
  );
};

export default FrameLockButton;
