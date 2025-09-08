<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Frame;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class ForgeController extends Controller
{
    public function show(Project $project, Frame $frame): Response
    {
        $user = Auth::user();
        
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
        
        return Inertia::render('ForgePage', [
            'project' => $project->load('workspace'),
            'frame' => $frame,
            'mode' => 'forge',
            'userRole' => $project->workspace ? $project->workspace->getUserRole($user->id) : 'owner',
            'canEdit' => $project->user_id === $user->id || ($project->workspace && $project->workspace->canUserEdit($user->id)),
        ]);
    }
}