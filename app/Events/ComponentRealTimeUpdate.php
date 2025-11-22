<?php
namespace App\Events;

use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class ComponentRealTimeUpdate implements ShouldBroadcastNow
{
    public function __construct(
        public string $frameUuid,
        public int $userId,
        public string $sessionId,
        public string $componentId,
        public string $updateType, // 'drag_move', 'style', 'prop'
        public array $data,
    ) {}

    public function broadcastOn(): array
    {
        return [new PresenceChannel('frame.' . $this->frameUuid)];
    }

    public function broadcastAs(): string
    {
        return 'component.realtime';
    }

    public function broadcastWith(): array
    {
        return [
            'userId' => $this->userId,
            'sessionId' => $this->sessionId,
            'componentId' => $this->componentId,
            'updateType' => $this->updateType,
            'data' => $this->data,
            'timestamp' => now()->toISOString(),
        ];
    }
}
