<?php
// app/Http/Controllers/RevisionController.php

namespace App\Http\Controllers;

use App\Models\Revision;
use App\Models\Project;
use App\Models\Frame;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class RevisionController extends Controller
{
    public function getProjectRevisions(Project $project): JsonResponse
    {
        $revisions = Revision::byProject($project->id)
            ->with(['user:id,name,avatar', 'frame:uuid,name'])
            ->recent()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $revisions
        ]);
    }

    public function getFrameRevisions(Frame $frame): JsonResponse
    {
        $revisions = Revision::byFrame($frame->id)
            ->with(['user:id,name,avatar', 'project:uuid,name'])
            ->recent()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $revisions
        ]);
    }

    public function show(Revision $revision): JsonResponse
    {
        $revision->load(['user:id,name,avatar', 'project:uuid,name', 'frame:uuid,name']);

        return response()->json([
            'success' => true,
            'data' => $revision
        ]);
    }

    public function destroy(Revision $revision): JsonResponse
    {
        // Check if user can delete this revision
        if ($revision->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete this revision'
            ], 403);
        }

        $revision->delete();

        return response()->json([
            'success' => true,
            'message' => 'Revision deleted successfully'
        ]);
    }

    public function cleanupOld(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|string',
            'days_old' => 'integer|min:1|max:365',
            'keep_manual' => 'boolean'
        ]);

        $daysOld = $validated['days_old'] ?? 30;
        $keepManual = $validated['keep_manual'] ?? true;
        $cutoffDate = Carbon::now()->subDays($daysOld);

        $query = Revision::byProject($validated['project_id'])
            ->where('created_at', '<', $cutoffDate);

        if ($keepManual) {
            $query->where('revision_type', '!=', 'manual');
        }

        $deletedCount = $query->count();
        $query->delete();

        return response()->json([
            'success' => true,
            'message' => "Cleaned up {$deletedCount} old revisions",
            'deleted_count' => $deletedCount
        ]);
    }

    public function createAutoRevision(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|string',
            'frame_id' => 'required|string',
            'trigger' => 'required|string|in:component_count,time_based,major_change'
        ]);

        // Get current components from database
        $components = \App\Models\ProjectComponent::byProject($validated['project_id'])
            ->byFrame($validated['frame_id'])
            ->get()
            ->toArray();

        if (empty($components)) {
            return response()->json([
                'success' => false,
                'message' => 'No components to create revision from'
            ]);
        }

        // Check if we should create an auto revision based on trigger
        $shouldCreate = false;
        $title = '';

        switch ($validated['trigger']) {
            case 'component_count':
                // Create revision every 5 components
                if (count($components) % 5 === 0) {
                    $shouldCreate = true;
                    $title = "Auto-save: {" . count($components) . "} components";
                }
                break;

            case 'time_based':
                // Create revision if last one was > 10 minutes ago
                $lastRevision = Revision::byProject($validated['project_id'])
                    ->byFrame($validated['frame_id'])
                    ->recent()
                    ->first();

                if (!$lastRevision || $lastRevision->created_at->lt(Carbon::now()->subMinutes(10))) {
                    $shouldCreate = true;
                    $title = "Auto-save: Time-based checkpoint";
                }
                break;

            case 'major_change':
                // Create revision on major changes (you can define your own logic)
                $shouldCreate = true;
                $title = "Auto-save: Major changes detected";
                break;
        }

        if (!$shouldCreate) {
            return response()->json([
                'success' => false,
                'message' => 'Auto-revision not needed at this time'
            ]);
        }

        $revision = Revision::createSnapshot(
            $validated['project_id'],
            $validated['frame_id'],
            auth()->id(),
            $components,
            'auto',
            $title
        );

        return response()->json([
            'success' => true,
            'data' => $revision,
            'message' => 'Auto-revision created successfully'
        ]);
    }
}