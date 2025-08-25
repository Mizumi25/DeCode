<?php
// app/Http/Controllers/ProjectController.php
namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $filter = $request->input('filter', 'all'); // all, recent, draft, published, etc.
        
        $query = Auth::user()
            ->projects()
            ->with(['user:id,name,avatar']);

        // Apply search filter
        if ($search) {
            $query->search($search);
        }

        // Apply status filter
        switch ($filter) {
            case 'recent':
                $query->where('last_opened_at', '>', now()->subDays(7));
                break;
            case 'draft':
                $query->byStatus('draft');
                break;
            case 'published':
                $query->byStatus('published');
                break;
            case 'archived':
                $query->byStatus('archived');
                break;
        }

        $projects = $query->recent()
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'description' => $project->description,
                    'type' => $project->type,
                    'status' => $project->status,
                    'thumbnail' => $project->thumbnail ? asset('storage/' . $project->thumbnail) : null,
                    'last_opened_at' => $project->last_opened_at,
                    'formatted_last_opened' => $project->formatted_last_opened,
                    'component_count' => $project->component_count,
                    'created_at' => $project->created_at,
                    'updated_at' => $project->updated_at,
                    'viewport_width' => $project->viewport_width,
                    'viewport_height' => $project->viewport_height,
                    'css_framework' => $project->css_framework,
                    'output_format' => $project->output_format,
                    'is_public' => $project->is_public,
                ];
            });

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'filters' => [
                'search' => $search,
                'filter' => $filter,
            ],
            'stats' => [
                'total' => Auth::user()->projects()->count(),
                'draft' => Auth::user()->projects()->byStatus('draft')->count(),
                'published' => Auth::user()->projects()->byStatus('published')->count(),
                'recent' => Auth::user()->projects()->where('last_opened_at', '>', now()->subDays(7))->count(),
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => [
                'required',
                Rule::in(['website', 'landing_page', 'component_library', 'prototype', 'email_template', 'dashboard'])
            ],
            'viewport_width' => 'nullable|integer|min:320|max:3840',
            'viewport_height' => 'nullable|integer|min:240|max:2160',
            'css_framework' => [
                'nullable',
                Rule::in(['tailwind', 'bootstrap', 'vanilla', 'styled_components', 'emotion'])
            ],
            'output_format' => [
                'nullable',
                Rule::in(['html', 'react', 'vue', 'angular'])
            ],
            'responsive_breakpoints' => 'nullable|array',
            'responsive_breakpoints.mobile' => 'nullable|integer|min:320|max:768',
            'responsive_breakpoints.tablet' => 'nullable|integer|min:768|max:1024', 
            'responsive_breakpoints.desktop' => 'nullable|integer|min:1024|max:3840',
            'is_public' => 'boolean',
            'template_id' => 'nullable|integer|exists:projects,id'
        ]);

        // Set defaults
        $validated['user_id'] = Auth::id();
        $validated['settings'] = array_merge(Project::getDefaultSettings(), [
            'responsive_breakpoints' => $validated['responsive_breakpoints'] ?? [
                'mobile' => 375,
                'tablet' => 768,
                'desktop' => 1440
            ]
        ]);
        $validated['export_settings'] = Project::getDefaultExportSettings();
        $validated['status'] = 'draft';
        $validated['last_opened_at'] = now();

        // Set viewport defaults if not provided
        $validated['viewport_width'] = $validated['viewport_width'] ?? 1440;
        $validated['viewport_height'] = $validated['viewport_height'] ?? 900;
        $validated['css_framework'] = $validated['css_framework'] ?? 'tailwind';
        $validated['output_format'] = $validated['output_format'] ?? 'html';

        // Initialize canvas data with default frame structure
        $validated['canvas_data'] = [
            'frames' => [
                [
                    'id' => 'frame_' . uniqid(),
                    'name' => 'Home Page',
                    'type' => 'page',
                    'width' => $validated['viewport_width'],
                    'height' => $validated['viewport_height'],
                    'x' => 0,
                    'y' => 0,
                    'background' => '#ffffff',
                    'components' => [],
                    'created_at' => now()->toISOString(),
                ]
            ],
            'zoom' => 1,
            'pan' => ['x' => 0, 'y' => 0],
            'selected_frame' => null,
            'grid_settings' => [
                'enabled' => true,
                'size' => 10,
                'snap' => true
            ]
        ];

        $project = Project::create($validated);

        // If created from template, copy canvas data and settings
        if (isset($validated['template_id'])) {
            $template = Project::find($validated['template_id']);
            if ($template && ($template->is_public || $template->user_id === Auth::id())) {
                $project->update([
                    'canvas_data' => $template->canvas_data,
                    'settings' => array_merge($project->settings, $template->settings ?? [])
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $project->fresh(),
            'message' => 'Project created successfully',
            'redirect_url' => route('void.index', ['project' => $project->id])
        ], 201);
    }

    public function show(Project $project): Response
    {
        // Check if user can access this project
        if ($project->user_id !== Auth::id() && !$project->is_public) {
            abort(403, 'Access denied to this project.');
        }

        $project->updateLastOpened();

        return Inertia::render('Projects/Show', [
            'project' => $project->load(['user:id,name,avatar']),
            'canvas_data' => $project->canvas_data,
            'frames' => $project->canvas_data['frames'] ?? [],
        ]);
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        // Check ownership
        if ($project->user_id !== Auth::id()) {
            abort(403, 'Access denied.');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string|max:1000',
            'type' => [
                'sometimes',
                Rule::in(['website', 'landing_page', 'component_library', 'prototype', 'email_template', 'dashboard'])
            ],
            'status' => [
                'sometimes',
                Rule::in(['draft', 'active', 'archived', 'published'])
            ],
            'settings' => 'sometimes|array',
            'canvas_data' => 'sometimes|array',
            'export_settings' => 'sometimes|array',
            'viewport_width' => 'sometimes|integer|min:320|max:3840',
            'viewport_height' => 'sometimes|integer|min:240|max:2160',
            'css_framework' => [
                'sometimes',
                Rule::in(['tailwind', 'bootstrap', 'vanilla', 'styled_components', 'emotion'])
            ],
            'output_format' => [
                'sometimes',
                Rule::in(['html', 'react', 'vue', 'angular'])
            ],
            'is_public' => 'sometimes|boolean'
        ]);

        $project->update($validated);

        return response()->json([
            'success' => true,
            'data' => $project->fresh(),
            'message' => 'Project updated successfully'
        ]);
    }

    public function destroy(Project $project): JsonResponse
    {
        // Check ownership
        if ($project->user_id !== Auth::id()) {
            abort(403, 'Access denied.');
        }

        // Delete thumbnail if exists
        if ($project->thumbnail) {
            \Storage::disk('public')->delete($project->thumbnail);
        }

        $project->delete();

        return response()->json([
            'success' => true,
            'message' => 'Project deleted successfully'
        ]);
    }

    public function duplicate(Request $request, Project $project): JsonResponse
    {
        // Check if user can access this project
        if ($project->user_id !== Auth::id() && !$project->is_public) {
            abort(403, 'Access denied.');
        }

        $validated = $request->validate([
            'name' => 'nullable|string|max:255'
        ]);

        $newProject = $project->duplicate($validated['name'] ?? null);
        $newProject->user_id = Auth::id(); // Set current user as owner
        $newProject->is_public = false; // Duplicates are private by default
        $newProject->save();

        return response()->json([
            'success' => true,
            'data' => $newProject,
            'message' => 'Project duplicated successfully',
            'redirect_url' => route('void.index', ['project' => $newProject->id])
        ]);
    }

    public function templates(): JsonResponse
    {
        $templates = Project::where('is_public', true)
            ->where('status', 'published')
            ->with(['user:id,name,avatar'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'description' => $project->description,
                    'type' => $project->type,
                    'thumbnail' => $project->thumbnail ? asset('storage/' . $project->thumbnail) : null,
                    'author' => $project->user,
                    'created_at' => $project->created_at,
                    'frame_count' => count($project->canvas_data['frames'] ?? []),
                    'viewport_width' => $project->viewport_width,
                    'viewport_height' => $project->viewport_height,
                    'css_framework' => $project->css_framework,
                    'output_format' => $project->output_format,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $templates
        ]);
    }

    public function updateThumbnail(Request $request, Project $project): JsonResponse
    {
        // Check ownership
        if ($project->user_id !== Auth::id()) {
            abort(403, 'Access denied.');
        }

        $request->validate([
            'thumbnail' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048'
        ]);

        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail if exists
            if ($project->thumbnail) {
                \Storage::disk('public')->delete($project->thumbnail);
            }

            // Store new thumbnail
            $path = $request->file('thumbnail')->store('project-thumbnails', 'public');
            
            $project->update(['thumbnail' => $path]);

            return response()->json([
                'success' => true,
                'data' => ['thumbnail_url' => asset('storage/' . $path)],
                'message' => 'Thumbnail updated successfully'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No thumbnail file provided'
        ], 400);
    }

    /**
     * Create a new frame in the project
     */
    public function createFrame(Request $request, Project $project): JsonResponse
    {
        if ($project->user_id !== Auth::id()) {
            abort(403, 'Access denied.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:page,component',
            'width' => 'nullable|integer|min:320|max:3840',
            'height' => 'nullable|integer|min:240|max:2160',
            'x' => 'nullable|integer',
            'y' => 'nullable|integer',
            'background' => 'nullable|string'
        ]);

        $canvasData = $project->canvas_data ?? ['frames' => []];
        
        $newFrame = [
            'id' => 'frame_' . uniqid(),
            'name' => $validated['name'],
            'type' => $validated['type'],
            'width' => $validated['width'] ?? $project->viewport_width,
            'height' => $validated['height'] ?? $project->viewport_height,
            'x' => $validated['x'] ?? (count($canvasData['frames']) * 300),
            'y' => $validated['y'] ?? 0,
            'background' => $validated['background'] ?? '#ffffff',
            'components' => [],
            'created_at' => now()->toISOString(),
        ];

        $canvasData['frames'][] = $newFrame;
        
        $project->update(['canvas_data' => $canvasData]);

        return response()->json([
            'success' => true,
            'data' => $newFrame,
            'message' => 'Frame created successfully'
        ]);
    }
}