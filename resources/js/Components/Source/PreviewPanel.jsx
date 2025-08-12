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
  Grid3X3,
  Sparkles,
  Palette
} from 'lucide-react';

export default function PreviewPanel({ previewMode, setPreviewMode }) {
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}>
      {/* Preview Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ 
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg-muted)'
        }}
      >
        <div className="flex items-center space-x-2">
          <Eye size={16} style={{ color: 'var(--color-primary)' }} />
          <span className="text-sm font-semibold uppercase tracking-wide">Live Preview</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setPreviewMode('desktop')}
            className={`p-1.5 rounded-md transition-all hover:scale-110 ${
              previewMode === 'desktop' 
                ? 'text-white shadow-lg' 
                : 'hover:text-[var(--color-primary)]'
            }`}
            style={{
              backgroundColor: previewMode === 'desktop' ? 'var(--color-primary)' : 'var(--color-primary-soft)',
              color: previewMode === 'desktop' ? 'white' : 'var(--color-primary)'
            }}
            title="Desktop View"
          >
            <Monitor size={14} />
          </button>
          <button
            onClick={() => setPreviewMode('tablet')}
            className={`p-1.5 rounded-md transition-all hover:scale-110 ${
              previewMode === 'tablet' 
                ? 'text-white shadow-lg' 
                : 'hover:text-[var(--color-primary)]'
            }`}
            style={{
              backgroundColor: previewMode === 'tablet' ? 'var(--color-primary)' : 'var(--color-primary-soft)',
              color: previewMode === 'tablet' ? 'white' : 'var(--color-primary)'
            }}
            title="Tablet View"
          >
            <Tablet size={14} />
          </button>
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`p-1.5 rounded-md transition-all hover:scale-110 ${
              previewMode === 'mobile' 
                ? 'text-white shadow-lg' 
                : 'hover:text-[var(--color-primary)]'
            }`}
            style={{
              backgroundColor: previewMode === 'mobile' ? 'var(--color-primary)' : 'var(--color-primary-soft)',
              color: previewMode === 'mobile' ? 'white' : 'var(--color-primary)'
            }}
            title="Mobile View"
          >
            <Smartphone size={14} />
          </button>
          <div className="w-px h-4 bg-slate-300 mx-2"></div>
          <button
            className="p-1.5 rounded-md transition-all hover:scale-110 hover:text-[var(--color-primary)]"
            style={{
              backgroundColor: 'var(--color-bg-muted)',
              color: 'var(--color-text-muted)'
            }}
            title="Refresh Preview"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-grow p-4">
        <div className="h-64 rounded-xl shadow-inner p-6 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
          <div className={`h-full transition-all duration-300 ${
            previewMode === 'mobile' ? 'max-w-[300px] mx-auto' :
            previewMode === 'tablet' ? 'max-w-[500px] mx-auto' : 'w-full'
          } rounded-lg p-4 shadow-lg`} style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles style={{ color: 'var(--color-primary)' }} size={20} />
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>DeCode Studio</h2>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>A beautiful website builder with magical code generation ✨</p>
              <button className="w-full py-2 px-4 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105 text-white bg-gradient-to-r from-blue-500 to-purple-500">
                Get Started
              </button>
              
              {/* Mock content grid */}
              <div className="grid grid-cols-1 gap-2 mt-4">
                <div className="p-2 rounded-lg shadow-sm" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                  <div className="flex items-center space-x-2">
                    <Layers style={{ color: 'var(--color-primary)' }} size={16} />
                    <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Visual Design</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg shadow-sm" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                  <div className="flex items-center space-x-2">
                    <Code2 className="text-green-500" size={16} />
                    <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Code Generation</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg shadow-sm" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                  <div className="flex items-center space-x-2">
                    <Eye style={{ color: 'var(--color-primary)' }} size={16} />
                    <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Live Preview</span>
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
        <h4 className="text-xs font-semibold uppercase tracking-wide flex items-center space-x-1" style={{ color: 'var(--color-text-muted)' }}>
          <Palette size={12} />
          <span>Component Library</span>
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div 
            className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all hover:scale-105 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 hover:from-blue-500/20 hover:to-cyan-500/20 shadow-sm"
          >
            <Type size={14} />
            <span className="text-xs font-medium">Text</span>
          </div>
          <div 
            className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all hover:scale-105 bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-600 hover:from-green-500/20 hover:to-emerald-500/20 shadow-sm"
          >
            <MousePointer size={14} />
            <span className="text-xs font-medium">Button</span>
          </div>
          <div 
            className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all hover:scale-105 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 hover:from-purple-500/20 hover:to-pink-500/20 shadow-sm"
          >
            <Image size={14} />
            <span className="text-xs font-medium">Image</span>
          </div>
          <div 
            className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all hover:scale-105 bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-600 hover:from-orange-500/20 hover:to-red-500/20 shadow-sm"
          >
            <Grid3X3 size={14} />
            <span className="text-xs font-medium">Grid</span>
          </div>
        </div>
      </div>
    </div>
  );
}