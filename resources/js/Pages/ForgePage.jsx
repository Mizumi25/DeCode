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
      
      <div className="h-[calc(100vh-60px)] flex items-center justify-center">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Forge Page</h1>
      </div>

      {/* Forge Panel (Component Library) */}
      <Panel
        isOpen={panelStates.forge}
        onClose={() => handlePanelToggle('forge')}
        onMaximize={() => handlePanelMaximize('forge')}
        position="left"
        size="medium"
        title="Component Library"
      >
        <div className="p-4">
          <p className="text-[var(--color-text)]">Forge Panel Content</p>
        </div>
      </Panel>

      {/* Source Panel (when opened from forge) */}
      <Panel
        isOpen={panelStates.source}
        onClose={() => handlePanelToggle('source')}
        onMaximize={() => handlePanelMaximize('source')}
        position="right"
        size="large"
        title="Source Code"
      >
        <div className="p-4">
          <p className="text-[var(--color-text)]">Source Panel Content</p>
        </div>
      </Panel>
    </AuthenticatedLayout>
  );
}