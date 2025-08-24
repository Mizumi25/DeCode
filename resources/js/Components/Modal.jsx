import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { Maximize2, Minimize2, X, Move } from 'lucide-react'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(Draggable)
}

export default function Modal({
  children,
  show = false,
  maxWidth = '2xl',
  closeable = true,
  title = '',
  onClose = () => {},
  isLoading = false,
  blurBackground = true,
}) {
  const panelRef = useRef(null)
  const backdropRef = useRef(null)
  const headerRef = useRef(null)
  const contentRef = useRef(null)
  const dragHandleRef = useRef(null)
  const resizeHandleRef = useRef(null)
  const [isMaximized, setIsMaximized] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [modalSize, setModalSize] = useState({ width: 'auto', height: 'auto' })
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 })
  const [hasContent, setHasContent] = useState(false)
  
  // Store initial/default sizes for proper restoration
  const [initialSize, setInitialSize] = useState({ width: 'auto', height: 'auto' })
  const [normalSize, setNormalSize] = useState({ width: 'auto', height: 'auto' })
  const minimizedSize = { width: 400, height: 200 } // Increased minimum size
  
  // Draggable instance ref
  const draggableInstance = useRef(null)
  const resizeInstance = useRef(null)

  const close = () => {
    if (closeable && !isAnimating) {
      setIsAnimating(true)
      
      const tl = gsap.timeline({
        onComplete: () => {
          setIsMaximized(false)
          setIsMinimized(false)
          setModalPosition({ x: 0, y: 0 })
          setModalSize({ width: 'auto', height: 'auto' })
          setNormalSize({ width: 'auto', height: 'auto' })
          setIsAnimating(false)
          onClose()
        }
      })

      if (isMaximized) {
        // Animate out from maximized state
        tl.to(panelRef.current, {
          scale: 0.8,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in'
        })
        .to(backdropRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in'
        }, '-=0.2')
      } else {
        // Regular close animation
        tl.to(panelRef.current, {
          scale: 0.7,
          opacity: 0,
          y: -20,
          duration: 0.3,
          ease: 'power2.in'
        })
        .to(backdropRef.current, {
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in'
        }, '-=0.1')
      }
    }
  }

  const maxWidthClass = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
    '4xl': 'sm:max-w-4xl',
  }[maxWidth]

  // Handle content changes
  useEffect(() => {
    if (show) {
      const hasRealContent = children && children !== null && children !== undefined
      setHasContent(hasRealContent)
    }
  }, [children, show])

  // Initialize dragging and resizing
  useEffect(() => {
    if (show && panelRef.current && typeof window !== 'undefined') {
      // Cleanup previous instances
      if (draggableInstance.current) {
        draggableInstance.current.kill()
        draggableInstance.current = null
      }
      if (resizeInstance.current) {
        resizeInstance.current.kill()
        resizeInstance.current = null
      }

      // Initialize dragging - works in all states except maximized
      if (!isMaximized && headerRef.current) {
        draggableInstance.current = Draggable.create(panelRef.current, {
          trigger: headerRef.current,
          type: "x,y",
          edgeResistance: 0.65,
          bounds: "body",
          inertia: true,
          cursor: "grab",
          activeCursor: "grabbing",
          onDragStart: () => {
            setIsDragging(true)
            gsap.to(panelRef.current, {
              scale: 1.02,
              duration: 0.2,
              ease: "power2.out",
              zIndex: 60
            })
          },
          onDrag: function() {
            setModalPosition({ x: this.x, y: this.y })
          },
          onDragEnd: () => {
            setIsDragging(false)
            gsap.to(panelRef.current, {
              scale: 1,
              duration: 0.3,
              ease: "power2.out",
              zIndex: 50
            })
          }
        })[0]
      }

      // Initialize resizing - corner handle (only when not maximized)
      if (resizeHandleRef.current && !isMaximized) {
        resizeInstance.current = Draggable.create(resizeHandleRef.current, {
          type: "x,y",
          trigger: resizeHandleRef.current,
          cursor: "nw-resize",
          onDragStart: () => {
            setIsResizing(true)
            gsap.set(panelRef.current, { transformOrigin: "top left" })
          },
          onDrag: function() {
            const rect = panelRef.current.getBoundingClientRect()
            const newWidth = Math.max(350, rect.width + this.deltaX) // Increased minimum width
            const newHeight = Math.max(200, rect.height + this.deltaY)
            
            gsap.set(panelRef.current, {
              width: newWidth + 'px',
              height: newHeight + 'px'
            })
            
            const newSize = { width: newWidth, height: newHeight }
            setModalSize(newSize)
            // Update normal size if we're not in minimized state
            if (!isMinimized) {
              setNormalSize(newSize)
            }
          },
          onDragEnd: () => {
            setIsResizing(false)
          }
        })[0]
      }

      return () => {
        if (draggableInstance.current) {
          draggableInstance.current.kill()
          draggableInstance.current = null
        }
        if (resizeInstance.current) {
          resizeInstance.current.kill()
          resizeInstance.current = null
        }
      }
    }
  }, [show, isMaximized, isMinimized])

  // Entry animation
  useEffect(() => {
    if (show && panelRef.current && backdropRef.current) {
      setIsAnimating(true)
      
      const ctx = gsap.context(() => {
        // Reset any previous transforms
        gsap.set(panelRef.current, { clearProps: "all" })
        gsap.set(backdropRef.current, { clearProps: "all" })

        // Capture initial size after first render
        setTimeout(() => {
          if (panelRef.current) {
            const rect = panelRef.current.getBoundingClientRect()
            const initial = { width: rect.width, height: rect.height }
            setInitialSize(initial)
            setNormalSize(initial)
          }
        }, 100)

        // Backdrop fade in
        gsap.fromTo(backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: "power2.out" }
        )

        // Modal entrance animation
        const tl = gsap.timeline({
          onComplete: () => setIsAnimating(false)
        })

        // Initial state - normal size, not minimized
        gsap.set(panelRef.current, {
          scale: 0.8,
          opacity: 0,
          y: -30,
          x: 0,
          transformOrigin: "center center"
        })

        // Smooth entrance
        tl.to(panelRef.current, {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "back.out(1.4)"
        })

        // Content animation
        if (headerRef.current && contentRef.current) {
          tl.fromTo([headerRef.current, contentRef.current],
            { opacity: 0, y: 10 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.3, 
              stagger: 0.1,
              ease: "power2.out"
            },
            "-=0.2"
          )
        }
      })

      return () => ctx.revert()
    }
  }, [show])

  // Maximize/Minimize animation
  const toggleMaximize = useCallback(() => {
    if (!panelRef.current || isAnimating) return
    setIsAnimating(true)

    const panel = panelRef.current
    
    const tl = gsap.timeline({
      defaults: { duration: 0.5, ease: 'power2.inOut' },
      onComplete: () => {
        setIsMaximized(!isMaximized)
        setIsAnimating(false)
      }
    })

    if (!isMaximized) {
      // Store current size as normal size before maximizing
      const rect = panel.getBoundingClientRect()
      const currentSize = { width: rect.width, height: rect.height }
      if (!isMinimized) {
        setNormalSize(currentSize)
      }
      
      // Maximize animation
      tl.to(panel, {
        width: '95vw',
        height: '90vh',
        x: 0,
        y: 0,
        scale: 1,
        borderRadius: '8px',
        transformOrigin: 'center center',
      })
    } else {
      // Restore animation - use appropriate size based on previous state
      const targetSize = isMinimized ? minimizedSize : normalSize
      const restoreWidth = targetSize.width === 'auto' ? '' : targetSize.width + 'px'
      const restoreHeight = targetSize.height === 'auto' ? '' : targetSize.height + 'px'
      
      tl.to(panel, {
        width: restoreWidth,
        height: restoreHeight,
        x: modalPosition.x,
        y: modalPosition.y,
        borderRadius: '16px',
        scale: 1,
        transformOrigin: 'center center',
      })
    }
  }, [isMaximized, isMinimized, isAnimating, normalSize, modalPosition])

  // Toggle minimize (for draggable small modal)
  const toggleMinimize = useCallback(() => {
    if (!panelRef.current || isAnimating || isMaximized) return
    setIsAnimating(true)

    const panel = panelRef.current

    const tl = gsap.timeline({
      defaults: { duration: 0.4, ease: 'power2.inOut' },
      onComplete: () => {
        setIsMinimized(!isMinimized)
        setIsAnimating(false)
      }
    })

    if (!isMinimized) {
      // Store current size before minimizing
      const rect = panel.getBoundingClientRect()
      setNormalSize({ width: rect.width, height: rect.height })
      
      // Minimize to small draggable window
      tl.to(panel, {
        width: minimizedSize.width + 'px',
        height: minimizedSize.height + 'px',
        scale: 1,
        borderRadius: '12px'
      })
    } else {
      // Restore to normal size
      const restoreWidth = normalSize.width === 'auto' ? '' : normalSize.width + 'px'
      const restoreHeight = normalSize.height === 'auto' ? '' : normalSize.height + 'px'
      
      tl.to(panel, {
        width: restoreWidth,
        height: restoreHeight,
        x: modalPosition.x,
        y: modalPosition.y,
        borderRadius: '16px'
      })
    }
  }, [isMinimized, isAnimating, normalSize, modalPosition])

  return (
    <Transition show={show} leave="duration-300">
      <Dialog
        as="div"
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        onClose={close}
      >
        {/* BACKDROP */}
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div 
            ref={backdropRef}
            className={`fixed inset-0 ${
              blurBackground 
                ? 'bg-black/50 backdrop-blur-md' 
                : 'bg-black/30'
            }`}
          />
        </TransitionChild>

        {/* MODAL PANEL */}
        <TransitionChild
          enter="ease-out duration-400"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DialogPanel
            ref={panelRef}
            className={`relative mx-4 sm:mx-auto w-full will-change-transform ${
              isMaximized 
                ? 'w-[95vw] h-[90vh]' 
                : isMinimized 
                  ? '' // Remove fixed classes for minimized state
                  : maxWidthClass
            }`}
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              borderRadius: isMaximized ? '8px' : '16px',
              boxShadow: isDragging || isMinimized
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
                : '0 20px 40px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
              maxHeight: isMaximized ? '90vh' : isMinimized ? `${minimizedSize.height}px` : '85vh',
              minWidth: isMaximized ? '95vw' : `${minimizedSize.width}px`,
              minHeight: isMaximized ? '90vh' : `${minimizedSize.height}px`,
              zIndex: isDragging ? 60 : 50,
              // Set explicit dimensions when minimized
              ...(isMinimized && {
                width: `${minimizedSize.width}px`,
                height: `${minimizedSize.height}px`
              }),
            }}
          >
            {/* HEADER */}
            <div
              ref={headerRef}
              className={`flex justify-between items-center px-4 py-3 border-b ${
                !isMaximized ? 'cursor-move' : ''
              } select-none bg-[var(--color-bg-muted)]/80 backdrop-blur-sm`}
              style={{
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {!isMaximized && (
                  <Move className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
                )}
                <h2
                  className="text-base font-semibold truncate"
                  style={{ color: 'var(--color-text)' }}
                >
                  {title}
                </h2>
              </div>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Minimize button */}
                <button
                  type="button"
                  onClick={toggleMinimize}
                  disabled={isAnimating || isMaximized}
                  className="p-1.5 rounded-md transition-all duration-200 hover:bg-[var(--color-border)] disabled:opacity-50"
                  style={{ color: 'var(--color-text-muted)' }}
                  title={isMinimized ? 'Restore' : 'Minimize'}
                >
                  <div className="w-3 h-0.5 bg-current" />
                </button>
                
                {/* Maximize button */}
                <button
                  type="button"
                  onClick={toggleMaximize}
                  disabled={isAnimating}
                  className="p-1.5 rounded-md transition-all duration-200 hover:bg-[var(--color-border)] disabled:opacity-50"
                  style={{ color: 'var(--color-text-muted)' }}
                  title={isMaximized ? 'Restore' : 'Maximize'}
                >
                  {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                
                {closeable && (
                  <button
                    type="button"
                    onClick={close}
                    disabled={isAnimating}
                    className="p-1.5 rounded-md transition-all duration-200 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                    style={{ color: 'var(--color-text-muted)' }}
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* BODY */}
            <div
              ref={contentRef}
              className="overflow-y-auto transition-all duration-300"
              style={{
                maxHeight: isMaximized 
                  ? 'calc(90vh - 60px)' 
                  : isMinimized 
                    ? `${minimizedSize.height - 60}px` 
                    : '70vh',
                backgroundColor: 'var(--color-surface)',
                opacity: isMinimized ? 0.9 : 1,
              }}
            >
              <div className="relative min-h-[100px]">
                {/* Loading state */}
                {isLoading && (
                  <div className="flex items-center justify-center p-8 absolute inset-0 bg-[var(--color-surface)]/90 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span className="text-sm text-[var(--color-text-muted)]">Loading...</span>
                    </div>
                  </div>
                )}

                {/* Content */}
                {hasContent && !isLoading ? (
                  <div className="p-6">
                    {children}
                  </div>
                ) : !isLoading && (
                  <div className="flex items-center justify-center p-8 text-center">
                    <div>
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center">
                        <span className="text-2xl">📄</span>
                      </div>
                      <p className="text-[var(--color-text-muted)] text-sm">No content available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RESIZE HANDLE - Bottom right corner */}
            {!isMaximized && (
              <div
                ref={resizeHandleRef}
                className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize group opacity-60 hover:opacity-100 transition-opacity pointer-events-auto"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  transform: 'none', // Prevent any transforms
                  zIndex: 10
                }}
                title="Resize modal"
              >
                <svg 
                  className="w-4 h-4" 
                  viewBox="0 0 16 16" 
                  fill="currentColor"
                  style={{ 
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    pointerEvents: 'none'
                  }}
                >
                  <path d="M16 16V10h-1v4.3L9.7 9H14V8H8v6h1v-4.3L14.3 15H10v1h6z" />
                </svg>
              </div>
            )}

            {/* Drag indicator for minimized mode */}
            {isMinimized && (
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 opacity-40 pointer-events-none">
                <div className="w-6 h-1 bg-[var(--color-text-muted)] rounded-full" />
              </div>
            )}
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  )
}