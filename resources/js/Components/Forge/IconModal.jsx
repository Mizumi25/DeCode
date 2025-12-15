import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, Upload, Plus, Trash2, Copy, Play, Move, Pencil
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import * as HeroIcons from '@heroicons/react/24/outline';
import { useIconStore } from '@/stores/useIconStore';
import axios from 'axios';
import SvgDrawingTool from './SvgDrawingTool';

const IconModal = ({ onIconSelect }) => {
  const {
    activeTab,
    searchTerm,
    customSvgs,
    svgEditor,
    setActiveTab,
    setSearchTerm,
    addCustomSvg,
    removeCustomSvg,
    setSvgEditor
  } = useIconStore();

  // State for fetched icons from database
  const [icons, setIcons] = useState({ lucide: [], heroicons: [], svg: [] });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showDrawingTool, setShowDrawingTool] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch icons from database on mount
  useEffect(() => {
    fetchIcons();
  }, []);

  const fetchIcons = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/icons');
      if (response.data.success) {
        setIcons(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch icons:', error);
    } finally {
      setLoading(false);
    }
  };

  // Map Lucide icon names to actual components
  const lucideIconComponents = useMemo(() => {
    const components = {};
    Object.keys(LucideIcons).forEach(key => {
      if (typeof LucideIcons[key] === 'function') {
        components[key] = LucideIcons[key];
      }
    });
    return components;
  }, []);

  // Convert database icons to renderable format
  const lucideIcons = useMemo(() => 
    icons.lucide.map(icon => ({
      ...icon,
      icon: lucideIconComponents[icon.library_name] || LucideIcons.HelpCircle
    })),
  [icons.lucide, lucideIconComponents]);

  const heroIcons = useMemo(() => 
    icons.heroicons.map(icon => ({
      ...icon,
      icon: HeroIcons[icon.library_name] || HeroIcons.QuestionMarkCircleIcon
    })),
  [icons.heroicons]);

  const svgIcons = useMemo(() => icons.svg, [icons.svg]);

  // Filter icons based on search term
  const filteredIcons = useMemo(() => {
    let iconList = [];
    
    switch (activeTab) {
      case 'heroicons':
        iconList = heroIcons;
        break;
      case 'lucide':
        iconList = lucideIcons;
        break;
      case 'svg':
        iconList = svgIcons;
        break;
      default:
        iconList = [];
    }
    
    if (!searchTerm) return iconList;
    
    return iconList.filter(icon => 
      icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (icon.category && icon.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (icon.tags && icon.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [activeTab, searchTerm, heroIcons, lucideIcons, svgIcons]);

  // Handle icon selection
  const handleIconSelect = (icon) => {
    if (onIconSelect) {
      const iconData = {
        type: activeTab,
        name: icon.name,
        category: icon.category,
        data: activeTab === 'svg' ? icon.svgCode : null,
        component: activeTab !== 'lottie' && activeTab !== 'svg' ? icon.icon : null
      };
      onIconSelect(iconData);
    }
  };

  // Handle SVG file upload
  const handleSvgUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'image/svg+xml') {
      console.error('Invalid file type. Please upload an SVG file.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name.replace('.svg', ''));
      formData.append('category', 'custom');

      const response = await axios.post('/api/icons/upload-svg', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        // Refresh icons list
        await fetchIcons();
        console.log('SVG uploaded successfully');
      }
    } catch (error) {
      console.error('Failed to upload SVG:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle SVG Drawing Tool save
  const handleDrawingSave = async ({ name, svgCode }) => {
    try {
      const response = await axios.post('/api/icons/create-svg', {
        name,
        svg_code: svgCode,
        category: 'drawn',
        tags: ['custom', 'drawn']
      });

      if (response.data.success) {
        await fetchIcons();
        setShowDrawingTool(false);
        console.log('Drawing saved successfully');
      }
    } catch (error) {
      console.error('Failed to save drawing:', error);
    }
  };

  // Handle delete custom SVG
  const handleDeleteSvg = async (iconId) => {
    try {
      const response = await axios.delete(`/api/icons/${iconId}`);
      if (response.data.success) {
        await fetchIcons();
        console.log('Icon deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete icon:', error);
    }
  };

  // Copy SVG code to clipboard
  const handleSvgCopy = async (svgCode) => {
    try {
      await navigator.clipboard.writeText(svgCode);
    } catch (err) {
      console.error('Failed to copy SVG code:', err);
    }
  };

  const tabs = [
    { id: 'heroicons', label: 'Heroicons', count: heroIcons.length },
    { id: 'lucide', label: 'Lucide', count: lucideIcons.length },
    { id: 'svg', label: 'Custom SVG', count: svgIcons.length }
  ];

    const renderIcon = (icon, index) => {
    const IconComponent = icon.icon;
    const isCustomSvg = activeTab === 'svg' && !icon.is_system;
    
    // Handler for drag start
    const handleDragStart = (e) => {
      e.stopPropagation();
      
      const dragData = {
        type: 'icon-element', // Identifier for icon drops
        iconType: activeTab, // 'heroicons', 'lucide', or 'svg'
        iconName: icon.name,
        iconCategory: icon.category,
        svgData: activeTab === 'svg' ? icon.svg_code : null,
        iconComponent: activeTab !== 'svg' ? icon.icon : null,
        libraryName: icon.library_name
      };
      
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
      e.dataTransfer.setData('application/json', JSON.stringify(dragData));
      
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
        border: 2px solid var(--color-primary);
        pointer-events: none;
        box-shadow: var(--shadow-lg);
      `;
      
      dragPreview.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="w-6 h-6">${activeTab === 'svg' ? icon.svgCode : ''}</div>
          <span style="font-size: 12px; color: var(--color-text);">${icon.name}</span>
        </div>
      `;
      
      document.body.appendChild(dragPreview);
      e.dataTransfer.setDragImage(dragPreview, 40, 20);
      
      setTimeout(() => {
        if (document.body.contains(dragPreview)) {
          document.body.removeChild(dragPreview);
        }
      }, 100);
    };
    
      return (
      <motion.div
        key={`${activeTab}-${icon.id || icon.name}-${index}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02 }}
        className="group relative bg-[var(--color-surface)] rounded-lg p-3 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5"
        onClick={() => handleIconSelect(icon)}
        draggable={true} // CRITICAL: Make draggable
        onDragStart={handleDragStart}
        title={`${icon.name}${icon.category ? ` - ${icon.category}` : ''} (Drag to canvas)`}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
            {activeTab === 'svg' ? (
              <div 
                className="w-6 h-6 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: icon.svg_code }}
              />
            ) : IconComponent ? (
              <IconComponent className="w-full h-full" />
            ) : null}
          </div>
          <div className="text-center">
            <div className="text-[10px] font-medium text-[var(--color-text)] truncate w-full max-w-[60px]">
              {icon.name}
            </div>
          </div>
          
          {/* SVG specific actions for custom icons */}
          {isCustomSvg && (
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSvg(icon.id);
                }}
                className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
        </div>
        
        {/* Selection indicator */}
        <div className="absolute inset-0 rounded-lg border-2 border-[var(--color-primary)] opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" />
        
        {/* Drag indicator badge */}
        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-4 h-4 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
            <Move className="w-2.5 h-2.5 text-white" />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-[var(--color-border)]">
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'svg' ? 'custom SVGs' : activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-0.5 bg-[var(--color-bg-muted)] rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-60">({tab.count})</span>
              </div>
            </button>
          ))}
        </div>

        {/* SVG Tab Actions */}
        {activeTab === 'svg' && (
          <div className="flex gap-2 mt-2">
            <label className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg"
                onChange={handleSvgUpload}
                className="hidden"
                disabled={uploading}
              />
              <div className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-[var(--color-primary)] text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{uploading ? 'Uploading...' : 'Upload'}</span>
              </div>
            </label>
            <button
              onClick={() => setShowDrawingTool(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Draw</span>
            </button>
          </div>
        )}
      </div>

      {/* Icons Grid */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 overflow-y-auto">
          <div className="p-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-[var(--color-text-muted)] text-xs">Loading icons...</p>
              </div>
            ) : filteredIcons.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                <AnimatePresence mode="popLayout">
                  {filteredIcons.map((icon, index) => renderIcon(icon, index))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center mb-3">
                  <Search className="w-6 h-6 text-[var(--color-text-muted)]" />
                </div>
                <h3 className="text-sm font-medium text-[var(--color-text)] mb-1">No icons found</h3>
                <p className="text-[var(--color-text-muted)] text-xs">
                  {searchTerm 
                    ? `No icons match "${searchTerm}"`
                    : `No ${activeTab} icons available`
                  }
                </p>
              </div>
            )}
          </div>
          
          {/* Gradient fade effect at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--color-bg)] to-transparent pointer-events-none" />
        </div>
      </div>

      {/* SVG Drawing Tool Modal */}
      <SvgDrawingTool
        isOpen={showDrawingTool}
        onClose={() => setShowDrawingTool(false)}
        onSave={handleDrawingSave}
      />
    </div>
  );
};

export default IconModal;