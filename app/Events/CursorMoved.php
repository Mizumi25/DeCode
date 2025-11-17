<?php
// app/Events/CursorMoved.php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CursorMoved implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $frameUuid,
        public int $userId,
        public string $sessionId,
        public float $x,
        public float $y,
        public string $viewportMode,
        public string $color,
        public string $userName,
        public ?string $userAvatar,
        public ?array $meta = null,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('frame.' . $this->frameUuid),
        ];
    }

    public function broadcastAs(): string
    {
        return 'cursor.moved';
    }

    public function broadcastWith(): array
    {
        return [
            'userId' => $this->userId,
            'sessionId' => $this->sessionId,
            'x' => $this->x,
            'y' => $this->y,
            'viewportMode' => $this->viewportMode,
            'color' => $this->color,
            'userName' => $this->userName,
            'userAvatar' => $this->userAvatar,
            'meta' => $this->meta,
            'timestamp' => now()->toISOString(),
        ];
    }
}

// app/Events/ElementDragStarted.php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ElementDragStarted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $frameUuid,
        public int $userId,
        public string $sessionId,
        public string $componentId,
        public string $componentName,
        public array $bounds,
        public string $color,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('frame.' . $this->frameUuid),
        ];
    }

    public function broadcastAs(): string
    {
        return 'element.drag.started';
    }

    public function broadcastWith(): array
    {
        return [
            'userId' => $this->userId,
            'sessionId' => $this->sessionId,
            'componentId' => $this->componentId,
            'componentName' => $this->componentName,
            'bounds' => $this->bounds,
            'color' => $this->color,
            'timestamp' => now()->toISOString(),
        ];
    }
}

// app/Events/ElementDragging.php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ElementDragging implements ShouldBroadcast
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

// app/Events/ElementDragEnded.php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ElementDragEnded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $frameUuid,
        public int $userId,
        public string $sessionId,
        public string $componentId,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('frame.' . $this->frameUuid),
        ];
    }

    public function broadcastAs(): string
    {
        return 'element.drag.ended';
    }

    public function broadcastWith(): array
    {
        return [
            'userId' => $this->userId,
            'sessionId' => $this->sessionId,
            'componentId' => $this->componentId,
            'timestamp' => now()->toISOString(),
        ];
    }
}