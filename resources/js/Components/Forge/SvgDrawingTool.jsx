// @/Components/Forge/SvgDrawingTool.jsx - Windows Paint Style SVG Drawing Tool
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Pencil, Square, Circle, Type, Eraser, Undo, Redo, 
  Trash2, Save, Download, Palette, Move
} from 'lucide-react';

const SvgDrawingTool = ({ isOpen, onClose, onSave }) => {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('pencil'); // pencil, rectangle, circle, text, eraser
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [iconName, setIconName] = useState('My Icon');
  const [canvasSize] = useState({ width: 400, height: 400 });

  const tools = [
    { id: 'pencil', icon: Pencil, label: 'Pencil' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF'
  ];

  useEffect(() => {
    if (isOpen) {
      // Reset canvas when opened
      setPaths([]);
      setHistory([]);
      setHistoryIndex(-1);
      setIconName('My Icon');
    }
  }, [isOpen]);

  const startDrawing = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);

    if (tool === 'pencil') {
      setCurrentPath({
        type: 'path',
        points: [{ x, y }],
        color,
        strokeWidth,
      });
    } else if (tool === 'rectangle' || tool === 'circle') {
      setCurrentPath({
        type: tool,
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        color,
        strokeWidth,
      });
    } else if (tool === 'eraser') {
      // Remove paths under cursor
      const newPaths = paths.filter(path => !isPointInPath(path, x, y));
      setPaths(newPaths);
      addToHistory(newPaths);
    }
  };

  const draw = (e) => {
    if (!isDrawing || !currentPath) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'pencil') {
      setCurrentPath({
        ...currentPath,
        points: [...currentPath.points, { x, y }],
      });
    } else if (tool === 'rectangle' || tool === 'circle') {
      setCurrentPath({
        ...currentPath,
        endX: x,
        endY: y,
      });
    } else if (tool === 'eraser') {
      const newPaths = paths.filter(path => !isPointInPath(path, x, y));
      setPaths(newPaths);
    }
  };

  const stopDrawing = () => {
    if (currentPath && tool !== 'eraser') {
      const newPaths = [...paths, currentPath];
      setPaths(newPaths);
      addToHistory(newPaths);
    }
    setIsDrawing(false);
    setCurrentPath(null);
  };

  const addToHistory = (newPaths) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPaths);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPaths(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPaths(history[historyIndex + 1]);
    }
  };

  const clearCanvas = () => {
    setPaths([]);
    addToHistory([]);
  };

  const isPointInPath = (path, x, y) => {
    if (path.type === 'path') {
      return path.points.some(point => 
        Math.abs(point.x - x) < 10 && Math.abs(point.y - y) < 10
      );
    } else if (path.type === 'rectangle') {
      const minX = Math.min(path.startX, path.endX);
      const maxX = Math.max(path.startX, path.endX);
      const minY = Math.min(path.startY, path.endY);
      const maxY = Math.max(path.startY, path.endY);
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    } else if (path.type === 'circle') {
      const radius = Math.sqrt(
        Math.pow(path.endX - path.startX, 2) + Math.pow(path.endY - path.startY, 2)
      );
      const distance = Math.sqrt(
        Math.pow(x - path.startX, 2) + Math.pow(y - path.startY, 2)
      );
      return distance <= radius;
    }
    return false;
  };

  const renderPath = (path, index) => {
    if (path.type === 'path') {
      const d = path.points.map((point, i) => 
        `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
      ).join(' ');
      return (
        <path
          key={index}
          d={d}
          stroke={path.color}
          strokeWidth={path.strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    } else if (path.type === 'rectangle') {
      const x = Math.min(path.startX, path.endX);
      const y = Math.min(path.startY, path.endY);
      const width = Math.abs(path.endX - path.startX);
      const height = Math.abs(path.endY - path.startY);
      return (
        <rect
          key={index}
          x={x}
          y={y}
          width={width}
          height={height}
          stroke={path.color}
          strokeWidth={path.strokeWidth}
          fill="none"
        />
      );
    } else if (path.type === 'circle') {
      const radius = Math.sqrt(
        Math.pow(path.endX - path.startX, 2) + Math.pow(path.endY - path.startY, 2)
      );
      return (
        <circle
          key={index}
          cx={path.startX}
          cy={path.startY}
          r={radius}
          stroke={path.color}
          strokeWidth={path.strokeWidth}
          fill="none"
        />
      );
    }
    return null;
  };

  const generateSvgCode = () => {
    const svgPaths = [...paths, currentPath].filter(Boolean).map((path, index) => {
      if (path.type === 'path') {
        const d = path.points.map((point, i) => 
          `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
        ).join(' ');
        return `<path d="${d}" stroke="${path.color}" stroke-width="${path.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      } else if (path.type === 'rectangle') {
        const x = Math.min(path.startX, path.endX);
        const y = Math.min(path.startY, path.endY);
        const width = Math.abs(path.endX - path.startX);
        const height = Math.abs(path.endY - path.startY);
        return `<rect x="${x}" y="${y}" width="${width}" height="${height}" stroke="${path.color}" stroke-width="${path.strokeWidth}" fill="none"/>`;
      } else if (path.type === 'circle') {
        const radius = Math.sqrt(
          Math.pow(path.endX - path.startX, 2) + Math.pow(path.endY - path.startY, 2)
        );
        return `<circle cx="${path.startX}" cy="${path.startY}" r="${radius}" stroke="${path.color}" stroke-width="${path.strokeWidth}" fill="none"/>`;
      }
      return '';
    }).join('\n  ');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasSize.width} ${canvasSize.height}" width="24" height="24">
  ${svgPaths}
</svg>`;
  };

  const handleSave = () => {
    const svgCode = generateSvgCode();
    onSave({ name: iconName, svgCode });
  };

  const handleDownload = () => {
    const svgCode = generateSvgCode();
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${iconName.replace(/\s+/g, '_')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[var(--color-surface)] rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Pencil className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text)]">SVG Drawing Tool</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Create custom icons like Windows Paint</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--color-bg-muted)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Toolbar */}
            <div className="w-16 bg-[var(--color-bg-muted)] p-2 flex flex-col gap-2 border-r border-[var(--color-border)]">
              {tools.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTool(t.id)}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                      tool === t.id
                        ? 'bg-[var(--color-primary)] text-white shadow-lg'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]'
                    }`}
                    title={t.label}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
              
              <div className="my-2 border-t border-[var(--color-border)]" />
              
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="w-12 h-12 rounded-lg flex items-center justify-center transition-all bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30"
                title="Undo"
              >
                <Undo className="w-5 h-5" />
              </button>
              
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="w-12 h-12 rounded-lg flex items-center justify-center transition-all bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] disabled:opacity-30"
                title="Redo"
              >
                <Redo className="w-5 h-5" />
              </button>
              
              <button
                onClick={clearCanvas}
                className="w-12 h-12 rounded-lg flex items-center justify-center transition-all bg-[var(--color-surface)] text-red-500 hover:bg-red-50"
                title="Clear All"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="mb-4">
                <input
                  type="text"
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  placeholder="Icon name..."
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              
              <div className="bg-white rounded-lg shadow-inner p-4 inline-block">
                <svg
                  ref={canvasRef}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  className="border border-gray-300 cursor-crosshair bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                >
                  {paths.map(renderPath)}
                  {currentPath && renderPath(currentPath, 'current')}
                </svg>
              </div>
            </div>

            {/* Properties Panel */}
            <div className="w-64 bg-[var(--color-bg-muted)] p-4 border-l border-[var(--color-border)] overflow-auto">
              <h4 className="text-sm font-semibold mb-3 text-[var(--color-text)]">Properties</h4>
              
              {/* Color Picker */}
              <div className="mb-4">
                <label className="block text-xs font-medium mb-2 text-[var(--color-text)]">Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        color === c ? 'border-[var(--color-primary)] scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="mt-2 w-full h-10 rounded-lg cursor-pointer"
                />
              </div>

              {/* Stroke Width */}
              <div className="mb-4">
                <label className="block text-xs font-medium mb-2 text-[var(--color-text)]">
                  Stroke Width: {strokeWidth}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Preview */}
              <div className="mb-4">
                <label className="block text-xs font-medium mb-2 text-[var(--color-text)]">Preview</label>
                <div className="p-4 bg-white rounded-lg flex items-center justify-center">
                  <div 
                    className="w-16 h-16"
                    dangerouslySetInnerHTML={{ __html: generateSvgCode() }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--color-border)] flex justify-between items-center">
            <div className="text-xs text-[var(--color-text-muted)]">
              {paths.length} element{paths.length !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={handleSave}
                disabled={paths.length === 0}
                className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Icon
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SvgDrawingTool;
