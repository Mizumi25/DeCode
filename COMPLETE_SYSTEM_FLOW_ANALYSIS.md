# Complete System Flow Analysis: From Database to Canvas

## Overview
This document traces the complete journey of components through your system, from the database tables to the visual canvas rendering.

---

## Part 1: Database Layer (Laravel/MySQL)

### Tables Structure

#### 1. `components` Table (Component Definitions)
**Location**: `database/migrations/2025_08_15_233031_create_components_table.php`

**Purpose**: Stores reusable component templates (like a library)

**Key Fields**:
- `id` - Primary key
- `name` - Display name (e.g., "Button", "Input")
- `type` - Unique identifier (e.g., "button", "input", "card")
- `component_type` - ENUM: 'element' or 'component'
- `category` - Grouping (e.g., "basic", "form", "layout")
- `alphabet_group` - Letter for UI organization (A, B, C...)
- `description` - Component description
- `icon` - Lucide icon name
- `default_props` - JSON: Default properties
- `prop_definitions` - JSON: Available props and types
- `render_template` - Text: React template
- `code_generators` - JSON: Code generation templates
- `variants` - JSON: Style variants
- `has_animation` - Boolean
- `animation_type` - String (css, gsap, framer-motion)
- `is_active` - Boolean
- `sort_order` - Integer

**Model**: `app/Models/Component.php`
- Has many `ProjectComponent` relationships
- Scopes: active, byCategory, byComponentType, byAlphabetGroup, ordered, search

---

#### 2. `project_components` Table (Component Instances)
**Location**: `database/migrations/2025_08_15_233057_create_project_components_table.php`

**Purpose**: Stores actual component instances placed on canvas

**Key Fields**:
- `id` - Primary key (auto-increment)
- `project_id` - String UUID (references projects)
- `frame_id` - String UUID (references frames)
- `parent_id` - Foreign key to project_components.id (for nesting)
- `component_instance_id` - String: Frontend-generated UUID
- `component_type` - String: References components.type
- `props` - JSON: Instance properties
- `text_content` - Text: For text nodes
- `name` - String: User-defined name
- `z_index` - Integer: Stacking order
- `sort_order` - Integer: Order within parent
- `is_locked` - Boolean
- `style` - JSON: CSS styles
- `animation` - JSON: Animation data
- `display_type` - String: block/inline/flex/grid
- `layout_props` - JSON: Layout-specific props
- `is_layout_container` - Boolean: Can accept children
- `visible` - Boolean
- `locked` - Boolean

**Model**: `app/Models/ProjectComponent.php`
- Belongs to `Component` (via component_type)
- Has self-referential parent/children relationships
- Scopes: byProject, byFrame, ordered

**Tree Structure**: Uses `parent_id` to create nested hierarchies

---

## Part 2: Backend API Layer (Laravel Controllers)

### Controller 1: ComponentController
**Location**: `app/Http/Controllers/ComponentController.php`

**Purpose**: Manages component definitions (the library)

**Key Routes** (`routes/api.php` lines 52-64):
```php
GET    /api/components              -> index()
GET    /api/components/search       -> search()
GET    /api/components/letter       -> getByLetter()
GET    /api/components/{uuid}       -> show()
POST   /api/components              -> store()
PUT    /api/components/{uuid}       -> update()
DELETE /api/components/{uuid}       -> destroy()
POST   /api/components/generate-code -> generateCode()
```

**Key Method: `index()`** (Lines 11-126)
1. Fetches all active components from database
2. Groups by `component_type` (element/component) and `alphabet_group` (A-Z)
3. Returns structured data:
```json
{
  "success": true,
  "data": {
    "elements": {
      "A": [/* components starting with A */],
      "B": [/* components starting with B */],
      // ...
    },
    "components": {
      "A": [/* components starting with A */],
      "B": [/* components starting with B */],
      // ...
    }
  }
}
```

---

### Controller 2: ProjectComponentController
**Location**: `app/Http/Controllers/ProjectComponentController.php`

**Purpose**: Manages component instances on canvas

