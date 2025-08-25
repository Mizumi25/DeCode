<?php
// app/Http/Controllers/ProjectController.php
namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $projects = Auth::user()
            ->projects()
            ->with(['projectComponents'])
            ->recent()
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'description' => $project->description,
                    'type' => $project->type,
                    'status' => $project->status,
                    'thumbnail' => $project->thumbnail,
                    'last_opened_at' => $project->last_opened_at,
                    'component_count' => $project->component_count,
                    'created_at' => $project->created_at,
                    'updated_at' => $project->updated_at,
                ];
            });

        return Inertia::render('Projects/Index', [
            'projects' => $projects
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
            'is_public' => 'boolean',
            'template_id' => 'nullable|integer|exists:projects,id'
        ]);

        // Set defaults
        $validated['user_id'] = Auth::id();
        $validated['settings'] = Project::getDefaultSettings();
        $validated['export_settings'] = Project::getDefaultExportSettings();
        $validated['status'] = 'draft';
        $validated['last_opened_at'] = now();

        // Set viewport defaults if not provided
        $validated['viewport_width'] = $validated['viewport_width'] ?? 1440;
        $validated['viewport_height'] = $validated['viewport_height'] ?? 900;
        $validated['css_framework'] = $validated['css_framework'] ?? 'tailwind';

        $project = Project::create($validated);

        // If created from template, copy components
        if (isset($validated['template_id'])) {
            $template = Project::find($validated['template_id']);
            if ($template && ($template->is_public || $template->user_id === Auth::id())) {
                foreach ($template->projectComponents as $component) {
                    $newComponent = $component->replicate();
                    $newComponent->project_id = $project->id;
                    $newComponent->save();
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => $project->load(['projectComponents']),
            'message' => 'Project created successfully',
            'redirect_url' => route('void.editor', ['project' => $project->id])
        ], 201);
    }

    public function show(Project $project)
    {
        // Check if user can access this project
        if ($project->user_id !== Auth::id() && !$project->is_public) {
            abort(403, 'Access denied to this project.');
        }

        $project->updateLastOpened();

        return Inertia::render('Projects/Show', [
            'project' => $project->load(['projectComponents.component'])
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
            'is_public' => 'sometimes|boolean'
        ]);

        $project->update($validated);

        return response()->json([
            'success' => true,
            'data' => $project,
            'message' => 'Project updated successfully'
        ]);
    }

    public function destroy(Project $project): JsonResponse
    {
        // Check ownership
        if ($project->user_id !== Auth::id()) {
            abort(403, 'Access denied.');
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
            'redirect_url' => route('void.editor', ['project' => $newProject->id])
        ]);
    }

    public function templates(): JsonResponse
    {
        $templates = Project::where('is_public', true)
            ->where('status', 'published')
            ->with(['user:id,name,avatar'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

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
                'data' => ['thumbnail_url' => \Storage::url($path)],
                'message' => 'Thumbnail updated successfully'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No thumbnail file provided'
        ], 400);
    }
}