<?php
// app/Http/Controllers/WorkspaceController.php
namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceController extends Controller
{
    public function index(): JsonResponse
    {
        $user = Auth::user();
        
        // Get all workspaces the user has access to
        $workspaces = $user->getAllWorkspaces();
        
        // Load additional data
        $workspaces->load(['owner', 'users']);
        
        // Transform the data for frontend
        $workspacesData = $workspaces->map(function ($workspace) use ($user) {
            return [
                'id' => $workspace->id,
                'uuid' => $workspace->uuid,
                'name' => $workspace->name,
                'description' => $workspace->description,
                'type' => $workspace->type,
                'settings' => $workspace->settings,
                'owner' => [
                    'id' => $workspace->owner->id,
                    'name' => $workspace->owner->name,
                    'email' => $workspace->owner->email,
                    'avatar' => $workspace->owner->avatar,
                ],
                'users' => $workspace->users->map(function ($workspaceUser) {
                    return [
                        'id' => $workspaceUser->id,
                        'name' => $workspaceUser->name,
                        'email' => $workspaceUser->email,
                        'avatar' => $workspaceUser->avatar,
                        'role' => $workspaceUser->pivot->role,
                        'joined_at' => $workspaceUser->pivot->joined_at,
                    ];
                }),
                'user_role' => $workspace->getUserRole($user->id),
                'member_count' => $workspace->users->count() + 1, // +1 for owner
                'project_count' => $workspace->projects()->count(),
                'created_at' => $workspace->created_at,
                'updated_at' => $workspace->updated_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $workspacesData
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|min:2|max:50',
            'description' => 'nullable|string|max:200',
            'type' => 'required|in:personal,team,company',
            'settings' => 'nullable|array',
            'settings.privacy' => 'nullable|in:private,public'
        ]);

        try {
            $workspace = Workspace::create([
                'owner_id' => Auth::id(),
                'name' => $validated['name'],
                'description' => $validated['description'] ?? '',
                'type' => $validated['type'],
                'settings' => array_merge(
                    (new Workspace())->getDefaultSettings(),
                    $validated['settings'] ?? []
                )
            ]);

            $workspace->load(['owner', 'users']);

            // Transform for frontend
            $workspaceData = [
                'id' => $workspace->id,
                'uuid' => $workspace->uuid,
                'name' => $workspace->name,
                'description' => $workspace->description,
                'type' => $workspace->type,
                'settings' => $workspace->settings,
                'owner' => [
                    'id' => $workspace->owner->id,
                    'name' => $workspace->owner->name,
                    'email' => $workspace->owner->email,
                    'avatar' => $workspace->owner->avatar,
                ],
                'users' => $workspace->users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'avatar' => $user->avatar,
                        'role' => $user->pivot->role,
                        'joined_at' => $user->pivot->joined_at,
                    ];
                }),
                'user_role' => 'owner',
                'member_count' => 1,
                'project_count' => 0,
                'created_at' => $workspace->created_at,
                'updated_at' => $workspace->updated_at,
            ];

            return response()->json([
                'success' => true,
                'data' => $workspaceData,
                'message' => 'Workspace created successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create workspace: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Workspace $workspace): JsonResponse
    {
        $user = Auth::user();
        
        // Check if user has access
        if (!$workspace->hasUser($user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have access to this workspace'
            ], 403);
        }

        $workspace->load(['owner', 'users', 'projects']);

        // Transform for frontend
        $workspaceData = [
            'id' => $workspace->id,
            'uuid' => $workspace->uuid,
            'name' => $workspace->name,
            'description' => $workspace->description,
            'type' => $workspace->type,
            'settings' => $workspace->settings,
            'owner' => [
                'id' => $workspace->owner->id,
                'name' => $workspace->owner->name,
                'email' => $workspace->owner->email,
                'avatar' => $workspace->owner->avatar,
            ],
            'users' => $workspace->users->map(function ($workspaceUser) {
                return [
                    'id' => $workspaceUser->id,
                    'name' => $workspaceUser->name,
                    'email' => $workspaceUser->email,
                    'avatar' => $workspaceUser->avatar,
                    'role' => $workspaceUser->pivot->role,
                    'joined_at' => $workspaceUser->pivot->joined_at,
                ];
            }),
            'projects' => $workspace->projects->map(function ($project) {
                return [
                    'id' => $project->id,
                    'uuid' => $project->uuid,
                    'name' => $project->name,
                    'description' => $project->description,
                    'type' => $project->type,
                    'status' => $project->status,
                    'thumbnail' => $project->thumbnail ? asset('storage/' . $project->thumbnail) : null,
                    'last_opened_at' => $project->last_opened_at,
                    'created_at' => $project->created_at,
                    'updated_at' => $project->updated_at,
                ];
            }),
            'user_role' => $workspace->getUserRole($user->id),
            'member_count' => $workspace->users->count() + 1,
            'project_count' => $workspace->projects->count(),
            'created_at' => $workspace->created_at,
            'updated_at' => $workspace->updated_at,
        ];
        
        return response()->json([
            'success' => true,
            'data' => $workspaceData
        ]);
    }

    public function update(Request $request, Workspace $workspace): JsonResponse
    {
        $user = Auth::user();
        
        // Check if user can edit workspace (owner or editor)
        if (!$workspace->canUserEdit($user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to edit this workspace'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|min:2|max:50',
            'description' => 'nullable|string|max:200',
            'type' => 'sometimes|required|in:personal,team,company',
            'settings' => 'nullable|array',
            'settings.privacy' => 'nullable|in:private,public',
            'settings.allow_public_projects' => 'nullable|boolean',
            'settings.default_project_privacy' => 'nullable|in:private,public'
        ]);

        try {
            DB::beginTransaction();

            $updateData = [];
            $wasPersonal = $workspace->type === 'personal';
            $isBecomingTeam = isset($validated['type']) && $validated['type'] !== 'personal' && $wasPersonal;
            $converted = false;
            
            // Handle personal workspace to team/company conversion
            if ($isBecomingTeam) {
                // Only owner can convert personal workspace
                if ($workspace->owner_id !== $user->id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Only the workspace owner can convert a personal workspace'
                    ], 403);
                }
            
                // Create a new personal workspace for the user
                $newPersonalWorkspace = Workspace::create([
                    'owner_id' => $user->id,
                    'name' => $user->name . "'s Personal Workspace",
                    'description' => 'Personal workspace for individual projects',
                    'type' => 'personal',
                    'settings' => [
                        'privacy' => 'private',
                        'allow_public_projects' => false,
                        'default_project_privacy' => 'private',
                        'invite_permissions' => [
                            'editors_can_invite' => true,
                            'viewers_can_invite' => false
                        ]
                    ]
                ]);
            
                $converted = true;
            
                \Log::info('Created new personal workspace', [
                    'user_id' => $user->id,
                    'new_workspace_id' => $newPersonalWorkspace->id,
                    'new_workspace_uuid' => $newPersonalWorkspace->uuid,
                    'old_workspace_id' => $workspace->id,
                    'old_workspace_uuid' => $workspace->uuid
                ]);
            }
            
            if (isset($validated['name'])) {
                $updateData['name'] = $validated['name'];
            }
            
            if (array_key_exists('description', $validated)) {
                $updateData['description'] = $validated['description'];
            }

            if (isset($validated['type'])) {
                $updateData['type'] = $validated['type'];
            }
            
            if (isset($validated['settings'])) {
                $updateData['settings'] = array_merge(
                    $workspace->settings ?? [],
                    $validated['settings']
                );
            }

            $workspace->update($updateData);
            $workspace->load(['owner', 'users']);

            \Log::info('Updated workspace', [
                'workspace_id' => $workspace->id,
                'workspace_uuid' => $workspace->uuid,
                'was_personal' => $wasPersonal,
                'is_becoming_team' => $isBecomingTeam,
                'new_type' => $workspace->type
            ]);

            DB::commit();

            // Transform for frontend
            $workspaceData = [
                'id' => $workspace->id,
                'uuid' => $workspace->uuid,
                'name' => $workspace->name,
                'description' => $workspace->description,
                'type' => $workspace->type,
                'settings' => $workspace->settings,
                'owner' => [
                    'id' => $workspace->owner->id,
                    'name' => $workspace->owner->name,
                    'email' => $workspace->owner->email,
                    'avatar' => $workspace->owner->avatar,
                ],
                'users' => $workspace->users->map(function ($workspaceUser) {
                    return [
                        'id' => $workspaceUser->id,
                        'name' => $workspaceUser->name,
                        'email' => $workspaceUser->email,
                        'avatar' => $workspaceUser->avatar,
                        'role' => $workspaceUser->pivot->role,
                        'joined_at' => $workspaceUser->pivot->joined_at,
                    ];
                }),
                'user_role' => $workspace->getUserRole($user->id),
                'member_count' => $workspace->users->count() + 1,
                'project_count' => $workspace->projects()->count(),
                'created_at' => $workspace->created_at,
                'updated_at' => $workspace->updated_at,
            ];

                      $response = [
              'success' => true,
              'data' => $workspaceData,
              'message' => 'Workspace updated successfully',
              'converted' => $converted
          ];
          
          // If we created a new personal workspace, include it in the response
          if ($converted && isset($newPersonalWorkspace)) {
              $response['new_personal_workspace'] = [
                  'id' => $newPersonalWorkspace->id,
                  'uuid' => $newPersonalWorkspace->uuid,
                  'name' => $newPersonalWorkspace->name,
                  'description' => $newPersonalWorkspace->description,
                  'type' => $newPersonalWorkspace->type,
                  'settings' => $newPersonalWorkspace->settings,
                  'owner' => [
                      'id' => $user->id,
                      'name' => $user->name,
                      'email' => $user->email,
                      'avatar' => $user->avatar,
                  ],
                  'users' => [],
                  'user_role' => 'owner',
                  'member_count' => 1,
                  'project_count' => 0,
                  'created_at' => $newPersonalWorkspace->created_at,
                  'updated_at' => $newPersonalWorkspace->updated_at,
              ];
              
              // Add conversion details for frontend
              $response['conversion_details'] = [
                  'converted_workspace_id' => $workspace->id,
                  'converted_workspace_uuid' => $workspace->uuid,
                  'new_personal_workspace_id' => $newPersonalWorkspace->id,
                  'should_open_invite_modal' => true
              ];
          }
          
          return response()->json($response);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to update workspace', [
                'workspace_id' => $workspace->id,
                'workspace_uuid' => $workspace->uuid,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update workspace: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Workspace $workspace): JsonResponse
    {
        $user = Auth::user();
        
        // Only owner can delete workspace
        if ($workspace->owner_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only the workspace owner can delete the workspace'
            ], 403);
        }

        // Don't allow deleting workspace if it has projects
        if ($workspace->projects()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete workspace with existing projects. Please delete or move all projects first.'
            ], 400);
        }

        // Don't allow deleting personal workspace
        if ($workspace->type === 'personal') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete personal workspace'
            ], 400);
        }

        try {
            $workspace->delete();

            return response()->json([
                'success' => true,
                'message' => 'Workspace deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete workspace: ' . $e->getMessage()
            ], 500);
        }
    }

    public function settings(Workspace $workspace): Response
    {
        $user = Auth::user();
        
        // Check if user has access
        if (!$workspace->hasUser($user->id)) {
            abort(403, 'You do not have access to this workspace');
        }

        $workspace->load(['owner', 'users', 'invites' => function ($query) {
            $query->active()->orderBy('created_at', 'desc');
        }]);

        return Inertia::render('Workspaces/Settings', [
            'workspace' => [
                'id' => $workspace->id,
                'uuid' => $workspace->uuid,
                'name' => $workspace->name,
                'description' => $workspace->description,
                'type' => $workspace->type,
                'settings' => $workspace->settings,
                'owner' => [
                    'id' => $workspace->owner->id,
                    'name' => $workspace->owner->name,
                    'email' => $workspace->owner->email,
                    'avatar' => $workspace->owner->avatar,
                ],
                'users' => $workspace->users->map(function ($workspaceUser) {
                    return [
                        'id' => $workspaceUser->id,
                        'name' => $workspaceUser->name,
                        'email' => $workspaceUser->email,
                        'avatar' => $workspaceUser->avatar,
                        'role' => $workspaceUser->pivot->role,
                        'joined_at' => $workspaceUser->pivot->joined_at,
                    ];
                }),
                'invites' => $workspace->invites->map(function ($invite) {
                    return [
                        'id' => $invite->id,
                        'email' => $invite->email,
                        'role' => $invite->role,
                        'status' => $invite->status,
                        'expires_at' => $invite->expires_at,
                        'created_at' => $invite->created_at,
                    ];
                }),
                'user_role' => $workspace->getUserRole($user->id),
                'member_count' => $workspace->users->count() + 1,
                'project_count' => $workspace->projects()->count(),
                'created_at' => $workspace->created_at,
                'updated_at' => $workspace->updated_at,
            ],
            'can_edit' => $workspace->canUserEdit($user->id),
            'can_invite' => $workspace->canUserInvite($user->id),
            'is_owner' => $workspace->owner_id === $user->id,
        ]);
    }

    public function updateUserRole(Request $request, Workspace $workspace, User $user): JsonResponse
    {
        $currentUser = Auth::user();
        
        // Only owner can change user roles
        if ($workspace->owner_id !== $currentUser->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only the workspace owner can change user roles'
            ], 403);
        }

        $validated = $request->validate([
            'role' => 'required|in:editor,viewer'
        ]);

        try {
            $workspace->updateUserRole($user->id, $validated['role']);

            return response()->json([
                'success' => true,
                'message' => 'User role updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user role: ' . $e->getMessage()
            ], 500);
        }
    }

    public function removeUser(Request $request, Workspace $workspace, User $user): JsonResponse
    {
        $currentUser = Auth::user();
        
        // Only owner can remove users, or users can remove themselves
        if ($workspace->owner_id !== $currentUser->id && $currentUser->id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to remove this user'
            ], 403);
        }

        // Can't remove the owner
        if ($workspace->owner_id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot remove the workspace owner'
            ], 400);
        }

        try {
            $workspace->removeUser($user->id);

            return response()->json([
                'success' => true,
                'message' => $currentUser->id === $user->id ? 'You have left the workspace' : 'User removed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove user: ' . $e->getMessage()
            ], 500);
        }
    }
}