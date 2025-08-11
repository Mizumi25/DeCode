import React from 'react';
import { Bug, Search, Play, Square, RotateCcw } from 'lucide-react';

export default function TerminalPanel() {
  return (
    <div 
      className="h-48 border-t flex flex-col"
      style={{ 
        borderColor: 'var(--color-border)', 
        backgroundColor: 'var(--color-surface)' 
      }}
    >
      {/* Terminal tabs */}
      <div 
        className="flex border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div 
          className="flex items-center px-4 py-2 border-r text-sm cursor-pointer"
          style={{ 
            borderColor: 'var(--color-border)', 
            backgroundColor: 'var(--color-primary-soft)', 
            color: 'var(--color-primary)' 
          }}
        >
          Terminal
        </div>
        <div 
          className="flex items-center px-4 py-2 border-r text-sm cursor-pointer hover:bg-[var(--color-bg-muted)] transition-colors"
          style={{ 
            borderColor: 'var(--color-border)', 
            color: 'var(--color-text-muted)' 
          }}
        >
          <Bug size={14} className="mr-2" />
          Problems
        </div>
        <div 
          className="flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-[var(--color-bg-muted)] transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Search size={14} className="mr-2" />
          Output
        </div>
        
        {/* Terminal controls */}
        <div className="ml-auto flex items-center px-4 space-x-2">
          <button 
            className="p-1 rounded transition-colors hover:text-[var(--color-primary)]" 
            style={{ color: 'var(--color-text-muted)' }}
            title="Run"
          >
            <Play size={14} />
          </button>
          <button 
            className="p-1 rounded transition-colors hover:text-[var(--color-primary)]" 
            style={{ color: 'var(--color-text-muted)' }}
            title="Stop"
          >
            <Square size={14} />
          </button>
          <button 
            className="p-1 rounded transition-colors hover:text-[var(--color-primary)]" 
            style={{ color: 'var(--color-text-muted)' }}
            title="Clear"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
      
      {/* Terminal content */}
      <div 
        className="flex-grow p-4 overflow-auto font-mono text-xs space-y-1"
        style={{ backgroundColor: 'var(--color-bg-muted)' }}
      >
        <div style={{ color: 'var(--color-primary)' }}>$ npm run dev</div>
        <div style={{ color: 'var(--color-accent)' }}>&gt; vite</div>
        <div style={{ color: '#10b981' }}>
          VITE v5.2.11 ready in 320 ms
        </div>
        <div style={{ color: 'var(--color-text)' }}>
          ➜ Local: <span style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>http://localhost:5173/</span>
        </div>
        <div style={{ color: 'var(--color-text)' }}>
          ➜ Network: use --host to expose
        </div>
        <div style={{ color: '#10b981' }}>
          ➜ press h + enter to show help
        </div>
        <div style={{ color: 'var(--color-text)', marginTop: '8px' }}>
          <span style={{ color: '#10b981' }}>✓</span> ready in 145ms
        </div>
      </div>
    </div>
  );
}