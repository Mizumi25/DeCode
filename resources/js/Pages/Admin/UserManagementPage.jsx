// Admin/UserManagementPage.jsx
import { Users, Trash2, Edit3, Lock } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function UserManagementPage() {
  // New: dynamic state
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // Fetch users from backend API
  const fetchUsers = async (q = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/admin/users?q=${encodeURIComponent(q)}`, { credentials: 'same-origin' });
      const json = await res.json();
      if (json?.data) setUsers(json.data);
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearch(q);
    // Debounce omitted for brevity
    fetchUsers(q);
  };

  const toggleActive = async (userId) => {
    setProcessingId(userId);
    try {
      const res = await fetch(`/admin/users/${userId}/toggle-active`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) => prev.map(u => u.id === userId ? { ...u, active: !u.active } : u));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const changeRole = async (userId, role) => {
    setProcessingId(userId);
    try {
      const res = await fetch(`/admin/users/${userId}/role`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ role })
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) => prev.map(u => u.id === userId ? { ...u, role } : u));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Delete this user?')) return;
    setProcessingId(userId);
    try {
      const res = await fetch(`/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) => prev.filter(u => u.id !== userId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-muted)] p-8 text-[var(--color-text)]">
      <h1 className="text-[var(--fs-xl)] font-semibold mb-6 flex items-center gap-2">
        <Users size={24} /> User Management
      </h1>

      <div className="mb-4 flex items-center gap-3">
        <input
          type="search"
          placeholder="Search users..."
          value={search}
          onChange={handleSearch}
          className="px-3 py-2 border rounded w-full max-w-md bg-[var(--color-surface)]"
        />
      </div>

      <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-md)] shadow-md">
        {loading ? (
          <div className="py-12 text-center text-sm text-[var(--color-text-muted)]">Loading users...</div>
        ) : (
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
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-[var(--color-text-muted)]">No users found</td>
                </tr>
              )}
              {users.map(user => (
                <tr key={user.id} className="bg-[var(--color-surface)]">
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      disabled={processingId === user.id}
                      onChange={(e) => changeRole(user.id, e.target.value)}
                      className="bg-transparent"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="user">User</option>
                    </select>
                  </td>
                  <td className={user.active ? 'text-green-500' : 'text-red-500'}>
                    {user.active ? 'Active' : 'Inactive'}
                  </td>
                  <td className="flex gap-3">
                    <button
                      onClick={() => toggleActive(user.id)}
                      disabled={processingId === user.id}
                      className="text-[var(--color-primary)] hover:underline flex items-center gap-1"
                    >
                      {user.active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      disabled={processingId === user.id}
                      className="text-red-500 hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}















