// Modify your existing SourcePage.jsx
import React, { useState } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Panel from '@/Components/Panel';

export default function SourcePage({ projectId, frameId }) {
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
  ]

  // Handle panel maximize (switch to full view)
  const handlePanelMaximize = (panelType) => {
    if (panelType === 'forge') {
      // Navigate to forge page
      router.visit('/forge', { preserveState: true })
    }
    // Close the panel
    setPanelStates(prev => ({
      ...prev,
      [panelType]: false
    }))
  }
  
  const handlePanelToggle = (panelType) => {
    setPanelStates(prev => ({
      ...prev,
      [panelType]: !prev[panelType]
    }))
  }

  // Handle mode switching from header dropdown
  const handleModeSwitch = (mode) => {
    if (mode === 'forge') {
      router.visit('/forge', { preserveState: true })
    }
    // 'source' mode is already current, so no action needed
  }

  return (
    <AuthenticatedLayout
      // Pass the panel functions to header
      headerProps={{
        onPanelToggle: handlePanelToggle,
        panelStates: panelStates,
        onModeSwitch: handleModeSwitch
      }}
    >
      <Head title="Source - Code Editor" />
      
      <div className="h-[calc(100vh-60px)] flex items-center justify-center">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Source Page</h1>
      </div>

      {/* Panel System */}
      <Panel
        isOpen={true} // Always open in Forge page
        initialPanels={defaultPanels}
        allowedDockPositions={['left']}
        onPanelClose={handlePanelClose}
        onPanelStateChange={handlePanelStateChange}
        snapToEdge={true} 
      />
    </AuthenticatedLayout>
  );
}