**Key Routes** (`routes/api.php` lines 67-75):
```php
GET    /api/project-components              -> index()
POST   /api/project-components              -> store()
PUT    /api/project-components/{uuid}       -> update()
DELETE /api/project-components/{uuid}       -> destroy()
POST   /api/project-components/bulk-update  -> bulkUpdate()
```

**Key Method: `index()`** (Lines 193-228)
1. Fetches flat list of ProjectComponents from database
2. Calls `buildComponentTree()` to reconstruct hierarchy
3. Returns nested tree structure

**Key Method: `bulkUpdate()`** (Lines 308-427)
1. Receives array of components from frontend
2. Deletes existing components in frame
3. Recursively saves with `saveComponentTreeWithTracking()`
4. Maintains parent-child relationships via `parent_id`
5. Broadcasts real-time updates via Laravel Echo

**Key Method: `buildComponentTree()`** (Lines 145-188)
- Converts flat database records into nested tree
- Maps database fields to frontend format:
  - `component_instance_id` → `id`
  - `component_type` → `type`
  - `parent_id` → `parentId`
  - `is_layout_container` → `isLayoutContainer`
  - `z_index` → `zIndex`
  - `sort_order` → `sortOrder`

---


## Part 3: Frontend Service Layer

### ComponentLibraryService
**Location**: `resources/js/Services/ComponentLibraryService.js`

**Purpose**: Bridge between API data and React rendering

**Key Properties**:
- `components` - Map<type, rendererObject>
- `componentDefinitions` - Map<type, definitionData>

**Initialization Flow**:

1. **`loadComponents()` method** (Lines 42-128)
   ```javascript
   // Called on app mount
   async loadComponents() {
     const response = await axios.get('/api/components');
     // Response: { elements: {A: [], B: []}, components: {A: [], B: []} }
     
     // For each component:
     componentList.forEach(component => {
       // Store raw definition
       this.componentDefinitions.set(component.type, component);
       
       // Create renderer
       this.components.set(component.type, 
         this.createComponentRenderer(component)
       );
     });
   }
   ```

2. **`createComponentRenderer()` method** (Lines 323-344)
   ```javascript
   createComponentRenderer(componentDef) {
     return {
       id: componentDef.type,
       name: componentDef.name,
       defaultProps: componentDef.default_props,
       variants: componentDef.variants,
       
       // THE PROBLEM: Dynamic render function
       render: (props, id) => {
         return this.renderComponent(componentDef, props, id);
       },
       
       generateCode: (props, allComponents, style) => {
         return this.generateComponentCode(componentDef, props, ...);
       }
     };
   }
   ```

3. **`renderComponent()` method** (Lines 347-518)
   ```javascript
   // THE CORE RENDERING LOGIC
   renderComponent(componentDef, props, id) {
     // Check if layout container
     const isLayoutContainer = props.isLayoutContainer || 
       ['section', 'container', 'div', 'flex', 'grid'].includes(componentDef.type);
     
     if (isLayoutContainer) {
       return this.renderLayoutContainer(...); // Special handling
     }
     
     // BIG SWITCH STATEMENT - 30+ cases
     switch (componentDef.type) {
       case 'button': return this.renderButton(props, id);
       case 'input': return this.renderInput(props, id);
       case 'card': return this.renderCard(props, id);
       case 'h1': return this.renderHeading('h1', props, id);
       // ... 27 more cases
       default: return this.renderGeneric(props, id, componentDef);
     }
   }
   ```

**The 30+ Specialized Render Methods**:
- `renderButton()` - Line 634
- `renderInput()` - Line 736
- `renderCard()` - Line 792
- `renderTextNode()` - Line 825
- `renderHeading()` - Line 878
- `renderParagraph()` - Line 907
- `renderBadge()` - Line 924
- `renderNavbar()` - Line 953
- `renderSpan()` - Line 1116
- `renderStrong()` - Line 1130
- `renderEm()` - Line 1144
- ... and 20 more

**Each render method does**:
```javascript
renderButton(props, id) {
  return React.createElement('button', {
    key: id,
    className: this.getButtonClasses(props),
    style: props.style,
    ...props
  }, props.text);
}
```

