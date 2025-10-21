// @/Components/Forge/LayersPanel.jsx - FIXED IMPORTS
import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, EyeOff, Lock, Unlock, ChevronRight,
  Layers, Trash2, Copy, MoreVertical, Move, Square, Type // ✅ ADD Type import
} from 'lucide-react'

// Import component library service
import { componentLibraryService } from '@/Services/ComponentLibraryService'

const LayerItem = ({ component, depth = 0, isSelected, onSelect, onDelete, path = [], canvasComponents }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);
  const [showActions, setShowActions] = React.useState(false);

  const hasChildren = component.children && component.children.length > 0;
  const isLayout = component.isLayoutContainer;
  
    // 🔥 GET COMPONENT DEFINITION FOR THUMBNAIL
  const componentDef = componentLibraryService?.getComponentDefinition(component.type);


  // ✅ NEW: Detect text nodes
  const isTextNode = component.type === 'text-node' || component.isPseudoElement;
  
  // ✅ NEW: Show text preview for text nodes
  const displayName = isTextNode 
    ? (component.props?.content || component.text_content || 'Empty text').slice(0, 30) + '...'
    : component.name;
  
  // ✅ NEW: Different icon for text nodes
  const IconComponent = isTextNode ? Type : Square;

  

  // 🔥 RENDER ACTUAL UI THUMBNAIL LIKE COMPONENT PANEL
  const renderThumbnail = () => {
    if (!componentDef) {
      // Fallback to simple icon
      return (
        <div style={{
          width: "24px",
          height: "24px",
          borderRadius: "var(--radius-sm)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1.5px solid var(--color-border)`,
          background: "var(--color-surface)",
          boxShadow: "var(--shadow-sm)",
        }}>
          <Square size={14} color="var(--color-text-muted)" />
        </div>
      );
    }
    
    // 🔥 CRITICAL: Check for variants and use preview_code EXACTLY like component panel
    if (component.variant && componentDef.variants) {
      const variantData = componentDef.variants.find(v => v.name === component.variant.name);
      if (variantData?.preview_code) {
        return (
          <div 
            style={{
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: 'scale(0.6)',
              transformOrigin: 'center',
            }}
            dangerouslySetInnerHTML={{ 
              __html: variantData.preview_code.replace(/className=/g, 'class=') 
            }}
          />
        );
      }
    }
    
    // 🔥 For layout containers, show simplified layout preview
    if (component.isLayoutContainer) {
      return (
        <div style={{
          width: "24px",
          height: "24px",
          borderRadius: "var(--radius-sm)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1.5px solid var(--color-primary)`,
          background: "var(--color-primary-soft)",
          boxShadow: "var(--shadow-sm)",
        }}>
          <Layers size={14} color="var(--color-primary)" />
        </div>
      );
    }
    
    // 🔥 Fallback: Try to render the actual component but scaled down
    try {
      const renderer = componentLibraryService?.getComponent(component.type);
      if (renderer?.render) {
        return (
          <div style={{
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: 'scale(0.5)',
            transformOrigin: 'center',
            overflow: 'hidden',
          }}>
            {renderer.render({
              ...component.props,
              style: {
                ...component.props?.style,
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '100%',
              }
            }, `thumb-${component.id}`)}
          </div>
        );
      }
    } catch (error) {
      console.warn('Failed to render thumbnail for:', component.type, error);
    }
    
    // Ultimate fallback - use colored dot with first letter
    const firstLetter = component.name?.charAt(0)?.toUpperCase() || 'C';
    return (
      <div style={{
        width: "24px",
        height: "24px",
        borderRadius: "var(--radius-sm)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1.5px solid var(--color-border)`,
        background: "var(--color-surface)",
        boxShadow: "var(--shadow-sm)",
        fontSize: '10px',
        fontWeight: 'bold',
        color: 'var(--color-text)',
      }}>
        {firstLetter}
      </div>
    );
  };

  const getDepthColor = () => {
    const colors = [
      "var(--color-primary)",
      "#60A5FA",
      "#34D399",
      "#FBBF24",
      "#F87171",
    ];
    return colors[depth % colors.length];
  };

  const depthColor = getDepthColor();

  return (
   <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="layer-item"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowActions(false);
      }}
      style={{
        position: "relative",
      }}
    >
     
      {/* Depth connector */}
      {depth > 0 && (
        <div
          style={{
            position: "absolute",
            left: `${(depth - 1) * 20 + 4}px`,
            top: 0,
            bottom: 0,
            width: "1px",
            backgroundColor: `${depthColor}20`,
          }}
        />
      )}

      {/* Item */}
      <div
        onClick={() => onSelect(component.id)}
        style={{
          marginLeft: `${depth * 20}px`,
          borderLeft: isSelected ? `3px solid ${depthColor}` : "3px solid transparent",
          borderRadius: "var(--radius-md)",
          background: isSelected
            ? "linear-gradient(to right, var(--color-primary-soft), transparent)"
            : isHovered
              ? "var(--color-bg-muted)"
              : "transparent",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 0.75rem",
          cursor: "pointer",
          transition: "var(--transition)",
        }}
      >
        {/* Expand button */}
        {hasChildren ? (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight
                size={12}
                color="var(--color-text-muted)"
              />
            </motion.div>
          </motion.button>
        ) : (
          <div style={{ width: "16px" }} />
        )}

       {/* ✅ MODIFIED: Show text icon for text nodes */}
        {isTextNode ? (
          <div style={{
            padding: '4px',
            borderRadius: '4px',
            backgroundColor: 'var(--color-primary-soft)'
          }}>
            <Type size={14} color="var(--color-primary)" />
          </div>
        ) : (
          renderThumbnail()
        )}

       {/* Name + Meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{
            color: isSelected ? "var(--color-primary)" : "var(--color-text)",
            fontSize: "var(--fs-sm)",
            fontWeight: isTextNode ? 400 : 500,
            fontStyle: isTextNode ? 'italic' : 'normal',
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {displayName}
          </span>
          
          {/* 🔥 NEW: Badge for auto-wrapped text */}
          {component.isAutoWrapped && (
            <span style={{
              background: 'var(--color-info-soft)',
              color: 'var(--color-info)',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: 500
            }}>
              auto
            </span>
          )}
        </div>
      
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
          <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
            {component.type}
            {/* 🔥 SHOW PARENT INFO for auto-wrapped text nodes */}
            {component.isAutoWrapped && component.parentId && canvasComponents && (
              <> • child of {canvasComponents.find(c => c.id === component.parentId)?.name}</>
            )}
          </span>
          {hasChildren && (
            <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
              • {component.children.length} child{component.children.length !== 1 ? "ren" : ""}
            </span>
          )}
          <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>• depth {depth}</span>
        </div>
      </div>

        {/* Hover Actions */}
        <AnimatePresence>
          {(isHovered || showActions) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <button className="icon-btn" title="Toggle visibility">
                <Eye size={14} color="var(--color-text-muted)" />
              </button>
              <button className="icon-btn" title="Lock layer">
                <Unlock size={14} color="var(--color-text-muted)" />
              </button>
              <button
                className="icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
              >
                <MoreVertical size={14} color="var(--color-text-muted)" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions dropdown */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: "absolute",
              right: 0,
              marginTop: "4px",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-lg)",
              overflow: "hidden",
              zIndex: 50,
              minWidth: "160px",
            }}
          >
            {[
              { icon: <Copy size={14} />, label: "Duplicate" },
              { icon: <Move size={14} />, label: "Move to..." },
            ].map((item, idx) => (
              <button
                key={idx}
                style={{
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 10px",
                  fontSize: "var(--fs-sm)",
                  background: "transparent",
                  color: "var(--color-text)",
                  border: "none",
                  cursor: "pointer",
                  transition: "var(--transition)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--color-bg-muted)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {item.icon}
                {item.label}
              </button>
            ))}

            <div
              style={{
                borderTop: "1px solid var(--color-border)",
                margin: "4px 0",
              }}
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(component.id);
              }}
              style={{
                width: "100%",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 10px",
                fontSize: "var(--fs-sm)",
                background: "transparent",
                color: "var(--color-accent)",
                border: "none",
                cursor: "pointer",
                transition: "var(--transition)",
              }}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            {component.children.map((child, i) => (
              <LayerItem
                key={child.id}
                component={child}
                depth={depth + 1}
                isSelected={isSelected}
                onSelect={onSelect}
                onDelete={onDelete}
                path={[...path, i]}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// MODIFIED: Accept searchTerm as prop instead of managing internally
const LayersPanel = ({ 
  canvasComponents, 
  selectedComponent, 
  onComponentSelect, 
  onComponentDelete,
  searchTerm = "" // NEW: Receive from Panel component
}) => {
  const filteredComponents = useMemo(() => {
    if (!searchTerm) return canvasComponents;
    const filterRecursive = (comps) =>
      comps.filter((c) => {
        const match =
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.type.toLowerCase().includes(searchTerm.toLowerCase());
        if (match) return true;
        if (c.children) {
          const filtered = filterRecursive(c.children);
          if (filtered.length > 0) {
            c.children = filtered;
            return true;
          }
        }
        return false;
      });
    return filterRecursive([...canvasComponents]);
  }, [canvasComponents, searchTerm]);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-surface)",
        color: "var(--color-text)",
      }}
    >
      {/* SIMPLIFIED Header - No search, no maximize */}
      <div
        style={{
          padding: "1rem",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              padding: "8px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Layers size={18} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "var(--fs-lg)", fontWeight: 600 }}>Layer Tree</h3>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--color-text-muted)" }}>
              {canvasComponents.length} root layers
            </p>
          </div>
        </div>
      </div>

      {/* Layers list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px",
        }}
      >
        {filteredComponents.length > 0 ? (
          filteredComponents.map((c) => (
            <LayerItem
              key={c.id}
              component={c}
              isSelected={selectedComponent === c.id}
              onSelect={onComponentSelect}
              onDelete={onComponentDelete}
              canvasComponents={canvasComponents}
            />
          ))
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              color: "var(--color-text-muted)",
            }}
          >
            <Layers size={40} color="var(--color-text-muted)" />
            <p style={{ marginTop: "0.5rem", fontSize: "var(--fs-sm)" }}>
              {searchTerm ? "No layers match your search" : "No layers yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LayersPanel;