import React from 'react';
import {
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Layers,
  Code2,
  Type,
  MousePointer,
  Image,
  Grid3X3
} from 'lucide-react';

export default function PreviewPanel({ previewMode, setPreviewMode }) {
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}>
      {/* Preview Header */}
      <div 
        className="flex items-center justify-between p-3 border-b"
        style={{ 
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg-muted)'
        }}
      >
        <div className="flex items-center space-x-2">
          <Eye size={16} style={{ color: 'var(--color-primary)' }} />
          <span className="text-sm font-medium">Live Preview</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPreviewMode('desktop')}
            className={`p-1 rounded transition-colors ${previewMode === 'desktop' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
            title="Desktop View"
          >
            <Monitor size={16} />
          </button>
          <button
            onClick={() => setPreviewMode('tablet')}
            className={`p-1 rounded transition-colors ${previewMode === 'tablet' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
            title="Tablet View"
          >
            <Tablet size={16} />
          </button>
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`p-1 rounded transition-colors ${previewMode === 'mobile' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
            title="Mobile View"
          >
            <Smartphone size={16} />
          </button>
          <div className="w-px h-4" style={{ backgroundColor: 'var(--color-border)' }}></div>
          <button
            className="p-1 rounded transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            title="Refresh Preview"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-grow p-2">
        <div 
          className="h-full rounded-lg shadow-lg overflow-hidden"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className={`h-full transition-all duration-300 ${
            previewMode === 'mobile' ? 'max-w-[375px] mx-auto' :
            previewMode === 'tablet' ? 'max-w-[768px] mx-auto' : 'w-full'
          }`}>
            {/* Mock Preview Content */}
            <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 h-full">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">Welcome to DeCode</h1>
                <p className="text-lg text-gray-600 mb-8">
                  A powerful website builder with visual design and code generation capabilities.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg mb-4 flex items-center justify-center">
                      <Layers className="text-white" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Visual Design</h3>
                    <p className="text-gray-600 text-sm">Design with drag and drop components</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="w-12 h-12 bg-green-500 rounded-lg mb-4 flex items-center justify-center">
                      <Code2 className="text-white" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Code Generation</h3>
                    <p className="text-gray-600 text-sm">Automatically generate clean code</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg mb-4 flex items-center justify-center">
                      <Eye className="text-white" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Live Preview</h3>
                    <p className="text-gray-600 text-sm">See changes in real-time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Component Library Section */}
      <div 
        className="border-t p-4 space-y-3"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-muted)' }}
      >
        <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>COMPONENT LIBRARY</h4>
        <div className="grid grid-cols-2 gap-2">
          <div 
            className="flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors border"
            style={{ 
              borderColor: 'var(--color-border)', 
              backgroundColor: 'var(--color-surface)'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-surface)'}
          >
            <Type size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="text-xs">Text</span>
          </div>
          <div 
            className="flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors border"
            style={{ 
              borderColor: 'var(--color-border)', 
              backgroundColor: 'var(--color-surface)'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-surface)'}
          >
            <MousePointer size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="text-xs">Button</span>
          </div>
          <div 
            className="flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors border"
            style={{ 
              borderColor: 'var(--color-border)', 
              backgroundColor: 'var(--color-surface)'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-surface)'}
          >
            <Image size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="text-xs">Image</span>
          </div>
          <div 
            className="flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors border"
            style={{ 
              borderColor: 'var(--color-border)', 
              backgroundColor: 'var(--color-surface)'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-bg-muted)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-surface)'}
          >
            <Grid3X3 size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="text-xs">Grid</span>
          </div>
        </div>
      </div>
    </div>
  );
}