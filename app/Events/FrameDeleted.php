<?php
// app/Events/FrameDeleted.php
namespace App\Events;

use App\Models\Workspace;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FrameDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $frameUuid;
    public $frameName;
    public $projectUuid;
    public $workspace;

    public function __construct(string $frameUuid, string $frameName, string $projectUuid, Workspace $workspace)
    {
        $this->frameUuid = $frameUuid;
        $this->frameName = $frameName;
        $this->projectUuid = $projectUuid;
        $this->workspace = $workspace;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('workspace.' . $this->workspace->id);
    }

    public function broadcastWith()
    {
        return [
            'frame_uuid' => $this->frameUuid,
            'frame_name' => $this->frameName,
            'project_uuid' => $this->projectUuid,
            'workspace_id' => $this->workspace->id,
            'deleted_by' => auth()->user()->name,
            'deleted_at' => now()->toISOString(),
        ];
    }

    public function broadcastAs()
    {
        return 'FrameDeleted';
    }
}

