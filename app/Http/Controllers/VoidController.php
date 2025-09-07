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

class VoidController extends Controller
{
    /**
     * Display the void page for a project (moved from ProjectController)
     */
    public function show(Project $project): Response
    {
        $user = Auth::user();
        
        // Enhanced access control: Check both ownership AND workspace access
        if ($project->user_id !== $user->id && !$project->is_public) {
            // If user doesn't own the project, check workspace access
            if (!$project->workspace || !$project->workspace->hasUser($user->id)) {
                abort(403, 'Access denied to this project.');
            }
        }
        
        // Additional check: ensure workspace access even for public projects
        if ($project->workspace && !$project->workspace->hasUser($user->id)) {
            abort(403, 'You do not have access to this workspace.');
        }
        
        $project->updateLastOpened();
        
        return Inertia::render('VoidPage', [
            'project' => $project->load('workspace'),
            'canvas_data' => $project->canvas_data,
            'frames' => $project->canvas_data['frames'] ?? [],
            'userRole' => $project->workspace ? $project->workspace->getUserRole($user->id) : 'owner',
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

            // Ensure user owns the project
            $project = Project::where('id', $validated['project_id'])
                             ->where('user_id', auth()->id())
                             ->first();
            
            if (!$project) {
                Log::error('Project not found or access denied', [
                    'project_id' => $validated['project_id'],
                    'user_id' => auth()->id()
                ]);
                
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Project not found or access denied'
                    ], 403);
                }
                
                return back()->withErrors(['project' => 'Project not found or access denied']);
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
        // Ensure user owns the project that contains this frame
        if ($frame->project->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $frame->load('project');

        return response()->json(['frame' => $frame]);
    }

    /**
     * Update the specified frame.
     */
    public function update(Request $request, Frame $frame): JsonResponse
    {
        // Ensure user owns the project that contains this frame
        if ($frame->project->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => ['sometimes', Rule::in(['page', 'component'])],
            'canvas_data' => 'sometimes|array',
            'settings' => 'sometimes|array',
        ]);

        $frame->update($validated);
        $frame->load('project');

        return response()->json([
            'message' => 'Frame updated successfully',
            'frame' => $frame
        ]);
    }

