# 🎯 Public vs Private Project Access System

## ✨ BRILLIANT IDEA! 

Yes! You already have `is_public` field in projects! Let's leverage it!

## 📊 Current System:

```php
// Project Model
'is_public' => 'boolean'  // ✅ Already exists!

// Project Scope
public function scopePublic($query) {
    return $query->where('is_public', true);
}
```

## 🎨 Proposed Access Control:

### **PUBLIC PROJECTS** (`is_public = true`)
Anyone with the link can access WITHOUT login:
- ✅ VoidPage (project overview with all frames)
- ✅ ForgePage (read-only component viewer)
- ✅ SourcePage (read-only code viewer)
- ❌ Editing - Still requires workspace membership
- ❌ Deleting/Settings - Still requires ownership

**URL Pattern:**
```
/public/{project:uuid}/void
/public/{project:uuid}/frame={frame:uuid}/forge
/public/{project:uuid}/frame={frame:uuid}/source
```

### **PRIVATE PROJECTS** (`is_public = false`)
Require authentication + workspace membership:
- ✅ Must be logged in
- ✅ Must be in workspace (any role: viewer, editor, admin, owner)
- ✅ Full access based on workspace role

**URL Pattern:**
```
/void/{project:uuid}  (current - requires auth)
/void/{project:uuid}/frame={frame:uuid}/modeForge
/void/{project:uuid}/frame={frame:uuid}/modeSource
```

## 🔐 Access Matrix:

| Feature | Public Project (No Login) | Private Project (Login + Workspace) |
|---------|---------------------------|-------------------------------------|
| **VoidPage** | ✅ View-only | ✅ Full access |
| **ForgePage View** | ✅ Read-only | ✅ Full access |
| **ForgePage Edit** | ❌ Blocked | ✅ Based on role |
| **SourcePage View** | ✅ Read-only | ✅ Full access |
| **SourcePage Edit** | ❌ Blocked | ✅ Based on role |
| **Delete/Settings** | ❌ Blocked | ✅ Owner/Admin only |
| **Published Site** | ✅ Anyone | ✅ Anyone |

## 🏗️ Implementation Plan:

### **Step 1: Create Public Routes**
```php
// routes/web.php

// Public project routes (NO AUTH REQUIRED)
Route::prefix('public/{project:uuid}')->group(function () {
    Route::get('/void', [VoidController::class, 'showPublic'])
        ->name('public.void')
        ->middleware('check.public.project');
    
    Route::get('/frame={frame:uuid}/forge', [ForgeController::class, 'showPublic'])
        ->name('public.forge')
        ->middleware('check.public.project');
    
    Route::get('/frame={frame:uuid}/source', [SourceController::class, 'showPublic'])
        ->name('public.source')
        ->middleware('check.public.project');
});

// Private project routes (AUTH REQUIRED) - Keep existing
Route::middleware('auth')->group(function () {
    Route::get('/void/{project:uuid}', [VoidController::class, 'show'])
        ->name('void.index');
    
    Route::get('/void/{project:uuid}/frame={frame:uuid}/modeForge', [ForgeController::class, 'show'])
        ->name('frame.forge');
    
    Route::get('/void/{project:uuid}/frame={frame:uuid}/modeSource', [SourceController::class, 'show'])
        ->name('frame.source');
});
```

### **Step 2: Create Middleware to Check Public Status**
```php
// app/Http/Middleware/CheckPublicProject.php

public function handle($request, Closure $next)
{
    $project = Project::where('uuid', $request->route('project'))->first();
    
    if (!$project) {
        abort(404, 'Project not found');
    }
    
    if (!$project->is_public) {
        abort(403, 'This project is private. Please log in to access it.');
    }
    
    // Inject project into request for controllers to use
    $request->merge(['public_project' => $project]);
    
    return $next($request);
}
```

### **Step 3: Add Public View Methods to Controllers**
```php
// app/Http/Controllers/VoidController.php

public function showPublic(Request $request, $uuid)
{
    $project = $request->public_project; // From middleware
    
    return Inertia::render('VoidPage', [
        'project' => $project->load(['frames', 'workspace']),
        'isPublicView' => true,  // Frontend knows it's read-only
        'canEdit' => false,
    ]);
}

// app/Http/Controllers/ForgeController.php

public function showPublic(Request $request, $uuid, $frameUuid)
{
    $project = $request->public_project;
    $frame = $project->frames()->where('uuid', $frameUuid)->firstOrFail();
    
    return Inertia::render('ForgePage', [
        'frame' => $frame->load('projectComponents'),
        'project' => $project,
        'isPublicView' => true,  // Read-only mode
        'canEdit' => false,
    ]);
}

// app/Http/Controllers/SourceController.php

public function showPublic(Request $request, $uuid, $frameUuid)
{
    $project = $request->public_project;
    $frame = $project->frames()->where('uuid', $frameUuid)->firstOrFail();
    
    return Inertia::render('SourcePage', [
        'frame' => $frame,
        'project' => $project,
        'isPublicView' => true,  // Read-only mode
        'canEdit' => false,
    ]);
}
```

