<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Project;

class CheckPublicProject
{
    /**
     * Handle an incoming request.
     * 
     * Checks if a project is public before allowing unauthenticated access.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $projectUuid = $request->route('project');
        
        // Find project by UUID
        $project = Project::where('uuid', $projectUuid)->first();
        
        if (!$project) {
            abort(404, 'Project not found');
        }
        
        // Check if project is public
        if (!$project->is_public) {
            // If user is authenticated and has access through workspace, allow it
            if (auth()->check()) {
                $user = auth()->user();
                
                // Check if user has access through workspace
                if ($project->workspace_id) {
                    $hasAccess = $user->workspaces()
                        ->where('workspaces.id', $project->workspace_id)
                        ->exists();
                    
                    if ($hasAccess) {
                        $request->merge([
                            'public_project' => $project,
                            'is_public_view' => false,
                            'can_edit' => true // Will be refined by role later
                        ]);
                        return $next($request);
                    }
                }
                
                // User is owner
                if ($project->user_id === $user->id) {
                    $request->merge([
                        'public_project' => $project,
                        'is_public_view' => false,
                        'can_edit' => true
                    ]);
                    return $next($request);
                }
            }
            
            abort(403, 'This project is private. Please log in to access it.');
        }
        
        // Project is public - inject into request
        $request->merge([
            'public_project' => $project,
            'is_public_view' => true,
            'can_edit' => false
        ]);
        
        return $next($request);
    }
}
