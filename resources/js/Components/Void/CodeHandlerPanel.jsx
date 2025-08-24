// @/Components/Void/CodeHandlerPanel.jsx
import React from 'react'
import { Code, Terminal, Play, Save, Zap, AlertCircle } from 'lucide-react'

export default function CodeHandlerPanel() {
  return (
    <div className="h-full">
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-[var(--color-text)]">Code Handler</h4>
          <div className="flex items-center gap-1">
            <button 
              className="p-1 rounded hover:bg-[var(--color-bg-hover)]"
              style={{ color: 'var(--color-primary)' }}
            >
              <Play className="w-4 h-4" />
            </button>
            <button 
              className="p-1 rounded hover:bg-[var(--color-bg-hover)]"
              style={{ color: 'var(--color-primary)' }}
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="text-xs text-[var(--color-text-muted)]">
          Active: HomePage.jsx
        </div>
      </div>

      <div className="overflow-y-auto h-full pb-20">
        {/* Code Actions */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center gap-2 p-2 rounded bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] transition-colors">
              <Terminal className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-sm text-[var(--color-text)]">Console</span>
            </button>
            <button className="flex items-center gap-2 p-2 rounded bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] transition-colors">
              <Zap className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-sm text-[var(--color-text)]">Generate</span>
            </button>
          </div>
        </div>

        {/* Code Snippets */}
        <div className="p-4">
          <h5 className="font-medium text-sm text-[var(--color-text)] mb-3">Recent Code</h5>
          
          <div className="space-y-3">
            {/* Code Block 1 */}
            <div className="bg-[var(--color-bg-muted)] rounded-lg p-3 border" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[var(--color-primary)]">React Component</span>
                <Code className="w-3 h-3 text-[var(--color-text-muted)]" />
              </div>
              <div className="text-xs font-mono text-[var(--color-text-muted)] leading-relaxed">
                const Button = &#123; onClick &#125; =&gt; &#123;<br />
                &nbsp;&nbsp;return &lt;button...&gt;<br />
                &#125;
              </div>
            </div>

            {/* Code Block 2 */}
            <div className="bg-[var(--color-bg-muted)] rounded-lg p-3 border" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[var(--color-primary)]">CSS Styles</span>
                <Code className="w-3 h-3 text-[var(--color-text-muted)]" />
              </div>
              <div className="text-xs font-mono text-[var(--color-text-muted)] leading-relaxed">
                .container &#123;<br />
                &nbsp;&nbsp;display: flex;<br />
                &nbsp;&nbsp;gap: 1rem;<br />
                &#125;
              </div>
            </div>

            {/* Error Block */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-3 h-3 text-red-500" />
                <span className="text-xs font-medium text-red-700">Syntax Error</span>
              </div>
              <div className="text-xs text-red-600">
                Line 24: Missing closing bracket
              </div>
            </div>
          </div>
        </div>

        {/* Build Status */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text)]">Build Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-[var(--color-text-muted)]">Ready</span>
            </div>
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">
            Last build: 2 minutes ago
          </div>
        </div>
      </div>
    </div>
  )
}