<?php

namespace App\Http\Controllers;

use App\Models\Frame;
use App\Models\FrameComponentAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FrameComponentAssignmentController extends Controller
{
    /**
     * Assign a component to a page
     */
    public function assign(Request $request)
    {
        $request->validate([
            'page_frame_uuid' => 'required|exists:frames,uuid',
            'component_frame_uuid' => 'required|exists:frames,uuid',
            'x' => 'nullable|integer',
            'y' => 'nullable|integer',
        ]);

        $pageFrame = Frame::where('uuid', $request->page_frame_uuid)->firstOrFail();
        $componentFrame = Frame::where('uuid', $request->component_frame_uuid)->firstOrFail();

        // Validate that pageFrame is actually a page and componentFrame is actually a component
        if ($pageFrame->type !== 'page') {
            return response()->json(['error' => 'Target frame must be a page type'], 422);
        }

        if ($componentFrame->type !== 'component') {
            return response()->json(['error' => 'Source frame must be a component type'], 422);
        }

        // Check if assignment already exists
        $existing = FrameComponentAssignment::where('page_frame_id', $pageFrame->id)
            ->where('component_frame_id', $componentFrame->id)
            ->first();

        if ($existing) {
            return response()->json(['error' => 'Component already assigned to this page'], 422);
        }

        // Get the next position (append to bottom)
        $maxPosition = FrameComponentAssignment::where('page_frame_id', $pageFrame->id)
            ->max('position') ?? -1;

        $assignment = FrameComponentAssignment::create([
            'page_frame_id' => $pageFrame->id,
            'component_frame_id' => $componentFrame->id,
            'position' => $maxPosition + 1,
            'x' => $request->x,
            'y' => $request->y,
        ]);

        return response()->json([
            'assignment' => $assignment->load(['pageFrame', 'componentFrame']),
            'message' => 'Component assigned successfully'
        ]);
    }

    /**
     * Unassign a component from a page
     */
    public function unassign(Request $request)
    {
        $request->validate([
            'page_frame_uuid' => 'required|exists:frames,uuid',
            'component_frame_uuid' => 'required|exists:frames,uuid',
        ]);

        $pageFrame = Frame::where('uuid', $request->page_frame_uuid)->firstOrFail();
        $componentFrame = Frame::where('uuid', $request->component_frame_uuid)->firstOrFail();

        $assignment = FrameComponentAssignment::where('page_frame_id', $pageFrame->id)
            ->where('component_frame_id', $componentFrame->id)
            ->first();

        if (!$assignment) {
            return response()->json(['error' => 'Assignment not found'], 404);
        }

        $assignment->delete();

        return response()->json(['message' => 'Component unassigned successfully']);
    }

    /**
     * Get all assignments for a project
     */
    public function index(Request $request, $projectUuid)
    {
        $project = \App\Models\Project::where('uuid', $projectUuid)->firstOrFail();

        $assignments = FrameComponentAssignment::whereHas('pageFrame', function ($query) use ($project) {
            $query->where('project_id', $project->id);
        })
        ->with(['pageFrame', 'componentFrame'])
        ->get();

        return response()->json($assignments);
    }

    /**
     * Update assignment position
     */
    public function updatePosition(Request $request, $assignmentId)
    {
        $request->validate([
            'x' => 'nullable|integer',
            'y' => 'nullable|integer',
            'position' => 'nullable|integer',
        ]);

        $assignment = FrameComponentAssignment::findOrFail($assignmentId);

        $assignment->update($request->only(['x', 'y', 'position']));

        return response()->json([
            'assignment' => $assignment->load(['pageFrame', 'componentFrame']),
            'message' => 'Position updated successfully'
        ]);
    }

    /**
     * 🔥 NEW: Get all assignments for a specific frame (page)
     * Returns all components linked to this page
     */
    public function getForFrame(Frame $frame)
    {
        // Get all assignments where this frame is the page
        $assignments = FrameComponentAssignment::where('page_frame_id', $frame->id)
            ->with([
                'pageFrame', 
                'componentFrame',
                'componentFrame.projectComponents' => function($query) {
                    // Get all components for the frame to use for thumbnail generation
                    $query->orderBy('z_index')->orderBy('created_at');
                }
            ])
            ->orderBy('position')
            ->get();

        return response()->json($assignments);
    }
}
