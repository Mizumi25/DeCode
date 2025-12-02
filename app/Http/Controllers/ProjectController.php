<?php
// app/Http/Controllers/ProjectController.php
namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use App\Events\ProjectCreated;
use App\Services\VoidPagePlaywrightService;

class ProjectController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $user = Auth::user();
        $search = $request->input('search');
        $filter = $request->input('filter', 'all'); // all, recent, draft, published, archived
        $type = $request->input('type', 'all'); // all, website, landing_page, etc.
        $sort = $request->input('sort', 'updated_at'); // updated_at, created_at, name
        $workspaceId = $request->input('workspace');
        
        // Initialize workspace and validation
        $currentWorkspace = null;
        
        if ($workspaceId) {
            // User specifically requested a workspace
            $workspace = Workspace::where('uuid', $workspaceId)->first() ?? Workspace::find($workspaceId);
    
            
            if (!$workspace) {
                // Workspace doesn't exist, redirect to projects without workspace filter
                return redirect()->route('projects.index')->with('error', 'Workspace not found');
            }
            
            if (!$workspace->hasUser($user->id)) {
                // User doesn't have access, redirect to their personal workspace
                $personalWorkspace = $user->getPersonalWorkspace();
                if ($personalWorkspace) {
                    return redirect()->route('projects.index', ['workspace' => $personalWorkspace->id])
                        ->with('error', 'You do not have access to the requested workspace');
                }
                return redirect()->route('projects.index')->with('error', 'Access denied to workspace');
            }
            
            $currentWorkspace = $workspace;
        } else {
            // No specific workspace requested, try to get user's current workspace
            $currentWorkspace = $user->getCurrentWorkspace();
            
            // If no current workspace or user doesn't have access, fall back to personal workspace
            if (!$currentWorkspace || !$currentWorkspace->hasUser($user->id)) {
                $currentWorkspace = $user->getPersonalWorkspace();
                
                // If still no workspace, ensure user has a personal workspace
                if (!$currentWorkspace) {
                    $currentWorkspace = $user->ensurePersonalWorkspace();
                }
            }
            
            // Redirect to include workspace parameter for consistency
            if ($currentWorkspace) {
                return redirect()->route('projects.index', array_merge(
                    $request->only(['search', 'filter', 'type', 'sort']),
                    ['workspace' => $currentWorkspace->uuid] // Use UUID for consistency
                ));
            }
        }
        
        // Build the projects query with workspace filtering
       $query = Project::with(['workspace', 'workspace.owner', 'user']);
        
        // Apply workspace filter - this is the key fix
        if ($currentWorkspace) {
            $query->where('workspace_id', $currentWorkspace->id);
        } else {
            // If no workspace, show only user's own projects
            $query->where('user_id', $user->id);
        }
        
        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%');
            });
        }
        
        // Apply status filter
        switch ($filter) {
            case 'recent':
                $query->where('updated_at', '>', now()->subDays(7));
                break;
            case 'draft':
                $query->where('status', 'draft');
                break;
            case 'published':
                $query->where('status', 'published');
                break;
            case 'active':
                $query->where('status', 'active');
                break;
            case 'archived':
                $query->where('status', 'archived');
                break;
        }

        // Apply type filter
        if ($type !== 'all') {
            $query->where('type', $type);
        }

        // Apply sorting
        switch ($sort) {
            case 'name':
                $query->orderBy('name', 'asc');
                break;
            case 'created_at':
                $query->orderBy('created_at', 'desc');
                break;
            case 'updated_at':
            default:
                $query->orderBy('updated_at', 'desc');
                break;
        }

        $projects = $query->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id, 
                    'uuid' => $project->uuid,
                    'name' => $project->name,
                    'description' => $project->description,
                    'type' => $project->type,
                    'status' => $project->status,
                    'thumbnail' => $project->thumbnail ? asset('storage/' . $project->thumbnail) : null,
                    'last_opened_at' => $project->last_opened_at,
                    'formatted_last_opened' => $project->formatted_last_opened,
                    'component_count' => $project->getComponentCountAttribute(),
                    'frame_count' => $project->getFrameCountAttribute(),
                    'created_at' => $project->created_at,
                    'updated_at' => $project->updated_at,
                    'viewport_width' => $project->viewport_width,
                    'viewport_height' => $project->viewport_height,
                    'css_framework' => $project->css_framework,
                    'output_format' => $project->output_format,
                    'is_public' => $project->is_public,
                    'workspace' => $project->workspace ? [
                        'id' => $project->workspace->id,
                        'name' => $project->workspace->name,
                        'type' => $project->workspace->type,
                    ] : null,
                ];
            });

        // Get user's accessible workspaces for dropdown
        $userWorkspaces = $user->getAllWorkspaces()->map(function ($workspace) use ($user) {
            return [
                'id' => $workspace->id,
                'uuid' => $workspace->uuid,
                'name' => $workspace->name,
                'type' => $workspace->type,
                'settings' => $workspace->settings,
                'member_count' => $workspace->users->count() + 1, // +1 for owner
                'project_count' => $workspace->projects()->count(),
                'owner' => [
                    'id' => $workspace->owner->id,
                    'name' => $workspace->owner->name,
                    'email' => $workspace->owner->email,
                ],
                'users' => $workspace->users->map(function ($workspaceUser) {
                    return [
                        'id' => $workspaceUser->id,
                        'name' => $workspaceUser->name,
                        'email' => $workspaceUser->email,
                        'role' => $workspaceUser->pivot->role,
                    ];
                }),
                'user_role' => $workspace->getUserRole($user->id),
            ];
        });

        // Calculate stats for current workspace only
        $workspaceProjectsQuery = $user->projects();
        if ($currentWorkspace) {
            $workspaceProjectsQuery->where('workspace_id', $currentWorkspace->id);
        }

        // Get clipboard status for copy/paste functionality
        $clipboardStatus = $this->getClipboardStatus(new Request())->getData();
        
        $workspaceProps = null;
        if ($currentWorkspace && $currentWorkspace->type !== 'personal') {
            $workspaceProps = [
                'currentWorkspace' => [
                    'id' => $currentWorkspace->id,
                    'uuid' => $currentWorkspace->uuid,
                    'name' => $currentWorkspace->name,
                    'type' => $currentWorkspace->type,
                    // Add any other properties WorkspaceChat needs
                ]
            ];
        }

        return Inertia::render('ProjectList', [
            'projects' => $projects,
            'workspaces' => $userWorkspaces,
            'currentWorkspace' => $currentWorkspace ? [
                'id' => $currentWorkspace->id,
                'uuid' => $currentWorkspace->uuid,
                'name' => $currentWorkspace->name,
                'type' => $currentWorkspace->type,
                'settings' => $currentWorkspace->settings,
                'member_count' => $currentWorkspace->users->count() + 1,
                'project_count' => $currentWorkspace->projects()->count(),
                'owner' => [
                    'id' => $currentWorkspace->owner->id,
                    'name' => $currentWorkspace->owner->name,
                    'email' => $currentWorkspace->owner->email,
                ],
                'users' => $currentWorkspace->users->map(function ($workspaceUser) {
                    return [
                        'id' => $workspaceUser->id,
                        'name' => $workspaceUser->name,
                        'email' => $workspaceUser->email,
                        'role' => $workspaceUser->pivot->role,
                    ];
                }),
                'user_role' => $currentWorkspace->getUserRole($user->id),
            ] : null,
            'filters' => $request->only(['search', 'sort', 'order', 'workspace', 'filter', 'type']),
            'clipboardStatus' => $clipboardStatus,
            'stats' => [
                'total' => $projects->count(),
                'draft' => $workspaceProjectsQuery->where('status', 'draft')->count(),
                'published' => $workspaceProjectsQuery->where('status', 'published')->count(),
                'active' => $workspaceProjectsQuery->where('status', 'active')->count(),
                'archived' => $workspaceProjectsQuery->where('status', 'archived')->count(),
                'recent' => $workspaceProjectsQuery->where('updated_at', '>', now()->subDays(7))->count(),
                'by_type' => $workspaceProjectsQuery
                    ->select('type', \DB::raw('count(*) as count'))
                    ->groupBy('type')
                    ->pluck('count', 'type')
                    ->toArray(),
            ],
            'workspaceProps' => $workspaceProps
        ]);
    }

    // NEW: Copy project to clipboard
    public function copyProject(Request $request, Project $project): JsonResponse
    {
        $user = Auth::user();
        
        // Check if user can access this project
        if ($project->user_id !== $user->id && !$project->is_public) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to copy this project'
            ], 403);
        }

        // Store project ID in user's clipboard cache
        $clipboardKey = "user_{$user->id}_clipboard";
        Cache::put($clipboardKey, [
            'type' => 'project',
            'project_id' => $project->id,
            'project_name' => $project->name,
            'copied_at' => now()->toISOString(),
            'source_workspace_id' => $project->workspace_id
        ], now()->addHours(24)); // Clipboard expires after 24 hours

        return response()->json([
            'success' => true,
            'message' => "Project '{$project->name}' copied to clipboard",
            'clipboard' => [
                'has_project' => true,
                'project_name' => $project->name,
                'copied_at' => now()->toISOString()
            ]
        ]);
    }

    // NEW: Paste project from clipboard
    public function pasteProject(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'workspace_id' => 'required|exists:workspaces,id',
            'name' => 'nullable|string|max:255'
        ]);

        $clipboardKey = "user_{$user->id}_clipboard";
        $clipboard = Cache::get($clipboardKey);

        if (!$clipboard || $clipboard['type'] !== 'project') {
            return response()->json([
                'success' => false,
                'message' => 'No project in clipboard to paste'
            ], 400);
        }

        $originalProject = Project::find($clipboard['project_id']);
        if (!$originalProject) {
            // Clear invalid clipboard
            Cache::forget($clipboardKey);
            return response()->json([
                'success' => false,
                'message' => 'Original project no longer exists'
            ], 404);
        }

        // Check if user can access the original project
        if ($originalProject->user_id !== $user->id && !$originalProject->is_public) {
            return response()->json([
                'success' => false,
                'message' => 'You no longer have access to the copied project'
            ], 403);
        }

        // Check workspace access
        $workspace = Workspace::find($validated['workspace_id']);
        if (!$workspace || !$workspace->hasUser($user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have access to the target workspace'
            ], 403);
        }

        // Check if user can create projects in workspace
        $userRole = $workspace->getUserRole($user->id);
        if (!in_array($userRole, ['owner', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to create projects in this workspace'
            ], 403);
        }

        try {
            // Use the existing duplicate method but with new workspace
            $newProject = $originalProject->duplicate($validated['name'] ?? null);
            $newProject->user_id = $user->id;
            $newProject->workspace_id = $workspace->id;
            $newProject->is_public = false; // Pasted projects are private by default
            $newProject->save();

            \Log::info('Project pasted successfully', [
                'original_project_id' => $originalProject->id,
                'new_project_id' => $newProject->id,
                'target_workspace_id' => $workspace->id,
                'user_id' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'message' => "Project pasted to {$workspace->name}",
                'data' => [
                    'project' => [
                        'id' => $newProject->id,
                        'uuid' => $newProject->uuid,
                        'name' => $newProject->name,
                        'workspace' => [
                            'id' => $workspace->id,
                            'name' => $workspace->name
                        ]
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to paste project', [
                'original_project_id' => $clipboard['project_id'],
                'target_workspace_id' => $workspace->id,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to paste project: ' . $e->getMessage()
            ], 500);
        }
    }

    // NEW: Move project to different workspace
    public function moveProjectToWorkspace(Request $request, Project $project): JsonResponse
    {
        $user = Auth::user();
        
        // Check ownership
        if ($project->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to move this project'
            ], 403);
        }

        $validated = $request->validate([
            'workspace_id' => 'required|exists:workspaces,id'
        ]);

        $targetWorkspace = Workspace::find($validated['workspace_id']);
        
        // Check if user has access to target workspace
        if (!$targetWorkspace || !$targetWorkspace->hasUser($user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have access to the target workspace'
            ], 403);
        }

        // Check if moving to same workspace
        if ($project->workspace_id === $targetWorkspace->id) {
            return response()->json([
                'success' => false,
                'message' => 'Project is already in this workspace'
            ], 400);
        }

        // Check if user can create projects in target workspace
        $userRole = $targetWorkspace->getUserRole($user->id);
        if (!in_array($userRole, ['owner', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to move projects to this workspace'
            ], 403);
        }

        try {
            $oldWorkspace = $project->workspace;
            $oldWorkspaceId = $oldWorkspace?->id;
            
            $project->update(['workspace_id' => $targetWorkspace->id]);

            \Log::info('Project moved between workspaces', [
                'project_id' => $project->id,
                'old_workspace_id' => $oldWorkspaceId,
                'old_workspace_name' => $oldWorkspace?->name,
                'new_workspace_id' => $targetWorkspace->id,
                'new_workspace_name' => $targetWorkspace->name,
                'user_id' => $user->id
            ]);

            // BROADCAST TO OLD WORKSPACE (project removed)
            if ($oldWorkspaceId) {
                try {
                    broadcast(new \App\Events\ProjectDeleted($project->id, $project->uuid, $project->name, $oldWorkspaceId, $user->name))->toOthers();
                    \Log::info('Project removal from old workspace broadcasted');
                } catch (\Exception $e) {
                    \Log::warning('Failed to broadcast to old workspace: ' . $e->getMessage());
                }
            }

            // BROADCAST TO NEW WORKSPACE (project added)
            try {
                broadcast(new \App\Events\ProjectCreated($project->fresh(), $targetWorkspace, $user))->toOthers();
                \Log::info('Project addition to new workspace broadcasted');
            } catch (\Exception $e) {
                \Log::warning('Failed to broadcast to new workspace: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => "Project moved to {$targetWorkspace->name}",
                'data' => [
                    'project' => $project->fresh(),
                    'old_workspace' => $oldWorkspace ? [
                        'id' => $oldWorkspace->id,
                        'name' => $oldWorkspace->name
                    ] : null,
                    'new_workspace' => [
                        'id' => $targetWorkspace->id,
                        'name' => $targetWorkspace->name,
                        'type' => $targetWorkspace->type,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to move project between workspaces', [
                'project_id' => $project->id,
                'target_workspace_id' => $targetWorkspace->id,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to move project: ' . $e->getMessage()
            ], 500);
        }
    }

    // NEW: Get clipboard status
    public function getClipboardStatus(Request $request): JsonResponse
    {
        $user = Auth::user();
        $clipboardKey = "user_{$user->id}_clipboard";
        $clipboard = Cache::get($clipboardKey);

        if (!$clipboard || $clipboard['type'] !== 'project') {
            return response()->json([
                'success' => true,
                'data' => [
                    'has_project' => false,
                    'project_name' => null,
                    'copied_at' => null
                ]
            ]);
        }

        // Verify the project still exists
        $project = Project::find($clipboard['project_id']);
        if (!$project) {
            // Clear invalid clipboard
            Cache::forget($clipboardKey);
            return response()->json([
                'success' => true,
                'data' => [
                    'has_project' => false,
                    'project_name' => null,
                    'copied_at' => null
                ]
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'has_project' => true,
                'project_name' => $clipboard['project_name'],
                'copied_at' => $clipboard['copied_at'],
                'source_workspace_id' => $clipboard['source_workspace_id'] ?? null
            ]
        ]);
    }

    // NEW: Clear clipboard
    public function clearClipboard(Request $request): JsonResponse
    {
        $user = Auth::user();
        $clipboardKey = "user_{$user->id}_clipboard";
        
        Cache::forget($clipboardKey);

        return response()->json([
            'success' => true,
            'message' => 'Clipboard cleared'
        ]);
    }

    // NEW: Refresh projects (for pull-to-refresh)
    public function refreshProjects(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        // Add artificial delay for better UX
        sleep(1);
        
        $workspaceId = $request->input('workspace_id');
        $workspace = null;
        
        if ($workspaceId) {
            $workspace = Workspace::find($workspaceId);
            if (!$workspace || !$workspace->hasUser($user->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid workspace'
                ], 403);
            }
        }

        // Get fresh project data
        $query = Project::with(['workspace', 'workspace.owner'])
            ->where('user_id', $user->id);
        
        if ($workspace) {
            $query->where('workspace_id', $workspace->id);
        }

        $projects = $query->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'uuid' => $project->uuid,
                    'name' => $project->name,
                    'description' => $project->description,
                    'type' => $project->type,
                    'status' => $project->status,
                    'thumbnail' => $project->thumbnail ? asset('storage/' . $project->thumbnail) : null,
                    'last_opened_at' => $project->last_opened_at,
                    'formatted_last_opened' => $project->formatted_last_opened,
                    'component_count' => $project->getComponentCountAttribute(),
                    'frame_count' => $project->getFrameCountAttribute(),
                    'created_at' => $project->created_at,
                    'updated_at' => $project->updated_at,
                    'viewport_width' => $project->viewport_width,
                    'viewport_height' => $project->viewport_height,
                    'css_framework' => $project->css_framework,
                    'output_format' => $project->output_format,
                    'is_public' => $project->is_public,
                    'workspace' => $project->workspace ? [
                        'id' => $project->workspace->id,
                        'name' => $project->workspace->name,
                        'type' => $project->workspace->type,
                    ] : null,
                ];
            });

        // Get updated clipboard status
        $clipboardStatus = $this->getClipboardStatus(new Request())->getData();

        // Calculate fresh stats
        $statsQuery = $user->projects();
        if ($workspace) {
            $statsQuery->where('workspace_id', $workspace->id);
        }

        $stats = [
            'total' => $projects->count(),
            'draft' => $statsQuery->where('status', 'draft')->count(),
            'published' => $statsQuery->where('status', 'published')->count(),
            'active' => $statsQuery->where('status', 'active')->count(),
            'archived' => $statsQuery->where('status', 'archived')->count(),
            'recent' => $statsQuery->where('updated_at', '>', now()->subDays(7))->count(),
            'by_type' => $statsQuery
                ->select('type', \DB::raw('count(*) as count'))
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'projects' => $projects,
                'stats' => $stats,
                'clipboard_status' => $clipboardStatus,
                'refreshed_at' => now()->toISOString()
            ],
            'message' => 'Projects refreshed successfully'
        ]);
    }

    


