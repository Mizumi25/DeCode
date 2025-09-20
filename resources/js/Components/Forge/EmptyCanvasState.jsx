// @/Components/Forge/EmptyCanvasState.jsx - WYSIWYG Canvas with Body-like Structure
import React from 'react';
import { Layout, Plus, Sparkles } from 'lucide-react';

const EmptyCanvasState = ({ 
  frameType = 'page', 
  onAddSection,
  onDragOver,
  onDrop,
  isDragOver = false 
}) => {
  const isPageType = frameType === 'page';
  
  return (
    <div 
      className={`
        w-full mx-auto relative transition-all duration-300 ease-in-out
        ${isDragOver ? 'bg-blue-50 border-blue-300' : 'bg-white'}
      `}
      style={{
        minHeight: '100vh',
        maxWidth: '100%',
        backgroundColor: isDragOver ? 'rgba(59, 130, 246, 0.05)' : 'var(--color-surface)',
        border: isDragOver ? '2px dashed var(--color-primary)' : '1px solid var(--color-border)',
        borderRadius: '0px', // Body-like, no border radius
        boxShadow: isDragOver ? '0 0 30px rgba(59, 130, 246, 0.2)' : 'var(--shadow-sm)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: '1.6'
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Document Structure Indicator */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 opacity-50"
        style={{ backgroundColor: 'var(--color-primary)' }}
      />
      
      {/* Invisible HTML/Body Structure */}
      <div className="min-h-full relative">
        {/* HTML Element Representation */}
        <div 
          className="absolute top-2 left-2 text-xs opacity-40 font-mono select-none"
          style={{ color: 'var(--color-text-muted)' }}
        >
          &lt;html&gt;
        </div>
        
        {/* Body Element Representation */}
        <div 
          className="absolute top-6 left-4 text-xs opacity-40 font-mono select-none"
          style={{ color: 'var(--color-text-muted)' }}
        >
          &lt;body&gt;
        </div>
        
        {/* Main Content Area - This is the actual droppable area */}
        <div className="pt-12 px-8 pb-8 min-h-full relative">
          
          {isPageType ? (
            /* Page Type - Must start with sections */
            <div className="space-y-8">
              {/* Page Structure Guide */}
              <div 
                className="text-center py-16 border-2 border-dashed rounded-xl transition-all duration-300"
                style={{ 
                  borderColor: isDragOver ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: isDragOver ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                }}
              >
                <div className="max-w-md mx-auto space-y-6">
                  <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
                    <Layout className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                      Start Building Your Page
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                      Pages must begin with <strong>layout elements</strong> like sections or containers. 
                      This ensures proper document structure and accessibility.
                    </p>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={onAddSection}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 hover:shadow-lg"
                      style={{ 
                        backgroundColor: 'var(--color-primary)',
                        color: 'white'
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Section
                    </button>
                    
                    <div className="text-xs opacity-75" style={{ color: 'var(--color-text-muted)' }}>
                      Or drag a <strong>Section</strong>, <strong>Container</strong>, or <strong>Div</strong> from the Layout category
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Visual Page Structure Guide */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <Sparkles className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                  Page Structure Hierarchy
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { 
                      name: 'Header Section',
                      desc: 'Navigation, logo, main menu',
                      color: '#10b981',
                      elements: ['Logo', 'Navigation', 'Search']
                    },
                    { 
                      name: 'Content Sections', 
                      desc: 'Main page content areas',
                      color: '#3b82f6',
                      elements: ['Hero', 'Features', 'About']
                    },
                    { 
                      name: 'Footer Section',
                      desc: 'Links, contact, copyright',
                      color: '#8b5cf6',
                      elements: ['Links', 'Contact', 'Social']
                    }
                  ].map((section, index) => (
                    <div 
                      key={section.name}
                      className="p-4 rounded-xl border transition-all hover:shadow-md"
                      style={{ 
                        backgroundColor: 'var(--color-bg-muted)',
                        borderColor: section.color + '30'
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: section.color }}
                        />
                        <h4 className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                          {section.name}
                        </h4>
                      </div>
                      <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                        {section.desc}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {section.elements.map(element => (
                          <span 
                            key={element}
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: section.color + '20',
                              color: section.color
                            }}
                          >
                            {element}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Component Type - Can start with any element */
            <div 
              className="text-center py-20 border-2 border-dashed rounded-xl transition-all duration-300"
              style={{ 
                borderColor: isDragOver ? 'var(--color-primary)' : 'var(--color-border)',
                backgroundColor: isDragOver ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
              }}
            >
              <div className="max-w-sm mx-auto space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
                  <Sparkles className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                    Build Your Component
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    Drag any element or component from the sidebar to start building.
                    Components are reusable pieces that can be used across your project.
                  </p>
                </div>
                
                <div className="text-xs opacity-75" style={{ color: 'var(--color-text-muted)' }}>
                  Start with any element - buttons, inputs, cards, or layouts
                </div>
              </div>
            </div>
          )}
          
          {/* Drag Overlay */}
          {isDragOver && (
            <div 
              className="absolute inset-0 flex items-center justify-center z-10 rounded-xl"
              style={{ 
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                backdropFilter: 'blur(2px)'
              }}
            >
              <div 
                className="bg-white border-2 border-dashed rounded-2xl p-8 shadow-2xl"
                style={{ 
                  borderColor: 'var(--color-primary)',
                  backgroundColor: 'var(--color-surface)'
                }}
              >
                <div className="text-center">
                  <Plus 
                    className="w-12 h-12 mx-auto mb-4 animate-pulse" 
                    style={{ color: 'var(--color-primary)' }} 
                  />
                  <div className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                    Drop Here
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {isPageType ? 'Add layout element to structure your page' : 'Add component to your canvas'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Closing Body Tag */}
        <div 
          className="absolute bottom-6 left-4 text-xs opacity-40 font-mono select-none"
          style={{ color: 'var(--color-text-muted)' }}
        >
          &lt;/body&gt;
        </div>
        
        {/* Closing HTML Tag */}
        <div 
          className="absolute bottom-2 left-2 text-xs opacity-40 font-mono select-none"
          style={{ color: 'var(--color-text-muted)' }}
        >
          &lt;/html&gt;
        </div>
      </div>
    </div>
  );
};

export default EmptyCanvasState;