<?php
// app/Http/Controllers/MessageController.php
namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Workspace;
use App\Models\User;
use App\Models\Project;
use App\Models\Frame;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    public function index(Request $request, $workspaceId): JsonResponse
    {
        try {
            $user = Auth::user();
            
            Log::info('Loading messages for workspace', [
                'workspace_id' => $workspaceId,
                'user_id' => $user->id
            ]);
            
            // Find workspace by ID (not UUID)
            $workspace = Workspace::find($workspaceId);
            
            if (!$workspace) {
                Log::error('Workspace not found', ['workspace_id' => $workspaceId]);
                return response()->json([
                    'success' => false,
                    'message' => 'Workspace not found'
                ], 404);
            }
            
            // Check if user has access to workspace
            if (!$workspace->hasUser($user->id)) {
                Log::error('User does not have access to workspace', [
                    'workspace_id' => $workspaceId,
                    'user_id' => $user->id
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have access to this workspace'
                ], 403);
            }

            $messages = Message::where('workspace_id', $workspace->id)
                ->with(['user', 'mentions.mentionable'])
                ->orderBy('created_at', 'asc')
                ->limit(100)
                ->get()
                ->map(function ($message) {
                    return [
                        'id' => $message->id,
                        'content' => $message->content,
                        'type' => $message->type,
                        'created_at' => $message->created_at->toISOString(),
                        'user' => [
                            'id' => $message->user->id,
                            'name' => $message->user->name,
                            'email' => $message->user->email,
                            'avatar' => $message->user->avatar,
                        ],
                        'mentions' => $message->mentions->map(function ($mention) {
                            $mentionable = $mention->mentionable;
                            return [
                                'id' => $mention->id,
                                'position' => $mention->position,
                                'length' => $mention->length,
                                'mentionable' => $mentionable ? [
                                    'id' => $mentionable->id,
                                    'type' => class_basename($mentionable),
                                    'name' => $mentionable->name ?? $mentionable->email ?? 'Unknown',
                                    'url' => $this->getMentionableUrl($mentionable)
                                ] : null
                            ];
                        })
                    ];
                });

            Log::info('Messages loaded successfully', [
                'workspace_id' => $workspaceId,
                'message_count' => $messages->count()
            ]);

            return response()->json([
                'success' => true,
                'data' => $messages
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to load messages', [
                'workspace_id' => $workspaceId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to load messages: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request, $workspaceId): JsonResponse
    {
        try {
            $user = Auth::user();
            
            Log::info('Creating message', [
                'workspace_id' => $workspaceId,
                'user_id' => $user->id,
                'content_length' => strlen($request->input('content', ''))
            ]);
            
            $workspace = Workspace::find($workspaceId);
            
            if (!$workspace) {
                return response()->json([
                    'success' => false,
                    'message' => 'Workspace not found'
                ], 404);
            }
            
            if (!$workspace->hasUser($user->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have access to this workspace'
                ], 403);
            }

            $validated = $request->validate([
                'content' => 'required|string|max:2000',
                'mentions' => 'nullable|array',
                'mentions.*.type' => 'required|in:user,project,frame',
                'mentions.*.id' => 'required',
                'mentions.*.position' => 'required|integer',
                'mentions.*.length' => 'required|integer'
            ]);

            DB::beginTransaction();

            $message = Message::create([
                'workspace_id' => $workspace->id,
                'user_id' => $user->id,
                'content' => $validated['content'],
                'type' => 'text'
            ]);

            // Process mentions
            if (!empty($validated['mentions'])) {
                foreach ($validated['mentions'] as $mentionData) {
                    $mentionable = $this->resolveMentionable(
                        $mentionData['type'],
                        $mentionData['id'],
                        $workspace->id
                    );

                    if ($mentionable) {
                        $message->mentions()->create([
                            'user_id' => $user->id,
                            'mentionable_type' => get_class($mentionable),
                            'mentionable_id' => $mentionable->id,
                            'position' => $mentionData['position'],
                            'length' => $mentionData['length']
                        ]);
                    }
                }
            }

            DB::commit();

            $message->load(['user', 'mentions.mentionable']);

            Log::info('Message created successfully', [
                'message_id' => $message->id,
                'workspace_id' => $workspaceId
            ]);

            // Broadcast the new message
            try {
                broadcast(new \App\Events\NewMessage($message))->toOthers();
            } catch (\Exception $e) {
                Log::warning('Failed to broadcast message', [
                    'error' => $e->getMessage()
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $message->id,
                    'content' => $message->content,
                    'type' => $message->type,
                    'created_at' => $message->created_at->toISOString(),
                    'user' => [
                        'id' => $message->user->id,
                        'name' => $message->user->name,
                        'email' => $message->user->email,
                        'avatar' => $message->user->avatar,
                    ],
                    'mentions' => $message->mentions
                ],
                'message' => 'Message sent successfully'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create message', [
                'workspace_id' => $workspaceId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message: ' . $e->getMessage()
            ], 500);
        }
    }

    public function searchMentionables(Request $request, $workspaceId): JsonResponse
    {
        try {
            $user = Auth::user();
            $query = $request->get('q', '');
            
            Log::info('Searching mentionables', [
                'workspace_id' => $workspaceId,
                'query' => $query
            ]);
            
            $workspace = Workspace::find($workspaceId);
            
            if (!$workspace) {
                return response()->json([
                    'success' => false,
                    'message' => 'Workspace not found'
                ], 404);
            }
            
            if (!$workspace->hasUser($user->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have access to this workspace'
                ], 403);
            }

            $results = [];

            // Search users in workspace (show all if query is empty)
            $users = $workspace->users()
                ->where('users.id', '!=', $user->id)
                ->where(function ($q) use ($query) {
                    if (!empty($query)) {
                        $q->where('users.name', 'like', "%{$query}%")
                          ->orWhere('users.email', 'like', "%{$query}%");
                    }
                })
                ->limit(empty($query) ? 10 : 5)
                ->get()
                ->map(function ($user) {
                    return [
                        'type' => 'user',
                        'id' => $user->id,
                        'name' => $user->name,
                        'avatar' => $user->avatar,
                        'display' => "@{$user->name}",
                        'description' => $user->email
                    ];
                });
            
            $results = array_merge($results, $users->toArray());

            // Search projects in workspace
            $projects = $workspace->projects()
                ->where(function ($q) use ($query) {
                    if (!empty($query)) {
                        $q->where('name', 'like', "%{$query}%");
                    }
                })
                ->limit(5)
                ->get()
                ->map(function ($project) {
                    return [
                        'type' => 'project',
                        'id' => $project->id,
                        'name' => $project->name,
                        'display' => "#{$project->name}",
                        'description' => 'Project',
                        'url' => route('void.index', $project->uuid)
                    ];
                });
            
            $results = array_merge($results, $projects->toArray());

            // Search frames in workspace
            $frames = Frame::whereHas('project', function ($q) use ($workspace) {
                    $q->where('workspace_id', $workspace->id);
                })
                ->where(function ($q) use ($query) {
                    if (!empty($query)) {
                        $q->where('name', 'like', "%{$query}%");
                    }
                })
                ->with('project')
                ->limit(5)
                ->get()
                ->map(function ($frame) {
                    return [
                        'type' => 'frame',
                        'id' => $frame->id,
                        'name' => $frame->name,
                        'display' => "#{$frame->name}",
                        'description' => 'Frame in ' . $frame->project->name,
                        'url' => route('frame.forge', [
                            'project' => $frame->project->uuid,
                            'frame' => $frame->uuid
                        ])
                    ];
                });
            
            $results = array_merge($results, $frames->toArray());

            Log::info('Mentionables found', [
                'workspace_id' => $workspaceId,
                'query' => $query,
                'result_count' => count($results)
            ]);

            return response()->json([
                'success' => true,
                'data' => $results
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to search mentionables', [
                'workspace_id' => $workspaceId,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to search mentionables: ' . $e->getMessage()
            ], 500);
        }
    }

    public function markAsRead($workspaceId): JsonResponse
    {
        try {
            $user = Auth::user();
            $workspace = Workspace::find($workspaceId);
            
            if (!$workspace || !$workspace->hasUser($user->id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied'
                ], 403);
            }

            // Simple implementation - just return success
            // You can implement read tracking later if needed
            
            return response()->json([
                'success' => true,
                'message' => 'Messages marked as read'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark as read: ' . $e->getMessage()
            ], 500);
        }
    }

    private function resolveMentionable($type, $id, $workspaceId)
    {
        try {
            switch ($type) {
                case 'user':
                    return User::whereHas('workspaces', function ($q) use ($workspaceId) {
                        $q->where('workspaces.id', $workspaceId);
                    })->find($id);
                
                case 'project':
                    return Project::where('workspace_id', $workspaceId)->find($id);
                
                case 'frame':
                    return Frame::whereHas('project', function ($q) use ($workspaceId) {
                        $q->where('workspace_id', $workspaceId);
                    })->find($id);
                
                default:
                    return null;
            }
        } catch (\Exception $e) {
            Log::error('Failed to resolve mentionable', [
                'type' => $type,
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    private function getMentionableUrl($mentionable)
    {
        try {
            if ($mentionable instanceof Project) {
                return route('void.index', $mentionable->uuid);
            }
            
            if ($mentionable instanceof Frame) {
                return route('frame.forge', [
                    'project' => $mentionable->project->uuid,
                    'frame' => $mentionable->uuid
                ]);
            }
            
            return '#';
        } catch (\Exception $e) {
            return '#';
        }
    }
}