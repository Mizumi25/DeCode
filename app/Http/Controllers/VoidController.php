<?php

namespace App\Http\Controllers;

use App\Models\Frame;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use App\Events\FrameCreated;
use App\Events\FrameUpdated;
use App\Events\FrameDeleted;
use App\Services\PlaywrightThumbnailService;
use App\Events\ThumbnailGenerated;

class VoidController extends Controller
{
    /**
     * Display the void page for a project (moved from ProjectController)
     */
     
     protected PlaywrightThumbnailService $thumbnailService;
     
     public function __construct(PlaywrightThumbnailService $thumbnailService)
    {
        $this->thumbnailService = $thumbnailService;
    }

     
    public function show(Project $project): Response
    {
        $user = Auth::user();
        
        // Enhanced access control
        $hasAccess = false;
        
        if ($project->user_id === $user->id) {
            $hasAccess = true;
        } elseif ($project->is_public) {
            $hasAccess = true;
        } elseif ($project->workspace) {
            $hasAccess = $project->workspace->hasUser($user->id);
        }
        
        if (!$hasAccess) {
            abort(403, 'Access denied to this project.');
        }
        
        $project->updateLastOpened();
        
        return Inertia::render('VoidPage', [
            'project' => $project->load('workspace'),
            'canvas_data' => $project->canvas_data,
            'frames' => $project->canvas_data['frames'] ?? [],
            'userRole' => $project->workspace ? $project->workspace->getUserRole($user->id) : 'owner',
            'canEdit' => $project->user_id === $user->id || ($project->workspace && $project->workspace->canUserEdit($user->id)),
        ]);
    }

    /**
     * Display a listing of frames for a project.
     */
    public function index(Request $request): JsonResponse
    {
        $projectId = $request->get('project_id');
        
        $query = Frame::query();
        
        if ($projectId) {
            $query->where('project_id', $projectId);
        }
        
        $frames = $query->with('project')
                       ->orderBy('created_at', 'desc')
                       ->get();

        return response()->json([
            'frames' => $frames,
            'total' => $frames->count()
        ]);
    }


    /**
     * Store a newly created frame.
     */
    public function store(Request $request)
    {
        // Add debugging
        Log::info('Frame creation request:', $request->all());
    
        try {
            $validated = $request->validate([
                'project_id' => 'required|exists:projects,id',
                'name' => 'required|string|max:255',
                'type' => ['required', Rule::in(['page', 'component'])],
                'canvas_data' => 'nullable|array',
                'settings' => 'nullable|array',
            ]);
    
            Log::info('Frame creation validated data:', $validated);
    
            // Enhanced access control: Check ownership OR workspace access
            $project = Project::with('workspace')->find($validated['project_id']);
            $user = Auth::user();
            
            if (!$project) {
                Log::error('Project not found', [
                    'project_id' => $validated['project_id'],
                    'user_id' => $user->id
                ]);
                
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Project not found'
                    ], 404);
                }
                
