import React, { useState, useRef, useCallback } from 'react'
import { Palette, Shuffle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Color picker component (simplified version - you can replace with react-color or similar)
const ColorPicker = ({ color, onChange, onClose }) => {
  const canvasRef = useRef(null);
  const [hue, setHue] = useState(200);
  
  // Simple HSV to RGB conversion
  const hsvToRgb = (h, s, v) => {
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;
    
    let r, g, b;
    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  };

  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const handleSaturationBrightnessClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const saturation = x / rect.width;
    const brightness = 1 - (y / rect.height);
    
    const [r, g, b] = hsvToRgb(hue, saturation, brightness);
    const hexColor = rgbToHex(r, g, b);
    onChange(hexColor);
  };

  return (
    <div className="p-4 space-y-4 w-80">
      {/* Color preview strips like Discord */}
      <div className="flex gap-2 mb-4">
        <div 
          className="flex-1 h-12 rounded-lg border-2 border-white shadow-lg relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}80)` }}
        >
          <div className="absolute top-1 left-1 w-6 h-6 bg-black rounded border border-white/50"></div>
          <div className="absolute top-1 left-8 w-6 h-6 bg-white rounded border border-black/20"></div>
          <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded border border-black/20"></div>
        </div>
      </div>

      {/* Main color area */}
      <div 
        className="w-full h-48 rounded-lg cursor-crosshair relative border border-[var(--color-border)]"
        style={{
          background: `
            linear-gradient(to bottom, transparent, black),
            linear-gradient(to right, white, hsl(${hue}, 100%, 50%))
          `
        }}
        onClick={handleSaturationBrightnessClick}
      >
        {/* Color indicator dot */}
        <div 
          className="absolute w-3 h-3 border-2 border-white rounded-full shadow-lg pointer-events-none"
          style={{ 
            top: '20%', 
            left: '60%',
            transform: 'translate(-50%, -50%)'
          }}
        ></div>
      </div>

      {/* Hue slider */}
      <div className="space-y-2">
        <div 
          className="w-full h-4 rounded-full cursor-pointer relative"
          style={{
            background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
          }}
          onClick={(e) => {
            const rect = e.target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const newHue = (x / rect.width) * 360;
            setHue(newHue);
            
            const [r, g, b] = hsvToRgb(newHue, 0.8, 0.9);
            const hexColor = rgbToHex(r, g, b);
            onChange(hexColor);
          }}
        >
          <div 
            className="absolute top-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full shadow-lg transform -translate-y-1/2"
            style={{ left: `${(hue / 360) * 100}%`, marginLeft: '-8px' }}
          ></div>
        </div>
      </div>

      {/* Color input */}
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-8 rounded border border-[var(--color-border)] shadow-sm"
          style={{ backgroundColor: color }}
        ></div>
        <input
          type="text"
          value={color.toUpperCase()}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)] font-mono"
          placeholder="#000000"
        />
      </div>

      {/* Controls */}
      <div className="space-y-3 pt-2 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--color-text)]">Color Intensity</span>
          <span className="text-sm text-[var(--color-text-muted)]">100%</span>
        </div>
        <div className="w-full h-2 bg-[var(--color-bg-muted)] rounded-full relative">
          <div 
            className="h-full rounded-full relative"
            style={{ 
              width: '100%',
              background: `linear-gradient(to right, ${color}20, ${color})`
            }}
          >
            <div className="absolute right-0 top-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full shadow-lg transform -translate-y-1/2"></div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-3">
        <button
          onClick={() => {
            // Generate random color
            const randomHue = Math.floor(Math.random() * 360);
            const [r, g, b] = hsvToRgb(randomHue, 0.7, 0.8);
            const randomColor = rgbToHex(r, g, b);
            setHue(randomHue);
            onChange(randomColor);
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm bg-[var(--color-bg-muted)] hover:bg-[var(--color-border)] rounded-lg transition-colors text-[var(--color-text)]"
        >
          <Shuffle size={14} />
          Surprise Me!
        </button>
        <button
          onClick={() => onChange('#0055FF')}
          className="px-3 py-2 text-sm border border-[var(--color-border)] hover:bg-[var(--color-bg-muted)] rounded-lg transition-colors text-[var(--color-text)]"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

// Theme colors matching the store
const themeColors = [
  { name: 'DeCode', color: '#0055FF', gradient: 'linear-gradient(135deg, #0055FF, #0099FF)', isDefault: true },
  { name: 'Mint', color: '#7dd3fc', gradient: 'linear-gradient(135deg, #7dd3fc, #a7f3d0)' },
  { name: 'Sunset', color: '#fbbf24', gradient: 'linear-gradient(135deg, #fbbf24, #f97316)' },
  { name: 'Lavender', color: '#c084fc', gradient: 'linear-gradient(135deg, #c084fc, #a855f7)' },
  { name: 'Forest', color: '#34d399', gradient: 'linear-gradient(135deg, #34d399, #059669)' },
  { name: 'Rose', color: '#f472b6', gradient: 'linear-gradient(135deg, #f472b6, #ec4899)' },
  { name: 'Ocean', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #1e40af)' },
  { name: 'Amber', color: '#d97706', gradient: 'linear-gradient(135deg, #d97706, #92400e)' },
  { name: 'Sage', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #047857)' },
  { name: 'Purple', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  { name: 'Teal', color: '#14b8a6', gradient: 'linear-gradient(135deg, #14b8a6, #0f766e)' },
  { name: 'Crimson', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
  { name: 'Indigo', color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
  { name: 'Emerald', color: '#22c55e', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
  { name: 'Pink', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' },
  { name: 'Cyan', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
  { name: 'Violet', color: '#7c3aed', gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)' },
  { name: 'Lime', color: '#65a30d', gradient: 'linear-gradient(135deg, #65a30d, #4d7c0f)' },
  { name: 'Fuchsia', color: '#d946ef', gradient: 'linear-gradient(135deg, #d946ef, #c026d3)' },
  { name: 'Sky', color: '#0ea5e9', gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)' },
  { name: 'Orange', color: '#f97316', gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
  { name: 'Slate', color: '#64748b', gradient: 'linear-gradient(135deg, #64748b, #475569)' },
  { name: 'DeCode', color: '#A052FF', gradient: 'linear-gradient(135deg, #A052FF, #944BEB)' }
]

const EnhancedThemeSelector = ({ currentTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [customColor, setCustomColor] = useState('#0055FF')

  const handleThemeSelect = (theme) => {
    onThemeChange(theme)
    setIsOpen(false)
  }

  const handleCustomColorChange = (color) => {
    setCustomColor(color)
    // Create a custom theme object
    const customTheme = {
      name: 'Custom',
      color: color,
      gradient: `linear-gradient(135deg, ${color}, ${color}80)`
    }
    onThemeChange(customTheme)
  }

  const handleAddCustomColor = () => {
    const customTheme = {
      name: 'Custom',
      color: customColor,
      gradient: `linear-gradient(135deg, ${customColor}, ${customColor}80)`
    }
    onThemeChange(customTheme)
    setShowColorPicker(false)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-[var(--color-bg-muted)] rounded transition-colors"
        title="Choose Theme"
      >
        <Palette className="w-3 h-3 text-[var(--color-text)]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => {
                setIsOpen(false)
                setShowColorPicker(false)
              }}
            />
            
            {/* Main Dropdown Panel */}
            {!showColorPicker ? (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute top-full mt-2 left-0 w-96 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl z-50 overflow-hidden"
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-[var(--color-border)]">
                  <h3 className="text-base font-semibold text-[var(--color-text)]">Colors</h3>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    Make DeCode yours with a custom color that reflects your style.
                  </p>
                </div>

                {/* Preview strips (Discord style) */}
                <div className="px-6 py-4 space-y-3">
                  <div className="flex gap-2">
                    {[currentTheme?.color || '#0055FF', '#ffffff', '#000000'].map((color, idx) => (
                      <div 
                        key={idx}
                        className="flex-1 h-16 rounded-lg border border-[var(--color-border)] shadow-sm relative overflow-hidden"
                        style={{ 
                          background: idx === 0 
                            ? `linear-gradient(135deg, ${color}, ${color}80)` 
                            : color
                        }}
                      >
                        {idx === 0 && (
                          <>
                            <div className="absolute top-2 left-2 w-4 h-4 bg-black rounded border border-white/30"></div>
                            <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded border border-black/20"></div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color Grid */}
                <div className="px-6 pb-4">
                  <div className="grid grid-cols-8 gap-2 mb-4">
                    {themeColors.map((theme, index) => (
                      <motion.button
                        key={theme.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02, duration: 0.2 }}
                        onClick={() => handleThemeSelect(theme)}
                        className={`relative w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 ${
                          currentTheme?.name === theme.name 
                            ? 'ring-2 ring-[var(--color-text)] ring-offset-2 ring-offset-[var(--color-surface)]' 
                            : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2 hover:ring-offset-[var(--color-surface)]'
                        }`}
                        style={{ 
                          background: theme.gradient,
                          boxShadow: currentTheme?.name === theme.name 
                            ? `0 0 0 2px var(--color-surface), 0 0 0 4px ${theme.color}` 
                            : 'none'
                        }}
                        title={theme.name}
                      >
                        {currentTheme?.name === theme.name && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>

                  {/* Add Custom Color Button */}
                  <button
                    onClick={() => setShowColorPicker(true)}
                    className="w-full py-3 px-4 text-sm bg-[var(--color-bg-muted)] hover:bg-[var(--color-border)] rounded-lg transition-colors text-[var(--color-text)] font-medium flex items-center justify-center gap-2"
                  >
                    <div className="w-4 h-4 rounded border-2 border-dashed border-[var(--color-text-muted)] flex items-center justify-center">
                      <span className="text-xs font-bold text-[var(--color-text-muted)]">+</span>
                    </div>
                    Add Custom Color
                  </button>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-[var(--color-bg-muted)] border-t border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-muted)] text-center">
                    All colors are completely free and sync across your devices!
                  </p>
                </div>
              </motion.div>
            ) : (
              /* Color Picker Panel */
              <motion.div
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute top-full mt-2 left-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl z-50 overflow-hidden"
              >
                {/* Color Picker Header */}
                <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--color-text)]">Custom Color</h3>
                  <button
                    onClick={() => setShowColorPicker(false)}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-sm"
                  >
                    Back
                  </button>
                </div>

                {/* Color Picker Component */}
                <ColorPicker 
                  color={customColor}
                  onChange={handleCustomColorChange}
                  onClose={() => setShowColorPicker(false)}
                />

                {/* Color Picker Footer */}
                <div className="px-4 py-3 bg-[var(--color-bg-muted)] border-t border-[var(--color-border)] flex gap-2">
                  <button
                    onClick={() => setShowColorPicker(false)}
                    className="flex-1 py-2 px-3 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustomColor}
                    className="flex-1 py-2 px-3 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Apply Color
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export { themeColors }
export default EnhancedThemeSelector