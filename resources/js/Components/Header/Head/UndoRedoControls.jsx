import React, { useEffect, useState } from 'react'
import { Undo2, Redo2, Save, History } from 'lucide-react'
import { useUndoRedoStore } from '@/stores/useUndoRedoStore'

const UndoRedoControls = ({ 
  projectId,
  frameId,
  canvasComponents = [], // ADD DEFAULT EMPTY ARRAY
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
    manualSave
  } = useUndoRedoStore()

  const [historyInfo, setHistoryInfo] = useState({ 
    undoCount: 0, 
    redoCount: 0, 
    canUndo: false, 
    canRedo: false 
  })
  const [isSaving, setIsSaving] = useState(false)

  const iconSize = size === 'small' ? 'w-2.5 h-2.5' : 'w-3 h-3'
  const padding = size === 'small' ? 'p-0.5' : 'p-1'

  // Initialize frame on mount
  useEffect(() => {
    if (frameId) {
      initializeFrame(frameId)
      // Push initial state
      pushHistory(frameId, canvasComponents, 'initial')
    }
  }, [frameId, initializeFrame, pushHistory])

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
    if (projectId && frameId && Array.isArray(canvasComponents)) { // ADD ARRAY CHECK
      // Push to local history
      pushHistory(frameId, canvasComponents, 'update')
      
      // Schedule database save
      scheduleAutoSave(projectId, frameId, canvasComponents)
    }
  }, [canvasComponents, projectId, frameId, pushHistory, scheduleAutoSave])


  const handleUndo = async () => {
    if (!frameId || !canUndo(frameId)) return

    const previousComponents = undo(frameId)
    if (previousComponents && onUndo) {
      onUndo(previousComponents)
      
      // Save undone state to database immediately
      try {
        setIsSaving(true)
        await scheduleAutoSave(projectId, frameId, previousComponents, 1000) // 1 second delay
      } catch (error) {
        console.error('Failed to save undo state:', error)
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleRedo = async () => {
    if (!frameId || !canRedo(frameId)) return

    const nextComponents = redo(frameId)
    if (nextComponents && onRedo) {
      onRedo(nextComponents)
      
      // Save redone state to database immediately  
      try {
        setIsSaving(true)
        await scheduleAutoSave(projectId, frameId, nextComponents, 1000) // 1 second delay
      } catch (error) {
        console.error('Failed to save redo state:', error)
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleManualSave = async () => {
    if (!projectId || !frameId || !Array.isArray(canvasComponents)) return // ADD ARRAY CHECK

    try {
      setIsSaving(true)
      await manualSave(
        projectId, 
        frameId, 
        canvasComponents,
        `Manual save - ${new Date().toLocaleString()}`
      )
    } catch (error) {
      console.error('Manual save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-0.5">
    
      
      
      {/* Undo Button */}
      <button 
        onClick={handleUndo}
        disabled={!historyInfo.canUndo || isSaving}
        className={`${padding} hover:bg-[var(--color-bg-muted)] rounded transition-colors ${
          !historyInfo.canUndo || isSaving ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={`Undo (${historyInfo.undoCount - 1} actions)`}
      >
        <Undo2 className={`${iconSize} ${
          historyInfo.canUndo && !isSaving
            ? 'text-[var(--color-text)] hover:text-[var(--color-primary)]' 
            : 'text-[var(--color-text-muted)]'
        }`} />
      </button>

      {/* Redo Button */}
      <button 
        onClick={handleRedo}
        disabled={!historyInfo.canRedo || isSaving}
        className={`${padding} hover:bg-[var(--color-bg-muted)] rounded transition-colors ${
          !historyInfo.canRedo || isSaving ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={`Redo (${historyInfo.redoCount} actions)`}
      >
        <Redo2 className={`${iconSize} ${
          historyInfo.canRedo && !isSaving
            ? 'text-[var(--color-text)] hover:text-[var(--color-primary)]' 
            : 'text-[var(--color-text-muted)]'
        }`} />
      </button>

      {/* Manual Save Button */}
      <button 
        onClick={handleManualSave}
        disabled={isSaving || !Array.isArray(canvasComponents) || canvasComponents.length === 0} // ADD ARRAY CHECK
        className={`${padding} hover:bg-[var(--color-bg-muted)] rounded transition-colors ${
          isSaving ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title="Save manually (creates revision)"
      >
        <Save className={`${iconSize} ${
          isSaving 
            ? 'text-[var(--color-primary)] animate-pulse' 
            : (Array.isArray(canvasComponents) && canvasComponents.length > 0) // ADD ARRAY CHECK
              ? 'text-[var(--color-text)] hover:text-[var(--color-primary)]'
              : 'text-[var(--color-text-muted)]'
        }`} />
      </button>

      {/* History Info (only show if not small) */}
      {size !== 'small' && (
        <div className="flex items-center gap-1 px-2 text-xs text-[var(--color-text-muted)]">
          <History className="w-3 h-3" />
          <span>{historyInfo.undoCount}</span>
        </div>
      )}
    </div>
  )
}

export default UndoRedoControls