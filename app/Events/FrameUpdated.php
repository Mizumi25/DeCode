<?php
// app/Events/FrameUpdated.php
namespace App\Events;

use App\Models\Frame;
use App\Models\Workspace;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FrameUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $frame;
    public $workspace;

    public function __construct(Frame $frame, Workspace $workspace)
    {
        $this->frame = $frame;
        $this->workspace = $workspace;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('workspace.' . $this->workspace->id);
    }

    // REPLACE lines 35-43 with:
    public function broadcastWith()
    {
        // 🔥 FIX: Ensure frame has project loaded
        $this->frame->loadMissing('project');
        
        return [
            'frame' => [
                'uuid' => $this->frame->uuid,
                'name' => $this->frame->name,
                'type' => $this->frame->type,
                'canvas_style' => $this->frame->canvas_style,
                'canvas_props' => $this->frame->canvas_props,
                'canvas_animation' => $this->frame->canvas_animation,
                'updated_at' => $this->frame->updated_at->toISOString(),
            ],
            'project_uuid' => $this->frame->project ? $this->frame->project->uuid : null,
            'workspace_id' => $this->workspace->id,
            'updated_by' => auth()->user() ? auth()->user()->name : 'System',
            'updated_at' => now()->toISOString(),
        ];
    }
}

