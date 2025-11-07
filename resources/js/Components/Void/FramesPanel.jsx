// @/Components/Void/FramesPanel.jsx
import React from 'react'
import { Layers, Plus, Eye, Trash2, Grid, List, Search } from 'lucide-react'

export default function FramesPanel({
  frames = [],
  onSelectFrame = () => {},
  onDeleteFrame = () => {},
  onAddFrame = () => {},
  zoom = 1
}) {
  // Local UI state for view mode & search
  const [view, setView] = React.useState('grid') // 'grid' | 'list'
  const [query, setQuery] = React.useState('')

  const filtered = React.useMemo(() => {
    if (!query) return frames
    const q = query.toLowerCase()
    return frames.filter(f => (f.title || '').toLowerCase().includes(q) || (f.fileName || '').toLowerCase().includes(q))
  }, [frames, query])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md" style={{ backgroundColor: 'var(--color-primary-soft)' }}>
            <Layers className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h4 className="font-semibold text-[var(--color-text)]">Frames</h4>
            <div className="text-xs text-[var(--color-text-muted)]">Manage your pages & components</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <button
              onClick={() => setView('grid')}
              className={`p-2 ${view === 'grid' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-muted)]'}`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 ${view === 'list' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-muted)]'}`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

         
        </div>
        
      </div>
 <button
            onClick={onAddFrame}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.08), transparent)',
              color: 'var(--color-primary)'
            }}
            title="Add Frame"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Add Frame</span>
          </button>
      {/* Search */}
      <div className="p-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search frames..."
            className="w-full pl-10 pr-3 py-2 rounded-md text-sm"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-[var(--color-text-muted)]">
            No frames found.
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(frame => (
              <div key={frame.id} className="rounded-xl overflow-hidden border transition-shadow hover:shadow-lg" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                <div
                  className="w-full aspect-[16/9] bg-[var(--color-bg-muted)] flex items-center justify-center cursor-pointer"
                  onClick={() => onSelectFrame(frame)}
                  title={`Go to ${frame.title}`}
                >
                  {frame.thumbnail ? (
                    <img src={frame.thumbnail} alt={frame.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="p-4 text-center">
                      <div className="text-sm font-semibold text-[var(--color-text)]">{frame.title}</div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-1">{frame.fileName}</div>
                    </div>
                  )}
                </div>

                <div className="p-3 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>{frame.title}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{frame.fileName} • {frame.type}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectFrame(frame)}
                      className="p-2 rounded-md hover:bg-[var(--color-bg-hover)]"
                      title="Center on screen"
                    >
                      <Eye className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </button>
                    <button
                      onClick={() => onDeleteFrame(frame)}
                      className="p-2 rounded-md hover:bg-red-50"
                      title="Delete frame"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(frame => (
              <div key={frame.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-10 rounded-md bg-[var(--color-bg-muted)] flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => onSelectFrame(frame)}>
                    {frame.thumbnail ? <img src={frame.thumbnail} alt={frame.title} className="w-full h-full object-cover" /> : <Layers className="w-5 h-5 text-[var(--color-text-muted)]" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate" style={{ color: 'var(--color-text)' }}>{frame.title}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{frame.fileName} • {frame.type}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => onSelectFrame(frame)} className="p-2 rounded-md hover:bg-[var(--color-bg-hover)]" title="Center">
                    <Eye className="w-4 h-4 text-[var(--color-text-muted)]" />
                  </button>
                  <button onClick={() => onDeleteFrame(frame)} className="p-2 rounded-md hover:bg-red-50" title="Delete">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}