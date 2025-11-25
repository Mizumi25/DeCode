// @/Components/Forge/SectionHoverAddLine.jsx - Framer-style hover add line
import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const SectionHoverAddLine = ({ position = 'top', onAdd, componentId }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const isTop = position === 'top';
  
  return (
    <div
      className="absolute left-0 right-0 group z-[100]"
      style={{
        [isTop ? 'top' : 'bottom']: '-16px',
        height: '32px',
        pointerEvents: 'auto',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Invisible hover zone - larger for easier triggering */}
      <div className="absolute inset-0" />
      
      {/* Visible line with plus button */}
      <div
        className={`
          absolute left-0 right-0 transition-all duration-200
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          top: '50%',
          transform: 'translateY(-50%)',
          height: '2px',
          backgroundColor: '#38bdf8',
          boxShadow: '0 0 8px rgba(56, 189, 248, 0.5)',
        }}
      >
        {/* Plus button in center */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd?.(componentId, position);
          }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                     transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#38bdf8',
            border: '2px solid white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Plus className="w-4 h-4 text-white" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default SectionHoverAddLine;
