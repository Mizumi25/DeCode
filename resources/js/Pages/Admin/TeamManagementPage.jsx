




// Admin/TeamManagementPage.jsx
import { Users2 } from 'lucide-react';

export default function TeamManagementPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-muted)] p-8 text-[var(--color-text)]">
      <h1 className="text-[var(--fs-xl)] font-semibold mb-6 flex items-center gap-2">
        <Users2 size={24} /> Team Management
      </h1>
      <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-md)] shadow-md">
        <div className="space-y-4">
          <div>
            <div className="font-medium">Team: Creative Coders</div>
            <div className="text-[var(--color-text-muted)] text-[var(--fs-sm)]">Owner: jane@example.com</div>
            <div className="text-[var(--color-text-muted)] text-[var(--fs-sm)]">Members: 5</div>
          </div>
        </div>
      </div>
    </div>
  );
}