**Code Generation Methods**:
Similar pattern - specialized methods for each component type to generate HTML/JSX/Vue code.

---

## Part 4: React Component Layer

### ForgePage (Main Page)
**Location**: `resources/js/Pages/ForgePage.jsx`

**Initialization** (Lines 96-250):
```javascript
export default function ForgePage({ projectId, frameId, project, frame }) {
  // State
  const [canvasComponents, setCanvasComponents] = useState([]);
  const [componentsLoaded, setComponentsLoaded] = useState(false);
  
  // Load component library on mount
  useEffect(() => {
    const loadLibrary = async () => {
      await componentLibraryService.loadComponents();
      console.log('Component library loaded');
    };
    loadLibrary();
  }, []);
  
  // Load frame components from database
  useEffect(() => {
    if (currentFrame) {
      loadFrameComponents();
    }
  }, [currentFrame]);
}
```

**Loading Frame Components**:
```javascript
const loadFrameComponents = async () => {
  const components = await componentLibraryService.loadProjectComponents(
    projectId, 
    currentFrame
  );
  // components is a tree structure from buildComponentTree()
  setCanvasComponents(components);
  setComponentsLoaded(true);
};
```

---

### ComponentsPanel
**Location**: `resources/js/Components/Forge/ComponentsPanel.jsx`

**Purpose**: Display component library in sidebar

**Component Loading** (Lines 300-400):
```javascript
const ComponentsPanel = () => {
  const [components, setComponents] = useState({ elements: {}, components: {} });
  
  useEffect(() => {
    loadComponents();
  }, []);
  
  const loadComponents = async () => {
    const response = await axios.get('/api/components');
    if (response.data.success) {
      setComponents(response.data.data);
    }
  };
  
  // Group by category for display
  const componentsByCategory = useMemo(() => {
    const grouped = {};
    Object.entries(components[activeTab] || {}).forEach(([letter, comps]) => {
      comps.forEach(comp => {
        if (!grouped[comp.category]) grouped[comp.category] = [];
        grouped[comp.category].push(comp);
      });
    });
    return grouped;
  }, [components, activeTab]);
};
```

**Component Click Handler** (Lines 450-500):
```javascript
const handleComponentClick = (component) => {
  // If has variants, show variant panel
  if (component.variants && component.variants.length > 0) {
    setSelectedComponent(component);
    setShowVariants(true);
  } else {
    // No variants - add directly to canvas
    // (requires drag/drop implementation)
  }
};
```

**Drag Start Handler**:
```javascript
const handleVariantDragStart = (e, componentType, variant, dragData) => {
  // Store drag data
  e.dataTransfer.setData('text/plain', JSON.stringify({
    componentType,
    variant,
    component: dragData.component
  }));
  
  // Create drag preview image
  const dragImg = document.createElement('div');
  dragImg.innerHTML = variant.preview_code;
  document.body.appendChild(dragImg);
  e.dataTransfer.setDragImage(dragImg, 0, 0);
};
```

---

### CanvasComponent
**Location**: `resources/js/Components/Forge/CanvasComponent.jsx`

**Purpose**: Main canvas rendering and interaction

**Component Structure** (Lines 810-1050):
```javascript
const DraggableComponent = ({ component, depth, parentId }) => {
  const isLayout = component.isLayoutContainer || 
    ['section', 'container', 'div', 'flex', 'grid'].includes(component.type);
  
  // PROBLEM: Two rendering paths
  if (isLayout) {
    // Layout rendering (Lines 992-1050)
    return (
      <div 
        className="layout-container"
        data-is-layout="true"
        style={componentStyles}
      >
        {/* Render children recursively */}
        {component.children?.map(child => (
          <DraggableComponent 
            component={child}
            depth={depth + 1}
            parentId={component.id}
          />
        ))}
      </div>
    );
  } else {
    // Non-layout rendering (Lines 1060-1120)
    // Get renderer from service
    const renderer = componentLibraryService.components.get(component.type);
    
    return (
      <div style={componentStyles}>
        {renderer?.render(component.props, component.id)}
      </div>
    );
  }
};
```

