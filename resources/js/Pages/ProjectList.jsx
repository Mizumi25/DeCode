import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Plus, ChevronDown, X, Share2, Download, Edit3, Trash2, Copy } from 'lucide-react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useRef } from 'react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function ProjectList() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [layouts, setLayouts] = useState({});
  const dragTimeoutRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  
  const projects = [
    { id: '0', title: 'Design Sprint', date: 'July 1, 2025', w: 3, h: 4 },
    { id: '1', title: 'Mobile UI Kit', date: 'July 2, 2025', w: 3, h: 3 },
    { id: '2', title: 'Dashboard Redesign', date: 'July 3, 2025', w: 3, h: 5 },
    { id: '3', title: 'Tablet Layout', date: 'July 4, 2025', w: 3, h: 4 },
    { id: '4', title: 'Landing Page', date: 'July 5, 2025', w: 3, h: 3 },
    { id: '5', title: 'Admin Panel', date: 'July 6, 2025', w: 3, h: 4 },
    { id: '6', title: 'Prototype', date: 'July 7, 2025', w: 3, h: 5 },
    { id: '7', title: 'UX Case Study', date: 'July 8, 2025', w: 3, h: 3 },
  ];

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

  const handleProjectClick = useCallback((project) => {
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
    setLayouts(allLayouts);
  }, []);

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
      
      {/* CSS to fix colors and overflow issues */}
      <style jsx>{`
        .layout .react-grid-item {
          pointer-events: auto !important;
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
        
        /* Fix drag handle colors for theme */
        .drag-handle-themed {
          background-color: var(--color-text-muted) !important;
          opacity: 0.3;
        }
        
        .drag-handle-themed:hover {
          background-color: var(--color-primary) !important;
          opacity: 0.8;
        }
        
        .drag-handle-themed .drag-icon {
          background-color: var(--color-bg) !important;
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
                <span className="font-bold text-[var(--color-text)] text-sm">All</span>
                <button className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition">
                  Last viewed by me
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            
              <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm shadow-md flex items-center gap-2 hover:bg-[var(--color-primary-hover)] transition">
                <Plus size={16} />
                New Project
              </button>
            </div>

            {/* Project Grid - Fixed overflow container */}
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
                    {/* Themed drag handle */}
                    <div 
                      className="drag-handle-only drag-handle-themed absolute top-2 right-2 w-6 h-6 cursor-move z-30 rounded transition-all duration-200"
                      title="Drag to reorder"
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="drag-icon w-3 h-3 rounded-sm"></div>
                      </div>
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
                        handleProjectClick(project);
                      }}
                      style={{
                        height: '100%',
                        width: '100%',
                        zIndex: 20
                      }}
                    >
                      <div className="absolute bottom-2 left-2 text-xs text-[var(--color-text-muted)] z-20 pointer-events-none">
                        <div className="font-medium">{project.title}</div>
                        <div className="text-[10px]">{project.date}</div>
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
                          <div 
                            className="w-12 h-12 mx-auto mb-2 rounded-lg opacity-60"
                            style={{
                              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))'
                            }}
                          ></div>
                          <p className="text-sm font-medium text-[var(--color-text)]">Preview</p>
                          <p className="text-xs mt-1 opacity-75 text-[var(--color-text-muted)]">Click anywhere to open</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </ResponsiveGridLayout>
            </div>
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
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  {selectedProject.title}
                </h2>
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
                      <p className="text-[var(--color-text-muted)]">
                        Created on {selectedProject.date}
                      </p>
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
              <Link href="/void" className="p-3 hover:bg-[var(--color-bg)] rounded-lg transition-colors group">
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
                <Link href="/void" className="flex flex-col items-center gap-1 p-2 hover:bg-[var(--color-bg)] rounded-lg transition-colors group">
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
    </AuthenticatedLayout>
  );
}