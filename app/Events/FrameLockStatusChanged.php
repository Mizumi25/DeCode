<?php
// app/Events/FrameLockStatusChanged.php

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

class FrameLockStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $frame;
    public $action; // 'locked', 'unlocked'
    public $mode; // 'forge', 'source', null

    public function __construct(User $user, Frame $frame, string $action, string $mode = null)
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
            new PrivateChannel('project.' . $this->frame->project->uuid),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'lock.status.changed';
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
            'frame' => [
                'uuid' => $this->frame->uuid,
                'name' => $this->frame->name,
                'is_locked' => $this->frame->is_locked,
                'locked_at' => $this->frame->locked_at?->toISOString(),
                'locked_mode' => $this->frame->locked_mode,
            ],
            'action' => $this->action,
            'mode' => $this->mode,
            'timestamp' => now()->toISOString(),
        ];
    }
}

