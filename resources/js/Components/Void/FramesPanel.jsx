// @/Components/Void/FramesPanel.jsx
import React from 'react'
import { Layers, Plus, Eye, EyeOff, Trash2 } from 'lucide-react'

export default function FramesPanel() {
  return (
    <div className="h-full">
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-[var(--color-text)]">Frames</h4>
          <button 
            className="p-1 rounded hover:bg-[var(--color-bg-hover)]"
            style={{ color: 'var(--color-primary)' }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-[var(--color-text-muted)]">
          12 frames • 4 active
        </div>
      </div>

      <div className="overflow-y-auto h-full pb-20">
        <div className="p-4 space-y-3">
          {/* Frame Items */}
          {[
            { id: 1, name: 'HomePage', type: 'Page', visible: true, active: true },
            { id: 2, name: 'LoginForm', type: 'Component', visible: true, active: false },
            { id: 3, name: 'Dashboard', type: 'Page', visible: false, active: true },
            { id: 4, name: 'UserProfile', type: 'Component', visible: true, active: false },
            { id: 5, name: 'Navigation', type: 'Component', visible: true, active: true },
            { id: 6, name: 'Footer', type: 'Component', visible: false, active: false }
          ].map((frame) => (
            <div 
              key={frame.id}
              className={`p-3 rounded-lg border transition-colors ${
                frame.active ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-border)] bg-[var(--color-bg-muted)]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Layers className={`w-4 h-4 ${frame.active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} />
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    {frame.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1 rounded hover:bg-[var(--color-bg-hover)]">
                    {frame.visible ? (
                      <Eye className="w-3 h-3 text-[var(--color-text-muted)]" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-[var(--color-text-muted)]" />
                    )}
                  </button>
                  <button className="p-1 rounded hover:bg-red-100 hover:text-red-600">
                    <Trash2 className="w-3 h-3 text-[var(--color-text-muted)]" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-[var(--color-text-muted)]">
                {frame.type} • Last edited 2h ago
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}