import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  GripVertical, 
  GripHorizontal, 
  Move, 
  Maximize2, 
  ChevronDown, 
  X, 
  Code2 
} from 'lucide-react';
import CodePanel from './CodePanel';

const BottomCodePanel = ({
  showCodePanel,
  setShowCodePanel, // UPDATED: This should now be the handleCloseCodePanel function
  codePanelMinimized,
  setCodePanelMinimized,
  codePanelHeight,
  setCodePanelHeight,
  codePanelRef,
  moveCodePanelToRightSidebar,
  handleCodePanelDragStart,
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
  setCodePanelPosition,
  isMobile,
  windowDimensions
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartHeight, setDragStartHeight] = useState(codePanelHeight || 400);

  const panelRef = useRef(null);

  // Start drag (mouse + touch)
  const startDrag = (clientY) => {
    setIsDragging(true);
    setDragStartY(clientY);
    setDragStartHeight(codePanelHeight || 400);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseDown = (e) => startDrag(e.clientY);
  const handleTouchStart = (e) => startDrag(e.touches[0].clientY);

  // Handle move
  const handleMove = (clientY) => {
    if (!isDragging) return;
    const deltaY = dragStartY - clientY;
    const vh = window.innerHeight;
    const maxHeight = vh * 0.7;
    const newHeight = Math.max(200, Math.min(maxHeight, dragStartHeight + deltaY));
    setCodePanelHeight(newHeight);
  };

  const handleMouseMove = (e) => handleMove(e.clientY);
  const handleTouchMove = (e) => handleMove(e.touches[0].clientY);

  // End drag
  const stopDrag = () => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  const handleMouseUp = stopDrag;
  const handleTouchEnd = stopDrag;

  // Attach/remove listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragStartY, dragStartHeight]);

  // UPDATED: Handle close panel - calls the proper toggle function
  const handleClosePanel = () => {
    console.log('BottomCodePanel: Close button clicked');
    if (setShowCodePanel && typeof setShowCodePanel === 'function') {
      setShowCodePanel(); // This should now call handleCloseCodePanel which toggles the ForgeStore
    }
  };

  if (!showCodePanel) return null;

  // Responsive height
  const getResponsiveHeight = () => {
    const vh = windowDimensions?.height || window.innerHeight;
    const isMobileDevice = isMobile || window.innerWidth < 768;
    
    if (codePanelMinimized) return '60px';
    if (isMobileDevice) return `${Math.min(codePanelHeight, vh * 0.7)}px`;
    return `${Math.min(codePanelHeight, vh * 0.6)}px`;
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-50 flex flex-col"
      style={{
        height: getResponsiveHeight(),
        minHeight: codePanelMinimized ? 'auto' : '200px',
        maxHeight: codePanelMinimized ? 'auto' : '80vh',
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Resize handle */}
      {!codePanelMinimized && (
        <div
          className="h-2 bg-gray-100 hover:bg-gray-200 cursor-ns-resize flex items-center justify-center transition-colors border-b border-gray-200 group"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          title="Drag to resize panel"
        >
          <GripHorizontal className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-2 sm:p-3 border-b bg-gray-50 flex-shrink-0"
        style={{ 
          backgroundColor: 'var(--color-bg-muted)', 
          borderColor: 'var(--color-border)',
          minHeight: '56px',
          maxHeight: '56px'
        }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {handleCodePanelDragStart && (
            <GripVertical
              className="w-4 h-4 sm:w-5 sm:h-5 cursor-move flex-shrink-0"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseDown={handleCodePanelDragStart}
            />
          )}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
              <Code2 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-xs sm:text-sm truncate" style={{ color: 'var(--color-text)' }}>
                Generated Code Panel
              </h3>
              <p className="text-xs hidden sm:block" style={{ color: 'var(--color-text-muted)' }}>
                {codePanelMinimized ? 'Click to expand' : 'Drag to resize • Drag to move →'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Move to Sidebar (desktop only) */}
          {moveCodePanelToRightSidebar && (
            <button
              onClick={moveCodePanelToRightSidebar}
              className="hidden sm:flex px-3 py-2 text-xs rounded-lg transition-colors text-white items-center gap-2"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Move className="w-4 h-4" />
              <span className="hidden md:inline">Move to Sidebar</span>
            </button>
          )}

          {/* Minimize/Expand */}
          <button
            onClick={() => setCodePanelMinimized(!codePanelMinimized)}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            title={codePanelMinimized ? 'Expand' : 'Minimize'}
          >
            {codePanelMinimized ? <Maximize2 className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Close - UPDATED to use proper handler */}
          <button
            onClick={handleClosePanel}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!codePanelMinimized && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <CodePanel
            showTooltips={showTooltips}
            setShowTooltips={setShowTooltips}
            codePanelMinimized={codePanelMinimized}
            setCodePanelMinimized={setCodePanelMinimized}
            setShowCodePanel={handleClosePanel} // Pass the proper close handler
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
            isMobile={isMobile}
          />
        </div>
      )}
    </motion.div>
  );
};

export default BottomCodePanel;