<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Workspace;
use App\Models\WorkspaceUser;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WorkspaceRoleController extends Controller
{
    /**
     * Update a user's role in the workspace
     */
    public function updateRole(Request $request, Workspace $workspace): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'role' => 'required|in:editor,viewer',
        ]);

        $currentUser = Auth::user();

        // Check if current user is owner
        if ($workspace->owner_id !== $currentUser->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only workspace owner can change roles'
            ], 403);
        }

        // Find workspace user
        $workspaceUser = WorkspaceUser::where('workspace_id', $workspace->id)
            ->where('user_id', $validated['user_id'])
            ->first();

        if (!$workspaceUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found in workspace'
            ], 404);
        }

        // Prevent changing owner's own role
        if ($workspaceUser->user_id === $workspace->owner_id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot change owner role. Transfer ownership instead.'
            ], 400);
        }

        // Update role
        $oldRole = $workspaceUser->role;
        $workspaceUser->update(['role' => $validated['role']]);

        Log::info('Role updated', [
            'workspace_id' => $workspace->id,
            'user_id' => $validated['user_id'],
            'old_role' => $oldRole,
            'new_role' => $validated['role'],
            'changed_by' => $currentUser->id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Role updated successfully',
            'data' => $workspaceUser->load('user')
        ]);
    }

    /**
     * Transfer workspace ownership to another user
     */
    public function transferOwnership(Request $request, Workspace $workspace): JsonResponse
    {
        $validated = $request->validate([
            'new_owner_id' => 'required|integer|exists:users,id',
        ]);

        $currentUser = Auth::user();

        // Check if current user is owner
        if ($workspace->owner_id !== $currentUser->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only workspace owner can transfer ownership'
            ], 403);
        }

        // Check if trying to transfer to self
        if ($validated['new_owner_id'] === $currentUser->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are already the owner'
            ], 400);
        }

        // Find new owner's workspace user record
        $newOwnerWorkspaceUser = WorkspaceUser::where('workspace_id', $workspace->id)
            ->where('user_id', $validated['new_owner_id'])
            ->first();

        if (!$newOwnerWorkspaceUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not found in workspace'
            ], 404);
        }

        // Check if new owner is at least an editor
        if (!in_array($newOwnerWorkspaceUser->role, ['editor', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only editors can become workspace owner'
            ], 400);
        }

        DB::beginTransaction();

        try {
            // Update workspace owner
            $workspace->update(['owner_id' => $validated['new_owner_id']]);

            // Update new owner's role to owner
            $newOwnerWorkspaceUser->update(['role' => 'owner']);

            // Demote old owner to editor
            $oldOwnerWorkspaceUser = WorkspaceUser::where('workspace_id', $workspace->id)
                ->where('user_id', $currentUser->id)
                ->first();

            if ($oldOwnerWorkspaceUser) {
                $oldOwnerWorkspaceUser->update(['role' => 'editor']);
            }

            DB::commit();

            Log::info('Ownership transferred', [
                'workspace_id' => $workspace->id,
                'old_owner_id' => $currentUser->id,
                'new_owner_id' => $validated['new_owner_id']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ownership transferred successfully',
                'data' => [
                    'workspace' => $workspace->fresh(),
                    'new_owner' => $newOwnerWorkspaceUser->load('user'),
                    'old_owner' => $oldOwnerWorkspaceUser->load('user')
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Ownership transfer failed', [
                'workspace_id' => $workspace->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ownership transfer failed'
            ], 500);
        }
    }

    /**
     * Get current user's role in workspace
     */
    public function getMyRole(Workspace $workspace): JsonResponse
    {
        $currentUser = Auth::user();

        $workspaceUser = WorkspaceUser::where('workspace_id', $workspace->id)
            ->where('user_id', $currentUser->id)
            ->first();

        if (!$workspaceUser) {
            return response()->json([
                'success' => false,
                'message' => 'You are not a member of this workspace'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'role' => $workspaceUser->role,
                'is_owner' => $workspace->owner_id === $currentUser->id,
                'permissions' => $this->getRolePermissions($workspaceUser->role)
            ]
        ]);
    }

    /**
     * Get permissions for a role
     */
    private function getRolePermissions(string $role): array
    {
        return match($role) {
            'owner' => [
                'can_edit' => true,
                'can_delete' => true,
                'can_invite' => true,
                'can_manage_roles' => true,
                'can_transfer_ownership' => true,
            ],
            'admin' => [
                'can_edit' => true,
                'can_delete' => true,
                'can_invite' => true,
                'can_manage_roles' => false,
                'can_transfer_ownership' => false,
            ],
            'editor' => [
                'can_edit' => true,
                'can_delete' => false,
                'can_invite' => false,
                'can_manage_roles' => false,
                'can_transfer_ownership' => false,
            ],
            'viewer' => [
                'can_edit' => false,
                'can_delete' => false,
                'can_invite' => false,
                'can_manage_roles' => false,
                'can_transfer_ownership' => false,
            ],
            default => []
        };
    }
}
