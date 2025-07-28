// Modify your existing SourcePage.jsx
import React, { useState } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Panel from '@/Components/Panel';

export default function SourcePage({ projectId, frameId }) {
  // Panel states
  const [panelStates, setPanelStates] = useState({
    forge: false,
    source: false // This page IS the source, so it's like it's always open
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

      {/* Forge Panel (Component Library - when opened from source) */}
      <Panel
        isOpen={panelStates.forge}
        onClose={() => handlePanelToggle('forge')}
        onMaximize={() => handlePanelMaximize('forge')}
        position="left"
        size="medium"
        title="Visual Builder"
      >
        <div className="p-4">
          <p className="text-[var(--color-text)]">Forge Panel Content</p>
        </div>
      </Panel>
    </AuthenticatedLayout>
  );
}