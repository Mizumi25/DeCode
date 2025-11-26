<?php

namespace App\Events;

use App\Models\Project;
use App\Models\Workspace;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProjectDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $projectId;
    public $projectUuid;
    public $projectName;
    public $workspaceId;
    public $deletedBy;

    public function __construct(int $projectId, string $projectUuid, string $projectName, int $workspaceId, string $deletedBy)
    {
        $this->projectId = $projectId;
        $this->projectUuid = $projectUuid;
        $this->projectName = $projectName;
        $this->workspaceId = $workspaceId;
        $this->deletedBy = $deletedBy;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('workspace.' . $this->workspaceId);
    }

    public function broadcastWith()
    {
        return [
            'project_id' => $this->projectId,
            'project_uuid' => $this->projectUuid,
            'project_name' => $this->projectName,
            'workspace_id' => $this->workspaceId,
            'deleted_by' => $this->deletedBy,
        ];
    }

    public function broadcastAs()
    {
        return 'ProjectDeleted';
    }
}
