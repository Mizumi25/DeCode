// @/Components/Forge/AssetsPanel.jsx
import React from 'react';
import { FileImage } from 'lucide-react';

const AssetsPanel = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
          <FileImage className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Media Assets</h3>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Images, icons & files</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="aspect-square border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all group" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-muted)' }}>
            <div className="text-center">
              <div className="mb-1 group-hover:scale-110 transition-transform">
                <FileImage className="w-8 h-8 mx-auto" style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Asset {i}</span>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full py-4 px-4 border-2 border-dashed rounded-xl text-sm transition-all font-semibold flex items-center justify-center gap-2" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', backgroundColor: 'var(--color-bg)' }}>
        <FileImage className="w-5 h-5" />
        Upload New Assets
      </button>
    </div>
  );
};

export default AssetsPanel;