<?php
// app/Http/Controllers/ProjectComponentController.php

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

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|integer',
            'frame_id' => 'nullable|integer',
            'component_instance_id' => 'required|string',
            'component_type' => 'required|string|exists:components,type',
            'props' => 'required|array',
            'position' => 'required|array',
            'position.x' => 'required|numeric',
            'position.y' => 'required|numeric',
            'name' => 'required|string',
            'z_index' => 'integer|min:0'
        ]);

        $component = ProjectComponent::create($validated);

        return response()->json([
            'success' => true,
            'data' => $component->load('component'),
            'message' => 'Component added to project successfully'
        ], 201);
    }

    public function update(Request $request, ProjectComponent $projectComponent): JsonResponse
    {
        $validated = $request->validate([
            'props' => 'array',
            'position' => 'array',
            'position.x' => 'numeric',
            'position.y' => 'numeric',
            'name' => 'string',
            'z_index' => 'integer|min:0',
            'is_locked' => 'boolean'
        ]);

        $projectComponent->update($validated);

        return response()->json([
            'success' => true,
            'data' => $projectComponent->load('component'),
            'message' => 'Component updated successfully'
        ]);
    }

    public function destroy(ProjectComponent $projectComponent): JsonResponse
    {
        $projectComponent->delete();

        return response()->json([
            'success' => true,
            'message' => 'Component removed from project successfully'
        ]);
    }

  
  public function bulkUpdate(Request $request): JsonResponse
  {
      $validated = $request->validate([
          'project_id' => 'required|string',
          'frame_id' => 'required|string',
          'components' => 'required|array',
          'components.*.component_instance_id' => 'required|string',
          'components.*.component_type' => 'required|string',
          'components.*.props' => 'array',
          'components.*.name' => 'required|string',
          'components.*.z_index' => 'integer|min:0',
          'components.*.parent_id' => 'nullable|integer',
          'components.*.sort_order' => 'integer',
          'components.*.variant' => 'nullable|array',
          'components.*.style' => 'nullable|array',
          'components.*.animation' => 'nullable|array',
          
          // NEW: Layout fields
          'components.*.display_type' => 'nullable|string',
          'components.*.layout_props' => 'nullable|array',
          'components.*.is_layout_container' => 'nullable|boolean',
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
  
          // Clear existing components for this frame
          ProjectComponent::where('project_id', $project->id)
                         ->where('frame_id', $frame->id)
                         ->delete();
  
          // Recursive function to save components with hierarchy
          $savedComponents = collect();
          
          $saveComponentTree = function($componentData, $parentDbId = null) use (&$saveComponentTree, &$savedComponents, $project, $frame) {
              $component = ProjectComponent::create([
                  'project_id' => $project->id,
                  'frame_id' => $frame->id,
                  'parent_id' => $parentDbId,
                  'component_instance_id' => $componentData['component_instance_id'],
                  'component_type' => $componentData['component_type'],
                  'props' => $componentData['props'] ?? [],
                  'name' => $componentData['name'],
                  'z_index' => $componentData['z_index'] ?? 0,
                  'sort_order' => $componentData['sort_order'] ?? 0,
                  'variant' => $componentData['variant'] ?? null,
                  'style' => $componentData['style'] ?? [],
                  'animation' => $componentData['animation'] ?? [],
                  
                  // NEW: Save layout properties
                  'display_type' => $componentData['style']['display'] ?? 'block',
                  'layout_props' => [
                      'flexDirection' => $componentData['style']['flexDirection'] ?? null,
                      'justifyContent' => $componentData['style']['justifyContent'] ?? null,
                      'alignItems' => $componentData['style']['alignItems'] ?? null,
                      'gap' => $componentData['style']['gap'] ?? null,
                      'gridTemplateColumns' => $componentData['style']['gridTemplateColumns'] ?? null,
                      'gridTemplateRows' => $componentData['style']['gridTemplateRows'] ?? null,
                      'padding' => $componentData['style']['padding'] ?? null,
                      'width' => $componentData['style']['width'] ?? null,
                      'minHeight' => $componentData['style']['minHeight'] ?? null,
                  ],
                  'is_layout_container' => $componentData['isLayoutContainer'] ?? false,
                  
                  // Keep position for backward compatibility during migration
                  'position' => ['x' => 0, 'y' => 0], // Deprecated but keep for now
              ]);
              
              $savedComponents->push($component->load('component'));
              
              // Recursively save children
              if (isset($componentData['children']) && is_array($componentData['children'])) {
                  foreach ($componentData['children'] as $childData) {
                      $saveComponentTree($childData, $component->id);
                  }
              }
              
              return $component;
          };
          
          // Save all root-level components
          foreach ($validated['components'] as $componentData) {
              if (!isset($componentData['parent_id'])) {
                  $saveComponentTree($componentData);
              }
          }
  
          \Log::info('BulkUpdate: Components saved with hierarchy', [
              'saved_count' => $savedComponents->count()
          ]);
  
          // Update frame canvas_data
          $frame->update([
              'canvas_data' => [
                  'components' => $savedComponents->map(function($comp) {
                      return [
                          'id' => $comp->component_instance_id,
                          'type' => $comp->component_type,
                          'props' => $comp->props,
                          'name' => $comp->name,
                          'zIndex' => $comp->z_index,
                          'variant' => $comp->variant,
                          'style' => $comp->style ?? [],
                          'animation' => $comp->animation ?? [],
                          'display_type' => $comp->display_type,
                          'layout_props' => $comp->layout_props,
                          'is_layout_container' => $comp->is_layout_container,
                          'children' => [] // Children are loaded separately
                      ];
                  })->toArray(),
                  'settings' => $frame->settings ?? [],
                  'version' => '2.0', // Increment version for new layout system
                  'updated_at' => now()->toISOString()
              ]
          ]);
  
          if ($validated['create_revision'] ?? false) {
              Revision::createSnapshot(
                  $project->id,
                  $frame->id,
                  auth()->id(),
                  $savedComponents->toArray(),
                  'auto'
              );
          }
  
          DB::commit();
  
          return response()->json([
              'success' => true,
              'data' => $savedComponents,
              'message' => 'Components saved with layout hierarchy'
          ]);
  
      } catch (\Exception $e) {
          DB::rollback();
          
          \Log::error('BulkUpdate failed', [
              'error' => $e->getMessage(),
              'trace' => $e->getTraceAsString()
          ]);
          
          return response()->json([
              'success' => false,
              'message' => 'Failed to save components: ' . $e->getMessage()
          ], 500);
      }
  }
  
  // ALSO ADD this method to load components properly:
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
          ->with(['component', 'children']) // Load children relationship
          ->whereNull('parent_id') // Only get root components
          ->ordered();
  
      if (isset($validated['frame_id'])) {
          $frame = Frame::where('uuid', $validated['frame_id'])->first();
          if ($frame) {
              $query->where('frame_id', $frame->id);
          }
      }
  
      // Recursive function to build component tree
      $buildTree = function($component) use (&$buildTree) {
          return [
              'id' => $component->component_instance_id,
              'type' => $component->component_type,
              'props' => $component->props,
              'name' => $component->name,
              'zIndex' => $component->z_index,
              'variant' => $component->variant,
              'style' => $component->style ?? [],
              'animation' => $component->animation ?? [],
              'display_type' => $component->display_type,
              'layout_props' => $component->layout_props,
              'isLayoutContainer' => $component->is_layout_container,
              'children' => $component->children->map($buildTree)->toArray()
          ];
      };
  
      $components = $query->get()->map($buildTree);
  
      return response()->json([
          'success' => true,
          'data' => $components
      ]);
  }
  
  // ADD: New methods for revision management
  public function createRevision(Request $request): JsonResponse
  {
      $validated = $request->validate([
          'project_id' => 'required|string',
          'frame_id' => 'required|string',
          'title' => 'required|string|max:255',
          'description' => 'nullable|string'
      ]);
  
      // Get current components
      $components = ProjectComponent::byProject($validated['project_id'])
                                   ->byFrame($validated['frame_id'])
                                   ->get()
                                   ->toArray();
  
      $revision = Revision::create([
          'project_id' => $validated['project_id'],
          'frame_id' => $validated['frame_id'],
          'user_id' => auth()->id(),
          'revision_type' => 'manual',
          'title' => $validated['title'],
          'description' => $validated['description'],
          'component_data' => $components,
          'metadata' => [
              'component_count' => count($components),
              'created_via' => 'manual_save'
          ]
      ]);
  
      return response()->json([
          'success' => true,
          'data' => $revision,
          'message' => 'Revision created successfully'
      ]);
  }
  
  public function restoreRevision(Request $request, Revision $revision): JsonResponse
  {
      DB::beginTransaction();
      
      try {
          // Clear current components
          ProjectComponent::where('project_id', $revision->project_id)
                         ->where('frame_id', $revision->frame_id)
                         ->delete();
  
          // Restore components from revision
          $restoredComponents = [];
          foreach ($revision->component_data as $componentData) {
              $component = ProjectComponent::create([
                  'project_id' => $revision->project_id,
                  'frame_id' => $revision->frame_id,
                  'component_instance_id' => $componentData['component_instance_id'],
                  'component_type' => $componentData['component_type'],
                  'props' => $componentData['props'] ?? [],
                  'position' => $componentData['position'],
                  'name' => $componentData['name'],
                  'z_index' => $componentData['z_index'] ?? 0,
                  'variant' => $componentData['variant'] ?? null,
                  'style' => $componentData['style'] ?? [],
                  'animation' => $componentData['animation'] ?? []
              ]);
              
              $restoredComponents[] = $component;
          }
  
          DB::commit();
  
          return response()->json([
              'success' => true,
              'data' => $restoredComponents,
              'message' => 'Revision restored successfully'
          ]);
  
      } catch (\Exception $e) {
          DB::rollback();
          return response()->json([
              'success' => false,
              'message' => 'Failed to restore revision: ' . $e->getMessage()
          ], 500);
      }
  }
}