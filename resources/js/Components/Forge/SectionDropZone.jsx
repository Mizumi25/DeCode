// resources/js/Components/Forge/SectionDropZone.jsx
import React from 'react';
import { Plus, Layout } from 'lucide-react';

const SectionDropZone = ({ 
  position, 
  onDrop, 
  onDragOver, 
  onDragLeave, 
  isDragOver = false,
  isVisible = true 
}) => {
  if (!isVisible) return null;

  const positionClasses = {
    top: 'top-0 -translate-y-1/2',
    bottom: 'bottom-0 translate-y-1/2',
    between: 'top-1/2 -translate-y-1/2'
  };

  return (
    <div 
      className={`
        absolute left-0 right-0 h-16 z-20 transition-all duration-200
        ${positionClasses[position]}
        ${isDragOver ? 'opacity-100' : 'opacity-0 hover:opacity-100'}
      `}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <div className={`
        w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center
        transition-all duration-200
        ${isDragOver 
          ? 'border-blue-500 bg-blue-50 shadow-lg' 
          : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-25'
        }
      `}>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Plus className="w-4 h-4" />
          <span>Drop Section Here</span>
          <Layout className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default SectionDropZone;