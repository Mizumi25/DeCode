// Enhanced ForgePage.jsx - Frame Switching with Smooth Transitions
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import Panel from '@/Components/Panel';
import { 
  Square, Code, Layers, User, Settings, ChevronUp, ChevronDown, Copy, RefreshCw, 
  Monitor, PictureInPicture, Loader2, ChevronRight  // ADD ChevronRight
} from 'lucide-react';
import { useForgeStore } from '@/stores/useForgeStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { useForgeUndoRedoStore } from '@/stores/useForgeUndoRedoStore';
import { useCodeSyncStore } from '@/stores/useCodeSyncStore';
import { useThumbnail } from '@/hooks/useThumbnail';
// Add this import with your other store imports
import { useFramePresenceStore } from '@/stores/useFramePresenceStore';

// Import separated forge components
import ComponentsPanel from '@/Components/Forge/ComponentsPanel';
import LayersPanel from '@/Components/Forge/LayersPanel';
import PropertiesPanel from '@/Components/Forge/PropertiesPanel';
import AssetsPanel from '@/Components/Forge/AssetsPanel';
import CanvasComponent from '@/Components/Forge/CanvasComponent';
import BottomCodePanel from '@/Components/Forge/BottomCodePanel';
import SidebarCodePanel from '@/Components/Forge/SidebarCodePanel';
import ModalCodePanel from '@/Components/Forge/ModalCodePanel';

import CodeTooltip from '@/Components/Forge/CodeTooltip';
import FloatingFrameSwitcher from '@/Components/Forge/FloatingFrameSwitcher';
import WindowPanel from '@/Components/WindowPanel';
import LayoutPresets from '@/Components/Forge/LayoutPresets';
import EmptyCanvasState from '@/Components/Forge/EmptyCanvasState';
import SectionDropZone from '@/Components/Forge/SectionDropZone';
import IconWindowPanel from '@/Components/Forge/IconWindowPanel';



import ErrorBoundary from '@/Components/ErrorBoundary';

// Import dynamic component service
import { componentLibraryService } from '@/Services/ComponentLibraryService';
import { tooltipDatabase } from '@/Components/Forge/TooltipDatabase';
import { formatCode, highlightCode, parseCodeAndUpdateComponents } from '@/Components/Forge/CodeUtils';



import { useCollaboration } from '@/hooks/useCollaboration';
import CollaborationOverlay from '@/Components/Forge/CollaborationOverlay';

import { debounce } from 'lodash';
import axios from 'axios';



// ADD THIS HELPER FUNCTION BEFORE export default function ForgePage:
const safeLeaveChannel = (channelName) => {
  if (!window.Echo) {
    console.warn('Echo not available');
    return;
  }

  try {
    // Get the channel from Echo's connector
    const channels = window.Echo.connector?.channels || {};
    const channel = channels[channelName];

    if (channel && typeof channel.leave === 'function') {
      console.log('Leaving channel:', channelName);
      channel.leave();
    } else if (window.Echo.leave) {
      console.log('Using Echo.leave for:', channelName);
      window.Echo.leave(channelName);
    } else {
      console.warn('Cannot leave channel (not joined):', channelName);
    }
  } catch (error) {
    console.error('Error leaving channel:', channelName, error);
    // Don't throw - just log and continue
  }
};







export default function ForgePage({ 
  projectId, 
  frameId, 
  project, 
  frame, 
  projectFrames = []
}) {
  // Zustand stores with proper subscriptions
  const {
    toggleForgePanel,
    isForgePanelOpen,
    getOpenForgePanelsCount,
    allPanelsHidden,
    forgePanelStates,
    _triggerUpdate,
    set
  } = useForgeStore()
  
  const {
    responsiveMode,
    getCurrentCanvasDimensions,
    getResponsiveDeviceInfo,
    getResponsiveScaleFactor,
    getResponsiveCanvasClasses,
    getResponsiveGridBackground,
    gridVisible,
    zoomLevel,
    commentMode,
    commentContextKey,
    commentsByContext,
    setCommentContext,
    addComment
  } = useEditorStore();
  
  const {
    initializeFrame: initUndoRedoFrame,
    pushHistory,
    scheduleAutoSave,
    actionTypes,
    undo,
    redo,
    canUndo,
    canRedo
  } = useForgeUndoRedoStore();
  
  const { 
    syncedCode,         
    codeStyle,            
    setCodeStyle: setSyncedCodeStyle,
    updateSyncedCode 
  } = useCodeSyncStore();
  
  const [currentFrame, setCurrentFrame] = useState(() => {
      const frameIdToUse = frameId || frame?.uuid;
      console.log('ForgePage: Initial frame ID:', frameIdToUse);
      return frameIdToUse;
  });
  
  const { auth } = usePage().props
  const currentUser = auth?.user
  
  // 🔥 ENHANCED: Ensure currentUserId is properly defined for collaboration
  const collaborationUserId = currentUser?.id || window.auth?.user?.id || null;

  const {
    activeCursors,
    draggedElements,
    selectedElements,
    updateCursor,
    broadcastDragStart,
    broadcastDragMove,
    broadcastDragEnd,
    broadcastSelection,
    broadcastDeselection,
    broadcastComponentUpdate, // 🔥 ENHANCED: Component updates for real-time sync
    broadcastRealtimeUpdate,
    broadcastStateChanged,
    sessionId,
  } = useCollaboration(currentFrame, collaborationUserId);

  // 🔥 NEW: Set global variables for real-time collaboration
  useEffect(() => {
    if (collaborationUserId && sessionId) {
      window.currentUserId = collaborationUserId;
      window.currentSessionId = sessionId;
      window.currentFrameUuid = currentFrame;
      window.currentUser = currentUser; // 🔥 Add full user object with name
      window.broadcastComponentUpdate = broadcastComponentUpdate;
      
      console.log('🌐 Global collaboration vars set:', {
        userId: collaborationUserId,
        sessionId,
        frameUuid: currentFrame,
        userName: currentUser?.name
      });
    }
  }, [collaborationUserId, sessionId, currentFrame, broadcastComponentUpdate]);


  // Frame switching state
  const [isFrameSwitching, setIsFrameSwitching] = useState(false)
  const [switchingToFrame, setSwitchingToFrame] = useState(null)
  const [frameTransitionPhase, setFrameTransitionPhase] = useState('idle') // 'idle', 'fadeOut', 'loading', 'fadeIn'

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })
  
  
  // Add these states near your other useState declarations
  const [dragPosition, setDragPosition] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState('__canvas_root__') // ✅ Default to canvas
const [isCanvasSelected, setIsCanvasSelected] = useState(true) // ✅ Track canvas selection

  // Canvas state for dropped components - Now frame-specific
 const [frameCanvasComponents, setFrameCanvasComponents] = useState(() => {
    const initialFrameData = {};
    const currentFrameId = frameId || frame?.uuid;
    
    if (currentFrameId) {
        if (frame?.canvas_data?.components && Array.isArray(frame.canvas_data.components)) {
            initialFrameData[currentFrameId] = frame.canvas_data.components;
        } else {
            initialFrameData[currentFrameId] = [];
        }
    }
    
    return initialFrameData;
});
  
  const [panelDockPosition, setPanelDockPosition] = useState('left');
  
  
  const [generatedCode, setGeneratedCode] = useState({ html: '', css: '', react: '', tailwind: '' })
  
  const showCodePanel = isForgePanelOpen('code-panel');
  
  const [codePanelPosition, setCodePanelPosition] = useState('bottom')
  const [activeCodeTab, setActiveCodeTab] = useState('react')
  const [showTooltips, setShowTooltips] = useState(true)
  const [hoveredToken, setHoveredToken] = useState(null)
  
  // Mobile-optimized code panel settings
  const [codePanelHeight, setCodePanelHeight] = useState(400)
  const [codePanelMinimized, setCodePanelMinimized] = useState(false)
  const [componentsLoaded, setComponentsLoaded] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Initializing components...')

  // Component panel tab state
  const [activeComponentTab, setActiveComponentTab] = useState('elements')
  const [componentSearchTerm, setComponentSearchTerm] = useState('')
  
  const [undoRedoInProgress, setUndoRedoInProgress] = useState(false);
  
  // Enhanced drag state with variant support
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedComponent: null,
    dragPreview: null,
    variant: null
  })

  // WindowPanel state
  const [windowPanelState, setWindowPanelState] = useState({
    isOpen: false,
    mode: 'modal',
    title: 'Forge Window',
    position: { x: 100, y: 100 },
    size: { width: 600, height: 400 }
  })
  
  const {
    scheduleCanvasUpdate: scheduleThumbnailUpdate,
    isGenerating: thumbnailGenerating,
    thumbnailUrl,
    generateFromCanvas: generateThumbnailFromCanvas
  } = useThumbnail(frame?.uuid, frame?.type || 'page', {
    enableRealTimeUpdates: true,
    debounceMs: 2000 // 2 second debounce for canvas updates
  });

  const canvasRef = useRef(null)
  const codePanelRef = useRef(null)
  const [commentChannelJoined, setCommentChannelJoined] = useState(false)
  const [overlayRect, setOverlayRect] = useState(null)
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [activeComment, setActiveComment] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [modalPos, setModalPos] = useState({ left: 0, top: 0 })
  
  
  const isGeneratingCodeRef = useRef(false);
  
  const saveOriginRef = useRef('user');
  
  
  /**
 * Get all nested component IDs for a given component
 */
const getNestedComponentIds = useCallback((componentId, components) => {
  const nested = [];
  
  const findNested = (compId, comps) => {
    comps.forEach(comp => {
      if (comp.parentId === compId || comp.id === compId) {
        nested.push(comp.id);
        if (comp.children?.length > 0) {
          findNested(comp.id, comp.children);
        }
      }
    });
  };
  
  findNested(componentId, components);
  return nested;
}, []);

// Replies whisper listener
useEffect(() => {
  if (!frame?.uuid || !window.Echo) return
  try {
    const ch = `frame.${frame.uuid}`
    const presence = window.Echo.join(ch)
    presence.listenForWhisper('comment.replied', (payload) => {
      const { contextKey, parentId, reply } = payload || {}
      if (!contextKey || !parentId || !reply) return
      setActiveComment(prev => prev && prev.id === parentId ? { ...prev, replies: [...(prev.replies || []), reply] } : prev)
    })
  } catch {}
}, [frame?.uuid])

const openCommentModal = useCallback((c) => {
  if (!overlayRect) return
  setActiveComment(c)
  setReplyText('')
  setCommentModalOpen(true)
  setModalPos({ left: overlayRect.left + c.x + 12, top: overlayRect.top + c.y - 12 })
}, [overlayRect])

const navigateMention = useCallback((type, projectId, frameId) => {
  if (type === 'project' && projectId) {
    router.visit(`/void/${projectId}`)
  } else if (type === 'frame') {
    const proj = projectId || project?.uuid
    if (proj && (frameId || frame?.uuid)) {
      const targetFrame = frameId || frame?.uuid
      router.visit(`/void/${proj}/frame=${targetFrame}/modeForge`)
    }
  }
}, [project?.uuid, frame?.uuid])

const renderContentWithLinks = useCallback((text) => {
  const parts = []
  let lastIndex = 0
  const regex = /(#[Pp]roject:([a-f0-9-]{8,}))|(#[Ff]rame:([a-f0-9-]{8,})(?:\/?([a-f0-9-]{8,}))?)/g
  let m
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index))
    if (m[1]) {
      const projId = m[2]
      parts.push(
        <span key={`p-${m.index}`} className="px-1 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded cursor-pointer hover:underline" onClick={() => navigateMention('project', projId)}>
          #{`project:${projId}`}
        </span>
      )
    } else if (m[3]) {
      const projId = m[4]
      const frameId = m[5]
      parts.push(
        <span key={`f-${m.index}`} className="px-1 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded cursor-pointer hover:underline" onClick={() => navigateMention('frame', projId, frameId)}>
          #{`frame:${projId}${frameId ? '/' + frameId : ''}`}
        </span>
      )
    }
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return <>{parts}</>
}, [navigateMention])

const handleSendReply = useCallback(() => {
  const trimmed = replyText.trim()
  if (!activeComment || !trimmed) return
  const reply = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
    text: trimmed,
    ts: Date.now(),
    user: { id: currentUser?.id, name: currentUser?.name, avatar: currentUser?.avatar || null }
  }
  setActiveComment(prev => prev ? { ...prev, replies: [...(prev.replies || []), reply] } : prev)
  try {
    const ctx = `forge:${frame?.uuid}`
    const ch = `frame.${frame?.uuid}`
    window.Echo?.join(ch)?.whisper('comment.replied', { contextKey: ctx, parentId: activeComment.id, reply })
  } catch {}
  setReplyText('')
}, [replyText, activeComment, currentUser?.id, frame?.uuid])
  
  
  
  
 
  
  // ADD these at the TOP of ForgePage.jsx, after imports and before the component

