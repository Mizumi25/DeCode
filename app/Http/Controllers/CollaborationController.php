<?php
// app/Http/Controllers/CollaborationController.php - FIXED

namespace App\Http\Controllers;

use App\Models\Frame;
use App\Models\FrameCursor;
use App\Events\CursorMoved;
use App\Events\ComponentRealTimeUpdate;
use App\Events\ComponentStateChanged;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class CollaborationController extends Controller
{
    /**
     * Update cursor position
     */
    public function updateCursor(Request $request, Frame $frame): JsonResponse
    {
        $validated = $request->validate([
            'x' => 'required|numeric',
            'y' => 'required|numeric',
            'viewport_mode' => 'required|in:desktop,tablet,mobile',
            'session_id' => 'required|string',
            'meta' => 'nullable|array',
        ]);

        $user = Auth::user();
        $color = $this->getUserColor($user->id);

        FrameCursor::updateOrCreate(
            [
                'frame_id' => $frame->id,
                'user_id' => $user->id,
                'session_id' => $validated['session_id'],
            ],
            [
                'x' => $validated['x'],
                'y' => $validated['y'],
                'viewport_mode' => $validated['viewport_mode'],
                'color' => $color,
                'meta' => $validated['meta'] ?? null,
                'last_seen_at' => now(),
            ]
        );

        broadcast(new CursorMoved(
            frameUuid: $frame->uuid,
            userId: $user->id,
            sessionId: $validated['session_id'],
            x: $validated['x'],
            y: $validated['y'],
            viewportMode: $validated['viewport_mode'],
            color: $color,
            userName: $user->name,
            userAvatar: $user->avatar,
            meta: $validated['meta'] ?? null,
        ))->toOthers();

        return response()->json(['success' => true]);
    }

    /**
     * Get all active cursors
     */
    public function getActiveCursors(Frame $frame): JsonResponse
    {
        $cursors = FrameCursor::getActiveCursors($frame->id);
        $currentUserId = Auth::id();
        $currentSessionId = request()->input('session_id');
        
        $cursors = array_filter($cursors, function($cursor) use ($currentUserId, $currentSessionId) {
            return !($cursor['userId'] === $currentUserId && $cursor['sessionId'] === $currentSessionId);
        });

        return response()->json([
            'success' => true,
            'cursors' => array_values($cursors),
        ]);
    }

    /**
     * Update component (broadcast to other users)
     */
    public function updateComponent(Request $request, Frame $frame): JsonResponse
    {
        $validated = $request->validate([
            'component_id' => 'required|string',
            'session_id' => 'required|string',
            'updates' => 'required|array',
            'update_type' => 'required|string',
        ]);

        $user = Auth::user();

        // Throttle updates to prevent spam
        $cacheKey = "component_update:{$frame->id}:{$user->id}:{$validated['component_id']}";
        
        if (Cache::has($cacheKey)) {
            return response()->json(['success' => true, 'throttled' => true]);
        }

        Cache::put($cacheKey, true, now()->addMilliseconds(100));

        broadcast(new ComponentRealTimeUpdate(
            frameUuid: $frame->uuid,
            userId: $user->id,
            sessionId: $validated['session_id'],
            componentId: $validated['component_id'],
            updateType: $validated['update_type'],
            data: $validated['updates'],
        ))->toOthers();

        return response()->json(['success' => true]);
    }

    /**
     * 🔥 NEW: Broadcast real-time component update (dragging, live edits)
     */
    public function realtimeUpdate(Request $request, Frame $frame): JsonResponse
    {
        $validated = $request->validate([
            'component_id' => 'required|string',
            'session_id' => 'required|string',
            'update_type' => 'required|in:drag_move,style,prop',
            'data' => 'required|array',
        ]);

        $user = Auth::user();

        // Throttle updates (max 20/sec per component)
        $cacheKey = "realtime:{$frame->id}:{$user->id}:{$validated['component_id']}";
        
        if (Cache::has($cacheKey)) {
            return response()->json(['success' => true, 'throttled' => true]);
        }

        Cache::put($cacheKey, true, now()->addMilliseconds(50));

        broadcast(new ComponentRealTimeUpdate(
            frameUuid: $frame->uuid,
            userId: $user->id,
            sessionId: $validated['session_id'],
            componentId: $validated['component_id'],
            updateType: $validated['update_type'],
            data: $validated['data'],
        ))->toOthers();

        return response()->json(['success' => true]);
    }

    /**
     * 🔥 NEW: Broadcast final state change (drop, save, delete)
     */
    public function stateChanged(Request $request, Frame $frame): JsonResponse
    {
        $validated = $request->validate([
            'component_id' => 'required|string',
            'operation' => 'required|in:moved,nested,styled,deleted',
            'final_state' => 'required|array',
        ]);

        $user = Auth::user();

        broadcast(new ComponentStateChanged(
            frameUuid: $frame->uuid,
            userId: $user->id,
            componentId: $validated['component_id'],
            finalState: $validated['final_state'],
            operation: $validated['operation'],
        ))->toOthers();

        return response()->json(['success' => true]);
    }

    /**
     * Remove cursor on disconnect
     */
    public function removeCursor(Request $request, Frame $frame): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => 'required|string',
        ]);

        FrameCursor::where('frame_id', $frame->id)
            ->where('user_id', Auth::id())
            ->where('session_id', $validated['session_id'])
            ->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Cleanup stale cursors
     */
    public function cleanup(): JsonResponse
    {
        $deletedCount = FrameCursor::cleanupStale();
        return response()->json(['success' => true, 'deleted' => $deletedCount]);
    }

    /**
     * Generate consistent color for user
     */
    private function getUserColor(int $userId): string
    {
        $colors = [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1',
        ];
        return $colors[$userId % count($colors)];
    }
}