



// Admin/AssetManagerPage.jsx
import { Image } from 'lucide-react';

export default function AssetManagerPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-muted)] p-8 text-[var(--color-text)]">
      <h1 className="text-[var(--fs-xl)] font-semibold mb-6 flex items-center gap-2">
        <Image size={24} /> Asset Manager
      </h1>
      <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-md)] shadow-md grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-[var(--color-border)] rounded-[var(--radius-sm)] p-2 text-center text-[var(--fs-sm)]">
          <img src="/assets/logo.png" alt="Logo" className="w-full rounded" />
          logo.png
        </div>
        {/* more assets */}
      </div>
    </div>
  );
}