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

    public function broadcastWith()
    {
        return [
            'frame' => $this->frame,
            'project_uuid' => $this->frame->project->uuid,
            'workspace_id' => $this->workspace->id,
            'updated_by' => auth()->user()->name,
            'updated_at' => now()->toISOString(),
        ];
    }
}

