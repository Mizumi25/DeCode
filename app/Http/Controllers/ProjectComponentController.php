<?php
// app/Http/Controllers/ProjectComponentController.php - ENHANCED with Recursive Support

namespace App\Http\Controllers;

use App\Models\ProjectComponent;
use App\Models\Revision;
use App\Models\Project;
use App\Models\Frame;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProjectComponentController extends Controller
{
    /**
     * Recursively build component tree from flat database records
     */


// REPLACE the saveComponentTreeWithTracking method (around line 180)
private function saveComponentTreeWithTracking($componentData, $projectId, $frameId, &$savedComponentIds, $parentDbId = null, $depth = 0, &$instanceIdToDbIdMap = [])
{
    if ($depth > 20) {
        \Log::warning('Max depth reached', ['component' => $componentData['id'] ?? 'unknown']);
        return null;
    }
    
    if (in_array($componentData['id'], $savedComponentIds)) {
        \Log::warning('Component already saved, skipping:', ['id' => $componentData['id']]);
        return null;
    }

    // Get the style (already merged in frontend if variant was selected)
    $finalStyle = $componentData['style'] ?? [];
    
    // 🔥 Handle text_content for text nodes
    $textContent = null;
    if ($componentData['type'] === 'text-node') {
        $textContent = $componentData['props']['content'] ?? $componentData['props']['text'] ?? '';
    }

    // 🔥 CRITICAL FIX: If component has parentId, resolve it using our mapping
    $resolvedParentDbId = $parentDbId;
    if (isset($componentData['parentId']) && $componentData['parentId']) {
        // First check our instance ID to DB ID mapping (for components saved in this batch)
        if (isset($instanceIdToDbIdMap[$componentData['parentId']])) {
            $resolvedParentDbId = $instanceIdToDbIdMap[$componentData['parentId']];
            \Log::info('🔗 Resolved parentId from mapping:', [
                'component_id' => $componentData['id'],
                'parentId' => $componentData['parentId'],
                'parent_db_id' => $resolvedParentDbId
            ]);
        } else {
            // Fallback: try to find in database (for existing components)
            $parentComponent = ProjectComponent::where('project_id', $projectId)
                ->where('frame_id', $frameId)
                ->where('component_instance_id', $componentData['parentId'])
                ->first();
            
            if ($parentComponent) {
                $resolvedParentDbId = $parentComponent->id;
                \Log::info('🔗 Resolved parentId from database:', [
                    'component_id' => $componentData['id'],
                    'parentId' => $componentData['parentId'],
                    'parent_db_id' => $resolvedParentDbId
                ]);
            } else {
                \Log::warning('⚠️ Parent component not found:', [
                    'component_id' => $componentData['id'],
                    'parentId' => $componentData['parentId']
                ]);
            }
        }
    }

    \Log::info('💾 Saving component:', [
        'id' => $componentData['id'],
        'type' => $componentData['type'],
        'parentId' => $componentData['parentId'] ?? null,
        'resolved_parent_db_id' => $resolvedParentDbId,
        'final_style_keys' => array_keys($finalStyle),
    ]);

    // 🔥 DEBUG: Log responsive styles
    if (!empty($componentData['style_mobile']) || !empty($componentData['style_tablet']) || !empty($componentData['style_desktop'])) {
        \Log::info('📱 Saving component with responsive styles', [
            'id' => $componentData['id'],
            'name' => $componentData['name'],
            'style_mobile' => $componentData['style_mobile'] ?? null,
            'style_tablet' => $componentData['style_tablet'] ?? null,
            'style_desktop' => $componentData['style_desktop'] ?? null,
        ]);
    }
    
    $component = ProjectComponent::create([
        'project_id' => $projectId,
        'frame_id' => $frameId,
        'parent_id' => $resolvedParentDbId,  // 🔥 FIX: Use resolved parent DB ID
        'component_instance_id' => $componentData['id'],
        'component_type' => $componentData['component_type'] ?? $componentData['type'], // 🔥 Use component_type if exists
        'props' => $componentData['props'] ?? [],
        'text_content' => $textContent,
        'name' => $componentData['name'],
        'z_index' => $componentData['zIndex'] ?? 0,
        'sort_order' => $componentData['sortOrder'] ?? 0,
        'style' => $finalStyle,
        'style_mobile' => $componentData['style_mobile'] ?? [],     // 🔥 RESPONSIVE: Default to empty array not null
        'style_tablet' => $componentData['style_tablet'] ?? [],     // 🔥 RESPONSIVE: Default to empty array not null
        'style_desktop' => $componentData['style_desktop'] ?? [],   // 🔥 RESPONSIVE: Default to empty array not null
        'animation' => $componentData['animation'] ?? [],
        'is_layout_container' => $componentData['isLayoutContainer'] ?? false,
        'visible' => $componentData['visible'] ?? true,
        'locked' => $componentData['locked'] ?? false,
    ]);
    
    // 🔥 FIX: Store the mapping of instance ID to database ID
    $instanceIdToDbIdMap[$componentData['id']] = $component->id;
    
    $savedComponentIds[] = $componentData['id'];

    // Recursively save children
    if (isset($componentData['children']) && is_array($componentData['children'])) {
        foreach ($componentData['children'] as $childData) {
            $this->saveComponentTreeWithTracking(
                $childData, 
                $projectId, 
                $frameId,
                $savedComponentIds,
                $component->id, 
                $depth + 1,
                $instanceIdToDbIdMap  // 🔥 Pass the mapping to children
            );
        }
    }

    return $component;
}


// ADD this NEW helper method
private function normalizeStyleData($componentData)
{
    $style = $componentData['style'] ?? [];
    $props = $componentData['props'] ?? [];
    
    // 🔥 List of properties that should ALWAYS be in style, not props
    $styleProperties = [
        // Display & Positioning
        'display', 'position', 'top', 'right', 'bottom', 'left', 'zIndex',
        
        // Flexbox & Grid
        'flexDirection', 'justifyContent', 'alignItems', 'alignContent', 
        'gap', 'rowGap', 'columnGap', 'flex', 'flexGrow', 'flexShrink', 'flexBasis',
        'gridTemplateColumns', 'gridTemplateRows', 'gridColumn', 'gridRow',
        
        // Size
        'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
        
        // Spacing
        'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
        
        // Background
        'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition',
        'backgroundRepeat', 'background',
        
        // Border
        'border', 'borderWidth', 'borderStyle', 'borderColor', 'borderRadius',
        'borderTop', 'borderRight', 'borderBottom', 'borderLeft',
        
        // Typography
        'color', 'fontSize', 'fontWeight', 'fontFamily', 'lineHeight', 'letterSpacing',
        'textAlign', 'textDecoration', 'textTransform',
        
        // Visual Effects
        'boxShadow', 'opacity', 'transform', 'transition', 'filter', 'backdropFilter',
        
        // Overflow & Visibility
        'overflow', 'overflowX', 'overflowY', 'visibility',
        
        // Cursor & Interaction
        'cursor', 'pointerEvents', 'userSelect',
    ];
    
    // 🔥 Check props for any style properties and move them to style
    foreach ($styleProperties as $prop) {
        if (isset($props[$prop])) {
            \Log::info("Moving {$prop} from props to style:", ['value' => $props[$prop]]);
            $style[$prop] = $props[$prop];
        }
    }
    
    // 🔥 Ensure style is always an array (not null)
    return is_array($style) ? $style : [];
}


  // ALSO UPDATE buildComponentTree to ensure styles are loaded correctly AND parent relationships
  private function buildComponentTree($components, $parentId = null)
  {
      $tree = [];
      
      foreach ($components as $component) {
          if ($component->parent_id == $parentId) {
              // 🔥 FIX: Find parent's component_instance_id for frontend
              $parentInstanceId = null;
              if ($component->parent_id) {
                  $parentComponent = $components->firstWhere('id', $component->parent_id);
                  $parentInstanceId = $parentComponent?->component_instance_id;
              }
              
              $node = [
                  'id' => $component->component_instance_id,
                  'type' => $component->component_type,
                  'props' => $component->props ?? [],
                  'text_content' => $component->text_content,
                  'name' => $component->name,
                  'zIndex' => $component->z_index,
                  'sortOrder' => $component->sort_order,
                  'style' => $component->style ?? [], // ✅ Base styles
                  'style_mobile' => $component->style_mobile ?? null, // 🔥 RESPONSIVE
                  'style_tablet' => $component->style_tablet ?? null, // 🔥 RESPONSIVE
                  'style_desktop' => $component->style_desktop ?? null, // 🔥 RESPONSIVE
                  'animation' => $component->animation ?? [],
                  'display_type' => $component->display_type,
                  'layout_props' => $component->layout_props,
                  'isLayoutContainer' => $component->is_layout_container,
                  'visible' => $component->visible ?? true,
                  'locked' => $component->locked ?? false,
                  'parentId' => $parentInstanceId, // 🔥 FIX: Use the actual parent's component_instance_id
                  'children' => $this->buildComponentTree($components, $component->id)
              ];
              
              // 🔥 Log what we're loading
              \Log::info('Loading component from DB:', [
                  'id' => $node['id'],
                  'type' => $node['type'],
                  'parentId' => $node['parentId'],
                  'parent_db_id' => $component->parent_id,
                  'isNested' => !!$node['parentId'],
                  'has_children' => count($node['children']) > 0,
              ]);
              
              $tree[] = $node;
          }
      }
      
      usort($tree, function($a, $b) {
          return ($a['sortOrder'] ?? 0) - ($b['sortOrder'] ?? 0);
      });
      
      return $tree;
  }

    /**
     * Get components with full hierarchy
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|string',
            'frame_id' => 'nullable|string'
        ]);

        $project = Project::where('uuid', $validated['project_id'])->first();
        if (!$project) {
            return response()->json(['success' => false, 'message' => 'Project not found'], 404);
        }

        $query = ProjectComponent::where('project_id', $project->id)
            ->with('component');

        if (isset($validated['frame_id'])) {
            $frame = Frame::where('uuid', $validated['frame_id'])->first();
            if ($frame) {
                $query->where('frame_id', $frame->id);
            }
        }

        $components = $query->orderBy('sort_order')->get();
        
        // Build hierarchical tree
        $tree = $this->buildComponentTree($components);

        return response()->json([
            'success' => true,
            'data' => $tree,
            'meta' => [
                'total_components' => $components->count(),
                'max_depth' => $this->calculateMaxDepth($tree)
            ]
        ]);
    }

    /**
     * Calculate maximum nesting depth
     */
    private function calculateMaxDepth($tree, $currentDepth = 0)
    {
        $maxDepth = $currentDepth;
        
        foreach ($tree as $node) {
            if (isset($node['children']) && count($node['children']) > 0) {
                $childDepth = $this->calculateMaxDepth($node['children'], $currentDepth + 1);
                $maxDepth = max($maxDepth, $childDepth);
            }
        }
        
        return $maxDepth;
    }

    /**
     * Store a new component
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|integer',
            'frame_id' => 'required|integer',
            'component_instance_id' => 'required|string',
            'component_type' => 'required|string',
            'parent_id' => 'nullable|integer',
            'props' => 'nullable|array',
            'text_content' => 'nullable|string',
            'name' => 'required|string',
            'style' => 'nullable|array',
            'animation' => 'nullable|array',
            'z_index' => 'nullable|integer',
            'sort_order' => 'nullable|integer',
            'visible' => 'nullable|boolean',
            'locked' => 'nullable|boolean',
        ]);

        try {
            $component = ProjectComponent::create([
                'project_id' => $validated['project_id'],
                'frame_id' => $validated['frame_id'],
                'parent_id' => $validated['parent_id'] ?? null,
                'component_instance_id' => $validated['component_instance_id'],
                'component_type' => $validated['component_type'],
                'props' => $validated['props'] ?? [],
                'text_content' => $validated['text_content'] ?? null,
                'name' => $validated['name'],
                'style' => $validated['style'] ?? [],
                'animation' => $validated['animation'] ?? [],
                'z_index' => $validated['z_index'] ?? 0,
                'sort_order' => $validated['sort_order'] ?? 0,
                'visible' => $validated['visible'] ?? true,
                'locked' => $validated['locked'] ?? false,
            ]);

            return response()->json([
                'success' => true,
                'data' => $component,
                'message' => 'Component created successfully'
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Error creating component:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create component: ' . $e->getMessage()
            ], 500);
        }
    }

  
    
    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|string',
            'frame_id' => 'required|string',
            'components' => 'required|array',
            'silent' => 'boolean',
            'components.*.id' => 'required|string',
            'components.*.type' => 'required|string',
            'components.*.component_type' => 'nullable|string', // 🔥 NEW: Allow component_type for frame-component-instance
            'components.*.props' => 'nullable|array',
            'components.*.name' => 'required|string',
            'components.*.zIndex' => 'nullable|integer',
            'components.*.sortOrder' => 'nullable|integer',
            'components.*.variant' => 'nullable|array',
            'components.*.style' => 'nullable|array',
            'components.*.style_mobile' => 'nullable|array',
            'components.*.style_tablet' => 'nullable|array',
            'components.*.style_desktop' => 'nullable|array',
            'components.*.animation' => 'nullable|array',
            'components.*.isLayoutContainer' => 'nullable|boolean',
            'components.*.parentId' => 'nullable|string',  // 🔥 FIX: Accept parentId from frontend
            'components.*.children' => 'nullable|array',
            'create_revision' => 'boolean'
        ]);
    

    DB::beginTransaction();
    
    try {
        $frame = Frame::where('uuid', $validated['frame_id'])->first();
        $project = Project::where('uuid', $validated['project_id'])->first();
        
        if (!$frame || !$project) {
            return response()->json([
                'success' => false,
                'message' => 'Frame or project not found'
            ], 404);
        }

        // Delete existing components
        ProjectComponent::where('project_id', $project->id)
                       ->where('frame_id', $frame->id)
                       ->delete();

        // 🔥 DEBUG: Log what we received
        \Log::info('📥 Received components for save:', [
            'total' => count($validated['components']),
            'components' => array_map(function($c) {
                return [
                    'id' => $c['id'],
                    'name' => $c['name'],
                    'parentId' => $c['parentId'] ?? null,
                    'has_children' => isset($c['children']) && count($c['children']) > 0
                ];
            }, $validated['components'])
        ]);

        $savedComponentIds = [];
        // 🔥 FIX: Map component_instance_id to database ID during save
        $instanceIdToDbIdMap = [];
        
        foreach ($validated['components'] as $componentData) {
            if (in_array($componentData['id'], $savedComponentIds)) {
                continue;
            }
            
            $this->saveComponentTreeWithTracking(
                $componentData, 
                $project->id, 
                $frame->id,
                $savedComponentIds,
                null,
                0,
                $instanceIdToDbIdMap  // 🔥 Pass the mapping
            );
        }

        DB::commit();

        // 🔥 ENHANCED: Broadcast specific component updates for real-time collaboration
        if (!($validated['silent'] ?? false)) {
            // Broadcast frame-level update
            event(new \App\Events\FrameUpdated(
                $frame->uuid,
                auth()->id(),
                [
                    'action' => 'bulk_update',
                    'component_count' => count($savedComponentIds),
                    'updated_at' => now()->toISOString(),
                    'user_name' => auth()->user()->name,
                    'session_id' => request()->input('session_id', 'unknown'),
                ],
                'bulk_update'
            ));

            // 🔥 NEW: Broadcast individual component updates for real-time sync
            foreach ($validated['components'] as $componentData) {
                event(new \App\Events\ComponentUpdated(
                    $frame->uuid,
                    auth()->id(),
                    request()->input('session_id', 'unknown'),
                    $componentData['id'],
                    [
                        'style' => $componentData['style'] ?? [],
                        'style_mobile' => $componentData['style_mobile'] ?? null,  // 🔥 RESPONSIVE
                        'style_tablet' => $componentData['style_tablet'] ?? null,  // 🔥 RESPONSIVE
                        'style_desktop' => $componentData['style_desktop'] ?? null, // 🔥 RESPONSIVE
                        'props' => $componentData['props'] ?? [],
                        'text_content' => $componentData['text_content'] ?? null,
                        'position' => [
                            'x' => $componentData['style']['left'] ?? 0,
                            'y' => $componentData['style']['top'] ?? 0
                        ],
                        'parentId' => $componentData['parentId'] ?? null,
                        'component_type' => $componentData['type'] ?? 'unknown',
                    ],
                    'bulk_update'
                ));
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Components saved successfully',
            'saved_count' => count($savedComponentIds),
            'silent' => $validated['silent'] ?? false
        ]);

    } catch (\Exception $e) {
        DB::rollback();
        
        \Log::error('BulkUpdate failed:', [
            'error' => $e->getMessage(),
            'line' => $e->getLine(),
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to save: ' . $e->getMessage()
        ], 500);
    }
}







    
    private function saveComponentTree($componentData, $projectId, $frameId, $parentDbId = null, $depth = 0)
    {
        if ($depth > 20) {
            \Log::warning('Max depth reached', ['component' => $componentData['id'] ?? 'unknown']);
            return null;
        }
    
        // CRITICAL: Map frontend field names to backend
        $component = ProjectComponent::create([
            'project_id' => $projectId,
            'frame_id' => $frameId,
            'parent_id' => $parentDbId,
            'component_instance_id' => $componentData['id'],              // id → component_instance_id
            'component_type' => $componentData['type'],                    // type → component_type
            'props' => $componentData['props'] ?? [],
            'name' => $componentData['name'],
            'z_index' => $componentData['zIndex'] ?? 0,
            'sort_order' => $componentData['sortOrder'] ?? 0,
            'variant' => $componentData['variant'] ?? null,
            'style' => $componentData['style'] ?? [],
            'style_mobile' => $componentData['style_mobile'] ?? [],     // 🔥 RESPONSIVE: Default to empty array
            'style_tablet' => $componentData['style_tablet'] ?? [],     // 🔥 RESPONSIVE: Default to empty array
            'style_desktop' => $componentData['style_desktop'] ?? [],   // 🔥 RESPONSIVE: Default to empty array
            'animation' => $componentData['animation'] ?? [],
            'is_layout_container' => $componentData['isLayoutContainer'] ?? false,
            'visible' => $componentData['visible'] ?? true,
            'locked' => $componentData['locked'] ?? false,
        ]);
    
        // Recursively save children
        if (isset($componentData['children']) && is_array($componentData['children'])) {
            foreach ($componentData['children'] as $childData) {
                $this->saveComponentTree($childData, $projectId, $frameId, $component->id, $depth + 1);
            }
        }
    
        return $component;
    }

    /**
     * Move component to different parent (change nesting)
     */
    public function moveComponent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|string',
            'frame_id' => 'required|string',
            'component_id' => 'required|string',
            'new_parent_id' => 'nullable|string',
            'new_index' => 'integer|min:0'
        ]);

        DB::beginTransaction();
        
        try {
            $project = Project::where('uuid', $validated['project_id'])->first();
            $frame = Frame::where('uuid', $validated['frame_id'])->first();
            
            $component = ProjectComponent::where('project_id', $project->id)
                ->where('frame_id', $frame->id)
                ->where('component_instance_id', $validated['component_id'])
                ->first();

            if (!$component) {
                return response()->json(['success' => false, 'message' => 'Component not found'], 404);
            }

            // Get new parent's database ID if provided
            $newParentDbId = null;
            if ($validated['new_parent_id']) {
                $newParent = ProjectComponent::where('project_id', $project->id)
                    ->where('frame_id', $frame->id)
                    ->where('component_instance_id', $validated['new_parent_id'])
                    ->first();
                    
                if ($newParent) {
                    $newParentDbId = $newParent->id;
                }
            }

            // Update component's parent
            $component->update([
                'parent_id' => $newParentDbId,
                'sort_order' => $validated['new_index']
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Component moved successfully',
                'data' => $component
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to move component: ' . $e->getMessage()
            ], 500);
        }
    }
}