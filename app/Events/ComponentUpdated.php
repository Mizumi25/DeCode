<?php
// app/Events/ComponentUpdated.php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ComponentUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $frameUuid,
        public int $userId,
        public string $sessionId,
        public string $componentId,
        public array $updates, // Contains style, position, props, etc.
        public string $updateType, // 'style', 'position', 'props', 'nest', 'reorder'
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('frame.' . $this->frameUuid),
        ];
    }

    public function broadcastAs(): string
    {
        return 'component.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'userId' => $this->userId,
            'sessionId' => $this->sessionId,
            'componentId' => $this->componentId,
            'updates' => $this->updates,
            'updateType' => $this->updateType,
            'timestamp' => now()->toISOString(),
        ];
    }
}