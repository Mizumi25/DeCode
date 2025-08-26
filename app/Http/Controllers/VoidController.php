<?php

namespace App\Http\Controllers;

use App\Models\Frame;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class VoidController extends Controller
{
    /**
     * Display a listing of frames for a project.
     */
    public function index(Request $request): JsonResponse
    {
        $projectId = $request->get('project_id');
        
        $query = Frame::query();
        
        if ($projectId) {
            $query->where('project_id', $projectId);
        }
        
        $frames = $query->with('project')
                       ->orderBy('created_at', 'desc')
                       ->get();

        return response()->json([
            'frames' => $frames,
            'total' => $frames->count()
        ]);
    }

    /**
     * Store a newly created frame.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'name' => 'required|string|max:255',
            'type' => ['required', Rule::in(['page', 'component'])],
            'canvas_data' => 'nullable|array',
            'settings' => 'nullable|array',
        ]);

        // Ensure user owns the project
        $project = Project::where('id', $validated['project_id'])
                         ->where('user_id', auth()->id())
                         ->firstOrFail();

        // Create default canvas_data if not provided
        if (!isset($validated['canvas_data'])) {
            $validated['canvas_data'] = $this->getDefaultCanvasData($validated['type']);
        }

        // Create default settings if not provided
        if (!isset($validated['settings'])) {
            $validated['settings'] = $this->getDefaultSettings();
        }

        $frame = Frame::create($validated);

        // Load the frame with its project relationship
        $frame->load('project');

        return response()->json([
            'message' => 'Frame created successfully',
            'frame' => $frame
        ], 201);
    }

    /**
     * Display the specified frame.
     */
    public function show(Frame $frame): JsonResponse
    {
        // Ensure user owns the project that contains this frame
        if ($frame->project->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $frame->load('project');

        return response()->json(['frame' => $frame]);
    }

    /**
     * Update the specified frame.
     */
    public function update(Request $request, Frame $frame): JsonResponse
    {
        // Ensure user owns the project that contains this frame
        if ($frame->project->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => ['sometimes', Rule::in(['page', 'component'])],
            'canvas_data' => 'sometimes|array',
            'settings' => 'sometimes|array',
        ]);

        $frame->update($validated);
        $frame->load('project');

        return response()->json([
            'message' => 'Frame updated successfully',
            'frame' => $frame
        ]);
    }

    /**
     * Remove the specified frame.
     */
    public function destroy(Frame $frame): JsonResponse
    {
        // Ensure user owns the project that contains this frame
        if ($frame->project->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $frame->delete();

        return response()->json([
            'message' => 'Frame deleted successfully'
        ]);
    }

    /**
     * Duplicate a frame.
     */
    public function duplicate(Request $request, Frame $frame): JsonResponse
    {
        // Ensure user owns the project that contains this frame
        if ($frame->project->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
        ]);

        $newFrame = $frame->replicate();
        $newFrame->name = $validated['name'] ?? ($frame->name . ' (Copy)');
        $newFrame->save();

        $newFrame->load('project');

        return response()->json([
            'message' => 'Frame duplicated successfully',
            'frame' => $newFrame
        ], 201);
    }

    /**
     * Update frame position in the void.
     */
    public function updatePosition(Request $request, Frame $frame): JsonResponse
    {
        // Ensure user owns the project that contains this frame
        if ($frame->project->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'x' => 'required|numeric',
            'y' => 'required|numeric',
        ]);

        // Update the canvas_data with new position
        $canvasData = $frame->canvas_data ?? [];
        $canvasData['position'] = [
            'x' => $validated['x'],
            'y' => $validated['y']
        ];

        $frame->update(['canvas_data' => $canvasData]);

        return response()->json([
            'message' => 'Frame position updated successfully',
            'frame' => $frame
        ]);
    }

    /**
     * Get frames by project UUID (for void page).
     */
    public function getByProject(string $projectUuid): JsonResponse
    {
        $project = Project::where('uuid', $projectUuid)
                         ->where('user_id', auth()->id())
                         ->firstOrFail();

        $frames = Frame::where('project_id', $project->id)
                      ->orderBy('created_at', 'desc')
                      ->get();

        return response()->json([
            'frames' => $frames,
            'total' => $frames->count()
        ]);
    }

    /**
     * Generate default canvas data based on frame type.
     */
    private function getDefaultCanvasData(string $type): array
    {
        $baseData = [
            'template' => 'blank',
            'device' => 'desktop',
            'viewport' => [
                'width' => 1440,
                'height' => 900
            ],
            'elements' => [],
            'position' => [
                'x' => rand(100, 800),
                'y' => rand(100, 600)
            ]
        ];

        if ($type === 'page') {
            $baseData['elements'] = [
                [
                    'id' => 'header-' . uniqid(),
                    'type' => 'header',
                    'props' => [
                        'className' => 'w-full h-16 bg-white border-b'
                    ],
                    'children' => []
                ],
                [
                    'id' => 'main-' . uniqid(),
                    'type' => 'main',
                    'props' => [
                        'className' => 'flex-1 p-8'
                    ],
                    'children' => []
                ]
            ];
        } elseif ($type === 'component') {
            $baseData['elements'] = [
                [
                    'id' => 'root-' . uniqid(),
                    'type' => 'div',
                    'props' => [
                        'className' => 'p-4 border rounded-lg'
                    ],
                    'children' => []
                ]
            ];
        }

        return $baseData;
    }

    /**
     * Generate default settings for frames.
     */
    private function getDefaultSettings(): array
    {
        return [
            'viewport_width' => 1440,
            'viewport_height' => 900,
            'background_color' => '#ffffff',
            'grid_enabled' => true,
            'snap_to_grid' => true,
            'grid_size' => 10,
            'zoom_level' => 100,
            'auto_save' => true,
            'show_rulers' => false
        ];
    }
}