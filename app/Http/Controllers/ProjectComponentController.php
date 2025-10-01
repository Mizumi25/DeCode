<?php
// app/Http/Controllers/ProjectComponentController.php

namespace App\Http\Controllers;

use App\Models\ProjectComponent;
use App\Models\Revision;
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
          'components.*.position' => 'required|array',
          'components.*.position.x' => 'required|numeric',
          'components.*.position.y' => 'required|numeric',
          'components.*.name' => 'required|string',
          'components.*.z_index' => 'integer|min:0',
          'components.*.variant' => 'nullable|array',
          'components.*.style' => 'nullable|array',
          'components.*.animation' => 'nullable|array',
          'create_revision' => 'boolean'
      ]);
  
      DB::beginTransaction();
      
      try {
          $frame = \App\Models\Frame::where('uuid', $validated['frame_id'])->first();
          $project = \App\Models\Project::where('uuid', $validated['project_id'])->first();
          
          if (!$frame || !$project) {
              return response()->json([
                  'success' => false,
                  'message' => 'Frame or project not found'
              ], 404);
          }
  
          \Log::info('BulkUpdate: Starting save', [
              'project_id' => $project->id,
              'frame_id' => $frame->id,
              'component_count' => count($validated['components'])
          ]);
  
          // Clear existing components for this frame
          ProjectComponent::where('project_id', $project->id)
                         ->where('frame_id', $frame->id)
                         ->delete();
  
          // Use Collection instead of array
          $savedComponents = collect();
          
          foreach ($validated['components'] as $componentData) {
              $component = ProjectComponent::create([
                  'project_id' => $project->id,
                  'frame_id' => $frame->id,
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
              
              $savedComponents->push($component->load('component'));
          }
  
          \Log::info('BulkUpdate: Components created', [
              'saved_count' => $savedComponents->count(),
              'component_ids' => $savedComponents->pluck('component_instance_id')->toArray()
          ]);
  
          // Update frame canvas_data to match
          $frame->update([
              'canvas_data' => [
                  'components' => $savedComponents->map(function($comp) {
                      return [
                          'id' => $comp->component_instance_id,
                          'type' => $comp->component_type,
                          'props' => $comp->props,
                          'position' => $comp->position,
                          'name' => $comp->name,
                          'zIndex' => $comp->z_index,
                          'variant' => $comp->variant,
                          'style' => $comp->style ?? [],
                          'animation' => $comp->animation ?? [],
                          'children' => []
                      ];
                  })->toArray(),
                  'settings' => $frame->settings ?? [],
                  'version' => '1.0',
                  'updated_at' => now()->toISOString()
              ]
          ]);
  
          \Log::info('BulkUpdate: Frame canvas_data updated');
          
          // Create revision snapshot if requested
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
  
          \Log::info('BulkUpdate: Transaction committed successfully');
  
          return response()->json([
              'success' => true,
              'data' => $savedComponents,
              'message' => 'Components saved successfully',
              'debug' => [
                  'saved_count' => $savedComponents->count(),
                  'frame_updated' => true
              ]
          ]);
  
      } catch (\Exception $e) {
          DB::rollback();
          
          \Log::error('BulkUpdate: Save failed', [
              'error' => $e->getMessage(),
              'trace' => $e->getTraceAsString(),
              'project_id' => $validated['project_id'],
              'frame_id' => $validated['frame_id'],
              'component_count' => count($validated['components'])
          ]);
          
          return response()->json([
              'success' => false,
              'message' => 'Failed to save components: ' . $e->getMessage(),
              'error' => $e->getMessage()
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
  
      // Lookup by UUID
      $project = \App\Models\Project::where('uuid', $validated['project_id'])->first();
      if (!$project) {
          return response()->json(['success' => false, 'message' => 'Project not found'], 404);
      }
  
      $query = ProjectComponent::where('project_id', $project->id)
          ->with('component')
          ->ordered();
  
      if (isset($validated['frame_id'])) {
          $frame = \App\Models\Frame::where('uuid', $validated['frame_id'])->first();
          if ($frame) {
              $query->where('frame_id', $frame->id);
          }
      }
  
      $components = $query->get()->map(function($comp) {
          return [
              'id' => $comp->component_instance_id,
              'type' => $comp->component_type,
              'props' => $comp->props,
              'position' => $comp->position,
              'name' => $comp->name,
              'zIndex' => $comp->z_index,
              'variant' => $comp->variant,
              'style' => $comp->style ?? [],
              'animation' => $comp->animation ?? []
          ];
      });
  
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