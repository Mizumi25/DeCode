// @/Components/Forge/BottomCodePanel.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  GripVertical, 
  Move, 
  Maximize2, 
  ChevronDown, 
  X 
} from 'lucide-react';
import CodePanel from './CodePanel';

const BottomCodePanel = ({
  showCodePanel,
  codePanelMinimized,
  codePanelHeight,
  codePanelRef,
  setCodePanelMinimized,
  setCodePanelHeight,
  moveCodePanelToRightSidebar,
  setShowCodePanel,
  handleCodePanelDragStart,
  // CodePanel props
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
  generateCode,
  canvasComponents,
  setCodePanelPosition
}) => {
  if (!showCodePanel) return null;

  return (
    <motion.div
      ref={codePanelRef}
      initial={{ height: 0, opacity: 0 }}
      animate={{ 
        height: codePanelMinimized ? '60px' : `${codePanelHeight}px`, 
        opacity: 1 
      }}
      exit={{ height: 0, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 border-t-2 bg-white z-50 shadow-2xl"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.1)',
        width: '100vw',
        maxHeight: '60vh'
      }}
    >
      {/* Resizable handle */}
      <div 
        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-purple-500 hover:bg-opacity-20 transition-colors flex items-center justify-center"
        onMouseDown={(e) => {
          const startY = e.clientY
          const startHeight = codePanelHeight
          
          const handleMouseMove = (e) => {
            const newHeight = Math.max(200, Math.min(600, startHeight - (e.clientY - startY)))
            setCodePanelHeight(newHeight)
          }
          
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
          }
          
          document.addEventListener('mousemove', handleMouseMove)
          document.addEventListener('mouseup', handleMouseUp)
        }}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
      </div>
      
      {/* FIXED: Header with proper height */}
      <div 
        className="flex items-center justify-between p-3 border-b"
        style={{ 
          backgroundColor: 'var(--color-bg-muted)', 
          borderColor: 'var(--color-border)',
          height: '56px',
          flexShrink: 0
        }}
      >
        <div className="flex items-center gap-3">
          <GripVertical 
            className="w-5 h-5 cursor-move" 
            style={{ color: 'var(--color-text-muted)' }}
            onMouseDown={handleCodePanelDragStart}
          />
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
              <div className="w-5 h-5" style={{ color: 'var(--color-primary)' }}>📝</div>
            </div>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Generated Code Panel</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {codePanelMinimized ? 'Click to expand' : 'Drag handle to resize • Drag to move to sidebar →'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={moveCodePanelToRightSidebar}
            className="px-3 py-2 text-xs rounded-lg transition-colors text-white flex items-center gap-2"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Move className="w-4 h-4" />
            Move to Sidebar
          </button>
          <button
            onClick={() => setCodePanelMinimized(!codePanelMinimized)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {codePanelMinimized ? <Maximize2 className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowCodePanel(false)}
            className="p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* FIXED: Content area with proper height calculation */}
      {!codePanelMinimized && (
        <div 
          className="overflow-hidden"
          style={{ 
            height: `${codePanelHeight - 56}px` // Subtract header height
          }}
        >
          <div className="h-full">
            <CodePanel
              showTooltips={showTooltips}
              setShowTooltips={setShowTooltips}
              codePanelMinimized={codePanelMinimized}
              setCodePanelMinimized={setCodePanelMinimized}
              setShowCodePanel={setShowCodePanel}
              codeStyle={codeStyle}
              setCodeStyle={setCodeStyle}
              activeCodeTab={activeCodeTab}
              setActiveCodeTab={setActiveCodeTab}
              generatedCode={generatedCode}
              getAvailableTabs={getAvailableTabs}
              highlightCode={highlightCode}
              handleTokenHover={handleTokenHover}
              handleTokenLeave={handleTokenLeave}
              handleCodeEdit={handleCodeEdit}
              copyCodeToClipboard={copyCodeToClipboard}
              downloadCode={downloadCode}
              generateCode={generateCode}
              canvasComponents={canvasComponents}
              setCodePanelPosition={setCodePanelPosition}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BottomCodePanel;