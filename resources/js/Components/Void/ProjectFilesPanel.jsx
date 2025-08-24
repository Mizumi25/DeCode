// @/Components/Void/ProjectFilesPanel.jsx
import React, { useState } from 'react'
import { FolderOpen, Folder, File, ChevronRight, ChevronDown, Plus } from 'lucide-react'

export default function ProjectFilesPanel() {
  const [expandedFolders, setExpandedFolders] = useState(['src', 'components'])

  const toggleFolder = (folderName) => {
    setExpandedFolders(prev => 
      prev.includes(folderName) 
        ? prev.filter(f => f !== folderName)
        : [...prev, folderName]
    )
  }

  const FileTree = ({ items, level = 0 }) => {
    return items.map((item) => (
      <div key={item.name} style={{ marginLeft: `${level * 16}px` }}>
        {item.type === 'folder' ? (
          <div>
            <div 
              className="flex items-center gap-2 p-1 hover:bg-[var(--color-bg-hover)] rounded cursor-pointer"
              onClick={() => toggleFolder(item.name)}
            >
              {expandedFolders.includes(item.name) ? (
                <ChevronDown className="w-3 h-3 text-[var(--color-text-muted)]" />
              ) : (
                <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)]" />
              )}
              <Folder className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-sm text-[var(--color-text)]">{item.name}</span>
            </div>
            {expandedFolders.includes(item.name) && item.children && (
              <FileTree items={item.children} level={level + 1} />
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 p-1 hover:bg-[var(--color-bg-hover)] rounded cursor-pointer">
            <div className="w-3 h-3" />
            <File className="w-4 h-4 text-[var(--color-text-muted)]" />
            <span className="text-sm text-[var(--color-text)]">{item.name}</span>
            <span className="ml-auto text-xs text-[var(--color-text-muted)]">{item.size}</span>
          </div>
        )}
      </div>
    ))
  }

  const fileStructure = [
    {
      name: 'src',
      type: 'folder',
      children: [
        {
          name: 'components',
          type: 'folder',
          children: [
            { name: 'Header.jsx', type: 'file', size: '2.4kb' },
            { name: 'Footer.jsx', type: 'file', size: '1.8kb' },
            { name: 'Button.jsx', type: 'file', size: '1.2kb' }
          ]
        },
        {
          name: 'pages',
          type: 'folder',
          children: [
            { name: 'HomePage.jsx', type: 'file', size: '4.2kb' },
            { name: 'AboutPage.jsx', type: 'file', size: '3.1kb' }
          ]
        },
        { name: 'App.jsx', type: 'file', size: '5.2kb' },
        { name: 'index.js', type: 'file', size: '0.8kb' }
      ]
    },
    {
      name: 'public',
      type: 'folder',
      children: [
        { name: 'index.html', type: 'file', size: '1.5kb' },
        { name: 'favicon.ico', type: 'file', size: '4.2kb' }
      ]
    },
    { name: 'package.json', type: 'file', size: '2.1kb' },
    { name: 'README.md', type: 'file', size: '1.8kb' }
  ]

  return (
    <div className="h-full">
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-[var(--color-text)]">Project Files</h4>
          <button 
            className="p-1 rounded hover:bg-[var(--color-bg-hover)]"
            style={{ color: 'var(--color-primary)' }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-[var(--color-text-muted)]">
          24 files • 156.7kb total
        </div>
      </div>

      <div className="overflow-y-auto h-full pb-20">
        <div className="p-4">
          <FileTree items={fileStructure} />
        </div>
      </div>
    </div>
  )
}