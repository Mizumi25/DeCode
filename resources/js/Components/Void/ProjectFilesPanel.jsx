// @/Components/Void/ProjectFilesPanel.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { FolderOpen, Folder, File, ChevronRight, ChevronDown, Plus, RefreshCw, FileText, Box } from 'lucide-react'
import { GitHubService } from '@/Services/GithubService' // existing client-side service

export default function ProjectFilesPanel({ project }) {
  const [expandedFolders, setExpandedFolders] = useState(['src', 'components'])
  const [tree, setTree] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [repoName, setRepoName] = useState(null)

  const frontendExts = new Set(['html','htm','jsx','tsx','js','ts','vue','css','scss','sass','less','styl'])

  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => prev.includes(folderPath) ? prev.filter(f => f !== folderPath) : [...prev, folderPath])
  }

  // Utility: build nested tree from flat file list
  const buildTreeFromFiles = (files, startPath = '') => {
    const root = {}
    files.forEach(f => {
      const relative = startPath && f.path.startsWith(startPath + '/') ? f.path.slice(startPath.length + 1) : (startPath ? null : f.path)
      if (startPath && relative === null) return
      const parts = (relative || f.path).split('/')
      let node = root
      parts.forEach((part, idx) => {
        if (!node[part]) {
          node[part] = { __meta: { name: part, path: parts.slice(0, idx + 1).join('/'), type: idx === parts.length -1 && f.type === 'file' ? 'file' : 'dir' }, __children: {} }
        }
        if (idx < parts.length -1) {
          node = node[part].__children
        } else {
          // leaf file
          if (f.type === 'file') {
            node[part].__meta.type = 'file'
            node[part].__meta.size = f.size
          }
        }
      })
    })
    // convert to array
    const toArray = (obj) => Object.values(obj).map(item => {
      const children = toArray(item.__children)
      return {
        name: item.__meta.name,
        path: item.__meta.path,
        type: item.__meta.type === 'file' && children.length === 0 ? 'file' : 'folder',
        size: item.__meta.size || 0,
        children
      }
    })
    return toArray(root)
  }

  // Load repo files when project is GitHub-imported
  useEffect(() => {
    let mounted = true
    const loadRepo = async () => {
      setError(null)
      setLoading(true)
      setTree([])
      try {
        const imported = project?.settings?.imported_from_github || !!project?.settings?.original_repo
        if (!imported) {
          setLoading(false)
          return
        }

        const repoInfo = project?.settings?.original_repo || {}
        const repoId = repoInfo.id || repoInfo.repo_id || repoInfo.repository_id
        setRepoName(repoInfo.name || repoInfo.full_name || project?.name || 'Repository')

        if (!repoId) {
          setError('Repository id missing in project settings')
          setLoading(false)
          return
        }

        // Get all files recursively (client helper)
        const allFiles = await GitHubService.getRepositoryContentsRecursive(repoId, '', 4, 0)

        // Filter to frontend-related files and folders
        const frontendFiles = allFiles.filter(f => {
          if (!f || !f.path) return false
          // keep directories via recursion - allFiles returns files only; but paths include folders in path segments
          const ext = (f.name.split('.').pop() || '').toLowerCase()
          return frontendExts.has(ext)
        }).map(f => ({ ...f, type: 'file' }))

        // If repo contains src/ treat startPath = 'src'
        const hasSrc = allFiles.some(f => f.path.startsWith('src/'))
        const startPath = hasSrc ? 'src' : ''

        // Build tree
        const treeData = buildTreeFromFiles(frontendFiles, startPath)
        if (mounted) {
          setTree(treeData)
        }
      } catch (e) {
        console.error(e)
        if (mounted) setError('Failed to load repository files')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadRepo()
    return () => { mounted = false }
  }, [project])

  const FileNode = ({ item, level = 0 }) => {
    if (item.type === 'folder') {
      const isOpen = expandedFolders.includes(item.path)
      return (
        <div key={item.path} style={{ marginLeft: `${level * 12}px` }}>
          <div 
            className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all hover:bg-[var(--color-bg-muted)]"
            onClick={() => toggleFolder(item.path)}
          >
            {isOpen ? <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />}
            <Folder size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="font-medium text-[var(--color-text)]">{item.name}</span>
          </div>
          {isOpen && item.children && item.children.map(child => <FileNode key={child.path} item={child} level={level + 1} />)}
        </div>
      )
    }

    // file
    return (
      <div key={item.path} style={{ marginLeft: `${level * 12}px` }} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--color-bg-muted)] cursor-pointer">
        <div style={{ width: 18 }} />
        <FileText size={14} className="text-[var(--color-text-muted)]" />
        <span className="text-sm text-[var(--color-text)]">{item.name}</span>
        <span className="ml-auto text-xs text-[var(--color-text-muted)]">{item.size ? `${Math.round(item.size/1024)} kb` : ''}</span>
      </div>
    )
  }

  // Fallback static file structure when not GitHub-imported (keeps older demo)
  const fallbackStructure = [
    {
      name: 'src',
      type: 'folder',
      path: 'src',
      children: [
        { name: 'components', type: 'folder', path: 'src/components', children: [
            { name: 'Header.jsx', type: 'file', path: 'src/components/Header.jsx', size: '2400' },
            { name: 'Footer.jsx', type: 'file', path: 'src/components/Footer.jsx', size: '1800' }
          ]
        },
        { name: 'pages', type: 'folder', path: 'src/pages', children: [
            { name: 'HomePage.jsx', type: 'file', path: 'src/pages/HomePage.jsx', size: '4200' }
          ]
        },
        { name: 'App.jsx', type: 'file', path: 'src/App.jsx', size: '5200' }
      ]
    }
  ]

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}>
      {/* Explorer Header (copied design) */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ 
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg-muted)'
        }}
      >
        <h3 className="font-semibold flex items-center space-x-2" style={{ color: 'var(--color-text)' }}>
          <Box style={{ color: 'var(--color-primary)' }} size={16} />
          <span className="text-xs uppercase tracking-wide">{repoName || 'Project Files'}</span>
        </h3>
        <div className="flex space-x-1">
          <button
            className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all hover:scale-110"
            title="New File"
            onClick={() => {}}
          >
            <Plus size={14} />
          </button>
          <button
            className="p-1.5 rounded-md bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-all hover:scale-110"
            title="New Folder"
            onClick={() => {}}
          >
            <FolderOpen size={14} />
          </button>
          <button
            className="p-1.5 rounded-md bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-all hover:scale-110"
            title="Refresh Explorer"
            onClick={() => {
              // simple reload
              setTree([]); setLoading(true); setTimeout(()=> setLoading(false), 300); // lightweight visual
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* File Tree Area */}
      <div className="flex-grow overflow-y-auto p-4 text-sm space-y-2">
        {loading && <div className="p-6 text-center text-[var(--color-text-muted)]">Loading files...</div>}
        {error && <div className="p-4 text-sm text-red-500">{error}</div>}

        {!loading && !error && (
          <>
            {(tree.length > 0) ? (
              <div className="space-y-1">
                {tree.map(item => <FileNode key={item.path} item={item} />)}
              </div>
            ) : (
              <div className="space-y-1">
                {/* Fallback when not GitHub imported */}
                {project?.settings?.imported_from_github ? (
                  <div className="text-sm text-[var(--color-text-muted)] p-4">
                    No frontend files detected in repository.
                  </div>
                ) : (
                  <div>
                    {/* ...existing demo structure rendering ... */}
                    {fallbackStructure.map(item => <FileNode key={item.path} item={item} />)}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Actions area (kept from ExplorerPanel) */}
      <div 
        className="border-t p-4"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-muted)' }}
      >
        <h4 className="text-xs font-semibold mb-3 uppercase tracking-wide flex items-center space-x-1" style={{ color: 'var(--color-text-muted)' }}>
          <span>Quick Actions</span>
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all hover:scale-105">
            <Plus size={14} />
            <span className="text-xs">New File</span>
          </button>
          <button className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-600 hover:from-green-500/20 hover:to-emerald-500/20 transition-all hover:scale-105">
            <Folder size={14} />
            <span className="text-xs">New Folder</span>
          </button>
        </div>
      </div>
    </div>
  )
}