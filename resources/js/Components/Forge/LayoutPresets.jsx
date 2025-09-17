import React, { useState } from 'react';
import { 
  Layout, 
  Grid3X3, 
  Columns, 
  Rows, 
  Square, 
  Circle,
  AlignCenter,
  AlignLeft,
  AlignRight,
  MoreHorizontal,
  Layers,
  Zap
} from 'lucide-react';

const LayoutPresets = ({ onApplyPreset, selectedComponent, componentLibraryService }) => {
  const [activeCategory, setActiveCategory] = useState('flex');
  
  // Layout preset definitions with visual previews
  const layoutPresets = {
    flex: [
      {
        id: 'flex-center',
        name: 'Center Content',
        description: 'Perfect centering with flexbox',
        icon: AlignCenter,
        preview: 'flex-center-preview',
        styles: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px'
        },
        category: 'flex'
      },
      {
        id: 'flex-space-between',
        name: 'Space Between',
        description: 'Items at start and end',
        icon: MoreHorizontal,
        preview: 'flex-space-between-preview',
        styles: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px'
        },
        category: 'flex'
      },
      {
        id: 'flex-column-stack',
        name: 'Vertical Stack',
        description: 'Stack items vertically',
        icon: Rows,
        preview: 'flex-column-preview',
        styles: {
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          alignItems: 'stretch'
        },
        category: 'flex'
      },
      {
        id: 'flex-row-spread',
        name: 'Horizontal Row',
        description: 'Items in a row with gaps',
        icon: Columns,
        preview: 'flex-row-preview',
        styles: {
          display: 'flex',
          flexDirection: 'row',
          gap: '20px',
          alignItems: 'center'
        },
        category: 'flex'
      },
      {
        id: 'flex-wrap-cards',
        name: 'Wrap Cards',
        description: 'Responsive card layout',
        icon: Square,
        preview: 'flex-wrap-preview',
        styles: {
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'flex-start'
        },
        category: 'flex'
      },
      {
        id: 'flex-sidebar-content',
        name: 'Sidebar + Content',
        description: 'Classic sidebar layout',
        icon: Layout,
        preview: 'flex-sidebar-preview',
        styles: {
          display: 'flex',
          gap: '24px',
          alignItems: 'stretch'
        },
        category: 'flex'
      }
    ],
    grid: [
      {
        id: 'grid-auto-fit',
        name: 'Auto-Fit Grid',
        description: 'Responsive auto-sizing grid',
        icon: Grid3X3,
        preview: 'grid-auto-fit-preview',
        styles: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        },
        category: 'grid'
      },
      {
        id: 'grid-3-column',
        name: '3 Column Grid',
        description: 'Fixed 3-column layout',
        icon: Columns,
        preview: 'grid-3col-preview',
        styles: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '20px'
        },
        category: 'grid'
      },
      {
        id: 'grid-hero-sidebar',
        name: 'Hero + Sidebar',
        description: 'Large content with sidebar',
        icon: Layout,
        preview: 'grid-hero-preview',
        styles: {
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '32px',
          minHeight: '400px'
        },
        category: 'grid'
      },
      {
        id: 'grid-masonry',
        name: 'Masonry Layout',
        description: 'Pinterest-style layout',
        icon: Layers,
        preview: 'grid-masonry-preview',
        styles: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gridAutoRows: 'max-content',
          gap: '16px'
        },
        category: 'grid'
      },
      {
        id: 'grid-dashboard',
        name: 'Dashboard Grid',
        description: 'Complex dashboard layout',
        icon: Square,
        preview: 'grid-dashboard-preview',
        styles: {
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'auto auto 1fr',
          gap: '20px',
          gridTemplateAreas: `
            "header header header header"
            "sidebar main main aside"
            "sidebar main main aside"
          `
        },
        category: 'grid'
      }
    ],
    positioning: [
      {
        id: 'absolute-overlay',
        name: 'Overlay Content',
        description: 'Absolute positioned overlay',
        icon: Layers,
        preview: 'absolute-overlay-preview',
        styles: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10
        },
        category: 'positioning'
      },
      {
        id: 'fixed-header',
        name: 'Fixed Header',
        description: 'Sticky navigation bar',
        icon: AlignCenter,
        preview: 'fixed-header-preview',
        styles: {
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          zIndex: 1000,
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb'
        },
        category: 'positioning'
      },
      {
        id: 'sticky-sidebar',
        name: 'Sticky Sidebar',
        description: 'Sidebar that sticks on scroll',
        icon: AlignLeft,
        preview: 'sticky-sidebar-preview',
        styles: {
          position: 'sticky',
          top: '20px',
          height: 'fit-content'
        },
        category: 'positioning'
      }
    ],
    common: [
      {
        id: 'full-width-hero',
        name: 'Hero Section',
        description: 'Full-width hero with centering',
        icon: Square,
        preview: 'hero-preview',
        styles: {
          width: '100%',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '80px 20px'
        },
        category: 'common'
      },
      {
        id: 'card-container',
        name: 'Card Container',
        description: 'Standard card with padding',
        icon: Square,
        preview: 'card-preview',
        styles: {
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        },
        category: 'common'
      },
      {
        id: 'button-group',
        name: 'Button Group',
        description: 'Horizontal button layout',
        icon: MoreHorizontal,
        preview: 'button-group-preview',
        styles: {
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        },
        category: 'common'
      }
    ]
  };

  // Visual preview components for each preset
  const PresetPreview = ({ presetId }) => {
    const previewStyles = {
      'flex-center-preview': (
        <div className="w-full h-16 bg-gray-100 border rounded flex items-center justify-center">
          <div className="w-8 h-8 bg-blue-500 rounded"></div>
        </div>
      ),
      'flex-space-between-preview': (
        <div className="w-full h-16 bg-gray-100 border rounded flex items-center justify-between px-3">
          <div className="w-6 h-6 bg-blue-500 rounded"></div>
          <div className="w-6 h-6 bg-green-500 rounded"></div>
        </div>
      ),
      'flex-column-preview': (
        <div className="w-full h-20 bg-gray-100 border rounded flex flex-col items-center justify-center gap-1 p-2">
          <div className="w-8 h-3 bg-blue-500 rounded"></div>
          <div className="w-8 h-3 bg-green-500 rounded"></div>
          <div className="w-8 h-3 bg-purple-500 rounded"></div>
        </div>
      ),
      'flex-row-preview': (
        <div className="w-full h-16 bg-gray-100 border rounded flex items-center justify-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded"></div>
          <div className="w-6 h-6 bg-green-500 rounded"></div>
          <div className="w-6 h-6 bg-purple-500 rounded"></div>
        </div>
      ),
      'flex-wrap-preview': (
        <div className="w-full h-16 bg-gray-100 border rounded flex flex-wrap content-start gap-1 p-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
        </div>
      ),
      'flex-sidebar-preview': (
        <div className="w-full h-16 bg-gray-100 border rounded flex gap-1 p-1">
          <div className="w-4 bg-blue-500 rounded"></div>
          <div className="flex-1 bg-green-500 rounded"></div>
        </div>
      ),
      'grid-auto-fit-preview': (
        <div className="w-full h-16 bg-gray-100 border rounded grid grid-cols-3 gap-1 p-1">
          <div className="bg-blue-500 rounded"></div>
          <div className="bg-green-500 rounded"></div>
          <div className="bg-purple-500 rounded"></div>
        </div>
      ),
      'grid-3col-preview': (
        <div className="w-full h-16 bg-gray-100 border rounded grid grid-cols-3 gap-1 p-1">
          <div className="bg-blue-500 rounded"></div>
          <div className="bg-green-500 rounded"></div>
          <div className="bg-purple-500 rounded"></div>
        </div>
      ),
      'grid-hero-preview': (
        <div className="w-full h-16 bg-gray-100 border rounded grid grid-cols-3 gap-1 p-1">
          <div className="col-span-2 bg-blue-500 rounded"></div>
          <div className="bg-green-500 rounded"></div>
        </div>
      ),
      'grid-masonry-preview': (
        <div className="w-full h-16 bg-gray-100 border rounded grid grid-cols-4 gap-1 p-1">
          <div className="bg-blue-500 rounded h-6"></div>
          <div className="bg-green-500 rounded h-8"></div>
          <div className="bg-purple-500 rounded h-4"></div>
          <div className="bg-red-500 rounded h-7"></div>
        </div>
      ),
      'grid-dashboard-preview': (
        <div className="w-full h-16 bg-gray-100 border rounded p-1">
          <div className="grid grid-cols-4 grid-rows-3 gap-1 h-full">
            <div className="col-span-4 bg-blue-500 rounded"></div>
            <div className="bg-green-500 rounded"></div>
            <div className="col-span-2 bg-purple-500 rounded"></div>
            <div className="bg-red-500 rounded"></div>
          </div>
        </div>
      ),
      'absolute-overlay-preview': (
        <div className="w-full h-16 bg-gray-100 border rounded relative">
          <div className="absolute inset-2 bg-blue-500 rounded opacity-75"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full"></div>
        </div>
      ),
      'fixed-header-preview': (
        <div className="w-full h-16 bg-gray-100 border rounded relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-4 bg-blue-500"></div>
          <div className="pt-5 p-2 text-xs text-gray-600">Content below</div>
        </div>
      ),
      'sticky-sidebar-preview': (
        <div className="w-full h-16 bg-gray-100 border rounded flex gap-1 p-1">
          <div className="w-6 bg-blue-500 rounded"></div>
          <div className="flex-1 bg-gray-200 rounded"></div>
        </div>
      ),
      'hero-preview': (
        <div className="w-full h-16 bg-gradient-to-r from-blue-500 to-purple-500 border rounded flex items-center justify-center">
          <div className="text-white text-xs">Hero Content</div>
        </div>
      ),
      'card-preview': (
        <div className="w-full h-16 bg-white border-2 border-gray-200 rounded-lg p-2 shadow-sm">
          <div className="w-full h-full bg-gray-100 rounded"></div>
        </div>
      ),
      'button-group-preview': (
        <div className="w-full h-16 bg-gray-100 border rounded flex items-center justify-center gap-1">
          <div className="w-8 h-4 bg-blue-500 rounded-sm"></div>
          <div className="w-8 h-4 bg-gray-400 rounded-sm"></div>
          <div className="w-8 h-4 bg-green-500 rounded-sm"></div>
        </div>
      )
    };

    return previewStyles[presetId] || (
      <div className="w-full h-16 bg-gray-100 border rounded flex items-center justify-center">
        <div className="text-xs text-gray-500">Preview</div>
      </div>
    );
  };

  // Apply preset to selected component
  const handleApplyPreset = (preset) => {
    if (!selectedComponent) {
      alert('Please select a component first');
      return;
    }

    // Apply all styles from the preset
    Object.entries(preset.styles).forEach(([property, value]) => {
      onApplyPreset(selectedComponent, property, value, 'style');
    });
  };

  // Categories for organizing presets
  const categories = [
    { id: 'flex', label: 'Flexbox', icon: Columns },
    { id: 'grid', label: 'Grid', icon: Grid3X3 },
    { id: 'positioning', label: 'Position', icon: Layers },
    { id: 'common', label: 'Common', icon: Square }
  ];

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Preset Grid */}
      <div className="grid grid-cols-1 gap-3">
        {layoutPresets[activeCategory].map((preset) => {
          const Icon = preset.icon;
          return (
            <div
              key={preset.id}
              className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => handleApplyPreset(preset)}
            >
              {/* Preset Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{preset.name}</h4>
                    <p className="text-xs text-gray-500">{preset.description}</p>
                  </div>
                </div>
                <Zap className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>

              {/* Visual Preview */}
              <div className="mb-3">
                <PresetPreview presetId={preset.preview} />
              </div>

              {/* Style Properties Preview */}
              <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                <div className="font-mono">
                  {Object.entries(preset.styles).slice(0, 3).map(([key, value], index) => (
                    <div key={key}>
                      {index > 0 && ', '}
                      <span className="text-blue-600">{key}</span>: {value}
                    </div>
                  ))}
                  {Object.keys(preset.styles).length > 3 && (
                    <div className="text-gray-400">...and {Object.keys(preset.styles).length - 3} more</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 text-center p-3 bg-blue-50 rounded-lg">
        <Zap className="w-4 h-4 inline mr-1" />
        Select a component and click a preset to apply the layout instantly
      </div>
    </div>
  );
};

export default LayoutPresets;