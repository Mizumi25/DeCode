<?php
namespace App\Events;

use App\Models\Frame;
use App\Models\Workspace;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FrameCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $frame;
    public $workspace;
    public $createdBy;

    public function __construct(Frame $frame, Workspace $workspace)
    {
        // Ensure the frame has the project relationship loaded
        if (!$frame->relationLoaded('project')) {
            $frame->load('project');
        }
        
        $this->frame = $frame;
        $this->workspace = $workspace;
        // Capture the authenticated user's name before queuing (auth context is lost in queue)
        $this->createdBy = auth()->check() ? auth()->user()->name : 'Unknown';
    }

    public function broadcastOn()
    {
        return new PrivateChannel('workspace.' . $this->workspace->id);
    }

    public function broadcastWith()
    {
        return [
            'frame' => $this->frame,
            'project_uuid' => $this->frame->project?->uuid, // Safe navigation operator
            'workspace_id' => $this->workspace->id,
            'created_by' => $this->createdBy,
        ];
    }

    public function broadcastAs()
    {
        return 'FrameCreated';
    }
}
?>