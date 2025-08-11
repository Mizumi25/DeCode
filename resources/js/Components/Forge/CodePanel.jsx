// @/Components/Forge/CodePanel.jsx
import React from 'react';
import { 
  Code, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Copy, 
  Download, 
  RefreshCw, 
  Sparkles,
  Move
} from 'lucide-react';

const CodePanel = ({ 
  showTooltips,
  setShowTooltips,
  codePanelMinimized,
  setCodePanelMinimized,
  setShowCodePanel,
  codeStyle,
  setCodeStyle,
  activeCodeTab,
  setActiveCodeTab,
  generatedCode,
  getAvailableTabs,
  highlightCode,
  handleTokenHover,
  handleTokenLeave,
  handleCodeEdit,
  copyCodeToClipboard,
  downloadCode,
  generateCode,
  canvasComponents,
  setCodePanelPosition
}) => {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
            <Code className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Live Code Generator</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Real-time code generation with tooltips</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Tooltips</label>
            <button
              onClick={() => setShowTooltips(!showTooltips)}
              className={`relative w-10 h-6 rounded-full transition-colors ${showTooltips ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${showTooltips ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>
          <button
            onClick={() => setCodePanelMinimized(!codePanelMinimized)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {codePanelMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowCodePanel(false)}
            className="p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {!codePanelMinimized && (
        <>
          {/* Code Style Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Code Style Combination</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'react-tailwind', label: 'React + Tailwind', desc: 'Modern JSX with utility classes' },
                { value: 'react-css', label: 'React + CSS', desc: 'JSX with traditional stylesheets' },
                { value: 'html-css', label: 'HTML + CSS', desc: 'Vanilla HTML with CSS files' },
                { value: 'html-tailwind', label: 'HTML + Tailwind', desc: 'HTML with utility classes' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setCodeStyle(option.value)
                    generateCode(canvasComponents)
                  }}
                  className="p-3 rounded-lg text-left transition-all border-2"
                  style={{
                    backgroundColor: codeStyle === option.value ? 'var(--color-primary-soft)' : 'var(--color-bg-muted)',
                    borderColor: codeStyle === option.value ? 'var(--color-primary)' : 'var(--color-border)',
                    color: codeStyle === option.value ? 'var(--color-primary)' : 'var(--color-text)'
                  }}
                >
                  <div className="font-semibold text-sm">{option.label}</div>
                  <div className="text-xs opacity-80">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>
      
          {/* Code tabs */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
            {getAvailableTabs().map(tab => (
              <button
                key={tab}
                onClick={() => setActiveCodeTab(tab)}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 relative"
                style={{
                  backgroundColor: activeCodeTab === tab ? 'var(--color-surface)' : 'transparent',
                  color: activeCodeTab === tab ? 'var(--color-text)' : 'var(--color-text-muted)',
                  boxShadow: activeCodeTab === tab ? 'var(--shadow-sm)' : 'none'
                }}
              >
                {tab.toUpperCase()}
                {activeCodeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
                )}
              </button>
            ))}
          </div>
          
          {/* Code editor with enhanced features */}
          <div className="flex-1 min-h-0 relative">
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <button
                onClick={() => copyCodeToClipboard(generatedCode[activeCodeTab])}
                className="p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-20 transition-all"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => downloadCode(generatedCode[activeCodeTab], `component.${activeCodeTab}`, activeCodeTab)}
                className="p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-20 transition-all"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => generateCode(canvasComponents)}
                className="p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-20 transition-all"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                title="Regenerate code"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            
            <div
              className="code-editor w-full h-full p-4 rounded-xl border-0 resize-none overflow-auto font-mono text-sm relative"
              style={{
                backgroundColor: '#1e1e1e',
                color: '#d4d4d4',
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                lineHeight: '1.6',
                fontSize: '14px'
              }}
            >
              <pre
                className="whitespace-pre-wrap pr-16"
                dangerouslySetInnerHTML={{
                  __html: highlightCode(generatedCode[activeCodeTab], activeCodeTab)
                }}
                onMouseOver={handleTokenHover}
                onMouseOut={handleTokenLeave}
                onTouchStart={handleTokenHover}
                onTouchEnd={handleTokenLeave}
              />
              <textarea
                value={generatedCode[activeCodeTab]}
                onChange={(e) => handleCodeEdit(e.target.value, activeCodeTab)}
                className="absolute inset-4 w-full h-full bg-transparent text-transparent caret-white resize-none outline-none font-mono text-sm pr-16"
                style={{
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  lineHeight: '1.6',
                  fontSize: '14px'
                }}
                placeholder={`// ${activeCodeTab.toUpperCase()} code will appear here...`}
                spellCheck={false}
              />
            </div>
          </div>
          
          <div className="text-xs p-3 rounded-lg border flex items-center gap-2" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-primary-soft)', borderColor: 'var(--color-primary)' }}>
            <Sparkles className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            <span><strong>Pro Tip:</strong> Hover over code elements for helpful explanations. Edit code directly to update components in real-time.</span>
          </div>
        </>
      )}
    </div>
  );
};

export default CodePanel;