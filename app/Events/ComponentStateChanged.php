<?php
namespace App\Events;

use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class ComponentStateChanged implements ShouldBroadcastNow
{
    public function __construct(
        public string $frameUuid,
        public int $userId,
        public string $componentId,
        public array $finalState, // Full component state
        public string $operation, // 'moved', 'nested', 'styled', 'deleted'
    ) {}

    public function broadcastOn(): array
    {
        return [new PresenceChannel('frame.' . $this->frameUuid)];
    }

    public function broadcastAs(): string
    {
        return 'component.state.changed';
    }

    public function broadcastWith(): array
    {
        return [
            'userId' => $this->userId,
            'componentId' => $this->componentId,
            'finalState' => $this->finalState,
            'operation' => $this->operation,
            'timestamp' => now()->toISOString(),
        ];
    }
}