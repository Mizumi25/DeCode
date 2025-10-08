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
    private function buildComponentTree($components, $parentId = null)
    {
        $tree = [];
        
        foreach ($components as $component) {
            if ($component->parent_id == $parentId) {
                $node = [
                    'id' => $component->component_instance_id,
                    'type' => $component->component_type,
                    'props' => $component->props,
                    'name' => $component->name,
                    'zIndex' => $component->z_index,
                    'sortOrder' => $component->sort_order,
                    'variant' => $component->variant,
                    'style' => $component->style ?? [],
                    'animation' => $component->animation ?? [],
                    'display_type' => $component->display_type,
                    'layout_props' => $component->layout_props,
                    'isLayoutContainer' => $component->is_layout_container,
                    'visible' => $component->visible ?? true,
                    'locked' => $component->locked ?? false,
                    'children' => $this->buildComponentTree($components, $component->id)
                ];
                
                $tree[] = $node;
            }
        }
        
        // Sort by sort_order
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

  
    
    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|string',
            'frame_id' => 'required|string',
            'components' => 'required|array',
            'components.*.id' => 'required|string',
            'components.*.type' => 'required|string',
            'components.*.props' => 'nullable|array',
            'components.*.name' => 'required|string',
            'components.*.zIndex' => 'nullable|integer',
            'components.*.sortOrder' => 'nullable|integer',
            'components.*.variant' => 'nullable|array',
            'components.*.style' => 'nullable|array',
            'components.*.animation' => 'nullable|array',
            'components.*.isLayoutContainer' => 'nullable|boolean',
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
    
            // CRITICAL FIX: Delete existing components FIRST
            ProjectComponent::where('project_id', $project->id)
                           ->where('frame_id', $frame->id)
                           ->delete();
    
            // CRITICAL FIX: Track saved component IDs to prevent duplicates
            $savedComponentIds = [];
            
            // Save components recursively (only root-level components)
            foreach ($validated['components'] as $componentData) {
                // CRITICAL: Skip if already saved (prevents duplicates)
                if (in_array($componentData['id'], $savedComponentIds)) {
                    \Log::warning('Skipping duplicate component:', ['id' => $componentData['id']]);
                    continue;
                }
                
                $this->saveComponentTreeWithTracking(
                    $componentData, 
                    $project->id, 
                    $frame->id,
                    null, // no parent for root components
                    0,    // depth 0
                    $savedComponentIds
                );
            }
    
            DB::commit();
    
            return response()->json([
                'success' => true,
                'message' => 'Components saved successfully',
                'saved_count' => count($savedComponentIds)
            ]);
    
        } catch (\Exception $e) {
            DB::rollback();
            
            \Log::error('BulkUpdate failed:', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to save: ' . $e->getMessage()
            ], 500);
        }
    }
    
    // CRITICAL: New method with duplicate tracking
    private function saveComponentTreeWithTracking($componentData, $projectId, $frameId, $parentDbId = null, $depth = 0, &$savedComponentIds)
    {
        if ($depth > 20) {
            \Log::warning('Max depth reached', ['component' => $componentData['id'] ?? 'unknown']);
            return null;
        }
        
        // CRITICAL: Check if already saved
        if (in_array($componentData['id'], $savedComponentIds)) {
            \Log::warning('Component already saved, skipping:', ['id' => $componentData['id']]);
            return null;
        }
    
        // CRITICAL: Create component
        $component = ProjectComponent::create([
            'project_id' => $projectId,
            'frame_id' => $frameId,
            'parent_id' => $parentDbId,
            'component_instance_id' => $componentData['id'],
            'component_type' => $componentData['type'],
            'props' => $componentData['props'] ?? [],
            'name' => $componentData['name'],
            'z_index' => $componentData['zIndex'] ?? 0,
            'sort_order' => $componentData['sortOrder'] ?? 0,
            'variant' => $componentData['variant'] ?? null,
            'style' => $componentData['style'] ?? [],
            'animation' => $componentData['animation'] ?? [],
            'is_layout_container' => $componentData['isLayoutContainer'] ?? false,
            'visible' => $componentData['visible'] ?? true,
            'locked' => $componentData['locked'] ?? false,
        ]);
        
        // CRITICAL: Mark as saved
        $savedComponentIds[] = $componentData['id'];
    
        // Recursively save children
        if (isset($componentData['children']) && is_array($componentData['children'])) {
            foreach ($componentData['children'] as $childData) {
                $this->saveComponentTreeWithTracking(
                    $childData, 
                    $projectId, 
                    $frameId, 
                    $component->id, 
                    $depth + 1,
                    $savedComponentIds
                );
            }
        }
    
        return $component;
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