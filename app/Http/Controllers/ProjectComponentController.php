<?php
// app/Http/Controllers/ProjectComponentController.php

namespace App\Http\Controllers;

use App\Models\ProjectComponent;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProjectComponentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|integer',
            'frame_id' => 'nullable|integer'
        ]);

        $query = ProjectComponent::byProject($validated['project_id'])
            ->with('component')
            ->ordered();

        if (isset($validated['frame_id'])) {
            $query->byFrame($validated['frame_id']);
        }

        $components = $query->get();

        return response()->json([
            'success' => true,
            'data' => $components
        ]);
    }

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
            'components' => 'required|array',
            'components.*.id' => 'required|integer|exists:project_components,id',
            'components.*.props' => 'array',
            'components.*.position' => 'array',
            'components.*.z_index' => 'integer|min:0'
        ]);

        foreach ($validated['components'] as $componentData) {
            ProjectComponent::find($componentData['id'])->update(
                collect($componentData)->except('id')->toArray()
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Components updated successfully'
        ]);
    }
}