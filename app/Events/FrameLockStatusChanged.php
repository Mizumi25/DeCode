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

// app/Events/FrameLockRequestCreated.php

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
                'expires_at' => $this->lockRequest->expires_at->toISOString(),
                'created_at' => $this->lockRequest->created_at->toISOString(),
            ],
            'timestamp' => now()->toISOString(),
        ];
    }
}

// app/Events/FrameLockRequestResponded.php

namespace App\Events;

use App\Models\FrameLockRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FrameLockRequestResponded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $lockRequest;
    public $response; // 'approved' or 'rejected'

    public function __construct(FrameLockRequest $lockRequest, string $response)
    {
        $this->lockRequest = $lockRequest;
        $this->response = $response;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            // Send to the requester
            new PrivateChannel('App.Models.User.' . $this->lockRequest->requester_user_id),
            // Also send to the frame channel
            new PrivateChannel('frame.' . $this->lockRequest->frame->uuid),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'lock.request.responded';
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
                ],
                'status' => $this->lockRequest->status,
                'response_message' => $this->lockRequest->response_message,
                'responded_at' => $this->lockRequest->responded_at?->toISOString(),
            ],
            'response' => $this->response,
            'timestamp' => now()->toISOString(),
        ];
    }
}