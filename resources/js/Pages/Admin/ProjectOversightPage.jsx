// Admin/ProjectOversightPage.jsx
import { LayoutDashboard } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function ProjectOversightPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchProjects = async (q = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/admin/projects?q=${encodeURIComponent(q)}`, { credentials: 'same-origin' });
      const json = await res.json();
      if (json?.data) setProjects(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearch(q);
    fetchProjects(q);
  };

  const deleteProject = async (projectId) => {
    if (!confirm('Delete this project?')) return;
    setProcessingId(projectId);
    try {
      const res = await fetch(`/admin/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const json = await res.json();
      if (json.success) setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-muted)] p-8 text-[var(--color-text)]">
      <h1 className="text-[var(--fs-xl)] font-semibold mb-6 flex items-center gap-2">
        <LayoutDashboard size={24} /> All Projects
      </h1>

      <div className="mb-4">
        <input
          type="search"
          placeholder="Search projects..."
          value={search}
          onChange={handleSearch}
          className="px-3 py-2 border rounded w-full max-w-md bg-[var(--color-surface)]"
        />
      </div>

      <div className="bg-[var(--color-surface)] p-6 rounded-[var(--radius-md)] shadow-md">
        {loading ? (
          <div className="py-12 text-center text-sm text-[var(--color-text-muted)]">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--color-text-muted)]">No projects found</div>
        ) : (
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
              {projects.map(project => (
                <tr key={project.id} className="bg-[var(--color-surface)]">
                  <td>{project.name}</td>
                  <td>{project.owner?.email ?? project.owner_email}</td>
                  <td>{project.updated_at ? new Date(project.updated_at).toLocaleDateString() : '-'}</td>
                  <td className={project.status === 'active' ? 'text-green-500' : 'text-[var(--color-text-muted)]'}>
                    {project.status}
                  </td>
                  <td className="flex gap-3">
                    <a href={`/void/${project.uuid}`} target="_blank" rel="noreferrer" className="text-[var(--color-primary)]">View</a>
                    <button
                      onClick={() => deleteProject(project.id)}
                      disabled={processingId === project.id}
                      className="text-red-500 hover:underline"
                    >
                      Delete
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