**Drop Handler** (handles adding components from panel):
```javascript
const handleCanvasDrop = (e) => {
  e.preventDefault();
  
  const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
  const { componentType, variant, component } = dragData;
  
  // Get drop position
  const rect = canvasRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Create new component instance
  const newComponent = {
    id: `${componentType}_${Date.now()}`,
    type: componentType,
    name: component.name,
    props: {
      ...component.default_props,
      ...(variant?.props || {})
    },
    style: {
      position: 'absolute',
      left: x,
      top: y,
      ...(variant?.style || {})
    },
    children: [],
    isLayoutContainer: ['section', 'container', 'div', 'flex', 'grid'].includes(componentType)
  };
  
  // Add to canvas
  setCanvasComponents(prev => [...prev, newComponent]);
  
  // Save to database
  saveComponents([...canvasComponents, newComponent]);
};
```

**Save to Database**:
```javascript
const saveComponents = async (components) => {
  await axios.post('/api/project-components/bulk-update', {
    project_id: projectId,
    frame_id: currentFrame,
    components: components
  });
};
```

---

## Part 5: Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐         ┌──────────────────────┐     │
│  │   components         │         │  project_components  │     │
│  │  (Definitions)       │         │    (Instances)       │     │
│  ├──────────────────────┤         ├──────────────────────┤     │
│  │ • type               │         │ • id (PK)            │     │
│  │ • name               │◄────────│ • component_type     │     │
│  │ • default_props      │         │ • parent_id (FK)     │     │
│  │ • variants           │         │ • props              │     │
│  │ • category           │         │ • style              │     │
│  └──────────────────────┘         │ • is_layout_container│     │
│                                    └──────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND API LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            ComponentController                           │   │
│  │  GET /api/components                                     │   │
│  │  ├─ index() → Fetch definitions                         │   │
│  │  └─ Returns: { elements: {A:[], B:[]}, components: {} } │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │        ProjectComponentController                        │   │
│  │  GET /api/project-components?project_id&frame_id        │   │
│  │  ├─ index() → Fetch instances                           │   │
│  │  ├─ buildComponentTree() → Reconstruct hierarchy        │   │
│  │  └─ Returns: [nested tree structure]                    │   │
│  │                                                           │   │
│  │  POST /api/project-components/bulk-update               │   │
│  │  ├─ bulkUpdate() → Save all components                  │   │
│  │  ├─ saveComponentTreeWithTracking() → Recursive save    │   │
│  │  └─ Broadcasts real-time updates                        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND SERVICE LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         ComponentLibraryService                          │   │
│  │  • loadComponents() → Fetch from API                    │   │
│  │  • components Map<type, renderer>                       │   │
│  │  • componentDefinitions Map<type, data>                 │   │
│  │                                                           │   │
│  │  ⚠️ PROBLEM: 30+ Specialized Methods                    │   │
│  │  ├─ createComponentRenderer()                           │   │
│  │  ├─ renderComponent() → SWITCH STATEMENT                │   │
│  │  │   ├─ renderButton()                                  │   │
│  │  │   ├─ renderInput()                                   │   │
│  │  │   ├─ renderCard()                                    │   │
│  │  │   └─ ... 27 more                                     │   │
│  │  │                                                        │   │
│  │  └─ renderLayoutContainer() → Separate layout handling   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   REACT COMPONENT LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    ForgePage                             │   │
│  │  • Main canvas page                                      │   │
│  │  • Manages canvasComponents state                       │   │
│  │  • Handles saving to database                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ▼                                     │
│  ┌─────────────────────┐         ┌─────────────────────────┐   │
│  │  ComponentsPanel    │────────▶│   CanvasComponent       │   │
│  │  • Shows library    │  Drag   │   • Renders components  │   │
│  │  • Grouped by       │   &     │   • Handles interactions│   │
│  │    category         │  Drop   │                          │   │
│  │  • Variant selector │         │   ⚠️ PROBLEM: Dual Path │   │
│  └─────────────────────┘         │   if (isLayout) {}      │   │
│                                    │   else {}               │   │
│                                    └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 6: User Interaction Flows

