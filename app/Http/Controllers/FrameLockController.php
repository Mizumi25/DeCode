<?php
// app/Http/Controllers/FrameLockController.php

namespace App\Http\Controllers;

use App\Models\Frame;
use App\Models\FrameLockRequest;
use App\Events\FrameLockStatusChanged;
use App\Events\FrameLockRequestCreated;
use App\Events\FrameLockRequestResponded;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class FrameLockController extends Controller
{
    /**
     * Toggle lock status of a frame
     */
    public function toggleLock(Request $request, Frame $frame): JsonResponse
    {
        $user = Auth::user();
        
        try {
            if ($frame->is_locked) {
                // Try to unlock
                if (!$frame->canUserUnlock($user->id)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You do not have permission to unlock this frame.',
                    ], 403);
                }
                
                $frame->unlock();
                
                // Broadcast unlock event
                broadcast(new FrameLockStatusChanged($user, $frame, 'unlocked'))->toOthers();
                
                Log::info('Frame unlocked', [
                    'frame_id' => $frame->id,
                    'frame_uuid' => $frame->uuid,
                    'user_id' => $user->id,
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Frame unlocked successfully.',
                    'lock_status' => $frame->fresh()->getLockStatusForUser($user->id),
                ]);
                
            } else {
                // Try to lock
                $validated = $request->validate([
                    'mode' => ['required', Rule::in(['forge', 'source'])],
                    'reason' => 'nullable|string|max:255',
                ]);
                
                if (!$frame->canUserLock($user->id)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You do not have permission to lock this frame.',
                    ], 403);
                }
                
                $frame->lock($user->id, $validated['mode'], $validated['reason'] ?? null);
                
                // Broadcast lock event
                broadcast(new FrameLockStatusChanged($user, $frame->fresh(), 'locked', $validated['mode']))->toOthers();
                
                Log::info('Frame locked', [
                    'frame_id' => $frame->id,
                    'frame_uuid' => $frame->uuid,
                    'user_id' => $user->id,
                    'mode' => $validated['mode'],
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Frame locked successfully.',
                    'lock_status' => $frame->fresh()->getLockStatusForUser($user->id),
                ]);
            }
            
        } catch (\Exception $e) {
            Log::error('Frame lock toggle error', [
                'frame_id' => $frame->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while changing lock status.',
            ], 500);
        }
    }

    /**
     * Request access to a locked frame
     */
    public function requestAccess(Request $request, Frame $frame): JsonResponse
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'mode' => ['required', Rule::in(['forge', 'source'])],
            'message' => 'nullable|string|max:500',
        ]);
        
        try {
            // Check if frame is locked
            if (!$frame->is_locked) {
                return response()->json([
                    'success' => false,
                    'message' => 'Frame is not locked.',
                ], 400);
            }
            
            // Check if user can request access
            if (!$frame->canUserRequest($user->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to request access to this frame.',
                ], 403);
            }
            
            // Check for existing pending request
            if ($frame->hasActiveLockRequest($user->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You already have a pending request for this frame.',
                ], 400);
            }
            
            // Create the lock request
            $lockRequest = $frame->createLockRequest(
                $user->id,
                $validated['mode'],
                $validated['message']
            );
            
            if (!$lockRequest) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create lock request.',
                ], 500);
            }
            
            // Load relationships for broadcasting
            $lockRequest->load(['frame', 'requester', 'frameOwner']);
            
            // Broadcast the request to the frame owner
            broadcast(new FrameLockRequestCreated($lockRequest))->toOthers();
            
            Log::info('Frame lock request created', [
                'request_id' => $lockRequest->id,
                'frame_id' => $frame->id,
                'requester_id' => $user->id,
                'frame_owner_id' => $frame->locked_by_user_id,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Access request sent successfully.',
                'request' => [
                    'uuid' => $lockRequest->uuid,
                    'expires_at' => $lockRequest->expires_at->toISOString(),
                    'status' => $lockRequest->status,
                ],
            ]);
            
        } catch (\Exception $e) {
            Log::error('Frame lock request error', [
                'frame_id' => $frame->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the request.',
            ], 500);
        }
    }

    /**
     * Respond to a lock request (approve/reject)
     */
    public function respondToRequest(Request $request, FrameLockRequest $lockRequest): JsonResponse
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'action' => ['required', Rule::in(['approve', 'reject'])],
            'message' => 'nullable|string|max:500',
        ]);
        
        try {
            // Check if user is the frame owner
            if ($lockRequest->frame_owner_user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only respond to your own lock requests.',
                ], 403);
            }
            
            // Check if request is still pending
            if (!$lockRequest->isPending()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This request is no longer pending.',
                ], 400);
            }
            
            $action = $validated['action'];
            $message = $validated['message'];
            
            if ($action === 'approve') {
                $lockRequest->approve($message);
                
                // Unlock the frame so requester can access
                $lockRequest->frame->unlock();
                
                Log::info('Frame lock request approved', [
                    'request_id' => $lockRequest->id,
                    'frame_id' => $lockRequest->frame->id,
                    'approver_id' => $user->id,
                    'requester_id' => $lockRequest->requester_user_id,
                ]);
                
            } else {
                $lockRequest->reject($message);
                
                Log::info('Frame lock request rejected', [
                    'request_id' => $lockRequest->id,
                    'frame_id' => $lockRequest->frame->id,
                    'rejecter_id' => $user->id,
                    'requester_id' => $lockRequest->requester_user_id,
                ]);
            }
            
            // Load relationships for broadcasting
            $lockRequest->load(['frame', 'requester', 'frameOwner']);
            
            // Broadcast the response
            broadcast(new FrameLockRequestResponded($lockRequest, $action))->toOthers();
            
            return response()->json([
                'success' => true,
                'message' => "Request {$action}d successfully.",
                'request' => [
                    'uuid' => $lockRequest->uuid,
                    'status' => $lockRequest->status,
                    'response_message' => $lockRequest->response_message,
                    'responded_at' => $lockRequest->responded_at?->toISOString(),
                ],
            ]);
            
        } catch (\Exception $e) {
            Log::error('Frame lock request response error', [
                'request_id' => $lockRequest->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while responding to the request.',
            ], 500);
        }
    }

    /**
     * Get lock status for a frame
     */
    public function getLockStatus(Frame $frame): JsonResponse
    {
        $user = Auth::user();
        
        return response()->json([
            'success' => true,
            'lock_status' => $frame->getLockStatusForUser($user->id),
        ]);
    }

    /**
     * Get pending lock requests for the current user (as frame owner)
     */
    public function getPendingRequests(): JsonResponse
    {
        $user = Auth::user();
        
        $requests = FrameLockRequest::pending()
            ->forFrameOwner($user->id)
            ->with(['frame.project', 'requester'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        $formattedRequests = $requests->map(function ($request) {
            return [
                'uuid' => $request->uuid,
                'frame' => [
                    'uuid' => $request->frame->uuid,
                    'name' => $request->frame->name,
                    'type' => $request->frame->type,
                    'project' => [
                        'uuid' => $request->frame->project->uuid,
                        'name' => $request->frame->project->name,
                    ],
                ],
                'requester' => [
                    'id' => $request->requester->id,
                    'name' => $request->requester->name,
                    'avatar' => $request->requester->avatar,
                    'initials' => $request->requester->getInitials(),
                    'color' => $request->requester->getAvatarColor(),
                ],
                'requested_mode' => $request->requested_mode,
                'message' => $request->message,
                'expires_at' => $request->expires_at->toISOString(),
                'created_at' => $request->created_at->toISOString(),
            ];
        });
        
        return response()->json([
            'success' => true,
            'requests' => $formattedRequests,
            'count' => $formattedRequests->count(),
        ]);
    }

    /**
     * Cancel a lock request (by requester)
     */
    public function cancelRequest(FrameLockRequest $lockRequest): JsonResponse
    {
        $user = Auth::user();
        
        // Check if user is the requester
        if ($lockRequest->requester_user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only cancel your own requests.',
            ], 403);
        }
        
        // Check if request is still pending
        if (!$lockRequest->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'This request is no longer pending.',
            ], 400);
        }
        
        try {
            $lockRequest->update([
                'status' => 'rejected',
                'responded_at' => now(),
                'response_message' => 'Cancelled by requester',
            ]);
            
            Log::info('Frame lock request cancelled by requester', [
                'request_id' => $lockRequest->id,
                'requester_id' => $user->id,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Request cancelled successfully.',
            ]);
            
        } catch (\Exception $e) {
            Log::error('Frame lock request cancellation error', [
                'request_id' => $lockRequest->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while cancelling the request.',
            ], 500);
        }
    }

    /**
     * Cleanup expired lock requests
     */
    public function cleanupExpired(): JsonResponse
    {
        try {
            $expiredCount = FrameLockRequest::cleanupExpired();
            
            Log::info('Expired frame lock requests cleaned up', [
                'count' => $expiredCount,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => "Cleaned up {$expiredCount} expired requests.",
                'expired_count' => $expiredCount,
            ]);
            
        } catch (\Exception $e) {
            Log::error('Frame lock request cleanup error', [
                'error' => $e->getMessage(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred during cleanup.',
            ], 500);
        }
    }

    /**
     * Force unlock a frame (for admins or project owners)
     */
    public function forceUnlock(Frame $frame): JsonResponse
    {
        $user = Auth::user();
        
        // Check permissions - only project owner or admin
        $canForceUnlock = false;
        
        if ($frame->project->user_id === $user->id) {
            $canForceUnlock = true;
        } elseif ($user->isAdmin()) {
            $canForceUnlock = true;
        } elseif ($frame->project->workspace_id) {
            $workspace = $frame->project->workspace;
            if ($workspace->owner_id === $user->id) {
                $canForceUnlock = true;
            }
        }
        
        if (!$canForceUnlock) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to force unlock this frame.',
            ], 403);
        }
        
        try {
            if (!$frame->is_locked) {
                return response()->json([
                    'success' => false,
                    'message' => 'Frame is not locked.',
                ], 400);
            }
            
            $frame->unlock();
            
            // Broadcast unlock event
            broadcast(new FrameLockStatusChanged($user, $frame, 'unlocked'))->toOthers();
            
            Log::info('Frame force unlocked', [
                'frame_id' => $frame->id,
                'frame_uuid' => $frame->uuid,
                'force_unlocker_id' => $user->id,
                'is_admin' => $user->isAdmin(),
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Frame force unlocked successfully.',
                'lock_status' => $frame->fresh()->getLockStatusForUser($user->id),
            ]);
            
        } catch (\Exception $e) {
            Log::error('Frame force unlock error', [
                'frame_id' => $frame->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while force unlocking the frame.',
            ], 500);
        }
    }
}