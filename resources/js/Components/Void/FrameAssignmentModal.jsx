import React, { useMemo, useState } from 'react'
import Modal from '@/Components/Modal'
import { X, ArrowRight, Component as ComponentIcon, FileText, Layers } from 'lucide-react'

export default function FrameAssignmentModal({ 
  isOpen, 
  onClose, 
  currentFrame,
  allFrames = [],
  frameAssignments = [],
  onUnassign,
  onAssign,
  linkMode = false,
  onRequestUnlink = null // ✅ NEW: Callback to request unlink with confirm dialog at page level
}) {
  const [selectedFrameToLink, setSelectedFrameToLink] = useState(null)

  // Get assignments for current frame
  const myAssignments = useMemo(() => {
    if (!currentFrame || !frameAssignments || frameAssignments.length === 0) return [];
    
    return frameAssignments.filter(assignment => {
      const pageFrameUuid = assignment.pageFrame?.uuid || assignment.page_frame?.uuid
      const componentFrameUuid = assignment.componentFrame?.uuid || assignment.component_frame?.uuid
      return pageFrameUuid === currentFrame.uuid || componentFrameUuid === currentFrame.uuid
    })
  }, [currentFrame, frameAssignments])

  // Get frames that can be linked to current frame
  const availableFrames = useMemo(() => {
    if (!currentFrame || !allFrames) return []
    
    // Get UUIDs of already assigned frames
    const assignedUuids = myAssignments.map(assignment => {
      const pageFrameUuid = assignment.pageFrame?.uuid || assignment.page_frame?.uuid
      const componentFrameUuid = assignment.componentFrame?.uuid || assignment.component_frame?.uuid
      return pageFrameUuid === currentFrame.uuid ? componentFrameUuid : pageFrameUuid
    })

    return allFrames.filter(frame => {
      // Don't show current frame
      if (frame.uuid === currentFrame.uuid) return false
      
      // Don't show already assigned frames
      if (assignedUuids.includes(frame.uuid)) return false
      
      // If current is page, show only components
      if (currentFrame.type === 'page') return frame.type === 'component'
      
      // If current is component, show both pages and components
      return true
    })
  }, [currentFrame, allFrames, myAssignments])

  const handleUnlink = (assignment, otherFrame) => {
    // Use page-level confirm dialog instead of local one
    if (onRequestUnlink) {
      onRequestUnlink(assignment, otherFrame.name)
    }
  }

  const handleLink = async (targetFrame) => {
    if (onAssign) {
      await onAssign(currentFrame, targetFrame)
      setSelectedFrameToLink(null)
    }
  }

  if (!currentFrame) return null

  return (
    <>
      <Modal show={isOpen} onClose={onClose} maxWidth="3xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                Frame Assignments
              </h2>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentFrame.type === 'page' 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                }`}>
                  {currentFrame.type === 'page' ? (
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      Page
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <ComponentIcon className="w-4 h-4" />
                      Component
                    </div>
                  )}
                </div>
                <span className="text-lg font-semibold text-[var(--color-text)]">
                  {currentFrame.name}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--color-bg-muted)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[var(--color-text-muted)]" />
            </button>
          </div>

          {/* Current Assignments */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--color-text-muted)] mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              LINKED FRAMES ({myAssignments.length})
            </h3>
            
            {myAssignments.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-text-muted)]">
                <Layers className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No frames linked yet</p>
                <p className="text-sm mt-1">Add assignments below to connect frames</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myAssignments.map(assignment => {
                  const pageFrame = assignment.pageFrame || assignment.page_frame
                  const componentFrame = assignment.componentFrame || assignment.component_frame
                  const otherFrame = pageFrame?.uuid === currentFrame.uuid ? componentFrame : pageFrame
                  const isCurrentFramePage = currentFrame.type === 'page'

                  return (
                    <div
                      key={assignment.id}
                      className="flex items-center gap-3 p-4 bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] rounded-lg group transition-colors"
                    >
                      {/* Visual Flow */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {/* Current Frame (left) */}
                        <div className={`px-3 py-2 rounded-lg text-sm font-medium flex-shrink-0 ${
                          currentFrame.type === 'page' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-purple-500 text-white'
                        }`}>
                          {currentFrame.type === 'page' ? (
                            <FileText className="w-4 h-4" />
                          ) : (
                            <ComponentIcon className="w-4 h-4" />
                          )}
                        </div>

                        {/* Arrow */}
                        <ArrowRight className="w-5 h-5 text-[var(--color-text-muted)] flex-shrink-0" />

                        {/* Other Frame (right) */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            otherFrame?.type === 'page' ? 'bg-blue-500' : 'bg-purple-500'
                          }`} />
                          <span className="text-sm font-medium text-[var(--color-text)] truncate">
                            {otherFrame?.name || 'Unnamed'}
                          </span>
                          <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0">
                            ({otherFrame?.type})
                          </span>
                        </div>
                      </div>

                      {/* Unlink Button */}
                      <button
                        onClick={() => handleUnlink(assignment, otherFrame)}
                        className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-all flex items-center gap-1.5 text-sm font-medium"
                      >
                        <X className="w-4 h-4" />
                        Unlink
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Available Frames to Link */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-muted)] mb-3">
              ADD NEW ASSIGNMENT ({availableFrames.length} available)
            </h3>
            
            {availableFrames.length === 0 ? (
              <div className="text-center py-6 text-[var(--color-text-muted)] bg-[var(--color-bg-muted)] rounded-lg">
                <p className="text-sm">
                  {currentFrame.type === 'page' 
                    ? 'No components available to link' 
                    : 'No frames available to link'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {availableFrames.map(frame => (
                  <button
                    key={frame.uuid}
                    onClick={() => handleLink(frame)}
                    className="flex items-center gap-2 p-3 border-2 border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 rounded-lg transition-all text-left group"
                  >
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      frame.type === 'page' ? 'bg-blue-500' : 'bg-purple-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--color-text)] truncate">
                        {frame.name}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)]">
                        {frame.type}
                      </div>
                    </div>
                    <div className="text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
