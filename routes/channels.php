<?php
// routes/channels.php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Frame;

// User authentication channel
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Frame presence channel - This is where the real-time magic happens
Broadcast::channel('frame.{frameUuid}', function ($user, $frameUuid) {
    $frame = Frame::where('uuid', $frameUuid)->first();
    
    if (!$frame) {
        return false;
    }
    
    // Check if user has access to this frame
    // Owner can always access
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

// Optional: Workspace channel for general workspace notifications
Broadcast::channel('workspace.{workspaceId}', function ($user, $workspaceId) {
    // Check if user has access to this workspace
    return $user->workspaces->contains('id', $workspaceId) ||
           $user->ownedWorkspaces->contains('id', $workspaceId);
});

// Optional: Project channel for project-specific notifications
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