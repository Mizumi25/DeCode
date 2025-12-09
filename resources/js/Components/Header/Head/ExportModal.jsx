import React, { useState } from 'react'
import Modal from '@/Components/Modal'
import { useHeaderStore } from '@/stores/useHeaderStore'
import { Download, Github, FileCode, X, Eye, Code, Palette } from 'lucide-react'
import { usePage } from '@inertiajs/react'

const ExportModal = () => {
  const { isExportModalOpen, closeExportModal } = useHeaderStore()
  const { project } = usePage().props
  
  const [activeTab, setActiveTab] = useState('zip') // 'zip' or 'github'
  const [exportFramework, setExportFramework] = useState('html') // 'html' or 'react'
  const [exportStyle, setExportStyle] = useState('css') // 'css' or 'tailwind'
  const [includeNavigation, setIncludeNavigation] = useState(true)
  const [githubRepoUrl, setGithubRepoUrl] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  // Check if project was imported from GitHub
  const hasGithubRepo = project?.github_repo_url || false
  const existingRepoUrl = project?.github_repo_url || ''
  const isImported = project?.project_type === 'github_import' || hasGithubRepo
  
  // For imported projects, lock to original settings
  React.useEffect(() => {
    if (isImported && project) {
      setExportFramework(project.output_format || 'html')
      setExportStyle(project.style_framework || 'css')
      setIncludeNavigation(project.settings?.include_navigation ?? true)
    }
  }, [isImported, project])

  // SVG Icon Components (from NewProjectModal)
  const HtmlIcon = () => (
    <svg width="24" height="24" viewBox="0 0 48 48">
      <path fill="#E65100" d="M41,5H7l3,34l14,4l14-4L41,5L41,5z"></path>
      <path fill="#FF6D00" d="M24 8L24 39.9 35.2 36.7 37.7 8z"></path>
      <path fill="#FFF" d="M24,25v-4h8.6l-0.7,11.5L24,35.1v-4.2l4.1-1.4l0.3-4.5H24z M32.9,17l0.3-4H24v4H32.9z"></path>
      <path fill="#EEE" d="M24,30.9v4.2l-7.9-2.6L15.7,27h4l0.2,2.5L24,30.9z M19.1,17H24v-4h-9.1l0.7,12H24v-4h-4.6L19.1,17z"></path>
    </svg>
  )

  const ReactIcon = () => (
    <svg width="24" height="24" viewBox="0 0 30 30">
      <path fill="#61DAFB" d="M 10.679688 4.1816406 C 10.068687 4.1816406 9.502 4.3184219 9 4.6074219 C 7.4311297 5.5132122 6.8339651 7.7205462 7.1503906 10.46875 C 4.6127006 11.568833 3 13.188667 3 15 C 3 16.811333 4.6127006 18.431167 7.1503906 19.53125 C 6.8341285 22.279346 7.4311297 24.486788 9 25.392578 C 9.501 25.681578 10.067687 25.818359 10.679688 25.818359 C 11.982314 25.818359 13.48785 25.164589 15 24.042969 C 16.512282 25.164589 18.01964 25.818359 19.322266 25.818359 C 19.933266 25.818359 20.499953 25.681578 21.001953 25.392578 C 22.570287 24.486788 23.167109 22.279346 22.851562 19.53125 C 25.387299 18.431167 27 16.811333 27 15 C 27 13.188667 25.387299 11.568833 22.849609 10.46875 C 23.166035 7.7205462 22.56887 5.5132122 21 4.6074219 C 20.498 4.3184219 19.931312 4.1816406 19.320312 4.1816406 C 18.017686 4.1816406 16.51215 4.8354109 15 5.9570312 C 13.487718 4.8354109 11.981686 4.1816406 10.679688 4.1816406 z M 10.679688 5.9316406 C 11.461922 5.9316406 12.730016 6.3825141 13.990234 7.3144531 C 12.589813 8.6135582 11.2138 10.127977 9.9472656 11.816406 C 8.4300255 12.059126 6.9606226 12.409359 5.6542969 12.861328 C 5.4108558 10.805691 5.6817462 9.2387109 6.5019531 8.6230469 C 6.9039531 8.3200469 7.5114688 8.1816406 10.679688 5.9316406 z"/>
    </svg>
  )

  const CssIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path fill="#1572B6" d="M5.902 3.731L4.387 20.568L11.996 22.5L19.613 20.568L18.098 3.731H5.902ZM16.126 8.316H8.47L8.688 10.682H15.908L15.253 17.588L12 18.521L8.747 17.588L8.526 14.789H10.674L10.785 16.128L12 16.447L13.215 16.128L13.355 14.447H8.447L7.974 9.105H16.02L16.126 8.316Z"/>
    </svg>
  )

  const TailwindIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path fill="#06B6D4" d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624C7.666,17.818,9.027,19.2,12.001,19.2c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624C10.337,13.382,8.976,12,6.001,12z"/>
    </svg>
  )

  const frameworkOptions = [
    {
      id: 'html-css',
      framework: 'html',
      style: 'css',
      label: 'HTML + CSS',
      description: 'Pure HTML with CSS classes',
      icon: () => (
        <div className="flex items-center gap-2">
          <HtmlIcon />
          <span className="text-lg">+</span>
          <CssIcon />
        </div>
      )
    },
    {
      id: 'html-tailwind',
      framework: 'html',
      style: 'tailwind',
      label: 'HTML + Tailwind',
      description: 'HTML with Tailwind utility classes',
      icon: () => (
        <div className="flex items-center gap-2">
          <HtmlIcon />
          <span className="text-lg">+</span>
          <TailwindIcon />
        </div>
      )
    },
    {
      id: 'react-css',
      framework: 'react',
      style: 'css',
      label: 'React + CSS',
      description: 'React components with CSS modules',
      icon: () => (
        <div className="flex items-center gap-2">
          <ReactIcon />
          <span className="text-lg">+</span>
          <CssIcon />
        </div>
      )
    },
    {
      id: 'react-tailwind',
      framework: 'react',
      style: 'tailwind',
      label: 'React + Tailwind',
      description: 'React with Tailwind styling',
      icon: () => (
        <div className="flex items-center gap-2">
          <ReactIcon />
          <span className="text-lg">+</span>
          <TailwindIcon />
        </div>
      )
    }
  ]

  const handleFrameworkChange = (framework, style) => {
    setExportFramework(framework)
    setExportStyle(style)
  }

  const handlePreview = async () => {
    if (!project?.uuid) return

    setLoadingPreview(true)
    try {
      const response = await fetch(`/api/projects/${project.uuid}/export/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
        body: JSON.stringify({
          framework: exportFramework,
          style_framework: exportStyle,
          include_navigation: includeNavigation,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPreviewData(data.preview)
        setShowPreview(true)
      } else {
        setExportStatus('Failed to generate preview')
      }
    } catch (error) {
      console.error('Preview error:', error)
      setExportStatus('Failed to generate preview')
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleExportAsZip = async () => {
    if (!project?.uuid) return

    setIsExporting(true)
    setExportStatus('Preparing export...')

    try {
      const response = await fetch(`/api/projects/${project.uuid}/export/zip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
        body: JSON.stringify({
          framework: exportFramework,
          style_framework: exportStyle,
          include_navigation: includeNavigation,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${project.name || 'project'}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        setExportStatus('Export successful!')
        setTimeout(() => {
          closeExportModal()
          setExportStatus('')
        }, 2000)
      } else {
        setExportStatus('Export failed. Please try again.')
      }
    } catch (error) {
      console.error('Export error:', error)
      setExportStatus('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportToGithub = async () => {
    if (!project?.uuid) return

    setIsExporting(true)
    setExportStatus('Pushing to GitHub...')

    try {
      const repoUrl = hasGithubRepo ? existingRepoUrl : githubRepoUrl

      if (!repoUrl) {
        setExportStatus('Please enter a GitHub repository URL')
        setIsExporting(false)
        return
      }

      const response = await fetch(`/api/projects/${project.uuid}/export/github`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
        body: JSON.stringify({
          framework: exportFramework,
          style_framework: exportStyle,
          include_navigation: includeNavigation,
          repo_url: repoUrl,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setExportStatus('Successfully pushed to GitHub!')
        setTimeout(() => {
          closeExportModal()
          setExportStatus('')
        }, 2000)
      } else {
        setExportStatus(data.message || 'GitHub export failed')
      }
    } catch (error) {
      console.error('GitHub export error:', error)
      setExportStatus('GitHub export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Modal show={isExportModalOpen} onClose={closeExportModal} maxWidth="3xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <FileCode className="w-6 h-6 text-[var(--color-primary)]" />
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Export Project</h2>
        </div>
        <button
          onClick={closeExportModal}
          className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)]">
        <button
          onClick={() => setActiveTab('zip')}
          className={`flex-1 px-6 py-4 font-medium transition-colors ${
            activeTab === 'zip'
              ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Export as ZIP
          </div>
        </button>
        <button
          onClick={() => setActiveTab('github')}
          className={`flex-1 px-6 py-4 font-medium transition-colors ${
            activeTab === 'github'
              ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Github className="w-4 h-4" />
            Export to GitHub
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Imported Project Notice */}
        {isImported && (
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <Github className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-600 text-sm">
                  Imported Project
                </div>
                <div className="text-xs text-blue-600/80 mt-1">
                  Export settings are locked to match the imported repository format.
                  Framework: {exportFramework === 'html' ? 'HTML' : 'React'} + {exportStyle === 'css' ? 'CSS' : 'Tailwind'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Framework Selection - Only for manual projects */}
        {!isImported && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[var(--color-text)]">Select Export Format</h3>
            <div className="grid grid-cols-2 gap-3">
            {frameworkOptions.map((option) => {
              const isSelected = 
                exportFramework === option.framework && exportStyle === option.style
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleFrameworkChange(option.framework, option.style)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                      : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {typeof option.icon === 'function' ? <option.icon /> : option.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[var(--color-text)]">{option.label}</div>
                      <div className="text-sm text-[var(--color-text-muted)] mt-1">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        )}

        {/* Navigation Settings - Only for manual projects */}
        {!isImported && (
          <div className="space-y-3">
          <h3 className="text-sm font-medium text-[var(--color-text)]">Navigation Settings</h3>
          <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeNavigation}
                onChange={(e) => setIncludeNavigation(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-0"
              />
              <div className="flex-1">
                <div className="font-medium text-[var(--color-text)]">
                  Include Frame Navigation
                </div>
                <div className="text-sm text-[var(--color-text-muted)] mt-1">
                  Add a navigation system to switch between frames in the exported project
                </div>
              </div>
            </label>
          </div>
        </div>
        )}

        {/* GitHub-specific options */}
        {activeTab === 'github' && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[var(--color-text)]">GitHub Repository</h3>
            {hasGithubRepo ? (
              <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)]">
                <div className="flex items-center gap-2 text-sm">
                  <Github className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span className="text-[var(--color-text-muted)]">Connected to:</span>
                  <a
                    href={existingRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-primary)] hover:underline font-mono"
                  >
                    {existingRepoUrl}
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={githubRepoUrl}
                  onChange={(e) => setGithubRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <p className="text-xs text-[var(--color-text-muted)]">
                  Paste your GitHub repository URL. Make sure you have push access.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Status Message */}
        {exportStatus && (
          <div className={`p-4 rounded-lg ${
            exportStatus.includes('success') || exportStatus.includes('Successfully')
              ? 'bg-green-500/10 border border-green-500/20 text-green-600'
              : exportStatus.includes('failed') || exportStatus.includes('error')
              ? 'bg-red-500/10 border border-red-500/20 text-red-600'
              : 'bg-blue-500/10 border border-blue-500/20 text-blue-600'
          }`}>
            {exportStatus}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 p-6 border-t border-[var(--color-border)]">
        <button
          onClick={handlePreview}
          disabled={loadingPreview || isExporting}
          className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          {loadingPreview ? 'Loading...' : 'Preview Code'}
        </button>
        
        <div className="flex items-center gap-3">
          <button
            onClick={closeExportModal}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={activeTab === 'zip' ? handleExportAsZip : handleExportToGithub}
            disabled={isExporting || (activeTab === 'github' && !hasGithubRepo && !githubRepoUrl)}
            className="px-6 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {activeTab === 'zip' ? (
              <>
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Download ZIP'}
              </>
            ) : (
              <>
                <Github className="w-4 h-4" />
                {isExporting ? 'Pushing...' : 'Push to GitHub'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Preview Modal - Render within ExportModal */}
      <CodePreviewModal 
        show={showPreview} 
        onClose={() => setShowPreview(false)}
        previewData={previewData}
        framework={exportFramework}
        styleFramework={exportStyle}
      />
    </Modal>
  )
}

// Code Preview Modal Component
const CodePreviewModal = ({ show, onClose, previewData, framework, styleFramework }) => {
  const [activeFrame, setActiveFrame] = useState(0)
  const [activeSnippet, setActiveSnippet] = useState('html') // 'html', 'css', 'jsx'

  if (!previewData || !previewData.frames) return null

  const currentFrame = previewData.frames[activeFrame]
  const showCSS = styleFramework === 'css' && framework === 'html'

  return (
    <Modal show={show} onClose={onClose} maxWidth="6xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-[var(--color-primary)]" />
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Code Preview</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Frame Selector */}
      {previewData.frames.length > 1 && (
        <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-muted)]">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-sm text-[var(--color-text-muted)] whitespace-nowrap">Frames:</span>
            {previewData.frames.map((frame, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveFrame(index)
                  setActiveSnippet(framework === 'html' ? 'html' : 'jsx')
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeFrame === index
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg-muted)]'
                }`}
              >
                {frame.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Code Type Tabs */}
      <div className="flex border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <button
          onClick={() => setActiveSnippet(framework === 'html' ? 'html' : 'jsx')}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
            activeSnippet === (framework === 'html' ? 'html' : 'jsx')
              ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <Code className="w-4 h-4" />
          {framework === 'html' ? 'HTML' : 'React (JSX)'}
        </button>
        
        {showCSS && (
          <button
            onClick={() => setActiveSnippet('css')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeSnippet === 'css'
                ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Palette className="w-4 h-4" />
            CSS
          </button>
        )}
      </div>

      {/* Code Display */}
      <div className="p-6 bg-[var(--color-bg-muted)] max-h-[60vh] overflow-auto">
        <div className="relative">
          <pre className="text-sm font-mono bg-[#1e1e1e] text-[#d4d4d4] p-6 rounded-lg overflow-x-auto">
            <code>
              {activeSnippet === 'html' && currentFrame.html}
              {activeSnippet === 'jsx' && currentFrame.jsx}
              {activeSnippet === 'css' && currentFrame.css}
            </code>
          </pre>
          
          {/* Copy Button */}
          <button
            onClick={() => {
              const code = activeSnippet === 'html' ? currentFrame.html : 
                          activeSnippet === 'jsx' ? currentFrame.jsx : 
                          currentFrame.css
              navigator.clipboard.writeText(code)
            }}
            className="absolute top-4 right-4 px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] transition-colors"
          >
            Copy
          </button>
        </div>

        {/* Info */}
        <div className="mt-4 p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
          <div className="text-sm text-[var(--color-text-muted)]">
            <strong className="text-[var(--color-text)]">Export Format:</strong> {framework === 'html' ? 'HTML' : 'React'} + {styleFramework === 'css' ? 'CSS' : 'Tailwind'}
            {styleFramework === 'tailwind' && (
              <div className="mt-2 text-xs">
                💡 Tailwind classes are inline in the code above. No separate CSS file needed.
              </div>
            )}
            {showCSS && (
              <div className="mt-2 text-xs">
                💡 CSS classes are extracted to a separate stylesheet for clean HTML.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--color-border)]">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-muted)]"
        >
          Close
        </button>
      </div>
    </Modal>
  )
}

export default ExportModal
