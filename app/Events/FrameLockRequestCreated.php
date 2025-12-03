<?php

namespace App\Events;

use App\Models\User;
use App\Models\FrameLockRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FrameLockRequestCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $lockRequest;

    public function __construct(FrameLockRequest $lockRequest)
    {
        $this->lockRequest = $lockRequest;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            // Send to the frame owner
            new PrivateChannel('App.Models.User.' . $this->lockRequest->frame_owner_user_id),
            // Also send to the frame channel for real-time updates
            new PrivateChannel('frame.' . $this->lockRequest->frame->uuid),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'lock.request.created';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'request' => [
                'uuid' => $this->lockRequest->uuid,
                'frame' => [
                    'uuid' => $this->lockRequest->frame->uuid,
                    'name' => $this->lockRequest->frame->name,
                    'type' => $this->lockRequest->frame->type,
                ],
                'requester' => [
                    'id' => $this->lockRequest->requester->id,
                    'name' => $this->lockRequest->requester->name,
                    'avatar' => $this->lockRequest->requester->avatar,
                    'initials' => $this->lockRequest->requester->getInitials(),
                    'color' => $this->lockRequest->requester->getAvatarColor(),
                ],
                'requested_mode' => $this->lockRequest->requested_mode,
                'message' => $this->lockRequest->message,
                'expires_at' => $this->lockRequest->expires_at?->toISOString(),
                'created_at' => $this->lockRequest->created_at->toISOString(),
            ],
            'timestamp' => now()->toISOString(),
        ];
    }
}

