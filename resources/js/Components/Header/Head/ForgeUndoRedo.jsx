// FIXED: ForgeUndoRedo.jsx - Proper Button States and Event Handling

import React, { useEffect, useState, useCallback } from 'react'
import { Undo2, Redo2, History, Circle, Clock } from 'lucide-react'
import { useForgeUndoRedoStore } from '@/stores/useForgeUndoRedoStore'

const ForgeUndoRedo = ({ 
  projectId,
  frameId,
  canvasComponents = [],
  onUndo, 
  onRedo, 
  onHistoryChange,
  size = 'small' 
}) => {
  const {
    initializeFrame,
    pushHistory,
    undo, // 🔥 ADD: undo function
    redo, // 🔥 ADD: redo function
    canUndo,
    canRedo,
    getHistoryInfo,
    scheduleAutoSave,
    actionTypes,
    hasUnsavedChanges
  } = useForgeUndoRedoStore()

  const [historyInfo, setHistoryInfo] = useState({ 
    undoCount: 0, 
    redoCount: 0, 
    canUndo: false, 
    canRedo: false,
    hasUnsavedChanges: false,
    currentAction: null
  })
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingType, setProcessingType] = useState(null)
  const [lastActionTimestamp, setLastActionTimestamp] = useState(null)

  const iconSize = size === 'small' ? 'w-2.5 h-2.5' : 'w-3 h-3'
  const padding = size === 'small' ? 'p-0.5' : 'p-1'

  // Initialize frame on mount
  useEffect(() => {
    if (frameId) {
      
      initializeFrame(frameId)
      
      // Push initial state if we have components
      if (canvasComponents.length > 0) {
        
        pushHistory(frameId, canvasComponents, actionTypes.INITIAL)
      }
    }
  }, [frameId, initializeFrame, pushHistory, actionTypes])





// 🔥 UPDATE THIS - update on explicit history changes
const updateHistoryInfo = useCallback(() => {
  if (!frameId) return;
  
  const info = getHistoryInfo(frameId);
  const canUndoState = canUndo(frameId);
  const canRedoState = canRedo(frameId);
  
  console.log('🔄 ForgeUndoRedo updating:', { 
    frameId, 
    canUndo: canUndoState, 
    canRedo: canRedoState,
    undoCount: info.undoCount,
    redoCount: info.redoCount 
  });
  
  setHistoryInfo({
    ...info,
    canUndo: canUndoState,
    canRedo: canRedoState
  });
}, [frameId, getHistoryInfo, canUndo, canRedo]);