### Flow 1: Page Load
```
1. User opens /forge/{projectId}/{frameId}
   └─▶ ForgePage.jsx mounts

2. useEffect runs loadComponents()
   └─▶ ComponentLibraryService.loadComponents()
       └─▶ GET /api/components
           └─▶ ComponentController.index()
               └─▶ Query: SELECT * FROM components WHERE is_active=1
                   └─▶ Returns: { elements: {A: [...], B: [...]}, components: {...} }
                       └─▶ Service stores in Map
                           └─▶ Creates renderer for each component

3. useEffect runs loadFrameComponents()
   └─▶ ComponentLibraryService.loadProjectComponents(projectId, frameId)
       └─▶ GET /api/project-components?project_id=X&frame_id=Y
           └─▶ ProjectComponentController.index()
               └─▶ Query: SELECT * FROM project_components WHERE project_id=X AND frame_id=Y
                   └─▶ buildComponentTree() reconstructs hierarchy
                       └─▶ Returns: [tree structure]
                           └─▶ setCanvasComponents(tree)
                               └─▶ CanvasComponent renders
```

### Flow 2: Drag Component from Panel to Canvas
```
1. User clicks component in ComponentsPanel
   └─▶ Has variants?
       ├─ YES: Shows VariantSlidePanel
       │   └─▶ User clicks variant
       │       └─▶ handleVariantDragStart()
       │           └─▶ e.dataTransfer.setData(JSON.stringify({componentType, variant, component}))
       └─ NO: (Future: direct add)

2. User drags over canvas
   └─▶ Canvas shows drop zones
   └─▶ Drop intent calculation (inside/before/after)

3. User drops on canvas
   └─▶ handleCanvasDrop(e)
       └─▶ Parse e.dataTransfer.getData()
       └─▶ Calculate position (x, y)
       └─▶ Create new component instance:
           {
             id: generated,
             type: componentType,
             props: {...default_props, ...variant.props},
             style: {position: 'absolute', left: x, top: y, ...variant.style},
             children: []
           }
       └─▶ setCanvasComponents([...prev, newComponent])
       └─▶ Auto-save debounced (2 seconds)
           └─▶ POST /api/project-components/bulk-update
               └─▶ ProjectComponentController.bulkUpdate()
                   └─▶ DELETE FROM project_components WHERE frame_id=Y
                   └─▶ saveComponentTreeWithTracking(components)
                       └─▶ INSERT INTO project_components (recursive)
                       └─▶ Broadcast real-time update
```

### Flow 3: Nested Component (Drag into Container)
```
1. User drags component over layout container
   └─▶ Container shows drop zone indicator

2. User drops inside container
   └─▶ handleComponentDragEnd({componentId, targetId, intent: 'inside'})
       └─▶ Find target component in tree
       └─▶ Add component to target.children[]
       └─▶ setCanvasComponents(updatedTree)
       └─▶ Auto-save
           └─▶ POST /api/project-components/bulk-update
               └─▶ saveComponentTreeWithTracking() sets parent_id
                   └─▶ INSERT ... parent_id = target.db_id
```

### Flow 4: Rendering on Canvas
```
1. CanvasComponent receives canvasComponents array
   └─▶ Maps each component to DraggableComponent

2. DraggableComponent checks:
   └─▶ isLayout = component.isLayoutContainer || ['section','div'...].includes(type)
       ├─ TRUE (Layout):
       │   └─▶ Render <div className="layout-container">
       │       └─▶ Recursively render children
       │           └─▶ Each child: DraggableComponent(child, depth+1)
       │
       └─ FALSE (Non-layout):
           └─▶ Get renderer: componentLibraryService.components.get(type)
           └─▶ Call renderer.render(props, id)
               └─▶ ComponentLibraryService.renderComponent()
                   └─▶ switch(type)
                       ├─ case 'button': renderButton()
                       ├─ case 'input': renderInput()
                       └─ ...
                           └─▶ React.createElement(tag, props, children)
```

