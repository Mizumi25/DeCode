


// Admin/ProjectOversightPage.jsx
import { LayoutDashboard } from 'lucide-react';

export default function ProjectOversightPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-muted)] p-8 text-[var(--color-text)]">
      <h1 className="text-[var(--fs-xl)] font-semibold mb-6 flex items-center gap-2">
        <LayoutDashboard size={24} /> All Projects
      </h1>
      <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-md)] shadow-md">
        <table className="w-full text-left border-separate border-spacing-y-4">
          <thead className="text-[var(--color-text-muted)] text-[var(--fs-sm)]">
            <tr>
              <th>Project</th>
              <th>Owner</th>
              <th>Last Modified</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-[var(--color-surface)]">
              <td>Landing Page Redesign</td>
              <td>jane@example.com</td>
              <td>2025-08-07</td>
              <td className="text-green-500">Active</td>
              <td className="flex gap-3">
                <button className="text-[var(--color-primary)] hover:underline">View</button>
                <button className="text-red-500 hover:underline">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}