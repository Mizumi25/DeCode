<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Frame;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ForgeController extends Controller
{
    /**
     * Show the Forge page for a specific frame
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
                    'animation' => $comp->animation ?? [],
                    'children' => []
                ];
            })->toArray();
        
        $canvasData = [
            'components' => $projectComponents, // USE DATABASE COMPONENTS
            'settings' => $frame->settings ?? [],
            'version' => '1.0'
        ];
        
        // CRITICAL: Ensure components array exists and is valid
        if (!isset($canvasData['components']) || !is_array($canvasData['components'])) {
            $canvasData['components'] = [];
        }
    
        return [
            'uuid' => $frame->uuid,
            'id' => $frame->uuid, // CRITICAL: Use UUID consistently
            'name' => $frame->name,
            'type' => $frame->type ?? 'desktop',
            'description' => $frame->description,
            'thumbnail' => $frame->thumbnail ?? '/api/placeholder/200/120',
            'meta_data' => $frame->meta_data ?? [],
            'created_at' => $frame->created_at,
            'updated_at' => $frame->updated_at,
            'project_id' => $frame->project_id,
            'settings' => $frame->settings ?? [],
            'canvas_data' => $canvasData, // FIXED: Always properly structured
            
            // Add debugging information
            'debug' => [
                'has_components' => !empty($canvasData['components']),
                'component_count' => count($canvasData['components'] ?? []),
                'last_updated' => $frame->updated_at->toISOString(),
                'raw_canvas_data_type' => gettype($frame->canvas_data),
            ]
        ];
    }
    
    /**
     * Enhanced show method with better debugging
     */
    public function show(Project $project, Frame $frame): Response
    {
        $user = Auth::user();
        
        // Check if frame belongs to project
        if ($frame->project_id !== $project->id) {
            abort(404, 'Frame not found in this project');
        }
        
        // Enhanced access control
        $hasAccess = $this->checkProjectAccess($project, $user);
        
        if (!$hasAccess) {
            abort(403, 'Access denied to this project.');
        }
    
        // Get frame-specific data with enhanced structure
        $frameData = $this->getFrameData($frame);
        
        // Get user permissions
        $userPermissions = $this->getUserPermissions($project, $user);
    
        // Get all frames in this project for the frame switcher
        $projectFrames = $project->frames()
            ->select([
                'uuid',
                'name', 
                'type',
                'thumbnail_path',
                'updated_at',
                'created_at',
                'meta_data'
            ])
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($frameItem) use ($frame) {
                return [
                    'id' => $frameItem->uuid,           
                    'uuid' => $frameItem->uuid,         
                    'name' => $frameItem->name,
                    'type' => $frameItem->type ?? 'desktop',
                    'thumbnail' => $frameItem->thumbnail_path ?? '/api/placeholder/200/120',
                    'lastModified' => $frameItem->updated_at->diffForHumans(),
                    'updated_at' => $frameItem->updated_at,
                    'created_at' => $frameItem->created_at,
                    'components' => $frameItem->meta_data['component_count'] ?? 0,
                    'status' => $frameItem->meta_data['status'] ?? 'draft',
                    'collaborators' => $frameItem->meta_data['collaborator_count'] ?? 0,
                    'meta_data' => $frameItem->meta_data ?? [],
                    'isActive' => $frameItem->uuid === $frame->uuid, // Mark the current frame as active
                ];
            });
    
        // Debug logging
        \Log::info('ForgeController: Rendering frame', [
            'project_id' => $project->uuid,
            'frame_id' => $frame->uuid,
            'frame_name' => $frame->name,
            'canvas_components' => count($frameData['canvas_data']['components'] ?? []),
            'total_project_frames' => $projectFrames->count(),
        ]);
    
        \Log::info('ForgeController: Sending frame data', [
            'frame_uuid' => $frame->uuid,
            'canvas_components_count' => count($frameData['canvas_data']['components'] ?? []),
            'canvas_data_structure' => array_keys($frameData['canvas_data'] ?? []),
        ]);
    
        return Inertia::render('ForgePage', [
            'project' => $project->load('workspace'),
            'frame' => $frameData, // CRITICAL: Use enhanced frame data
            'projectFrames' => $projectFrames,
            'mode' => 'forge',
            'userRole' => $project->workspace ? $project->workspace->getUserRole($user->id) : 'owner',
            'canEdit' => $userPermissions['canEdit'],
            'canCreateFrames' => $userPermissions['canCreateFrames'],
            'canDeleteFrames' => $userPermissions['canDeleteFrames'],
            'projectId' => $project->uuid,
            'frameId' => $frame->uuid, // CRITICAL: Always use UUID
            
            // FIXED: Add debug info
            'debug' => [
                'frame_has_canvas_data' => !empty($frameData['canvas_data']['components']),
                'component_count' => count($frameData['canvas_data']['components'] ?? []),
                'timestamp' => now()->toISOString(),
            ]
        ]);
    }

    /**
     * Switch to a different frame (AJAX endpoint for smooth transitions)
     */
    public function switchFrame(Project $project, Frame $frame, Request $request)
    {
        $user = Auth::user();
        
        // Validate access
        if ($frame->project_id !== $project->id) {
            return response()->json(['error' => 'Frame not found in this project'], 404);
        }
        
        if (!$this->checkProjectAccess($project, $user)) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        // Get frame data for the new frame
        $frameData = $this->getFrameData($frame);
        
        // If this is an AJAX request, return just the frame data
        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'frame' => $frameData,
                'message' => "Switched to frame: {$frame->name}"
            ]);
        }

        // Otherwise, redirect to the new frame URL
        return redirect()->route('frame.forge', [
            'project' => $project->uuid,
            'frame' => $frame->uuid
        ]);
    }

    /**
     * Get all frames in project formatted for the frame switcher
     */
    private function getProjectFramesForSwitcher(Project $project): array
    {
        $frames = $project->frames()
            ->select([
                'uuid as id',
                'name', 
                'type',
                'thumbnail',
                'updated_at',
                'created_at',
                'meta_data'
            ])
            ->orderBy('created_at', 'asc')
            ->get();

        return $frames->map(function ($frame) {
            // Get component count (you might store this in meta_data or calculate it)
            $componentCount = $this->getFrameComponentCount($frame);
            
            // Get collaborator count (if you have frame-specific collaboration)
            $collaboratorCount = $this->getFrameCollaboratorCount($frame);
            
            // Determine frame status
            $status = $this->determineFrameStatus($frame);
            
            // Generate thumbnail URL (use dummy for now as requested)
            $thumbnailUrl = $frame->thumbnail ?? '/api/placeholder/200/120';
            
            return [
                'id' => $frame->id,
                'name' => $frame->name,
                'type' => $frame->type ?? 'desktop',
                'icon' => $this->getFrameIcon($frame->type),
                'thumbnail' => $thumbnailUrl,
                'lastModified' => $frame->updated_at->diffForHumans(),
                'components' => $componentCount,
                'isActive' => false, // Will be set by frontend based on current frame
                'status' => $status,
                'collaborators' => $collaboratorCount,
                'createdAt' => $frame->created_at,
                'updatedAt' => $frame->updated_at
            ];
        })->toArray();
    }

  

    /**
     * Check if user has access to the project
     */
    private function checkProjectAccess(Project $project, $user): bool
    {
        // User owns the project
        if ($project->user_id === $user->id) {
            return true;
        }
        
        // Project is public
        if ($project->is_public) {
            return true;
        }
        
        // Check workspace access
        if ($project->workspace) {
            return $project->workspace->hasUser($user->id);
        }
        
        return false;
    }

    /**
     * Get user permissions for the project
     */
    private function getUserPermissions(Project $project, $user): array
    {
        $isOwner = $project->user_id === $user->id;
        $workspaceRole = $project->workspace ? $project->workspace->getUserRole($user->id) : null;
        
        return [
            'canEdit' => $isOwner || ($project->workspace && $project->workspace->canUserEdit($user->id)),
            'canCreateFrames' => $isOwner || in_array($workspaceRole, ['admin', 'editor']),
            'canDeleteFrames' => $isOwner || $workspaceRole === 'admin',
            'canInviteUsers' => $isOwner || in_array($workspaceRole, ['admin', 'editor']),
            'isOwner' => $isOwner,
            'workspaceRole' => $workspaceRole
        ];
    }

    /**
     * Get component count for a frame (placeholder implementation)
     */
    private function getFrameComponentCount(Frame $frame): int
    {
        // This would typically query your components table
        // For now, return a mock value or check meta_data
        if (isset($frame->meta_data['component_count'])) {
            return (int) $frame->meta_data['component_count'];
        }
        
        // Or calculate from stored canvas data
        if (isset($frame->canvas_data['components'])) {
            return count($frame->canvas_data['components']);
        }
        
        // Default fallback
        return rand(5, 25); // Remove this in production
    }

    /**
     * Get collaborator count for a frame (placeholder implementation)
     */
    private function getFrameCollaboratorCount(Frame $frame): int
    {
        // This would typically query your frame_collaborators or similar table
        // For now, return a mock value
        return rand(0, 3); // Remove this in production
    }

    /**
     * Determine frame status based on various factors
     */
    private function determineFrameStatus(Frame $frame): string
    {
        // Check meta_data for explicit status
        if (isset($frame->meta_data['status'])) {
            return $frame->meta_data['status'];
        }
        
        // Determine status based on activity and completion
        $daysSinceUpdate = $frame->updated_at->diffInDays(now());
        
        if ($daysSinceUpdate < 1) {
            return 'active';
        } elseif ($daysSinceUpdate < 7) {
            return 'review';
        } else {
            return 'draft';
        }
    }

    /**
     * Get appropriate icon name for frame type
     */
    private function getFrameIcon(string $type = null): string
    {
        switch ($type) {
            case 'mobile':
                return 'Smartphone';
            case 'tablet':
                return 'Tablet';
            case 'desktop':
                return 'Monitor';
            case 'dashboard':
                return 'Grid3X3';
            case 'settings':
                return 'Settings';
            case 'profile':
                return 'User';
            default:
                return 'Monitor';
        }
    }

    /**
     * Create a new frame in the project (for the "Create New Frame" button)
     */
    public function createFrame(Request $request, Project $project)
    {
        $user = Auth::user();
        
        // Check permissions
        if (!$this->checkProjectAccess($project, $user)) {
            abort(403, 'Access denied');
        }
        
        $userPermissions = $this->getUserPermissions($project, $user);
        if (!$userPermissions['canCreateFrames']) {
            abort(403, 'You do not have permission to create frames');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:desktop,mobile,tablet',
            'description' => 'nullable|string|max:1000',
        ]);

        $frame = Frame::create([
            'uuid' => \Str::uuid(),
            'project_id' => $project->id,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'description' => $validated['description'] ?? null,
            'thumbnail' => '/api/placeholder/200/120', // Dummy thumbnail as requested
            'meta_data' => [
                'status' => 'draft',
                'component_count' => 0,
                'created_by' => $user->id
            ],
            'canvas_data' => [],
            'settings' => []
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'frame' => $this->getFrameData($frame),
                'message' => 'Frame created successfully'
            ]);
        }

        return redirect()->route('frame.forge', [
            'project' => $project->uuid,
            'frame' => $frame->uuid
        ])->with('success', 'Frame created successfully');
    }

    /**
     * Update frame data (for auto-saving components, etc.)
     */
    public function updateFrame(Request $request, Project $project, Frame $frame)
    {
        $user = Auth::user();
        
        // Check permissions
        if (!$this->checkProjectAccess($project, $user)) {
            return response()->json(['error' => 'Access denied'], 403);
        }
        
        $userPermissions = $this->getUserPermissions($project, $user);
        if (!$userPermissions['canEdit']) {
            return response()->json(['error' => 'No edit permission'], 403);
        }

        // Validate the frame belongs to the project
        if ($frame->project_id !== $project->id) {
            return response()->json(['error' => 'Frame not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string|max:1000',
            'canvas_data' => 'sometimes|array',
            'meta_data' => 'sometimes|array',
            'settings' => 'sometimes|array',
        ]);

        // Update frame
        $frame->update($validated);

        // Update component count in meta_data if canvas_data was updated
        if (isset($validated['canvas_data'])) {
            $componentCount = isset($validated['canvas_data']['components']) 
                ? count($validated['canvas_data']['components']) 
                : 0;
                
            $metaData = $frame->meta_data ?? [];
            $metaData['component_count'] = $componentCount;
            $frame->update(['meta_data' => $metaData]);
        }

        return response()->json([
            'success' => true,
            'frame' => $this->getFrameData($frame->fresh()),
            'message' => 'Frame updated successfully'
        ]);
    }

    /**
     * Delete a frame
     */
    public function deleteFrame(Request $request, Project $project, Frame $frame)
    {
        $user = Auth::user();
        
        // Check permissions
        if (!$this->checkProjectAccess($project, $user)) {
            return response()->json(['error' => 'Access denied'], 403);
        }
        
        $userPermissions = $this->getUserPermissions($project, $user);
        if (!$userPermissions['canDeleteFrames']) {
            return response()->json(['error' => 'No delete permission'], 403);
        }

        // Validate the frame belongs to the project
        if ($frame->project_id !== $project->id) {
            return response()->json(['error' => 'Frame not found'], 404);
        }

        // Prevent deleting the last frame
        $frameCount = $project->frames()->count();
        if ($frameCount <= 1) {
            return response()->json([
                'error' => 'Cannot delete the last frame in a project'
            ], 422);
        }

        $frameName = $frame->name;
        $frame->delete();

        return response()->json([
            'success' => true,
            'message' => "Frame '{$frameName}' deleted successfully"
        ]);
    }

    /**
     * Duplicate a frame
     */
    public function duplicateFrame(Request $request, Project $project, Frame $frame)
    {
        $user = Auth::user();
        
        // Check permissions
        if (!$this->checkProjectAccess($project, $user)) {
            return response()->json(['error' => 'Access denied'], 403);
        }
        
        $userPermissions = $this->getUserPermissions($project, $user);
        if (!$userPermissions['canCreateFrames']) {
            return response()->json(['error' => 'No create permission'], 403);
        }

        // Validate the frame belongs to the project
        if ($frame->project_id !== $project->id) {
            return response()->json(['error' => 'Frame not found'], 404);
        }

        // Create duplicate
        $duplicateFrame = Frame::create([
            'uuid' => \Str::uuid(),
            'project_id' => $project->id,
            'name' => $frame->name . ' (Copy)',
            'type' => $frame->type,
            'description' => $frame->description,
            'thumbnail' => '/api/placeholder/200/120', // Dummy thumbnail
            'meta_data' => array_merge($frame->meta_data ?? [], [
                'status' => 'draft',
                'created_by' => $user->id,
                'duplicated_from' => $frame->uuid
            ]),
            'canvas_data' => $frame->canvas_data ?? [],
            'settings' => $frame->settings ?? []
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'frame' => $this->getFrameData($duplicateFrame),
                'message' => 'Frame duplicated successfully'
            ]);
        }

        return redirect()->route('frame.forge', [
            'project' => $project->uuid,
            'frame' => $duplicateFrame->uuid
        ])->with('success', 'Frame duplicated successfully');
    }

    /**
     * Get frame analytics/statistics
     */
    public function getFrameStats(Project $project, Frame $frame)
    {
        $user = Auth::user();
        
        // Check access
        if (!$this->checkProjectAccess($project, $user)) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        if ($frame->project_id !== $project->id) {
            return response()->json(['error' => 'Frame not found'], 404);
        }

        // Calculate statistics
        $stats = [
            'component_count' => $this->getFrameComponentCount($frame),
            'last_modified' => $frame->updated_at,
            'created_at' => $frame->created_at,
            'collaborator_count' => $this->getFrameCollaboratorCount($frame),
            'status' => $this->determineFrameStatus($frame),
            'size_estimate' => $this->getFrameSizeEstimate($frame),
            'complexity_score' => $this->calculateComplexityScore($frame)
        ];

        return response()->json([
            'success' => true,
            'stats' => $stats
        ]);
    }

    /**
     * Get estimated file size for frame export
     */
    private function getFrameSizeEstimate(Frame $frame): array
    {
        $canvasData = $frame->canvas_data ?? [];
        $componentCount = isset($canvasData['components']) ? count($canvasData['components']) : 0;
        
        // Rough estimates based on component count
        $htmlSize = max(1, $componentCount * 0.2); // KB
        $cssSize = max(0.5, $componentCount * 0.15); // KB
        $jsSize = max(2, $componentCount * 0.5); // KB
        
        return [
            'html' => round($htmlSize, 1),
            'css' => round($cssSize, 1),
            'javascript' => round($jsSize, 1),
            'total' => round($htmlSize + $cssSize + $jsSize, 1)
        ];
    }

    /**
     * Calculate complexity score based on frame content
     */
    private function calculateComplexityScore(Frame $frame): int
    {
        $score = 0;
        $canvasData = $frame->canvas_data ?? [];
        
        // Base score from component count
        $componentCount = isset($canvasData['components']) ? count($canvasData['components']) : 0;
        $score += $componentCount * 2;
        
        // Add complexity based on component types and interactions
        if (isset($canvasData['components'])) {
            foreach ($canvasData['components'] as $component) {
                // Interactive components add more complexity
                if (isset($component['type']) && in_array($component['type'], ['form', 'button', 'input', 'modal'])) {
                    $score += 5;
                }
                
                // Custom styling adds complexity
                if (isset($component['style']) && !empty($component['style'])) {
                    $score += 3;
                }
                
                // Animations add complexity
                if (isset($component['animation']) && !empty($component['animation'])) {
                    $score += 4;
                }
            }
        }
        
        // Cap at 100
        return min(100, $score);
    }

    /**
     * Export frame data for external use
     */
    public function exportFrame(Request $request, Project $project, Frame $frame)
    {
        $user = Auth::user();
        
        // Check access
        if (!$this->checkProjectAccess($project, $user)) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        if ($frame->project_id !== $project->id) {
            return response()->json(['error' => 'Frame not found'], 404);
        }

        $exportData = [
            'frame' => [
                'id' => $frame->uuid,
                'name' => $frame->name,
                'type' => $frame->type,
                'description' => $frame->description,
                'created_at' => $frame->created_at,
                'updated_at' => $frame->updated_at,
            ],
            'project' => [
                'id' => $project->uuid,
                'name' => $project->name,
            ],
            'canvas_data' => $frame->canvas_data ?? [],
            'settings' => $frame->settings ?? [],
            'meta_data' => $frame->meta_data ?? [],
            'export_meta' => [
                'exported_at' => now(),
                'exported_by' => $user->id,
                'version' => '1.0'
            ]
        ];

        return response()->json([
            'success' => true,
            'export_data' => $exportData
        ]);
    }
}