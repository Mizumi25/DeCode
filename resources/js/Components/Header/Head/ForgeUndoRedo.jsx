// @/Components/Header/Head/ForgeUndoRedo.jsx
import React, { useEffect, useState } from 'react'
import { Undo2, Redo2, History, Circle } from 'lucide-react'
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
    undo,
    redo,
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

  // Update history info when components change
  useEffect(() => {
    if (frameId) {
      const info = getHistoryInfo(frameId)
      setHistoryInfo(info)
      
      if (onHistoryChange) {
        onHistoryChange(info)
      }
    }
  }, [frameId, getHistoryInfo, onHistoryChange, canvasComponents])

  // Auto-save when components change
  useEffect(() => {
    if (projectId && frameId && Array.isArray(canvasComponents) && canvasComponents.length > 0) {
      // Schedule database save
      scheduleAutoSave(projectId, frameId, canvasComponents)
    }
  }, [canvasComponents, projectId, frameId, scheduleAutoSave])

  const handleUndo = async () => {
    if (!frameId || !canUndo(frameId) || isProcessing) return

    setIsProcessing(true)
    try {
      const previousComponents = undo(frameId)
      if (previousComponents && onUndo) {
        console.log('ForgeUndoRedo: Executing undo')
        onUndo(previousComponents)
        
        // Save undone state to database
        if (projectId) {
          scheduleAutoSave(projectId, frameId, previousComponents)
        }
      }
    } catch (error) {
      console.error('Undo failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRedo = async () => {
    if (!frameId || !canRedo(frameId) || isProcessing) return

    setIsProcessing(true)
    try {
      const nextComponents = redo(frameId)
      if (nextComponents && onRedo) {
        console.log('ForgeUndoRedo: Executing redo')
        onRedo(nextComponents)
        
        // Save redone state to database
        if (projectId) {
          scheduleAutoSave(projectId, frameId, nextComponents)
        }
      }
    } catch (error) {
      console.error('Redo failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Enhanced tooltips with action descriptions
  const getUndoTooltip = () => {
    if (!historyInfo.canUndo) return 'Nothing to undo'
    return `Undo (${historyInfo.undoCount - 1} actions)`
  }

  const getRedoTooltip = () => {
    if (!historyInfo.canRedo) return 'Nothing to redo'
    return `Redo (${historyInfo.redoCount} actions)`
  }

  return (
    <div className="flex items-center gap-0.5">
      {/* Unsaved changes indicator */}
      {historyInfo.hasUnsavedChanges && (
        <div className="flex items-center gap-1 pr-1">
          <Circle className="w-1.5 h-1.5 fill-orange-400 text-orange-400" />
          {size !== 'small' && (
            <span className="text-xs text-orange-600 font-medium">
              Unsaved
            </span>
          )}
        </div>
      )}
      
      {/* Undo Button */}
      <button 
        onClick={handleUndo}
        disabled={!historyInfo.canUndo || isProcessing}
        className={`${padding} hover:bg-[var(--color-bg-muted)] rounded transition-colors ${
          !historyInfo.canUndo || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={getUndoTooltip()}
      >
        <Undo2 className={`${iconSize} ${
          historyInfo.canUndo && !isProcessing
            ? 'text-[var(--color-text)] hover:text-[var(--color-primary)]' 
            : 'text-[var(--color-text-muted)]'
        } ${isProcessing ? 'animate-pulse' : ''}`} />
      </button>

      {/* Redo Button */}
      <button 
        onClick={handleRedo}
        disabled={!historyInfo.canRedo || isProcessing}
        className={`${padding} hover:bg-[var(--color-bg-muted)] rounded transition-colors ${
          !historyInfo.canRedo || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={getRedoTooltip()}
      >
        <Redo2 className={`${iconSize} ${
          historyInfo.canRedo && !isProcessing
            ? 'text-[var(--color-text)] hover:text-[var(--color-primary)]' 
            : 'text-[var(--color-text-muted)]'
        } ${isProcessing ? 'animate-pulse' : ''}`} />
      </button>

      {/* History Info (only show if not small) */}
      {size !== 'small' && historyInfo.totalActions > 0 && (
        <div className="flex items-center gap-1 px-2 text-xs text-[var(--color-text-muted)]">
          <History className="w-3 h-3" />
          <span>{historyInfo.totalActions}</span>
        </div>
      )}
    </div>
  )
}

export default ForgeUndoRedo