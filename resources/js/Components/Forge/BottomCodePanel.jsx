// @/Components/Forge/BottomCodePanel.jsx - FIXED for mobile
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

  // Calculate responsive height based on screen size
  const getResponsiveHeight = () => {
    const vh = window.innerHeight;
    const isMobile = window.innerWidth < 768;
    
    if (codePanelMinimized) return '60px';
    
    if (isMobile) {
      // On mobile, use percentage of viewport height
      return `${Math.min(codePanelHeight, vh * 0.7)}px`;
    }
    
    return `${Math.min(codePanelHeight, vh * 0.6)}px`;
  };

  return (
    <motion.div
      ref={codePanelRef}
      initial={{ height: 0, opacity: 0 }}
      animate={{ 
        height: getResponsiveHeight(),
        opacity: 1 
      }}
      exit={{ height: 0, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 border-t-2 bg-white z-50 shadow-2xl"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.1)',
        width: '100vw',
        maxHeight: '70vh', // Prevent taking up entire screen
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Resizable handle */}
      <div 
        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-purple-500 hover:bg-opacity-20 transition-colors flex items-center justify-center z-10"
        onMouseDown={(e) => {
          const startY = e.clientY
          const startHeight = codePanelHeight
          
          const handleMouseMove = (e) => {
            const vh = window.innerHeight;
            const maxHeight = vh * 0.7; // Max 70% of viewport height
            const newHeight = Math.max(200, Math.min(maxHeight, startHeight - (e.clientY - startY)))
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
      
      {/* Header - Fixed height with better mobile responsiveness */}
      <div 
        className="flex items-center justify-between p-2 sm:p-3 border-b bg-gray-50 flex-shrink-0"
        style={{ 
          backgroundColor: 'var(--color-bg-muted)', 
          borderColor: 'var(--color-border)',
          minHeight: '56px',
          maxHeight: '56px'
        }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <GripVertical 
            className="w-4 h-4 sm:w-5 sm:h-5 cursor-move flex-shrink-0" 
            style={{ color: 'var(--color-text-muted)' }}
            onMouseDown={handleCodePanelDragStart}
          />
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
              <div className="w-4 h-4 sm:w-5 sm:h-5 text-xs" style={{ color: 'var(--color-primary)' }}>📝</div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-xs sm:text-sm truncate" style={{ color: 'var(--color-text)' }}>
                Generated Code Panel
              </h3>
              <p className="text-xs hidden sm:block" style={{ color: 'var(--color-text-muted)' }}>
                {codePanelMinimized ? 'Click to expand' : 'Drag handle to resize • Drag to move to sidebar →'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Hide move button on mobile to save space */}
          <button
            onClick={moveCodePanelToRightSidebar}
            className="hidden sm:flex px-3 py-2 text-xs rounded-lg transition-colors text-white items-center gap-2"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Move className="w-4 h-4" />
            <span className="hidden md:inline">Move to Sidebar</span>
          </button>
          
          <button
            onClick={() => setCodePanelMinimized(!codePanelMinimized)}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            title={codePanelMinimized ? 'Expand' : 'Minimize'}
          >
            {codePanelMinimized ? <Maximize2 className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setShowCodePanel(false)}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Content area - FIXED with proper flex sizing */}
      {!codePanelMinimized && (
        <div className="flex-1 min-h-0 overflow-hidden">
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
              isMobile={window.innerWidth < 768}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BottomCodePanel;