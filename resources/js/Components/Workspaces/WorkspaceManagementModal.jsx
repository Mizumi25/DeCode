// @/Components/Workspaces/WorkspaceManagementModal.jsx
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Edit2, Trash2, UserPlus, Crown, Users, X } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import axios from 'axios';
import Modal from '@/Components/Modal';

const WorkspaceManagementModal = ({ show, onClose }) => {
    const { workspaces, currentWorkspace, setCurrentWorkspace, initializeWorkspaces } = useWorkspaceStore();
    const [expandedWorkspaces, setExpandedWorkspaces] = useState({});
    const [editingWorkspace, setEditingWorkspace] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [workspaceMembers, setWorkspaceMembers] = useState({});
    const [changingRole, setChangingRole] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('editor');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            initializeWorkspaces();
        }
    }, [show]);

    // Separate personal and team workspaces
    const personalWorkspace = workspaces.find(w => w.type === 'personal');
    const teamWorkspaces = workspaces.filter(w => w.type !== 'personal');

    const toggleWorkspace = (workspaceId) => {
        setExpandedWorkspaces(prev => ({
            ...prev,
            [workspaceId]: !prev[workspaceId]
        }));
        
        // Fetch members when expanding
        if (!expandedWorkspaces[workspaceId] && !workspaceMembers[workspaceId]) {
            fetchWorkspaceMembers(workspaceId);
        }
    };

    const fetchWorkspaceMembers = async (workspaceId) => {
        try {
            const response = await axios.get(`/api/workspaces/${workspaceId}/members`);
            setWorkspaceMembers(prev => ({
                ...prev,
                [workspaceId]: response.data
            }));
        } catch (error) {
            console.error('Failed to fetch members:', error);
        }
    };

    const handleToggleActive = async (workspace, e) => {
        e.stopPropagation();
        try {
            await axios.patch(`/api/workspaces/${workspace.id}/toggle-active`, {
                is_active: !workspace.is_active
            });
            initializeWorkspaces();
        } catch (error) {
            console.error('Failed to toggle workspace:', error);
            alert('Failed to toggle workspace status');
        }
    };

    const handleEditWorkspace = (workspace, e) => {
        e.stopPropagation();
        setEditingWorkspace(workspace.id);
        setEditName(workspace.name);
        setEditDescription(workspace.description || '');
    };

    const handleSaveEdit = async (workspaceId) => {
        try {
            await axios.put(`/api/workspaces/${workspaceId}`, {
                name: editName,
                description: editDescription
            });
            setEditingWorkspace(null);
            initializeWorkspaces();
        } catch (error) {
            console.error('Failed to update workspace:', error);
            alert('Failed to update workspace');
        }
    };

    const handleDeleteWorkspace = async (workspace, e) => {
        e.stopPropagation();
        if (workspace.type === 'personal') {
            alert('Cannot delete personal workspace');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete "${workspace.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await axios.delete(`/api/workspaces/${workspace.id}`);
            await initializeWorkspaces();
            const updatedWorkspaces = useWorkspaceStore.getState().workspaces;
            const personalWorkspace = updatedWorkspaces.find(w => w.type === 'personal');
            if (currentWorkspace?.id === workspace.id && personalWorkspace) {
                setCurrentWorkspace(personalWorkspace);
            }
        } catch (error) {
            console.error('Failed to delete workspace:', error);
            alert('Failed to delete workspace');
        }
    };

    const handleChangeRole = async (workspaceId, userId, newRole) => {
        try {
            await axios.patch(`/api/workspaces/${workspaceId}/members/${userId}/role`, {
                role: newRole
            });
            fetchWorkspaceMembers(workspaceId);
        } catch (error) {
            console.error('Failed to change role:', error);
            alert('Failed to change member role');
        }
    };

    const handleRemoveMember = async (workspaceId, userId) => {
        if (!confirm('Are you sure you want to remove this member?')) {
            return;
        }

        try {
            await axios.delete(`/api/workspaces/${workspaceId}/members/${userId}`);
            fetchWorkspaceMembers(workspaceId);
        } catch (error) {
            console.error('Failed to remove member:', error);
            alert('Failed to remove member');
        }
    };

    const handleInviteMember = async (workspaceId) => {
        if (!inviteEmail) {
            alert('Please enter an email address');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`/api/workspaces/${workspaceId}/invite`, {
                email: inviteEmail,
                role: inviteRole
            });
            setShowInviteModal(null);
            setInviteEmail('');
            setInviteRole('editor');
            alert('Invitation sent successfully!');
        } catch (error) {
            console.error('Failed to send invite:', error);
            alert(error.response?.data?.message || 'Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadgeStyle = (role) => {
        switch (role) {
            case 'owner': return { 
                backgroundColor: 'rgba(139, 92, 246, 0.1)', 
                color: 'rgb(196, 181, 253)', 
                borderColor: 'rgba(139, 92, 246, 0.3)' 
            };
            case 'editor': return { 
                backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                color: 'rgb(147, 197, 253)', 
                borderColor: 'rgba(59, 130, 246, 0.3)' 
            };
            case 'viewer': return { 
                backgroundColor: 'var(--color-bg-muted)', 
                color: 'var(--color-text-muted)', 
                borderColor: 'var(--color-border)' 
            };
            default: return { 
                backgroundColor: 'var(--color-bg-muted)', 
                color: 'var(--color-text-muted)', 
                borderColor: 'var(--color-border)' 
            };
        }
    };

    const WorkspaceCard = ({ workspace, isPersonal }) => {
        const isExpanded = expandedWorkspaces[workspace.id];
        const members = workspaceMembers[workspace.id] || [];
        const isOwner = workspace.user_role === 'owner';
        const isEditing = editingWorkspace === workspace.id;

        return (
            <div 
                className="border rounded-lg overflow-hidden transition-all"
                style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: workspace.is_active ? 'var(--color-bg-muted)' : 'var(--color-bg)',
                    opacity: workspace.is_active ? 1 : 0.6
                }}
            >
                {/* Workspace Header */}
                <div 
                    className="p-4 cursor-pointer transition-all"
                    style={{ 
                        backgroundColor: 'transparent',
                        ':hover': { backgroundColor: 'var(--color-bg-muted)' }
                    }}
                    onClick={() => toggleWorkspace(workspace.id)}
                >
                    <div className="flex items-center gap-3">
                        {/* Active Toggle */}
                        <button
                            onClick={(e) => handleToggleActive(workspace, e)}
                            className="relative w-11 h-6 rounded-full transition-all"
                            style={{
                                backgroundColor: workspace.is_active ? 'var(--color-primary)' : 'var(--color-bg-muted)'
                            }}
                            disabled={isPersonal}
                        >
                            <div 
                                className="absolute top-1 left-1 w-4 h-4 rounded-full transition-transform"
                                style={{ 
                                    backgroundColor: 'white',
                                    transform: workspace.is_active ? 'translateX(1.25rem)' : 'translateX(0)'
                                }}
                            />
                        </button>

                        {/* Expand/Collapse Icon */}
                        {isExpanded ? (
                            <ChevronDown className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                        ) : (
                            <ChevronRight className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                        )}

                        {/* Workspace Info */}
                        <div className="flex-1">
                            {isEditing ? (
                                <div onClick={(e) => e.stopPropagation()} className="space-y-2">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full px-3 py-1 rounded text-sm"
                                        style={{
                                            backgroundColor: 'var(--color-bg)',
                                            borderColor: 'var(--color-border)',
                                            color: 'var(--color-text)',
                                            border: '1px solid'
                                        }}
                                        placeholder="Workspace name"
                                    />
                                    <input
                                        type="text"
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        className="w-full px-3 py-1 rounded text-xs"
                                        style={{
                                            backgroundColor: 'var(--color-bg)',
                                            borderColor: 'var(--color-border)',
                                            color: 'var(--color-text-muted)',
                                            border: '1px solid'
                                        }}
                                        placeholder="Description (optional)"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSaveEdit(workspace.id)}
                                            className="px-3 py-1 text-white text-xs rounded transition-colors"
                                            style={{
                                                backgroundColor: 'var(--color-primary)',
                                            }}
                                            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                                            onMouseLeave={(e) => e.target.style.opacity = '1'}
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditingWorkspace(null)}
                                            className="px-3 py-1 text-xs rounded transition-colors"
                                            style={{
                                                backgroundColor: 'var(--color-bg-muted)',
                                                color: 'var(--color-text)'
                                            }}
                                            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                                            onMouseLeave={(e) => e.target.style.opacity = '1'}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium" style={{ color: 'var(--color-text)' }}>{workspace.name}</h3>
                                        {isPersonal && (
                                            <span 
                                                className="px-2 py-0.5 text-xs rounded border"
                                                style={{
                                                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                                    color: 'rgb(196, 181, 253)',
                                                    borderColor: 'rgba(139, 92, 246, 0.3)'
                                                }}
                                            >
                                                Personal
                                            </span>
                                        )}
                                    </div>
                                    {workspace.description && (
                                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                            {workspace.description}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Role Badge */}
                        <div 
                            className="px-3 py-1 rounded-full text-xs font-medium border"
                            style={getRoleBadgeStyle(workspace.user_role)}
                        >
                            {workspace.user_role?.toUpperCase()}
                        </div>

                        {/* Action Buttons */}
                        {isOwner && !isPersonal && (
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={(e) => handleEditWorkspace(workspace, e)}
                                    className="p-2 rounded-lg transition-all"
                                    style={{ color: 'var(--color-text-muted)' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)';
                                        e.currentTarget.style.color = 'var(--color-text)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = 'var(--color-text-muted)';
                                    }}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteWorkspace(workspace, e)}
                                    className="p-2 rounded-lg transition-all"
                                    style={{ color: 'var(--color-text-muted)' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                        e.currentTarget.style.color = 'rgb(248, 113, 113)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = 'var(--color-text-muted)';
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Members List */}
                {isExpanded && (
                    <div 
                        className="border-t p-4"
                        style={{
                            borderColor: 'var(--color-border)',
                            backgroundColor: 'var(--color-bg)'
                        }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                                <Users className="w-4 h-4" />
                                <span className="text-sm font-medium">Members ({members.length})</span>
                            </div>
                            {isOwner && (
                                <button
                                    onClick={() => setShowInviteModal(workspace.id)}
                                    className="flex items-center gap-1 px-3 py-1 text-xs rounded border transition-all"
                                    style={{
                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                        color: 'rgb(147, 197, 253)',
                                        borderColor: 'rgba(59, 130, 246, 0.3)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'}
                                >
                                    <UserPlus className="w-3 h-3" />
                                    Invite
                                </button>
                            )}
                        </div>

                        {/* Invite Modal */}
                        {showInviteModal === workspace.id && (
                            <div 
                                className="mb-4 p-3 rounded-lg border"
                                style={{
                                    backgroundColor: 'var(--color-bg-muted)',
                                    borderColor: 'var(--color-border)'
                                }}
                            >
                                <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Invite Member</h4>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="Enter email address"
                                    className="w-full px-3 py-2 rounded text-sm mb-2 border"
                                    style={{
                                        backgroundColor: 'var(--color-bg)',
                                        borderColor: 'var(--color-border)',
                                        color: 'var(--color-text)'
                                    }}
                                />
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                    className="w-full px-3 py-2 rounded text-sm mb-2 border"
                                    style={{
                                        backgroundColor: 'var(--color-bg)',
                                        borderColor: 'var(--color-border)',
                                        color: 'var(--color-text)'
                                    }}
                                >
                                    <option value="editor">Editor</option>
                                    <option value="viewer">Viewer</option>
                                </select>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleInviteMember(workspace.id)}
                                        disabled={loading}
                                        className="flex-1 px-3 py-2 text-white text-sm rounded transition-all"
                                        style={{
                                            backgroundColor: 'var(--color-primary)',
                                            opacity: loading ? 0.5 : 1
                                        }}
                                        onMouseEnter={(e) => !loading && (e.target.style.opacity = '0.9')}
                                        onMouseLeave={(e) => !loading && (e.target.style.opacity = '1')}
                                    >
                                        {loading ? 'Sending...' : 'Send Invite'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowInviteModal(null);
                                            setInviteEmail('');
                                        }}
                                        className="px-3 py-2 text-sm rounded transition-all"
                                        style={{
                                            backgroundColor: 'var(--color-bg-muted)',
                                            color: 'var(--color-text)'
                                        }}
                                        onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Members List */}
                        <div className="space-y-2">
                            {members.map((member) => {
                                const isCurrentUserOwner = isOwner;
                                const isMemberOwner = member.role === 'owner';
                                const canEditRole = isCurrentUserOwner && !isMemberOwner;

                                return (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-2 rounded-lg transition-all"
                                        style={{
                                            backgroundColor: 'var(--color-bg-muted)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                                style={{
                                                    background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(139, 92, 246))'
                                                }}
                                            >
                                                {member.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm" style={{ color: 'var(--color-text)' }}>{member.name}</p>
                                                    {isMemberOwner && <Crown className="w-3 h-3" style={{ color: 'rgb(250, 204, 21)' }} />}
                                                </div>
                                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{member.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {canEditRole ? (
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => handleChangeRole(workspace.id, member.id, e.target.value)}
                                                    className="px-2 py-1 rounded text-xs border"
                                                    style={{
                                                        backgroundColor: 'var(--color-bg)',
                                                        borderColor: 'var(--color-border)',
                                                        color: 'var(--color-text)'
                                                    }}
                                                >
                                                    <option value="editor">Editor</option>
                                                    <option value="viewer">Viewer</option>
                                                </select>
                                            ) : (
                                                <span 
                                                    className="px-2 py-1 rounded text-xs font-medium border"
                                                    style={getRoleBadgeStyle(member.role)}
                                                >
                                                    {member.role?.toUpperCase()}
                                                </span>
                                            )}

                                            {canEditRole && (
                                                <button
                                                    onClick={() => handleRemoveMember(workspace.id, member.id)}
                                                    className="p-1 rounded transition-all"
                                                    style={{ color: 'var(--color-text-muted)' }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                                        e.currentTarget.style.color = 'rgb(248, 113, 113)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                        e.currentTarget.style.color = 'var(--color-text-muted)';
                                                    }}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Modal
            show={show}
            onClose={onClose}
            title="Workspace Management"
            maxWidth="4xl"
        >
            <div className="p-6">
                <p className="text-[var(--color-text-muted)] text-sm mb-6">
                    Manage your workspaces and team members
                </p>
                
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2" style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'var(--color-border) transparent'
                }}>
                {/* Personal Workspace */}
                {personalWorkspace && (
                    <div className="mb-6">
                        <h3 className="text-[var(--color-text-muted)] text-xs font-semibold mb-3 uppercase tracking-wider">
                            Personal Workspace
                        </h3>
                        <WorkspaceCard workspace={personalWorkspace} isPersonal={true} />
                    </div>
                )}

                {/* Team Workspaces */}
                {teamWorkspaces.length > 0 && (
                    <div>
                        <h3 className="text-[var(--color-text-muted)] text-xs font-semibold mb-3 uppercase tracking-wider">
                            Team Workspaces
                        </h3>
                        <div className="space-y-3">
                            {teamWorkspaces.map(workspace => (
                                <WorkspaceCard key={workspace.id} workspace={workspace} isPersonal={false} />
                            ))}
                        </div>
                    </div>
                )}

                {teamWorkspaces.length === 0 && !personalWorkspace && (
                    <div className="text-center py-8">
                        <Users className="w-12 h-12 text-[var(--color-text-muted)] opacity-50 mx-auto mb-3" />
                        <p className="text-[var(--color-text-muted)] text-sm">No team workspaces yet</p>
                        <p className="text-[var(--color-text-muted)] text-xs mt-1 opacity-70">Create a workspace to collaborate with your team</p>
                    </div>
                )}
            </div>
        </div>
        </Modal>
    );
};

export default WorkspaceManagementModal;
