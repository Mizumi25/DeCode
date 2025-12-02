# 📦 Frame Container System - Complete Implementation Guide

## 🎯 Overview
A comprehensive system for organizing frames in draggable, resizable containers with horizontal auto-layout on the Void page.

---

## ✅ What's Implemented (Steps 1-13)

### Backend Foundation ✅
- **Database**: `frame_containers` table + `x`, `y`, `container_id`, `container_order` columns in `frames` table
- **Models**: `FrameContainer` and `Frame` with proper relationships
- **API**: Full CRUD for containers (create, update, delete, add/remove frames, reorder)
- **Routes**: All endpoints registered at `/api/projects/{project}/containers/*`
- **Position Persistence**: Frames save x, y positions to database

### Frontend Core ✅
- **Container Toggle**: Replaced Grid icon with Container icon in header (purple when active)
- **Container Component**: Draggable, resizable, editable name, horizontal frame layout
- **VoidPage Integration**: Container state, handlers, rendering
- **Drag & Drop**: 
  - Drag frames into containers (detects drop zone)
  - Drag frames out of containers (releases to canvas)
  - Frame positions persist to database
  - Container membership updates in real-time

---

## 🚀 How It Works

### User Flow

#### Creating a Container:
1. Click Container icon in header (turns purple)
2. Click anywhere on void canvas
3. Container appears at click position
4. Icon auto-deactivates
5. Container saved to database

#### Moving a Container:
1. Drag container header (grip icon area)
2. Entire container moves with all frames
3. Position updates in database

#### Resizing a Container:
1. Drag bottom-right corner
2. Size updates in database
3. Frames reflow horizontally (if implemented)

#### Renaming a Container:
1. Double-click container name
2. Edit inline
3. Press Enter or blur to save
4. Name updates in database

#### Adding Frames to Container:
1. Drag any frame from canvas
2. Drop over container area
3. Frame snaps into container
4. Removed from canvas view
5. Container membership saved to database

#### Removing Frames from Container:
1. Drag frame from container
2. Drop outside container bounds
3. Frame becomes "loose" on canvas
4. Position saved to database
5. Container membership cleared

#### Deleting a Container:
1. Click trash icon in container header
2. Confirm deletion
3. Frames released to canvas
4. Container removed from database

---

## 📋 Remaining Work (Steps 14-16)

### 14. Horizontal Auto-Layout with Spacing ❌
**What's Needed:**
- Calculate frame positions within container based on order
- Add 16px spacing between frames
- Update positions when frames added/removed
- Handle container resize reflow

**Implementation:**
```jsx
// In FrameContainer.jsx - Calculate positions
const frameSpacing = 16
const frameWidth = 200

frames.forEach((frame, index) => {
  const xPos = (frameWidth + frameSpacing) * index + frameSpacing
  // Render frame at xPos
})
```

### 15. Real-Time Updates (Echo Events) ❌
**What's Needed:**
- Broadcast ContainerCreated event
- Broadcast ContainerUpdated event  
- Broadcast ContainerDeleted event
- Broadcast FrameAddedToContainer event
- Broadcast FrameRemovedFromContainer event

**Implementation:**
```php
// In FrameContainerController
broadcast(new ContainerCreated($container, $workspace))->toOthers();
broadcast(new ContainerUpdated($container, $changes))->toOthers();
broadcast(new ContainerDeleted($containerUuid, $workspace))->toOthers();
```

```jsx
// In VoidPage.jsx useEffect
channel.listen('ContainerCreated', (event) => {
  setContainers(prev => [...prev, event.container])
})

channel.listen('ContainerDeleted', (event) => {
  setContainers(prev => prev.filter(c => c.uuid !== event.uuid))
})
```

### 16. Polish & Refinements ❌
- Add visual drop zone highlight when dragging over container
- Add smooth animations for frame transitions
- Add keyboard shortcuts (Delete to remove container)
- Add container color customization
- Add vertical orientation option
- Add container templates (sidebar, grid, etc.)

---

## 🗄️ Database Schema

### `frame_containers` Table
```sql
- id (primary key)
- uuid (unique, indexed)
- project_id (foreign key → projects.id)
- name (string, default: "Container {n}")
- x (integer, position in void)
- y (integer, position in void)
- width (integer, default: 800)
- height (integer, default: 400)
- orientation (enum: 'horizontal', 'vertical', default: 'horizontal')
- settings (json, nullable)
- timestamps
```