const LAYOUT_TYPES = ['section', 'container', 'div', 'flex', 'grid'];
const isLayoutElement = (type) => LAYOUT_TYPES.includes(type);

  // Get current frame's canvas components
  const canvasComponents = frameCanvasComponents[currentFrame] || []



    // MODIFY existing generateCode callback
  const generateCode = useCallback(async (components) => {
    try {
      if (!componentLibraryService || !componentLibraryService.clientSideCodeGeneration) {
        const mockCode = {
          react: `// Generated React Code for Frame: ${currentFrame}\nfunction App() {\n  return (\n    <div>\n      {/* ${components.length} components */}\n    </div>\n  );\n}`,
          html: `<!-- Generated HTML for Frame: ${currentFrame} -->\n<div>\n  <!-- ${components.length} components -->\n</div>`,
          css: `/* Generated CSS for Frame: ${currentFrame} */\n.container {\n  /* Styles for ${components.length} components */\n}`,
          tailwind: `<!-- Generated Tailwind for Frame: ${currentFrame} -->\n<div class="container">\n  <!-- ${components.length} components -->\n</div>`
        };
        setGeneratedCode(mockCode);
        updateSyncedCode(mockCode); // ADD THIS LINE
        return;
      }
  
      const code = await componentLibraryService.clientSideCodeGeneration(components, codeStyle);
      setGeneratedCode(code);
      updateSyncedCode(code); // ADD THIS LINE
      
      console.log('Code generated and synced successfully for frame:', currentFrame, Object.keys(code));
    } catch (error) {
      console.error('Failed to generate code:', error);
      const mockCode = {
        react: `// Error generating code\nfunction App() {\n  return <div>Error</div>;\n}`,
        html: `<!-- Error generating code -->`,
        css: `/* Error generating code */`,
        tailwind: `<!-- Error generating code -->`
      };
      setGeneratedCode(mockCode);
      updateSyncedCode(mockCode); // ADD THIS LINE
    }
  }, [codeStyle, currentFrame, updateSyncedCode]);

 // REPLACE existing setCodeStyle with: 
  const handleCodeStyleChange = useCallback((newStyle) => {
    setSyncedCodeStyle(newStyle);         // ✅ Just use the synced setter
    generateCode(canvasComponents);       // Will use updated codeStyle from store
  }, [canvasComponents, generateCode, setSyncedCodeStyle]);


  
  
  
  

  
  
  
  

  
  
    // ADD: Detect if project is GitHub import
  const [isGitHubProject, setIsGitHubProject] = useState(false);
  const [gitHubRepo, setGitHubRepo] = useState(null);
  // Lightweight swipe handler component to pan container when touching outside canvas
  const ScriptlessSwipeHandler = ({ canvasRef }) => {
    const containerRef = useRef(null);
    useEffect(() => {
      const container = document.querySelector('[data-canvas-area]');
      if (!container) return;
      containerRef.current = container;
      let isSwiping = false;
      let startX = 0, startY = 0;
      let lastX = 0, lastY = 0;
      const onTouchStart = (e) => {
        const target = e.target;
        const canvasEl = canvasRef?.current;
        const withinCanvas = canvasEl && canvasEl.contains(target);
        if (withinCanvas) return; // only swipe when touching outside the canvas
        isSwiping = true;
        const t = e.touches[0];
        startX = lastX = t.clientX;
        startY = lastY = t.clientY;
      };
      const onTouchMove = (e) => {
        if (!isSwiping) return;
        const t = e.touches[0];
        const dx = t.clientX - lastX;
        const dy = t.clientY - lastY;
        lastX = t.clientX;
        lastY = t.clientY;
        // Pan the scroll container
        container.scrollLeft -= dx;
        container.scrollTop -= dy;
        e.preventDefault();
      };
      const onTouchEnd = () => {
        isSwiping = false;
      };
      container.addEventListener('touchstart', onTouchStart, { passive: false });
      container.addEventListener('touchmove', onTouchMove, { passive: false });
      container.addEventListener('touchend', onTouchEnd);
      return () => {
        container.removeEventListener('touchstart', onTouchStart);
        container.removeEventListener('touchmove', onTouchMove);
        container.removeEventListener('touchend', onTouchEnd);
      };
    }, [canvasRef]);
    return null;
  };
  
  useEffect(() => {
    if (project?.settings?.imported_from_github) {
      setIsGitHubProject(true);
      setGitHubRepo(project.settings.original_repo);
    }
  }, [project]);
  
  
  
  // Load components lazily after mount
const hasLoadedFrameRef = useRef(new Set());