// 🔥 FIX: Listen to store changes - simple subscription
useEffect(() => {
  if (!frameId) return;
  
  // Initial update
  updateHistoryInfo();
  
  // Subscribe to ALL store changes
  const unsubscribe = useForgeUndoRedoStore.subscribe(() => {
    console.log('📢 Store updated, refreshing history info');
    updateHistoryInfo();
  });
  
  return () => unsubscribe();
}, [frameId, updateHistoryInfo]); 





  // FIXED: Undo handler with proper state management
  const handleUndo = useCallback(async () => {
    if (!frameId || !historyInfo.canUndo || isProcessing || !onUndo) {
      
      return;
    }

    
    setIsProcessing(true);
    setProcessingType('undo');
    setLastActionTimestamp(Date.now());

    try {
      // CRITICAL: Call the parent's undo handler directly
      await onUndo();
      
    } catch (error) {
      console.error('ForgeUndoRedo: Undo failed:', error);
    } finally {
      // Add delay before allowing next operation
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingType(null);
      }, 300);
    }
  }, [frameId, historyInfo.canUndo, isProcessing, onUndo]);

  // FIXED: Redo handler with proper state management
  const handleRedo = useCallback(async () => {
    if (!frameId || !historyInfo.canRedo || isProcessing || !onRedo) {
      
      return;
    }

    
    setIsProcessing(true);
    setProcessingType('redo');
    setLastActionTimestamp(Date.now());

    try {
      // CRITICAL: Call the parent's redo handler directly
      await onRedo();
      
    } catch (error) {
      console.error('ForgeUndoRedo: Redo failed:', error);
    } finally {
      // Add delay before allowing next operation
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingType(null);
      }, 300);
    }
  }, [frameId, historyInfo.canRedo, isProcessing, onRedo]);

  // Enhanced tooltips with processing state
  const getUndoTooltip = () => {
    if (isProcessing && processingType === 'undo') return 'Undoing...'
    if (!historyInfo.canUndo) return 'Nothing to undo'
    return `Undo (${Math.max(0, historyInfo.undoCount - 1)} actions available)`
  }

  const getRedoTooltip = () => {
    if (isProcessing && processingType === 'redo') return 'Redoing...'
    if (!historyInfo.canRedo) return 'Nothing to redo'
    return `Redo (${historyInfo.redoCount} actions available)`
  }

  // CRITICAL: Debug logging
  useEffect(() => {
    if (frameId) {
      
    }
  }, [frameId, historyInfo, onUndo, onRedo, isProcessing]);

  return (
    <div className="flex items-center gap-0.5">
      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center gap-1 pr-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          {size !== 'small' && (
            <span className="text-xs text-blue-600 font-medium">
              {processingType === 'undo' ? 'Undoing' : 'Redoing'}
            </span>
          )}
        </div>
      )}
      
      {/* Undo Button - FIXED with proper state checking */}
      <button 
        onClick={handleUndo}
        disabled={!historyInfo.canUndo || isProcessing || !onUndo}
        className={`${padding} hover:bg-[var(--color-bg-muted)] rounded transition-colors ${
          (!historyInfo.canUndo || isProcessing || !onUndo) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={getUndoTooltip()}
      >
        <Undo2 className={`${iconSize} ${
          (historyInfo.canUndo && !isProcessing && onUndo)
            ? 'text-[var(--color-text)] hover:text-[var(--color-primary)]' 
            : 'text-[var(--color-text-muted)]'
        } ${isProcessing && processingType === 'undo' ? 'animate-pulse' : ''}`} />
      </button>

      {/* Redo Button - FIXED with proper state checking */}
      <button 
        onClick={handleRedo}
        disabled={!historyInfo.canRedo || isProcessing || !onRedo}
        className={`${padding} hover:bg-[var(--color-bg-muted)] rounded transition-colors ${
          (!historyInfo.canRedo || isProcessing || !onRedo) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={getRedoTooltip()}
      >
        <Redo2 className={`${iconSize} ${
          (historyInfo.canRedo && !isProcessing && onRedo)
            ? 'text-[var(--color-text)] hover:text-[var(--color-primary)]' 
            : 'text-[var(--color-text-muted)]'
        } ${isProcessing && processingType === 'redo' ? 'animate-pulse' : ''}`} />
      </button>

      {/* History Info */}
      {size !== 'small' && historyInfo.totalActions > 0 && (
        <div className="flex items-center gap-1 px-2 text-xs text-[var(--color-text-muted)]">
          <History className="w-3 h-3" />
          <span>{historyInfo.totalActions}</span>
          
          {lastActionTimestamp && (
            <div className="flex items-center gap-1 text-xs opacity-70">
              <Clock className="w-2 h-2" />
              <span>{new Date(lastActionTimestamp).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Unsaved changes indicator */}
      {historyInfo.hasUnsavedChanges && (
        <div className="flex items-center gap-1 px-2">
          <Circle className="w-2 h-2 fill-orange-400 text-orange-400" />
          {size !== 'small' && (
            <span className="text-xs text-orange-600 font-medium">
              Unsaved
            </span>
          )}
        </div>
      )}
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && size !== 'small' && (
        <div className="text-xs text-gray-400 px-2 border-l border-gray-300">
          <div>U:{historyInfo.undoCount} R:{historyInfo.redoCount}</div>
          <div>Handlers: {onUndo ? '✓' : '✗'} {onRedo ? '✓' : '✗'}</div>
          {isProcessing && <div className="text-blue-500">Processing {processingType}</div>}
        </div>
      )}
    </div>
  )
}

export default ForgeUndoRedo