### `frames` Table (New Columns)
```sql
- x (integer, default: 0)
- y (integer, default: 0)
- container_id (foreign key → frame_containers.id, nullable)
- container_order (integer, nullable)
```

---

## 🔌 API Endpoints

### Containers
- `GET /api/projects/{project}/containers` - List all containers
- `POST /api/projects/{project}/containers` - Create container
- `PATCH /api/projects/{project}/containers/{container}` - Update container
- `DELETE /api/projects/{project}/containers/{container}` - Delete container

### Frame-Container Operations
- `POST /api/projects/{project}/containers/{container}/frames/{frame}` - Add frame to container
- `DELETE /api/frames/{frame}/container` - Remove frame from container
- `PATCH /api/projects/{project}/containers/{container}/reorder` - Reorder frames

### Frame Positions
- `PUT /api/frames/{frame}/position` - Update frame position (x, y)

---

## 📁 File Structure

### Backend
```
app/Models/
  FrameContainer.php           ✅ Model with relationships
  Frame.php                     ✅ Updated with container fields

app/Http/Controllers/
  FrameContainerController.php ✅ CRUD operations
  VoidController.php            ✅ Updated for positions

database/migrations/
  2025_01_02_000001_add_position_to_frames_and_create_containers.php ✅
```

### Frontend
```
resources/js/Components/
  Header/Head/
    LeftSection.jsx             ✅ Container toggle
  Void/
    FrameContainer.jsx          ✅ Container component
    PreviewFrame.jsx            ✅ (unchanged - uses DndKit)

resources/js/Pages/
  VoidPage.jsx                  ✅ Container state & handlers
```

---

## 🧪 Testing Checklist

### Basic Functionality ✅
- [x] Create container by clicking canvas
- [x] Container appears at click position
- [x] Container saves to database
- [x] Container loads from database on refresh
- [x] Drag container header to move
- [x] Drag corner to resize
- [x] Double-click name to edit
- [x] Delete container removes it

### Drag & Drop ✅
- [x] Drag frame from canvas into container
- [x] Frame disappears from canvas
- [x] Frame appears in container
- [x] Drag frame out of container
- [x] Frame returns to canvas
- [x] Frame position saves to database
- [x] Container membership updates

### Multi-User ❌ (Not implemented)
- [ ] Create container - other users see it
- [ ] Move container - other users see movement
- [ ] Delete container - other users see deletion
- [ ] Add frame to container - other users see change

### Edge Cases
- [x] Empty container shows placeholder
- [x] Delete container releases frames
- [x] Frames filter correctly (in container vs on canvas)
- [ ] Container auto-layout when adding frames
- [ ] Container reflow when resizing

---

## 🎨 Visual Design

### Container Appearance
```
┌─────────────────────────────────────────┐
│ 📦 Container 1    [✏️] [🗑️]              │ ← Header (draggable)
├─────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │Frame │  │Frame │  │Frame │  [+]     │ ← Horizontal layout
│  │  1   │  │  2   │  │  3   │          │
│  └──────┘  └──────┘  └──────┘          │
└─────────────────────────────────────────┘
         ↑ Resize handle (bottom-right)
```

### States
- **Normal**: Border `rgba(200, 200, 200, 0.5)`, transparent white bg
- **Hover (dragging over)**: Border `var(--color-primary)`, highlighted
- **Active (being dragged)**: Cursor `grabbing`
- **Edit name**: Inline input with save/cancel buttons

---

## 💡 Implementation Tips

### Performance Optimization
```jsx
// Use React.memo for containers
const FrameContainer = React.memo(({ container, frames, ... }) => {
  // Component code
})

// Filter frames efficiently
const looseFrames = useMemo(() => 
  frames.filter(f => !f.container_id), 
  [frames]
)

const containerFrames = useMemo(() => 
  frames.filter(f => f.container_id === container.id),
  [frames, container.id]
)
```

### Drop Detection
```jsx
// Check if point is inside container bounds
const isOverContainer = (x, y, container, zoom) => {
  const rect = {
    left: container.x * zoom,
    top: container.y * zoom,
    right: (container.x + container.width) * zoom,
    bottom: (container.y + container.height) * zoom
  }
  
  return x >= rect.left && x <= rect.right &&
         y >= rect.top && y <= rect.bottom
}
```

