<?php

namespace App\Events;

use App\Models\User;
use App\Models\Frame;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FramePresenceUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $frame;
    public $action; // 'joined', 'left', 'mode_updated'
    public $mode; // 'forge' or 'source'

    public function __construct(User $user, Frame $frame, string $action, string $mode)
    {
        $this->user = $user;
        $this->frame = $frame;
        $this->action = $action;
        $this->mode = $mode;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('frame.' . $this->frame->uuid),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'presence.updated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'avatar' => $this->user->avatar,
                'initials' => $this->user->getInitials(),
                'color' => $this->user->getAvatarColor(),
            ],
            'frame_id' => $this->frame->uuid,
            'action' => $this->action,
            'mode' => $this->mode,
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * Determine if this event should broadcast.
     */
    public function shouldBroadcast(): bool
    {
        return true;
    }
}