public function store(Request $request): RedirectResponse 
{
    // Add extensive logging for debugging
    \Log::info('=== PROJECT CREATION DEBUG START ===');
    \Log::info('Request method: ' . $request->method());
    \Log::info('Request URL: ' . $request->fullUrl());
    \Log::info('Request headers: ', $request->headers->all());
    \Log::info('Raw request data: ', $request->all());
    \Log::info('User ID: ' . auth()->id());
    
    $user = Auth::user();
    
    try {
        \Log::info('Starting validation...');
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => [
                'required',
                Rule::in(['website', 'landing_page', 'component_library', 'prototype', 'email_template', 'dashboard'])
            ],
            'viewport_width' => 'nullable|integer|min:320|max:3840',
            'viewport_height' => 'nullable|integer|min:240|max:2160',
            'css_framework' => [
                'nullable',
                Rule::in(['tailwind', 'bootstrap', 'vanilla', 'styled_components', 'emotion'])
            ],
            'output_format' => [
                'nullable',
                Rule::in(['html', 'react', 'vue', 'angular'])
            ],
            'responsive_breakpoints' => 'nullable|array',
            'responsive_breakpoints.mobile' => 'nullable|integer|min:320|max:768',
            'responsive_breakpoints.tablet' => 'nullable|integer|min:768|max:1024', 
            'responsive_breakpoints.desktop' => 'nullable|integer|min:1024|max:3840',
            'is_public' => 'boolean',
            'template_id' => 'nullable|integer|exists:projects,id',
            'workspace_id' => 'required|integer|exists:workspaces,id'
        ]);
        
        \Log::info('Validation passed. Validated data: ', $validated);
        
    } catch (\Illuminate\Validation\ValidationException $e) {
        \Log::error('Validation failed: ', $e->errors());
        \Log::info('=== PROJECT CREATION DEBUG END (VALIDATION ERROR) ===');
        throw $e;
    }
    
    // Enhanced workspace validation
    $workspaceId = $validated['workspace_id'];
    \Log::info('Looking for workspace with ID: ' . $workspaceId);
    
    $workspace = Workspace::find($workspaceId);
    
    if (!$workspace) {
        \Log::error('Workspace not found with ID: ' . $workspaceId);
        \Log::info('Available workspaces: ', Workspace::all(['id', 'name'])->toArray());
        \Log::info('=== PROJECT CREATION DEBUG END (WORKSPACE NOT FOUND) ===');
        return redirect()->back()->withErrors([
            'workspace_id' => 'The specified workspace does not exist.'
        ]);
    }
    
    \Log::info('Found workspace: ', $workspace->toArray());

    // Check if user has access to the workspace
    $hasAccess = $workspace->hasUser($user->id);
    \Log::info('User has workspace access: ' . ($hasAccess ? 'Yes' : 'No'));
    
    if (!$hasAccess) {
        \Log::error('User does not have access to workspace: ' . $workspaceId);
        \Log::info('Workspace users: ', $workspace->users->pluck('id')->toArray());
        \Log::info('Workspace owner: ', $workspace->owner_id);
        \Log::info('=== PROJECT CREATION DEBUG END (NO ACCESS) ===');
        return redirect()->back()->withErrors([
            'workspace_id' => 'You do not have access to this workspace.'
        ]);
    }

    // Check if user can create projects in this workspace
    $userRole = $workspace->getUserRole($user->id);
    \Log::info('User role in workspace: ' . $userRole);
    
    if (!in_array($userRole, ['owner', 'editor'])) {
        \Log::error('User role insufficient for project creation: ' . $userRole);
        \Log::info('=== PROJECT CREATION DEBUG END (INSUFFICIENT ROLE) ===');
        return redirect()->back()->withErrors([
            'workspace_id' => 'You do not have permission to create projects in this workspace.'
        ]);
    }

    // Set defaults and prepare project data
    $validated['user_id'] = $user->id;
    $validated['workspace_id'] = $workspaceId;
    $validated['settings'] = array_merge(Project::getDefaultSettings(), [
        'responsive_breakpoints' => $validated['responsive_breakpoints'] ?? [
            'mobile' => 375,
            'tablet' => 768,
            'desktop' => 1440
        ]
    ]);
    $validated['export_settings'] = Project::getDefaultExportSettings();
    $validated['status'] = 'draft';
    $validated['last_opened_at'] = now();

    // Set viewport defaults if not provided
    $validated['viewport_width'] = $validated['viewport_width'] ?? 1440;
    $validated['viewport_height'] = $validated['viewport_height'] ?? 900;
    $validated['css_framework'] = $validated['css_framework'] ?? 'tailwind';
    $validated['output_format'] = $validated['output_format'] ?? 'html';

    // Initialize canvas data with default frame structure
    $validated['canvas_data'] = [
        'frames' => [
            [
                'id' => 'frame_' . uniqid(),
                'name' => 'Home Page',
                'type' => 'page',
                'width' => $validated['viewport_width'],
                'height' => $validated['viewport_height'],
                'x' => 0,
                'y' => 0,
                'background' => '#ffffff',
                'components' => [],
                'created_at' => now()->toISOString(),
            ]
        ],
        'zoom' => 1,
        'pan' => ['x' => 0, 'y' => 0],
        'selected_frame' => null,
        'grid_settings' => [
            'enabled' => true,
            'size' => 10,
            'snap' => true
        ]
    ];

    \Log::info('Final validated data for project creation: ', $validated);

    try {
        \Log::info('Attempting to create project...');
        $project = Project::create($validated);
        \Log::info('Project created successfully with ID: ' . $project->id);

        // If created from template, copy canvas data and settings
        if (isset($validated['template_id'])) {
            \Log::info('Processing template copy...');
            $template = Project::find($validated['template_id']);
            if ($template && ($template->is_public || $template->user_id === $user->id)) {
                $project->update([
                    'canvas_data' => $template->canvas_data,
                    'settings' => array_merge($project->settings, $template->settings ?? [])
                ]);
                \Log::info('Template data copied successfully');
            }
        }

        // BROADCAST PROJECT CREATION
        try {
            \Log::info('Broadcasting project creation...');
            broadcast(new ProjectCreated($project, $workspace, $user))->toOthers();
            \Log::info('Project creation broadcasted successfully');
        } catch (\Exception $e) {
            // Log broadcast failure but don't fail the project creation
            \Log::warning('Failed to broadcast project creation: ' . $e->getMessage());
        }
        
        \Log::info('Project creation completed successfully');
        \Log::info('Redirecting to: /void/' . $project->uuid . '?workspace=' . $workspace->id);
        \Log::info('=== PROJECT CREATION DEBUG END (SUCCESS) ===');

        // Redirect to void editor using UUID, include workspace context
        return redirect()->route('void.index', [
            'project' => $project->uuid,
            'workspace' => $workspace->id
        ]);

    } catch (\Exception $e) {
        \Log::error('Failed to create project: ' . $e->getMessage());
        \Log::error('Stack trace: ' . $e->getTraceAsString());
        \Log::info('=== PROJECT CREATION DEBUG END (CREATION ERROR) ===');

        return redirect()->back()->withErrors([
            'general' => 'Failed to create project. Please try again. Error: ' . $e->getMessage()
        ])->withInput();
    }
}

    /**
     * Dedicated search API endpoint for faster AJAX requests with workspace filtering
     */
    public function search(Request $request): JsonResponse
    {
        $user = Auth::user();
        $search = $request->input('q', '');
        $filter = $request->input('filter', 'all');
        $type = $request->input('type', 'all');
        $sort = $request->input('sort', 'updated_at');
        $limit = $request->input('limit', 20);
        $workspaceId = $request->input('workspace');

        if (strlen($search) < 2) {
            return response()->json([
                'success' => false,
                'message' => 'Search query must be at least 2 characters long'
            ], 400);
        }

        $query = $user->projects()->with(['workspace']);

        // Apply workspace filtering in search
        if ($workspaceId) {
            $workspace = Workspace::find($workspaceId);
            if ($workspace && $workspace->hasUser($user->id)) {
                $query->where('workspace_id', $workspace->id);
            }
        }

        // Apply search
        $query->where(function($q) use ($search) {
            $q->where('name', 'like', '%' . $search . '%')
              ->orWhere('description', 'like', '%' . $search . '%');
        });

        // Apply filters (same as index method)
        switch ($filter) {
            case 'recent':
                $query->where('updated_at', '>', now()->subDays(7));
                break;
            case 'draft':
                $query->where('status', 'draft');
                break;
            case 'published':
                $query->where('status', 'published');
                break;
            case 'active':
                $query->where('status', 'active');
                break;
            case 'archived':
                $query->where('status', 'archived');
                break;
        }

        if ($type !== 'all') {
            $query->where('type', $type);
        }

        // Apply sorting
        switch ($sort) {
            case 'name':
                $query->orderBy('name', 'asc');
                break;
            case 'created_at':
                $query->orderBy('created_at', 'desc');
                break;
            case 'updated_at':
            default:
                $query->orderBy('updated_at', 'desc');
                break;
        }

        $projects = $query->limit($limit)->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'uuid' => $project->uuid,
                    'name' => $project->name,
                    'description' => $project->description,
                    'type' => $project->type,
                    'status' => $project->status,
                    'thumbnail' => $project->thumbnail ? asset('storage/' . $project->thumbnail) : null,
                    'updated_at' => $project->updated_at,
                    'created_at' => $project->created_at,
                    'workspace' => $project->workspace ? [
                        'id' => $project->workspace->id,
                        'name' => $project->workspace->name,
                    ] : null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $projects,
            'total' => $projects->count(),
            'query' => $search
        ]);
    }

    public function duplicate(Request $request, Project $project): RedirectResponse
    {
        $user = Auth::user();
        
        // Check if user can access this project
        if ($project->user_id !== $user->id && !$project->is_public) {
            abort(403, 'You do not have permission to duplicate this project');
        }

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'workspace_id' => 'nullable|exists:workspaces,id'
        ]);

        // Enhanced workspace validation for duplication
        $workspaceId = $validated['workspace_id'] ?? null;
        if ($workspaceId) {
            $workspace = Workspace::find($workspaceId);
            if (!$workspace || !$workspace->hasUser($user->id)) {
                return redirect()->back()->withErrors([
                    'workspace_id' => 'You do not have access to this workspace'
                ]);
            }
            
            // Check if user can create projects in this workspace
            $userRole = $workspace->getUserRole($user->id);
            if (!in_array($userRole, ['owner', 'editor'])) {
                return redirect()->back()->withErrors([
                    'workspace_id' => 'You do not have permission to create projects in this workspace'
                ]);
            }
        } else {
            // Use current workspace or personal workspace
            $workspace = $user->getCurrentWorkspace();
            if (!$workspace || !$workspace->hasUser($user->id)) {
                $workspace = $user->getPersonalWorkspace() ?? $user->ensurePersonalWorkspace();
            }
            $workspaceId = $workspace->id;
        }

        try {
            $newProject = $project->duplicate($validated['name'] ?? null);
            $newProject->user_id = $user->id; // Set current user as owner
            $newProject->workspace_id = $workspaceId; // Set workspace
            $newProject->is_public = false; // Duplicates are private by default
            $newProject->save();

            \Log::info('Project duplicated successfully', [
                'original_project_id' => $project->id,
                'new_project_id' => $newProject->id,
                'workspace_id' => $workspaceId,
                'user_id' => $user->id
            ]);

            // BROADCAST PROJECT CREATION (duplicate creates a new project)
            try {
                broadcast(new \App\Events\ProjectCreated($newProject, $workspace, $user))->toOthers();
                \Log::info('Project duplication broadcasted');
            } catch (\Exception $e) {
                \Log::warning('Failed to broadcast project duplication: ' . $e->getMessage());
            }

            return redirect()->route('void.index', [
                'project' => $newProject->uuid,
                'workspace' => $workspaceId
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to duplicate project', [
                'original_project_id' => $project->id,
                'workspace_id' => $workspaceId,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return redirect()->back()->withErrors([
                'general' => 'Failed to duplicate project. Please try again.'
            ]);
        }
    }

    /**
     * Move project to different workspace
     */
    public function moveToWorkspace(Request $request, Project $project): JsonResponse
    {
        $user = Auth::user();
        
        // Check ownership
        if ($project->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to move this project'
            ], 403);
        }

        $validated = $request->validate([
            'workspace_id' => 'required|exists:workspaces,id'
        ]);

        $workspace = Workspace::find($validated['workspace_id']);
        
        // Check if user has access to target workspace
        if (!$workspace || !$workspace->hasUser($user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have access to the target workspace'
            ], 403);
        }

        // Check if user can create projects in target workspace
        $userRole = $workspace->getUserRole($user->id);
        if (!in_array($userRole, ['owner', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to move projects to this workspace'
            ], 403);
        }

        try {
            $project->update(['workspace_id' => $workspace->id]);

            \Log::info('Project moved to workspace', [
                'project_id' => $project->id,
                'old_workspace_id' => $project->getOriginal('workspace_id'),
                'new_workspace_id' => $workspace->id,
                'user_id' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'project' => $project->fresh(),
                    'workspace' => [
                        'id' => $workspace->id,
                        'name' => $workspace->name,
                        'type' => $workspace->type,
                    ]
                ],
                'message' => 'Project moved successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to move project to workspace', [
                'project_id' => $project->id,
                'workspace_id' => $workspace->id,
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to move project: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Project $project): JsonResponse
    {
        $user = Auth::user();
        
        // Check ownership
        if ($project->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to delete this project'
            ], 403);
        }

        // Store project info before deletion for broadcasting
        $projectId = $project->id;
        $projectUuid = $project->uuid;
        $projectName = $project->name;
        $workspaceId = $project->workspace_id;
        $deletedBy = $user->name;

        try {
            // Get all frames for this project
            $frames = \App\Models\Frame::where('project_id', $project->id)->get();
            
            \Log::info('Deleting project with frames', [
                'project_id' => $project->id,
                'frame_count' => $frames->count()
            ]);
            
            // Delete each frame and its components
            foreach ($frames as $frame) {
                // Delete project components for this frame
                \App\Models\ProjectComponent::where('frame_id', $frame->id)->delete();
                
                // Delete frame thumbnail if exists
                $settings = $frame->settings ?? [];
                if (isset($settings['thumbnail_path'])) {
                    $thumbnailPath = storage_path('app/public/' . $settings['thumbnail_path']);
                    if (file_exists($thumbnailPath)) {
                        @unlink($thumbnailPath);
                    }
                }
                
                // Delete the frame
                $frame->delete();
            }
            
            // Delete project thumbnail if exists
            if ($project->thumbnail) {
                \Storage::disk('public')->delete($project->thumbnail);
            }

            // Delete the project
            $project->delete();

            \Log::info('Project and all frames deleted successfully', [
                'project_id' => $projectId,
                'frames_deleted' => $frames->count()
            ]);

            // BROADCAST PROJECT DELETION
            try {
                broadcast(new \App\Events\ProjectDeleted($projectId, $projectUuid, $projectName, $workspaceId, $deletedBy))->toOthers();
                \Log::info('Project deletion broadcasted', ['project_id' => $projectId, 'workspace_id' => $workspaceId]);
            } catch (\Exception $e) {
                \Log::warning('Failed to broadcast project deletion: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Project, frames, and components deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error deleting project', [
                'project_id' => $project->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete project: ' . $e->getMessage()
            ], 500);
        }
    }

    public function templates(): JsonResponse
    {
        $templates = Project::where('is_public', true)
            ->where('status', 'published')
            ->with(['user:id,name,avatar', 'workspace:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'uuid' => $project->uuid,
                    'name' => $project->name,
                    'description' => $project->description,
                    'type' => $project->type,
                    'thumbnail' => $project->thumbnail ? asset('storage/' . $project->thumbnail) : null,
                    'author' => $project->user,
                    'workspace' => $project->workspace ? [
                        'id' => $project->workspace->id,
                        'name' => $project->workspace->name,
                    ] : null,
                    'created_at' => $project->created_at,
                    'frame_count' => count($project->canvas_data['frames'] ?? []),
                    'viewport_width' => $project->viewport_width,
                    'viewport_height' => $project->viewport_height,
                    'css_framework' => $project->css_framework,
                    'output_format' => $project->output_format,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $templates
        ]);
    }

    public function updateThumbnail(Request $request, Project $project): JsonResponse
    {
        $user = Auth::user();
        
        // Check ownership
        if ($project->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to update this project'
            ], 403);
        }

        $request->validate([
            'thumbnail' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048'
        ]);

        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail if exists
            if ($project->thumbnail) {
                \Storage::disk('public')->delete($project->thumbnail);
            }

            // Store new thumbnail
            $path = $request->file('thumbnail')->store('project-thumbnails', 'public');
            
            $project->update(['thumbnail' => $path]);

            return response()->json([
                'success' => true,
                'data' => ['thumbnail_url' => asset('storage/' . $path)],
                'message' => 'Thumbnail updated successfully'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No thumbnail file provided'
        ], 400);
    }

    /**
     * Generate project thumbnail using Playwright (PRIMARY method)
     * Falls back to frontend canvas snapshot if Playwright fails
     */
    public function generateThumbnailPlaywright(Request $request, Project $project): JsonResponse
    {
        $user = Auth::user();
        
        \Log::info('🎬 PLAYWRIGHT THUMBNAIL GENERATION STARTED', [
            'project_id' => $project->uuid,
            'project_name' => $project->name,
            'user_id' => $user->id
        ]);
        
        // Check ownership
        if ($project->user_id !== $user->id) {
            \Log::warning('❌ Unauthorized thumbnail generation attempt', [
                'project_id' => $project->uuid,
                'user_id' => $user->id,
                'owner_id' => $project->user_id
            ]);
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to update this project'
            ], 403);
        }

        try {
            $playwrightService = new VoidPagePlaywrightService();
            
            // Check if Playwright is available
            if (!$playwrightService->checkPlaywrightAvailability()) {
                \Log::warning('⚠️ Playwright not available, client should use fallback', [
                    'project_id' => $project->uuid
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Playwright not available',
                    'fallback_required' => true,
                    'method' => 'playwright_unavailable'
                ], 503);
            }
            
            // Generate thumbnail with Playwright
            $thumbnailPath = $playwrightService->generateVoidPageThumbnail($project, [
                'width' => $request->input('width', 1600),
                'height' => $request->input('height', 1000),
                'quality' => $request->input('quality', 90),
                'wait_time' => $request->input('wait_time', 3000),
            ]);
            
            if (!$thumbnailPath) {
                \Log::error('❌ Playwright thumbnail generation returned null', [
                    'project_id' => $project->uuid
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Playwright generation failed',
                    'fallback_required' => true,
                    'method' => 'playwright_failed'
                ], 500);
            }
            
            // Get the URL for the thumbnail
            $thumbnailUrl = $playwrightService->getThumbnailUrl($project);
            
            \Log::info('✅ PLAYWRIGHT THUMBNAIL GENERATED SUCCESSFULLY!', [
                'project_id' => $project->uuid,
                'thumbnail_url' => $thumbnailUrl,
                'method' => $project->thumbnail_method
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Thumbnail generated successfully with Playwright',
                'thumbnail_url' => $thumbnailUrl,
                'method' => $project->thumbnail_method,
                'updated_at' => $project->thumbnail_updated_at
            ]);
            
        } catch (\Exception $e) {
            \Log::error('❌ PLAYWRIGHT THUMBNAIL GENERATION EXCEPTION', [
                'project_id' => $project->uuid,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Exception during Playwright generation: ' . $e->getMessage(),
                'fallback_required' => true,
                'method' => 'playwright_exception'
            ], 500);
        }
    }

    /**
     * Update project thumbnail from canvas snapshot
     * Framer-style canvas snapshot upload (FALLBACK method)
     */
    public function updateThumbnailFromSnapshot(Request $request, Project $project): JsonResponse
    {
        $user = Auth::user();
        
        \Log::info('📸 PROJECT THUMBNAIL UPLOAD STARTED (Frontend Fallback)', [
            'project_id' => $project->uuid,
            'project_name' => $project->name,
            'user_id' => $user->id
        ]);
        
        // Check ownership
        if ($project->user_id !== $user->id) {
            \Log::warning('❌ Unauthorized thumbnail upload attempt', [
                'project_id' => $project->uuid,
                'user_id' => $user->id,
                'owner_id' => $project->user_id
            ]);
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to update this project'
            ], 403);
        }

        $request->validate([
            'snapshot' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // 5MB max for snapshots
            'method' => 'sometimes|string'
        ]);

        try {
            if ($request->hasFile('snapshot')) {
                $file = $request->file('snapshot');
                \Log::info('📦 Snapshot file received', [
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'original_name' => $file->getClientOriginalName()
                ]);
                
                // Delete old thumbnail if exists
                if ($project->thumbnail) {
                    \Storage::disk('public')->delete($project->thumbnail);
                    \Log::info('🗑️ Old thumbnail deleted', ['path' => $project->thumbnail]);
                }

                // Store new thumbnail from snapshot
                $path = $request->file('snapshot')->store('thumbnails/projects', 'public');
                \Log::info('💾 New thumbnail stored', ['path' => $path]);
                
                // Update project with new thumbnail
                $project->update([
                    'thumbnail' => $path,
                    'thumbnail_method' => 'frontend_' . $request->input('method', 'canvas_snapshot'),
                    'thumbnail_updated_at' => now()
                ]);
                
                $thumbnailUrl = \Storage::url($path);
                \Log::info('✅ PROJECT THUMBNAIL UPDATED SUCCESSFULLY!', [
                    'project_id' => $project->uuid,
                    'thumbnail_url' => $thumbnailUrl,
                    'full_url' => asset('storage/' . $path)
                ]);

                return response()->json([
                    'success' => true,
                    'thumbnail_url' => $thumbnailUrl,
                    'generated_at' => now()->toISOString(),
                    'method' => 'canvas_snapshot',
                    'message' => 'Project thumbnail updated from canvas snapshot'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'No snapshot file provided'
            ], 400);

        } catch (\Exception $e) {
            \Log::error('Canvas snapshot upload failed', [
                'project_id' => $project->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to upload canvas snapshot: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new frame in the project
     */
    public function createFrame(Request $request, Project $project): JsonResponse
    {
        $user = Auth::user();
        
        if ($project->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to modify this project'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:page,component',
            'width' => 'nullable|integer|min:320|max:3840',
            'height' => 'nullable|integer|min:240|max:2160',
            'x' => 'nullable|integer',
            'y' => 'nullable|integer',
            'background' => 'nullable|string'
        ]);

        $canvasData = $project->canvas_data ?? ['frames' => []];
        
        $newFrame = [
            'id' => 'frame_' . uniqid(),
            'name' => $validated['name'],
            'type' => $validated['type'],
            'width' => $validated['width'] ?? $project->viewport_width,
            'height' => $validated['height'] ?? $project->viewport_height,
            'x' => $validated['x'] ?? (count($canvasData['frames']) * 300),
            'y' => $validated['y'] ?? 0,
            'background' => $validated['background'] ?? '#ffffff',
            'components' => [],
            'created_at' => now()->toISOString(),
        ];

        $canvasData['frames'][] = $newFrame;
        
        $project->update(['canvas_data' => $canvasData]);

        return response()->json([
            'success' => true,
            'data' => $newFrame,
            'message' => 'Frame created successfully'
        ]);
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $user = Auth::user();
        
        // Check ownership
        if ($project->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to update this project'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string|max:1000',
            'type' => [
                'sometimes',
                Rule::in(['website', 'landing_page', 'component_library', 'prototype', 'email_template', 'dashboard'])
            ],
            'status' => [
                'sometimes',
                Rule::in(['draft', 'active', 'archived', 'published'])
            ],
            'settings' => 'sometimes|array',
            'canvas_data' => 'sometimes|array',
            'export_settings' => 'sometimes|array',
            'viewport_width' => 'sometimes|integer|min:320|max:3840',
            'viewport_height' => 'sometimes|integer|min:240|max:2160',
            'css_framework' => [
                'sometimes',
                Rule::in(['tailwind', 'bootstrap', 'vanilla', 'styled_components', 'emotion'])
            ],
            'output_format' => [
                'sometimes',
                Rule::in(['html', 'react', 'vue', 'angular'])
            ],
            'is_public' => 'sometimes|boolean',
            'workspace_id' => 'sometimes|exists:workspaces,id'
        ]);

        // If changing workspace, verify access
        if (isset($validated['workspace_id'])) {
            $workspace = Workspace::find($validated['workspace_id']);
            if (!$workspace || !$workspace->hasUser($user->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have access to the specified workspace'
                ], 403);
            }
        }

        $project->update($validated);

        return response()->json([
            'success' => true,
            'data' => $project->fresh(),
            'message' => 'Project updated successfully'
        ]);
    }
}