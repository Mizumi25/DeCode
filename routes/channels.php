<?php
// routes/channels.php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Frame;
use App\Models\Workspace; // ADD THIS IMPORT
use App\Models\User;

// User authentication channel
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Frame presence channel
Broadcast::channel('frame.{frameUuid}', function ($user, $frameUuid) {
    $frame = Frame::where('uuid', $frameUuid)->first();
    
    if (!$frame) {
        return false;
    }
    
    // Check if user has access to this frame
    if ($frame->project->user_id === $user->id) {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'initials' => $user->getInitials(),
            'color' => $user->getAvatarColor(),
        ];
    }
    
    // Check workspace access
    if ($frame->project->workspace_id) {
        $hasAccess = $frame->project->workspace->users()->where('users.id', $user->id)->exists();
        if ($hasAccess) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'initials' => $user->getInitials(),
                'color' => $user->getAvatarColor(),
            ];
        }
    }
    
    return false;
});

// REMOVE THIS DUPLICATE - it's defined again later
// Broadcast::channel('workspace.{workspaceId}', function ($user, $workspaceId) {
//     // Check if user has access to this workspace
//     return $user->workspaces->contains('id', $workspaceId) ||
//            $user->ownedWorkspaces->contains('id', $workspaceId);
// });

// Project channel for project-specific notifications
Broadcast::channel('project.{projectUuid}', function ($user, $projectUuid) {
    $project = \App\Models\Project::where('uuid', $projectUuid)->first();
    
    if (!$project) {
        return false;
    }
    
    // Owner can access
    if ($project->user_id === $user->id) {
        return ['id' => $user->id, 'name' => $user->name];
    }
    
    // Workspace members can access
    if ($project->workspace_id) {
        return $project->workspace->users()->where('users.id', $user->id)->exists() 
            ? ['id' => $user->id, 'name' => $user->name] 
            : false;
    }
    
    return false;
});

// Workspace channel for chat and presence - KEEP THIS ONE
Broadcast::channel('workspace.{workspaceId}', function ($user, $workspaceId) {
    $workspace = Workspace::find($workspaceId); // This needs the import
    
    if ($workspace && $workspace->hasUser($user->id)) {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'initials' => $user->getInitials(),
            'color' => $user->getAvatarColor(),
        ];
    }
    
    return false;
});