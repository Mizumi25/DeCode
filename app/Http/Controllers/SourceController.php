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
        
        return Inertia::render('SourcePage', [
            'project' => $project->load('workspace'),
            'frame' => $frame,
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
        
        return Inertia::render('SourcePage', [
            'project' => $project->load('workspace'),
            'frame' => $frame,
            'mode' => 'source',
            'userRole' => $project->workspace ? $project->workspace->getUserRole($user->id) : 'owner',
            'canEdit' => $project->user_id === $user->id || ($project->workspace && $project->workspace->canUserEdit($user->id)),
        ]);
    }
}