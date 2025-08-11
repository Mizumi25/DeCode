// @/Components/Forge/CodeTooltip.jsx
import React from 'react';

const CodeTooltip = ({ hoveredToken, showTooltips }) => {
  if (!hoveredToken || !showTooltips) return null;

  return (
    <div
      className="fixed z-[9999] px-4 py-3 text-xs rounded-lg shadow-xl pointer-events-none max-w-xs"
      style={{
        backgroundColor: '#2d3748',
        color: '#e2e8f0',
        border: '1px solid #4a5568',
        left: Math.max(10, Math.min(hoveredToken.x - 150, window.innerWidth - 320)),
        top: hoveredToken.y - 80,
        backdropFilter: 'blur(20px)'
      }}
    >
      <div className="font-semibold mb-2 flex items-center gap-2">
        <span className={`inline-block w-2 h-2 rounded-full ${
          hoveredToken.tooltip.type === 'keyword' ? 'bg-blue-400' :
          hoveredToken.tooltip.type === 'string' ? 'bg-green-400' :
          hoveredToken.tooltip.type === 'element' ? 'bg-purple-400' :
          hoveredToken.tooltip.type === 'layout' ? 'bg-orange-400' :
          hoveredToken.tooltip.type === 'spacing' ? 'bg-pink-400' :
          hoveredToken.tooltip.type === 'hook' ? 'bg-red-400' :
          'bg-gray-400'
        }`}></span>
        <span className="text-white">{hoveredToken.token}</span>
        <span className="text-xs opacity-60 bg-gray-600 px-2 py-0.5 rounded">
          {hoveredToken.tooltip.type}
        </span>
      </div>
      <div className="text-xs leading-relaxed text-gray-300">{hoveredToken.tooltip.description}</div>
      {/* Tooltip arrow */}
      <div 
        className="absolute top-full left-1/2 transform -translate-x-1/2"
        style={{
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #2d3748'
        }}
      />
    </div>
  );
};

export default CodeTooltip;