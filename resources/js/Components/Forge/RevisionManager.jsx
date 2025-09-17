import React, { useState, useEffect } from 'react';
import { History, GitBranch, Clock, User, Download, Trash2, RefreshCw } from 'lucide-react';
import axios from 'axios';

const RevisionManager = ({ projectId, frameId, onRestoreRevision, isOpen, onClose }) => {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(null);

  useEffect(() => {
    if (isOpen && frameId) {
      loadRevisions();
    }
  }, [isOpen, frameId]);

  const loadRevisions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/revisions/frame/${frameId}`);
      if (response.data.success) {
        setRevisions(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load revisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreRevision = async (revision) => {
    setRestoring(revision.uuid);
    try {
      const response = await axios.post(`/api/project-components/restore-revision/${revision.uuid}`);
      if (response.data.success && onRestoreRevision) {
        onRestoreRevision(response.data.data);
      }
    } catch (error) {
      console.error('Failed to restore revision:', error);
    } finally {
      setRestoring(null);
    }
  };

  const handleDeleteRevision = async (revision) => {
    if (!window.confirm('Are you sure you want to delete this revision?')) return;

    try {
      await axios.delete(`/api/revisions/${revision.uuid}`);
      setRevisions(prev => prev.filter(r => r.uuid !== revision.uuid));
    } catch (error) {
      console.error('Failed to delete revision:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getRevisionIcon = (type) => {
    switch (type) {
      case 'manual': return <User className="w-4 h-4" />;
      case 'github_sync': return <GitBranch className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getRevisionColor = (type) => {
    switch (type) {
      case 'manual': return 'text-blue-600 bg-blue-50';
      case 'github_sync': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Revision History</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadRevisions}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : revisions.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No revisions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {revisions.map((revision) => (
                <div
                  key={revision.uuid}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-full ${getRevisionColor(revision.revision_type)}`}>
                          {getRevisionIcon(revision.revision_type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{revision.title}</h3>
                          <p className="text-sm text-gray-500">
                            by {revision.user?.name || 'Unknown'} • {formatDate(revision.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      {revision.description && (
                        <p className="text-sm text-gray-600 mb-2">{revision.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{revision.metadata?.component_count || 0} components</span>
                        <span className="capitalize">{revision.revision_type.replace('_', ' ')}</span>
                        {revision.github_commit_sha && (
                          <span className="font-mono">#{revision.github_commit_sha.substring(0, 7)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleRestoreRevision(revision)}
                        disabled={restoring === revision.uuid}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Restore this revision"
                      >
                        {restoring === revision.uuid ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>
                      
                      {revision.revision_type === 'manual' && (
                        <button
                          onClick={() => handleDeleteRevision(revision)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete this revision"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <p className="text-sm text-gray-600">
            Revisions are automatically created during major changes. Manual saves create permanent checkpoints.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RevisionManager;