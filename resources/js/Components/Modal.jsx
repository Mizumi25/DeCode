import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Maximize2, Minimize2, X } from 'lucide-react'

export default function Modal({
  children,
  show = false,
  maxWidth = '2xl',
  closeable = true,
  title = '',
  onClose = () => {},
}) {
  const panelRef = useRef(null)
  const backdropRef = useRef(null)
  const headerRef = useRef(null)
  const contentRef = useRef(null)
  const [isMaximized, setIsMaximized] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const close = () => {
    if (closeable && !isAnimating) {
      setIsMaximized(false)
      onClose()
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

  // Entry animation
  useEffect(() => {
    if (show && panelRef.current) {
      setIsAnimating(true)
      
      const ctx = gsap.context(() => {
        // Backdrop fade in
        gsap.fromTo(backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.4, ease: "power2.out" }
        )

        // Modal entrance with "big bang" effect
        const tl = gsap.timeline({
          onComplete: () => setIsAnimating(false)
        })

        // Initial state
        gsap.set(panelRef.current, {
          scale: 0.3,
          opacity: 0,
          rotationX: -15,
          transformPerspective: 1000,
          transformOrigin: "center center"
        })

        // Big bang entrance
        tl.to(panelRef.current, {
          scale: 1.1,
          opacity: 1,
          rotationX: 0,
          duration: 0.4,
          ease: "power3.out"
        })
        .to(panelRef.current, {
          scale: 1,
          duration: 0.2,
          ease: "power2.out"
        })

        // Stagger content animation
        tl.fromTo([headerRef.current, contentRef.current],
          { y: 20, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.5, 
            stagger: 0.1,
            ease: "power3.out"
          },
          "-=0.2"
        )
      })

      return () => ctx.revert()
    }
  }, [show])

  // Maximize/Minimize animation
  const toggleMaximize = () => {
    if (!panelRef.current || isAnimating) return
    setIsAnimating(true)

    const panel = panelRef.current
    const currentRect = panel.getBoundingClientRect()
    
    const tl = gsap.timeline({
      defaults: { duration: 0.8, ease: 'power3.inOut' },
      onComplete: () => {
        setIsMaximized(!isMaximized)
        setIsAnimating(false)
      }
    })

    if (!isMaximized) {
      // Maximize animation - smooth expansion
      tl.to(panel, {
        width: '95vw',
        height: '95vh',
        borderRadius: '12px',
        scale: 1,
        x: 0,
        y: 0,
        transformOrigin: 'center center',
      })
      .to(contentRef.current, {
        maxHeight: 'calc(95vh - 60px)',
        duration: 0.4
      }, "-=0.4")
    } else {
      // Minimize animation - smooth collapse
      tl.to(panel, {
        width: '',
        height: '',
        borderRadius: 'var(--radius-lg)',
        scale: 1,
        x: 0,
        y: 0,
        transformOrigin: 'center center',
      })
      .to(contentRef.current, {
        maxHeight: '70vh',
        duration: 0.4
      }, "-=0.4")
    }
  }

  return (
    <Transition show={show} leave="duration-300">
      <Dialog
        as="div"
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        onClose={close}
      >
        {/* BACKDROP */}
        <TransitionChild
          enter="ease-out duration-400"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div 
            ref={backdropRef}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
          />
        </TransitionChild>

        {/* MODAL PANEL */}
        <TransitionChild
          enter="ease-out duration-500"
          enterFrom="opacity-0 scale-75"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-300"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-90"
        >
          <DialogPanel
            ref={panelRef}
            className={`relative mx-4 sm:mx-auto w-full ${
              isMaximized ? 'w-[95vw] h-[95vh]' : maxWidthClass
            } will-change-transform`}
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
              maxHeight: isMaximized ? '95vh' : '85vh',
            }}
          >
            {/* HEADER */}
            <div
              ref={headerRef}
              className="flex justify-between items-center px-6 py-4 border-b backdrop-blur-sm"
              style={{
                backgroundColor: 'var(--color-bg-muted)',
                borderColor: 'var(--color-border)',
              }}
            >
              <h2
                className="text-lg font-semibold truncate pr-4"
                style={{ color: 'var(--color-text)' }}
              >
                {title}
              </h2>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={toggleMaximize}
                  disabled={isAnimating}
                  className="p-2 rounded-lg transition-all duration-200 hover:bg-[var(--color-border)] disabled:opacity-50"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                {closeable && (
                  <button
                    type="button"
                    onClick={close}
                    disabled={isAnimating}
                    className="p-2 rounded-lg transition-all duration-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* BODY */}
            <div
              ref={contentRef}
              className="overflow-y-auto"
              style={{
                maxHeight: isMaximized ? 'calc(95vh - 73px)' : '70vh',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <div className="p-6">
                {children}
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  )
}