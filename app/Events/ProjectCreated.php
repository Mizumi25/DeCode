<?php

namespace App\Events;

use App\Models\Project;
use App\Models\Workspace;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProjectCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $project;
    public $workspace;

    public function __construct(Project $project, Workspace $workspace)
    {
        $this->project = $project->load('workspace');
        $this->workspace = $workspace;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('workspace.' . $this->workspace->id);
    }

    public function broadcastWith()
    {
        return [
            'project' => [
                'id' => $this->project->id,
                'uuid' => $this->project->uuid,
                'name' => $this->project->name,
                'description' => $this->project->description,
                'type' => $this->project->type,
                'status' => $this->project->status,
                'thumbnail' => $this->project->thumbnail ? asset('storage/' . $this->project->thumbnail) : null,
                'component_count' => $this->project->getComponentCountAttribute(),
                'frame_count' => $this->project->getFrameCountAttribute(),
                'created_at' => $this->project->created_at,
                'updated_at' => $this->project->updated_at,
                'viewport_width' => $this->project->viewport_width,
                'viewport_height' => $this->project->viewport_height,
                'css_framework' => $this->project->css_framework,
                'output_format' => $this->project->output_format,
                'is_public' => $this->project->is_public,
                'workspace' => [
                    'id' => $this->workspace->id,
                    'name' => $this->workspace->name,
                    'type' => $this->workspace->type,
                ],
            ],
            'workspace_id' => $this->workspace->id,
            'created_by' => auth()->user()->name,
        ];
    }
}