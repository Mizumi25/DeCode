// @/Components/Void/CodeHandlerPanel.jsx - Frame list with code preview
import React, { useState, useEffect } from 'react'
import { Code, Copy, FileCode, Loader, ChevronDown, ChevronRight } from 'lucide-react'
import { usePage } from '@inertiajs/react'
import componentLibraryService from '@/Services/ComponentLibraryService'

export default function CodeHandlerPanel() {
  const { project } = usePage().props
  const [frames, setFrames] = useState([])
  const [expandedFrames, setExpandedFrames] = useState({}) // Track which frames are expanded
  const [frameCode, setFrameCode] = useState({}) // Store generated code for each frame
  const [loadingFrames, setLoadingFrames] = useState({}) // Track loading state per frame
  const [activeCodeTab, setActiveCodeTab] = useState({}) // Track which tab is active per frame (main/css)
  
  // Get project's selected framework
  const framework = project?.output_format || 'html' // 'html' or 'react'
  const styleFramework = project?.style_framework || 'css' // 'css' or 'tailwind'
  const codeStyle = framework === 'html' 
    ? (styleFramework === 'css' ? 'html-css' : 'html-tailwind')
    : (styleFramework === 'css' ? 'react-css' : 'react-tailwind')
  
  // Show CSS tab only if using CSS (not Tailwind)
  const showCssTab = styleFramework === 'css'

  // Load frames on mount
  useEffect(() => {
    loadFrames()
  }, [project])

  const loadFrames = async () => {
    if (!project?.uuid) return

    try {
      const response = await fetch(`/api/projects/${project.uuid}/frames`)
      const data = await response.json()
      setFrames(data.frames || data)
    } catch (error) {
      console.error('Failed to load frames:', error)
    }
  }

  const toggleFrame = async (frameId) => {
    const isExpanded = expandedFrames[frameId]
    
    // Toggle expansion
    setExpandedFrames(prev => ({ ...prev, [frameId]: !isExpanded }))
    
    // If expanding and code not yet generated, generate it
    if (!isExpanded && !frameCode[frameId]) {
      await generateCodeForFrame(frameId)
    }
  }

  const generateCodeForFrame = async (frameId) => {
    if (!project?.uuid) return

    setLoadingFrames(prev => ({ ...prev, [frameId]: true }))
    
    try {
      const frame = frames.find(f => f.uuid === frameId || f.id === frameId)
      if (!frame) return

      // Fetch components
      const componentsResponse = await fetch(`/api/project-components?project_id=${project.uuid}&frame_id=${frame.uuid}`)
      const componentsData = await componentsResponse.json()
      const components = componentsData.data || []

      if (components.length === 0) {
        const emptyCode = framework === 'html'
          ? `<!-- Empty frame: ${frame.name} -->\n<div>No components</div>`
          : `// Empty frame: ${frame.name}\nfunction ${frame.name.replace(/\s+/g, '')}() {\n  return <div>No components</div>\n}`
        
        setFrameCode(prev => ({ ...prev, [frameId]: emptyCode }))
        return
      }

      // Generate code using project's framework
      const generatedCode = await componentLibraryService.clientSideCodeGeneration(
        components,
        codeStyle,
        frame.name
      )

      // Get the appropriate code based on framework + store CSS separately
      const mainCode = framework === 'html' ? generatedCode.html : generatedCode.react
      const cssCode = generatedCode.css || ''
      
      setFrameCode(prev => ({ 
        ...prev, 
        [frameId]: {
          main: mainCode || 'No code generated',
          css: cssCode
        }
      }))

    } catch (error) {
      console.error('Code generation failed:', error)
      setFrameCode(prev => ({ 
        ...prev, 
        [frameId]: {
          main: `// Error: ${error.message}`,
          css: ''
        }
      }))
    } finally {
      setLoadingFrames(prev => ({ ...prev, [frameId]: false }))
    }
  }

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <h4 className="font-semibold text-[var(--color-text)]">Code Preview</h4>
        <div className="text-xs text-[var(--color-text-muted)] mt-1">
          Framework: {framework === 'html' ? 'HTML' : 'React'} + {styleFramework === 'css' ? 'CSS' : 'Tailwind'}
        </div>
      </div>

      {/* Frame List */}
      <div className="flex-1 overflow-auto">
        {frames.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-muted)] p-4">
            <FileCode className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">No frames in this project</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {frames.map((frame) => (
              <div key={frame.uuid} className="border rounded-lg" style={{ borderColor: 'var(--color-border)' }}>
                {/* Frame Header */}
                <button
                  onClick={() => toggleFrame(frame.uuid)}
                  className="w-full flex items-center justify-between p-3 hover:bg-[var(--color-bg-muted)] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expandedFrames[frame.uuid] ? (
                      <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                    )}
                    <span className="text-sm font-medium text-[var(--color-text)]">{frame.name}</span>
                  </div>
                  {expandedFrames[frame.uuid] && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const code = frameCode[frame.uuid]
                        const textToCopy = code 
                          ? (showCssTab && activeCodeTab[frame.uuid] === 'css'
                              ? code.css
                              : code.main || code)
                          : ''
                        copyToClipboard(textToCopy)
                      }}
                      className="p-1 rounded hover:bg-[var(--color-bg-hover)]"
                      style={{ color: 'var(--color-primary)' }}
                      title="Copy code"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                </button>

                {/* Expanded Code */}
                {expandedFrames[frame.uuid] && (
                  <div className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                    {loadingFrames[frame.uuid] ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader className="w-5 h-5 animate-spin text-[var(--color-primary)]" />
                      </div>
                    ) : (
                      <>
                        {/* Code Tabs (only show if CSS framework) */}
                        {showCssTab && frameCode[frame.uuid] && (
                          <div className="flex border-b text-xs" style={{ borderColor: 'var(--color-border)' }}>
                            <button
                              onClick={() => setActiveCodeTab(prev => ({ ...prev, [frame.uuid]: 'main' }))}
                              className={`px-3 py-2 font-medium transition-colors ${
                                (activeCodeTab[frame.uuid] || 'main') === 'main'
                                  ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                              }`}
                            >
                              {framework === 'html' ? 'HTML' : 'JSX'}
                            </button>
                            <button
                              onClick={() => setActiveCodeTab(prev => ({ ...prev, [frame.uuid]: 'css' }))}
                              className={`px-3 py-2 font-medium transition-colors ${
                                activeCodeTab[frame.uuid] === 'css'
                                  ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                              }`}
                            >
                              CSS
                            </button>
                          </div>
                        )}
                        
                        {/* Code Display */}
                        <div className="p-3">
                          <pre className="text-xs font-mono bg-[#1e1e1e] text-[#d4d4d4] p-3 rounded overflow-x-auto max-h-96">
                            <code>
                              {frameCode[frame.uuid] 
                                ? (showCssTab && activeCodeTab[frame.uuid] === 'css'
                                    ? frameCode[frame.uuid].css || '/* No styles */'
                                    : frameCode[frame.uuid].main || frameCode[frame.uuid])
                                : 'No code generated'
                              }
                            </code>
                          </pre>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t text-xs text-[var(--color-text-muted)]" style={{ borderColor: 'var(--color-border)' }}>
        💡 Click on a frame to view its generated code
      </div>
    </div>
  )
}