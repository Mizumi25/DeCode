<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\FrameContainer;
use App\Models\Frame;
use App\Models\Project;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Events\ContainerCreated;
use App\Events\ContainerUpdated;
use App\Events\ContainerDeleted;

class FrameContainerController extends Controller
{
    /**
     * Get all containers for a project
     */
    public function index(Project $project): JsonResponse
    {
        try {
            $containers = FrameContainer::where('project_id', $project->id)
                ->with(['frames' => function($query) {
                    $query->orderBy('container_order');
                }])
                ->orderBy('created_at')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $containers
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch containers', [
                'project_id' => $project->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch containers'
            ], 500);
        }
    }

    /**
     * Create a new container
     */
    public function store(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'x' => 'required|integer',
            'y' => 'required|integer',
            'width' => 'integer|min:200',
            'height' => 'integer|min:200',
            'orientation' => 'in:horizontal,vertical',
        ]);

        try {
            // Get next container number for naming
            $containerCount = FrameContainer::where('project_id', $project->id)->count();
            
            $container = FrameContainer::create([
                'project_id' => $project->id,
                'name' => 'Container ' . ($containerCount + 1),
                'x' => $validated['x'],
                'y' => $validated['y'],
                'width' => $validated['width'] ?? 800,
                'height' => $validated['height'] ?? 400,
                'orientation' => $validated['orientation'] ?? 'horizontal',
            ]);

            // Broadcast container creation
            broadcast(new ContainerCreated($container, $project->workspace_id))->toOthers();

            return response()->json([
                'success' => true,
                'data' => $container
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create container', [
                'project_id' => $project->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create container'
            ], 500);
        }
    }

    /**
     * Update container (name, position, size)
     */
    public function update(Request $request, FrameContainer $container): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'x' => 'integer',
            'y' => 'integer',
            'width' => 'integer|min:200',
            'height' => 'integer|min:200',
            'orientation' => 'in:horizontal,vertical',
        ]);

        try {
            $container->update($validated);

            // Broadcast container update
            $project = $container->project;
            broadcast(new ContainerUpdated($container->fresh(), $project->workspace_id))->toOthers();

            return response()->json([
                'success' => true,
                'data' => $container
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update container', [
                'container_id' => $container->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update container'
            ], 500);
        }
    }

    /**
     * Delete container (frames become loose)
     */
    public function destroy(FrameContainer $container): JsonResponse
    {
        try {
            // Remove frames from container (don't delete them)
            Frame::where('container_id', $container->id)->update([
                'container_id' => null,
                'container_order' => null
            ]);

            $containerUuid = $container->uuid;
            $workspaceId = $container->project->workspace_id;
            
            $container->delete();

            // Broadcast container deletion
            broadcast(new ContainerDeleted($containerUuid, $workspaceId))->toOthers();

            return response()->json([
                'success' => true,
                'message' => 'Container deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete container', [
                'container_id' => $container->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete container'
            ], 500);
        }
    }

    /**
     * Add frame to container
     */
    public function addFrame(FrameContainer $container, Frame $frame, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order' => 'integer|min:0',
        ]);

        try {
            // Get next order if not specified
            $order = $validated['order'] ?? Frame::where('container_id', $container->id)->max('container_order') + 1;

            $frame->update([
                'container_id' => $container->id,
                'container_order' => $order,
            ]);

            return response()->json([
                'success' => true,
                'data' => $frame->load('container')
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to add frame to container', [
                'container_id' => $container->id,
                'frame_id' => $frame->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to add frame to container'
            ], 500);
        }
    }

    /**
     * Remove frame from container
     */
    public function removeFrame(Frame $frame): JsonResponse
    {
        try {
            $frame->update([
                'container_id' => null,
                'container_order' => null,
            ]);

            return response()->json([
                'success' => true,
                'data' => $frame
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to remove frame from container', [
                'frame_id' => $frame->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to remove frame from container'
            ], 500);
        }
    }

    /**
     * Reorder frames in container
     */
    public function reorderFrames(FrameContainer $container, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'frame_orders' => 'required|array',
            'frame_orders.*.uuid' => 'required|string',
            'frame_orders.*.order' => 'required|integer',
        ]);

        try {
            foreach ($validated['frame_orders'] as $frameData) {
                Frame::where('uuid', $frameData['uuid'])
                    ->where('container_id', $container->id)
                    ->update(['container_order' => $frameData['order']]);
            }

            $container->load(['frames' => function($query) {
                $query->orderBy('container_order');
            }]);

            return response()->json([
                'success' => true,
                'data' => $container
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to reorder frames', [
                'container_id' => $container->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to reorder frames'
            ], 500);
        }
    }
}
