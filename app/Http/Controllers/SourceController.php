<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use App\Models\Project;
use App\Models\Frame;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class SourceController extends Controller
{
    /**
     * Load frame data with canvas components from ProjectComponents table
     */
    private function getFrameData(Frame $frame): array
    {
        // Load components from ProjectComponents table
        $projectComponents = \App\Models\ProjectComponent::where('frame_id', $frame->id)
            ->with('component')
            ->ordered()
            ->get()
            ->map(function($comp) {
                return [
                    'id' => $comp->component_instance_id,
                    'type' => $comp->component_type,
                    'props' => $comp->props ?? [],
                    'position' => $comp->position ?? ['x' => 0, 'y' => 0],
                    'name' => $comp->name,
                    'zIndex' => $comp->z_index ?? 0,
                    'variant' => $comp->variant,
                    'style' => $comp->style ?? [],
                    'style_mobile' => $comp->style_mobile ?? null,   // 🔥 RESPONSIVE
                    'style_tablet' => $comp->style_tablet ?? null,   // 🔥 RESPONSIVE
                    'style_desktop' => $comp->style_desktop ?? null, // 🔥 RESPONSIVE
                    'animation' => $comp->animation ?? [],
                    'parentId' => $comp->parent_id,
                    'children' => []
                ];
            })->toArray();
        
        // 🔥 Merge with existing canvas_data to preserve device, viewport, etc.
        $existingCanvasData = $frame->canvas_data ?? [];
        $canvasData = array_merge($existingCanvasData, [
            'components' => $projectComponents,
            'settings' => $frame->settings ?? [],
            'version' => '1.0'
        ]);
        
        if (!isset($canvasData['components']) || !is_array($canvasData['components'])) {
            $canvasData['components'] = [];
        }
    
        return [
            'uuid' => $frame->uuid,
            'id' => $frame->uuid,
            'name' => $frame->name,
            'type' => $frame->type ?? 'desktop',
            'canvas_data' => $canvasData,
            'canvas_style' => $frame->canvas_style ?? [],
            'canvas_props' => $frame->canvas_props ?? [],
            'canvas_animation' => $frame->canvas_animation ?? [],
        ];
    }

    /**
     * Show public source page (for is_public = true projects)
     */
    public function showPublic(Request $request, $projectUuid, $frameUuid): Response
    {
        $project = $request->public_project; // Injected by middleware
        $isPublicView = $request->is_public_view;
        $canEdit = $request->can_edit;
        
        // Find frame by UUID
        $frame = Frame::where('uuid', $frameUuid)
            ->where('project_id', $project->id)
            ->firstOrFail();
        
        // 🔥 Load frame data with components
        $frameData = $this->getFrameData($frame);
        
        return Inertia::render('SourcePage', [
            'project' => $project->load('workspace'),
            'frame' => $frameData, // 🔥 Use frameData instead of frame
            'mode' => 'source',
            'isPublicView' => $isPublicView,
            'canEdit' => $canEdit,
            'userRole' => 'viewer',
        ]);
    }
    
    public function show(Project $project, Frame $frame): Response|RedirectResponse
    {
        $user = Auth::user();
        
        // Check if user is authenticated
        if (!$user) {
            return redirect()->route('login')->with('error', 'Please log in to access this project.');
        }
        
        // Check if frame belongs to project
        if ($frame->project_id !== $project->id) {
            abort(404, 'Frame not found in this project');
        }
        
        // Enhanced access control: Check ownership OR workspace access
        $hasAccess = false;
        
        if ($project->user_id === $user->id) {
            // User owns the project
            $hasAccess = true;
        } elseif ($project->is_public) {
            // Project is public
            $hasAccess = true;
        } elseif ($project->workspace) {
            // Check workspace access
            $hasAccess = $project->workspace->hasUser($user->id);
        }
        
        if (!$hasAccess) {
            abort(403, 'Access denied to this project.');
        }
        
        // 🔥 Load frame data with components
        $frameData = $this->getFrameData($frame);
        
        return Inertia::render('SourcePage', [
            'project' => $project->load('workspace'),
            'frame' => $frameData, // 🔥 Use frameData instead of frame
            'mode' => 'source',
            'userRole' => $project->workspace ? $project->workspace->getUserRole($user->id) : 'owner',
            'canEdit' => $project->user_id === $user->id || ($project->workspace && $project->workspace->canUserEdit($user->id)),
        ]);
    }
}