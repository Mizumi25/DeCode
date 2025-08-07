


// Admin/ComponentLibraryPage.jsx
import { Boxes } from 'lucide-react';

export default function ComponentLibraryPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-muted)] p-8 text-[var(--color-text)]">
      <h1 className="text-[var(--fs-xl)] font-semibold mb-6 flex items-center gap-2">
        <Boxes size={24} /> Component Library
      </h1>
      <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-md)] shadow-md">
        <ul className="space-y-4">
          <li className="border-b border-[var(--color-border)] pb-4">
            <div className="font-medium">Hero Section</div>
            <div className="text-[var(--color-text-muted)] text-[var(--fs-sm)]">Global component, last updated by Admin</div>
          </li>
        </ul>
      </div>
    </div>
  );
}
