// Components/Void/PreviewFrame.jsx - FIXED click navigation issue
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Plug, MoreHorizontal, Github, FileCode, Layers, RefreshCw, Camera, AlertTriangle } from 'lucide-react'
import EnhancedLockButton from './EnhancedLockButton'
import useFrameLockStore from '@/stores/useFrameLockStore'
import { useThumbnail } from '@/hooks/useThumbnail'
import { ThumbnailService } from '@/Services/ThumbnailService'

const sizes = [
  { w: 80, h: 56 },
  { w: 64, h: 96 },
  { w: 72, h: 72 },
  { w: 52, h: 40 },
  { w: 96, h: 64 },
]

export default function PreviewFrame({ 
  title = 'Untitled', 
  index = 0, 
  x = 0, 
  y = 0, 
  fileName = 'File1',
  frameId,
  frame = null,
  isDragging = false,
  isLoading = false,
  onDragStart,
  onDrag,
  onDragEnd,
  onFrameClick,
  zoom = 1,
  isDraggable = true,
  isDark = false,
  scrollPosition = { x: 0, y: 0 },
  onAutoScroll = null
}) {
  const size = sizes[index % sizes.length]
  const { getLockStatus, subscribeToFrame } = useFrameLockStore()
  
  // ENHANCED: Use thumbnail hook for real-time updates
  const {
    thumbnailUrl,
    isLoading: thumbnailLoading,
    isGenerating: thumbnailGenerating,
    error: thumbnailError,
    lastGenerated,
    generateThumbnail,
    refreshThumbnail,
    isValidThumbnail,
    placeholderUrl
  } = useThumbnail(frame?.uuid, frame?.type || 'page', {
    autoGenerate: true,
    enableRealTimeUpdates: true,
    preloadThumbnails: true
  })

  const [showLoadingContent, setShowLoadingContent] = useState(isLoading)
  const [showThumbnailActions, setShowThumbnailActions] = useState(false)
  const [thumbnailLoadError, setThumbnailLoadError] = useState(false)
  const [imageLoadAttempts, setImageLoadAttempts] = useState(0)
  const frameRef = useRef(null)
  const headerRef = useRef(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [hasDragged, setHasDragged] = useState(false)
  const [isDraggingFromHeader, setIsDraggingFromHeader] = useState(false)
  
  // Auto-scroll related state
  const autoScrollRef = useRef(null)
  const [autoScrollActive, setAutoScrollActive] = useState(false)
  
  // Dummy avatar colors for stacked avatars
  const avatarColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500']

  // Get lock status from Zustand store
  const lockStatus = getLockStatus(frame?.uuid)

  // Subscribe to frame-specific lock events
  useEffect(() => {
    if (frame?.uuid) {
      const unsubscribe = subscribeToFrame(frame.uuid)
      return unsubscribe
    }
  }, [frame?.uuid, subscribeToFrame])

  // ENHANCED: Handle thumbnail generation with retry logic
  const handleGenerateThumbnail = useCallback(async (e) => {
    e.stopPropagation()
    
    try {
      console.log(`[PreviewFrame] Manual thumbnail generation for ${frame?.uuid}`);
      setImageLoadAttempts(0);
      setThumbnailLoadError(false);
      await generateThumbnail()
    } catch (error) {
      console.error('Failed to generate thumbnail:', error)
      setThumbnailLoadError(true);
    }
  }, [generateThumbnail, frame?.uuid])

  // ENHANCED: Handle thumbnail refresh with error reset
  const handleRefreshThumbnail = useCallback(async (e) => {
    e.stopPropagation()
    
    try {
      console.log(`[PreviewFrame] Manual thumbnail refresh for ${frame?.uuid}`);
      setImageLoadAttempts(0);
      setThumbnailLoadError(false);
      
      if (frame?.uuid) {
        ThumbnailService.clearCache(frame.uuid);
      }
      
      await refreshThumbnail()
    } catch (error) {
      console.error('Failed to refresh thumbnail:', error)
      setThumbnailLoadError(true);
    }
  }, [refreshThumbnail, frame?.uuid])

  // ENHANCED: Handle thumbnail image load error with retry logic
  const handleThumbnailImageError = useCallback(() => {
    console.warn(`[PreviewFrame] Thumbnail load error for ${frame?.uuid}, attempt ${imageLoadAttempts + 1}`);
    
    setImageLoadAttempts(prev => prev + 1);
    
    if (imageLoadAttempts >= 2) {
      setThumbnailLoadError(true);
    } else {
      setTimeout(() => {
        const img = document.querySelector(`[data-thumbnail-frame="${frame?.uuid}"]`);
        if (img && thumbnailUrl) {
          const separator = thumbnailUrl.includes('?') ? '&' : '?';
          img.src = `${thumbnailUrl}${separator}_retry=${Date.now()}`;
        }
      }, 1000);
    }
  }, [imageLoadAttempts, thumbnailUrl, frame?.uuid])

  // ENHANCED: Handle thumbnail image load success
  const handleThumbnailImageLoad = useCallback(() => {
    console.log(`[PreviewFrame] Thumbnail loaded successfully for ${frame?.uuid}`);
    setThumbnailLoadError(false);
    setImageLoadAttempts(0);
  }, [frame?.uuid])

  // Simulate loading completion after 2-4 seconds
  useEffect(() => {
    if (isLoading) {
      const loadingTime = 2000 + Math.random() * 2000
      const timer = setTimeout(() => {
        setShowLoadingContent(false)
      }, loadingTime)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  // Auto-scroll functionality when dragging near edges
  const handleAutoScroll = useCallback((clientX, clientY) => {
    if (!onAutoScroll || !isDragging) return

    const scrollZone = 50
    const scrollSpeed = 2
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    let scrollDelta = { x: 0, y: 0 }

    if (clientX < scrollZone) {
      scrollDelta.x = -scrollSpeed * (1 - clientX / scrollZone)
    } else if (clientX > windowWidth - scrollZone) {
      scrollDelta.x = scrollSpeed * ((clientX - (windowWidth - scrollZone)) / scrollZone)
    }

    if (clientY < scrollZone + 60) {
      scrollDelta.y = -scrollSpeed * (1 - (clientY - 60) / scrollZone)
    } else if (clientY > windowHeight - scrollZone) {
      scrollDelta.y = scrollSpeed * ((clientY - (windowHeight - scrollZone)) / scrollZone)
    }

    if (scrollDelta.x !== 0 || scrollDelta.y !== 0) {
      if (!autoScrollActive) {
        setAutoScrollActive(true)
        const autoScroll = () => {
          if (!isDragging) {
            setAutoScrollActive(false)
            return
          }
          
          onAutoScroll(scrollDelta)
          autoScrollRef.current = requestAnimationFrame(autoScroll)
        }
        autoScrollRef.current = requestAnimationFrame(autoScroll)
      }
    } else {
      if (autoScrollActive) {
        setAutoScrollActive(false)
        if (autoScrollRef.current) {
          cancelAnimationFrame(autoScrollRef.current)
          autoScrollRef.current = null
        }
      }
    }
  }, [isDragging, onAutoScroll, autoScrollActive])

  // Clean up auto-scroll on unmount or drag end
  useEffect(() => {
    if (!isDragging && autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current)
      autoScrollRef.current = null
      setAutoScrollActive(false)
    }
    
    return () => {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current)
      }
    }
  }, [isDragging])

  // FIXED: Updated handleFrameClick to properly handle thumbnail actions
  const handleFrameClick = (e) => {
    // Check if click is on interactive elements or actual thumbnail action buttons
    const isInteractiveElement = e.target.closest('.lock-button') || 
                                 e.target.closest('.more-button') || 
                                 e.target.closest('.avatar') ||
                                 e.target.closest('.frame-header') ||
                                 e.target.closest('button') // This will catch the thumbnail action buttons
    
    // Don't navigate if we're in a dragging state or clicked on interactive elements
    if (isInteractiveElement ||
        isDragging || 
        isMouseDown ||
        hasDragged) {
      return
    }
    
    if (lockStatus?.is_locked && !lockStatus.locked_by_me && !lockStatus.can_unlock) {
      console.log('Frame is locked, cannot access')
      return
    }
    
    if (onFrameClick && frame) {
      onFrameClick(frame)
    }
  }

  // Enhanced drag functionality - now header-specific
  const handleMouseDown = useCallback((e) => {
    const isInteractiveElement = e.target.closest('.lock-button') || 
                                 e.target.closest('.more-button') || 
                                 e.target.closest('.avatar') ||
                                 e.target.closest('button') ||
                                 e.target.closest('input')
    
    if (!isDraggable || isInteractiveElement) {
      return
    }
    
    if (lockStatus?.is_locked && !lockStatus.locked_by_me && !lockStatus.can_unlock) {
      return
    }
    
    e.stopPropagation()
    e.preventDefault()
    
    const rect = frameRef.current.getBoundingClientRect()
    const startX = e.clientX
    const startY = e.clientY
    
    setDragOffset({ 
      x: startX - rect.left, 
      y: startY - rect.top 
    })
    setIsMouseDown(true)
    setHasDragged(false)
    
    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
    
    if (onDragStart) {
      onDragStart(frameId)
    }
  }, [isDraggable, frameId, onDragStart, lockStatus, frameRef])

  const handleMouseMove = useCallback((e) => {
    if (!isMouseDown || !isDraggable) return
    
    e.preventDefault()
    e.stopPropagation()
    
    handleAutoScroll(e.clientX, e.clientY)
    
    if (!hasDragged) {
      const threshold = 5
      const rect = frameRef.current?.getBoundingClientRect()
      if (rect) {
        const deltaX = Math.abs(e.clientX - (rect.left + dragOffset.x))
        const deltaY = Math.abs(e.clientY - (rect.top + dragOffset.y))
        
        if (deltaX > threshold || deltaY > threshold) {
          setHasDragged(true)
        }
      }
    }
    
    const canvas = document.querySelector('[data-canvas="true"]') || document.body
    const canvasRect = canvas.getBoundingClientRect()
    
    const newX = (e.clientX - canvasRect.left - dragOffset.x) / zoom
    const newY = (e.clientY - canvasRect.top - dragOffset.y) / zoom
    
    if (onDrag) {
      onDrag(frameId, Math.max(0, newX), Math.max(0, newY))
    }
  }, [isMouseDown, isDraggable, dragOffset, zoom, frameId, onDrag, hasDragged, handleAutoScroll, frameRef])

  const handleMouseUp = useCallback((e) => {
    if (isMouseDown) {
      e?.preventDefault?.()
      e?.stopPropagation?.()
      
      setIsMouseDown(false)
      
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current)
        autoScrollRef.current = null
        setAutoScrollActive(false)
      }
      
      if (onDragEnd) {
        onDragEnd(frameId)
      }
      
      setTimeout(() => {
        setHasDragged(false)
      }, 10)
    }
  }, [isMouseDown, frameId, onDragEnd])

  useEffect(() => {
    if (isMouseDown) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false })
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isMouseDown, handleMouseMove, handleMouseUp])

  // ENHANCED: Determine frame appearance with thumbnail status
  const getFrameStyles = () => {
    let styles = {
      top: y,
      left: x,
      width: `${size.w * 4}px`,
      height: `${size.h * 4}px`,
      backgroundColor: 'var(--color-surface)',
      borderColor: 'transparent',
      backdropFilter: 'blur(10px)',
      zIndex: isDragging ? 1000 : 10
    }

    if (lockStatus?.is_locked) {
      if (lockStatus.locked_by_me) {
        styles.boxShadow = isDragging 
          ? '0 25px 50px -12px rgba(59, 130, 246, 0.4), 0 0 0 2px rgba(59, 130, 246, 0.3)' 
          : '0 10px 30px -5px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.2)'
        styles.background = isDark 
          ? 'linear-gradient(145deg, rgba(37, 99, 235, 0.1), rgba(30, 41, 59, 0.9))' 
          : 'linear-gradient(145deg, rgba(239, 246, 255, 0.9), rgba(219, 234, 254, 0.8))'
      } else {
        styles.boxShadow = isDragging 
          ? '0 25px 50px -12px rgba(239, 68, 68, 0.4), 0 0 0 2px rgba(239, 68, 68, 0.3)' 
          : '0 10px 30px -5px rgba(239, 68, 68, 0.2), 0 4px 6px -2px rgba(239, 68, 68, 0.1), 0 0 0 1px rgba(239, 68, 68, 0.2)'
        styles.background = isDark 
          ? 'linear-gradient(145deg, rgba(220, 38, 38, 0.1), rgba(30, 41, 59, 0.9))' 
          : 'linear-gradient(145deg, rgba(254, 242, 242, 0.9), rgba(254, 226, 226, 0.8))'
      }
    } else {
      styles.boxShadow = isDragging 
        ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
        : '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      styles.background = isDark 
        ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))' 
        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8))'
    }

    styles.border = '1px solid rgba(255, 255, 255, 0.1)'
    
    return styles
  }

  // ENHANCED: Render thumbnail with better error handling and SVG support
  const renderThumbnailContent = () => {
    if (showLoadingContent || (thumbnailLoading && !thumbnailUrl)) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative">
          <svg className="w-8 h-8 animate-spin mb-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <div className="text-xs opacity-60 font-medium">
            {thumbnailGenerating ? 'Updating preview...' : 'Loading preview...'}
          </div>
        </div>
      )
    }

    const displayUrl = thumbnailUrl || placeholderUrl;
    const showRealThumbnail = thumbnailUrl && isValidThumbnail && !thumbnailLoadError && imageLoadAttempts < 3;

    return (
      <div className="w-full h-full relative rounded-lg overflow-hidden group">
        <div className="absolute inset-0 w-full h-full">
          {showRealThumbnail ? (
            <div className="w-full h-full relative">
              {displayUrl.endsWith('.svg') || displayUrl.includes('data:image/svg+xml') ? (
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url("${displayUrl}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              ) : (
                <img 
                  src={displayUrl}
                  alt={`${title} thumbnail`}
                  className="w-full h-full object-cover"
                  data-thumbnail-frame={frame?.uuid}
                  onLoad={handleThumbnailImageLoad}
                  onError={handleThumbnailImageError}
                  loading="lazy"
                />
              )}
            </div>
          ) : (
            <div className="w-full h-full">
              {displayUrl && !thumbnailLoadError ? (
                displayUrl.includes('data:image/svg+xml') ? (
                  <div 
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url("${displayUrl}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                ) : (
                  <img 
                    src={displayUrl}
                    alt="Thumbnail placeholder"
                    className="w-full h-full object-cover opacity-70"
                    onError={() => setThumbnailLoadError(true)}
                  />
                )
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                      <div className="h-6 bg-blue-200 dark:bg-blue-800 rounded mt-3"></div>
                      <div className="grid grid-cols-2 gap-1 mt-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                  
                  {thumbnailLoadError && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Preview unavailable
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FIXED: Thumbnail action overlay - only shows on hover and doesn't block clicks when hidden */}
        {showThumbnailActions && (
          <div className="thumbnail-actions absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center gap-2 transition-all duration-200">
            <button
              onClick={handleGenerateThumbnail}
              disabled={thumbnailGenerating}
              className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors disabled:opacity-50"
              title="Generate thumbnail"
            >
              <Camera className={`w-4 h-4 text-white ${thumbnailGenerating ? 'animate-pulse' : ''}`} />
            </button>
            
            <button
              onClick={handleRefreshThumbnail}
              disabled={thumbnailLoading}
              className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors disabled:opacity-50"
              title="Refresh thumbnail"
            >
              <RefreshCw className={`w-4 h-4 text-white ${thumbnailLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}

        {/* ENHANCED: Thumbnail status indicators */}
        <div className="absolute top-2 left-2 flex gap-1">
          {thumbnailGenerating && (
            <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Camera className="w-3 h-3" />
              Updating
            </div>
          )}
          
          {thumbnailLoadError && imageLoadAttempts >= 3 && (
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Error
            </div>
          )}
          
          {lastGenerated && isValidThumbnail && !thumbnailLoadError && (
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Live
            </div>
          )}
          
          {imageLoadAttempts > 0 && imageLoadAttempts < 3 && (
            <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Retry {imageLoadAttempts}/3
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={frameRef}
      data-frame-uuid={frame?.uuid}
      className={`preview-frame absolute rounded-xl p-3 transition-all duration-300 ease-out flex flex-col group ${
        isDragging ? 'shadow-2xl scale-105 z-50' : 'shadow-lg hover:shadow-xl hover:-translate-y-1'
      } ${lockStatus?.is_locked && !lockStatus.locked_by_me ? 'cursor-not-allowed' : 'cursor-grab'} ${
        isMouseDown ? 'cursor-grabbing' : ''
      }`}
      style={getFrameStyles()}
      onMouseDown={handleMouseDown}
      onClick={handleFrameClick}
      onMouseEnter={() => setShowThumbnailActions(true)}
      onMouseLeave={() => setShowThumbnailActions(false)}
      onTouchStart={(e) => {
        if (e.touches.length === 1) {
          const touch = e.touches[0]
          const mouseEvent = {
            ...e,
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: e.preventDefault.bind(e),
            stopPropagation: e.stopPropagation.bind(e)
          }
          handleMouseDown(mouseEvent)
        }
      }}
    >
      {/* Lock overlay for locked frames */}
      {lockStatus?.is_locked && !lockStatus.locked_by_me && (
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20 rounded-xl z-10 flex items-center justify-center">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Locked by {lockStatus.locked_by?.name}
            </p>
          </div>
        </div>
      )}

      {/* Enhanced Header with thumbnail status */}
      <div 
        ref={headerRef}
        className={`frame-header flex items-center justify-between mb-3 -mt-1 min-w-0 ${
          isDraggingFromHeader ? 'cursor-grabbing' : 'cursor-grab'
        } hover:bg-white/5 dark:hover:bg-black/5 rounded-lg p-1 -m-1 transition-colors`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 text-xs min-w-0 flex-1" style={{ color: 'var(--color-text-muted)' }}>
          <span className="font-semibold text-sm truncate max-w-[120px]" title={title}>
            {title}
          </span>
          <span className="opacity-60 flex-shrink-0">•</span>
          <span className="opacity-80 truncate max-w-[100px]" title={fileName}>
            ({fileName})
          </span>
          
          {frame?.isGithubImport ? (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Github className="w-3 h-3 text-green-600" />
              <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                {frame.githubExtension?.toUpperCase() || 'GH'}
              </span>
            </div>
          ) : (
            <Plug className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {frame?.isGithubImport && frame.complexity && (
            <div className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
              frame.complexity === 'high' ? 'bg-red-100 text-red-700' :
              frame.complexity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {frame.complexity}
            </div>
          )}
          
          <div className="lock-button flex-shrink-0">
            <EnhancedLockButton
              frameUuid={frame?.uuid}
              currentMode="forge"
              size="sm"
            />
          </div>
          
          <div className="flex -space-x-1.5 flex-shrink-0">
            {avatarColors.map((color, i) => (
              <div
                key={i}
                className={`avatar w-5 h-5 rounded-full border-2 border-white ${color} flex items-center justify-center shadow-sm hover:scale-110 transition-transform duration-200 cursor-pointer`}
                style={{ fontSize: '9px', color: 'white', fontWeight: 'bold' }}
                onClick={(e) => e.stopPropagation()}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          
          <button 
            className="more-button p-1.5 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200 hover:scale-110 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
      </div>

      {/* ENHANCED: Content Area with real-time thumbnail */}
      <div className="rounded-lg mb-3 flex-1 relative overflow-hidden">
        {renderThumbnailContent()}
      </div>
      
      {/* Bottom mock lines */}
      {!showLoadingContent && (
        <div className="space-y-2">
          <div
            className="rounded-full transition-all duration-300 group-hover:bg-blue-300"
            style={{
              height: '4px',
              width: '70%',
              backgroundColor: 'var(--color-border)',
            }}
          />
          <div
            className="rounded-full transition-all duration-300 group-hover:bg-blue-300"
            style={{
              height: '4px',
              width: '50%',
              backgroundColor: 'var(--color-border)',
            }}
          />
        </div>
      )}
      
      {/* Enhanced indicators */}
      {isDragging && (
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full shadow-lg animate-pulse"></div>
      )}
      
      {autoScrollActive && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full shadow-lg animate-ping"></div>
      )}
      
      {thumbnailGenerating && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full shadow-lg animate-pulse"></div>
      )}
    </div>
  )
}