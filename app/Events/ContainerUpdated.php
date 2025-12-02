<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\FrameContainer;

class ContainerUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $container;
    public $workspaceId;

    public function __construct(FrameContainer $container, $workspaceId)
    {
        $this->container = $container;
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
            'container' => $this->container->toArray(),
        ];
    }
}
