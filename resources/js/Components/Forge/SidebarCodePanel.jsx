// @/Components/Forge/SidebarCodePanel.jsx
import React from 'react';
import { Code, Copy, Download } from 'lucide-react';

const SidebarCodePanel = ({
  showTooltips,
  setShowTooltips,
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
  setCodePanelPosition,
  canvasComponents,
  generateCode
}) => {
  return (
    <div className="space-y-4 h-full flex flex-col" style={{ opacity: 1 }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
            <Code className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Live Code</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Edit to update components</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Tips</label>
            <button
              onClick={() => setShowTooltips(!showTooltips)}
              className={`relative w-10 h-6 rounded-full transition-colors ${showTooltips ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${showTooltips ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>
          <button
            onClick={() => setCodePanelPosition('bottom')}
            className="px-3 py-1 text-xs rounded-lg transition-colors text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            ↓ Move to Bottom
          </button>
        </div>
      </div>
      
      {/* Code Style Selector - Sidebar version */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Code Style</label>
        <select
          value={codeStyle}
          onChange={(e) => {
            setCodeStyle(e.target.value)
            generateCode(canvasComponents)
          }}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-all"
          style={{ 
            borderColor: 'var(--color-border)', 
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)'
          }}
        >
          <option value="react-tailwind">React + Tailwind CSS</option>
          <option value="react-css">React + Traditional CSS</option>
          <option value="html-css">HTML + CSS</option>
          <option value="html-tailwind">HTML + Tailwind CSS</option>
        </select>
      </div>

      {/* Code tabs - Sidebar version */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
        {getAvailableTabs().map(tab => (
          <button
            key={tab}
            onClick={() => setActiveCodeTab(tab)}
            className="px-3 py-2 rounded-md text-sm font-medium transition-all flex-1"
            style={{
              backgroundColor: activeCodeTab === tab ? 'var(--color-surface)' : 'transparent',
              color: activeCodeTab === tab ? 'var(--color-text)' : 'var(--color-text-muted)',
              boxShadow: activeCodeTab === tab ? 'var(--shadow-sm)' : 'none'
            }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>
      
      {/* Code editor - Sidebar version with full opacity */}
      <div className="flex-1 min-h-0 relative">
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <button
            onClick={() => copyCodeToClipboard(generatedCode[activeCodeTab])}
            className="p-1.5 rounded-md text-white hover:bg-white hover:bg-opacity-20 transition-all"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            title="Copy"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={() => downloadCode(generatedCode[activeCodeTab], `component.${activeCodeTab}`, activeCodeTab)}
            className="p-1.5 rounded-md text-white hover:bg-white hover:bg-opacity-20 transition-all"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            title="Download"
          >
            <Download className="w-3 h-3" />
          </button>
        </div>
        
        <div
          className="code-editor w-full h-full p-3 rounded-xl border-0 resize-none overflow-auto font-mono text-sm relative"
          style={{
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            lineHeight: '1.5',
            fontSize: '13px',
            opacity: 1 // Ensure full opacity in sidebar
          }}
        >
          <pre
            className="whitespace-pre-wrap pr-12"
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
            className="absolute inset-3 w-full h-full bg-transparent text-transparent caret-white resize-none outline-none font-mono text-sm pr-12"
            style={{
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              lineHeight: '1.5',
              fontSize: '13px'
            }}
            placeholder={`// ${activeCodeTab.toUpperCase()} code will appear here...`}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};

export default SidebarCodePanel;