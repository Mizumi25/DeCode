<?php

namespace App\Events;

use App\Models\Frame;
use App\Models\Workspace;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ThumbnailGenerated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $frame;
    public $workspace;
    public $thumbnailUrl;

    public function __construct(Frame $frame, Workspace $workspace)
    {
        $this->frame = $frame;
        $this->workspace = $workspace;
        $this->thumbnailUrl = $this->getThumbnailUrl($frame);
    }

    public function broadcastOn()
    {
        return new PrivateChannel('workspace.' . $this->workspace->id);
    }

    public function broadcastWith()
    {
        return [
            'type' => 'thumbnail_generated',
            'frame_uuid' => $this->frame->uuid,
            'thumbnail_url' => $this->thumbnailUrl,
            'generated_at' => now()->toISOString(),
            'project_uuid' => $this->frame->project->uuid,
            'workspace_id' => $this->workspace->id,
        ];
    }

    private function getThumbnailUrl(Frame $frame): ?string
    {
        $settings = $frame->settings ?? [];
        if (!isset($settings['thumbnail_path'])) {
            return null;
        }
        
        return asset('storage/' . $settings['thumbnail_path']);
    }
}