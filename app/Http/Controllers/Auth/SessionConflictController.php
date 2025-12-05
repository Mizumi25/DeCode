<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SessionConflictController extends Controller
{
    /**
     * Force logout the current session and login here
     */
    public function forceLogout(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        // Clear the old session
        $user->update([
            'current_session_id' => null,
            'session_started_at' => null,
            'session_device' => null,
            'session_ip' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Old session cleared. You can now login.',
        ]);
    }
}