                return back()->withErrors(['project' => 'Project not found']);
            }
            
            // Check access permissions
            $hasAccess = false;
            $canEdit = false;
            
            if ($project->user_id === $user->id) {
                // User owns the project
                $hasAccess = true;
                $canEdit = true;
            } elseif ($project->workspace && $project->workspace->hasUser($user->id)) {
                // User is in the workspace
                $hasAccess = true;
                $userRole = $project->workspace->getUserRole($user->id);
                
                // Allow owner, editor, and contributor roles to create frames
                // Only restrict viewers from creating content
                $canEdit = $project->workspace->canUserEdit($user->id);
                
                // Log the role for debugging
                Log::info('User workspace role check', [
                    'user_id' => $user->id,
                    'workspace_id' => $project->workspace->id,
                    'user_role' => $userRole,
                    'can_edit' => $canEdit
                ]);
            }
            
            if (!$hasAccess) {
              Log::error('Project access denied', [
                  'project_id' => $project->id,
                  'user_id' => $user->id
              ]);
              
              if ($request->expectsJson()) {
                  return response()->json([
                      'message' => 'Access denied to this project'
                  ], 403);
              }
              
              return back()->withErrors(['project' => 'Access denied to this project']);
          }
          
          if (!$canEdit) {
              Log::error('Frame creation permission denied', [
                  'project_id' => $project->id,
                  'user_id' => $user->id,
                  'user_role' => $project->workspace ? $project->workspace->getUserRole($user->id) : null
              ]);
              
              if ($request->expectsJson()) {
                  return response()->json([
                      'message' => 'You do not have permission to create frames in this project. Your role: ' . ($project->workspace ? $project->workspace->getUserRole($user->id) : 'none')
                  ], 403);
              }
              
              return back()->withErrors(['project' => 'You do not have permission to create frames in this project']);
          }
          
            // Create default canvas_data if not provided
            if (!isset($validated['canvas_data'])) {
                $validated['canvas_data'] = $this->getDefaultCanvasData($validated['type']);
            }
    
            // Create default settings if not provided
            if (!isset($validated['settings'])) {
                $validated['settings'] = $this->getDefaultSettings();
            }
    
            // Generate random position for void placement
            $validated['canvas_data']['position'] = [
                'x' => rand(200, 800),
                'y' => rand(200, 600)
            ];
    
            Log::info('Creating frame with data:', $validated);
    
            $frame = Frame::create($validated);
    
            // Generate static thumbnail for now (we'll implement Playwright later)
            $this->generateStaticThumbnail($frame);
    
            // Load the frame with its project relationship
            $frame->load('project');
    
            // BROADCAST FRAME CREATION
            try {
                if ($project->workspace) {
                    broadcast(new FrameCreated($frame, $project->workspace))->toOthers();
                    
                    Log::info('Frame creation broadcasted successfully', [
                        'frame_id' => $frame->id,
                        'project_id' => $project->id,
                        'workspace_id' => $project->workspace->id,
                        'user_id' => $user->id
                    ]);
                }
            } catch (\Exception $e) {
                // Log broadcast failure but don't fail the frame creation
                Log::warning('Failed to broadcast frame creation', [
                    'frame_id' => $frame->id,
                    'project_id' => $project->id,
                    'error' => $e->getMessage()
                ]);
            }
    
            Log::info('Frame created successfully:', ['frame_id' => $frame->id]);
    
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Frame created successfully',
                    'frame' => $frame
                ], 201);
            }
    
            // For web requests, redirect back to void page
            return redirect()->route('void.index', ['project' => $project->uuid])
                           ->with('success', 'Frame created successfully');
    
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error:', $e->errors());
            
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $e->errors()
                ], 422);
            }
            
            return back()->withErrors($e->errors())->withInput();
            
        } catch (\Exception $e) {
            Log::error('Frame creation error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Failed to create frame: ' . $e->getMessage()
                ], 500);
            }
            
            return back()->withErrors(['error' => 'Failed to create frame. Please try again.']);
        }
    }

    /**
     * Display the specified frame.
     */
    public function showFrame(Frame $frame): JsonResponse
    {
        $user = Auth::user();
        $project = $frame->project;
        
        // Enhanced access control: Check ownership OR workspace access
        $hasAccess = false;
        
        if ($project->user_id === $user->id) {
            // User owns the project
            $hasAccess = true;
        } elseif ($project->is_public) {
            // Project is public
            $hasAccess = true;
        } elseif ($project->workspace) {
            // Check workspace access
            $hasAccess = $project->workspace->hasUser($user->id);
        }
        
        if (!$hasAccess) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to this project'
            ], 403);
        }
    
        $frame->load('project');
    
        return response()->json(['frame' => $frame]);
    }
    
    /**
     * Get frames by project UUID (for void page).
     */
    public function getByProject(string $projectUuid): JsonResponse
    {
        $user = Auth::user();
        
        $project = Project::where('uuid', $projectUuid)
                         ->with('workspace')
                         ->firstOrFail();
        
        // Enhanced access control: Check ownership OR workspace access
        $hasAccess = false;
        
        if ($project->user_id === $user->id) {
            // User owns the project
            $hasAccess = true;
        } elseif ($project->is_public) {
            // Project is public
            $hasAccess = true;
        } elseif ($project->workspace) {
            // Check workspace access
            $hasAccess = $project->workspace->hasUser($user->id);
        }
        
        if (!$hasAccess) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to this project'
            ], 403);
        }
    
        $frames = Frame::where('project_id', $project->id)
                      ->orderBy('created_at', 'desc')
                      ->get();
    
        return response()->json([
            'frames' => $frames,
            'total' => $frames->count(),
            'canEdit' => $project->user_id === $user->id || ($project->workspace && $project->workspace->canUserEdit($user->id))
        ]);
    }
    
    /**
     * Update the specified frame.
     */
    public function update(Request $request, Frame $frame): JsonResponse
    {
        $user = Auth::user();
        $project = $frame->project;
        
        $canEdit = false;
        
        if ($project->user_id === $user->id) {
            $canEdit = true;
        } elseif ($project->workspace && $project->workspace->hasUser($user->id)) {
            $canEdit = $project->workspace->canUserEdit($user->id);
        }
        
        if (!$canEdit) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to edit this frame'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => ['sometimes', Rule::in(['page', 'component'])],
            'canvas_data' => 'sometimes|array',
            'settings' => 'sometimes|array',
            'generate_thumbnail' => 'sometimes|boolean' // NEW: Optional thumbnail generation flag
        ]);

        // Store original data for change tracking
        $originalCanvasData = $frame->canvas_data;
        
        $frame->update($validated);
        $frame->load('project');
        
        // TRIGGER THUMBNAIL REGENERATION if canvas data changed
        $shouldGenerateThumbnail = $validated['generate_thumbnail'] ?? false;
        $canvasDataChanged = isset($validated['canvas_data']) && 
                           json_encode($originalCanvasData) !== json_encode($validated['canvas_data']);

        if (($shouldGenerateThumbnail || $canvasDataChanged) && $this->thumbnailService->checkPlaywrightAvailability()) {
            try {
                // Generate thumbnail in background (non-blocking)
                dispatch(function() use ($frame) {
                    $this->thumbnailService->generateThumbnail($frame);
                })->afterResponse();
                
                Log::info('Thumbnail generation queued for frame:', ['frame_id' => $frame->id]);
            } catch (\Exception $e) {
                Log::warning('Failed to queue thumbnail generation:', [
                    'frame_id' => $frame->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
        
        // BROADCAST FRAME UPDATE
        if ($project->workspace) {
            try {
                broadcast(new FrameUpdated($frame, $project->workspace))->toOthers();
                Log::info('Frame update broadcasted successfully', [
                    'frame_id' => $frame->id,
                    'project_id' => $project->id,
                    'workspace_id' => $project->workspace->id,
                    'user_id' => $user->id
                ]);
            } catch (\Exception $e) {
                Log::warning('Failed to broadcast frame update', [
                    'frame_id' => $frame->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return response()->json([
            'message' => 'Frame updated successfully',
            'frame' => $frame,
            'thumbnail_queued' => $canvasDataChanged || $shouldGenerateThumbnail
        ]);
    }

    
    /**
     * Remove the specified frame.
     */
    public function destroy(Frame $frame): JsonResponse
    {
        $user = Auth::user();
        $project = $frame->project;
        
        $canEdit = false;
        
        if ($project->user_id === $user->id) {
            $canEdit = true;
        } elseif ($project->workspace && $project->workspace->hasUser($user->id)) {
            $canEdit = $project->workspace->canUserEdit($user->id);
        }
        
        if (!$canEdit) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to delete this frame'
            ], 403);
        }

        // Store frame data for broadcasting before deletion
        $frameUuid = $frame->uuid;
        $frameName = $frame->name;
        $projectUuid = $project->uuid;
        $workspace = $project->workspace;

        // Delete thumbnail if exists
        $this->deleteThumbnail($frame);

        $frame->delete();
        
        // BROADCAST FRAME DELETION
        if ($workspace) {
            try {
                broadcast(new FrameDeleted($frameUuid, $frameName, $projectUuid, $workspace))->toOthers();
                Log::info('Frame deletion broadcasted successfully', [
                    'frame_uuid' => $frameUuid,
                    'project_uuid' => $projectUuid,
                    'workspace_id' => $workspace->id,
                    'user_id' => $user->id
                ]);
            } catch (\Exception $e) {
                Log::warning('Failed to broadcast frame deletion', [
                    'frame_uuid' => $frameUuid,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return response()->json([
            'message' => 'Frame deleted successfully'
        ]);
    }
    
    /**
     * Duplicate a frame.
     */
    public function duplicate(Request $request, Frame $frame): JsonResponse
    {
        $user = Auth::user();
        $project = $frame->project;
        
        $canEdit = false;
        
        if ($project->user_id === $user->id) {
            $canEdit = true;
        } elseif ($project->workspace && $project->workspace->hasUser($user->id)) {
            $canEdit = $project->workspace->canUserEdit($user->id);
        }
        
        if (!$canEdit) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to duplicate this frame'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
        ]);

        $newFrame = $frame->replicate();
        $newFrame->name = $validated['name'] ?? ($frame->name . ' (Copy)');
        
        // Generate new position for duplicate
        $canvasData = $newFrame->canvas_data ?? [];
        $canvasData['position'] = [
            'x' => ($canvasData['position']['x'] ?? 400) + 50,
            'y' => ($canvasData['position']['y'] ?? 300) + 50
        ];
        $newFrame->canvas_data = $canvasData;
        
        $newFrame->save();
        
        // Generate thumbnail for duplicate
        $this->generateStaticThumbnail($newFrame);
        $newFrame->load('project');

        // BROADCAST FRAME CREATION (for the duplicate)
        if ($project->workspace) {
            try {
                broadcast(new FrameCreated($newFrame, $project->workspace))->toOthers();
                Log::info('Frame duplication broadcasted successfully', [
                    'original_frame_id' => $frame->id,
                    'new_frame_id' => $newFrame->id,
                    'project_id' => $project->id,
                    'workspace_id' => $project->workspace->id,
                    'user_id' => $user->id
                ]);
            } catch (\Exception $e) {
                Log::warning('Failed to broadcast frame duplication', [
                    'new_frame_id' => $newFrame->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return response()->json([
            'message' => 'Frame duplicated successfully',
            'frame' => $newFrame
        ], 201);
    }
    
    /**
     * Update frame position in the void.
     */
    public function updatePosition(Request $request, Frame $frame): JsonResponse
    {
        $user = Auth::user();
        $project = $frame->project;
        
        $canEdit = false;
        
        if ($project->user_id === $user->id) {
            $canEdit = true;
        } elseif ($project->workspace && $project->workspace->hasUser($user->id)) {
            $canEdit = $project->workspace->canUserEdit($user->id);
        }
        
        if (!$canEdit) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to move this frame'
            ], 403);
        }

        $validated = $request->validate([
            'x' => 'required|numeric',
            'y' => 'required|numeric',
        ]);

        // Update the canvas_data with new position
        $canvasData = $frame->canvas_data ?? [];
        $canvasData['position'] = [
            'x' => $validated['x'],
            'y' => $validated['y']
        ];
        
        $frame->update(['canvas_data' => $canvasData]);

        // BROADCAST FRAME UPDATE (position change)
        if ($project->workspace) {
            try {
                broadcast(new FrameUpdated($frame, $project->workspace))->toOthers();
                Log::info('Frame position update broadcasted successfully', [
                    'frame_id' => $frame->id,
                    'new_position' => $canvasData['position'],
                    'user_id' => $user->id
                ]);
            } catch (\Exception $e) {
                Log::warning('Failed to broadcast frame position update', [
                    'frame_id' => $frame->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return response()->json([
            'message' => 'Frame position updated successfully',
            'frame' => $frame
        ]);
    }

 /**
 * Enhanced thumbnail generation with better error handling
 */
  public function generateThumbnail(Request $request, Frame $frame): JsonResponse
  {
      $user = Auth::user();
      
      if (!$this->checkFrameAccess($frame, $user)) {
          return response()->json([
              'success' => false,
              'message' => 'Access denied'
          ], 403);
      }
  
      try {
          Log::info('Starting thumbnail generation', ['frame_id' => $frame->uuid]);
          
          // Check if Playwright is available
          if (!$this->thumbnailService->checkPlaywrightAvailability()) {
              Log::warning('Playwright not available, using static thumbnail generation');
              return $this->generateStaticThumbnailFallback($frame);
          }
  
          // Generate thumbnail with enhanced error handling
          $thumbnailPath = $this->thumbnailService->generateThumbnail($frame);
          
          if ($thumbnailPath && file_exists($thumbnailPath)) {
              $thumbnailUrl = $this->thumbnailService->getThumbnailUrl($frame);
              
              Log::info('Thumbnail generated successfully', [
                  'frame_id' => $frame->uuid,
                  'path' => $thumbnailPath,
                  'url' => $thumbnailUrl
              ]);
              
              // Broadcast to workspace if available
              if ($frame->project->workspace) {
                  broadcast(new ThumbnailGenerated($frame, $frame->project->workspace));
              }
              
                return response()->json([
                  'success' => true,
                  'message' => 'Thumbnail generated successfully',
                  'thumbnail_url' => $thumbnailUrl,
                  'generated_at' => now()->toISOString(),
                  'method' => 'playwright'
              ]);
          }
          
          // Fallback to static generation if Playwright fails
          Log::warning('Playwright thumbnail generation failed, falling back to static');
          return $this->generateStaticThumbnailFallback($frame);
          
      } catch (\Exception $e) {
          Log::error('Thumbnail generation failed', [
              'frame_id' => $frame->uuid,
              'error' => $e->getMessage(),
              'trace' => $e->getTraceAsString()
          ]);
          
          // Always provide a fallback
          return $this->generateStaticThumbnailFallback($frame);
      }
  }
    
    /**
    * Generate thumbnail from canvas state (for real-time updates)
     */
    public function generateThumbnailFromCanvas(Request $request, Frame $frame): JsonResponse
    {
        $user = Auth::user();
        
        if (!$this->checkFrameAccess($frame, $user)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        $validated = $request->validate([
            'canvas_components' => 'required|array',
            'canvas_settings' => 'nullable|array',
            'viewport' => 'nullable|array',
            'background_color' => 'nullable|string'
        ]);

        try {
            // Merge canvas settings with frame settings
            $canvasSettings = array_merge(
                $frame->settings ?? [],
                $validated['canvas_settings'] ?? [],
                [
                    'viewport' => $validated['viewport'] ?? ['width' => 1440, 'height' => 900],
                    'background_color' => $validated['background_color'] ?? '#ffffff'
                ]
            );
            
            $thumbnailPath = $this->thumbnailService->generateThumbnailFromCanvas(
                $frame,
                $validated['canvas_components'],
                $canvasSettings
            );
            
            if ($thumbnailPath) {
                $thumbnailUrl = $this->thumbnailService->getThumbnailUrl($frame);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Thumbnail updated from canvas',
                    'thumbnail_url' => $thumbnailUrl,
                    'generated_at' => now()->toISOString(),
                    'components_count' => count($validated['canvas_components'])
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate thumbnail from canvas'
            ], 500);

        } catch (\Exception $e) {
            Log::error('Canvas thumbnail generation error:', [
                'frame_id' => $frame->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Canvas thumbnail generation failed'
            ], 500);
        }
    }
    
      /**
   * Enhanced thumbnail status method
   */
  public function getThumbnailStatus(Frame $frame): JsonResponse
  {
      $user = Auth::user();
      
      if (!$this->checkFrameAccess($frame, $user)) {
          return response()->json([
              'success' => false,
              'message' => 'Access denied'
          ], 403);
      }
  
      $settings = $frame->settings ?? [];
      $thumbnailGenerated = $settings['thumbnail_generated'] ?? false;
      $thumbnailPath = $settings['thumbnail_path'] ?? null;
      $thumbnailUrl = null;
      $version = $settings['thumbnail_version'] ?? time();
      
      if ($thumbnailPath) {
          $fullPath = storage_path('app/public/' . $thumbnailPath);
          if (file_exists($fullPath)) {
              $thumbnailUrl = asset('storage/' . $thumbnailPath . '?v=' . $version);
          } else {
              // File doesn't exist, regenerate
              Log::warning('Thumbnail file missing, regenerating', [
                  'frame_id' => $frame->uuid,
                  'expected_path' => $fullPath
              ]);
              
              // Trigger regeneration
              return $this->generateStaticThumbnailFallback($frame);
          }
      }
        return response()->json([
          'success' => true,
          'thumbnail_generated' => $thumbnailGenerated,
          'thumbnail_url' => $thumbnailUrl,
          'generated_at' => $settings['thumbnail_generated_at'] ?? null,
          'version' => $version,
          'file_exists' => $thumbnailPath ? file_exists(storage_path('app/public/' . $thumbnailPath)) : false,
          'method' => $settings['thumbnail_method'] ?? 'unknown'
      ]);
  }
    
    /**
     * Check if user has access to frame
     */
    private function checkFrameAccess(Frame $frame, $user): bool
    {
        $project = $frame->project;
        
        // User owns the project
        if ($project->user_id === $user->id) {
            return true;
        }
        
        // Check workspace access
        if ($project->workspace && $project->workspace->hasUser($user->id)) {
            return true;
        }
        
        // Project is public (read-only)
        return $project->is_public;
    }

    /**
     * Generate default canvas data based on frame type.
     */
    private function getDefaultCanvasData(string $type): array
    {
        $baseData = [
            'template' => 'blank',
            'device' => 'desktop',
            'viewport' => [
                'width' => 1440,
                'height' => 900
            ],
            'elements' => [],
            'position' => [
                'x' => rand(100, 800),
                'y' => rand(100, 600)
            ]
        ];

        if ($type === 'page') {
            $baseData['elements'] = [
                [
                    'id' => 'header-' . uniqid(),
                    'type' => 'header',
                    'props' => [
                        'className' => 'w-full h-16 bg-white border-b flex items-center px-6'
                    ],
                    'children' => [
                        [
                            'id' => 'logo-' . uniqid(),
                            'type' => 'div',
                            'props' => [
                                'className' => 'text-xl font-bold'
                            ],
                            'children' => 'Your Logo'
                        ]
                    ]
                ],
                [
                    'id' => 'main-' . uniqid(),
                    'type' => 'main',
                    'props' => [
                        'className' => 'flex-1 p-8'
                    ],
                    'children' => [
                        [
                            'id' => 'hero-' . uniqid(),
                            'type' => 'div',
                            'props' => [
                                'className' => 'text-center py-20'
                            ],
                            'children' => [
                                [
                                    'id' => 'title-' . uniqid(),
                                    'type' => 'h1',
                                    'props' => [
                                        'className' => 'text-4xl font-bold mb-4'
                                    ],
                                    'children' => 'Welcome to Your Page'
                                ],
                                [
                                    'id' => 'subtitle-' . uniqid(),
                                    'type' => 'p',
                                    'props' => [
                                        'className' => 'text-xl text-gray-600'
                                    ],
                                    'children' => 'Start building something amazing'
                                ]
                            ]
                        ]
                    ]
                ]
            ];
        } elseif ($type === 'component') {
            $baseData['elements'] = [
                [
                    'id' => 'root-' . uniqid(),
                    'type' => 'div',
                    'props' => [
                        'className' => 'p-6 border rounded-lg bg-white shadow-sm'
                    ],
                    'children' => [
                        [
                            'id' => 'content-' . uniqid(),
                            'type' => 'div',
                            'props' => [
                                'className' => 'space-y-4'
                            ],
                            'children' => [
                                [
                                    'id' => 'heading-' . uniqid(),
                                    'type' => 'h3',
                                    'props' => [
                                        'className' => 'text-lg font-semibold'
                                    ],
                                    'children' => 'Component Title'
                                ],
                                [
                                    'id' => 'description-' . uniqid(),
                                    'type' => 'p',
                                    'props' => [
                                        'className' => 'text-gray-600'
                                    ],
                                    'children' => 'This is your new component. Start customizing it!'
                                ]
                            ]
                        ]
                    ]
                ]
            ];
        }

        return $baseData;
    }

    /**
     * Generate default settings for frames.
     */
    private function getDefaultSettings(): array
    {
        return [
            'viewport_width' => 1440,
            'viewport_height' => 900,
            'background_color' => '#ffffff',
            'grid_enabled' => true,
            'snap_to_grid' => true,
            'grid_size' => 10,
            'zoom_level' => 100,
            'auto_save' => true,
            'show_rulers' => false,
            'thumbnail_generated' => false
        ];
    }

    /**
   * Enhanced static thumbnail fallback
   */
  private function generateStaticThumbnailFallback(Frame $frame): JsonResponse
  {
      try {
          // Create thumbnails directory if it doesn't exist
          $thumbnailDir = storage_path('app/public/thumbnails/frames');
          if (!file_exists($thumbnailDir)) {
              mkdir($thumbnailDir, 0755, true);
          }
  
          // Generate enhanced SVG thumbnail
          $svg = $this->generateEnhancedStaticThumbnail($frame);
          $timestamp = time();
          $thumbnailPath = $thumbnailDir . '/' . $frame->uuid . '_' . $timestamp . '.svg';
          
          file_put_contents($thumbnailPath, $svg);
  
          // Update frame settings
          $settings = $frame->settings ?? [];
          $settings['thumbnail_generated'] = true;
          $settings['thumbnail_path'] = 'thumbnails/frames/' . $frame->uuid . '_' . $timestamp . '.svg';
          $settings['thumbnail_generated_at'] = now()->toISOString();
          $settings['thumbnail_version'] = $timestamp;
          
          $frame->update(['settings' => $settings]);
          
          $thumbnailUrl = asset('storage/' . $settings['thumbnail_path']);
          
          Log::info('Static thumbnail generated', [
              'frame_id' => $frame->uuid,
              'path' => $thumbnailPath,
              'url' => $thumbnailUrl
          ]);
          
            return response()->json([
              'success' => true,
              'message' => 'Static thumbnail generated successfully',
              'thumbnail_url' => $thumbnailUrl,
              'generated_at' => now()->toISOString(),
              'method' => 'static'
          ]);
          
      } catch (\Exception $e) {
          Log::error('Static thumbnail generation failed', [
              'frame_id' => $frame->uuid,
              'error' => $e->getMessage()
          ]);
          
          return response()->json([
              'success' => false,
              'message' => 'Failed to generate thumbnail: ' . $e->getMessage()
          ], 500);
      }
  }
  
    /**
   * Generate enhanced static SVG thumbnail based on frame content
   */
    private function generateEnhancedStaticThumbnail(Frame $frame): string
  {
      // Get the actual canvas data from the frame
      $canvasData = $frame->canvas_data ?? [];
      $components = $canvasData['components'] ?? [];
      
      Log::info('Generating thumbnail for frame with components:', [
          'frame_id' => $frame->uuid,
          'component_count' => count($components),
          'canvas_data_keys' => array_keys($canvasData)
      ]);
      
      $frameType = $frame->type ?? 'page';
      $backgroundColor = $frame->settings['background_color'] ?? '#ffffff';
      
      // If no components, show empty state
      if (empty($components)) {
          return $this->generateEmptyCanvasThumbnail($frame, $backgroundColor);
      }
      
      // Generate thumbnail based on actual components
      return $this->generateCanvasBasedThumbnail($frame, $components, $backgroundColor);
  }
  
  
    private function generateCanvasBasedThumbnail(Frame $frame, array $components, string $backgroundColor): string
  {
      $componentCount = count($components);
      $primaryColor = '#3b82f6';
      $secondaryColor = '#10b981';
      $accentColor = '#f59e0b';
      
      // Analyze components to determine layout
      $hasHeader = $this->hasComponentType($components, ['header', 'nav']);
      $hasButtons = $this->hasComponentType($components, ['button']);
      $hasInputs = $this->hasComponentType($components, ['input', 'textarea', 'form']);
      $hasText = $this->hasComponentType($components, ['h1', 'h2', 'h3', 'p', 'text']);
      $hasImages = $this->hasComponentType($components, ['img', 'image']);
      
      $svg = '<?xml version="1.0" encoding="UTF-8"?>
  <svg width="320" height="224" viewBox="0 0 320 224" xmlns="http://www.w3.org/2000/svg">
      <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:' . $backgroundColor . ';stop-opacity:1" />
              <stop offset="100%" style="stop-color:' . $this->darkenColor($backgroundColor, 0.05) . ';stop-opacity:1" />
          </linearGradient>
          <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.1)"/>
          </filter>
      </defs>
      
      <!-- Background -->
      <rect width="320" height="224" fill="url(#bgGrad)" rx="8"/>
        <!-- Browser chrome for pages -->';
      
      if ($frame->type === 'page') {
          $svg .= '
      <rect x="0" y="0" width="320" height="32" fill="#f8fafc" stroke="#e2e8f0" rx="8"/>
      <circle cx="16" cy="16" r="4" fill="#ef4444"/>
      <circle cx="32" cy="16" r="4" fill="#f59e0b"/>
      <circle cx="48" cy="16" r="4" fill="#10b981"/>
      <rect x="70" y="10" width="180" height="12" rx="6" fill="white" stroke="#e2e8f0"/>
          ';
          $contentY = 40;
      } else {
          $contentY = 8;
      }
      
      $svg .= '
      <!-- Content based on actual components -->
      <rect x="8" y="' . $contentY . '" width="304" height="' . (216 - $contentY) . '" fill="rgba(255,255,255,0.9)" rx="8" filter="url(#shadow)"/>';
      
      // Render components based on analysis
      $currentY = $contentY + 16;
      
      // Header section
      if ($hasHeader) {
          $svg .= '
      <rect x="20" y="' . $currentY . '" width="280" height="24" rx="4" fill="' . $primaryColor . '" opacity="0.8"/>
      <rect x="30" y="' . ($currentY + 6) . '" width="60" height="12" rx="2" fill="white" opacity="0.9"/>
      <rect x="250" y="' . ($currentY + 8) . '" width="40" height="8" rx="2" fill="white" opacity="0.7"/>';
          $currentY += 35;
      }
        // Text content
      if ($hasText && $currentY < 180) {
          $svg .= '
      <rect x="30" y="' . $currentY . '" width="180" height="16" rx="2" fill="#1f2937"/>
      <rect x="30" y="' . ($currentY + 20) . '" width="220" height="8" rx="2" fill="#6b7280"/>
      <rect x="30" y="' . ($currentY + 32) . '" width="160" height="8" rx="2" fill="#6b7280"/>';
          $currentY += 50;
      }
      
      // Interactive elements (buttons, inputs)
      if (($hasButtons || $hasInputs) && $currentY < 180) {
          $elementY = $currentY;
          
          if ($hasInputs) {
              $svg .= '
      <rect x="30" y="' . $elementY . '" width="120" height="20" rx="4" fill="white" stroke="#d1d5db" stroke-width="1"/>
      <rect x="35" y="' . ($elementY + 5) . '" width="80" height="10" rx="2" fill="#e5e7eb"/>';
              $elementY += 30;
          }
          
          if ($hasButtons) {
              $svg .= '
      <rect x="30" y="' . $elementY . '" width="70" height="24" rx="4" fill="' . $secondaryColor . '"/>
      <rect x="110" y="' . $elementY . '" width="70" height="24" rx="4" fill="' . $accentColor . '" opacity="0.8"/>';
          }
          
          $currentY = $elementY + 35;
      }
        // Images placeholder
      if ($hasImages && $currentY < 180) {
          $svg .= '
      <rect x="200" y="' . ($contentY + 16) . '" width="80" height="60" rx="4" fill="#f3f4f6" stroke="#d1d5db"/>
      <rect x="220" y="' . ($contentY + 36) . '" width="40" height="20" rx="2" fill="#9ca3af" opacity="0.5"/>';
      }
      
      // Component count and info
      $svg .= '
      <!-- Frame info -->
      <text x="20" y="210" font-family="Arial, sans-serif" font-size="10" font-weight="500" fill="#6b7280">
          ' . htmlspecialchars(substr($frame->name, 0, 25)) . ' • ' . $componentCount . ' components
      </text>
      
      <!-- Live indicator -->
      <circle cx="300" cy="210" r="3" fill="#10b981">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
      </circle>
      
      <!-- Component type indicators -->
      <g transform="translate(250, 195)">';
      
      $indicatorX = 0;
      if ($hasHeader) {
          $svg .= '<rect x="' . $indicatorX . '" y="0" width="8" height="8" rx="2" fill="' . $primaryColor . '" opacity="0.8"/>';
          $indicatorX += 12;
      }
      if ($hasButtons) {
          $svg .= '<rect x="' . $indicatorX . '" y="0" width="8" height="8" rx="2" fill="' . $secondaryColor . '" opacity="0.8"/>';
          $indicatorX += 12;
      }
      if ($hasInputs) {
          $svg .= '<rect x="' . $indicatorX . '" y="0" width="8" height="8" rx="2" fill="' . $accentColor . '" opacity="0.8"/>';
          $indicatorX += 12;
      }
        if ($hasText) {
          $svg .= '<rect x="' . $indicatorX . '" y="0" width="8" height="8" rx="2" fill="#6366f1" opacity="0.8"/>';
      }
      
      $svg .= '</g>
  </svg>';
      
      return $svg;
  }
  
    /**
   * Generate empty canvas thumbnail
   */
  private function generateEmptyCanvasThumbnail(Frame $frame, string $backgroundColor): string
  {
      return '<?xml version="1.0" encoding="UTF-8"?>
  <svg width="320" height="224" viewBox="0 0 320 224" xmlns="http://www.w3.org/2000/svg">
      <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:' . $backgroundColor . ';stop-opacity:1" />
              <stop offset="100%" style="stop-color:' . $this->darkenColor($backgroundColor, 0.03) . ';stop-opacity:1" />
          </linearGradient>
      </defs>
      
      <rect width="320" height="224" fill="url(#bgGrad)" rx="8"/>
      ' . ($frame->type === 'page' ? '
      <rect x="0" y="0" width="320" height="32" fill="#f8fafc" stroke="#e2e8f0" rx="8"/>
      <circle cx="16" cy="16" r="4" fill="#ef4444"/>
      <circle cx="32" cy="16" r="4" fill="#f59e0b"/>
      <circle cx="48" cy="16" r="4" fill="#10b981"/>
      ' : '') . '
      
      <rect x="8" y="' . ($frame->type === 'page' ? '40' : '8') . '" width="304" height="' . ($frame->type === 'page' ? '176' : '208') . '" fill="none" stroke="#e5e7eb" stroke-width="2" stroke-dasharray="8,8" rx="8"/>
      <circle cx="160" cy="' . ($frame->type === 'page' ? '128' : '112') . '" r="20" fill="#3b82f6" opacity="0.1"/>
      <text x="160" y="' . ($frame->type === 'page' ? '145' : '129') . '" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle">Empty Canvas</text>
      <text x="160" y="' . ($frame->type === 'page' ? '160' : '144') . '" font-family="Arial, sans-serif" font-size="10" fill="#d1d5db" text-anchor="middle">Drop components to start building</text>
      
      <text x="20" y="210" font-family="Arial, sans-serif" font-size="10" fill="#6b7280">
          ' . htmlspecialchars($frame->name) . ' • No components yet
      </text>
  </svg>';
  }
  
    /**
   * Check if components array contains specific types
   */
  private function hasComponentType(array $components, array $types): bool
  {
      foreach ($components as $component) {
          $componentType = $component['type'] ?? '';
          if (in_array($componentType, $types)) {
              return true;
          }
      }
      return false;
  }
  
  

    /**
     * Generate SVG thumbnail based on frame content.
     */
    private function generateStaticSvgThumbnail(Frame $frame): string
    {
        $type = $frame->type;
        $elements = $frame->canvas_data['elements'] ?? [];
        
        if ($type === 'page') {
            return $this->generatePageThumbnail($frame, $elements);
        } else {
            return $this->generateComponentThumbnail($frame, $elements);
        }
    }

      /**
   * Generate enhanced page thumbnail SVG
   */
  private function generatePageThumbnailSVG($frame, $components, $bg, $primary, $secondary, $accent): string
  {
      $componentCount = count($components);
      $hasComponents = $componentCount > 0;
      
      return '<?xml version="1.0" encoding="UTF-8"?>
      <svg width="320" height="224" viewBox="0 0 320 224" xmlns="http://www.w3.org/2000/svg">
          <defs>
              <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:' . $bg . ';stop-opacity:1" />
                  <stop offset="100%" style="stop-color:' . $this->darkenColor($bg, 0.05) . ';stop-opacity:1" />
              </linearGradient>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.1)"/>
              </filter>
          </defs>
          
          <!-- Background -->
          <rect width="320" height="224" fill="url(#bgGrad)" rx="8"/>
          
          <!-- Browser Chrome -->
          <rect x="0" y="0" width="320" height="32" fill="#f8fafc" stroke="#e2e8f0" rx="8" stroke-width="1"/>
          
          <!-- Traffic lights -->
          <circle cx="16" cy="16" r="4" fill="#ef4444"/>
          <circle cx="32" cy="16" r="4" fill="#f59e0b"/>
          <circle cx="48" cy="16" r="4" fill="#10b981"/>
          
          <!-- URL bar -->
          <rect x="70" y="10" width="180" height="12" rx="6" fill="white" stroke="#e2e8f0"/>
          <rect x="75" y="13" width="8" height="6" rx="2" fill="#9ca3af"/>
          <rect x="88" y="13" width="120" height="6" rx="2" fill="#e5e7eb"/>
          
            <!-- Page Content -->' . 
          ($hasComponents ? $this->generateComponentsPreview($components, $primary, $secondary, $accent) : 
           $this->generateEmptyPagePreview($primary)) . '
          
          <!-- Frame info -->
          <text x="16" y="210" font-family="Arial, sans-serif" font-size="10" fill="#6b7280">
              ' . htmlspecialchars($frame->name) . ' (' . $componentCount . ' components)
          </text>
          
          <!-- Frame type indicator -->
          <rect x="280" y="190" width="32" height="16" rx="8" fill="' . $primary . '" opacity="0.8"/>
          <text x="296" y="200" font-family="Arial, sans-serif" font-size="8" fill="white" text-anchor="middle">PAGE</text>
      </svg>';
  }

      /**
   * Generate component thumbnail SVG
   */
  private function generateComponentThumbnailSVG($frame, $components, $bg, $primary, $secondary, $accent): string
  {
      $componentCount = count($components);
      
      return '<?xml version="1.0" encoding="UTF-8"?>
      <svg width="320" height="224" viewBox="0 0 320 224" xmlns="http://www.w3.org/2000/svg">
          <defs>
              <linearGradient id="compBg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:' . $bg . ';stop-opacity:1" />
                  <stop offset="100%" style="stop-color:' . $this->darkenColor($bg, 0.03) . ';stop-opacity:1" />
              </linearGradient>
              <filter id="compShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.15)"/>
              </filter>
          </defs>
          
          <!-- Background -->
          <rect width="320" height="224" fill="url(#compBg)" rx="12"/>
          
          <!-- Component border -->
          <rect x="8" y="8" width="304" height="208" fill="none" stroke="' . $primary . '" stroke-width="2" stroke-dasharray="8,4" rx="8" opacity="0.6"/>
          
          <!-- Component header -->
          <rect x="24" y="24" width="272" height="40" rx="8" fill="white" filter="url(#compShadow)"/>
          <circle cx="44" cy="44" r="8" fill="' . $primary . '"/>
          <rect x="60" y="38" width="120" height="8" rx="4" fill="#1f2937"/>
          <rect x="60" y="50" width="80" height="6" rx="3" fill="#6b7280"/>
          
              <!-- Component content -->
            ' . ($componentCount > 0 ? '
            <rect x="24" y="80" width="272" height="100" rx="8" fill="white" filter="url(#compShadow)" opacity="0.9"/>
            <rect x="40" y="96" width="60" height="20" rx="4" fill="' . $secondary . '" opacity="0.8"/>
            <rect x="120" y="96" width="80" height="20" rx="4" fill="' . $accent . '" opacity="0.8"/>
            <rect x="40" y="128" width="200" height="8" rx="4" fill="#e5e7eb"/>
            <rect x="40" y="144" width="160" height="8" rx="4" fill="#e5e7eb"/>
            <rect x="40" y="160" width="120" height="8" rx="4" fill="#e5e7eb"/>
            ' : '
            <rect x="24" y="80" width="272" height="100" rx="8" fill="none" stroke="#e5e7eb" stroke-width="2" stroke-dasharray="4,4"/>
            <text x="160" y="135" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle">Empty Component</text>
            ') . '
            
            <!-- Component footer -->
            <text x="24" y="205" font-family="Arial, sans-serif" font-size="10" fill="#6b7280">
                ' . htmlspecialchars($frame->name) . ' (' . $componentCount . ' elements)
            </text>
            
            <!-- Component type indicator -->
            <rect x="260" y="190" width="52" height="16" rx="8" fill="' . $secondary . '" opacity="0.8"/>
            <text x="286" y="200" font-family="Arial, sans-serif" font-size="8" fill="white" text-anchor="middle">COMPONENT</text>
        </svg>';
    }
    
      /**
   * Generate preview of actual components
   */
  private function generateComponentsPreview($components, $primary, $secondary, $accent): string
  {
      $preview = '<!-- Content Area -->
      <rect x="8" y="40" width="304" height="140" fill="white" rx="8" opacity="0.95" filter="url(#shadow)"/>';
      
      // Simulate different component types
      $y = 55;
      $componentTypes = array_slice(array_column($components, 'type'), 0, 4); // Show max 4 components
      
      foreach ($componentTypes as $index => $type) {
          $color = $index % 3 === 0 ? $primary : ($index % 3 === 1 ? $secondary : $accent);
          $height = $this->getComponentHeight($type);
          $width = $this->getComponentWidth($type, $index);
          
          $preview .= '<rect x="20" y="' . $y . '" width="' . $width . '" height="' . $height . '" rx="4" fill="' . $color . '" opacity="0.7"/>';
          
          // Add component label
          if ($height >= 16) {
              $preview .= '<text x="' . (20 + $width/2) . '" y="' . ($y + $height/2 + 3) . '" font-family="Arial, sans-serif" font-size="8" fill="white" text-anchor="middle">' . strtoupper($type) . '</text>';
          }
          
          $y += $height + 8;
          if ($y > 160) break; // Don't overflow
      }
      
      return $preview;
  }
  
    /**
   * Generate empty page preview
   */
  private function generateEmptyPagePreview($primary): string
  {
      return '<!-- Empty State -->
      <rect x="8" y="40" width="304" height="140" fill="none" stroke="#e5e7eb" stroke-width="2" stroke-dasharray="8,8" rx="8"/>
      <circle cx="160" cy="110" r="20" fill="' . $primary . '" opacity="0.1"/>
      <rect x="140" y="130" width="40" height="8" rx="4" fill="#d1d5db"/>
      <rect x="130" y="145" width="60" height="6" rx="3" fill="#e5e7eb"/>
      <text x="160" y="165" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af" text-anchor="middle">Drop components here</text>';
  }
  
    /**
   * Helper methods for component preview
   */
  private function getComponentHeight($type): int
  {
      $heights = [
          'header' => 32, 'nav' => 24, 'section' => 48, 'div' => 32,
          'button' => 20, 'input' => 20, 'card' => 40, 'modal' => 36,
          'h1' => 16, 'h2' => 14, 'h3' => 12, 'p' => 10
      ];
      return $heights[$type] ?? 24;
  }
  
  private function getComponentWidth($type, $index): int
  {
      $baseWidths = [
          'header' => 280, 'nav' => 280, 'section' => 280, 'div' => 200,
          'button' => 80, 'input' => 120, 'card' => 140, 'modal' => 200,
          'h1' => 180, 'h2' => 160, 'h3' => 140, 'p' => 220
      ];
      $base = $baseWidths[$type] ?? 160;
      return $base - ($index * 20); // Vary width slightly
  }
  
      /**
   * Darken hex color
   */
  private function darkenColor(string $hex, float $percent): string
  {
      $hex = str_replace('#', '', $hex);
      $r = hexdec(substr($hex, 0, 2));
      $g = hexdec(substr($hex, 2, 2));
      $b = hexdec(substr($hex, 4, 2));
      
      $r = max(0, min(255, $r * (1 - $percent)));
      $g = max(0, min(255, $g * (1 - $percent)));
      $b = max(0, min(255, $b * (1 - $percent)));
      
      return sprintf("#%02x%02x%02x", $r, $g, $b);
  }

    /**
     * Get thumbnail URL for a frame.
     */
    private function getThumbnailUrl(Frame $frame): ?string
    {
        $settings = $frame->settings ?? [];
        if (!isset($settings['thumbnail_path'])) {
            return null;
        }
        
        return asset('storage/' . $settings['thumbnail_path']);
    }

    /**
     * Delete thumbnail file for a frame.
     */
    private function deleteThumbnail(Frame $frame): void
    {
        $settings = $frame->settings ?? [];
        if (isset($settings['thumbnail_path'])) {
            $fullPath = storage_path('app/public/' . $settings['thumbnail_path']);
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }
        }
    }
  
/**
 * Batch generate thumbnails for multiple frames
 */
public function batchGenerateThumbnails(Request $request): JsonResponse
{
    $validated = $request->validate([
        'frame_uuids' => 'required|array|min:1|max:20',
        'frame_uuids.*' => 'required|string|exists:frames,uuid'
    ]);

    $user = Auth::user();
    $results = [];
    $successful = 0;
    $failed = 0;

    foreach ($validated['frame_uuids'] as $frameUuid) {
        try {
            $frame = Frame::where('uuid', $frameUuid)->first();
            
            if (!$frame || !$this->checkFrameAccess($frame, $user)) {
                $results[] = [
                    'frame_uuid' => $frameUuid,
                    'success' => false,
                    'error' => 'Access denied or frame not found'
                ];
                $failed++;
                continue;
            }

            $thumbnailPath = $this->thumbnailService->generateThumbnail($frame);
            
            if ($thumbnailPath) {
                $results[] = [
                    'frame_uuid' => $frameUuid,
                    'success' => true,
                    'thumbnail_url' => $this->thumbnailService->getThumbnailUrl($frame)
                ];
                $successful++;
            } else {
                $results[] = [
                    'frame_uuid' => $frameUuid,
                    'success' => false,
                    'error' => 'Failed to generate thumbnail'
                ];
                $failed++;
            }

        } catch (\Exception $e) {
            Log::error("Batch thumbnail generation failed for frame {$frameUuid}:", [
                'error' => $e->getMessage()
            ]);
            
            $results[] = [
                'frame_uuid' => $frameUuid,
                'success' => false,
                'error' => $e->getMessage()
            ];
            $failed++;
        }
    }

    return response()->json([
        'success' => true,
        'results' => $results,
        'summary' => [
            'total' => count($validated['frame_uuids']),
            'successful' => $successful,
            'failed' => $failed
        ]
    ]);
}

/**
 * Clean up old thumbnail files
 */
public function cleanupThumbnails(Request $request): JsonResponse
{
    $user = Auth::user();
    
    try {
        $cleaned = $this->thumbnailService->cleanupTempFiles();
        
        return response()->json([
            'success' => true,
            'message' => "Cleaned up {$cleaned} temporary files",
            'files_cleaned' => $cleaned
        ]);

    } catch (\Exception $e) {
        Log::error('Thumbnail cleanup error:', ['error' => $e->getMessage()]);
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to cleanup thumbnails'
        ], 500);
    }
}

/**
 * Check Playwright availability
 */
public function checkPlaywrightStatus(Request $request): JsonResponse
{
    try {
        $available = $this->thumbnailService->checkPlaywrightAvailability();
        
        return response()->json([
            'available' => $available,
            'message' => $available 
                ? 'Playwright is available and ready' 
                : 'Playwright is not installed or not accessible'
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'available' => false,
            'message' => 'Error checking Playwright: ' . $e->getMessage()
        ]);
    }
}
}