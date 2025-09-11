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