<?php

namespace App\Http\Controllers;

use App\Models\Frame;
use App\Events\FramePresenceUpdated;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class FramePresenceController extends Controller
{
    /**
     * User joins a frame
     */
    public function join(Request $request, Frame $frame): JsonResponse
    {
        $user = Auth::user();
        $mode = $request->input('mode', 'forge'); // forge or source
        
        // Validate that user has access to this frame
        if ($frame->project->user_id !== $user->id && !$this->hasFrameAccess($frame, $user)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Store user presence in cache with extended data
        $cacheKey = "frame_presence.{$frame->uuid}.{$user->id}";
        $presenceData = [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_email' => $user->email,
            'user_avatar' => $user->avatar,
            'mode' => $mode,
            'joined_at' => now()->toISOString(),
            'last_seen' => now()->toISOString(),
            'initials' => $user->getInitials(),
            'color' => $user->getAvatarColor(),
        ];
        
        // Store for 30 minutes, will be refreshed by heartbeat
        Cache::put($cacheKey, $presenceData, now()->addMinutes(30));
        
        // Add to tracking list
        $this->addToTrackingList($frame->uuid, $cacheKey);

        // Get current active users before broadcasting
        $activeUsers = $this->getActiveUsers($frame);

        // Broadcast the join event
        broadcast(new FramePresenceUpdated($user, $frame, 'joined', $mode))->toOthers();

        return response()->json([
            'message' => 'Joined frame successfully',
            'active_users' => $activeUsers,
        ]);
    }

    /**
     * User leaves a frame
     */
    public function leave(Request $request, Frame $frame): JsonResponse
    {
        $user = Auth::user();
        $mode = $request->input('mode', 'forge');
        
        // Remove user presence from cache
        $cacheKey = "frame_presence.{$frame->uuid}.{$user->id}";
        Cache::forget($cacheKey);
        
        // Remove from tracking list
        $this->removeFromTrackingList($frame->uuid, $cacheKey);

        // Broadcast the leave event
        broadcast(new FramePresenceUpdated($user, $frame, 'left', $mode))->toOthers();

        // Get remaining active users
        $activeUsers = $this->getActiveUsers($frame);

        return response()->json([
            'message' => 'Left frame successfully',
            'active_users' => $activeUsers,
        ]);
    }

    /**
     * Update user mode (switching between forge and source)
     */
    public function updateMode(Request $request, Frame $frame): JsonResponse
    {
        $user = Auth::user();
        $mode = $request->input('mode', 'forge');
        
        $cacheKey = "frame_presence.{$frame->uuid}.{$user->id}";
        $presenceData = Cache::get($cacheKey);
        
        if ($presenceData) {
            $presenceData['mode'] = $mode;
            $presenceData['last_seen'] = now()->toISOString();
            Cache::put($cacheKey, $presenceData, now()->addMinutes(30));
            
            // Broadcast the mode update
            broadcast(new FramePresenceUpdated($user, $frame, 'mode_updated', $mode))->toOthers();
        }

        $activeUsers = $this->getActiveUsers($frame);

        return response()->json([
            'message' => 'Mode updated successfully',
            'active_users' => $activeUsers,
        ]);
    }

    /**
     * Heartbeat to keep user presence alive
     */
    public function heartbeat(Request $request, Frame $frame): JsonResponse
    {
        $user = Auth::user();
        $mode = $request->input('mode', 'forge');
        
        $cacheKey = "frame_presence.{$frame->uuid}.{$user->id}";
        $presenceData = Cache::get($cacheKey);
        
        if ($presenceData) {
            $presenceData['mode'] = $mode;
            $presenceData['last_seen'] = now()->toISOString();
            Cache::put($cacheKey, $presenceData, now()->addMinutes(30));
        } else {
            // If not in cache, rejoin
            return $this->join($request, $frame);
        }

        return response()->json(['status' => 'alive']);
    }

    /**
     * Get active users for a frame with improved caching
     */
    public function getActiveUsers(Frame $frame): array
    {
        $trackingKey = "frame_tracking.{$frame->uuid}";
        $trackedKeys = Cache::get($trackingKey, []);
        $activeUsers = [];
        
        foreach ($trackedKeys as $cacheKey) {
            $presenceData = Cache::get($cacheKey);
            if ($presenceData) {
                $activeUsers[] = [
                    'id' => $presenceData['user_id'],
                    'name' => $presenceData['user_name'],
                    'email' => $presenceData['user_email'],
                    'avatar' => $presenceData['user_avatar'],
                    'mode' => $presenceData['mode'],
                    'initials' => $presenceData['initials'],
                    'color' => $presenceData['color'],
                    'joined_at' => $presenceData['joined_at'],
                    'last_seen' => $presenceData['last_seen'] ?? $presenceData['joined_at'],
                ];
            }
        }

        return $activeUsers;
    }

    /**
     * Get active users endpoint (public method)
     */
    public function index(Frame $frame): JsonResponse
    {
        $activeUsers = $this->getActiveUsers($frame);
        
        return response()->json([
            'active_users' => $activeUsers,
            'count' => count($activeUsers),
        ]);
    }

    /**
     * Clean up expired presence data
     */
    public function cleanup(): JsonResponse
    {
        // Get all frame tracking keys
        $pattern = 'frame_tracking.*';
        $trackingKeys = $this->getCacheKeysByPattern($pattern);
        
        $cleanedCount = 0;
        
        foreach ($trackingKeys as $trackingKey) {
            $trackedKeys = Cache::get($trackingKey, []);
            $validKeys = [];
            
            foreach ($trackedKeys as $cacheKey) {
                if (Cache::has($cacheKey)) {
                    $validKeys[] = $cacheKey;
                } else {
                    $cleanedCount++;
                }
            }
            
            if (empty($validKeys)) {
                Cache::forget($trackingKey);
            } else {
                Cache::put($trackingKey, $validKeys, now()->addHours(2));
            }
        }
        
        return response()->json([
            'message' => 'Cleanup completed',
            'cleaned_entries' => $cleanedCount
        ]);
    }

    /**
     * Add cache key to frame tracking list
     */
    private function addToTrackingList(string $frameUuid, string $cacheKey): void
    {
        $trackingKey = "frame_tracking.{$frameUuid}";
        $trackedKeys = Cache::get($trackingKey, []);
        
        if (!in_array($cacheKey, $trackedKeys)) {
            $trackedKeys[] = $cacheKey;
            Cache::put($trackingKey, $trackedKeys, now()->addHours(2));
        }
    }

    /**
     * Remove cache key from frame tracking list
     */
    private function removeFromTrackingList(string $frameUuid, string $cacheKey): void
    {
        $trackingKey = "frame_tracking.{$frameUuid}";
        $trackedKeys = Cache::get($trackingKey, []);
        
        $updatedKeys = array_filter($trackedKeys, fn($key) => $key !== $cacheKey);
        
        if (empty($updatedKeys)) {
            Cache::forget($trackingKey);
        } else {
            Cache::put($trackingKey, $updatedKeys, now()->addHours(2));
        }
    }

    /**
     * Get cache keys by pattern (Redis implementation)
     */
    private function getCacheKeysByPattern(string $pattern): array
    {
        if (config('cache.default') === 'redis') {
            try {
                return Redis::keys($pattern);
            } catch (\Exception $e) {
                Log::warning('Redis pattern search failed: ' . $e->getMessage());
                return [];
            }
        }
        
        // Fallback for non-Redis cache drivers
        return [];
    }

    /**
     * Check if user has access to frame (workspace member, etc.)
     */
    private function hasFrameAccess(Frame $frame, $user): bool
    {
        // Check if user is part of the workspace that owns the project
        $project = $frame->project;
        
        if ($project->workspace_id) {
            return $project->workspace->users()->where('users.id', $user->id)->exists();
        }
        
        return false;
    }
}