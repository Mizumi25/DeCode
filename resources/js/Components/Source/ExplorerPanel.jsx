import React, { useState, useEffect } from 'react';
import {
  FilePlus,
  FolderPlus,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  FolderOpen,
  Settings,
  Zap,
  Code2,
  Plus,
  GitBranch,
  Palette,
  File
} from 'lucide-react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

// File icon mapping
const getFileIcon = (fileName, extension) => {
  const iconMap = {
    jsx: { icon: Code2, color: '#61dafb' },
    js: { icon: Code2, color: '#f7df1e' },
    html: { icon: Code2, color: '#e34c26' },
    css: { icon: FileText, color: '#264de4' },
    json: { icon: Settings, color: '#e8bf6a' },
    config: { icon: Settings, color: '#41a6b5' },
  };
  
  if (fileName === 'package.json') return { icon: Settings, color: '#e8bf6a' };
  if (fileName === 'vite.config.js') return { icon: Zap, color: '#646cff' };
  if (fileName === 'tailwind.config.js') return { icon: FileText, color: '#38bdf8' };
  
  return iconMap[extension] || { icon: File, color: 'var(--color-text-muted)' };
};

// File tree item component
const FileTreeItem = ({ item, level = 0, onFileClick, expandedFolders, toggleFolder }) => {
  const isExpanded = expandedFolders[item.path];
  const Icon = item.type === 'directory' ? (isExpanded ? FolderOpen : Folder) : getFileIcon(item.name, item.extension).icon;
  const iconColor = item.type === 'directory' ? '#4a9eff' : getFileIcon(item.name, item.extension).color;
  
  const handleClick = () => {
    if (item.type === 'directory') {
      toggleFolder(item.path);
    } else {
      onFileClick(item);
    }
  };
  
  return (
    <>
      <div
        className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all group"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        onClick={handleClick}
      >
        {item.type === 'directory' && (
          isExpanded ? 
            <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} /> :
            <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
        )}
        <Icon size={14} style={{ color: iconColor }} />
        <span style={{ color: 'var(--color-text)' }} className="text-sm">
          {item.name}
          {item.isFrame && <span className="ml-2 text-xs text-blue-500">(Frame)</span>}
        </span>
      </div>
      
      {item.type === 'directory' && isExpanded && item.children && (
        <div>
          {item.children.map((child, idx) => (
            <FileTreeItem
              key={child.path + idx}
              item={child}
              level={level + 1}
              onFileClick={onFileClick}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default function ExplorerPanel({ onFileClick }) {
  const { props } = usePage();
  const project = props.project;
  const frame = props.frame; // 🔥 Get current frame from props
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [framework, setFramework] = useState('react');
  const [currentFrame, setCurrentFrame] = useState(null);
  
  // Load project files (frame-scoped)
  useEffect(() => {
    if (project?.uuid && frame?.uuid) {
      loadProjectFiles();
    }
  }, [project?.uuid, frame?.uuid]);
  
  const loadProjectFiles = async () => {
    try {
      setLoading(true);
      // 🔥 Pass frame_id to get frame-scoped files
      const response = await axios.get(`/projects/${project.uuid}/files`, {
        params: {
          frame_id: frame.uuid
        }
      });
      
      if (response.data.success) {
        setFiles(response.data.files);
        setFramework(response.data.framework);
        setCurrentFrame(response.data.currentFrame);
        
        // Auto-expand common folders
        const autoExpand = {};
        response.data.files.forEach(item => {
          if (item.type === 'directory' && ['src', 'styles', 'scripts'].includes(item.name)) {
            autoExpand[item.path] = true;
            // Also expand nested folders
            if (item.children) {
              item.children.forEach(child => {
                if (child.type === 'directory') {
                  autoExpand[child.path] = true;
                }
              });
            }
          }
        });
        setExpandedFolders(autoExpand);
      }
    } catch (error) {
      console.error('Failed to load project files:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleFolder = (path) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };
  
  const handleFileClick = (file) => {
    if (onFileClick) {
      onFileClick(file);
    }
  };
  
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}>
      {/* Explorer Header */}
      <div 
        className="border-b"
        style={{ 
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg-muted)'
        }}
      >
        {/* Project Name */}
        <div className="flex items-center justify-between p-4">
          <h3 className="font-semibold flex items-center space-x-2" style={{ color: 'var(--color-text)' }}>
            <Folder style={{ color: 'var(--color-primary)' }} size={16} />
            <span className="text-xs uppercase tracking-wide">{project?.name || 'Project'}</span>
          </h3>
          <button
            className="p-1.5 rounded-md bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-all hover:scale-110"
            title="Refresh Explorer"
            onClick={loadProjectFiles}
          >
            <RefreshCw size={14} />
          </button>
        </div>
        
        {/* 🔥 Current Frame Context Indicator */}
        {currentFrame && (
          <div 
            className="px-4 py-2 border-t"
            style={{ 
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-primary-soft)'
            }}
          >
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Code2 size={12} style={{ color: 'var(--color-primary)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                  Editing:
                </span>
              </div>
              <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                {currentFrame.name}
              </span>
            </div>
            <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Frame-scoped view • Other frames hidden
            </p>
          </div>
        )}
      </div>

      {/* File Tree Area */}
      <div className="flex-grow overflow-y-auto p-2 text-sm">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* 🔥 Shared Boilerplate Section */}
            <div>
              <div className="px-2 py-1 mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  Shared Files
                </span>
              </div>
              {files.filter(item => !item.isFrame).map((item, idx) => (
                <FileTreeItem
                  key={item.path + idx}
                  item={item}
                  level={0}
                  onFileClick={handleFileClick}
                  expandedFolders={expandedFolders}
                  toggleFolder={toggleFolder}
                />
              ))}
            </div>
            
            {/* 🔥 Current Frame Section */}
            {files.some(item => item.isFrame) && (
              <div>
                <div className="px-2 py-1 mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
                    Current Frame
                  </span>
                </div>
                {files.filter(item => item.isFrame).map((item, idx) => (
                  <FileTreeItem
                    key={item.path + idx}
                    item={item}
                    level={0}
                    onFileClick={handleFileClick}
                    expandedFolders={expandedFolders}
                    toggleFolder={toggleFolder}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div 
        className="border-t p-4"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-muted)' }}
      >
        <h4 className="text-xs font-semibold mb-3 uppercase tracking-wide flex items-center space-x-1" style={{ color: 'var(--color-text-muted)' }}>
          <Palette size={12} />
          <span>Framework</span>
        </h4>
        <div className="text-xs px-3 py-2 rounded-lg bg-blue-500/10 text-blue-600 font-medium">
          {framework === 'react' ? 'React + Vite' : 'HTML + CSS'}
        </div>
      </div>
    </div>
  );
}