// @/Components/Void/TeamCollaborationPanel.jsx
import React from 'react'
import { Users, MessageCircle, Share2, Clock, User, Plus } from 'lucide-react'

export default function TeamCollaborationPanel() {
  return (
    <div className="h-full">
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-[var(--color-text)]">Team Collaboration</h4>
          <button 
            className="p-1 rounded hover:bg-[var(--color-bg-hover)]"
            style={{ color: 'var(--color-primary)' }}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-[var(--color-text-muted)]">
          5 members online • 3 active sessions
        </div>
      </div>

      <div className="overflow-y-auto h-full pb-20">
        {/* Active Members */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h5 className="font-medium text-sm text-[var(--color-text)] mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Active Members
          </h5>
          
          <div className="space-y-2">
            {[
              { name: 'Alice Johnson', status: 'editing', file: 'HomePage.jsx', avatar: 'AJ', color: 'bg-blue-500' },
              { name: 'Bob Smith', status: 'viewing', file: 'Dashboard.jsx', avatar: 'BS', color: 'bg-green-500' },
              { name: 'Carol Davis', status: 'commenting', file: 'LoginForm.jsx', avatar: 'CD', color: 'bg-purple-500' }
            ].map((member) => (
              <div key={member.name} className="flex items-center gap-3 p-2 rounded hover:bg-[var(--color-bg-hover)]">
                <div className={`w-6 h-6 rounded-full ${member.color} flex items-center justify-center text-white text-xs font-medium`}>
                  {member.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--color-text)] truncate">
                    {member.name}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {member.status} • {member.file}
                  </div>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h5 className="font-medium text-sm text-[var(--color-text)] mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Activity
          </h5>
          
          <div className="space-y-3">
            {[
              { action: 'commented on', file: 'Button.jsx', user: 'Alice', time: '2m ago', type: 'comment' },
              { action: 'edited', file: 'HomePage.jsx', user: 'Bob', time: '5m ago', type: 'edit' },
              { action: 'shared', file: 'Project Link', user: 'Carol', time: '10m ago', type: 'share' },
              { action: 'created', file: 'NewComponent.jsx', user: 'Alice', time: '15m ago', type: 'create' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  activity.type === 'comment' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'edit' ? 'bg-green-100 text-green-600' :
                  activity.type === 'share' ? 'bg-purple-100 text-purple-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {activity.type === 'comment' ? <MessageCircle className="w-3 h-3" /> :
                   activity.type === 'edit' ? <User className="w-3 h-3" /> :
                   activity.type === 'share' ? <Share2 className="w-3 h-3" /> :
                   <Plus className="w-3 h-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[var(--color-text)]">
                    <span className="font-medium">{activity.user}</span>{' '}
                    {activity.action}{' '}
                    <span className="font-mono text-xs bg-[var(--color-bg-muted)] px-1 py-0.5 rounded">
                      {activity.file}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-1">
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center gap-2 p-2 rounded bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] transition-colors">
              <MessageCircle className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-sm text-[var(--color-text)]">Comments</span>
            </button>
            <button className="flex items-center gap-2 p-2 rounded bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] transition-colors">
              <Share2 className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-sm text-[var(--color-text)]">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}