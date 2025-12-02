<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ContainerDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $containerUuid;
    public $workspaceId;

    public function __construct($containerUuid, $workspaceId)
    {
        $this->containerUuid = $containerUuid;
        $this->workspaceId = $workspaceId;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('workspace.' . $this->workspaceId),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'uuid' => $this->containerUuid,
        ];
    }
}