### **Step 4: Update Frontend Components**
```jsx
// resources/js/Pages/VoidPage.jsx

const VoidPage = ({ project, frames, isPublicView = false, canEdit = true }) => {
    return (
        <div>
            {isPublicView && (
                <div className="bg-blue-100 border border-blue-400 p-4 mb-4">
                    📢 Public View Mode - You're viewing a public project (read-only)
                </div>
            )}
            
            {/* Show frames but disable editing */}
            <FramesContainer 
                frames={frames}
                readOnly={!canEdit}
            />
            
            {!isPublicView && (
                <button onClick={createNewFrame}>
                    Create Frame
                </button>
            )}
        </div>
    );
};

// resources/js/Pages/ForgePage.jsx

const ForgePage = ({ frame, project, isPublicView = false, canEdit = true }) => {
    return (
        <div>
            {isPublicView && (
                <div className="fixed top-0 left-0 right-0 bg-yellow-100 p-2 text-center z-50">
                    👁️ Viewing public project (read-only) - 
                    <a href="/register" className="underline ml-2">Sign up to create your own</a>
                </div>
            )}
            
            {/* Canvas in read-only mode */}
            <Canvas 
                components={frame.components}
                readOnly={!canEdit}
                disableSelection={!canEdit}
                disableDrag={!canEdit}
            />
            
            {/* Properties panel - view only */}
            {isPublicView ? (
                <PropertiesPanel readOnly={true} />
            ) : (
                <PropertiesPanel readOnly={false} />
            )}
        </div>
    );
};

// resources/js/Pages/SourcePage.jsx

const SourcePage = ({ frame, project, isPublicView = false, canEdit = true }) => {
    return (
        <div>
            {isPublicView && (
                <div className="bg-purple-100 p-3 mb-3 rounded">
                    🔒 Public View - Code is read-only
                </div>
            )}
            
            <CodeEditor 
                code={generatedCode}
                readOnly={!canEdit}  // Disable editing
            />
            
            {!isPublicView && (
                <button onClick={saveCode}>Save Changes</button>
            )}
        </div>
    );
};
```

### **Step 5: Add Toggle in Project Settings**
```jsx
// Project Settings UI

<div className="flex items-center justify-between p-4 border rounded">
    <div>
        <h3 className="font-semibold">Public Access</h3>
        <p className="text-sm text-gray-600">
            Allow anyone with the link to view this project
        </p>
    </div>
    <Switch 
        checked={project.is_public}
        onChange={handleTogglePublic}
    />
</div>

{project.is_public && (
    <div className="mt-4 p-4 bg-blue-50 rounded">
        <h4 className="font-medium mb-2">Share Links:</h4>
        <div className="space-y-2">
            <div>
                <label className="text-xs text-gray-500">Project Overview:</label>
                <input 
                    value={`${window.location.origin}/public/${project.uuid}/void`}
                    readOnly
                    className="w-full p-2 border rounded bg-white"
                />
            </div>
            {frames.map(frame => (
                <div key={frame.uuid}>
                    <label className="text-xs text-gray-500">Frame: {frame.name}</label>
                    <input 
                        value={`${window.location.origin}/public/${project.uuid}/frame=${frame.uuid}/forge`}
                        readOnly
                        className="w-full p-2 border rounded bg-white"
                    />
                </div>
            ))}
        </div>
    </div>
)}
```

## 🎯 Benefits of This Approach:

✅ **Leverages Existing Field** - No new database columns needed!
✅ **Simple Toggle** - Project owner can make public/private anytime
✅ **Clear URLs** - `/public/` vs `/void/` makes access level obvious
✅ **SEO Friendly** - Public projects can be indexed by Google
✅ **Portfolio Ready** - Designers can share work without friction
✅ **No Token Management** - Simpler than share tokens
✅ **Workspace Privacy** - Private projects stay private
✅ **Role-Based Access** - Workspace viewers can access private projects

## ⚠️ Security Considerations:

1. **API Endpoints** - Must check `is_public` on all API routes
2. **Real-time Updates** - Disable WebSocket editing for public viewers
3. **Asset Access** - Ensure public projects can load assets
4. **Frame Locking** - Disable for public viewers
5. **Comments** - Decide if public viewers can comment (probably not)

## 🚀 Migration Needed:

**NONE!** The `is_public` field already exists! Just need to:
1. Default it to `false` for existing projects
2. Add the routes and middleware
3. Update frontend components

## 🎨 User Experience:

**For Project Owners:**
- Toggle "Make Public" in project settings
- Get shareable links automatically
- Can switch back to private anytime

**For Public Viewers:**
- No login required
- See designs and code
- Clear "read-only" indicators
- CTA to sign up and create their own

**For Workspace Viewers:**
- Must login
- Can access private projects in their workspace
- Full viewing capabilities
- No editing (unless editor role)

## 📊 Access Flow:

```
User visits /public/{uuid}/void
    ↓
Middleware checks: is_public = true?
    ↓
YES → Allow access (read-only)
NO  → Show 403: "Private project - login required"
    ↓
User can view but not edit
    ↓
CTA to sign up if they want to create projects
```

---

This approach is PERFECT for your use case! Want me to implement it?
