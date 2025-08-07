// Modify your existing ForgePage.jsx
import React, { useState } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Panel from '@/Components/Panel';

export default function ForgePage({ projectId, frameId }) {
  // Panel states
  const [panelStates, setPanelStates] = useState({
    forge: false,
    source: false
  })
  
  const handlePanelClose = (panelId) => {
    console.log(`Panel ${panelId} closed`)
  }

  // Panel state change handler
  const handlePanelStateChange = (hasRightPanels) => {
    console.log(`Right panels active: ${hasRightPanels}`)
  }

  // Handle panel toggle
  const handlePanelToggle = (panelType) => {
    setPanelStates(prev => ({
      ...prev,
      [panelType]: !prev[panelType]
    }))
  }

  // Handle panel maximize (switch to full view)
  const handlePanelMaximize = (panelType) => {
    if (panelType === 'source') {
      // Navigate to source page
      router.visit('/source', { preserveState: true })
    }
    // Close the panel
    setPanelStates(prev => ({
      ...prev,
      [panelType]: false
    }))
  }

  // Handle mode switching from header dropdown
  const handleModeSwitch = (mode) => {
    if (mode === 'source') {
      router.visit('/source', { preserveState: true })
    }
    // 'forge' mode is already current, so no action needed
  }
  
  
  const defaultPanels = [
    {
      id: 'components',
      title: 'Components',
      content: (
        <div className="space-y-4">
          <div className="text-sm text-[var(--color-text-muted)] mb-4">
            Drag and drop components to build your page
          </div>
          
          <div className="space-y-2">
            <div className="p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:bg-[var(--color-bg-hover)] transition-colors">
              <div className="font-medium text-sm">Button</div>
              <div className="text-xs text-[var(--color-text-muted)]">Interactive button component</div>
            </div>
            
            <div className="p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:bg-[var(--color-bg-hover)] transition-colors">
              <div className="font-medium text-sm">Input</div>
              <div className="text-xs text-[var(--color-text-muted)]">Text input field</div>
            </div>
            
            <div className="p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:bg-[var(--color-bg-hover)] transition-colors">
              <div className="font-medium text-sm">Card</div>
              <div className="text-xs text-[var(--color-text-muted)]">Container with shadow</div>
            </div>
            
            <div className="p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:bg-[var(--color-bg-hover)] transition-colors">
              <div className="font-medium text-sm">Grid</div>
              <div className="text-xs text-[var(--color-text-muted)]">Responsive grid layout</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'layers',
      title: 'Layers',
      content: (
        <div className="space-y-4">
          <div className="text-sm text-[var(--color-text-muted)] mb-4">
            Page structure and hierarchy
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 p-2 rounded hover:bg-[var(--color-bg-hover)] transition-colors">
              <div className="w-4 h-4 border border-[var(--color-border)] rounded"></div>
              <span className="text-sm">Root Container</span>
            </div>
            
            <div className="flex items-center gap-2 p-2 pl-6 rounded hover:bg-[var(--color-bg-hover)] transition-colors">
              <div className="w-4 h-4 border border-[var(--color-border)] rounded"></div>
              <span className="text-sm">Header Section</span>
            </div>
            
            <div className="flex items-center gap-2 p-2 pl-6 rounded hover:bg-[var(--color-bg-hover)] transition-colors">
              <div className="w-4 h-4 border border-[var(--color-border)] rounded"></div>
              <span className="text-sm">Main Content</span>
            </div>
            
            <div className="flex items-center gap-2 p-2 pl-10 rounded hover:bg-[var(--color-bg-hover)] transition-colors">
              <div className="w-4 h-4 border border-[var(--color-border)] rounded"></div>
              <span className="text-sm">Hero Section</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'properties',
      title: 'Properties',
      content: (
        <div className="space-y-4">
          <div className="text-sm text-[var(--color-text-muted)] mb-4">
            Element properties and styling
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Width</label>
              <input 
                type="text" 
                placeholder="auto" 
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Height</label>
              <input 
                type="text" 
                placeholder="auto" 
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Background</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  className="w-12 h-9 border border-[var(--color-border)] rounded"
                />
                <input 
                  type="text" 
                  placeholder="#ffffff" 
                  className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'assets',
      title: 'Assets',
      content: (
        <div className="space-y-4">
          <div className="text-sm text-[var(--color-text-muted)] mb-4">
            Images, icons, and media files
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="aspect-square bg-[var(--color-bg-muted)] rounded-lg border border-[var(--color-border)] flex items-center justify-center cursor-pointer hover:bg-[var(--color-bg-hover)] transition-colors">
              <span className="text-xs text-[var(--color-text-muted)]">Image 1</span>
            </div>
            
            <div className="aspect-square bg-[var(--color-bg-muted)] rounded-lg border border-[var(--color-border)] flex items-center justify-center cursor-pointer hover:bg-[var(--color-bg-hover)] transition-colors">
              <span className="text-xs text-[var(--color-text-muted)]">Image 2</span>
            </div>
            
            <div className="aspect-square bg-[var(--color-bg-muted)] rounded-lg border border-[var(--color-border)] flex items-center justify-center cursor-pointer hover:bg-[var(--color-bg-hover)] transition-colors">
              <span className="text-xs text-[var(--color-text-muted)]">Icon Set</span>
            </div>
            
            <div className="aspect-square bg-[var(--color-bg-muted)] rounded-lg border border-[var(--color-border)] flex items-center justify-center cursor-pointer hover:bg-[var(--color-bg-hover)] transition-colors">
              <span className="text-xs text-[var(--color-text-muted)]">Video</span>
            </div>
          </div>
          
          <button className="w-full py-2 px-4 border border-dashed border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors">
            Upload Assets
          </button>
        </div>
      )
    }
  ]

  return (
    <AuthenticatedLayout
      // Pass the panel functions to header
      headerProps={{
        onPanelToggle: handlePanelToggle,
        panelStates: panelStates,
        onModeSwitch: handleModeSwitch
      }}
    >
      <Head title="Forge - Visual Builder" />
      
      {/* Main content area */}
      <div className="h-[calc(100vh-60px)] flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Visual Builder</h1>
          <p className="text-[var(--color-text-muted)] max-w-md">
            Drag components from the left panel to build your page. 
            Use the right panel for properties and assets.
          </p>
          <div className="w-full h-64 border-2 border-dashed border-[var(--color-border)] rounded-lg flex items-center justify-center">
            <span className="text-[var(--color-text-muted)]">Drop components here</span>
          </div>
        </div>
      </div>

      {/* Panel System */}
      <Panel
        isOpen={true} // Always open in Forge page
        initialPanels={defaultPanels}
        allowedDockPositions={['left', 'right']}
        onPanelClose={handlePanelClose}
        onPanelStateChange={handlePanelStateChange}
        snapToEdge={false} // Don't snap to edge in Forge page (current default)
        mergePanels={true} // Enable merging functionality
        mergePosition="right" // Merge panels on the right dock by default
      />
    </AuthenticatedLayout>
  );
}