    /**
     * Remove the specified frame.
     */
    public function destroy(Frame $frame): JsonResponse
    {
        // Ensure user owns the project that contains this frame
        if ($frame->project->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Delete thumbnail if exists
        $this->deleteThumbnail($frame);

        $frame->delete();

        return response()->json([
            'message' => 'Frame deleted successfully'
        ]);
    }

    /**
     * Duplicate a frame.
     */
    public function duplicate(Request $request, Frame $frame): JsonResponse
    {
        // Ensure user owns the project that contains this frame
        if ($frame->project->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
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
        // Ensure user owns the project that contains this frame
        if ($frame->project->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
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

        return response()->json([
            'message' => 'Frame position updated successfully',
            'frame' => $frame
        ]);
    }

    /**
     * Get frames by project UUID (for void page).
     */
    public function getByProject(string $projectUuid): JsonResponse
    {
        $project = Project::where('uuid', $projectUuid)
                         ->where('user_id', auth()->id())
                         ->firstOrFail();

        $frames = Frame::where('project_id', $project->id)
                      ->orderBy('created_at', 'desc')
                      ->get();

        return response()->json([
            'frames' => $frames,
            'total' => $frames->count()
        ]);
    }

    /**
     * Generate thumbnail using Playwright (placeholder for now).
     */
    public function generateThumbnail(Request $request, Frame $frame): JsonResponse
    {
        // Ensure user owns the project that contains this frame
        if ($frame->project->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        try {
            // For now, generate static thumbnail
            // TODO: Implement Playwright thumbnail generation
            $this->generateStaticThumbnail($frame);

            return response()->json([
                'message' => 'Thumbnail generated successfully',
                'thumbnail_url' => $this->getThumbnailUrl($frame)
            ]);
        } catch (\Exception $e) {
            Log::error('Thumbnail generation error:', [
                'frame_id' => $frame->id,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to generate thumbnail'
            ], 500);
        }
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
     * Generate static thumbnail (placeholder until Playwright implementation).
     */
    private function generateStaticThumbnail(Frame $frame): void
    {
        try {
            // Create thumbnails directory if it doesn't exist
            $thumbnailDir = storage_path('app/public/thumbnails/frames');
            if (!file_exists($thumbnailDir)) {
                mkdir($thumbnailDir, 0755, true);
            }

            // Generate a simple SVG thumbnail based on frame type and content
            $svg = $this->generateStaticSvgThumbnail($frame);
            
            $thumbnailPath = $thumbnailDir . '/' . $frame->uuid . '.svg';
            file_put_contents($thumbnailPath, $svg);

            // Update frame settings to indicate thumbnail was generated
            $settings = $frame->settings ?? [];
            $settings['thumbnail_generated'] = true;
            $settings['thumbnail_path'] = 'thumbnails/frames/' . $frame->uuid . '.svg';
            
            $frame->update(['settings' => $settings]);

        } catch (\Exception $e) {
            Log::error('Static thumbnail generation failed:', [
                'frame_id' => $frame->id,
                'error' => $e->getMessage()
            ]);
        }
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
     * Generate page thumbnail SVG.
     */
    private function generatePageThumbnail(Frame $frame, array $elements): string
    {
        return '
        <svg width="320" height="224" viewBox="0 0 320 224" xmlns="http://www.w3.org/2000/svg">
            <!-- Background -->
            <rect width="320" height="224" fill="#f8fafc"/>
            
            <!-- Header -->
            <rect x="0" y="0" width="320" height="32" fill="#ffffff" stroke="#e2e8f0"/>
            <circle cx="16" cy="16" r="4" fill="#ef4444"/>
            <circle cx="32" cy="16" r="4" fill="#f59e0b"/>
            <circle cx="48" cy="16" r="4" fill="#10b981"/>
            <rect x="80" y="12" width="60" height="8" rx="4" fill="#1f2937"/>
            
            <!-- Main content area -->
            <rect x="24" y="56" width="272" height="12" rx="6" fill="#3b82f6"/>
            <rect x="24" y="80" width="200" height="8" rx="4" fill="#6b7280"/>
            <rect x="24" y="96" width="240" height="8" rx="4" fill="#6b7280"/>
            
            <!-- Content blocks -->
            <rect x="24" y="120" width="80" height="60" rx="8" fill="#e5e7eb"/>
            <rect x="120" y="120" width="80" height="60" rx="8" fill="#e5e7eb"/>
            <rect x="216" y="120" width="80" height="60" rx="8" fill="#e5e7eb"/>
            
            <!-- Footer elements -->
            <rect x="24" y="196" width="40" height="6" rx="3" fill="#d1d5db"/>
            <rect x="72" y="196" width="60" height="6" rx="3" fill="#d1d5db"/>
        </svg>';
    }

    /**
     * Generate component thumbnail SVG.
     */
    private function generateComponentThumbnail(Frame $frame, array $elements): string
    {
        return '
        <svg width="320" height="224" viewBox="0 0 320 224" xmlns="http://www.w3.org/2000/svg">
            <!-- Background -->
            <rect width="320" height="224" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" rx="12"/>
            
            <!-- Component header -->
            <rect x="24" y="24" width="120" height="16" rx="8" fill="#1f2937"/>
            <rect x="24" y="48" width="200" height="10" rx="5" fill="#6b7280"/>
            
            <!-- Component content -->
            <rect x="24" y="72" width="272" height="1" fill="#e5e7eb"/>
            <rect x="24" y="88" width="80" height="24" rx="4" fill="#3b82f6"/>
            <rect x="120" y="88" width="80" height="24" rx="4" fill="#10b981"/>
            <rect x="216" y="88" width="80" height="24" rx="4" fill="#f59e0b"/>
            
            <!-- Additional elements -->
            <circle cx="48" cy="140" r="8" fill="#8b5cf6"/>
            <rect x="72" y="136" width="60" height="8" rx="4" fill="#ec4899"/>
            <rect x="72" y="148" width="40" height="6" rx="3" fill="#d1d5db"/>
            
            <!-- Component border indicator -->
            <rect x="8" y="8" width="304" height="208" fill="none" stroke="#3b82f6" stroke-width="2" stroke-dasharray="8 4" rx="8"/>
        </svg>';
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
}