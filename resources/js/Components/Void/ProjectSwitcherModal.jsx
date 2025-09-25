// @/Components/Void/ProjectSwitcherModal.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { X, Search, FolderOpen, Clock, Filter, ChevronDown, Check, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { router } from '@inertiajs/react'
import Modal from '@/Components/Modal'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

const ProjectSwitcherModal = ({ show, onClose, currentProject }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  const { currentWorkspace, workspaces } = useWorkspaceStore()

  // Load projects when modal opens
  useEffect(() => {
    if (show && currentWorkspace) {
      loadProjects()
    }
  }, [show, currentWorkspace])

  const loadProjects = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/projects?workspace=${currentWorkspace.id}`, {
        headers: {
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Transform projects data to match expected format
        const transformedProjects = data.projects.map(project => ({
          id: project.id,
          uuid: project.uuid,
          name: project.name,
          description: project.description,
          type: project.type,
          status: project.status,
          thumbnail: project.thumbnail ? `/storage/${project.thumbnail}` : null,
          updated_at: project.updated_at,
          created_at: project.created_at,
          component_count: project.component_count || 0,
          last_opened_at: project.last_opened_at
        }))
        setProjects(transformedProjects)
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Projects' },
    { value: 'recent', label: 'Recently Opened' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Drafts' },
    { value: 'published', label: 'Published' }
  ]

  // Get project type badge color
  const getProjectTypeBadge = (type) => {
    const badges = {
      'website': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'landing_page': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'component_library': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'prototype': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'email_template': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'dashboard': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
    }
    return badges[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      // Exclude current project
      if (currentProject && project.uuid === currentProject.uuid) {
        return false
      }

      // Filter by status
      if (selectedFilter !== 'all') {
        if (selectedFilter === 'recent') {
          return project.last_opened_at || false
        } else if (selectedFilter !== 'all' && project.status !== selectedFilter) {
          return false
        }
      }

      // Search filter
      if (searchQuery) {
        return project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      }

      return true
    })

    // Sort by last opened, then by updated
    return filtered.sort((a, b) => {
      if (a.last_opened_at && b.last_opened_at) {
        return new Date(b.last_opened_at) - new Date(a.last_opened_at)
      }
      if (a.last_opened_at && !b.last_opened_at) return -1
      if (!a.last_opened_at && b.last_opened_at) return 1
      return new Date(b.updated_at) - new Date(a.updated_at)
    })
  }, [projects, searchQuery, selectedFilter, currentProject])

  const handleProjectSelect = (project) => {
    onClose()
    router.visit(`/void/${project.uuid}`)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const projectVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: { opacity: 0, y: -10, scale: 0.95 }
  }

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Switch Project"
      maxWidth="2xl"
      closeable={true}
    >
      <div className="p-6">
        {/* Header with search and filter */}
        <div className="flex items-center gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)] w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            />
          </div>

          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] transition-colors"
            >
              <Filter className="w-4 h-4" />
              {filterOptions.find(f => f.value === selectedFilter)?.label}
              <ChevronDown className="w-4 h-4" />
            </button>

            {showFilterDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg shadow-xl z-50 min-w-[180px]">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSelectedFilter(option.value)
                      setShowFilterDropdown(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-bg-muted)] transition flex items-center justify-between ${
                      selectedFilter === option.value ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'text-[var(--color-text)]'
                    }`}
                  >
                    <span>{option.label}</span>
                    {selectedFilter === option.value && <Check size={12} className="text-[var(--color-primary)]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current workspace info */}
        {currentWorkspace && (
          <div className="mb-4 p-3 bg-[var(--color-bg-muted)] rounded-lg">
            <div className="flex items-center gap-2 text-sm text-[var(--color-text)]">
              <FolderOpen className="w-4 h-4" />
              <span className="font-medium">{currentWorkspace.name}</span>
              <span className="text-[var(--color-text-muted)]">•</span>
              <span className="text-[var(--color-text-muted)]">
                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} available
              </span>
            </div>
          </div>
        )}

        {/* Projects list */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[var(--color-bg-muted)] rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-[var(--color-text-muted)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                {searchQuery ? 'No projects found' : 'No other projects'}
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm">
                {searchQuery 
                  ? `No projects match "${searchQuery}" in this workspace`
                  : 'This is the only project in the current workspace'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project.uuid}
                    variants={projectVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="group p-4 border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] hover:shadow-md transition-all cursor-pointer bg-[var(--color-surface)] hover:bg-[var(--color-bg-muted)]"
                    onClick={() => handleProjectSelect(project)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Project thumbnail */}
                      <div className="w-16 h-12 bg-[var(--color-bg-muted)] rounded-lg overflow-hidden flex-shrink-0">
                        {project.thumbnail ? (
                          <img 
                            src={project.thumbnail}
                            alt={project.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-[var(--color-text-muted)]" />
                          </div>
                        )}
                      </div>

                      {/* Project info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[var(--color-text)] truncate group-hover:text-[var(--color-primary)] transition-colors">
                            {project.name}
                          </h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getProjectTypeBadge(project.type)}`}>
                            {project.type.replace('_', ' ')}
                          </span>
                        </div>

                        {project.description && (
                          <p className="text-sm text-[var(--color-text-muted)] mb-2 line-clamp-2">
                            {project.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {project.last_opened_at ? (
                              <span>Opened {formatDate(project.last_opened_at)}</span>
                            ) : (
                              <span>Updated {formatDate(project.updated_at)}</span>
                            )}
                          </div>
                          
                          <span>•</span>
                          
                          <span>{project.component_count} components</span>
                          
                          <span>•</span>
                          
                          <div className={`w-2 h-2 rounded-full ${
                            project.status === 'published' ? 'bg-green-500' :
                            project.status === 'active' ? 'bg-blue-500' :
                            project.status === 'archived' ? 'bg-gray-400' :
                            'bg-yellow-500'
                          }`}></div>
                          <span className="capitalize">{project.status}</span>
                        </div>
                      </div>

                      {/* Arrow icon */}
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-5 h-5 text-[var(--color-primary)]" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer info */}
        {!isLoading && filteredProjects.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--color-border)] text-center">
            <p className="text-xs text-[var(--color-text-muted)]">
              Click any project to switch to it
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ProjectSwitcherModal