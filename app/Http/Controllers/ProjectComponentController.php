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
private function saveComponentTreeWithTracking($componentData, $projectId, $frameId, $parentDbId = null, $depth = 0, &$savedComponentIds)
{
    if ($depth > 20) {
        \Log::warning('Max depth reached', ['component' => $componentData['id'] ?? 'unknown']);
        return null;
    }
    
    if (in_array($componentData['id'], $savedComponentIds)) {
        \Log::warning('Component already saved, skipping:', ['id' => $componentData['id']]);
        return null;
    }

    // 🔥 CRITICAL: Extract styles from variant FIRST
    $finalStyle = $this->extractVariantStyles($componentData);
    
    // 🔥 Handle text_content for text nodes
    $textContent = null;
    if ($componentData['type'] === 'text-node') {
        $textContent = $componentData['props']['content'] ?? $componentData['props']['text'] ?? '';
    }

    \Log::info('💾 Saving component:', [
        'id' => $componentData['id'],
        'type' => $componentData['type'],
        'has_variant' => isset($componentData['variant']),
        'variant_name' => $componentData['variant']['name'] ?? null,
        'final_style_keys' => array_keys($finalStyle),
    ]);

    $component = ProjectComponent::create([
        'project_id' => $projectId,
        'frame_id' => $frameId,
        'parent_id' => $parentDbId,
        'component_instance_id' => $componentData['id'],
        'component_type' => $componentData['type'],
        'props' => $componentData['props'] ?? [],
        'text_content' => $textContent,
        'name' => $componentData['name'],
        'z_index' => $componentData['zIndex'] ?? 0,
        'sort_order' => $componentData['sortOrder'] ?? 0,
        'variant' => $componentData['variant'] ?? null,
        'style' => $finalStyle, // 🔥 Use extracted + merged styles
        'animation' => $componentData['animation'] ?? [],
        'is_layout_container' => $componentData['isLayoutContainer'] ?? false,
        'visible' => $componentData['visible'] ?? true,
        'locked' => $componentData['locked'] ?? false,
    ]);
    
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


// 🔥 ADD this NEW method to extract variant styles
private function extractVariantStyles($componentData)
{
    $baseStyle = $componentData['style'] ?? [];
    $variant = $componentData['variant'] ?? null;
    
    // If no variant, return base style
    if (!$variant || !is_array($variant)) {
        return is_array($baseStyle) ? $baseStyle : [];
    }
    
    \Log::info('🎨 Extracting variant styles:', [
        'component' => $componentData['type'],
        'variant' => $variant['name'] ?? 'unknown',
        'has_variant_style' => isset($variant['style']),
    ]);
    
    // 🔥 PRIORITY: Variant styles override base styles
    $variantStyle = [];
    if (isset($variant['style']) && is_array($variant['style'])) {
        $variantStyle = $variant['style'];
        \Log::info('✅ Found variant.style:', array_keys($variantStyle));
    }
    
    // 🔥 Merge: base style + variant style (variant wins conflicts)
    $finalStyle = array_merge(
        is_array($baseStyle) ? $baseStyle : [],
        $variantStyle
    );
    
    \Log::info('✅ Final merged style:', [
        'keys' => array_keys($finalStyle),
        'sample' => array_slice($finalStyle, 0, 3)
    ]);
    
    return $finalStyle;
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


// ALSO UPDATE buildComponentTree to ensure styles are loaded correctly
private function buildComponentTree($components, $parentId = null)
{
    $tree = [];
    
    foreach ($components as $component) {
        if ($component->parent_id == $parentId) {
            $node = [
                'id' => $component->component_instance_id,
                'type' => $component->component_type,
                'props' => $component->props ?? [],
                'text_content' => $component->text_content,
                'name' => $component->name,
                'zIndex' => $component->z_index,
                'sortOrder' => $component->sort_order,
                'variant' => $component->variant,
                'style' => $component->style ?? [], // ✅ Ensure style is loaded
                'animation' => $component->animation ?? [],
                'display_type' => $component->display_type,
                'layout_props' => $component->layout_props,
                'isLayoutContainer' => $component->is_layout_container,
                'visible' => $component->visible ?? true,
                'locked' => $component->locked ?? false,
                'children' => $this->buildComponentTree($components, $component->id)
            ];
            
            // 🔥 Log what we're loading
            \Log::info('Loading component from DB:', [
                'id' => $node['id'],
                'type' => $node['type'],
                'style_keys' => array_keys($node['style']),
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