// @/Components/Forge/AssetsPanel.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileImage, 
  Upload, 
  Video, 
  Music, 
  File, 
  X, 
  Download, 
  Eye,
  Scissors,
  RotateCcw,
  Trash2,
  Plus,
  Grid3X3,
  List,
  Search,
  Filter,
  Play,
  Pause,
  Volume2
} from 'lucide-react';
import axios from 'axios';
import ConfirmationDialog from '@/Components/ConfirmationDialog';

const AssetsPanel = ({ onAssetDrop, onAssetSelect }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'images', 'videos', 'audio', 'documents'
  const [showPreview, setShowPreview] = useState(null);
  const [processingRemoveBg, setProcessingRemoveBg] = useState(null);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info'
    confirmText: 'OK',
    onConfirm: null,
    showCancel: false,
  });
  


  // add after useState hooks
const filterTabs = [
  { key: 'all', icon: Grid3X3, label: 'All' },
  { key: 'images', icon: FileImage, label: 'Images' },
  { key: 'videos', icon: Video, label: 'Videos' },
  { key: 'audio', icon: Music, label: 'Audio' },
  { key: 'documents', icon: File, label: 'Documents' },
];
  const fileInputRef = useRef(null);
  const dragCountRef = useRef(0);

  // Fetch assets on component mount
  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/assets');
      if (response.data.success) {
        setAssets(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  };

  // File type detection
  const getFileType = (file) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return FileImage;
      case 'video': return Video;
      case 'audio': return Music;
      default: return File;
    }
  };

  // Upload handler
  const handleFileUpload = useCallback(async (files) => {
  if (!files || files.length === 0) return;

  setUploading(true);
  setUploadProgress(0);

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', getFileType(file));
      
      // Add project_id if available
      if (window.currentProjectId) {
        formData.append('project_id', window.currentProjectId);
      }

      const response = await axios.post('/api/assets', formData, { // ← Changed from /api/assets/upload
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress((i / files.length) * 100 + (progress / files.length));
        },
      });

      if (response.data.success) {
        setAssets(prev => [response.data.asset, ...prev]);
      }
    }
  } catch (error) {
    console.error('Upload failed:', error);
    
    setConfirmDialog({
      show: true,
      title: 'Upload Failed',
      message: error.response?.data?.message || error.message || 'Failed to upload asset. Please try again.',
      type: 'error',
      confirmText: 'OK',
      onConfirm: () => setConfirmDialog(prev => ({ ...prev, show: false })),
      showCancel: false,
    });
  } finally {
    setUploading(false);
    setUploadProgress(0);
  }
}, []);

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCountRef.current++;
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCountRef.current--;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragCountRef.current = 0;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // Asset drag start (for dragging to canvas)
  const handleAssetDragStart = (e, asset) => {
    console.log('🎬 Asset drag start:', asset.name);
    
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'asset',
      assetType: asset.type,
      asset: asset
    }));

    // Create drag preview
    const dragPreview = document.createElement('div');
    dragPreview.style.cssText = `
      position: absolute;
      top: -1000px;
      left: -1000px;
      z-index: 9999;
      padding: 8px;
      background: var(--color-surface);
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      border: 2px solid var(--color-primary);
      pointer-events: none;
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: 200px;
    `;
    
    if (asset.thumbnail) {
      dragPreview.innerHTML = `
        <img src="${asset.thumbnail}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" />
        <div style="color: var(--color-text); font-size: 12px; font-weight: 600;">${asset.name}</div>
      `;
    } else {
      const IconComponent = getFileIcon(asset.type);
      dragPreview.innerHTML = `
        <div style="width: 40px; height: 40px; background: var(--color-primary); border-radius: 4px; display: flex; align-items: center; justify-content: center;">
          <svg style="width: 20px; height: 20px; color: white;" viewBox="0 0 24 24" fill="currentColor">
            <path d="${getIconPath(asset.type)}" />
          </svg>
        </div>
        <div style="color: var(--color-text); font-size: 12px; font-weight: 600;">${asset.name}</div>
      `;
    }
    
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(dragPreview, 100, 20);
    
    setTimeout(() => {
      if (document.body.contains(dragPreview)) {
        document.body.removeChild(dragPreview);
      }
    }, 100);
  };
  
  // 🔥 Asset drag system with threshold (like useCustomDrag)
  const [isDragging, setIsDragging] = useState(false);
  const [draggedAsset, setDraggedAsset] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const dragInteractionRef = useRef({
    isWatching: false,
    startX: 0,
    startY: 0,
    hasCrossedThreshold: false,
    asset: null,
    longPressTimer: null,
  });
  
  const DRAG_THRESHOLD = 8; // Pixels to move before starting drag
  const LONG_PRESS_DURATION = 300; // 300ms long press before drag activates
  
  const handleManualDragStart = (e, asset) => {
    // Don't prevent default yet - allow click events
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    console.log('👆 Press start:', asset.name);
    
    // Start watching for drag
    dragInteractionRef.current = {
      isWatching: true,
      startX: clientX,
      startY: clientY,
      hasCrossedThreshold: false,
      asset: asset,
      longPressTimer: null,
    };
    
    // 🔥 Long press for mobile - vibrate when drag activates
    dragInteractionRef.current.longPressTimer = setTimeout(() => {
      if (dragInteractionRef.current.isWatching && !dragInteractionRef.current.hasCrossedThreshold) {
        console.log('📳 Long press activated - vibrate');
        
        // Vibrate on mobile
        if (navigator.vibrate) {
          navigator.vibrate(50); // Short vibration
        }
        
        // Force start drag on long press
        dragInteractionRef.current.hasCrossedThreshold = true;
        setIsDragging(true);
        setDraggedAsset(asset);
        setDragPosition({ x: clientX, y: clientY });
      }
    }, LONG_PRESS_DURATION);
    
    // Add global listeners
    document.addEventListener('mousemove', handleManualDragMove);
    document.addEventListener('mouseup', handleManualDragEnd);
    document.addEventListener('touchmove', handleManualDragMove, { passive: false });
    document.addEventListener('touchend', handleManualDragEnd);
  };
  
  const handleManualDragMove = (e) => {
    if (!dragInteractionRef.current.isWatching) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // 🔥 Threshold check - only start drag if moved enough
    if (!dragInteractionRef.current.hasCrossedThreshold) {
      const deltaX = Math.abs(clientX - dragInteractionRef.current.startX);
      const deltaY = Math.abs(clientY - dragInteractionRef.current.startY);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance < DRAG_THRESHOLD) {
        return; // Not moved enough yet
      }
      
      // Threshold crossed - start drag
      console.log('🎯 Threshold crossed, starting drag');
      e.preventDefault(); // Now prevent default
      
      dragInteractionRef.current.hasCrossedThreshold = true;
      setIsDragging(true);
      setDraggedAsset(dragInteractionRef.current.asset);
      
      // Clear long press timer if user moved before timeout
      if (dragInteractionRef.current.longPressTimer) {
        clearTimeout(dragInteractionRef.current.longPressTimer);
      }
      
      // Vibrate on drag start
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    }
    
    // Update position during drag
    if (dragInteractionRef.current.hasCrossedThreshold) {
      e.preventDefault(); // Prevent scrolling during drag
      setDragPosition({ x: clientX, y: clientY });
    }
  };
  
  const handleManualDragEnd = (e) => {
    if (!dragInteractionRef.current.isWatching) return;
    
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    
    // Clear long press timer
    if (dragInteractionRef.current.longPressTimer) {
      clearTimeout(dragInteractionRef.current.longPressTimer);
    }
    
    // 🔥 If threshold was never crossed, treat as click (don't drop)
    if (!dragInteractionRef.current.hasCrossedThreshold) {
      console.log('✅ Click detected (no drag)');
      dragInteractionRef.current.isWatching = false;
      
      // Cleanup listeners
      document.removeEventListener('mousemove', handleManualDragMove);
      document.removeEventListener('mouseup', handleManualDragEnd);
      document.removeEventListener('touchmove', handleManualDragMove);
      document.removeEventListener('touchend', handleManualDragEnd);
      
      return; // Let the click event fire normally
    }
    
    console.log('🎯 Drag end');
    
    // Find canvas element at drop position
    const canvasEl = document.querySelector('[data-canvas-area]');
    if (canvasEl) {
      const rect = canvasEl.getBoundingClientRect();
      const isOverCanvas = clientX >= rect.left && clientX <= rect.right &&
                          clientY >= rect.top && clientY <= rect.bottom;
      
      if (isOverCanvas) {
        console.log('✅ Dropped on canvas');
        
        // Vibrate on successful drop
        if (navigator.vibrate) {
          navigator.vibrate([30, 50, 30]); // Double vibration
        }
        
        // Trigger drop event on canvas
        const dropEvent = new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          clientX: clientX,
          clientY: clientY,
        });
        
        // Add our data to the event
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: {
            getData: (format) => {
              if (format === 'application/json') {
                return JSON.stringify({
                  type: 'asset',
                  assetType: dragInteractionRef.current.asset.type,
                  asset: dragInteractionRef.current.asset
                });
              }
              return '';
            }
          }
        });
        
        canvasEl.dispatchEvent(dropEvent);
      }
    }
    
    // Cleanup
    setIsDragging(false);
    setDraggedAsset(null);
    dragInteractionRef.current.isWatching = false;
    dragInteractionRef.current.hasCrossedThreshold = false;
    
    document.removeEventListener('mousemove', handleManualDragMove);
    document.removeEventListener('mouseup', handleManualDragEnd);
    document.removeEventListener('touchmove', handleManualDragMove);
    document.removeEventListener('touchend', handleManualDragEnd);
  };

  // Remove background (for images)
  const handleRemoveBackground = async (asset) => {
    if (asset.type !== 'image') return;

    setProcessingRemoveBg(asset.id);

    try {
      const response = await axios.post('/api/assets/remove-background', {
        assetId: asset.id
      }, {
        timeout: 120000  // 120 seconds timeout to match backend
      });

      if (response.data.success) {
        const updatedAsset = {
          ...asset,
          url: response.data.url,
          thumbnail: response.data.thumbnail,
          hasTransparentBg: true
        };

        setAssets(prev => prev.map(a => a.id === asset.id ? updatedAsset : a));
        
        setConfirmDialog({
          show: true,
          title: 'Success!',
          message: 'Background removed successfully! Your image now has a transparent background.',
          type: 'success',
          confirmText: 'OK',
          onConfirm: () => setConfirmDialog(prev => ({ ...prev, show: false })),
          showCancel: false,
        });
      }
    } catch (error) {
      console.error('Background removal failed:', error);
      const errorMessage = error.response?.data?.message || 'Background removal failed. Please try again.';
      
      setConfirmDialog({
        show: true,
        title: 'Background Removal Failed',
        message: errorMessage,
        type: 'error',
        confirmText: 'OK',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, show: false })),
        showCancel: false,
      });
    } finally {
      setProcessingRemoveBg(null);
    }
  };

 // Delete asset with confirmation
