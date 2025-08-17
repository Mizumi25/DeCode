// @/Components/Forge/CanvasComponent.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Square, Sparkles } from 'lucide-react';

const CanvasComponent = ({
  canvasRef,
  canvasComponents,
  selectedComponent,
  dragState,
  componentLibraryService, // Use the service instead of static library
  onCanvasDragOver,
  onCanvasDrop,
  onCanvasClick,
  onComponentClick
}) => {
  return (
    <div className="w-full max-w-6xl">
      <div className="text-center space-y-6 mb-8">
        <div>
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              background: 'linear-gradient(to right, var(--color-primary), #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Visual Builder
          </h1>
          <div
            className="w-24 h-1 rounded-full mx-auto"
            style={{ background: 'linear-gradient(to right, var(--color-primary), #7c3aed)' }}
          ></div>
        </div>
        <p
          className="text-lg max-w-2xl mx-auto leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Drag components from the sidebar to build your interface.
          <span
            className="font-semibold"
            style={{ color: 'var(--color-primary)' }}
          >
            {' '}Select and customize
          </span>{' '}
          elements in real-time.
        </p>
      </div>

      {/* Canvas Area */}
      <div
        ref={canvasRef}
        className={`relative w-full h-[500px] border-2 border-dashed rounded-2xl transition-all duration-300 ${
          dragState.isDragging ? 'scale-105' : ''
        }`}
        style={{
          borderColor: dragState.isDragging ? 'var(--color-primary)' : 'var(--color-border)',
          backgroundColor: dragState.isDragging ? 'var(--color-primary-soft)' : 'var(--color-surface)',
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(155, 155, 155, 0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px',
          boxShadow: 'var(--shadow-lg)'
        }}
        onDragOver={onCanvasDragOver}
        onDrop={onCanvasDrop}
        onClick={onCanvasClick}
      >
        {canvasComponents.length === 0 && !dragState.isDragging && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="mb-4">
                <Square
                  className="w-16 h-16 mx-auto opacity-50"
                  style={{ color: 'var(--color-text-muted)' }}
                />
              </div>
              <div
                className="text-lg font-medium"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Drop components here to start building
              </div>
              <div
                className="text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Your canvas awaits your creativity
              </div>
            </div>
          </div>
        )}

        {dragState.isDragging && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center space-y-3">
              <div className="animate-bounce">
                <Sparkles
                  className="w-12 h-12 mx-auto"
                  style={{ color: 'var(--color-primary)' }}
                />
              </div>
              <div
                className="font-bold text-xl"
                style={{ color: 'var(--color-primary)' }}
              >
                Drop {dragState.draggedComponent?.name} here
              </div>
              <div
                className="text-sm"
                style={{ color: 'var(--color-primary)' }}
              >
                Release to add to your design
              </div>
            </div>
          </div>
        )}

        {/* Render dropped components - UPDATED for dynamic rendering */}
        <AnimatePresence>
          {canvasComponents.map((component) => {
            const componentRenderer = componentLibraryService?.getComponent(component.type);

            if (!componentRenderer) {
              console.warn(`Component type "${component.type}" not found in library`);
              return (
                <motion.div
                  key={component.id}
                  initial={{ scale: 0, opacity: 0, rotate: -10 }}
                  animate={{
                    scale: selectedComponent === component.id ? 1.1 : 1,
                    opacity: 1,
                    rotate: 0
                  }}
                  exit={{ scale: 0, opacity: 0, rotate: 10 }}
                  whileHover={{ scale: 1.05 }}
                  className={`absolute cursor-pointer transition-all duration-300 ${
                    selectedComponent === component.id ? 'ring-4 ring-offset-2' : ''
                  }`}
                  style={{
                    left: component.position.x,
                    top: component.position.y,
                    ringColor: selectedComponent === component.id ? 'var(--color-primary)' : 'transparent',
                    boxShadow:
                      selectedComponent === component.id ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
                  }}
                  onClick={(e) => onComponentClick(component.id, e)}
                >
                  {/* Fallback for unknown component */}
                  <div className="p-2 bg-red-100 border border-red-300 rounded">
                    Unknown Component: {component.type}
                  </div>
                </motion.div>
              );
            }

            // If valid component renderer, render it dynamically
            return (
              <motion.div
                key={component.id}
                initial={{ scale: 0, opacity: 0, rotate: -10 }}
                animate={{
                  scale: selectedComponent === component.id ? 1.1 : 1,
                  opacity: 1,
                  rotate: 0
                }}
                exit={{ scale: 0, opacity: 0, rotate: 10 }}
                whileHover={{ scale: 1.05 }}
                className={`absolute cursor-pointer transition-all duration-300 ${
                  selectedComponent === component.id ? 'ring-4 ring-offset-2' : ''
                }`}
                style={{
                  left: component.position.x,
                  top: component.position.y,
                  ringColor: selectedComponent === component.id ? 'var(--color-primary)' : 'transparent',
                  boxShadow:
                    selectedComponent === component.id ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
                }}
                onClick={(e) => onComponentClick(component.id, e)}
              >
                {componentRenderer.render(component.props, component.id)}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Stats bar */}
      {canvasComponents.length > 0 && (
        <div className="mt-6 flex justify-center">
          <div
            className="border rounded-full px-6 py-3"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                ></div>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {canvasComponents.length} Component
                  {canvasComponents.length !== 1 ? 's' : ''}
                </span>
              </div>
              {selectedComponent && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  ></div>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    Selected: {canvasComponents.find((c) => c.id === selectedComponent)?.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasComponent;
