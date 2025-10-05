import React, { useState, useMemo } from "react";
import {
  Eye, EyeOff, Lock, Unlock, ChevronRight,
  Layers, Trash2, Copy, MoreVertical, Move, Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LayerItem = ({ component, depth = 0, isSelected, onSelect, onDelete, path = [] }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const hasChildren = component.children && component.children.length > 0;
  const isLayout = component.isLayoutContainer;

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

        {/* Icon */}
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `1.5px solid ${isLayout ? depthColor : "var(--color-border)"}`,
            background: isLayout ? `${depthColor}10` : "var(--color-surface)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {isLayout ? (
            <Layers size={14} color={depthColor} />
          ) : (
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: depthColor,
              }}
            />
          )}
        </div>

        {/* Name + Meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span
              style={{
                color: isSelected ? "var(--color-primary)" : "var(--color-text)",
                fontSize: "var(--fs-sm)",
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {component.name}
            </span>
            {isLayout && (
              <span
                style={{
                  background: `${depthColor}15`,
                  color: depthColor,
                  borderRadius: "4px",
                  padding: "2px 6px",
                  fontSize: "10px",
                  fontWeight: 500,
                }}
              >
                {component.type}
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
            <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{component.type}</span>
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
              { icon: <Maximize2 size={14} />, label: "Expand All" },
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

const LayersPanel = ({ canvasComponents, selectedComponent, onComponentSelect, onComponentDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandAll, setExpandAll] = useState(true);

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
      {/* Header */}
      <div
        style={{
          padding: "1rem",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
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
          <button
            onClick={() => setExpandAll(!expandAll)}
            style={{
              background: "transparent",
              border: "none",
              borderRadius: "var(--radius-md)",
              padding: "8px",
              cursor: "pointer",
              transition: "var(--transition)",
            }}
          >
            <Maximize2 size={16} color="var(--color-text-muted)" />
          </button>
        </div>

        <input
          type="text"
          placeholder="Search layers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            background: "var(--color-bg-muted)",
            color: "var(--color-text)",
            fontSize: "var(--fs-sm)",
          }}
        />
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
