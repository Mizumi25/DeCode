import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, Upload, Plus, Trash2, Copy, Play,
  Heart, Star, Check, AlertCircle, Info, Home, User, Settings,
  Mail, Phone, Camera, Image, Pause, Volume2, VolumeX,
  Sun, Moon, Cloud, CloudRain, Zap, Flame, Snowflake,
  Car, Plane, Ship, Bike, Train, Bus, Truck,
  Code, Terminal, Database, Server, Wifi, Globe,
  ShoppingCart, CreditCard, DollarSign, TrendingUp, BarChart,
  Calendar, Clock, MapPin, Navigation, Compass, Flag,
  Book, Bookmark, FileText, Folder, Archive, Paperclip,
  Lock, Unlock, Shield, Eye, EyeOff, Key, UserCheck
} from 'lucide-react';
import * as HeroIcons from '@heroicons/react/24/outline';
import { useIconStore } from '@/stores/useIconStore';

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

  // Icon collections
  const lucideIcons = useMemo(() => [
    { name: 'Heart', icon: Heart, category: 'emotions' },
    { name: 'Star', icon: Star, category: 'actions' },
    { name: 'Check', icon: Check, category: 'actions' },
    { name: 'AlertCircle', icon: AlertCircle, category: 'feedback' },
    { name: 'Info', icon: Info, category: 'feedback' },
    { name: 'Home', icon: Home, category: 'navigation' },
    { name: 'User', icon: User, category: 'people' },
    { name: 'Settings', icon: Settings, category: 'system' },
    { name: 'Mail', icon: Mail, category: 'communication' },
    { name: 'Phone', icon: Phone, category: 'communication' },
    { name: 'Camera', icon: Camera, category: 'media' },
    { name: 'Image', icon: Image, category: 'media' },
    { name: 'Play', icon: Play, category: 'media' },
    { name: 'Pause', icon: Pause, category: 'media' },
    { name: 'Volume2', icon: Volume2, category: 'media' },
    { name: 'VolumeX', icon: VolumeX, category: 'media' },
    { name: 'Sun', icon: Sun, category: 'weather' },
    { name: 'Moon', icon: Moon, category: 'weather' },
    { name: 'Cloud', icon: Cloud, category: 'weather' },
    { name: 'CloudRain', icon: CloudRain, category: 'weather' },
    { name: 'Zap', icon: Zap, category: 'weather' },
    { name: 'Flame', icon: Flame, category: 'weather' },
    { name: 'Snowflake', icon: Snowflake, category: 'weather' },
    { name: 'Car', icon: Car, category: 'transport' },
    { name: 'Plane', icon: Plane, category: 'transport' },
    { name: 'Ship', icon: Ship, category: 'transport' },
    { name: 'Bike', icon: Bike, category: 'transport' },
    { name: 'Train', icon: Train, category: 'transport' },
    { name: 'Bus', icon: Bus, category: 'transport' },
    { name: 'Truck', icon: Truck, category: 'transport' },
    { name: 'Code', icon: Code, category: 'development' },
    { name: 'Terminal', icon: Terminal, category: 'development' },
    { name: 'Database', icon: Database, category: 'development' },
    { name: 'Server', icon: Server, category: 'development' },
    { name: 'Wifi', icon: Wifi, category: 'technology' },
    { name: 'Globe', icon: Globe, category: 'technology' },
    { name: 'ShoppingCart', icon: ShoppingCart, category: 'commerce' },
    { name: 'CreditCard', icon: CreditCard, category: 'commerce' },
    { name: 'DollarSign', icon: DollarSign, category: 'commerce' },
    { name: 'TrendingUp', icon: TrendingUp, category: 'charts' },
    { name: 'BarChart', icon: BarChart, category: 'charts' },
    { name: 'Calendar', icon: Calendar, category: 'time' },
    { name: 'Clock', icon: Clock, category: 'time' },
    { name: 'MapPin', icon: MapPin, category: 'location' },
    { name: 'Navigation', icon: Navigation, category: 'location' },
    { name: 'Compass', icon: Compass, category: 'location' },
    { name: 'Flag', icon: Flag, category: 'location' },
    { name: 'Book', icon: Book, category: 'documents' },
    { name: 'Bookmark', icon: Bookmark, category: 'documents' },
    { name: 'FileText', icon: FileText, category: 'documents' },
    { name: 'Folder', icon: Folder, category: 'documents' },
    { name: 'Archive', icon: Archive, category: 'documents' },
    { name: 'Paperclip', icon: Paperclip, category: 'documents' },
    { name: 'Lock', icon: Lock, category: 'security' },
    { name: 'Unlock', icon: Unlock, category: 'security' },
    { name: 'Shield', icon: Shield, category: 'security' },
    { name: 'Eye', icon: Eye, category: 'security' },
    { name: 'EyeOff', icon: EyeOff, category: 'security' },
    { name: 'Key', icon: Key, category: 'security' },
    { name: 'UserCheck', icon: UserCheck, category: 'security' }
  ], []);

  const heroIcons = useMemo(() => [
    { name: 'Home', icon: HeroIcons.HomeIcon, category: 'navigation' },
    { name: 'User', icon: HeroIcons.UserIcon, category: 'people' },
    { name: 'Cog', icon: HeroIcons.CogIcon, category: 'system' },
    { name: 'Bell', icon: HeroIcons.BellIcon, category: 'communication' },
    { name: 'Heart', icon: HeroIcons.HeartIcon, category: 'emotions' },
    { name: 'Star', icon: HeroIcons.StarIcon, category: 'actions' },
    { name: 'Check', icon: HeroIcons.CheckIcon, category: 'actions' },
    { name: 'X', icon: HeroIcons.XMarkIcon, category: 'actions' },
    { name: 'Plus', icon: HeroIcons.PlusIcon, category: 'actions' },
    { name: 'Minus', icon: HeroIcons.MinusIcon, category: 'actions' },
    { name: 'Trash', icon: HeroIcons.TrashIcon, category: 'actions' },
    { name: 'Pencil', icon: HeroIcons.PencilIcon, category: 'actions' },
    { name: 'Camera', icon: HeroIcons.CameraIcon, category: 'media' },
    { name: 'Photo', icon: HeroIcons.PhotoIcon, category: 'media' },
    { name: 'Play', icon: HeroIcons.PlayIcon, category: 'media' },
    { name: 'Pause', icon: HeroIcons.PauseIcon, category: 'media' },
    { name: 'Stop', icon: HeroIcons.StopIcon, category: 'media' },
    { name: 'SpeakerWave', icon: HeroIcons.SpeakerWaveIcon, category: 'media' },
    { name: 'SpeakerXMark', icon: HeroIcons.SpeakerXMarkIcon, category: 'media' },
    { name: 'Sun', icon: HeroIcons.SunIcon, category: 'weather' },
    { name: 'Moon', icon: HeroIcons.MoonIcon, category: 'weather' },
    { name: 'Cloud', icon: HeroIcons.CloudIcon, category: 'weather' },
    { name: 'Bolt', icon: HeroIcons.BoltIcon, category: 'weather' },
    { name: 'Fire', icon: HeroIcons.FireIcon, category: 'weather' },
    { name: 'ShoppingCart', icon: HeroIcons.ShoppingCartIcon, category: 'commerce' },
    { name: 'CreditCard', icon: HeroIcons.CreditCardIcon, category: 'commerce' },
    { name: 'BankNotes', icon: HeroIcons.BanknotesIcon, category: 'commerce' },
    { name: 'Chart', icon: HeroIcons.ChartBarIcon, category: 'charts' },
    { name: 'Calendar', icon: HeroIcons.CalendarIcon, category: 'time' },
    { name: 'Clock', icon: HeroIcons.ClockIcon, category: 'time' },
    { name: 'MapPin', icon: HeroIcons.MapPinIcon, category: 'location' },
    { name: 'Globe', icon: HeroIcons.GlobeAltIcon, category: 'location' },
    { name: 'Document', icon: HeroIcons.DocumentIcon, category: 'documents' },
    { name: 'Folder', icon: HeroIcons.FolderIcon, category: 'documents' },
    { name: 'Archive', icon: HeroIcons.ArchiveBoxIcon, category: 'documents' },
    { name: 'Lock', icon: HeroIcons.LockClosedIcon, category: 'security' },
    { name: 'Unlock', icon: HeroIcons.LockOpenIcon, category: 'security' },
    { name: 'Shield', icon: HeroIcons.ShieldCheckIcon, category: 'security' },
    { name: 'Eye', icon: HeroIcons.EyeIcon, category: 'security' },
    { name: 'EyeSlash', icon: HeroIcons.EyeSlashIcon, category: 'security' },
    { name: 'Key', icon: HeroIcons.KeyIcon, category: 'security' }
  ], []);

  const mockLottieAnimations = [
    { id: 1, name: 'Loading Spinner', category: 'loaders' },
    { id: 2, name: 'Heart Beat', category: 'emotions' },
    { id: 3, name: 'Checkmark Success', category: 'feedback' },
    { id: 4, name: 'Error Cross', category: 'feedback' },
    { id: 5, name: 'Arrow Right', category: 'navigation' },
    { id: 6, name: 'Bouncing Ball', category: 'loaders' },
  ];

  // Filter icons based on search term
  const filteredIcons = useMemo(() => {
    let icons = [];
    
    switch (activeTab) {
      case 'heroicons':
        icons = heroIcons;
        break;
      case 'lucide':
        icons = lucideIcons;
        break;
      case 'lottie':
        icons = mockLottieAnimations;
        break;
      case 'svg':
        icons = customSvgs;
        break;
      default:
        icons = [];
    }
    
    if (!searchTerm) return icons;
    
    return icons.filter(icon => 
      icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (icon.category && icon.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [activeTab, searchTerm, heroIcons, lucideIcons, customSvgs]);

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
  const handleSvgUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const svgContent = e.target.result;
        const newSvg = {
          name: file.name.replace('.svg', ''),
          category: 'custom',
          svgCode: svgContent,
          createdAt: new Date()
        };
        addCustomSvg(newSvg);
      };
      reader.readAsText(file);
    }
  };

  // Handle SVG Editor
  const handleSvgEditorSave = () => {
    const newSvg = {
      name: svgEditor.name,
      category: 'custom',
      svgCode: svgEditor.svgCode,
      createdAt: new Date()
    };
    addCustomSvg(newSvg);
    setSvgEditor({ ...svgEditor, isOpen: false });
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
    { id: 'lottie', label: 'Lottie', count: mockLottieAnimations.length },
    { id: 'svg', label: 'Custom SVG', count: customSvgs.length }
  ];

  const renderIcon = (icon, index) => {
    const IconComponent = icon.icon;
    
    return (
      <motion.div
        key={`${activeTab}-${icon.id || icon.name}-${index}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02 }}
        className="group relative bg-[var(--color-surface)] rounded-lg p-3 border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5"
        onClick={() => handleIconSelect(icon)}
        title={`${icon.name}${icon.category ? ` - ${icon.category}` : ''}`}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
            {activeTab === 'lottie' ? (
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                <Play className="w-3 h-3 text-white" />
              </div>
            ) : activeTab === 'svg' ? (
              <div 
                className="w-6 h-6 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: icon.svgCode }}
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
          
          {/* SVG specific actions */}
          {activeTab === 'svg' && (
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSvgCopy(icon.svgCode);
                  }}
                  className="p-0.5 bg-[var(--color-bg)] rounded shadow-sm hover:bg-[var(--color-bg-muted)] transition-colors"
                  title="Copy SVG"
                >
                  <Copy className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCustomSvg(icon.id);
                  }}
                  className="p-0.5 bg-red-50 text-red-600 rounded shadow-sm hover:bg-red-100 transition-colors"
                  title="Delete SVG"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Selection indicator */}
        <div className="absolute inset-0 rounded-lg border-2 border-[var(--color-primary)] opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" />
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
                type="file"
                accept=".svg"
                onChange={handleSvgUpload}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-[var(--color-primary)] text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
                <Upload className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Upload</span>
              </div>
            </label>
            <button
              onClick={() => setSvgEditor({ ...svgEditor, isOpen: true })}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Create</span>
            </button>
          </div>
        )}
      </div>

      {/* Icons Grid */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 overflow-y-auto">
          <div className="p-3">
            {filteredIcons.length > 0 ? (
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

      {/* SVG Editor Modal */}
      <AnimatePresence>
        {svgEditor.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setSvgEditor({ ...svgEditor, isOpen: false })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                <h3 className="text-lg font-semibold text-[var(--color-text)]">SVG Editor</h3>
                <button
                  onClick={() => setSvgEditor({ ...svgEditor, isOpen: false })}
                  className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 p-4 min-h-0">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Icon Name
                    </label>
                    <input
                      type="text"
                      value={svgEditor.name}
                      onChange={(e) => setSvgEditor({ ...svgEditor, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
                    <div className="flex flex-col min-h-0">
                      <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                        SVG Code
                      </label>
                      <textarea
                        value={svgEditor.svgCode}
                        onChange={(e) => setSvgEditor({ ...svgEditor, svgCode: e.target.value })}
                        className="flex-1 min-h-[200px] px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex flex-col min-h-0">
                      <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                        Preview
                      </label>
                      <div className="flex-1 min-h-[200px] border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-muted)] flex items-center justify-center">
                        <div 
                          className="w-24 h-24 flex items-center justify-center text-[var(--color-text)]"
                          dangerouslySetInnerHTML={{ __html: svgEditor.svgCode }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-[var(--color-border)] flex justify-end gap-2">
                <button
                  onClick={() => setSvgEditor({ ...svgEditor, isOpen: false })}
                  className="px-4 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSvgEditorSave}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Save Icon
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IconModal;