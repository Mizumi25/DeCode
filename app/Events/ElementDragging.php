<?php
// app/Events/ElementDragging.php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ElementDragging implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $frameUuid,
        public int $userId,
        public string $sessionId,
        public string $componentId,
        public float $x,
        public float $y,
        public array $bounds,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('frame.' . $this->frameUuid),
        ];
    }

    public function broadcastAs(): string
    {
        return 'element.drag.moving';
    }

    public function broadcastWith(): array
    {
        return [
            'userId' => $this->userId,
            'sessionId' => $this->sessionId,
            'componentId' => $this->componentId,
            'x' => $this->x,
            'y' => $this->y,
            'bounds' => $this->bounds,
            'timestamp' => now()->toISOString(),
        ];
    }
}