useEffect(() => {
  const loadFrameComponents = async () => {
    if (!currentFrame || !projectId) return;
    
    // 🔥 CRITICAL: Only load once per frame, don't reload and overwrite user changes
    if (hasLoadedFrameRef.current.has(currentFrame)) {
      console.log('⏭️ Frame already loaded, skipping reload to preserve user changes');
      return;
    }
    
    try {
      console.log('📥 Loading frame components from backend for frame:', currentFrame);
      const response = await axios.get(`/api/frames/${currentFrame}/components`);
      if (response.data.success) {
        setFrameCanvasComponents(prev => ({
          ...prev,
          [currentFrame]: response.data.data
        }));
        
        hasLoadedFrameRef.current.add(currentFrame);
        console.log('✅ Loaded', response.data.data.length, 'components from backend');
        
        if (response.data.data.length > 0) {
          generateCode(response.data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load frame components:', error);
    }
  };
  
  // Delay loading slightly to allow page to render first
  const timeoutId = setTimeout(loadFrameComponents, 100);
  return () => clearTimeout(timeoutId);
}, [currentFrame, projectId]);
  
  
  
  
  

// Real-time component sync via Echo
const hasJoinedChannelRef = useRef(false);

useEffect(() => {
  if (!frame?.uuid || !window.Echo) {
    console.warn('⚠️ Cannot subscribe to real-time updates:', { 
      hasFrame: !!frame?.uuid, 
      hasEcho: !!window.Echo 
    });
    return;
  }
  
  // 🔥 CRITICAL: Prevent duplicate channel joins
  if (hasJoinedChannelRef.current) {
    console.log('⏭️ Already joined channel, skipping');
    return;
  }
  
  const channelName = `frame.${frame.uuid}`;
  console.log('📡 Subscribing to real-time updates:', channelName);
  
  try {
    const channel = window.Echo.join(channelName)
      // Listen for component updates (individual component changes)
      .listen('.component.updated', (event) => {
        console.log('⚡ Component updated:', event);
        
        if (event.userId === currentUser?.id && event.sessionId === sessionId) {
          console.log('⏭️ Ignoring own update');
          return; // Ignore own updates
        }
        
        // Apply component update without saving
        saveOriginRef.current = 'remote';
        
        setFrameCanvasComponents(prev => ({
          ...prev,
          [currentFrame]: updateComponentInTree(
            prev[currentFrame] || [],
            event.componentId,
            event.updateType,
            event.updates
          )
        }));
      })
      
      // Listen for frame state updates (bulk changes, new components)
      .listen('.frame.state.updated', (event) => {
        console.log('🔄 Frame state updated:', event, 'Current user:', currentUser?.id, 'Session:', sessionId);
        
        // 🔥 CRITICAL: Ignore updates from own user OR own session
        if (event.userId === currentUser?.id || event.sessionId === sessionId) {
          console.log('⏭️ Ignoring own frame update (userId match or sessionId match)');
          return; // Ignore own updates
        }
        
        // 🔥 CRITICAL: Only reload if we're not currently in the middle of a save
        if (isSavingRef.current) {
          console.log('⏭️ Save in progress, ignoring frame update to prevent overwrite');
          return;
        }
        
        console.log('✅ Processing frame update from another user');
        
        // Fetch fresh data from backend for bulk updates
        saveOriginRef.current = 'remote';
        
        axios.get(`/api/frames/${frame.uuid}/components`)
          .then(response => {
            if (response.data.success) {
              console.log('✅ Reloaded', response.data.data.length, 'components from backend');
              
              setFrameCanvasComponents(prev => ({
                ...prev,
                [currentFrame]: response.data.data
              }));
              
              generateCode(response.data.data);
            }
          })
          .catch(error => {
            console.error('❌ Failed to reload components:', error);
          });
      });
    
    hasJoinedChannelRef.current = true;
    console.log('✅ Successfully joined channel:', channelName);
    
    return () => {
      try {
        console.log('🚪 Leaving channel:', channelName);
        window.Echo.leave(channelName);
        hasJoinedChannelRef.current = false;
      } catch (e) {
        console.warn('Failed to leave channel:', e);
      }
    };
  } catch (error) {
    console.error('❌ Failed to join channel:', error);
  }
}, [frame?.uuid]); // 🔥 MINIMAL DEPENDENCIES - only re-run when frame changes

// Helper function to update component in tree without full reload
function updateComponentInTree(components, componentId, updateType, updates) {
  return components.map(comp => {
    if (comp.id === componentId) {
      console.log('🔄 Updating component:', componentId, 'type:', updateType, 'data:', updates);
      
      switch (updateType) {
        case 'bulk_update':
          // For bulk updates, merge all the updates
          return { 
            ...comp, 
            style: updates.style || comp.style,
            props: updates.props || comp.props,
            parentId: updates.parentId !== undefined ? updates.parentId : comp.parentId
          };
        case 'drag_move':
          return { ...comp, style: { ...comp.style, left: updates.position?.x, top: updates.position?.y } };
        case 'style':
          return { ...comp, style: { ...comp.style, ...updates } };
        case 'prop':
        case 'props':
          return { ...comp, props: { ...comp.props, ...updates } };
        case 'position':
          return { ...comp, style: { ...comp.style, left: updates.x, top: updates.y } };
        default:
          console.warn('Unknown update type:', updateType);
          return comp;
      }
    }
    
    if (comp.children?.length > 0) {
      return {
        ...comp,
        children: updateComponentInTree(comp.children, componentId, updateType, updates)
      };
    }
    
    return comp;
  });
}



// Comments: setup context and realtime whispers
useEffect(() => {
  if (!frame?.uuid) return;
  setCommentContext(`forge:${frame.uuid}`);
}, [frame?.uuid, setCommentContext]);

useEffect(() => {
  if (!frame?.uuid || !window.Echo) return;
  
  const channelName = `frame.${frame.uuid}`;
  
  try {
    const presence = window.Echo.join(channelName);
    presence.listenForWhisper('comment.created', (payload) => {
      if (!payload || !payload.contextKey || !payload.comment) return;
      addComment(payload.contextKey, payload.comment);
    });
    
    return () => {
      try { 
        window.Echo.leave(channelName);
      } catch (e) {
        console.warn('Failed to leave comment channel', e);
      }
    };
  } catch (e) {
    console.warn('Comments: failed to join presence channel', e);
  }
}, [frame?.uuid, addComment]); // 🔥 REMOVED commentChannelJoined from dependencies

const currentComments = useMemo(() => {
  const key = `forge:${frame?.uuid}`;
  return (commentsByContext && key && commentsByContext[key]) ? commentsByContext[key] : []
}, [commentsByContext, frame?.uuid]);

useEffect(() => {
  const updateRect = () => {
    if (canvasRef.current) {
      setOverlayRect(canvasRef.current.getBoundingClientRect());
    }
  };
  updateRect();
  window.addEventListener('resize', updateRect);
  return () => window.removeEventListener('resize', updateRect);
}, [canvasRef, currentComments.length]);





// 🔥 ADD: Auto-refresh frame data when canvas styles change
useEffect(() => {
  const refreshFrameData = async () => {
    if (!frame?.uuid) return;
    
    try {
      const response = await axios.get(`/api/frames/${frame.uuid}`);
      if (response.data.frame) {
        // Update frame reference to trigger re-render
        console.log('✅ Refreshed frame data:', response.data.frame.canvas_style);
      }
    } catch (error) {
      console.warn('Failed to refresh frame:', error);
    }
  };
  
  // Debounce refresh
  const timer = setTimeout(refreshFrameData, 500);
  return () => clearTimeout(timer);
}, [frame?.canvas_style, frame?.uuid]);
  
  
  
  
  
  
  
  
  
  // ADD: GitHub sync handler
  const handleGitHubSync = useCallback(async () => {
    if (!isGitHubProject || !projectId) return;
    
    try {
      const response = await axios.post(`/api/github/projects/${projectId}/sync`);
      if (response.data.success) {
        // Refresh frame data after sync
        router.reload({ only: ['frame', 'project'] });
      }
    } catch (error) {
      console.error('GitHub sync failed:', error);
    }
  }, [isGitHubProject, projectId]);
  
 
  
  useEffect(() => {
    console.log('ForgePage: Frame props changed:', { 
      frameId, 
      frameUuid: frame?.uuid, 
      hasCanvasData: !!frame?.canvas_data,
      componentCount: frame?.canvas_data?.components?.length || 0
    });
    
    const currentFrameId = frameId || frame?.uuid;
    
    if (!currentFrameId) {
      console.warn('ForgePage: No frame ID available');
      return;
    }
    
    if (currentFrameId !== currentFrame) {
      console.log('ForgePage: Updating current frame from', currentFrame, 'to', currentFrameId);
      setCurrentFrame(currentFrameId);
      setSelectedComponent(null);
      
      // CRITICAL: Always initialize frame data to prevent blank state
      if (frame?.canvas_data?.components && Array.isArray(frame.canvas_data.components)) {
        console.log('ForgePage: Loading frame components from backend:', frame.canvas_data.components.length);
        setFrameCanvasComponents(prev => ({
          ...prev,
          [currentFrameId]: frame.canvas_data.components
        }));
        
        if (frame.canvas_data.components.length > 0) {
          generateCode(frame.canvas_data.components);
        }
      } else {
        // Initialize empty array to prevent undefined errors
        console.log('ForgePage: Initializing empty frame data');
        setFrameCanvasComponents(prev => ({
          ...prev,
          [currentFrameId]: []
        }));
        generateCode([]);
      }
    }
  }, [frameId, frame?.uuid, frame?.canvas_data?.components?.length, currentFrame]); 
  


  // Mock project frames data - This should come from your backend
  const processedProjectFrames = useMemo(() => {
    return (projectFrames || []).map(frame => ({
      ...frame,
      isActive: frame.id === currentFrame || frame.uuid === currentFrame
    }));
  }, [projectFrames, currentFrame]);

  // Enhanced frame switching handler with smooth transitions
  const handleFrameSwitch = useCallback(async (newFrameId) => {
    if (newFrameId === currentFrame || isFrameSwitching) return;

    console.log('Switching from frame:', currentFrame, 'to frame:', newFrameId);
    
    setIsFrameSwitching(true);
    setSwitchingToFrame(newFrameId);
    
    try {
      // Phase 1: Fade out current content
      setFrameTransitionPhase('fadeOut');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Phase 2: Show loading state
      setFrameTransitionPhase('loading');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Save current frame state before switching
      if (canvasComponents.length > 0) {
        setFrameCanvasComponents(prev => ({
          ...prev,
          [currentFrame]: canvasComponents
        }));
      }
      
      // Switch to new frame - In real app, this would navigate via Inertia
      setCurrentFrame(newFrameId);
      
      // Clear current selection when switching frames
      setSelectedComponent(null);
      
      // Load new frame's components (mock data for now)
      const newFrameComponents = frameCanvasComponents[newFrameId] || [];
      if (newFrameComponents.length > 0) {
        generateCode(newFrameComponents);
      }
      
      // Phase 3: Fade in new content
      setFrameTransitionPhase('fadeIn');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Phase 4: Complete transition
      setFrameTransitionPhase('idle');
      
      console.log('Frame switch completed to:', newFrameId);
      
    } catch (error) {
      console.error('Error during frame switch:', error);
      setFrameTransitionPhase('idle');
    } finally {
      setIsFrameSwitching(false);
      setSwitchingToFrame(null);
    }
  }, [currentFrame, isFrameSwitching, canvasComponents, frameCanvasComponents]);

  // WindowPanel handlers
  const handleOpenWindowPanel = useCallback(() => {
    setWindowPanelState(prev => ({
      ...prev,
      isOpen: true,
      position: { 
        x: Math.max(50, (windowDimensions.width - prev.size.width) / 2), 
        y: Math.max(50, (windowDimensions.height - prev.size.height) / 2)
      }
    }));
  }, [windowDimensions]);

  const handleCloseWindowPanel = useCallback(() => {
    setWindowPanelState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  // Handle window resize and mobile detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowDimensions({ width, height });
      setIsMobile(width < 768);
      
      if (width < 768) {
        setCodePanelHeight(Math.min(400, height * 0.6));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize component library and load frame-specific data
  useEffect(() => {
    const initializeComponents = async () => {
      try {
        setLoadingMessage('Loading components from database...');
        
        if (typeof componentLibraryService === 'undefined' || !componentLibraryService) {
          console.warn('componentLibraryService not available, using mock data');
          setComponentsLoaded(true);
          setLoadingMessage('');
          return;
        }
        
        await componentLibraryService.loadComponents();
        setComponentsLoaded(true);
        
        // ✅ CRITICAL: Load components with proper recursive structure
        if (frame?.canvas_data?.components) {
          console.log('✅ Loading frame components from backend:', frame.canvas_data.components.length);
          
          // ✅ Ensure components have proper structure
          const processedComponents = frame.canvas_data.components.map(comp => ({
            ...comp,
            id: comp.id || comp.component_instance_id,
            type: comp.type || comp.component_type,
            props: comp.props || {},
            style: comp.style || {},
            animation: comp.animation || {},
            children: comp.children || [],
            isLayoutContainer: comp.isLayoutContainer ?? comp.is_layout_container ?? false,
          }));
          
          setFrameCanvasComponents(prev => ({
            ...prev,
            [currentFrame]: processedComponents
          }));
          
          if (processedComponents.length > 0) {
            generateCode(processedComponents);
          }
        } else if (projectId && currentFrame && componentLibraryService.loadProjectComponents) {
          // Fallback to service-based loading
          setLoadingMessage('Loading frame components from service...');
          const serviceComponents = await componentLibraryService.loadProjectComponents(projectId, currentFrame);
          if (serviceComponents && serviceComponents.length > 0) {
            setFrameCanvasComponents(prev => ({
              ...prev,
              [currentFrame]: serviceComponents
            }));
            generateCode(serviceComponents);
          }
        }
        
        setLoadingMessage('');
      } catch (error) {
        console.error('Failed to initialize components:', error);
        setComponentsLoaded(true);
        setLoadingMessage('');
      }
    };

    // Only initialize if we have a current frame
    if (currentFrame) {
      initializeComponents();
    }
  }, [currentFrame, projectId]);
  


// 🔥 FIXED: Use ref to track previous components and prevent loops
const lastSaveHashRef = useRef('');
const isSavingRef = useRef(false);

useEffect(() => {
  // Skip if this update came from remote or undo
  if (saveOriginRef.current !== 'user') {
    console.log(`⏭️ Skipping auto-save (${saveOriginRef.current} update)`);
    saveOriginRef.current = 'user';
    return;
  }
  
  // Skip if already saving
  if (isSavingRef.current) {
    console.log('⏭️ Save already in progress');
    return;
  }
  
  // Skip if not ready (but allow empty canvas saves!)
  if (!projectId || !currentFrame || !componentsLoaded || isFrameSwitching) {
    console.log('⏭️ Not ready to save:', { projectId: !!projectId, currentFrame: !!currentFrame, componentsLoaded, isFrameSwitching });
    return;
  }
  
  // Skip if components haven't actually changed (use hash comparison)
  const currentHash = JSON.stringify(canvasComponents.map(c => ({
    id: c.id,
    type: c.type,
    parentId: c.parentId,
    style: c.style,
    props: c.props,
  })));
  
  if (currentHash === lastSaveHashRef.current) {
    console.log('⏭️ No changes to save (hash matches)');
    return;
  }
  
  // Check if there's a pending undo/redo operation
  if (componentLibraryService?.hasPendingSave && componentLibraryService.hasPendingSave(currentFrame)) {
    console.log('⏭️ Skipping auto-save due to pending undo/redo operation');
    return;
  }
  
  const saveComponents = async () => {
    try {
      isSavingRef.current = true;
      console.log('💾 ForgePage: Auto-saving', canvasComponents.length, 'components');
      
      await componentLibraryService.saveProjectComponents(
        projectId,
        currentFrame,
        canvasComponents,
        { silent: false } // 🔥 Broadcast this save
      );
      
      lastSaveHashRef.current = currentHash;
      console.log('✅ Auto-save completed successfully');
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    } finally {
      isSavingRef.current = false;
    }
  };
  
  const timeoutId = setTimeout(saveComponents, 2000);
  return () => clearTimeout(timeoutId);
}, [canvasComponents, projectId, currentFrame, componentsLoaded, isFrameSwitching]); // 🔥 FIXED: Use full canvasComponents array as dependency





// ADD: Asset drop handler
const handleAssetDrop = useCallback((e) => {
  e.preventDefault();
  
  if (!canvasRef.current) return;

  try {
    const dragDataStr = e.dataTransfer.getData('application/json');
    let dragData;
    
    try {
      dragData = JSON.parse(dragDataStr);
    } catch {
      return; // Not an asset drop
    }

    // Check if it's an asset drop
    if (dragData.type !== 'asset') return;

    const { asset, assetType } = dragData;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - canvasRect.left - 50);
    const y = Math.max(0, e.clientY - canvasRect.top - 20);

    // Create appropriate component based on asset type
    let componentType;
    let defaultProps = {};

    switch (assetType) {
      case 'image':
        componentType = 'image';
        defaultProps = {
          src: asset.url,
          alt: asset.name,
          width: asset.dimensions?.width || 'auto',
          height: asset.dimensions?.height || 'auto'
        };
        break;
      case 'video':
        componentType = 'video';
        defaultProps = {
          src: asset.url,
          controls: true,
          width: asset.dimensions?.width || 640,
          height: asset.dimensions?.height || 360
        };
        break;
      case 'audio':
        componentType = 'audio-player';
        defaultProps = {
          src: asset.url,
          title: asset.name,
          duration: asset.duration
        };
        break;
      default:
        // For documents, create a download link component
        componentType = 'link';
        defaultProps = {
          href: asset.url,
          text: asset.name,
          target: '_blank'
        };
        break;
    }

    const newComponent = componentLibraryService?.createLayoutElement 
      ? componentLibraryService.createLayoutElement(componentType, defaultProps)
      : {
          id: `${componentType}_${Date.now()}`,
          type: componentType,
          props: defaultProps,
          position: { x, y },
          name: `${asset.name} (${assetType})`,
          style: {},
          animation: {},
          children: []
        };

    console.log('ForgePage: Dropping asset as component:', newComponent);

    const updatedComponents = [...canvasComponents, newComponent];
    
    setFrameCanvasComponents(prev => ({
      ...prev,
      [currentFrame]: updatedComponents
    }));
    
    pushHistory(currentFrame, updatedComponents, actionTypes.DROP, {
      componentName: newComponent.name,
      componentType: newComponent.type,
      position: { x, y },
      componentId: newComponent.id
    });
    
    setSelectedComponent(newComponent.id);
    generateCode(updatedComponents);
    
  } catch (error) {
    console.error('Error handling asset drop:', error);
  }
}, [canvasComponents, currentFrame, componentLibraryService, pushHistory, actionTypes, generateCode]);







  // Initialize undo/redo when frame and components are ready
  useEffect(() => {
    if (currentFrame && componentsLoaded) {
      console.log('ForgePage: Initializing undo/redo for frame:', currentFrame);
      initUndoRedoFrame(currentFrame);
      
      // Push initial state if we have components
      if (canvasComponents.length > 0) {
        console.log('ForgePage: Pushing initial state with', canvasComponents.length, 'components');
        pushHistory(currentFrame, canvasComponents, actionTypes.INITIAL);
      }
    }
  }, [currentFrame, componentsLoaded, canvasComponents.length, initUndoRedoFrame, pushHistory, actionTypes]);
    
  // Force re-render when ForgeStore state changes
  useEffect(() => {
    console.log('ForgePage: ForgeStore state changed, triggering re-render');
  }, [forgePanelStates, allPanelsHidden, _triggerUpdate, showCodePanel]);

  // Mobile-specific: Force code panel to bottom on mobile
  useEffect(() => {
    if (isMobile && codePanelPosition === 'right') {
      setCodePanelPosition('bottom');
    }
  }, [isMobile, codePanelPosition]);

  // Handle token hover for tooltips
  const handleTokenHover = (e) => {
    if (!showTooltips || isMobile) return
    
    const token = e.target.getAttribute('data-token')
    if (token && tooltipDatabase && tooltipDatabase[token]) {
      const rect = e.target.getBoundingClientRect()
      setHoveredToken({
        token,
        tooltip: tooltipDatabase[token],
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      })
    }
  }

  const handleTokenLeave = () => {
    setHoveredToken(null)
  }

  // Panel handlers
  const handlePanelClose = (panelId) => {
    console.log('ForgePage: Panel close requested for:', panelId);
    toggleForgePanel(panelId)
  }

  const handlePanelStateChange = useCallback((hasRightPanels) => {
    console.log(`Right panels active: ${hasRightPanels}`)
  }, [])

  const handlePanelToggle = useCallback((panelType) => {
    const panelMap = {
      'components': 'components-panel',
      'code': 'code-panel',
      'layers': 'layers-panel'
    }
    
    const actualPanelId = panelMap[panelType]
    console.log('ForgePage: Header panel toggle requested:', panelType, '-> Panel ID:', actualPanelId);
    
    if (actualPanelId) {
      toggleForgePanel(actualPanelId)
    }
  }, [toggleForgePanel])

  const handleComponentTabChange = useCallback((tab) => {
    setActiveComponentTab(tab)
  }, [])

  const handleComponentSearch = useCallback((searchTerm) => {
    setComponentSearchTerm(searchTerm)
  }, [])

const handleComponentDragStart = useCallback((e, componentType, variant = null, dragData = null) => {
  console.log('Drag started:', componentType);

  // 🔥 CRITICAL: Get element ACTUAL rendered size
  const element = e.target.closest('[data-component-id]');
  let ghostBounds = null;
  
  if (element) {
    const rect = element.getBoundingClientRect();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    
    // 🔥 Calculate scale factor based on responsive mode
    const scaleFactor = responsiveMode === 'mobile' ? 0.6 : 
                       responsiveMode === 'tablet' ? 0.8 : 1.0;
    
    ghostBounds = {
      width: rect.width / scaleFactor,  // Normalize to original size
      height: rect.height / scaleFactor,
      scaleFactor: scaleFactor  // 🔥 Pass scale factor
    };
  }



  setDragState({
    isDragging: true,
    draggedComponent: {
      type: componentType,
      name: componentType,
      ghostBounds,
    },
    variant: variant,
    dragPreview: null
  });

  e.dataTransfer.effectAllowed = 'copy';
  e.dataTransfer.setData('text/plain', JSON.stringify({ componentType, variant, ghostBounds }));
  
  // 🔥 ADD: Broadcast to others (only if dragging existing component)
  if (dragData && dragData.componentId) {
    const component = canvasComponents.find(c => c.id === dragData.componentId);
    if (component) {
      const element = e.target.closest('[data-component-id]');
      if (element) {
        const rect = element.getBoundingClientRect();
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        
        if (canvasRect) {
          const relativeX = rect.left - canvasRect.left;
          const relativeY = rect.top - canvasRect.top;
          
          broadcastDragStart(dragData.componentId, component.name || component.type, {
            x: relativeX,
            y: relativeY,
            width: rect.width,
            height: rect.height,
          });
        }
      }
    }
  }
}, [responsiveMode, broadcastDragStart, canvasComponents]);

// 2. handleComponentDrag is already correct, just make sure it exists

// 3. Update handleComponentDragEnd
const handleComponentDragEnd = useCallback((componentId) => {
  // Clean up visual feedback
  document.querySelectorAll('.layout-container').forEach(el => {
    el.classList.remove('drop-zone-active', 'drop-zone-hover');
  });
  
  if (dragState.dragPreview) {
    document.body.removeChild(dragState.dragPreview)
  }
  
  setDragState({
    isDragging: false,
    draggedComponent: null,
    variant: null,
    dragPreview: null
  })
  
  // 🔥 ADD: Broadcast drag end (only if componentId exists)
  if (componentId) {
    broadcastDragEnd(componentId);
  }
}, [dragState.dragPreview, broadcastDragEnd])




// 🔥 FIXED: handlePropertyUpdate with RECURSIVE nested component support
const handlePropertyUpdate = useCallback((componentId, propName, value) => {
  console.log('🎯 ForgePage: Property update:', { componentId, propName, value });
  
  // 🔥 NEW: RECURSIVE UPDATE FUNCTION - Updates nested components anywhere in tree
  const updateComponentRecursive = (components) => {
    return components.map(c => {
      // Found the target component
      if (c.id === componentId) {
        console.log('✅ Found target component:', componentId);
        
        if (propName === 'position') {
          return { ...c, position: value }
        } else if (propName === 'style') {
          // 🔥 CRITICAL: REPLACE entire style object
          console.log('🔄 Replacing entire style object:', value);
          return { 
            ...c, 
            style: value // ✅ Direct replacement
          }
        } else if (propName === 'animation') {
          return { ...c, animation: { ...c.animation, ...value } }
        } else if (propName === 'name') {
          return { ...c, name: value }
        } else if (propName === 'reset') {
          return { 
            ...c, 
            style: {}, 
            animation: {},
            props: {}
          }
        } else {
          // 🔥 Single property update in style
          console.log('📝 Updating single style property:', propName, '=', value);
          return { 
            ...c, 
            style: {
              ...c.style,
              [propName]: value
            }
          }
        }
      }
      
      // 🔥 NEW: CRITICAL - Recursively update children if they exist
      if (c.children && c.children.length > 0) {
        return {
          ...c,
          children: updateComponentRecursive(c.children)
        };
      }
      
      return c;
    });
  };
  
  // 🔥 CHANGED: Use recursive function instead of simple map
  const updatedComponents = updateComponentRecursive(canvasComponents);
  
  // 🔥 CRITICAL: Force immediate state update
  console.log('⚡ Forcing immediate canvas update with recursive changes');
  setFrameCanvasComponents(prev => ({
    ...prev,
    [currentFrame]: updatedComponents
  }));
  
  // 🔥 CHANGED: Find component recursively for history tracking
  const findComponent = (components, id) => {
    for (const comp of components) {
      if (comp.id === id) return comp;
      if (comp.children?.length > 0) {
        const found = findComponent(comp.children, id);
        if (found) return found;
      }
    }
    return null;
  };
  
  const component = findComponent(canvasComponents, componentId);
  const componentName = component?.name || component?.type || 'component';
  
  // KEEP EVERYTHING BELOW THIS THE SAME - all your existing history logic
  let actionType = actionTypes.PROP_UPDATE;
  if (propName === 'position') actionType = actionTypes.MOVE;
  else if (propName === 'style') actionType = actionTypes.STYLE_UPDATE;
  
  if (propName === 'position') {
    const oldPos = component?.position || { x: 0, y: 0 };
    const deltaX = Math.abs(value.x - oldPos.x);
    const deltaY = Math.abs(value.y - oldPos.y);
    
    if (deltaX > 5 || deltaY > 5) {
      pushHistory(currentFrame, updatedComponents, actionType, {
        componentName,
        componentId,
        propName,
        value,
        previousValue: oldPos
      });
    }
  } else {
    pushHistory(currentFrame, updatedComponents, actionType, {
      componentName,
      componentId,
      propName,
      value,
      previousValue: propName === 'style' ? component?.style : component?.props?.[propName]
    });
  }
  
  // ENHANCED: Schedule thumbnail update for visual changes
  const shouldUpdateThumbnail = propName !== 'name' && 
                               (propName === 'style' || propName === 'position' || 
                                propName === 'props' || propName === 'animation');
                                
  if (shouldUpdateThumbnail && updatedComponents.length > 0) {
    const canvasSettings = {
      viewport: getCurrentCanvasDimensions(),
      background_color: frame?.settings?.background_color || '#ffffff',
      responsive_mode: responsiveMode,
      zoom_level: zoomLevel,
      grid_visible: gridVisible
    };
    
    scheduleThumbnailUpdate(updatedComponents, canvasSettings);
  }
  
  
  
  if (broadcastComponentUpdate) {
    let updateType = 'style';
    let updates = {};
    
    if (propName === 'position') {
      updateType = 'position';
      updates = value;
    } else if (propName === 'style') {
      updateType = 'style';
      updates = value;
    } else if (propName === 'props' || propName === 'content' || propName === 'text') {
      updateType = 'props';
      updates = { [propName]: value };
    }
    
    console.log('📡 Broadcasting component update:', {
      componentId,
      updateType,
      updates
    });
    
    broadcastComponentUpdate(componentId, updates, updateType);
  }
  
  
  
  // Auto-save with longer delay to prevent conflicts
  setTimeout(() => {
    if (componentLibraryService?.saveProjectComponents) {
      componentLibraryService.saveProjectComponents(projectId, currentFrame, updatedComponents);
    }
  }, propName === 'position' ? 2000 : 1000);
  
  generateCode(updatedComponents);
}, [canvasComponents, currentFrame, projectId, pushHistory, actionTypes, componentLibraryService, generateCode, 
    scheduleThumbnailUpdate, getCurrentCanvasDimensions, responsiveMode, zoomLevel, gridVisible, frame?.settings, broadcastComponentUpdate]);







const handleComponentDrag = useCallback((e, componentId) => {
  if (!canvasRef.current) return;
  
  const rect = canvasRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Update local position immediately
  handlePropertyUpdate(componentId, 'position', { x, y });
  
  // 🔥 CRITICAL: Broadcast immediately (no debounce)
  const component = canvasComponents.find(c => c.id === componentId);
  if (component && broadcastDragMove) {
    const element = document.querySelector(`[data-component-id="${componentId}"]`);
    if (element) {
      const elemRect = element.getBoundingClientRect();
      
      // Broadcast with full position data
      broadcastDragMove(componentId, x, y, {
        x,
        y,
        width: elemRect.width,
        height: elemRect.height,
      });
    }
  }
}, [handlePropertyUpdate, broadcastDragMove, canvasComponents, canvasRef]);
  
  





const calculateDropIntent = (rect, mouseX, mouseY, isLayout) => {
  if (!isLayout) {
    const middleY = rect.top + (rect.height / 2);
    return {
      intent: mouseY < middleY ? 'before' : 'after',
      targetId: null
    };
  }
  
  const width = rect.width;
  const height = rect.height;
  
  // 🎯 OPTIMAL THRESHOLDS based on UX research
  const EDGE_THRESHOLD = 0.2;    // Top 20% and bottom 20%
  const CENTER_THRESHOLD = 0.5;  // Middle 50%
  
  const normalizedX = (mouseX - rect.left) / width;
  const normalizedY = (mouseY - rect.top) / height;
  
  // Check center "nest zone"
  const centerMinX = (1 - CENTER_THRESHOLD) / 2;
  const centerMaxX = 1 - centerMinX;
  const centerMinY = (1 - CENTER_THRESHOLD) / 2;
  const centerMaxY = 1 - centerMinY;
  
  const isInCenterX = normalizedX > centerMinX && normalizedX < centerMaxX;
  const isInCenterY = normalizedY > centerMinY && normalizedY < centerMaxY;
  
  if (isInCenterX && isInCenterY) {
    console.log('🎯 CENTER ZONE → NEST');
    return { intent: 'nest', targetId: null };
  }
  
  // Prioritize vertical edges (top/bottom)
  const isTopEdge = normalizedY < EDGE_THRESHOLD;
  const isBottomEdge = normalizedY > (1 - EDGE_THRESHOLD);
  
  if (isTopEdge) {
    console.log('⬆️ TOP EDGE → BEFORE');
    return { intent: 'before', targetId: null };
  }
  if (isBottomEdge) {
    console.log('⬇️ BOTTOM EDGE → AFTER');
    return { intent: 'after', targetId: null };
  }
  
  // Fallback to middle comparison
  const middleY = rect.top + (rect.height / 2);
  return mouseY < middleY 
    ? { intent: 'before', targetId: null } 
    : { intent: 'after', targetId: null };
};





// 🔥 ENHANCED: Better drop target detection with recursive search
const findDropTarget = useCallback((components, dropX, dropY, canvasRect) => {
  console.log('🎯 Smart drop detection at:', { dropX, dropY });
  
  // 🔥 RECURSIVE: Flatten all components (including nested) for search
  const flattenComponents = (comps, depth = 0) => {
    const flat = [];
    comps.forEach(comp => {
      flat.push({ ...comp, depth });
      if (comp.children && comp.children.length > 0) {
        flat.push(...flattenComponents(comp.children, depth + 1));
      }
    });
    return flat;
  };
  
  const allComponents = flattenComponents(components);
  
  // Sort by depth (deepest first) and z-index (highest first), prioritize layouts
  const sorted = allComponents.sort((a, b) => {
    // Deepest components first (most specific)
    if (a.depth !== b.depth) return b.depth - a.depth;
    
    const aIsLayout = a.isLayoutContainer;
    const bIsLayout = b.isLayoutContainer;
    
    // Layouts first at same depth
    if (aIsLayout && !bIsLayout) return -1;
    if (!aIsLayout && bIsLayout) return 1;
    
    // Then by z-index
    return (b.zIndex || 0) - (a.zIndex || 0);
  });

  // 🔥 FIXED: Use actual mouse coordinates (not relative)
  const mouseX = dropX + canvasRect.left;
  const mouseY = dropY + canvasRect.top;

  for (const comp of sorted) {
    const element = document.querySelector(`[data-component-id="${comp.id}"]`);
    if (!element) continue;
    
    const rect = element.getBoundingClientRect();
    
    // 🔥 FIXED: Check if cursor is within element bounds using actual coordinates
    const isInBounds = 
      mouseX >= rect.left && mouseX <= rect.right &&
      mouseY >= rect.top && mouseY <= rect.bottom;
    
    if (!isInBounds) continue;
    
    // ✅ SMART INTENT DETECTION
    const intent = calculateDropIntent(rect, mouseX, mouseY, comp.isLayoutContainer);
    
    console.log('✅ Found target:', {
      name: comp.name,
      isLayout: comp.isLayoutContainer,
      intent: intent,
      depth: comp.depth
    });
    
    // Return target with intent metadata
    return {
      component: comp,
      intent: intent, // 'nest' | 'before' | 'after'
      bounds: rect
    };
  }
  
  console.log('❌ No target found, drop at root');
  return null;
}, []);


const handleMouseMove = (moveEvent) => {
  const newX = moveEvent.clientX - canvasRect.left - dragOffset.x;
  const newY = moveEvent.clientY - canvasRect.top - dragOffset.y;
  
  // Constrain to canvas bounds
  const maxWidth = responsiveMode === 'desktop' ? canvasRect.width - 100 : canvasSize.width - 100;
  const maxHeight = responsiveMode === 'desktop' ? canvasRect.height - 50 : 600;
  
  const constrainedX = Math.max(0, Math.min(newX, maxWidth));
  const constrainedY = Math.max(0, Math.min(newY, maxHeight));
  
  // Check if actually moved significantly
  const deltaX = Math.abs(constrainedX - initialPosition.x);
  const deltaY = Math.abs(constrainedY - initialPosition.y);
  
  if (deltaX > 1 || deltaY > 1) {
    hasMoved = true;
  }
  
  handlePropertyUpdate(componentId, 'position', { x: constrainedX, y: constrainedY });
  
  // 🔥 BROADCAST POSITION UPDATE IN REAL-TIME
  if (broadcastDragMove) {
    broadcastDragMove(componentId, constrainedX, constrainedY, {
      x: constrainedX,
      y: constrainedY,
      width: rect.width,
      height: rect.height,
    });
  }
};


const handleCanvasDragOver = useCallback((e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
  
  if (!canvasRef.current) return;

  const canvasRect = canvasRef.current.getBoundingClientRect();
  const dropX = e.clientX - canvasRect.left;
  const dropY = e.clientY - canvasRect.top;

  setDragPosition({ x: dropX, y: dropY });

  // Clear previous feedback
  document.querySelectorAll('.drop-intent-visual').forEach(el => {
    el.remove();
  });
  
  const dropTarget = findDropTarget(canvasComponents, dropX, dropY, canvasRect);
  
  if (!dropTarget) return;
  
  const { component, intent, bounds } = dropTarget;
  const targetElement = document.querySelector(`[data-component-id="${component.id}"]`);
  
  if (!targetElement) return;
  
  // Remove old visual feedback
  targetElement.classList.remove('drop-intent-nest', 'drop-intent-before', 'drop-intent-after');
  
  // Add new visual feedback
  if (intent === 'nest') {
    targetElement.classList.add('drop-intent-nest');
    
    // Show "Drop inside" indicator
    const indicator = document.createElement('div');
    indicator.className = 'drop-intent-visual drop-nest-indicator';
    indicator.textContent = '📦 Drop inside';
    indicator.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(16, 185, 129, 0.95);
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      pointer-events: none;
      z-index: 10000;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    targetElement.appendChild(indicator);
    
  } else if (intent === 'before') {
    targetElement.classList.add('drop-intent-before');
    
    // Show line ABOVE element
    const line = document.createElement('div');
    line.className = 'drop-intent-visual drop-line-before';
    line.style.cssText = `
      position: absolute;
      top: -2px;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, transparent, #3b82f6, transparent);
      border-radius: 2px;
      pointer-events: none;
      z-index: 10000;
      box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
    `;
    targetElement.appendChild(line);
    
  } else if (intent === 'after') {
    targetElement.classList.add('drop-intent-after');
    
    // Show line BELOW element
    const line = document.createElement('div');
    line.className = 'drop-intent-visual drop-line-after';
    line.style.cssText = `
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, transparent, #3b82f6, transparent);
      border-radius: 2px;
      pointer-events: none;
      z-index: 10000;
      box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
    `;
    targetElement.appendChild(line);
  }
  
}, [canvasComponents, findDropTarget]);


  


const handleCanvasDrop = useCallback((e) => {
  e.preventDefault();
  e.stopPropagation();
  
  console.log('🎯 DROP FIRED');
  
  if (!canvasRef.current) return;

  try {
    const componentDataStr = e.dataTransfer.getData('text/plain');
    console.log('📦 Raw drag data:', componentDataStr);
    
    if (!componentDataStr) {
      console.error('❌ No drag data');
      return;
    }
    
    let dragData;
    try {
      dragData = JSON.parse(componentDataStr);
      console.log('✅ Parsed:', dragData);
    } catch (err) {
      console.error('❌ Parse failed:', err);
      return;
    }

    // 🔥 FIX: Handle BOTH formats (panel vs canvas)
    const componentType = dragData.componentType || dragData.type;
    const variant = dragData.variant || null;
    
    if (!componentType) {
      console.error('❌ No componentType');
      return;
    }
    
    console.log('🎨 Creating:', componentType, variant?.name);
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const dropX = e.clientX - canvasRect.left;
    const dropY = e.clientY - canvasRect.top;

    // Get component definition
    let componentDef = componentLibraryService?.getComponentDefinition(componentType);
    
    // 🔥 FIX: Merge default props + variant props correctly
    const baseProps = componentDef?.default_props || {};
    const variantProps = variant?.props || {};
    const variantStyle = variant?.style || {};

    const newComponent = {
      id: `${componentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: componentType,
      props: {
        ...baseProps,
        ...variantProps
      },
      name: variant ? `${componentType} (${variant.name})` : (componentDef?.name || componentType),
      variant: variant || null,
      style: {
        ...variantStyle,
      },
      animation: {},
      children: [],
      isLayoutContainer: ['section', 'container', 'div', 'flex', 'grid'].includes(componentType),
      zIndex: 0,
      sortOrder: canvasComponents.length,
      position: { x: dropX - 50, y: dropY - 20 }
    };

    console.log('✅ NEW COMPONENT:', newComponent);

    const updatedComponents = [...canvasComponents, newComponent];
    
    console.log('📦 UPDATING STATE:', updatedComponents.length, 'components');
    console.log('📦 Components before update:', canvasComponents.length);
    console.log('📦 Components after update:', updatedComponents.length);
    
    // 🔥 CRITICAL: Make sure saveOriginRef is set to 'user' so auto-save will run
    saveOriginRef.current = 'user';
    
    setFrameCanvasComponents(prev => {
      const newState = {
        ...prev,
        [currentFrame]: updatedComponents
      };
      console.log('📦 New state being set:', newState[currentFrame]?.length, 'components for frame', currentFrame);
      return newState;
    });
    
    // 🔥 DEBUG: Check state after update
    setTimeout(() => {
      console.log('📦 State check after 100ms:', frameCanvasComponents[currentFrame]?.length);
    }, 100);
    
    setSelectedComponent(newComponent.id);
    handleComponentDragEnd();
    
    if (pushHistory && actionTypes) {
      pushHistory(currentFrame, updatedComponents, actionTypes.DROP, {
        componentName: newComponent.name,
        componentType: newComponent.type,
        componentId: newComponent.id
      });
    }
    
    generateCode(updatedComponents);
    
    console.log('✅ DROP COMPLETE - Component added to state');
    
  } catch (error) {
    console.error('❌ DROP ERROR:', error);
  }
}, [canvasRef, canvasComponents, currentFrame, componentLibraryService, pushHistory, actionTypes, generateCode, setFrameCanvasComponents, handleComponentDragEnd]);






  
  const getComponentBounds = (comp) => {
      return {
          x: comp.position?.x || 0,
          y: comp.position?.y || 0,
          width: parseInt(comp.style?.width) || 100,
          height: parseInt(comp.style?.minHeight) || 50
      };
  };
  
  const isPointInBounds = (point, bounds) => {
      return point.x >= bounds.x && point.x <= bounds.x + bounds.width &&
             point.y >= bounds.y && point.y <= bounds.y + bounds.height;
  };
  
// REPLACE your existing addChildToContainer with this fixed version:
const addChildToContainer = (components, containerId, newChild, depth = 0) => {
  // Prevent infinite recursion
  const MAX_DEPTH = 10;
  if (depth > MAX_DEPTH) {
    console.error('❌ Maximum nesting depth exceeded:', depth);
    return components;
  }
  
  console.log(`addChildToContainer (depth ${depth}):`, { 
    containerId, 
    newChildId: newChild.id,
    componentsCount: components.length 
  });
  
  let found = false;
  
  const recursiveAdd = (comps, currentDepth) => {
    if (currentDepth > MAX_DEPTH) {
      console.error('Recursion depth exceeded in recursiveAdd');
      return comps;
    }
    
    return comps.map(comp => {
      // Prevent circular references
      if (comp.id === newChild.id) {
        console.warn('⚠️ Attempted to add component as its own child, skipping');
        return comp;
      }
      
      // Direct match
      if (comp.id === containerId) {
        console.log('✅ FOUND direct match:', comp.id);
        found = true;
        
        // Ensure children array exists
        const existingChildren = Array.isArray(comp.children) ? comp.children : [];
        
        // Prevent duplicate children
        if (existingChildren.some(child => child.id === newChild.id)) {
          console.warn('⚠️ Child already exists in container, skipping');
          return comp;
        }
        
        return {
          ...comp,
          children: [...existingChildren, {
            ...newChild,
            sortOrder: existingChildren.length,
            // Add parent reference for easier traversal
            parentId: comp.id
          }]
        };
      }
      
      // Recursive check in children
      if (comp.children && Array.isArray(comp.children) && comp.children.length > 0) {
        const updatedChildren = recursiveAdd(comp.children, currentDepth + 1);
        
        // Only update if children were actually modified
        if (found) {
          console.log(`✅ Found in children of: ${comp.id} (depth ${currentDepth})`);
          return {
            ...comp,
            children: updatedChildren
          };
        }
      }
      
      return comp;
    });
  };
  
  const result = recursiveAdd(components, depth);
  
  if (!found) {
    console.error('❌ Target container not found:', containerId);
    console.error('Available containers:', components.map(c => ({
      id: c.id,
      name: c.name,
      hasChildren: !!c.children?.length,
      childrenIds: c.children?.map(ch => ch.id)
    })));
  }
  
  return result;
};


  
  // ALSO ADD this debug method to check component definitions after loading:
  const debugComponentDefinitions = useCallback(() => {
      if (componentLibraryService) {
          console.log('=== COMPONENT DEFINITIONS DEBUG ===');
          const allDefs = componentLibraryService.getAllComponentDefinitions();
          console.log('Total definitions loaded:', Object.keys(allDefs).length);
          
          Object.entries(allDefs).forEach(([type, def]) => {
              console.log(`${type}:`, {
                  name: def.name,
                  hasDefaults: !!def.default_props,
                  defaults: def.default_props,
                  variants: def.variants?.length || 0
              });
          });
          
          // Check specific components
          ['button', 'card', 'badge'].forEach(type => {
              const def = componentLibraryService.getComponentDefinition(type);
              console.log(`${type} definition:`, def);
          });
      }
  }, [componentLibraryService]);
  
  // ADD this useEffect to debug after components load:
  useEffect(() => {
      if (componentsLoaded && componentLibraryService) {
          // Add a small delay to ensure everything is loaded
          setTimeout(debugComponentDefinitions, 1000);
      }
  }, [componentsLoaded, componentLibraryService, debugComponentDefinitions]);

 

  // ENHANCED: Modified handleComponentDelete to trigger thumbnail updates
const handleComponentDelete = useCallback((componentId) => {
  const componentToDelete = canvasComponents.find(c => c.id === componentId);
  const newComponents = canvasComponents.filter(c => c.id !== componentId)
  
  setFrameCanvasComponents(prev => ({
    ...prev,
    [currentFrame]: newComponents
  }));
  
  pushHistory(currentFrame, newComponents, actionTypes.DELETE, {
    componentName: componentToDelete?.name || componentToDelete?.type || 'component',
    componentId,
    deletedComponent: componentToDelete
  });
  
  if (selectedComponent === componentId) {
    setSelectedComponent(null)
  }
  
  // ENHANCED: Schedule thumbnail update after deletion
  if (currentFrame) {
    const canvasSettings = {
      viewport: getCurrentCanvasDimensions(),
      background_color: frame?.settings?.background_color || '#ffffff',
      responsive_mode: responsiveMode,
      zoom_level: zoomLevel,
      grid_visible: gridVisible
    };
    
    // Schedule thumbnail update (with slight delay)
    setTimeout(() => {
      scheduleThumbnailUpdate(newComponents, canvasSettings);
    }, 300);
  }
  setTimeout(() => {
    if (componentLibraryService?.saveProjectComponents) {
      componentLibraryService.saveProjectComponents(projectId, currentFrame, newComponents);
    }
  }, 200);
  
  generateCode(newComponents)
}, [selectedComponent, canvasComponents, currentFrame, pushHistory, actionTypes, projectId, 
    componentLibraryService, generateCode, scheduleThumbnailUpdate, getCurrentCanvasDimensions, 
    responsiveMode, zoomLevel, gridVisible, frame?.settings]);


const handleIconSelect = useCallback((icon) => {
    console.log('Icon selected in Forge:', icon);
    
    // Create icon component based on selected icon
    const iconComponent = componentLibraryService?.createLayoutElement 
      ? componentLibraryService.createLayoutElement('icon', {
          iconType: icon.type,
          iconName: icon.name,
          size: 24,
          color: 'var(--color-text)',
          svgData: icon.data || null
        })
      : {
          id: `icon_${Date.now()}`,
          type: 'icon',
          props: {
            iconType: icon.type,
            iconName: icon.name,
            size: 24,
            color: 'var(--color-text)',
            svgData: icon.data || null
          },
          position: { x: 100, y: 100 },
          name: `${icon.name} Icon`,
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px'
          },
          animation: {},
          children: []
        };

    // Add to canvas components
    const updatedComponents = [...canvasComponents, iconComponent];
    
    setFrameCanvasComponents(prev => ({
      ...prev,
      [currentFrame]: updatedComponents
    }));
    
    // Push to undo/redo history
    pushHistory(currentFrame, updatedComponents, actionTypes.DROP, {
      componentName: iconComponent.name,
      componentType: iconComponent.type,
      position: iconComponent.position,
      componentId: iconComponent.id
    });
    
    setSelectedComponent(iconComponent.id);
    generateCode(updatedComponents);
    
    // Auto-save
    setTimeout(() => {
      if (componentLibraryService?.saveProjectComponents) {
        componentLibraryService.saveProjectComponents(projectId, currentFrame, updatedComponents);
      }
    }, 200);
    
  }, [canvasComponents, currentFrame, projectId, pushHistory, actionTypes, componentLibraryService, generateCode]);

  

  

  
  
  
  // ADD after handlePropertyUpdate definition (around line 600)
useEffect(() => {
  if (selectedComponent && canvasComponents.length > 0) {
    const comp = canvasComponents.find(c => c.id === selectedComponent);
    console.log('🎯 ForgePage - Selected component state:', {
      selectedId: selectedComponent,
      found: !!comp,
      styleKeys: Object.keys(comp?.style || {}),
      propsKeys: Object.keys(comp?.props || {}),
      style: comp?.style,
      props: comp?.props,
    });
  }
}, [selectedComponent, canvasComponents]);
  
  

  
  
  
const handleUndo = useCallback(() => {
  saveOriginRef.current = 'undo'; // 🔥 Mark as undo
  
  const previousComponents = undo(currentFrame);
  setFrameCanvasComponents(prev => ({
    ...prev,
    [currentFrame]: previousComponents
  }));
}, []);


  
  const handleRedo = useCallback(async () => {
  if (!currentFrame || !canRedo(currentFrame)) {
    console.log('ForgePage: Redo blocked - no frame or cannot redo');
    return;
  }

  console.log('ForgePage: Starting redo operation');
  
  try {
    if (componentLibraryService?.clearSaveQueue) {
      componentLibraryService.clearSaveQueue(currentFrame);
    }
    
    const nextComponents = redo(currentFrame);
    if (nextComponents) {
      console.log('ForgePage: Executing redo - restoring', nextComponents.length, 'components');
      
      setFrameCanvasComponents(prev => ({
        ...prev,
        [currentFrame]: nextComponents
      }));
      
      generateCode(nextComponents);
      
      // ENHANCED: Update thumbnail after redo
      const canvasSettings = {
        viewport: getCurrentCanvasDimensions(),
        background_color: frame?.settings?.background_color || '#ffffff',
        responsive_mode: responsiveMode,
        zoom_level: zoomLevel,
        grid_visible: gridVisible
      };
      
      setTimeout(() => {
        scheduleThumbnailUpdate(nextComponents, canvasSettings);
      }, 200);
      
      setTimeout(async () => {
        try {
          if (componentLibraryService?.forceSave) {
            await componentLibraryService.forceSave(projectId, currentFrame, nextComponents);
            console.log('ForgePage: Redo state saved to database');
          }
        } catch (error) {
          console.error('Failed to save redo state:', error);
        }
      }, 100);
      
      console.log('ForgePage: Redo completed successfully');
    }
  } catch (error) {
    console.error('ForgePage: Redo failed:', error);
  }
}, [currentFrame, redo, canRedo, generateCode, projectId, componentLibraryService, 
    scheduleThumbnailUpdate, getCurrentCanvasDimensions, responsiveMode, zoomLevel, gridVisible, frame?.settings]);
    
    
    
   // 🔥 FIXED: Debounce code generation
const generateCodeDebounced = useMemo(
  () => debounce((components) => {
    generateCode(components);
  }, 500), // Only regenerate every 500ms
  [generateCode]
);

useEffect(() => {
  if (canvasComponents.length >= 0 && componentsLoaded) {
    generateCodeDebounced(canvasComponents);
  }
}, [canvasComponents.length]); // Only trigger on count change 
    
    
    
    
    
    


  // FIXED: Auto-save with conflict prevention
  useEffect(() => {
    const saveComponents = async () => {
      // CRITICAL: Don't auto-save if undo/redo operations are happening
      if (projectId && currentFrame && canvasComponents.length > 0 && componentsLoaded && !isFrameSwitching) {
        try {
          // Check if we have pending undo/redo operations
          if (componentLibraryService?.hasPendingSave && componentLibraryService.hasPendingSave(currentFrame)) {
            console.log('ForgePage: Skipping auto-save due to pending undo/redo operation');
            return;
          }
          
          if (componentLibraryService?.saveProjectComponents) {
            console.log('ForgePage: Auto-saving', canvasComponents.length, 'components');
            await componentLibraryService.saveProjectComponents(projectId, currentFrame, canvasComponents);
          }
        } catch (error) {
          console.error('Failed to auto-save components:', error);
        }
      }
    };

    // INCREASED delay to prevent conflicts with undo/redo
    const timeoutId = setTimeout(saveComponents, 3000); // 3 seconds
    return () => clearTimeout(timeoutId);
  }, [canvasComponents, projectId, currentFrame, componentsLoaded, isFrameSwitching, componentLibraryService]);

  

  // Handle code editing
  const handleCodeEdit = useCallback((newCode, codeType) => {
    setGeneratedCode(prev => ({
      ...prev,
      [codeType]: newCode
    }))
  }, [])
  
  
  
  
  // ADD cleanup effect when unmounting or changing frames
useEffect(() => {
  return () => {
    // Cleanup function when component unmounts
    console.log('ForgePage: Cleaning up before unmount/navigation');
    
    // Don't clear critical state, but ensure saves are complete
    if (componentLibraryService?.flushPendingSaves) {
      componentLibraryService.flushPendingSaves();
    }
  };
}, []);


// ✅ KEEP ONLY THIS CLEANUP EFFECT:
useEffect(() => {
  // Handle browser beforeunload for page refresh/close
  const handleBeforeUnload = () => {
    console.log('ForgePage: Page unloading - cleaning up');
    if (currentFrame) {
      safeLeaveChannel(`presence-frame.${currentFrame}`);
      safeLeaveChannel(`frame-lock.${currentFrame}`);
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    console.log('ForgePage: Component unmounting - cleaning up');
    
    // Cleanup Echo channels
    if (currentFrame) {
      safeLeaveChannel(`presence-frame.${currentFrame}`);
      safeLeaveChannel(`frame-lock.${currentFrame}`);
    }
    
    // Remove beforeunload listener
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, [currentFrame]);




// 🔥 FIXED: Remove canvasComponents.length dependency
useEffect(() => {
  if (componentsLoaded && !isFrameSwitching && !isGeneratingCodeRef.current && canvasComponents.length > 0) {
    console.log('🔄 Auto-generating code for', canvasComponents.length, 'components');
    isGeneratingCodeRef.current = true;
    generateCode(canvasComponents).finally(() => {
      isGeneratingCodeRef.current = false;
    });
  }
}, [componentsLoaded, isFrameSwitching]); // ✅ Only these stable dependencies


// ALSO update when selected component properties change
// 🔥 FIXED: Remove selectedComponent dependency
useEffect(() => {
  if (canvasComponents.length > 0) {
    console.log('🎨 Canvas components changed, regenerating code');
    const timer = setTimeout(() => {
      generateCode(canvasComponents);
    }, 1000); // 🔥 Increased debounce time
    
    return () => clearTimeout(timer);
  }
}, [canvasComponents.length]); // ✅ Only track length changes







useEffect(() => {
  const handleRemoteDragEnd = (event) => {
    const { componentId, userId } = event.detail;
    
    console.log('🔄 Remote drag ended, fetching final position:', componentId);
    
    // Reload components from backend to get final positions
    if (currentFrame) {
      axios.get(`/api/frames/${currentFrame}/components`)
        .then(response => {
          if (response.data.success) {
            console.log('✅ Reloaded after remote drag');
            
            isRemoteUpdateRef.current = true;
            
            setFrameCanvasComponents(prev => ({
              ...prev,
              [currentFrame]: response.data.data
            }));
            
            generateCode(response.data.data);
          }
        })
        .catch(error => {
          console.error('❌ Failed to reload after drag:', error);
        });
    }
  };

  window.addEventListener('remote-drag-ended', handleRemoteDragEnd);
  
  return () => {
    window.removeEventListener('remote-drag-ended', handleRemoteDragEnd);
  };
}, [currentFrame, setFrameCanvasComponents, generateCode]);





useEffect(() => {
  const handleRemoteMove = (event) => {
    const { componentId, position, parentId, index } = event.detail;
    saveOriginRef.current = 'remote'; 
    
    setFrameCanvasComponents(prev => {
      const components = prev[currentFrame] || [];
      
      // 🔥 PRECISE UPDATE: Only modify the moved component
      const updated = components.map(comp => {
        if (comp.id === componentId) {
          return {
            ...comp,
            position,
            parentId: parentId || null,
            sortOrder: index,
          };
        }
        return comp;
      });
      
      return {
        ...prev,
        [currentFrame]: updated
      };
    });
  };
  
  window.addEventListener('remote-component-moved', handleRemoteMove);
  
  return () => {
    window.removeEventListener('remote-component-moved', handleRemoteMove);
  };
}, [currentFrame]);


  
  
const debugClickTarget = (e) => {
  console.log('🔍 Click event path:');
  let current = e.target;
  while (current && current !== document.body) {
    console.log('  →', {
      tag: current.tagName,
      id: current.id,
      componentId: current.getAttribute('data-component-id'),
      isLayout: current.getAttribute('data-is-layout'),
      classes: current.className
    });
    current = current.parentElement;
  }
};  
  
  
  
  // Add this to your ForgePage component
const debugRenderedComponents = () => {
    console.log('🔍 DEBUG: All components with data-component-id:');
    const allComponents = document.querySelectorAll('[data-component-id]');
    allComponents.forEach(comp => {
        console.log('📦', {
            id: comp.getAttribute('data-component-id'),
            type: comp.getAttribute('data-component-type'),
            isLayout: comp.getAttribute('data-is-layout'),
            tagName: comp.tagName,
            classes: comp.className,
            children: comp.children.length
        });
    });
};





// 🔥 ADD THIS: Component click handler
// REPLACE the entire handleComponentClick with:
const handleComponentClick = useCallback((componentId, e) => {
  console.log('🔥 ForgePage: Component clicked:', componentId);
  
  // Prevent event bubbling to canvas
  if (e) {
    e.stopPropagation();
  }
  
  // 🔥 FIX: Update BOTH states
  setSelectedComponent(componentId);
  setIsCanvasSelected(componentId === '__canvas_root__');
  
  // Broadcast selection to other users
  if (broadcastSelection && componentId && componentId !== '__canvas_root__') {
    broadcastSelection(componentId);
  }
  
  console.log('✅ Selected component set to:', componentId);
}, [broadcastSelection]);


  


// 🔥 ENHANCED: Smart canvas click handler
const handleCanvasClick = useCallback((e) => {
  // Comment mode: place a pin within the framed canvas only
  if (commentMode && canvasRef.current) {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
      const text = window.prompt('Add a comment');
      if (text && text.trim()) {
        const comment = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
          text: text.trim(),
          x, y,
          ts: Date.now(),
          user: { id: currentUser?.id, name: currentUser?.name, avatar: currentUser?.avatar || null },
          replies: []
        };
        const ctx = `forge:${frame?.uuid}`;
        addComment(ctx, comment);
        try {
          const ch = window.Echo?.connector?.channels?.[`presence-frame.${frame?.uuid}`] ? `frame.${frame?.uuid}` : `frame.${frame?.uuid}`;
          window.Echo?.join(ch)?.whisper('comment.created', { contextKey: ctx, comment });
        } catch {}
      }
      // Do not change selection when commenting
      return;
    }
  }
  if (!e) {
    setSelectedComponent('__canvas_root__');
    setIsCanvasSelected(true);
    return;
  }
  
  // Get all component elements under the click
  const clickPath = e.nativeEvent.composedPath();
  const componentElements = clickPath.filter(el => 
    el.nodeType === 1 && el.hasAttribute && el.hasAttribute('data-component-id')
  );
  
  if (componentElements.length === 0) {
    // Canvas click - select canvas root
    console.log('🎯 Canvas click - selecting canvas root');
    setSelectedComponent('__canvas_root__');
    setIsCanvasSelected(true);
    return;
  }
  
  // Select the deepest component
  const targetElement = componentElements[0];
  const componentId = targetElement.getAttribute('data-component-id');
  
  setSelectedComponent(componentId);
  setIsCanvasSelected(false);
}, []);




  // Move code panel to right sidebar
  const moveCodePanelToRightSidebar = useCallback(() => {
    if (!isMobile) {
      setCodePanelPosition('right')
    }
  }, [isMobile])

  // Close code panel handler
  const handleCloseCodePanel = useCallback(() => {
    console.log('ForgePage: Closing code panel via toggle');
    toggleForgePanel('code-panel');
  }, [toggleForgePanel]);

  // Copy code to clipboard
  const copyCodeToClipboard = useCallback(async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      return true;
    } catch (err) {
      console.error('Failed to copy code:', err)
      return false;
    }
  }, [])

  // Download code as file
  const downloadCode = useCallback((code, filename, type) => {
    const element = document.createElement('a')
    const file = new Blob([code], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${filename}.${type}`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }, [])

  // Get available tabs based on code style
  const getAvailableTabs = () => {
    switch (codeStyle) {
      case 'react-tailwind':
        return ['react', 'tailwind']
      case 'react-css':
        return ['react', 'css']
      case 'html-css':
        return ['html', 'css']
      case 'html-tailwind':
        return ['html', 'tailwind']
      default:
        return ['react', 'tailwind']
    }
  }

  

  // Get transition classes based on current phase
  const getTransitionClasses = () => {
    switch (frameTransitionPhase) {
      case 'fadeOut':
        return 'opacity-0 scale-95 blur-sm';
      case 'loading':
        return 'opacity-0 scale-95';
      case 'fadeIn':
        return 'opacity-100 scale-100';
      case 'idle':
      default:
        return 'opacity-100 scale-100';
    }
  };

  // WindowPanel dummy content
  const windowPanelContent = (
    <div className="p-6 space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Forge Window Panel
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Current Frame: {currentFrame}
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
          <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            Canvas Stats
          </h3>
          <div className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
            <div>Components: {canvasComponents.length}</div>
            <div>Selected: {selectedComponent ? 'Yes' : 'None'}</div>
            <div>Frame: {currentFrame}</div>
            <div>Switching: {isFrameSwitching ? 'Yes' : 'No'}</div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
          <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            Frame Info
          </h3>
          <div className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
            <div>Total Frames: {projectFrames.length}</div>
            <div>Transition: {frameTransitionPhase}</div>
            <div>Code Panel: {showCodePanel ? 'Open' : 'Closed'}</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Create mock panels for testing
  const createMockPanel = (id, title, content) => ({
    id,
    title,
    content: content || (
      <div className="p-4 space-y-2">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">Mock {title} panel content</p>
        <div className="space-y-1 text-xs text-gray-500">
          <div>This is a placeholder for the {title} panel</div>
          <div>Frame: {currentFrame}</div>
          <div>Components: {canvasComponents.length}</div>
          <div>Switching: {isFrameSwitching ? 'Yes' : 'No'}</div>
        </div>
      </div>
    )
  });

  // Memoize default panels
  const defaultPanels = useMemo(() => [
    // In your Panel component's panels array:
    createMockPanel('components-panel', 'Components', 
      ComponentsPanel ? (
        <ComponentsPanel
          activeTab={activeComponentTab}
          searchTerm={componentSearchTerm}
          onTabChange={handleComponentTabChange}
          onSearch={handleComponentSearch}
          onComponentDragStart={handleComponentDragStart}
          onComponentDragEnd={handleComponentDragEnd}
          dockPosition={panelDockPosition} // 🔥 ADD THIS - track which side panel is on
        />
      ) : null
    ),
   createMockPanel('layers-panel', 'Layers',
      LayersPanel ? (
        <LayersPanel
          canvasComponents={canvasComponents}
          selectedComponent={selectedComponent}
          onComponentSelect={handleComponentClick} // 🔥 CHANGE THIS from setSelectedComponent
          onComponentDelete={handleComponentDelete}
          searchTerm={componentSearchTerm}
        />
      ) : null
    ),
    createMockPanel('properties-panel', 'Properties',
  PropertiesPanel ? (
    <PropertiesPanel
      canvasRef={canvasRef}
      frame={frame}  
      canvasComponents={canvasComponents}
      selectedComponent={selectedComponent}
      
      onPropertyUpdate={handlePropertyUpdate}
          onComponentDelete={handleComponentDelete}
          onGenerateCode={generateCode}
          componentLibraryService={componentLibraryService}
        />
      ) : null
    ),
    createMockPanel('assets-panel', 'Assets',
      AssetsPanel ? (
        <AssetsPanel
          projectId={projectId}
          onAssetDrop={handleAssetDrop}
          onAssetSelect={(asset) => console.log('Asset selected:', asset)}
        />
      ) : null
    )
  ], [
    activeComponentTab,
    componentSearchTerm,
    handleComponentDragStart,
    handleComponentDragEnd,
    canvasComponents,
    selectedComponent,
    handlePropertyUpdate,
    handleComponentDelete,
    generateCode,
    handleAssetDrop
  ]);

  // Memoize the sidebar code panel
  const sidebarCodePanel = useMemo(() => ({
    id: 'code-panel',
    title: 'Generated Code',
    content: SidebarCodePanel ? (
      <SidebarCodePanel
        showTooltips={showTooltips && !isMobile}
        setShowTooltips={setShowTooltips}
        codeStyle={codeStyle}
        setCodeStyle={setSyncedCodeStyle}
        activeCodeTab={activeCodeTab}
        setActiveCodeTab={setActiveCodeTab}
        generatedCode={generatedCode}
        getAvailableTabs={getAvailableTabs}
        highlightCode={highlightCode}
        handleTokenHover={handleTokenHover}
        handleTokenLeave={handleTokenLeave}
        handleCodeEdit={handleCodeEdit}
        copyCodeToClipboard={copyCodeToClipboard}
        downloadCode={downloadCode}
        setCodePanelPosition={setCodePanelPosition}
        canvasComponents={canvasComponents}
        generateCode={generateCode}
        isMobile={isMobile}
      />
    ) : (
      <div className="p-4">
        <h3 className="font-semibold mb-2">Generated Code</h3>
        <div className="text-xs text-gray-600">
          Code panel component not available
        </div>
      </div>
    )
  }), [
    showTooltips,
    codeStyle,
    activeCodeTab,
    generatedCode,
    handleCodeEdit,
    copyCodeToClipboard,
    downloadCode,
    canvasComponents,
    generateCode,
    isMobile
  ])

  // Filter visible panels based on ForgeStore state
  const visiblePanels = useMemo(() => {
    console.log('ForgePage: Computing visible panels...');
    
    if (allPanelsHidden) {
      return []
    }
    
    const panels = []
    
    defaultPanels.forEach(panel => {
      const isOpen = isForgePanelOpen(panel.id);
      
      if (panel.id === 'properties-panel' || panel.id === 'assets-panel') {
        panels.push(panel);
      } else if (isOpen) {
        panels.push(panel);
      }
    });
    
    if (codePanelPosition === 'right' && !isMobile && isForgePanelOpen('code-panel')) {
      panels.push(sidebarCodePanel)
    }
    
    return panels
  }, [
    defaultPanels, 
    sidebarCodePanel, 
    codePanelPosition, 
    isMobile, 
    isForgePanelOpen, 
    allPanelsHidden,
    forgePanelStates,
    _triggerUpdate
  ])

  // Check if any panels are visible
  const hasVisiblePanels = useMemo(() => {
    const result = !allPanelsHidden && visiblePanels.length > 0;
    return result;
  }, [allPanelsHidden, visiblePanels])

  // Tab configuration for components panel
  const componentTabConfig = useMemo(() => ({
    defaultTab: 'elements',
    tabs: [
      {
        id: 'elements',
        label: 'Elements',
        icon: Square
      },
      {
        id: 'components',
        label: 'Components',
        icon: Code
      }
    ]
  }), [])

  // Show loading state while components are loading
if (!componentsLoaded && loadingMessage) {
  return (
    <ErrorBoundary>
    <AuthenticatedLayout
      headerProps={{
        onPanelToggle: handlePanelToggle,
        panelStates: {},
        onModeSwitch: () => {},
        project: project,
        frame: frame,
        canvasComponents: canvasComponents,
        onUndo: handleUndo,
        onRedo: handleRedo,
        projectId: projectId,
        currentFrame: currentFrame
      }}
    >
      <Head title="Forge - Visual Builder" />
      
      <div className="h-[calc(100vh-60px)] flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="text-center space-y-6">
          {/* Black Hole Logo with sequential fill */}
          <div className="relative mx-auto" style={{ width: 80, height: 80 }}>
            <svg width="80" height="80" viewBox="0 0 675 675" className="overflow-visible">
              {/* Path 1 - fills first */}
              <motion.path
                d="m308 136-7 1c-5 0-7 0-8 2l-5 1-7 2-6 3c-3 0-7 1-9 3l-8 3a276 276 0 0 0-45 22c-3 4-4 9-1 11 2 2 5 2 6 0l3-1 4-3 5-3 3-2 3-1 3-2 3-1 4-3 5-3 3-2 4-1c3 0 4-1 5-2l4-1c3 0 4-1 5-2l4-1c3 0 4-1 5-2l4-1c3 0 4-1 5-2l9-1c6 0 8 0 9-2l29-1 28 1c1 2 3 2 9 2l9 1c1 1 2 2 5 2l4 1c1 1 2 2 5 2l4 1c1 1 2 2 5 2l4 1c1 1 2 2 5 2l4 1 3 2 3 1 3 2 5 3c1 2 3 3 5 3l2 1 3 2 3 1c1 1 2 2 5 2 2 0 3 0 3-2l2-3c1-1 1-2-4-6-2-3-5-5-7-5l-2-2-3-1c-2 0-3-1-3-2l-3-1c-2 0-3-1-3-2l-3-1c-2 0-3-1-3-2l-3-1c-2 0-3-1-3-2l-3-1c-2 0-3-1-3-2l-6-1c-4 0-6 0-6-2l-5-1-4-2-5-1-4-2-11-1c-8 0-10 0-10-2l-27-1-27 1z"
                fill="var(--color-primary)"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
              
              {/* Path 2 - fills second */}
              <motion.path
                d="m320 157-10 1c-8 0-10 0-11 2l-6 1c-3 0-5 0-6 2l-6 1c-3 0-5 0-6 2l-3 1-3 2-4 1c-3 0-4 1-5 2l-3 1-3 2-3 1-3 2-3 1-3 2-2 1c-2 0-4 1-5 3l-5 3c-1 0-4 2-6 5l-5 4a254 254 0 0 0-42 45l-1 2-2 3-3 5-3 4-1 3-2 3-1 3c-1 1-2 2-2 5l-1 4-2 3-1 3c-1 1-2 2-2 5l-1 4c-2 1-2 2-2 6l-1 6c-2 1-2 2-2 6l-1 6c-2 1-2 4-2 18l-1 18c-2 1-2 3-2 14l-1 13c-2 1-2 2-2 6l-1 6-2 3-1 3c-1 1-2 2-2 5l-1 4-2 3-3 5c-3 2-4 4-2 6 1 1 2 1 7-2l6-3a134 134 0 0 0 14-9 199 199 0 0 0 17-9l10-6a384 384 0 0 1 30-18l8-4a609 609 0 0 0 83-59 990 990 0 0 0-57 28l-5 2-4 1-3 1-2 2c-2 0-4 1-5 3l-4 3c-3-1-3-16 0-16l1-8c0-5 0-7 2-7l1-5 2-4 1-5 2-4 1-3c0-2 1-3 2-3l1-3c0-1 2-4 5-6l4-6a136 136 0 0 1 34-31l3-2 3-1 3-2 3-1 3-2 4-1c3 0 4-1 5-2l6-1c4 0 5 0 6-2l23-1 22 1c1 2 3 2 6 2l6 1c1 1 2 2 5 2l4 1 3 2 3 1 4 2 2 1c0 1 7 0 9-2l2-1 11-7-6-4c-6-3-13-9-13-12 0-4 7-8 9-5l2 1 5 3 4 3 3 1 3 2 3 1c2 2 4 2 6 1 4-4 30-17 33-17 6 0 8-3 4-5l-3-2-3-1-5-3-4-3-5-3-4-3-5-3c-1-2-3-3-5-3l-2-2-3-1c-2 0-3-1-3-2l-3-1c-2 0-3-1-3-2l-3-1c-2 0-3-1-3-2l-5-1-4-2-5-1-4-2-5-1-4-2-6-1c-4 0-6 0-6-2l-11-1c-8 0-10 0-10-2l-17-1-16 1zm32 41 9 1c6 0 8 0 9 2l6 1 6 2 3 1 4 3c4 3 4 7 0 9l-3 2h-3l-5-2-6-1c-1-1-3-2-7-2l-8-1c-1-2-5-2-20-2-16 0-20 0-21 2l-7 1c-5 0-7 1-8 2l-6 1-6 2-3 1-3 2-3 1-3 2-3 1-3 2-3 1-3 2-3 1c-1 0-4 2-6 5l-6 4c-2 0-17 15-17 17l-4 6-5 6-3 4-7 12c-5 12-9 14-14 10-2-2-3-5-1-6l1-4c0-3 1-4 3-6l3-5 2-3 1-3 3-4 3-5a310 310 0 0 1 46-43l3-1 3-2 3-1 3-2 3-1 5-2 4-1 3-2 3-1 6-2 6-1c1-2 3-2 9-2l9-1c3-3 29-3 31 0z"
                fill="var(--color-primary)"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              />
              
              {/* Path 3 - fills third */}
              <motion.path
                d="m662 172-3 1-3 2-4 1c-3 0-4 1-5 2l-4 1c-3 0-4 1-5 2l-4 1c-3 0-4 1-5 2l-4 1c-3 0-4 1-5 2l-3 1-3 2-4 1c-3 0-4 1-5 2l-4 1c-3 0-4 1-5 2l-4 1c-3 0-4 1-5 2l-4 1c-3 0-4 1-5 2l-3 1-3 2-4 1c-3 0-4 1-5 2l-4 1c-3 0-4 1-5 2l-6 1c-4 0-5 0-6 2l-24 1h-24l-8 4a519 519 0 0 1-56 31c-21 10-24 12-44 25a904 904 0 0 1-142 78l-50 21c-32 12-57 23-57 25l-2 4-3 3-3 5-3 4-4 6c-3 2-5 5-5 6 0 2-11 13-13 13l-6 4c-2 3-5 5-6 5l-6 4c-2 3-5 5-6 5l-4 3-5 3-4 3-5 3-4 3-5 3-4 3-5 3-4 3-5 3-4 3-5 3-6 4c-2 3-5 5-6 5l-4 3-5 3c-3 0-5 4-5 8v5h5c4 0 5 0 6-2l3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 2-1c2 0 4-1 5-3l3-2 4-2 4-2 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 2-1 3-2 4-2 10-5 12-7 10-5 3-2 3-1 3-2 3-1 3-2 3-1 7-4 7-4 5-2 12-4 25-12c14-5 16-7 18-10 1-2 3-3 5-3l3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 4-3 5-3 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 4-3 5-3 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 4-1c2 0 3 1 3 3 1 8 8 5 37-15 16-11 16-11 16-14s0-4 2-4l4-2 3-1 4-3 6-3 6-3 5-3 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 4-3 5-3 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 2-1c2 0 2-1 2-4 0-2 0-3-2-3l-2-2-4-1-5 1zm-174 72c2 1 3 4 3 5 0 2-5 7-7 7l-3 2-3 1-2 1c-2 3-9-1-9-5 0-3 8-11 10-11l3-1c2-3 5-2 8 1zm-30 15c2 1 3 4 3 5 0 2-5 7-7 7l-2 1c-2 3-9-1-9-5 0-3 8-11 11-11l4 3zm-21 11 2 3c0 3-7 9-12 11l-7 5-4 3-5 2-7 3-2 2-3 1-3 1-3 2-3 1-3 2a376 376 0 0 1-38 19l-3 1-3 2-3 1-3 2-3 1-3 2-3 1-3 2-3 1-3 2-4 3-5 3-3 1c-1 2-11 3-13 1v-9l9-5 10-5 2-1 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 5-3 4-3 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1c2-3 5-2 8 0zm-150 76c4 2 4 6-1 11l-6 4-3 2-3 1-3 2-3 1-3 2-3 1-3 2-3 1-3 2-3 1-3 2-3 1-3 2-3 1-3 2-2 1-7 3c-7 4-10 4-13 1-5-4-4-7 6-11l7-4 2-1 5-3 4-3 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 3-1 3-2 2-1c1-2 2-2 3-1l3 2zm-84 45c5 5 4 6-4 10l-7 4-6 5c-6 2-7 2-11-2-2-3-2-3-1-6 1-2 5-4 11-7l10-6c2-2 5-1 8 2zm432-183-3 1-3 2-2 1c-4 0-9 6-9 10s6 8 8 4l3-1 3-1c0-1 1-2 3-2l3-1c0-1 1-2 3-2 4 0 7-8 3-11-2-2-8-3-9-1zm-45 24-3 1c-2 0-5 3-5 7 0 5 8 7 12 3l5-3c2 0 2-1 2-5v-5h-5c-4 0-5 0-6 2zm-24 12-2 1-4 2-3 2c-2 0-4 3-2 4 0 1 11 0 17-2 3 0 4-4 3-7-1-2-8-3-9 0z"
                fill="var(--color-primary)"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              />
              
              {/* Path 4 - fills last */}
              <motion.path
                d="m629 409-5 1c-5 0-6 0-8 3l-5 3c-2 0-11 9-11 12l-1 2c-2 1-2 2-2 6l-1 6-2 4c0 3 1 4 2 5l1 4c0 3 1 4 2 5l1 3 2 3 1 2c0 3 6 9 9 9l2 2 3 1c2 0 3 1 3 2l14 1 13-1 2-2c3 0 18-15 18-18l2-2 1-13-1-14-2-2c0-2-1-4-3-5l-3-5c0-2-3-5-6-5l-2-1-3-2-3-1c-1-2-2-2-6-2l-6-1-3-2-3 2z"
                fill="var(--color-primary)"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              />
            </svg>
          </div>
          
          <div className="text-lg font-medium" style={{ color: 'var(--color-text)' }}>
            {loadingMessage}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
    </ErrorBoundary>
  );
}

  return (
    <ErrorBoundary>
    <AuthenticatedLayout
      headerProps={{
        onPanelToggle: handlePanelToggle,
        panelStates: {},
        onModeSwitch: () => {}
      }}
    >
      <Head title={`Forge - ${frame?.name || 'Visual Builder'}`} />
      
      {/* Enhanced Tooltip with mobile detection */}
      {CodeTooltip && <CodeTooltip hoveredToken={hoveredToken} showTooltips={showTooltips && !isMobile} />}
      
      {/* Frame Transition Overlay */}
      {isFrameSwitching && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        >
          <div 
            className="bg-white rounded-2xl p-8 shadow-2xl border max-w-md w-full mx-4"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="text-center space-y-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 mx-auto animate-spin" style={{ color: 'var(--color-primary)' }} />
                <div className="absolute inset-0 rounded-full border-2 border-dashed animate-pulse" style={{ borderColor: 'var(--color-primary-soft)' }}></div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                  Switching Frames
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Loading {switchingToFrame}...
                </p>
              </div>
              
              <div className="bg-gray-100 rounded-full h-1 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                <div 
                  className="h-full rounded-full transition-all duration-300 animate-pulse"
                  style={{ 
                    backgroundColor: 'var(--color-primary)',
                    width: frameTransitionPhase === 'fadeOut' ? '25%' : 
                           frameTransitionPhase === 'loading' ? '75%' : 
                           frameTransitionPhase === 'fadeIn' ? '100%' : '0%'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content area with transition effects */}
      <div className="h-[calc(100vh-60px)] flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
     <div 
        className={`
          flex-1 flex items-start justify-center transition-all duration-300 ease-in-out
          relative overflow-auto
        `}
        style={{
          padding: isMobile ? '20px' : '40px 20px',
        }}
          data-canvas-area // 🔥 ADD: For zoom wheel targeting

              >
        {/* Swipe-to-pan outside canvas */}
        <ScriptlessSwipeHandler canvasRef={canvasRef} />
            {/* Canvas Component with Enhanced Responsive Sizing */}
            {CanvasComponent ? (
                <div className="relative w-full flex justify-center">
                    {/* Empty Canvas State for Pages */}
                    {frame?.type === 'page' && canvasComponents.length === 0 && (
                        <EmptyCanvasState
                            frameType={frame.type}
                            onAddSection={() => {
                                // Auto-add a section
                                const sectionComponent = componentLibraryService?.createLayoutElement('section');
                                if (sectionComponent) {
                                    const updatedComponents = [sectionComponent];
                                    setFrameCanvasComponents(prev => ({
                                        ...prev,
                                        [currentFrame]: updatedComponents
                                    }));
                                    setSelectedComponent(sectionComponent.id);
                                }
                            }}
                            onDragOver={handleCanvasDragOver}
                            onDrop={handleCanvasDrop}
                            isDragOver={dragState.isDragging}
                        />
                    )}
                    
                    {/* Regular Canvas - only show if we have components or frame is component type */}
                    {(canvasComponents.length > 0 || frame?.type === 'component') && (
                 <CanvasComponent
  canvasRef={canvasRef}
  canvasComponents={canvasComponents}
  selectedComponent={selectedComponent}
  setSelectedComponent={setSelectedComponent}  // 🔥 ADD THIS LINE
  setIsCanvasSelected={setIsCanvasSelected}    // 🔥 ADD THIS LINE
  dragState={dragState}
  isCanvasSelected={isCanvasSelected}
  componentLibraryService={componentLibraryService}
  onCanvasDragOver={handleCanvasDragOver}
  onCanvasDrop={handleCanvasDrop}
  onCanvasClick={handleCanvasClick}
  onComponentClick={handleComponentClick}
  onPropertyUpdate={handlePropertyUpdate}
  isMobile={isMobile}
  currentFrame={currentFrame}
  isFrameSwitching={isFrameSwitching}
  frameType={frame?.type || 'page'}
  responsiveMode={responsiveMode}
  zoomLevel={zoomLevel}
  gridVisible={gridVisible}
  projectId={projectId}
  setFrameCanvasComponents={setFrameCanvasComponents}
  frame={frame}
  broadcastDragMove={broadcastDragMove}
  broadcastComponentUpdate={broadcastComponentUpdate} // 🔥 ADD THIS
  updateCursor={updateCursor}
  componentsLoaded={componentsLoaded}
/>
                    )}
                    
                    
                    
       
                    
                    
                </div>
            ) : (
                <div 
                    ref={canvasRef}
                    className="w-full h-full bg-white border-2 border-dashed border-gray-300 rounded-lg 
                               flex items-center justify-center transition-all duration-300"
                    onDragOver={handleCanvasDragOver}
                    onDrop={handleCanvasDrop}
                    onClick={handleCanvasClick}
                >
                    <div className="text-center text-gray-500">
                        <div className="text-lg font-semibold mb-2">Frame: {currentFrame}</div>
                        <div className="text-sm">Drop components here</div>
                    </div>
                </div>
            )}
            
            {/* 🔥 Real-Time Collaboration Overlay - Shows cursors, drag ghosts, and selections */}
            <CollaborationOverlay
              cursors={Array.from(activeCursors.values())}
              draggedElements={Array.from(draggedElements.values())}
              selectedElements={Array.from(selectedElements.values())}
              canvasRef={canvasRef}
              responsiveMode={responsiveMode}
              zoomLevel={zoomLevel}
            />
        </div>
        
        {overlayRect && currentComments && currentComments.map((c) => (
          <div
            key={c.id}
            style={{ position: 'fixed', left: overlayRect.left + c.x, top: overlayRect.top + c.y, transform: 'translate(-50%, -100%)', zIndex: 60 }}
            className="pointer-events-auto cursor-pointer"
            title={new Date(c.ts).toLocaleString()}
            onClick={() => openCommentModal(c)}
          >
            <div className="w-4 h-4 rounded-full bg-[var(--color-primary)] shadow flex items-center justify-center text-[8px] text-white">
              {c.user?.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
          </div>
        ))}

        {commentModalOpen && activeComment && (
          <div
            className="fixed z-70 w-80 max-w-[85vw] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-2xl"
            style={{ left: Math.min(modalPos.left, window.innerWidth - 340), top: Math.min(modalPos.top, window.innerHeight - 300) }}
          >
            <div className="flex items-center justify-between p-2 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-[10px]">
                  {activeComment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="text-xs font-medium text-[var(--color-text)]">{activeComment.user?.name || 'User'}</div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">{new Date(activeComment.ts).toLocaleString()}</div>
                </div>
              </div>
              <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] px-2" onClick={() => setCommentModalOpen(false)}>×</button>
            </div>
            <div className="p-2 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              <div className="text-sm text-[var(--color-text)] break-words">{renderContentWithLinks(activeComment.text)}</div>
              {activeComment.replies && activeComment.replies.map(r => (
                <div key={r.id} className="flex gap-2 items-start">
                  <div className="w-5 h-5 rounded-full bg-[var(--color-bg-muted)] text-[10px] flex items-center justify-center text-[var(--color-text)]">
                    {r.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] text-[var(--color-text)]">{renderContentWithLinks(r.text)}</div>
                    <div className="text-[9px] text-[var(--color-text-muted)]">{new Date(r.ts).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-[var(--color-border)]">
              <div className="relative">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                  placeholder="Reply... use #project:<uuid> or #frame:<uuid>"
                  className="w-full px-2 py-1 pr-8 border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                />
                <button className="absolute right-1 bottom-1 px-2 py-0.5 bg-[var(--color-primary)] text-white rounded text-[11px]" onClick={handleSendReply} disabled={!replyText.trim()}>Send</button>
              </div>
            </div>
          </div>
        )}

        {/* Fixed Code Generation Panel - Bottom (Mobile Optimized) */}
        {BottomCodePanel && (
          <BottomCodePanel
            showCodePanel={showCodePanel && (codePanelPosition === 'bottom' || isMobile)}
            codePanelMinimized={codePanelMinimized}
            codePanelHeight={codePanelHeight}
            codePanelRef={codePanelRef}
            setCodePanelMinimized={setCodePanelMinimized}
            setCodePanelHeight={setCodePanelHeight}
            moveCodePanelToRightSidebar={moveCodePanelToRightSidebar}
            setShowCodePanel={handleCloseCodePanel}
            showTooltips={showTooltips && !isMobile}
            setShowTooltips={setShowTooltips}
            codeStyle={codeStyle}
            setCodeStyle={setSyncedCodeStyle}
            activeCodeTab={activeCodeTab}
            setActiveCodeTab={setActiveCodeTab}
            generatedCode={generatedCode}
            getAvailableTabs={getAvailableTabs}
            highlightCode={highlightCode}
            handleTokenHover={handleTokenHover}
            handleTokenLeave={handleTokenLeave}
            handleCodeEdit={handleCodeEdit}
            copyCodeToClipboard={copyCodeToClipboard}
            downloadCode={downloadCode}
            generateCode={generateCode}
            canvasComponents={canvasComponents}
            setCodePanelPosition={setCodePanelPosition}
            isMobile={isMobile}
            windowDimensions={windowDimensions}
            currentFrame={currentFrame}
            isFrameSwitching={isFrameSwitching}
          />
        )}
      </div>

      {/* Enhanced Panel System with transition support */}
      {Panel && hasVisiblePanels && (
        <Panel
          key={`panel-system-${_triggerUpdate}`}
          isOpen={true}
          initialPanels={visiblePanels}
          allowedDockPositions={isMobile ? ['left'] : ['left', 'right']}
          maxPanelsPerDock={3}
          onPanelClose={handlePanelClose}
          onPanelStateChange={handlePanelStateChange}
          snapToEdge={false}
          mergePanels={true}
          mergePosition="right" // Default merge position for properties + assets
          defaultDockPosition={{
            'properties-panel': 'right',
            'assets-panel': 'right',
            'components-panel': 'left',
            'layers-panel': 'left',
            'code-panel': 'right'
          }}
          showTabs={true}
          showSearch={!isMobile}
          tabConfig={componentTabConfig}
          onTabChange={handleComponentTabChange}
          onSearch={handleComponentSearch}
          searchPlaceholder={`Search ${activeComponentTab}...`}
          isMobile={isMobile}
          defaultWidth={isMobile ? 280 : 320}
          minWidth={isMobile ? 250 : 280}
          maxWidth={isMobile ? 300 : 400}
          isFrameSwitching={isFrameSwitching}
        />
      )}
      
      {/* Enhanced FloatingFrameSwitcher with project frames data */}
      {FloatingFrameSwitcher && (
        <FloatingFrameSwitcher
          currentFrame={currentFrame}
          onFrameSwitch={handleFrameSwitch}
          isMobile={isMobile}
          projectFrames={processedProjectFrames}
          projectId={projectId}
          isFrameSwitching={isFrameSwitching}
          frameTransitionPhase={frameTransitionPhase}
        />
      )}

      {/* WindowPanel Integration */}
      <WindowPanel
        isOpen={windowPanelState.isOpen}
        title={windowPanelState.title}
        content={windowPanelContent}
        onClose={handleCloseWindowPanel}
        onModeChange={() => {}}
        initialMode={windowPanelState.mode}
        initialPosition={windowPanelState.position}
        initialSize={windowPanelState.size}
        minSize={{ width: 400, height: 300 }}
        maxSize={{ width: 1000, height: 700 }}
        isDraggable={true}
        isResizable={true}
        className="forge-window-panel"
        zIndexBase={2000}
        panelCollisionOffset={isMobile ? 280 : 320}
        isMobile={isMobile}
      />

      {/* Mobile-specific: Bottom navigation with enhanced frame switching */}
      {isMobile && (
        <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-40">
          <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md rounded-full px-4 py-2">
            <button
              onClick={() => toggleForgePanel('code-panel')}
              className={`p-2 rounded-full transition-colors ${
                showCodePanel 
                  ? 'bg-white/30 text-white' 
                  : 'text-white/70 hover:bg-white/20'
              }`}
              title="Toggle Code Panel"
              disabled={isFrameSwitching}
            >
              <Code className="w-4 h-4" />
            </button>
            
            {showCodePanel && (
              <>
                <button
                  onClick={() => setCodePanelMinimized(!codePanelMinimized)}
                  className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
                  title={codePanelMinimized ? 'Expand Code Panel' : 'Minimize Code Panel'}
                  disabled={isFrameSwitching}
                >
                  {codePanelMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyCodeToClipboard(generatedCode[activeCodeTab])}
                  className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
                  title="Copy Code"
                  disabled={isFrameSwitching}
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => generateCode(canvasComponents)}
                  className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
                  title="Regenerate Code"
                  disabled={isFrameSwitching}
                >
                  <RefreshCw className={`w-4 h-4 ${isFrameSwitching ? 'animate-spin' : ''}`} />
                </button>
              </>
            )}
            
            <button
              onClick={handleOpenWindowPanel}
              className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
              title="Open Window Panel"
              disabled={isFrameSwitching}
            >
              <PictureInPicture className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop quick actions - MODIFIED */}
      {!isMobile && (
        <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-2">
          {/* ADD Code Panel Mode Switcher */}
          <div className="flex flex-col gap-1 p-2 rounded-lg shadow-lg" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <button
              onClick={() => {
                setCodePanelPosition('bottom');
                toggleForgePanel('code-panel');
              }}
              className={`p-2 rounded transition-all ${codePanelPosition === 'bottom' ? 'bg-blue-100' : ''}`}
              title="Bottom Code Panel"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCodePanelPosition('right');
                toggleForgePanel('code-panel');
              }}
              className={`p-2 rounded transition-all ${codePanelPosition === 'right' ? 'bg-blue-100' : ''}`}
              title="Side Code Panel"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCodePanelPosition('modal');
                toggleForgePanel('code-modal-panel');
              }}
              className={`p-2 rounded transition-all ${codePanelPosition === 'modal' ? 'bg-blue-100' : ''}`}
              title="Modal Code Panel"
            >
              <PictureInPicture className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={handleOpenWindowPanel}
            className={`absolute bottom-5 right-5 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
              isFrameSwitching ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ 
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              boxShadow: 'var(--shadow-lg)'
            }}
            title="Open Window Panel"
            disabled={isFrameSwitching}
          >
              <Monitor className="w-5 h-5" />
        </button>
      </div>
    )}
      
      <IconWindowPanel onIconSelect={handleIconSelect} />
      
      {/* Preview Panel Modal */}
      {isForgePanelOpen('preview-panel') && (
        <PreviewPanelModal
          canvasComponents={canvasComponents}
          frame={frame}
          componentLibraryService={componentLibraryService}
          onClose={() => toggleForgePanel('preview-panel')}
        />
      )}
      
      
      {/* Modal Code Panel */}
      {isForgePanelOpen('code-modal-panel') && (
        <ModalCodePanel
          showCodePanel={true}
          setShowCodePanel={() => toggleForgePanel('code-modal-panel')}
          showTooltips={showTooltips}
          setShowTooltips={setShowTooltips}
          codeStyle={codeStyle}
          setCodeStyle={handleCodeStyleChange}
          activeCodeTab={activeCodeTab}
          setActiveCodeTab={setActiveCodeTab}
          generatedCode={generatedCode}
          getAvailableTabs={getAvailableTabs}
          copyCodeToClipboard={copyCodeToClipboard}
          downloadCode={downloadCode}
          generateCode={generateCode}
          canvasComponents={canvasComponents}
          handleCodeEdit={handleCodeEdit}
          isMobile={isMobile}
        />
      )}

      {/* Enhanced mobile performance optimization styles */}
      {isMobile && (
        <style>{`
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          @media (max-width: 768px) {
            .motion-reduce {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
            
            .overflow-scroll {
              -webkit-overflow-scrolling: touch;
              scroll-behavior: smooth;
            }
            
            .shadow-lg, .shadow-xl, .shadow-2xl {
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24) !important;
            }
          }

          /* Frame transition animations */
          .frame-transition-enter {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          
          .frame-transition-enter-active {
            opacity: 1;
            transform: scale(1) translateY(0);
            transition: all 300ms ease-out;
          }
          
          .frame-transition-exit {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          
          .frame-transition-exit-active {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
            transition: all 200ms ease-in;
          }

          /* Smooth blur animation for frame switching */
          .frame-blur-enter {
            filter: blur(0px);
          }
          
          .frame-blur-active {
            filter: blur(2px);
            transition: filter 200ms ease-in-out;
          }
          
          .frame-blur-exit {
            filter: blur(0px);
            transition: filter 200ms ease-in-out;
          }
        `}</style>
      )}
    </AuthenticatedLayout>
    </ErrorBoundary>
  );
}

