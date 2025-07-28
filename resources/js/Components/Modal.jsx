





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
  const [isMaximized, setIsMaximized] = useState(false)

  const close = () => {
    if (closeable) {
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
  }[maxWidth]

  // Entry animation (fade + zoom)
  useEffect(() => {
    if (show && panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: 'power3.out',
        }
      )
    }
  }, [show])

  // Maximize / Minimize animation
  const toggleMaximize = () => {
    if (!panelRef.current) return

    const panel = panelRef.current

    const tl = gsap.timeline({
      defaults: { duration: 0.5, ease: 'power2.inOut' },
    })

    if (!isMaximized) {
      tl.to(panel, {
        width: '95vw',
        height: '95vh',
        borderRadius: 0,
      })
    } else {
      tl.to(panel, {
        width: '',
        height: '',
        borderRadius: 'var(--radius-lg)',
      })
    }

    setIsMaximized(!isMaximized)
  }

  return (
    <Transition show={show} leave="duration-200">
      <Dialog
        as="div"
        className="fixed inset-0 z-50 flex items-center justify-center"
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </TransitionChild>

        {/* MODAL PANEL */}
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-90"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-90"
        >
          <DialogPanel
            ref={panelRef}
            className={`relative mx-4 sm:mx-auto w-full ${
              isMaximized ? '' : maxWidthClass
            }`}
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              transition: 'all var(--transition)',
              overflow: 'hidden',
            }}
          >
            {/* HEADER */}
            <div
              className="flex justify-between items-center px-4 py-2 border-b"
              style={{
                backgroundColor: 'var(--color-bg-muted)',
                borderColor: 'var(--color-border)',
              }}
            >
              <h2
                className="text-base font-semibold"
                style={{ fontSize: 'var(--fs-lg)' }}
              >
                {title}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMaximize}
                  className="transition text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                >
                  {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button
                  onClick={close}
                  className="transition text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* BODY */}
            <div
              className="p-6 overflow-y-auto"
              style={{
                maxHeight: isMaximized ? 'calc(95vh - 48px)' : '70vh',
              }}
            >
              {children}
            </div>
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  )
}
