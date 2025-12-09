import React, { useState } from 'react'
import { Download, Github, ChevronDown } from 'lucide-react'

const ExportDropdown = ({ projectUuid, projectName, onExportStart, onExportComplete }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState(null)

  const handleExportZip = async () => {
    setIsOpen(false)
    setIsExporting(true)
    setExportType('zip')
    
    if (onExportStart) onExportStart('zip')
    
    try {
      const response = await fetch(`/api/projects/${projectUuid}/export/zip`, {
        method: 'GET',
        headers: {
          'Accept': 'application/zip',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${projectName}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        if (onExportComplete) onExportComplete('zip', true)
      } else {
        const error = await response.json()
        console.error('Export failed:', error)
        alert('Failed to export project: ' + (error.message || 'Unknown error'))
        if (onExportComplete) onExportComplete('zip', false)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('An error occurred during export')
      if (onExportComplete) onExportComplete('zip', false)
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  const handleExportGitHub = async () => {
    setIsOpen(false)
    setIsExporting(true)
    setExportType('github')
    
    if (onExportStart) onExportStart('github')
    
    try {
      const response = await fetch(`/api/projects/${projectUuid}/export/github`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        },
        body: JSON.stringify({
          create_new_repo: true,
          repository_name: projectName,
          is_private: false
        })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        alert(`Successfully exported to GitHub!\n${data.repository_url}`)
        if (data.repository_url) {
          window.open(data.repository_url, '_blank')
        }
        if (onExportComplete) onExportComplete('github', true)
      } else {
        console.error('GitHub export failed:', data)
        alert('Failed to export to GitHub: ' + (data.message || 'Unknown error'))
        if (onExportComplete) onExportComplete('github', false)
      }
    } catch (error) {
      console.error('GitHub export error:', error)
      alert('An error occurred during GitHub export')
      if (onExportComplete) onExportComplete('github', false)
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => !isExporting && setIsOpen(!isOpen)}
        disabled={isExporting}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
          isExporting
            ? 'bg-[var(--color-bg-muted)] border-[var(--color-border)] cursor-wait'
            : 'bg-pink-100 dark:bg-pink-900/30 hover:bg-pink-200 dark:hover:bg-pink-900/50 border-pink-200 dark:border-pink-800'
        }`}
      >
        <Download className={`w-3 h-3 text-pink-600 dark:text-pink-400 ${isExporting ? 'animate-bounce' : ''}`} />
        <span className="text-[10px] font-medium text-pink-600 dark:text-pink-400">
          {isExporting ? (exportType === 'zip' ? 'Exporting...' : 'Pushing to GitHub...') : 'Export'}
        </span>
        {!isExporting && (
          <ChevronDown className={`w-3 h-3 text-pink-600 dark:text-pink-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {isOpen && !isExporting && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg z-50 overflow-hidden">
          <button
            onClick={handleExportZip}
            className="w-full px-4 py-2.5 text-left hover:bg-[var(--color-bg-muted)] transition-colors flex items-center gap-3"
          >
            <Download className="w-4 h-4 text-[var(--color-text-muted)]" />
            <div>
              <div className="text-sm font-medium text-[var(--color-text)]">Export as ZIP</div>
              <div className="text-xs text-[var(--color-text-muted)]">Download project files</div>
            </div>
          </button>
          
          <div className="border-t border-[var(--color-border)]" />
          
          <button
            onClick={handleExportGitHub}
            className="w-full px-4 py-2.5 text-left hover:bg-[var(--color-bg-muted)] transition-colors flex items-center gap-3"
          >
            <Github className="w-4 h-4 text-[var(--color-text-muted)]" />
            <div>
              <div className="text-sm font-medium text-[var(--color-text)]">Export to GitHub</div>
              <div className="text-xs text-[var(--color-text-muted)]">Push to repository</div>
            </div>
          </button>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && !isExporting && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default ExportDropdown
