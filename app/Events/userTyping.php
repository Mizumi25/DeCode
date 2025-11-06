<?php
// app/Events/UserTyping.php
namespace App\Events;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserTyping implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $workspaceId;
    public $isTyping;

    public function __construct(User $user, $workspaceId, $isTyping)
    {
        $this->user = $user;
        $this->workspaceId = $workspaceId;
        $this->isTyping = $isTyping;
    }

    public function broadcastOn()
    {
        return new PresenceChannel('workspace.' . $this->workspaceId);
    }

    public function broadcastAs()
    {
        return 'user.typing';
    }

    public function broadcastWith()
    {
        return [
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'avatar' => $this->user->avatar
            ],
            'is_typing' => $this->isTyping
        ];
    }
}