const handleDeleteAsset = async (asset) => {
  setConfirmDialog({
    show: true,
    title: 'Delete Asset',
    message: `Are you sure you want to delete "${asset?.name || 'this asset'}"? This action cannot be undone.`,
    type: 'warning',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    onConfirm: async () => {
      try {
        await axios.delete(`/api/assets/${asset.uuid}`);
        setAssets(prev => prev.filter(a => a.id !== asset.id));
        if (selectedAsset?.id === asset.id) {
          setSelectedAsset(null);
        }
        
        setConfirmDialog({
          show: true,
          title: 'Deleted',
          message: 'Asset deleted successfully.',
          type: 'success',
          confirmText: 'OK',
          onConfirm: () => setConfirmDialog(prev => ({ ...prev, show: false })),
          showCancel: false,
        });
      } catch (error) {
        console.error('Delete failed:', error);
        
        setConfirmDialog({
          show: true,
          title: 'Delete Failed',
          message: error.response?.data?.message || 'Failed to delete asset. Please try again.',
          type: 'error',
          confirmText: 'OK',
          onConfirm: () => setConfirmDialog(prev => ({ ...prev, show: false })),
          showCancel: false,
        });
      }
    },
    onCancel: () => setConfirmDialog(prev => ({ ...prev, show: false })),
    showCancel: true,
  });
};

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
      (filterType === 'images' && asset.type === 'image') ||
      (filterType === 'videos' && asset.type === 'video') ||
      (filterType === 'audio' && asset.type === 'audio') ||
      (filterType === 'documents' && asset.type === 'document');
    
    return matchesSearch && matchesFilter;
  });

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get icon path for SVG
  const getIconPath = (type) => {
    switch (type) {
      case 'image': return 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z';
      case 'video': return 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z';
      case 'audio': return 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3';
      default: return 'M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2v0a2 2 0 012 2v6.5a1.5 1.5 0 103 0V5a2 2 0 012-2v0a2 2 0 012 2v8.5a1.5 1.5 0 103 0V5a2 2 0 012-2v0a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V5z';
    }
  };

  const renderAssetGrid = () => (
    <div className="grid grid-cols-2 gap-3">
      <AnimatePresence>
        {filteredAssets.map(asset => {
          const IconComponent = getFileIcon(asset.type);
          const isProcessing = processingRemoveBg === asset.id;
          
          return (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="group relative aspect-square border rounded-xl overflow-hidden cursor-grab active:cursor-grabbing hover:border-primary transition-all"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                borderColor: selectedAsset?.id === asset.id ? 'var(--color-primary)' : 'var(--color-border)',
                touchAction: 'none', // Prevent scroll during drag
              }}
              draggable
              onDragStart={(e) => handleAssetDragStart(e, asset)}
              onMouseDown={(e) => handleManualDragStart(e, asset)}
              onTouchStart={(e) => handleManualDragStart(e, asset)}
              onClick={() => setSelectedAsset(selectedAsset?.id === asset.id ? null : asset)}
            >
              {/* Asset Preview */}
              {asset.thumbnail ? (
                <img 
                  src={asset.thumbnail} 
                  alt={asset.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <IconComponent 
                    className="w-8 h-8" 
                    style={{ color: 'var(--color-text-muted)' }} 
                  />
                </div>
              )}
              
              {/* Processing Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-white text-xs font-medium">Removing background...</div>
                  <div className="text-white text-xs opacity-75">This may take up to 2 minutes</div>
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPreview(asset);
                    }}
                    className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Eye className="w-4 h-4 text-gray-700" />
                  </button>
                  
                  {asset.type === 'image' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveBackground(asset);
                      }}
                      disabled={isProcessing}
                      className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50"
                    >
                      <Scissors className="w-4 h-4 text-gray-700" />
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAsset(asset);
                    }}
                    className="w-8 h-8 bg-red-500/90 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* File Info Badge */}
              <div className="absolute bottom-2 left-2 right-2">
                <div 
                  className="px-2 py-1 rounded text-xs font-medium truncate"
                  style={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white'
                  }}
                >
                  {asset.name}
                </div>
              </div>

              {/* Type Badge */}
              <div className="absolute top-2 left-2">
                <div 
                  className="px-1.5 py-0.5 rounded text-xs font-bold uppercase"
                  style={{ 
                    backgroundColor: asset.type === 'image' ? '#10b981' : 
                                   asset.type === 'video' ? '#f59e0b' :
                                   asset.type === 'audio' ? '#8b5cf6' : '#6b7280',
                    color: 'white'
                  }}
                >
                  {asset.type}
                </div>
              </div>

              {/* Selection Indicator */}
              {selectedAsset?.id === asset.id && (
                <div className="absolute top-2 right-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <X className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  const renderAssetList = () => (
    <div className="space-y-2">
      <AnimatePresence>
        {filteredAssets.map(asset => {
          const IconComponent = getFileIcon(asset.type);
          const isProcessing = processingRemoveBg === asset.id;
          
          return (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-primary transition-all group"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                borderColor: selectedAsset?.id === asset.id ? 'var(--color-primary)' : 'var(--color-border)'
              }}
              draggable
              onDragStart={(e) => handleAssetDragStart(e, asset)}
              onMouseDown={(e) => handleManualDragStart(e, asset)}
              onTouchStart={(e) => handleManualDragStart(e, asset)}
              onClick={() => setSelectedAsset(selectedAsset?.id === asset.id ? null : asset)}
            >
              {/* Thumbnail/Icon */}
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                {asset.thumbnail ? (
                  <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <IconComponent className="w-6 h-6" style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                )}
              </div>

              {/* Asset Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>
                  {asset.name}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {formatFileSize(asset.size)} • {asset.type}
                  {asset.dimensions && ` • ${asset.dimensions.width}×${asset.dimensions.height}`}
                  {asset.duration && ` • ${Math.round(asset.duration)}s`}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPreview(asset);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'var(--color-bg-hover)' }}
                >
                  <Eye className="w-4 h-4" style={{ color: 'var(--color-text)' }} />
                </button>
                
                {asset.type === 'image' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBackground(asset);
                    }}
                    disabled={isProcessing}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-bg-hover)' }}
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-text)' }}></div>
                    ) : (
                      <Scissors className="w-4 h-4" style={{ color: 'var(--color-text)' }} />
                    )}
                  </button>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAsset(asset);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: 'var(--color-bg-hover)' }}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  return (
    <div 
      className="h-full flex"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Left vertical icon tabs */}
      <div className="w-12 flex-shrink-0 py-2 pr-2">
        <div className="flex flex-col items-center gap-2">
          {filterTabs.map(tab => {
            const Icon = tab.icon;
            const active = filterType === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilterType(tab.key)}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: active ? 'var(--color-primary)' : 'var(--color-bg-hover)',
                  color: active ? 'white' : 'var(--color-text-muted)',
                  boxShadow: active ? 'var(--shadow-sm)' : 'none'
                }}
                title={tab.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Right content */}
      <div className="flex-1 min-w-0 space-y-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
            <FileImage className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Media Assets</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {assets.length} files • Drag to canvas
            </p>
          </div>
        </div>

        {/* Controls (search + view toggles) */}
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm transition-colors"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)'
              }}
            />
          </div>

          {/* View Controls */}
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className="p-2 rounded transition-colors"
                style={{
                  backgroundColor: viewMode === 'grid' ? 'var(--color-primary)' : 'transparent',
                  color: viewMode === 'grid' ? 'white' : 'var(--color-text-muted)'
                }}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="p-2 rounded transition-colors"
                style={{
                  backgroundColor: viewMode === 'list' ? 'var(--color-primary)' : 'transparent',
                  color: viewMode === 'list' ? 'white' : 'var(--color-text-muted)'
                }}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            onChange={(e) => handleFileUpload(Array.from(e.target.files))}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full py-4 px-4 border-2 border-dashed rounded-xl text-sm transition-all font-semibold flex items-center justify-center gap-2 relative overflow-hidden"
            style={{ 
              borderColor: uploading ? 'var(--color-primary)' : 'var(--color-border)', 
              color: 'var(--color-primary)', 
              backgroundColor: uploading ? 'var(--color-primary-soft)' : 'var(--color-bg)' 
            }}
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Uploading... {uploadProgress.toFixed(0)}%
                <div 
                  className="absolute bottom-0 left-0 h-1 transition-all duration-300"
                  style={{ 
                    width: `${uploadProgress}%`, 
                    backgroundColor: 'var(--color-primary)' 
                  }}
                ></div>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload New Assets
              </>
            )}
          </button>
        </div>

        {/* Assets List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 mx-auto mb-4 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: 'var(--color-primary)' }}></div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Loading assets...
              </p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                <FileImage className="w-8 h-8" style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {searchTerm || filterType !== 'all' ? 'No assets match your search' : 'No assets uploaded yet'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {!searchTerm && filterType === 'all' && 'Upload images, videos, audio files, or documents'}
              </p>
            </div>
          ) : (
            viewMode === 'grid' ? renderAssetGrid() : renderAssetList()
          )}
        </div>

        {/* Drag Preview Ghost */}
        {isDragging && draggedAsset && (
          <div
            style={{
              position: 'fixed',
              left: dragPosition.x - 50,
              top: dragPosition.y - 50,
              width: '100px',
              height: '100px',
              pointerEvents: 'none',
              zIndex: 10000,
              opacity: 0.8,
              transform: 'scale(1.1)',
            }}
          >
            {draggedAsset.thumbnail ? (
              <img 
                src={draggedAsset.thumbnail} 
                alt={draggedAsset.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  border: '2px solid var(--color-primary)',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--color-primary)',
                  borderRadius: '8px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                }}
              >
                {React.createElement(getFileIcon(draggedAsset.type), {
                  className: 'w-12 h-12 text-white'
                })}
              </div>
            )}
          </div>
        )}
        
        {/* Preview Modal */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setShowPreview(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="max-w-4xl max-h-full bg-white rounded-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <div>
                    <h3 className="font-semibold">{showPreview.name}</h3>
                    <p className="text-sm text-gray-600">
                      {formatFileSize(showPreview.size)} • {showPreview.type}
                      {showPreview.dimensions && ` • ${showPreview.dimensions.width}×${showPreview.dimensions.height}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPreview(null)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-4 max-h-96 overflow-auto">
                  {showPreview.type === 'image' && (
                    <img 
                      src={showPreview.url} 
                      alt={showPreview.name}
                      className="max-w-full h-auto rounded-lg"
                    />
                  )}
                  {showPreview.type === 'video' && (
                    <video 
                      src={showPreview.url} 
                      controls 
                      className="max-w-full h-auto rounded-lg"
                    />
                  )}
                  {showPreview.type === 'audio' && (
                    <div className="flex items-center justify-center p-8">
                      <audio src={showPreview.url} controls className="w-full max-w-md" />
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        show={confirmDialog.show}
        onClose={() => setConfirmDialog(prev => ({ ...prev, show: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        type={confirmDialog.type}
        variant={confirmDialog.type === 'success' ? 'primary' : confirmDialog.type === 'error' ? 'danger' : confirmDialog.type === 'warning' ? 'warning' : 'primary'}
      />
    </div>
  );
};

export default AssetsPanel;