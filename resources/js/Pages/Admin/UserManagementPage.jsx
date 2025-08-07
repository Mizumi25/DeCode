





// Admin/UserManagementPage.jsx
import { Users, Trash2, Edit3, Lock } from 'lucide-react';

export default function UserManagementPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-muted)] p-8 text-[var(--color-text)]">
      <h1 className="text-[var(--fs-xl)] font-semibold mb-6 flex items-center gap-2">
        <Users size={24} /> User Management
      </h1>
      <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-md)] shadow-md">
        <table className="w-full text-left border-separate border-spacing-y-4">
          <thead className="text-[var(--color-text-muted)] text-[var(--fs-sm)]">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-[var(--color-surface)]">
              <td>Jane Doe</td>
              <td>jane@example.com</td>
              <td>Admin</td>
              <td className="text-green-500">Active</td>
              <td className="flex gap-3">
                <button className="text-[var(--color-primary)] hover:underline flex items-center gap-1">
                  <Edit3 size={16} /> Edit
                </button>
                <button className="text-red-500 hover:underline flex items-center gap-1">
                  <Trash2 size={16} /> Delete
                </button>
                <button className="text-yellow-500 hover:underline flex items-center gap-1">
                  <Lock size={16} /> Reset
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}