### Auto-Layout Algorithm
```jsx
const calculateFramePositions = (frames, containerWidth, frameWidth, spacing) => {
  return frames.map((frame, index) => ({
    ...frame,
    localX: (frameWidth + spacing) * index + spacing,
    localY: spacing
  }))
}
```

---

## 🐛 Known Issues

### Current Limitations
1. **No horizontal auto-layout** - Frames don't automatically space out yet
2. **No real-time updates** - Other users don't see container changes
3. **No drop zone highlight** - No visual feedback when dragging over container
4. **No undo/redo** - Can't undo container operations
5. **No keyboard shortcuts** - Must use mouse for all operations

### Future Enhancements
- Container templates (sidebar layout, grid layout, etc.)
- Container themes/colors
- Vertical orientation support
- Nested containers
- Container groups
- Export/import container layouts
- Container search/filter
- Bulk operations (move all frames to container)

---

## 📚 Code Examples

### Creating a Container (Frontend)
```jsx
const handleCanvasClick = async (e) => {
  if (!containerMode) return
  
  const rect = e.currentTarget.getBoundingClientRect()
  const x = (e.clientX - rect.left) / zoom
  const y = (e.clientY - rect.top) / zoom
  
  const response = await fetch(`/api/projects/${project.uuid}/containers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ x, y })
  })
  
  if (response.ok) {
    const { data } = await response.json()
    setContainers(prev => [...prev, data])
    setContainerMode(false)
  }
}
```

### Adding Frame to Container (Backend)
```php
public function addFrame(FrameContainer $container, Frame $frame, Request $request)
{
    $order = $request->input('order', 0);
    
    $frame->update([
        'container_id' => $container->id,
        'container_order' => $order,
    ]);
    
    return response()->json([
        'success' => true,
        'data' => $frame->load('container')
    ]);
}
```

### Detecting Container Drop (Frontend)
```jsx
const handleDragEnd = (event) => {
  const dropX = event.activatorEvent.clientX
  const dropY = event.activatorEvent.clientY
  
  const droppedContainer = containers.find(c => {
    const rect = {
      left: c.x * zoom,
      top: c.y * zoom,
      right: (c.x + c.width) * zoom,
      bottom: (c.y + c.height) * zoom
    }
    
    return dropX >= rect.left && dropX <= rect.right &&
           dropY >= rect.top && dropY <= rect.bottom
  })
  
  if (droppedContainer) {
    // Add to container
  } else {
    // Normal position update
  }
}
```

---

## 🎓 Learning Resources

### Technologies Used
- **DndKit** - Drag and drop library (already in use for frames)
- **Framer Motion** - Animations (for smooth container movements)
- **Zustand** - State management (optional, for container store)
- **Laravel Broadcasting** - Real-time events (for multi-user)

### Related Documentation
- DndKit: https://docs.dndkit.com/
- Framer Motion: https://www.framer.com/motion/
- Laravel Broadcasting: https://laravel.com/docs/broadcasting

---

## ✅ Summary

**What's Done:**
- Complete backend (database, models, API, routes)
- Container creation, editing, deletion
- Container dragging and resizing
- Frame drag into/out of containers
- Position persistence to database
- UI integration with Void page

**What's Left:**
- Horizontal auto-layout (14)
- Real-time updates (15)
- Polish & refinements (16)

**Completion:** ~85% complete (13/16 steps)

---

## 🚀 Quick Start for Remaining Work

### To implement auto-layout:
1. Open `FrameContainer.jsx`
2. Modify frame rendering to calculate positions
3. Add frame spacing logic
4. Handle container resize reflow

### To add real-time:
1. Create events: `ContainerCreated`, `ContainerUpdated`, `ContainerDeleted`
2. Broadcast in `FrameContainerController`
3. Listen in `VoidPage.jsx` useEffect
4. Update state when events received

### To add polish:
1. Add CSS transitions for smooth animations
2. Add hover states and visual feedback
3. Add keyboard shortcuts
4. Add confirmation dialogs
5. Add loading states

---

**The foundation is solid! The remaining work is enhancement and polish.**
