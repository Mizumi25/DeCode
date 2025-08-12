import React from 'react';
import { Bug, Search, Play, Square, RotateCcw, Sparkles } from 'lucide-react';

export default function TerminalPanel() {
  return (
    <div 
      className="h-48 border-t flex flex-col"
      style={{ 
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text)'
      }}
    >
      {/* Terminal tabs */}
      <div 
        className="flex border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div 
          className="flex items-center px-4 py-2 border-r text-sm cursor-pointer border-b-2"
          style={{
            borderRightColor: 'var(--color-border)',
            borderBottomColor: 'var(--color-primary)',
            backgroundColor: 'var(--color-primary-soft)',
            color: 'var(--color-primary)'
          }}
        >
          Terminal
        </div>
        <div 
          className="flex items-center px-4 py-2 border-r text-sm cursor-pointer hover:bg-[var(--color-bg-muted)] transition-colors"
          style={{
            borderRightColor: 'var(--color-border)',
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
            className="p-1.5 rounded transition-all hover:scale-110 hover:bg-[var(--color-primary-soft)]" 
            style={{ 
              backgroundColor: 'var(--color-bg-muted)',
              color: 'var(--color-primary)'
            }}
            title="Run"
          >
            <Play size={12} />
          </button>
          <button 
            className="p-1.5 rounded transition-all hover:scale-110 hover:bg-red-500/30" 
            style={{ 
              backgroundColor: 'var(--color-bg-muted)',
              color: '#ef4444'
            }}
            title="Stop"
          >
            <Square size={12} />
          </button>
          <button 
            className="p-1.5 rounded transition-all hover:scale-110 hover:bg-[var(--color-primary-soft)]" 
            style={{ 
              backgroundColor: 'var(--color-bg-muted)',
              color: 'var(--color-accent)'
            }}
            title="Clear"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>
      
      {/* Terminal content */}
      <div 
        className="flex-grow p-4 overflow-auto font-mono text-sm space-y-1"
        style={{ backgroundColor: 'var(--color-bg-muted)' }}
      >
        <div style={{ color: 'var(--color-primary)' }}>$ npm run dev</div>
        <div style={{ color: 'var(--color-accent)' }}>&gt; vite</div>
        <div style={{ color: '#10b981' }}>
          ✓ VITE v5.2.11 ready in 320ms
        </div>
        <div style={{ color: 'var(--color-text)' }}>
          ➜ Local: <span style={{ color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer' }} className="hover:text-blue-300">http://localhost:5173/</span>
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
        <div className="flex items-center space-x-2 mt-2" style={{ color: '#10b981' }}>
          <Sparkles size={12} />
          <span>✨ Build completed successfully!</span>
        </div>
      </div>
    </div>
  );
}