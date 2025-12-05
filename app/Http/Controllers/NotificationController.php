<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications,
            'unread_count' => $request->user()->notifications()->where('read', false)->count(),
        ]);
    }

    public function markAsRead(Request $request, $uuid)
    {
        $notification = $request->user()
            ->notifications()
            ->where('uuid', $uuid)
            ->firstOrFail();

        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()
            ->notifications()
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read',
        ]);
    }

    public function delete(Request $request, $uuid)
    {
        $notification = $request->user()
            ->notifications()
            ->where('uuid', $uuid)
            ->firstOrFail();

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted',
        ]);
    }
}
