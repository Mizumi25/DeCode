import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Plus, ChevronDown, X, Share2, Download, Edit3, Trash2, Copy, GripVertical } from 'lucide-react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useRef, useEffect } from 'react';
import NewProjectModal from '@/Components/Projects/NewProjectModal';
import { useSearchStore } from '@/stores/useSearchStore';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function ProjectList({ projects: initialProjects = [], filters = {}, stats = {} }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [layouts, setLayouts] = useState({});
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const dragTimeoutRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  
  // Search store integration
  const { 
    searchQuery, 
    isSearching, 
    initializeFromUrl, 
    cleanup 
  } = useSearchStore();
  
  // Initialize search store from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    initializeFromUrl(urlParams);
    
    // Cleanup on unmount
    return () => cleanup();
  }, [initializeFromUrl, cleanup]);
  
  // Convert projects to the format expected by the grid
  const projects = initialProjects.map((project, index) => ({
    id: project.id.toString(),
    title: project.name,
    date: new Date(project.updated_at).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    description: project.description,
    type: project.type,
    status: project.status,
    componentCount: project.component_count || 0,
    w: 3,
    h: Math.random() > 0.5 ? 4 : 5, // Random height for demo
    project: project // Store the full project data
  }));

  const defaultLayouts = {
    lg: projects.map((p, i) => ({
      i: p.id,
      x: (i % 4) * 3, 
      y: Math.floor(i / 4) * 5,
      w: p.w,
      h: p.h,
    })),
    md: projects.map((p, i) => ({
      i: p.id,
      x: (i % 3) * 3,
      y: Math.floor(i / 3) * 5,
      w: p.w,
      h: p.h,
    })),
    sm: projects.map((p, i) => ({
      i: p.id,
      x: (i % 2) * 2,
      y: Math.floor(i / 2) * 5,
      w: 2,
      h: p.h,
    })),
  };

  // Initialize layouts on component mount
  useEffect(() => {
    if (Object.keys(layouts).length === 0) {
      setLayouts(defaultLayouts);
    }
  }, [projects]);

  const handleProjectClick = useCallback((project, e) => {
    // Prevent click if the target is the drag handle
    if (e.target.closest('.drag-handle-only')) {
      return;
    }
    
    console.log('Project clicked:', project.title, 'isDragging:', isDragging);
    
    // Clear any existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    // Add a small delay to ensure drag state is properly set
    clickTimeoutRef.current = setTimeout(() => {
      if (!isDragging) {
        console.log('Opening project:', project.title);
        setSelectedProject(project);
      } else {
        console.log('Click ignored - currently dragging');
      }
    }, 50);
  }, [isDragging]);

  const handleClose = useCallback(() => {
    setSelectedProject(null);
  }, []);

  const handleNewProject = useCallback(() => {
    setShowNewProjectModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowNewProjectModal(false);
  }, []);

  // Handle drag events
  const handleDragStart = useCallback((layout, oldItem, newItem, placeholder, e, element) => {
    console.log('Drag started for item:', oldItem.i);
    setIsDragging(true);
    
    // Clear click timeout if dragging starts
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
  }, []);

  const handleDragStop = useCallback((layout, oldItem, newItem, placeholder, e, element) => {
    console.log('Drag stopped for item:', oldItem.i);
    
    // Use a delay to prevent click events immediately after drag
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    
    dragTimeoutRef.current = setTimeout(() => {
      console.log('Setting isDragging to false');
      setIsDragging(false);
    }, 200);
  }, []);

  const handleLayoutChange = useCallback((layout, allLayouts) => {
    console.log('Layout changed:', layout);
    setLayouts(allLayouts);
    
    // Optional: Save layout to localStorage or backend
    // localStorage.setItem('projectLayouts', JSON.stringify(allLayouts));
  }, []);

  // Get project type badge color
  const getProjectTypeBadge = (type) => {
    const badges = {
      'website': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'landing_page': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'component_library': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'prototype': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'email_template': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'dashboard': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
    };
    return badges[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  // Animation variants
  const containerVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8 
    },
    visible: { 
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const projectVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.9
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.9,
      transition: {
        duration: 0.3
      }
    }
  };

  const zoomedProjectVariants = {
    hidden: {
      opacity: 0,
      scale: 0.5,
      rotateX: -15
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        damping: 25,
        stiffness: 120
      }
    },
    exit: {
      opacity: 0,
      scale: 0.5,
      rotateX: 15,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const toolbarVariants = {
    hidden: {
      opacity: 0,
      x: 50,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        delay: 0.4,
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: {
      opacity: 0,
      x: 50,
      scale: 0.8,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="w-full flex justify-center items-center">
          <h2 className="text-xl font-semibold text-[var(--color-primary)] text-center">
            Bridging the gap between Designing and Coding
          </h2>
        </div>
      }
    >
      <Head title="Project List" />
      
      {/* Enhanced CSS to fix colors, overflow issues, and improve drag handle */}
      <style jsx>{`
        .layout .react-grid-item {
          pointer-events: auto !important;
          transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        
        .layout .react-grid-item.react-draggable-dragging {
          z-index: 1000 !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1) !important;
          opacity: 0.9 !important;
        }
        
        .layout .react-grid-item .project-content {
          pointer-events: auto !important;
          z-index: 10 !important;
        }
        
        .layout .react-grid-item .project-content:hover {
          transform: none !important;
        }
        
        /* Fix horizontal overflow during drag */
        .layout {
          overflow-x: hidden !important;
          max-width: 100% !important;
        }
        
        /* Prevent grid from extending beyond container */
        .react-grid-layout {
          overflow-x: hidden !important;
          max-width: 100% !important;
        }
        
        /* Ensure project cards use proper theme colors */
        .project-card {
          background-color: var(--color-bg-muted) !important;
          border: 1px solid var(--color-border) !important;
        }
        
        .project-card .preview-area {
          background: var(--color-surface) !important;
        }
        
        /* Enhanced drag handle styling */
        .drag-handle-only {
          background-color: var(--color-bg) !important;
          border: 1px solid var(--color-border) !important;
          opacity: 0.6 !important;
          transition: all 0.2s ease !important;
          cursor: grab !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 6px !important;
          backdrop-filter: blur(4px) !important;
        }
        
        .drag-handle-only:hover {
          opacity: 1 !important;
          background-color: var(--color-primary) !important;
          color: white !important;
          border-color: var(--color-primary) !important;
          transform: scale(1.05) !important;
        }
        
        .drag-handle-only:active,
        .react-draggable-dragging .drag-handle-only {
          cursor: grabbing !important;
          opacity: 1 !important;
          background-color: var(--color-primary) !important;
          color: white !important;
          border-color: var(--color-primary) !important;
        }
        
        .drag-handle-only svg {
          width: 14px !important;
          height: 14px !important;
          transition: all 0.2s ease !important;
        }
        
        /* Visual feedback when dragging */
        .react-grid-placeholder {
          background-color: var(--color-primary) !important;
          opacity: 0.2 !important;
          border-radius: 12px !important;
          border: 2px dashed var(--color-primary) !important;
        }
        
        /* Prevent text selection during drag */
        .layout .react-grid-item.react-draggable-dragging * {
          user-select: none !important;
        }
      `}</style>
      
      <AnimatePresence mode="wait">
        {!selectedProject ? (
          <motion.div
            key="project-list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="p-8 space-y-6 min-h-screen"
          >
            {/* Header Controls */}
            <div className="flex justify-between items-center">
              <div className="flex-start items-center flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[var(--color-text)] text-sm">
                    {searchQuery ? `Search Results (${projects.length})` : `All Projects (${projects.length})`}
                  </span>
                  
                  {/* Search status indicator */}
                  {isSearching && (
                    <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-muted)] px-2 py-1 rounded-full">
                      Searching...
                    </span>
                  )}
                  
                  {/* Active search query */}
                  {searchQuery && !isSearching && (
                    <span className="text-xs text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-1 rounded-full">
                      "{searchQuery}"
                    </span>
                  )}
                </div>
                
                <button className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition">
                  {filters.sort === 'name' ? 'Name' : 
                   filters.sort === 'created_at' ? 'Date created' : 
                   'Last updated'}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            
              <button 
                onClick={handleNewProject}
                className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm shadow-md flex items-center gap-2 hover:bg-[var(--color-primary-hover)] transition"
              >
                <Plus size={16} />
                New Project
              </button>
            </div>

            {/* Empty State */}
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6">
                  <Plus size={32} className="text-gray-400" />
                </div>
                
                {searchQuery ? (
                  <>
                    <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                      No projects found
                    </h3>
                    <p className="text-[var(--color-text-muted)] mb-8 max-w-md">
                      No projects match your search for "{searchQuery}". Try adjusting your search terms or filters.
                    </p>
                    <button 
                      onClick={() => useSearchStore.getState().clearSearch()}
                      className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition font-medium"
                    >
                      Clear search and show all projects
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                      No projects yet
                    </h3>
                    <p className="text-[var(--color-text-muted)] mb-8 max-w-md">
                      Get started by creating your first project. Build websites, landing pages, prototypes, and more with our visual editor.
                    </p>
                    <button 
                      onClick={handleNewProject}
                      className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:bg-[var(--color-primary-hover)] transition"
                    >
                      <Plus size={20} />
                      Create Your First Project
                    </button>
                  </>
                )}
              </div>
            ) : (
              /* Project Grid - Fixed overflow container */
              <div className="w-full relative overflow-hidden" style={{ minHeight: '600px', maxWidth: '100%' }}>
                <ResponsiveGridLayout
                  className="layout"
                  layouts={Object.keys(layouts).length > 0 ? layouts : defaultLayouts}
                  breakpoints={{ lg: 1024, md: 768, sm: 480 }}
                  cols={{ lg: 12, md: 9, sm: 4 }}
                  rowHeight={30}
                  isResizable={false}
                  isDraggable={true}
                  margin={[16, 16]}
                  compactType="vertical"
                  preventCollision={false}
                  isBounded={true}
                  onDragStart={handleDragStart}
                  onDragStop={handleDragStop}
                  onLayoutChange={handleLayoutChange}
                  draggableHandle=".drag-handle-only"
                  useCSSTransforms={true}
                  transformScale={1}
                  style={{ 
                    position: 'relative',
                    minHeight: '600px',
                    maxWidth: '100%',
                    overflowX: 'hidden'
                  }}
                >
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="project-card relative rounded-xl shadow-md overflow-hidden group"
                      style={{ 
                        height: '100%',
                        width: '100%',
                        position: 'relative',
                        backgroundColor: 'var(--color-bg-muted)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      {/* Enhanced drag handle with grip icon */}
                      <div 
                        className="drag-handle-only absolute top-2 right-2 w-7 h-7 z-30"
                        title="Drag to reorder"
                        onMouseDown={(e) => {
                          // Prevent project click when starting drag
                          e.stopPropagation();
                        }}
                      >
                        <GripVertical size={14} />
                      </div>
                      
                      {/* Project type badge */}
                      <div className="absolute top-2 left-2 z-20 pointer-events-none">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getProjectTypeBadge(project.type)}`}>
                          {project.type.replace('_', ' ')}
                        </span>
                      </div>
                      
                      {/* Status indicator */}
                      <div className="absolute top-10 left-2 z-20 pointer-events-none">
                        <div className={`w-2 h-2 rounded-full ${
                          project.project.status === 'published' ? 'bg-green-500' :
                          project.project.status === 'active' ? 'bg-blue-500' :
                          project.project.status === 'archived' ? 'bg-gray-400' :
                          'bg-yellow-500'
                        }`} title={project.project.status}></div>
                      </div>
                      
                      {/* Clickable content area */}
                      <motion.div
                        variants={projectVariants}
                        whileHover={{ 
                          scale: 1.02,
                          y: -2,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ 
                          scale: 0.98,
                          transition: { duration: 0.1 }
                        }}
                        className="absolute inset-0 cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('DIRECT CLICK on project:', project.title);
                          handleProjectClick(project, e);
                        }}
                        style={{
                          height: '100%',
                          width: '100%',
                          zIndex: 15
                        }}
                      >
                        {/* Project info at bottom */}
                        <div className="absolute bottom-2 left-2 right-2 text-xs text-[var(--color-text-muted)] z-20 pointer-events-none">
                          <div className="font-medium text-[var(--color-text)] mb-1 truncate">{project.title}</div>
                          <div className="text-[10px] opacity-75">{project.date}</div>
                          {project.description && (
                            <div className="text-[10px] opacity-60 mt-1 line-clamp-2 text-[var(--color-text-muted)]">
                              {project.description}
                            </div>
                          )}
                          <div className="text-[10px] opacity-75 mt-1">
                            {project.componentCount} components
                          </div>
                        </div>

                        {/* Themed preview area */}
                        <div 
                          className="preview-area w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-sm rounded-xl"
                          style={{
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          <div className="text-center pointer-events-none">
                            {project.project.thumbnail ? (
                              <img 
                                src={project.project.thumbnail} 
                                alt={project.title}
                                className="w-full h-full object-cover rounded-lg opacity-80"
                              />
                            ) : (
                              <>
                                <div 
                                  className="w-12 h-12 mx-auto mb-2 rounded-lg opacity-60"
                                  style={{
                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))'
                                  }}
                                ></div>
                                <p className="text-sm font-medium text-[var(--color-text)]">Preview</p>
                                <p className="text-xs mt-1 opacity-75 text-[var(--color-text-muted)]">Click anywhere to open</p>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </ResponsiveGridLayout>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="project-viewer"
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-[var(--color-bg)] z-50 flex"
          >
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
              {/* Top Bar */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 0.2, duration: 0.5 }
                }}
                className="flex justify-between items-center p-4 border-b border-[var(--color-border)]"
              >
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-[var(--color-text)]">
                    {selectedProject.title}
                  </h2>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getProjectTypeBadge(selectedProject.type)}`}>
                    {selectedProject.type.replace('_', ' ')}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${
                    selectedProject.project.status === 'published' ? 'bg-green-500' :
                    selectedProject.project.status === 'active' ? 'bg-blue-500' :
                    selectedProject.project.status === 'archived' ? 'bg-gray-400' :
                    'bg-yellow-500'
                  }`} title={selectedProject.project.status}></span>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-[var(--color-bg-muted)] rounded-lg transition-colors"
                >
                  <X size={20} className="text-[var(--color-text-muted)]" />
                </button>
              </motion.div>

              {/* Project Content */}
              <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                  variants={zoomedProjectVariants}
                  className="w-full max-w-4xl h-full max-h-[600px] bg-[var(--color-bg-muted)] rounded-2xl shadow-2xl overflow-hidden"
                  style={{ perspective: 1000 }}
                >
                  <div className="w-full h-full flex items-center justify-center bg-[var(--color-bg-muted)]">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl opacity-80"></div>
                      <h3 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                        {selectedProject.title}
                      </h3>
                      <p className="text-[var(--color-text-muted)] mb-2">
                        Created on {selectedProject.date}
                      </p>
                      {selectedProject.description && (
                        <p className="text-[var(--color-text-muted)] text-sm max-w-md mx-auto mb-4">
                          {selectedProject.description}
                        </p>
                      )}
                      <div className="flex items-center justify-center gap-4 text-sm text-[var(--color-text-muted)]">
                        <span>{selectedProject.componentCount} components</span>
                        <span>•</span>
                        <span>{selectedProject.project.status}</span>
                        <span>•</span>
                        <span>{selectedProject.project.viewport_width}×{selectedProject.project.viewport_height}px</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Desktop Toolbar - Right Side */}
            <motion.div
              variants={toolbarVariants}
              className="hidden lg:flex w-16 bg-[var(--color-bg-muted)] border-l border-[var(--color-border)] flex-col items-center py-4 gap-4"
            >
              <Link href={`/void/${selectedProject.project.uuid}`} className="p-3 hover:bg-[var(--color-bg)] rounded-lg transition-colors group">
                <Edit3 size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
              </Link>
              <button className="p-3 hover:bg-[var(--color-bg)] rounded-lg transition-colors group">
                <Copy size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
              </button>
              <button className="p-3 hover:bg-[var(--color-bg)] rounded-lg transition-colors group">
                <Share2 size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
              </button>
              <button className="p-3 hover:bg-[var(--color-bg)] rounded-lg transition-colors group">
                <Download size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
              </button>
              <div className="flex-1"></div>
              <button className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group">
                <Trash2 size={20} className="text-[var(--color-text-muted)] group-hover:text-red-500" />
              </button>
            </motion.div>

            {/* Mobile/Tablet Toolbar - Bottom */}
            <motion.div
              variants={toolbarVariants}
              className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-bg-muted)] border-t border-[var(--color-border)] p-4"
            >
              <div className="flex justify-center items-center gap-6">
                <Link href={`/void/${selectedProject.project.uuid}`} className="flex flex-col items-center gap-1 p-2 hover:bg-[var(--color-bg)] rounded-lg transition-colors group">
                  <Edit3 size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
                  <span className="text-xs text-[var(--color-text-muted)]">Edit</span>
                </Link>
                <button className="flex flex-col items-center gap-1 p-2 hover:bg-[var(--color-bg)] rounded-lg transition-colors group">
                  <Copy size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
                  <span className="text-xs text-[var(--color-text-muted)]">Copy</span>
                </button>
                <button className="flex flex-col items-center gap-1 p-2 hover:bg-[var(--color-bg)] rounded-lg transition-colors group">
                  <Share2 size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
                  <span className="text-xs text-[var(--color-text-muted)]">Share</span>
                </button>
                <button className="flex flex-col items-center gap-1 p-2 hover:bg-[var(--color-bg)] rounded-lg transition-colors group">
                  <Download size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
                  <span className="text-xs text-[var(--color-text-muted)]">Export</span>
                </button>
                <button className="flex flex-col items-center gap-1 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group">
                  <Trash2 size={20} className="text-[var(--color-text-muted)] group-hover:text-red-500" />
                  <span className="text-xs text-[var(--color-text-muted)]">Delete</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Project Modal */}
      <NewProjectModal 
        show={showNewProjectModal}
        onClose={handleModalClose}
      />
    </AuthenticatedLayout>
  );
}