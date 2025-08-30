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
use Illuminate\Http\RedirectResponse;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $filter = $request->input('filter', 'all'); // all, recent, draft, published, archived
        $type = $request->input('type', 'all'); // all, website, landing_page, etc.
        $sort = $request->input('sort', 'updated_at'); // updated_at, created_at, name
        
        $query = Auth::user()
            ->projects()
            ->with(['user:id,name,avatar']);

        // Apply search filter
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        // Apply status filter
        switch ($filter) {
            case 'recent':
                $query->where('updated_at', '>', now()->subDays(7));
                break;
            case 'draft':
                $query->where('status', 'draft');
                break;
            case 'published':
                $query->where('status', 'published');
                break;
            case 'active':
                $query->where('status', 'active');
                break;
            case 'archived':
                $query->where('status', 'archived');
                break;
        }

        // Apply type filter
        if ($type !== 'all') {
            $query->where('type', $type);
        }

        // Apply sorting
        switch ($sort) {
            case 'name':
                $query->orderBy('name', 'asc');
                break;
            case 'created_at':
                $query->orderBy('created_at', 'desc');
                break;
            case 'updated_at':
            default:
                $query->orderBy('updated_at', 'desc');
                break;
        }

        $projects = $query->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id, 
                    'uuid' => $project->uuid,
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

        return Inertia::render('ProjectList', [
            'projects' => $projects,
            'filters' => [
                'search' => $search,
                'filter' => $filter,
                'type' => $type,
                'sort' => $sort,
            ],
            'stats' => [
                'total' => Auth::user()->projects()->count(),
                'draft' => Auth::user()->projects()->where('status', 'draft')->count(),
                'published' => Auth::user()->projects()->where('status', 'published')->count(),
                'active' => Auth::user()->projects()->where('status', 'active')->count(),
                'archived' => Auth::user()->projects()->where('status', 'archived')->count(),
                'recent' => Auth::user()->projects()->where('updated_at', '>', now()->subDays(7))->count(),
                'by_type' => Auth::user()->projects()
                    ->select('type', \DB::raw('count(*) as count'))
                    ->groupBy('type')
                    ->pluck('count', 'type')
                    ->toArray(),
            ]
        ]);
    }

    /**
     * Dedicated search API endpoint for faster AJAX requests
     */
    public function search(Request $request): JsonResponse
    {
        $search = $request->input('q', '');
        $filter = $request->input('filter', 'all');
        $type = $request->input('type', 'all');
        $sort = $request->input('sort', 'updated_at');
        $limit = $request->input('limit', 20);

        if (strlen($search) < 2) {
            return response()->json([
                'success' => false,
                'message' => 'Search query must be at least 2 characters long'
            ], 400);
        }

        $query = Auth::user()
            ->projects()
            ->with(['user:id,name,avatar']);

        // Apply search
        $query->where(function($q) use ($search) {
            $q->where('name', 'like', '%' . $search . '%')
              ->orWhere('description', 'like', '%' . $search . '%');
        });

        // Apply filters (same as index method)
        switch ($filter) {
            case 'recent':
                $query->where('updated_at', '>', now()->subDays(7));
                break;
            case 'draft':
                $query->where('status', 'draft');
                break;
            case 'published':
                $query->where('status', 'published');
                break;
            case 'active':
                $query->where('status', 'active');
                break;
            case 'archived':
                $query->where('status', 'archived');
                break;
        }

        if ($type !== 'all') {
            $query->where('type', $type);
        }

        // Apply sorting
        switch ($sort) {
            case 'name':
                $query->orderBy('name', 'asc');
                break;
            case 'created_at':
                $query->orderBy('created_at', 'desc');
                break;
            case 'updated_at':
            default:
                $query->orderBy('updated_at', 'desc');
                break;
        }

        $projects = $query->limit($limit)->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'uuid' => $project->uuid,
                    'name' => $project->name,
                    'description' => $project->description,
                    'type' => $project->type,
                    'status' => $project->status,
                    'thumbnail' => $project->thumbnail ? asset('storage/' . $project->thumbnail) : null,
                    'updated_at' => $project->updated_at,
                    'created_at' => $project->created_at,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $projects,
            'total' => $projects->count(),
            'query' => $search
        ]);
    }

    public function store(Request $request): RedirectResponse 
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

        // Redirect to void editor using UUID
        return redirect()->route('void.index', ['project' => $project->uuid]);
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

        return redirect()->route('void.index', ['project' => $newProject->uuid]);
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
                    'uuid' => $project->uuid,
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