---

## Part 7: The Core Problems Identified

### Problem 1: Dual Rendering Paths
**Location**: `CanvasComponent.jsx` lines 815-1050

```javascript
// CURRENT BAD PATTERN
if (isLayout) {
  // One way (lines 992-1050)
  return <div>...</div>
} else {
  // Another way (lines 1060-1120)
  return renderer.render(...)
}
```

**Why This is Bad**:
- ❌ Two completely different code paths
- ❌ Special case logic everywhere
- ❌ Can't treat components uniformly
- ❌ Hard to add new component types
- ❌ Breaks abstraction

### Problem 2: 30+ Specialized Render Methods
**Location**: `ComponentLibraryService.js` throughout

```javascript
// CURRENT BAD PATTERN
renderComponent(componentDef, props, id) {
  switch (componentDef.type) {
    case 'button': return this.renderButton(props, id);
    case 'input': return this.renderInput(props, id);
    case 'card': return this.renderCard(props, id);
    // ... 27 more cases
  }
}

// Each method is 20-100 lines
renderButton(props, id) { /* ... */ }
renderInput(props, id) { /* ... */ }
renderCard(props, id) { /* ... */ }
// ... 27 more methods
```

**Why This is Catastrophic**:
- ❌ Adding new component = 200+ lines of code
- ❌ Not data-driven (hardcoded logic)
- ❌ Can't be AI-generated (too many special cases)
- ❌ Can't reverse-engineer code → visual
- ❌ No unified metadata format
- ❌ Impossible to scale to 100+ components
- ❌ Copy-paste errors everywhere
- ❌ Testing nightmare (30+ test suites needed)

### Problem 3: Inconsistent Data Mapping
**Scattered throughout system**

**Frontend → Backend**:
- `id` → `component_instance_id`
- `type` → `component_type`
- `zIndex` → `z_index`
- `sortOrder` → `sort_order`
- `isLayoutContainer` → `is_layout_container`

**Backend → Frontend**:
- `component_instance_id` → `id`
- `component_type` → `type`
- etc...

**Why This is Bad**:
- ❌ Manual mapping in multiple places
- ❌ Easy to forget/mess up
- ❌ No single source of truth
- ❌ Hard to debug

### Problem 4: No Unified Component Schema
**Throughout system**

**Database** has one format:
```json
{
  "type": "button",
  "default_props": {},
  "variants": [],
  "prop_definitions": {}
}
```

**Service** has different format:
```javascript
{
  id: 'button',
  render: function() {},
  generateCode: function() {}
}
```

**Canvas** has yet another format:
```javascript
{
  id: 'btn_123',
  type: 'button',
  props: {},
  style: {},
  children: []
}
```

**Why This is Bad**:
- ❌ No consistency
- ❌ Multiple transformations needed
- ❌ Hard to validate
- ❌ Can't auto-generate TypeScript types

---

## Part 8: Summary of Data Flow

### The Good Parts ✅
1. **Database structure** is solid (proper relationships, tree structure)
2. **API controllers** handle CRUD well
3. **Tree reconstruction** works correctly
4. **Real-time collaboration** is implemented
5. **Drag and drop** works

### The Bad Parts ❌
1. **No unified rendering** - layout vs non-layout split
2. **30+ specialized methods** - not scalable
3. **Hardcoded logic** - not data-driven
4. **Inconsistent naming** - manual mapping everywhere
5. **No universal schema** - each layer has different format

### What Needs to Change 🔄
See: `ARCHITECTURE_ANALYSIS_AND_UNIFIED_SOLUTION.md`
- Unified Element Definition Format (EDF)
- Single renderer for all components
- Data-driven instead of code-driven
- Template-based code generation
- Consistent naming throughout stack

---

## Conclusion

Your system works but is **architecturally limited**. You correctly identified that:
- ✅ It's not scalable
- ✅ AI can't integrate easily
- ✅ Can't reverse-generate code to visual
- ✅ Lacks flexibility

**The solution is to adopt a DOM-like unified approach where every component (layout or not) follows the same path through the system.**
