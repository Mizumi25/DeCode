import React from 'react';
import {
  FilePlus,
  FolderPlus,
  RefreshCw,
  FolderMinus,
  ChevronRight,
  ChevronDown,
  FileText,
  Box,
  Settings,
  Zap,
  Code2,
  Star,
  Coffee,
  Plus,
  GitBranch,
  Palette
} from 'lucide-react';

export default function ExplorerPanel() {
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}>
      {/* Explorer Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ 
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg-muted)'
        }}
      >
        <h3 className="font-semibold flex items-center space-x-2" style={{ color: 'var(--color-text)' }}>
          <Box style={{ color: 'var(--color-primary)' }} size={16} />
          <span className="text-xs uppercase tracking-wide">DeCode Project</span>
        </h3>
        <div className="flex space-x-1">
          <button
            className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all hover:scale-110"
            title="New File"
          >
            <FilePlus size={14} />
          </button>
          <button
            className="p-1.5 rounded-md bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-all hover:scale-110"
            title="New Folder"
          >
            <FolderPlus size={14} />
          </button>
          <button
            className="p-1.5 rounded-md bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-all hover:scale-110"
            title="Refresh Explorer"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* File Tree Area */}
      <div className="flex-grow overflow-y-auto p-4 text-sm space-y-2">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all group"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ChevronDown size={16} className="group-hover:text-blue-500" style={{ color: 'var(--color-text-muted)' }} />
            <Box size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="font-medium" style={{ color: 'var(--color-text)' }}>MyWebsiteProject</span>
            <Star size={12} className="text-yellow-400 ml-auto opacity-0 group-hover:opacity-100" />
          </div>
          
          <div className="ml-6 space-y-1">
            {/* src folder */}
            <div className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all group"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
              <Box size={14} style={{ color: 'var(--color-accent)' }} />
              <span style={{ color: 'var(--color-text)' }}>src</span>
            </div>
            <div className="ml-4 space-y-1">
              <div className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all group"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                <Box size={14} style={{ color: 'var(--color-accent)' }} />
                <span style={{ color: 'var(--color-text)' }}>components</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all group"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                <Box size={14} style={{ color: 'var(--color-accent)' }} />
                <span style={{ color: 'var(--color-text)' }}>layouts</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all group"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                <Box size={14} style={{ color: 'var(--color-accent)' }} />
                <span style={{ color: 'var(--color-text)' }}>pages</span>
              </div>
              
              {/* Files */}
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border cursor-pointer" style={{ borderColor: 'var(--color-primary-soft)' }}>
                <FileText size={14} className="text-blue-600" />
                <span className="font-medium text-blue-700">App.jsx</span>
                <div className="w-2 h-2 bg-green-400 rounded-full ml-auto animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all group"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <FileText size={14} style={{ color: 'var(--color-primary)' }} />
                <span style={{ color: 'var(--color-text)' }}>main.jsx</span>
                <Coffee size={12} className="text-amber-500 ml-auto opacity-0 group-hover:opacity-100" />
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all group"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Code2 size={14} style={{ color: '#e34c26' }} />
                <span style={{ color: 'var(--color-text)' }}>index.html</span>
              </div>
            </div>

            {/* public folder */}
            <div className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
              <Box size={14} className="text-green-500" />
              <span style={{ color: 'var(--color-text)' }}>public</span>
            </div>

            {/* Config files */}
            <div className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Settings size={14} style={{ color: '#41a6b5' }} />
              <span style={{ color: 'var(--color-text)' }}>.env</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Settings size={14} style={{ color: '#e8bf6a' }} />
              <span style={{ color: 'var(--color-text)' }}>package.json</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <FileText size={14} style={{ color: 'var(--color-primary)' }} />
              <span style={{ color: 'var(--color-text)' }}>tailwind.config.js</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Zap size={14} style={{ color: '#e8bf6a' }} />
              <span style={{ color: 'var(--color-text)' }}>vite.config.js</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div 
        className="border-t p-4"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-muted)' }}
      >
        <h4 className="text-xs font-semibold mb-3 uppercase tracking-wide flex items-center space-x-1" style={{ color: 'var(--color-text-muted)' }}>
          <Palette size={12} />
          <span>Quick Actions</span>
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all hover:scale-105">
            <Plus size={14} />
            <span className="text-xs">New File</span>
          </button>
          <button className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-600 hover:from-green-500/20 hover:to-emerald-500/20 transition-all hover:scale-105">
            <GitBranch size={14} />
            <span className="text-xs">Git</span>
          </button>
        </div>
      </div>
    </div>
  );
}