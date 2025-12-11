<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProjectPublishing implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $projectUuid;
    public $progress;
    public $message;
    public $status; // 'in-progress', 'complete', 'failed'
    public $publishedUrl;

    public function __construct($projectUuid, $progress, $message, $status = 'in-progress', $publishedUrl = null)
    {
        $this->projectUuid = $projectUuid;
        $this->progress = $progress;
        $this->message = $message;
        $this->status = $status;
        $this->publishedUrl = $publishedUrl;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('project.' . $this->projectUuid);
    }

    public function broadcastAs()
    {
        return 'project.publishing';
    }
}
