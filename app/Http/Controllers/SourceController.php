<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use App\Models\Project;
use App\Models\Frame;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class SourceController extends Controller
{
    /**
     * Load frame data with canvas components from ProjectComponents table
     */
    private function getFrameData(Frame $frame): array
    {
        // Load components from ProjectComponents table
        $projectComponents = \App\Models\ProjectComponent::where('frame_id', $frame->id)
            ->with('component')
            ->ordered()
            ->get()
            ->map(function($comp) {
                return [
                    'id' => $comp->component_instance_id,
                    'type' => $comp->component_type,
                    'props' => $comp->props ?? [],
                    'position' => $comp->position ?? ['x' => 0, 'y' => 0],
                    'name' => $comp->name,
                    'zIndex' => $comp->z_index ?? 0,
                    'variant' => $comp->variant,
                    'style' => $comp->style ?? [],
                    'style_mobile' => $comp->style_mobile ?? null,   // 🔥 RESPONSIVE
                    'style_tablet' => $comp->style_tablet ?? null,   // 🔥 RESPONSIVE
                    'style_desktop' => $comp->style_desktop ?? null, // 🔥 RESPONSIVE
                    'animation' => $comp->animation ?? [],
                    'parentId' => $comp->parent_id,
                    'children' => []
                ];
            })->toArray();
        
        // 🔥 Merge with existing canvas_data to preserve device, viewport, etc.
        $existingCanvasData = $frame->canvas_data ?? [];
        $canvasData = array_merge($existingCanvasData, [
            'components' => $projectComponents,
            'settings' => $frame->settings ?? [],
            'version' => '1.0'
        ]);
        
        if (!isset($canvasData['components']) || !is_array($canvasData['components'])) {
            $canvasData['components'] = [];
        }
    
        return [
            'uuid' => $frame->uuid,
            'id' => $frame->uuid,
            'name' => $frame->name,
            'type' => $frame->type ?? 'desktop',
            'canvas_data' => $canvasData,
            'canvas_style' => $frame->canvas_style ?? [],
            'canvas_props' => $frame->canvas_props ?? [],
            'canvas_animation' => $frame->canvas_animation ?? [],
        ];
    }

    /**
     * Show public source page (for is_public = true projects)
     */
    public function showPublic(Request $request, $projectUuid, $frameUuid): Response
    {
        $project = $request->public_project; // Injected by middleware
        $isPublicView = $request->is_public_view;
        $canEdit = $request->can_edit;
        
        // Find frame by UUID
        $frame = Frame::where('uuid', $frameUuid)
            ->where('project_id', $project->id)
            ->firstOrFail();
        
        // 🔥 Load frame data with components
        $frameData = $this->getFrameData($frame);
        
        return Inertia::render('SourcePage', [
            'project' => $project->load('workspace'),
            'frame' => $frameData, // 🔥 Use frameData instead of frame
            'mode' => 'source',
            'isPublicView' => $isPublicView,
            'canEdit' => $canEdit,
            'userRole' => 'viewer',
        ]);
    }
    
    public function show(Project $project, Frame $frame): Response|RedirectResponse
    {
        $user = Auth::user();
        
        // Check if user is authenticated
        if (!$user) {
            return redirect()->route('login')->with('error', 'Please log in to access this project.');
        }
        
        // Check if frame belongs to project
        if ($frame->project_id !== $project->id) {
            abort(404, 'Frame not found in this project');
        }
        
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
            abort(403, 'Access denied to this project.');
        }
        
        // 🔥 Load frame data with components
        $frameData = $this->getFrameData($frame);
        
        return Inertia::render('SourcePage', [
            'project' => $project->load('workspace'),
            'frame' => $frameData, // 🔥 Use frameData instead of frame
            'mode' => 'source',
            'userRole' => $project->workspace ? $project->workspace->getUserRole($user->id) : 'owner',
            'canEdit' => $project->user_id === $user->id || ($project->workspace && $project->workspace->canUserEdit($user->id)),
        ]);
    }

    /**
     * Get project file structure (boilerplate + current frame only)
     * 🔥 FRAME-SCOPED: Only shows shared boilerplate + the current frame
     */
    public function getProjectFiles(Request $request, Project $project)
    {
        $user = Auth::user();
        
        // Check access
        $hasAccess = false;
        if ($project->user_id === $user->id) {
            $hasAccess = true;
        } elseif ($project->is_public) {
            $hasAccess = true;
        } elseif ($project->workspace) {
            $hasAccess = $project->workspace->hasUser($user->id);
        }
        
        if (!$hasAccess) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        // 🔥 NEW: Get current frame from request
        $currentFrameId = $request->input('frame_id');
        $currentFrame = null;
        
        if ($currentFrameId) {
            $currentFrame = Frame::where('uuid', $currentFrameId)
                ->where('project_id', $project->id)
                ->first();
        }

        // Determine framework
        $framework = $project->output_format ?? 'react';
        $projectType = $project->project_type ?? 'manual';
        
        // Get template path
        $templatePath = storage_path("app/templates/{$framework}");
        
        // Build file tree - SHARED BOILERPLATE ONLY
        $fileTree = [];
        
        // Add boilerplate files (shared across all frames)
        if (file_exists($templatePath)) {
            $boilerplateFiles = $this->scanDirectory($templatePath, $templatePath);
            
            // 🔥 Filter out the frames directory from boilerplate
            $fileTree = array_filter($boilerplateFiles, function($item) use ($framework) {
                // Exclude frames folder from shared boilerplate
                if ($item['type'] === 'directory') {
                    if ($framework === 'react') {
                        return $item['name'] !== 'frames';
                    } else {
                        return $item['name'] !== 'frames';
                    }
                }
                return true;
            });
            
            $fileTree = array_values($fileTree); // Re-index
        }
        
        // 🔥 NEW: Add ONLY the current frame file (if frame context exists)
        if ($currentFrame) {
            $fileName = \Illuminate\Support\Str::slug($currentFrame->name, '_');
            $extension = $framework === 'react' ? 'jsx' : 'html';
            $filePath = $framework === 'react' 
                ? "src/frames/{$fileName}.{$extension}"
                : "frames/{$fileName}.{$extension}";
            
            // Generate the frame content
            $content = $this->generateFrameContent($currentFrame, $framework);
            
            $fileTree[] = [
                'name' => "{$fileName}.{$extension}",
                'path' => $filePath,
                'type' => 'file',
                'content' => $content,
                'isFrame' => true,
                'frameId' => $currentFrame->uuid,
                'frameName' => $currentFrame->name,
                'size' => strlen($content),
                'category' => 'current-frame' // 🔥 Mark as current frame
            ];
        }
        
        return response()->json([
            'success' => true,
            'framework' => $framework,
            'projectType' => $projectType,
            'currentFrame' => $currentFrame ? [
                'id' => $currentFrame->uuid,
                'name' => $currentFrame->name
            ] : null,
            'files' => $fileTree
        ]);
    }

    /**
     * Get ALL project files for VoidPage (read-only overview)
     * Shows complete project structure including all frames
     */
    public function getAllProjectFiles(Request $request, Project $project)
    {
        $user = Auth::user();
        
        // Check access
        $hasAccess = false;
        if ($project->user_id === $user->id) {
            $hasAccess = true;
        } elseif ($project->is_public) {
            $hasAccess = true;
        } elseif ($project->workspace) {
            $hasAccess = $project->workspace->hasUser($user->id);
        }
        
        if (!$hasAccess) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        // Determine framework
        $framework = $project->output_format ?? 'react';
        $projectType = $project->project_type ?? 'manual';
        
        // Get template path
        $templatePath = storage_path("app/templates/{$framework}");
        
        // Build complete file tree
        $fileTree = [];
        
        // Add boilerplate files (complete structure)
        if (file_exists($templatePath)) {
            $fileTree = $this->scanDirectory($templatePath, $templatePath);
        }
        
        // Add ALL frame files
        $frames = Frame::where('project_id', $project->id)->get();
        
        // Create frames directory structure
        $framesDir = [
            'name' => 'frames',
            'path' => $framework === 'react' ? 'src/frames' : 'frames',
            'type' => 'directory',
            'children' => []
        ];
        
        foreach ($frames as $frame) {
            $fileName = \Illuminate\Support\Str::slug($frame->name, '_');
            $extension = $framework === 'react' ? 'jsx' : 'html';
            $filePath = $framework === 'react' 
                ? "src/frames/{$fileName}.{$extension}"
                : "frames/{$fileName}.{$extension}";
            
            // Generate the frame content
            $content = $this->generateFrameContent($frame, $framework);
            
            $framesDir['children'][] = [
                'name' => "{$fileName}.{$extension}",
                'path' => $filePath,
                'type' => 'file',
                'content' => $content,
                'isFrame' => true,
                'frameId' => $frame->uuid,
                'frameName' => $frame->name,
                'size' => strlen($content)
            ];
        }
        
        // Add frames directory to tree (if we have frames)
        if (count($framesDir['children']) > 0) {
            // Find where to insert frames folder
            if ($framework === 'react') {
                // Insert into src/ folder
                foreach ($fileTree as &$item) {
                    if ($item['type'] === 'directory' && $item['name'] === 'src') {
                        $item['children'][] = $framesDir;
                        break;
                    }
                }
            } else {
                // Add at root level for HTML projects
                $fileTree[] = $framesDir;
            }
        }
        
        return response()->json([
            'success' => true,
            'framework' => $framework,
            'projectType' => $projectType,
            'totalFrames' => $frames->count(),
            'files' => $fileTree
        ]);
    }

    /**
     * Scan directory recursively
     */
    private function scanDirectory(string $path, string $basePath): array
    {
        $items = [];
        
        if (!is_dir($path)) {
            return $items;
        }
        
        $entries = scandir($path);
        
        foreach ($entries as $entry) {
            if ($entry === '.' || $entry === '..') {
                continue;
            }
            
            $fullPath = $path . '/' . $entry;
            $relativePath = str_replace($basePath . '/', '', $fullPath);
            
            if (is_dir($fullPath)) {
                $items[] = [
                    'name' => $entry,
                    'path' => $relativePath,
                    'type' => 'directory',
                    'children' => $this->scanDirectory($fullPath, $basePath)
                ];
            } else {
                $content = file_get_contents($fullPath);
                $items[] = [
                    'name' => $entry,
                    'path' => $relativePath,
                    'type' => 'file',
                    'content' => $content,
                    'size' => filesize($fullPath),
                    'extension' => pathinfo($entry, PATHINFO_EXTENSION)
                ];
            }
        }
        
        return $items;
    }

    /**
     * Generate frame content
     */
    private function generateFrameContent(Frame $frame, string $framework): string
    {
        // Check for pre-generated code first
        $canvasData = $frame->canvas_data ?? [];
        $generatedCode = $canvasData['generated_code'] ?? null;
        
        if ($framework === 'react') {
            if ($generatedCode && isset($generatedCode['react']) && !empty($generatedCode['react'])) {
                return $generatedCode['react'];
            }
            
            // Fallback: generate from components
            $componentName = \Illuminate\Support\Str::studly($frame->name);
            $components = \App\Models\ProjectComponent::where('frame_id', $frame->id)->get();
            
            $content = "import React from 'react'\n\n";
            $content .= "function {$componentName}() {\n";
            $content .= "  return (\n";
            $content .= "    <div className=\"frame-container\">\n";
            
            foreach ($components as $component) {
                $type = $component->component_type ?? 'div';
                $props = $component->props ?? [];
                $text = $props['text'] ?? $props['content'] ?? '';
                
                if ($text) {
                    $content .= "      <{$type}>{$text}</{$type}>\n";
                } else {
                    $content .= "      <{$type} />\n";
                }
            }
            
            $content .= "    </div>\n";
            $content .= "  )\n";
            $content .= "}\n\n";
            $content .= "export default {$componentName}\n";
            
            return $content;
        } else {
            // HTML
            if ($generatedCode && isset($generatedCode['html']) && !empty($generatedCode['html'])) {
                return $generatedCode['html'];
            }
            
            // Fallback: generate from components
            $components = \App\Models\ProjectComponent::where('frame_id', $frame->id)->get();
            
            $content = "<!DOCTYPE html>\n";
            $content .= "<html lang=\"en\">\n";
            $content .= "<head>\n";
            $content .= "  <meta charset=\"UTF-8\">\n";
            $content .= "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n";
            $content .= "  <title>{$frame->name}</title>\n";
            $content .= "  <link rel=\"stylesheet\" href=\"../styles/global.css\">\n";
            $content .= "</head>\n";
            $content .= "<body>\n";
            $content .= "  <div class=\"frame-container\">\n";
            
            foreach ($components as $component) {
                $type = $component->component_type ?? 'div';
                $props = $component->props ?? [];
                $text = $props['text'] ?? $props['content'] ?? '';
                
                if ($text) {
                    $content .= "    <{$type}>{$text}</{$type}>\n";
                } else {
                    $content .= "    <{$type}></{$type}>\n";
                }
            }
            
            $content .= "  </div>\n";
            $content .= "</body>\n";
            $content .= "</html>\n";
            
            return $content;
        }
    }
}