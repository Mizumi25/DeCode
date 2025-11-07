// @/Components/Forge/AssetsPanel.jsx
import React, { useState, useRef, useCallback } from 'react';
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

const AssetsPanel = ({ onAssetDrop, onAssetSelect }) => {
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'images', 'videos', 'audio', 'documents'
  const [showPreview, setShowPreview] = useState(null);
  const [processingRemoveBg, setProcessingRemoveBg] = useState(null);
  


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
    // Add user-facing error message
    alert('Upload failed: ' + (error.response?.data?.message || error.message));
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

  // Remove background (for images)
  const handleRemoveBackground = async (asset) => {
    if (asset.type !== 'image') return;

    setProcessingRemoveBg(asset.id);

    try {
      const response = await axios.post('/api/assets/remove-background', {
        assetId: asset.id
      });

      if (response.data.success) {
        const updatedAsset = {
          ...asset,
          url: response.data.url,
          thumbnail: response.data.thumbnail,
          hasTransparentBg: true
        };

        setAssets(prev => prev.map(a => a.id === asset.id ? updatedAsset : a));
      }
    } catch (error) {
      console.error('Background removal failed:', error);
    } finally {
      setProcessingRemoveBg(null);
    }
  };

 // replace the delete handler
const handleDeleteAsset = async (assetUuid, assetId) => {
  try {
    await axios.delete(`/api/assets/${assetUuid}`);
    setAssets(prev => prev.filter(a => a.id !== assetId));
    if (selectedAsset?.id === assetId) {
      setSelectedAsset(null);
    }
  } catch (error) {
    console.error('Delete failed:', error);
    alert(error.response?.data?.message || 'Delete failed');
  }
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
              className="group relative aspect-square border rounded-xl overflow-hidden cursor-pointer hover:border-primary transition-all"
              style={{ 
                backgroundColor: 'var(--color-surface)',
                borderColor: selectedAsset?.id === asset.id ? 'var(--color-primary)' : 'var(--color-border)'
              }}
              draggable
              onDragStart={(e) => handleAssetDragStart(e, asset)}
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
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                    // update callers (grid)
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAsset(asset.uuid, asset.id);
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
                  // update callers (grid)
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAsset(asset.uuid, asset.id);
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
                className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-[var(--color-bg-hover)]'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-[var(--color-bg-hover)]'}`}
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
          {filteredAssets.length === 0 ? (
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
    </div>
  );
};

export default AssetsPanel;