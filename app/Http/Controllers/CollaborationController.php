<?php
// app/Http/Controllers/CollaborationController.php

namespace App\Http\Controllers;

use App\Models\Frame;
use App\Models\FrameCursor;
use App\Events\CursorMoved;
use App\Events\ElementDragStarted;
use App\Events\ElementDragging;
use App\Events\ElementDragEnded;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

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

        // Update or create cursor position
        $cursor = FrameCursor::updateOrCreate(
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

        // Broadcast cursor movement (others will see it)
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

        return response()->json([
            'success' => true,
            'cursor' => [
                'userId' => $user->id,
                'sessionId' => $validated['session_id'],
                'x' => $validated['x'],
                'y' => $validated['y'],
                'color' => $color,
            ],
        ]);
    }

    /**
     * Get all active cursors for a frame
     */
    public function getActiveCursors(Frame $frame): JsonResponse
    {
        $cursors = FrameCursor::getActiveCursors($frame->id);

        // Filter out current user's cursor
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
     * Broadcast element drag start
     */
    public function dragStart(Request $request, Frame $frame): JsonResponse
    {
        $validated = $request->validate([
            'component_id' => 'required|string',
            'component_name' => 'required|string',
            'session_id' => 'required|string',
            'bounds' => 'required|array',
            'bounds.x' => 'required|numeric',
            'bounds.y' => 'required|numeric',
            'bounds.width' => 'required|numeric',
            'bounds.height' => 'required|numeric',
        ]);

        $user = Auth::user();
        $color = $this->getUserColor($user->id);

        broadcast(new ElementDragStarted(
            frameUuid: $frame->uuid,
            userId: $user->id,
            sessionId: $validated['session_id'],
            componentId: $validated['component_id'],
            componentName: $validated['component_name'],
            bounds: $validated['bounds'],
            color: $color,
        ))->toOthers();

        return response()->json(['success' => true]);
    }

    /**
     * Broadcast element dragging
     */
    public function dragMove(Request $request, Frame $frame): JsonResponse
    {
        $validated = $request->validate([
            'component_id' => 'required|string',
            'session_id' => 'required|string',
            'x' => 'required|numeric',
            'y' => 'required|numeric',
            'bounds' => 'required|array',
        ]);

        $user = Auth::user();

        broadcast(new ElementDragging(
            frameUuid: $frame->uuid,
            userId: $user->id,
            sessionId: $validated['session_id'],
            componentId: $validated['component_id'],
            x: $validated['x'],
            y: $validated['y'],
            bounds: $validated['bounds'],
        ))->toOthers();

        return response()->json(['success' => true]);
    }

    /**
     * Broadcast element drag end
     */
    public function dragEnd(Request $request, Frame $frame): JsonResponse
    {
        $validated = $request->validate([
            'component_id' => 'required|string',
            'session_id' => 'required|string',
        ]);

        $user = Auth::user();

        broadcast(new ElementDragEnded(
            frameUuid: $frame->uuid,
            userId: $user->id,
            sessionId: $validated['session_id'],
            componentId: $validated['component_id'],
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

        return response()->json([
            'success' => true,
            'deleted' => $deletedCount,
        ]);
    }

    /**
     * Generate consistent color for user
     */
    private function getUserColor(int $userId): string
    {
        $colors = [
            '#3b82f6', // blue
            '#10b981', // green
            '#f59e0b', // amber
            '#ef4444', // red
            '#8b5cf6', // purple
            '#ec4899', // pink
            '#06b6d4', // cyan
            '#f97316', // orange
            '#84cc16', // lime
            '#6366f1', // indigo
        ];

        return $colors[$userId % count($colors)];
    }
}