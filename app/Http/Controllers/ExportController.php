<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Frame;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use ZipArchive;

class ExportController extends Controller
{
    /**
     * Preview export code (for preview modal)
     */
    public function previewExport(Request $request, Project $project): JsonResponse
    {
        try {
            $user = auth()->user();
            
            // Check permissions
            if ($project->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Get export options from request
            $framework = $request->input('framework', $project->output_format ?? 'html');
            $styleFramework = $request->input('style_framework', $project->style_framework ?? 'css');
            
            // Get frames
            $frames = Frame::where('project_id', $project->id)->get();
            
            $previewFrames = [];
            
            foreach ($frames as $frame) {
                // 🔥 NEW: Check for pre-generated code first
                $canvasData = $frame->canvas_data ?? [];
                $generatedCode = $canvasData['generated_code'] ?? null;
                
                $framePreview = [
                    'name' => $frame->name,
                    'html' => null,
                    'jsx' => null,
                    'css' => null,
                ];
                
                // 🔥 NEW: Use pre-generated code if available
                if ($generatedCode && !empty($generatedCode)) {
                    \Log::info('Preview using pre-generated code', [
                        'frame_id' => $frame->uuid,
                        'frame_name' => $frame->name,
                        'has_react' => isset($generatedCode['react']),
                        'has_html' => isset($generatedCode['html']),
                        'has_css' => isset($generatedCode['css'])
                    ]);
                    
                    if ($framework === 'html') {
                        $framePreview['html'] = $generatedCode['html'] ?? null;
                        $framePreview['css'] = $generatedCode['css'] ?? null;
                    } else {
                        $framePreview['jsx'] = $generatedCode['react'] ?? null;
                        $framePreview['css'] = $generatedCode['css'] ?? null;
                    }
                    
                    $previewFrames[] = $framePreview;
                    continue; // Skip component-based generation
                }
                
                // 🔥 FALLBACK: Generate from components if no pre-generated code
                \Log::info('Preview generating from components (no saved code)', [
                    'frame_id' => $frame->uuid,
                    'frame_name' => $frame->name
                ]);
                
                // Read components from ProjectComponent table (use frame numeric ID, not UUID)
                $components = \App\Models\ProjectComponent::where('frame_id', $frame->id)->get();
                
                if ($framework === 'html') {
                    // Generate HTML
                    $html = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n";
                    $html .= "  <meta charset=\"UTF-8\">\n";
                    $html .= "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n";
                    $html .= "  <title>{$frame->name}</title>\n";
                    
                    if ($styleFramework === 'css') {
                        $html .= "  <link rel=\"stylesheet\" href=\"../styles/global.css\">\n";
                    } else {
                        $html .= "  <script src=\"https://cdn.tailwindcss.com\"></script>\n";
                    }
                    
                    $html .= "</head>\n<body>\n";
                    $html .= "  <div class=\"frame-container\">\n";
                    
                    foreach ($components as $component) {
                        $html .= "    " . $this->componentToHTML($component, $styleFramework, 2) . "\n";
                    }
                    
                    $html .= "  </div>\n</body>\n</html>";
                    
                    $framePreview['html'] = $html;
                    
                    // Generate CSS if needed
                    if ($styleFramework === 'css') {
                        $css = "/* Styles for {$frame->name} */\n\n";
                        foreach ($components as $component) {
                            $className = $this->generateComponentClassName($component);
                            $css .= ".{$className} {\n";
                            $style = $component->style ?? [];
                            foreach ($style as $property => $value) {
                                $cssProperty = $this->convertCamelToKebab($property);
                                $css .= "  {$cssProperty}: {$value};\n";
                            }
                            $css .= "}\n\n";
                        }
                        $framePreview['css'] = $css;
                    }
                    
                } else {
                    // Generate React JSX
                    $jsx = "import React from 'react'\n\n";
                    $jsx .= "const " . Str::studly($frame->name) . " = () => {\n";
                    $jsx .= "  return (\n";
                    $jsx .= "    <div className=\"frame-container\">\n";
                    
                    foreach ($components as $component) {
                        $jsx .= "      " . $this->componentToReact($component, $styleFramework, 3) . "\n";
                    }
                    
                    $jsx .= "    </div>\n";
                    $jsx .= "  )\n";
                    $jsx .= "}\n\n";
                    $jsx .= "export default " . Str::studly($frame->name);
                    
                    $framePreview['jsx'] = $jsx;
                    
                    // Generate CSS for React if needed
                    if ($styleFramework === 'css') {
                        $css = "/* Styles for {$frame->name} */\n\n";
                        foreach ($components as $component) {
                            $className = $this->generateComponentClassName($component);
                            $css .= ".{$className} {\n";
                            $style = $component->style ?? [];
                            foreach ($style as $property => $value) {
                                $cssProperty = $this->convertCamelToKebab($property);
                                $css .= "  {$cssProperty}: {$value};\n";
                            }
                            $css .= "}\n\n";
                        }
                        $framePreview['css'] = $css;
                    }
                }
                
                $previewFrames[] = $framePreview;
            }

            return response()->json([
                'success' => true,
                'preview' => [
                    'frames' => $previewFrames,
                    'framework' => $framework,
                    'style_framework' => $styleFramework,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Preview generation failed', [
                'project_id' => $project->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate preview: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Convert component to React JSX
     */
    private function componentToReact($component, string $styleFramework, int $indent = 0): string
    {
        $spaces = str_repeat(' ', $indent);
        $type = $this->mapComponentTypeToHTML($component->component_type);
        $props = $component->props ?? [];
        
        $attributes = [];
        if ($styleFramework === 'tailwind') {
            $attributes[] = 'className="' . $this->generateTailwindClasses($component) . '"';
        } else {
            $className = $this->generateComponentClassName($component);
            $attributes[] = 'className="' . $className . '"';
        }

        $attrString = implode(' ', $attributes);
        $text = $props['text'] ?? '';

        if ($text) {
            return "{$spaces}<{$type} {$attrString}>{$text}</{$type}>";
        } else {
            return "{$spaces}<{$type} {$attrString}></{$type}>";
        }
    }

    /**
     * Export project as ZIP (with framework selection)
     */
    public function exportAsZip(Request $request, Project $project): mixed
    {
        try {
            $user = auth()->user();
            
            // Check permissions
            if ($project->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Get export options from request
            $framework = $request->input('framework', $project->output_format ?? 'html');
            $styleFramework = $request->input('style_framework', $project->style_framework ?? 'css');
            $includeNavigation = $request->input('include_navigation', true);

            // Store export preferences temporarily
            $exportOptions = [
                'framework' => $framework,
                'style_framework' => $styleFramework,
                'include_navigation' => $includeNavigation,
            ];

            // Generate project structure with export options
            $projectPath = $this->generateProjectStructure($project, $exportOptions);
            
            // Create ZIP file
            $exportsDir = storage_path("app/exports");
            if (!file_exists($exportsDir)) {
                mkdir($exportsDir, 0755, true);
            }
            $zipPath = storage_path("app/exports/{$project->uuid}.zip");
            $this->createZipFromDirectory($projectPath, $zipPath);
            
            // Clean up temporary files
            Storage::deleteDirectory("temp/export_{$project->uuid}");
            
            return response()->download($zipPath, "{$project->name}.zip")->deleteFileAfterSend(true);
            
        } catch (\Exception $e) {
            Log::error('Export ZIP failed', [
                'project_id' => $project->uuid,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to export project: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate or retrieve SSH key for project
     */
    private function ensureSSHKey(Project $project): array
    {
        // Check if project already has SSH key
        if ($project->ssh_public_key && $project->ssh_private_key) {
            return [
                'public_key' => $project->ssh_public_key,
                'private_key' => $project->ssh_private_key,
                'is_new' => false
            ];
        }

        // Generate new SSH key pair
        $keyPath = storage_path("app/ssh_keys/{$project->uuid}");
        if (!file_exists(dirname($keyPath))) {
            mkdir(dirname($keyPath), 0700, true);
        }

        // Generate SSH key using ssh-keygen
        $email = "deploy-{$project->uuid}@decode.app";
        $command = "ssh-keygen -t ed25519 -C \"{$email}\" -f {$keyPath} -N '' 2>&1";
        exec($command, $output, $returnVar);

        if ($returnVar !== 0) {
            throw new \Exception('Failed to generate SSH key: ' . implode("\n", $output));
        }

        // Read the keys
        $privateKey = file_get_contents($keyPath);
        $publicKey = file_get_contents("{$keyPath}.pub");

        // Save to database
        $project->ssh_public_key = $publicKey;
        $project->ssh_private_key = $privateKey;
        $project->ssh_key_generated_at = now();
        $project->save();

        // Clean up temp files
        unlink($keyPath);
        unlink("{$keyPath}.pub");

        return [
            'public_key' => $publicKey,
            'private_key' => $privateKey,
            'is_new' => true
        ];
    }

    /**
     * Automated GitHub deployment with SSH
     */
    public function generateGitHubSSHCommands(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'framework' => 'nullable|string|in:html,react',
            'style_framework' => 'nullable|string|in:css,tailwind',
            'include_navigation' => 'nullable|boolean',
            'repo_url' => 'required|string',
        ]);

        try {
            $user = auth()->user();
            
            // Check permissions
            if ($project->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $repoUrl = $validated['repo_url'];
            
            // Extract owner and repo name from URL
            preg_match('/github\.com[\/:]([^\/]+)\/([^\/\.]+)/', $repoUrl, $matches);
            
            if (count($matches) < 3) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid GitHub repository URL format'
                ], 400);
            }
            
            $owner = $matches[1];
            $repo = $matches[2];
            $sshUrl = "git@github.com:{$owner}/{$repo}.git";
            
            // Generate or get SSH key
            $sshKey = $this->ensureSSHKey($project);
            
            // If it's a new key, return instructions first
            if ($sshKey['is_new']) {
                return response()->json([
                    'success' => true,
                    'needs_setup' => true,
                    'ssh_public_key' => $sshKey['public_key'],
                    'ssh_url' => $sshUrl,
                    'message' => 'SSH key generated! Please add it to your GitHub repository.'
                ]);
            }
            
            // Key already exists, proceed with automated deployment
            $exportOptions = [
                'framework' => $validated['framework'] ?? $project->output_format ?? 'html',
                'style_framework' => $validated['style_framework'] ?? $project->style_framework ?? 'css',
                'include_navigation' => $validated['include_navigation'] ?? true,
            ];

            // Generate project files
            $projectPath = $this->generateProjectStructure($project, $exportOptions);
            
            // Create temporary SSH key file for this deployment
            $tempKeyPath = storage_path("app/temp/ssh_key_{$project->uuid}");
            file_put_contents($tempKeyPath, $sshKey['private_key']);
            chmod($tempKeyPath, 0600);
            
            try {
                // Verify project path exists
                if (!file_exists($projectPath)) {
                    throw new \Exception("Export directory does not exist: {$projectPath}");
                }
                
                // Clean up any existing git repository first
                if (file_exists("{$projectPath}/.git")) {
                    exec("rm -rf {$projectPath}/.git 2>&1");
                }
                
                // Change to project directory and execute git commands
                $output = [];
                $returnVar = 0;
                
                // Single command with cd && chaining to ensure we stay in directory
                $gitCommands = implode(' && ', [
                    "cd {$projectPath}",
                    "git init --initial-branch=main",
                    "git config user.email 'deploy@decode.app'",
                    "git config user.name 'DeCode Deploy'",
                    "git add .",
                    "git commit -m 'Deploy from DeCode - {$project->name}'",
                    "git remote add origin {$sshUrl}",
                    "GIT_SSH_COMMAND='ssh -i {$tempKeyPath} -o StrictHostKeyChecking=no' git push -u origin main --force",
                ]);
                
                exec($gitCommands . " 2>&1", $output, $returnVar);
                
                if ($returnVar !== 0) {
                    Log::error('Git deployment failed', [
                        'project_path' => $projectPath,
                        'commands' => $gitCommands,
                        'output' => implode("\n", $output),
                        'return_code' => $returnVar
                    ]);
                    throw new \Exception('Git deployment failed: ' . implode("\n", $output));
                }
                
                // Clean up
                unlink($tempKeyPath);
                Storage::deleteDirectory("temp/export_{$project->uuid}");
                
                Log::info('Successfully deployed to GitHub via SSH', [
                    'project' => $project->name,
                    'repo' => $sshUrl
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Successfully deployed to GitHub!',
                    'repo_url' => $repoUrl
                ]);
                
            } catch (\Exception $e) {
                // Clean up on error
                if (file_exists($tempKeyPath)) {
                    unlink($tempKeyPath);
                }
                throw $e;
            }
            
        } catch (\Exception $e) {
            Log::error('Failed to generate SSH commands', [
                'project_id' => $project->uuid,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate SSH commands: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export project to GitHub
     */
    public function exportToGitHub(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'repository_name' => 'nullable|string|max:255',
            'is_private' => 'boolean',
            'create_new_repo' => 'boolean',
            'framework' => 'nullable|string|in:html,react',
            'style_framework' => 'nullable|string|in:css,tailwind',
            'include_navigation' => 'nullable|boolean',
            'repo_url' => 'nullable|string',
        ]);

        try {
            $user = auth()->user();
            
            // Check permissions
            if ($project->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Check GitHub connection
            if (!$user->github_id || !$user->isGitHubTokenValid()) {
                return response()->json([
                    'success' => false,
                    'message' => 'GitHub account not connected'
                ], 401);
            }

            // Get export options from request
            $framework = $validated['framework'] ?? $project->output_format ?? 'html';
            $styleFramework = $validated['style_framework'] ?? $project->style_framework ?? 'css';
            $includeNavigation = $validated['include_navigation'] ?? true;

            $exportOptions = [
                'framework' => $framework,
                'style_framework' => $styleFramework,
                'include_navigation' => $includeNavigation,
            ];

            // Generate project structure with export options
            $projectPath = $this->generateProjectStructure($project, $exportOptions);
            
            // Push to GitHub
            $repoUrl = $this->pushToGitHub($project, $projectPath, $validated, $user);
            
            // Clean up
            Storage::deleteDirectory("temp/export_{$project->uuid}");
            
            return response()->json([
                'success' => true,
                'message' => 'Successfully exported to GitHub',
                'repository_url' => $repoUrl
            ]);
            
        } catch (\Exception $e) {
            Log::error('Export to GitHub failed', [
                'project_id' => $project->uuid,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to export to GitHub: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate complete project structure with all files
     */
    private function generateProjectStructure(Project $project, array $exportOptions = []): string
    {
        // Use export options if provided, otherwise fall back to project settings
        $framework = $exportOptions['framework'] ?? $project->framework ?? 'html';
        $styleFramework = $exportOptions['style_framework'] ?? $project->style_framework ?? 'css';
        $includeNavigation = $exportOptions['include_navigation'] ?? true;
        $projectType = $project->project_type ?? 'manual';
        
        // Create temporary directory for export
        $exportPath = storage_path("app/temp/export_{$project->uuid}");
        if (!file_exists($exportPath)) {
            mkdir($exportPath, 0755, true);
        }

        // Copy boilerplate based on framework
        $templatePath = storage_path("app/templates/{$framework}");
        $this->copyDirectory($templatePath, $exportPath);

        // Create frames directory
        $framesPath = $framework === 'react' 
            ? "{$exportPath}/src/frames"
            : "{$exportPath}/frames";
        
        if (!file_exists($framesPath)) {
            mkdir($framesPath, 0755, true);
        }

        // Generate frames
        $frames = Frame::where('project_id', $project->id)->get();
        foreach ($frames as $frame) {
            $this->generateFrameFile($frame, $framesPath, $framework, $styleFramework);
        }

        // Generate global CSS from settings
        $this->generateGlobalCSS($project, $exportPath, $framework);

        // Handle linked CSS files (for imported projects)
        if ($projectType === 'imported' && !empty($project->preserved_files)) {
            $this->restorePreservedFiles($project, $exportPath);
        }

        // Update main entry point to include frames
        $this->updateMainEntryPoint($project, $exportPath, $framework, $frames, $includeNavigation);

        return $exportPath;
    }

    /**
     * Generate frame file (JSX or HTML)
     */
    private function generateFrameFile(Frame $frame, string $framesPath, string $framework, string $styleFramework): void
    {
        $fileName = Str::slug($frame->name, '_');
        
        if ($framework === 'react') {
            // Generate React component
            $content = $this->generateReactComponent($frame, $styleFramework);
            $filePath = "{$framesPath}/{$fileName}.jsx";
        } else {
            // Generate HTML file
            $content = $this->generateHTMLFile($frame, $styleFramework);
            $filePath = "{$framesPath}/{$fileName}.html";
        }

        file_put_contents($filePath, $content);

        // Generate linked CSS if needed
        if (!empty($frame->linked_css_files) && $styleFramework === 'css') {
            $this->generateLinkedCSS($frame, $framesPath);
        }
    }

    /**
     * Generate React component from frame
     */
    private function generateReactComponent(Frame $frame, string $styleFramework): string
    {
        // 🔥 NEW: Check if frame has pre-generated code
        $canvasData = $frame->canvas_data ?? [];
        $generatedCode = $canvasData['generated_code'] ?? null;
        $metadata = $frame->metadata ?? [];
        $savedCodeStyle = $metadata['code_style'] ?? null;
        
        // Use pre-generated code if available and matches the style
        if ($generatedCode && isset($generatedCode['react']) && !empty($generatedCode['react'])) {
            \Log::info('Using pre-generated React code from frame', [
                'frame_id' => $frame->uuid,
                'frame_name' => $frame->name,
                'saved_style' => $savedCodeStyle,
                'requested_style' => $styleFramework
            ]);
            
            // Return the pre-generated React code
            return $generatedCode['react'];
        }
        
        // Fallback to component-based generation
        \Log::info('Generating React code from components', [
            'frame_id' => $frame->uuid,
            'frame_name' => $frame->name,
            'reason' => 'No pre-generated code available'
        ]);
        
        $componentName = Str::studly($frame->name);
        $imports = ["import React from 'react'"];
        
        if ($styleFramework === 'css' && !empty($frame->linked_css_files)) {
            foreach ($frame->linked_css_files as $cssFile) {
                $imports[] = "import './styles/" . basename($cssFile) . "'";
            }
        }

        // Get frame components from ProjectComponent table (use numeric ID, not UUID)
        $components = \App\Models\ProjectComponent::where('frame_id', $frame->id)->get();
        
        // Generate JSX from components
        $jsx = $this->generateJSXFromComponents($components, $styleFramework);

        $content = implode("\n", $imports) . "\n\n";
        $content .= "function {$componentName}() {\n";
        $content .= "  return (\n";
        $content .= "    {$jsx}\n";
        $content .= "  )\n";
        $content .= "}\n\n";
        $content .= "export default {$componentName}\n";

        return $content;
    }

    /**
     * Generate HTML file from frame
     */
    private function generateHTMLFile(Frame $frame, string $styleFramework): string
    {
        // 🔥 NEW: Check if frame has pre-generated code
        $canvasData = $frame->canvas_data ?? [];
        $generatedCode = $canvasData['generated_code'] ?? null;
        
        // Use pre-generated HTML if available
        if ($generatedCode && isset($generatedCode['html']) && !empty($generatedCode['html'])) {
            \Log::info('Using pre-generated HTML code from frame', [
                'frame_id' => $frame->uuid,
                'frame_name' => $frame->name
            ]);
            
            // Return the pre-generated HTML (it's already a complete document)
            return $generatedCode['html'];
        }
        
        // Fallback to component-based generation
        \Log::info('Generating HTML code from components', [
            'frame_id' => $frame->uuid,
            'frame_name' => $frame->name,
            'reason' => 'No pre-generated code available'
        ]);
        
        // Read from ProjectComponent table (use numeric ID, not UUID)
        $components = \App\Models\ProjectComponent::where('frame_id', $frame->id)->get();
        
        $html = "<!DOCTYPE html>\n";
        $html .= "<html lang=\"en\">\n";
        $html .= "<head>\n";
        $html .= "  <meta charset=\"UTF-8\">\n";
        $html .= "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n";
        $html .= "  <title>{$frame->name}</title>\n";
        $html .= "  <link rel=\"stylesheet\" href=\"../styles/global.css\">\n";
        
        if (!empty($frame->linked_css_files)) {
            foreach ($frame->linked_css_files as $cssFile) {
                $html .= "  <link rel=\"stylesheet\" href=\"styles/" . basename($cssFile) . "\">\n";
            }
        }
        
        $html .= "</head>\n";
        $html .= "<body>\n";
        $html .= $this->generateHTMLFromComponents($components, $styleFramework);
        $html .= "</body>\n";
        $html .= "</html>\n";

        return $html;
    }

    /**
     * Generate JSX from components
     */
    private function generateJSXFromComponents($components, string $styleFramework): string
    {
        if ($components->isEmpty()) {
            return "    <div className=\"frame-container\">\n      <p>Empty frame</p>\n    </div>";
        }

        $jsx = "    <div className=\"frame-container\">\n";
        
        foreach ($components as $component) {
            $jsx .= $this->componentToJSX($component, $styleFramework, 6);
        }
        
        $jsx .= "    </div>";

        return $jsx;
    }

    /**
     * Convert component to JSX
     */
    private function componentToJSX($component, string $styleFramework, int $indent = 0): string
    {
        $spaces = str_repeat(' ', $indent);
        $type = $this->mapComponentTypeToJSX($component->component_type);
        $props = $component->props ?? [];
        
        // Build style/className
        $attributes = [];
        if ($styleFramework === 'tailwind') {
            $attributes[] = 'className="' . $this->generateTailwindClasses($component) . '"';
        } else {
            $attributes[] = 'style={' . json_encode($component->style ?? []) . '}';
        }

        // Get text content from props - check both 'text' and 'content' keys
        $text = $props['text'] ?? $props['content'] ?? null;

        $attrString = implode(' ', $attributes);
        
        if ($text) {
            return "{$spaces}<{$type} {$attrString}>{$text}</{$type}>\n";
        } else {
            return "{$spaces}<{$type} {$attrString} />\n";
        }
    }

    /**
     * Generate HTML from components
     */
    private function generateHTMLFromComponents($components, string $styleFramework): string
    {
        if ($components->isEmpty()) {
            return "  <div class=\"frame-container\">\n    <p>Empty frame</p>\n  </div>\n";
        }

        $html = "  <div class=\"frame-container\">\n";
        
        foreach ($components as $component) {
            $html .= $this->componentToHTML($component, $styleFramework, 4);
        }
        
        $html .= "  </div>\n";

        return $html;
    }

    /**
     * Convert component to HTML
     */
    private function componentToHTML($component, string $styleFramework, int $indent = 0): string
    {
        $spaces = str_repeat(' ', $indent);
        $type = $this->mapComponentTypeToHTML($component->component_type);
        $props = $component->props ?? [];
        
        $attributes = [];
        if ($styleFramework === 'tailwind') {
            $attributes[] = 'class="' . $this->generateTailwindClasses($component) . '"';
        } else {
            // For CSS framework, use generated class name
            $className = $this->generateComponentClassName($component);
            $attributes[] = 'class="' . $className . '"';
        }

        $attrString = implode(' ', $attributes);
        // Get text content from props - check both 'text' and 'content' keys
        $text = $props['text'] ?? $props['content'] ?? '';

        if ($text) {
            return "{$spaces}<{$type} {$attrString}>{$text}</{$type}>\n";
        } else {
            return "{$spaces}<{$type} {$attrString}></{$type}>\n";
        }
    }

    /**
     * Generate global CSS from project settings
     */
    private function generateGlobalCSS(Project $project, string $exportPath, string $framework): void
    {
        $settings = $project->settings ?? [];
        $styleVars = $settings['style_variables'] ?? [];
        $styleFramework = $project->style_framework ?? 'css';

        $cssPath = $framework === 'react'
            ? "{$exportPath}/src/styles/global.css"
            : "{$exportPath}/styles/global.css";

        $css = "/* DeCode Global Styles - Generated from Settings */\n\n";
        
        // Add Tailwind directives for Tailwind projects
        if ($styleFramework === 'tailwind') {
            $css .= "@tailwind base;\n";
            $css .= "@tailwind components;\n";
            $css .= "@tailwind utilities;\n\n";
        }
        
        $css .= ":root {\n";
        
        // Complete default variables from StyleModal
        $defaults = [
            '--color-primary' => '#3b82f6',
            '--color-surface' => '#ffffff',
            '--color-bg' => '#ffffff',
            '--color-text' => '#1f2937',
            '--color-border' => '#e5e7eb',
            '--color-bg-muted' => '#f9fafb',
            '--color-text-muted' => '#6b7280',
            '--font-size-base' => '14px',
            '--font-weight-normal' => '400',
            '--line-height-base' => '1.5',
            '--letter-spacing' => '0',
            '--radius-md' => '6px',
            '--radius-lg' => '8px',
            '--container-width' => '1200px',
            '--shadow-sm' => '0 1px 2px rgba(0,0,0,0.05)',
            '--shadow-md' => '0 4px 6px rgba(0,0,0,0.07)',
            '--shadow-lg' => '0 10px 15px rgba(0,0,0,0.1)',
            '--spacing-xs' => '4px',
            '--spacing-sm' => '8px',
            '--spacing-md' => '16px',
            '--spacing-lg' => '24px',
            '--transition-duration' => '200ms',
            '--transition-easing' => 'cubic-bezier(0.4, 0, 0.2, 1)',
            '--z-modal' => '1000',
        ];

        // Merge saved style variables with defaults
        $allVars = array_merge($defaults, $styleVars);
        foreach ($allVars as $var => $value) {
            $css .= "  {$var}: {$value};\n";
        }

        $css .= "}\n\n";
        $css .= "* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\n";
        $css .= "body {\n  font-family: system-ui, -apple-system, sans-serif;\n  background-color: var(--color-bg);\n  color: var(--color-text);\n}\n\n";
        
        // Add frame container styles
        $css .= ".frame-container {\n  width: 100%;\n  min-height: 100vh;\n  padding: var(--spacing-md);\n}\n\n";
        
        // For HTML+CSS projects, extract component styles to global.css
        if ($project->output_format === 'html' && $project->style_framework === 'css') {
            $frames = Frame::where('project_id', $project->id)->get();
            $css .= $this->generateFrameComponentStyles($frames);
        }

        file_put_contents($cssPath, $css);
    }

    /**
     * Generate CSS classes from frame components (for HTML+CSS projects)
     */
    private function generateFrameComponentStyles($frames): string
    {
        $css = "/* Component Styles */\n";
        $generatedClasses = [];
        
        foreach ($frames as $frame) {
            // 🔥 NEW: Check if frame has pre-generated CSS code
            $canvasData = $frame->canvas_data ?? [];
            $generatedCode = $canvasData['generated_code'] ?? null;
            
            // If frame has pre-generated CSS, use it
            if ($generatedCode && isset($generatedCode['css']) && !empty($generatedCode['css'])) {
                $css .= "\n/* Frame: {$frame->name} - Using pre-generated CSS */\n";
                $css .= $generatedCode['css'] . "\n\n";
                continue;
            }
            
            // Fallback to component-based generation from ProjectComponent table (use numeric ID)
            $components = \App\Models\ProjectComponent::where('frame_id', $frame->id)->get();
            
            foreach ($components as $component) {
                $className = $this->generateComponentClassName($component);
                
                // Avoid duplicate class definitions
                if (in_array($className, $generatedClasses)) {
                    continue;
                }
                
                $generatedClasses[] = $className;
                $css .= ".{$className} {\n";
                
                $style = $component->style ?? [];
                foreach ($style as $property => $value) {
                    $cssProperty = $this->convertCamelToKebab($property);
                    $css .= "  {$cssProperty}: {$value};\n";
                }
                
                $css .= "}\n\n";
            }
        }
        
        return $css;
    }

    /**
     * Generate a unique class name for a component
     */
    private function generateComponentClassName($component): string
    {
        $type = $component->component_type ?? 'component';
        $id = substr($component->uuid ?? uniqid(), 0, 8);
        return "component-{$type}-{$id}";
    }

    /**
     * Convert camelCase to kebab-case
     */
    private function convertCamelToKebab(string $string): string
    {
        return strtolower(preg_replace('/([a-z])([A-Z])/', '$1-$2', $string));
    }

    /**
     * Update main entry point to include frames
     */
    private function updateMainEntryPoint(Project $project, string $exportPath, string $framework, $frames, bool $includeNavigation = true): void
    {
        if ($framework === 'react') {
            $appPath = "{$exportPath}/src/App.jsx";
            $content = "import React from 'react'\n";
            
            foreach ($frames as $frame) {
                $componentName = Str::studly($frame->name);
                $fileName = Str::slug($frame->name, '_');
                $content .= "import {$componentName} from './frames/{$fileName}.jsx'\n";
            }
            
            $content .= "\nfunction App() {\n";
            $content .= "  return (\n";
            $content .= "    <div className=\"app\">\n";
            
            foreach ($frames as $frame) {
                $componentName = Str::studly($frame->name);
                $content .= "      <{$componentName} />\n";
            }
            
            $content .= "    </div>\n";
            $content .= "  )\n";
            $content .= "}\n\n";
            $content .= "export default App\n";
            
            file_put_contents($appPath, $content);
        } else {
            // HTML project - use the navigation setting from export options
            if ($includeNavigation) {
                // Update index.html with frame navigation
                $indexPath = "{$exportPath}/index.html";
                $content = $this->generateIndexHTML($project, $frames);
                file_put_contents($indexPath, $content);
                
                // Update main.js with frame switching logic
                $scriptsPath = "{$exportPath}/scripts";
                if (!file_exists($scriptsPath)) {
                    mkdir($scriptsPath, 0755, true);
                }
                $mainJsPath = "{$scriptsPath}/main.js";
                $jsContent = $this->generateMainJS($frames);
                file_put_contents($mainJsPath, $jsContent);
            } else {
                // No navigation - keep default welcome page
                // index.html already exists from template, just leave it as is
                // Users can manually open frames/frame_name.html
            }
        }
    }

    /**
     * Generate index.html with frame navigation
     */
    private function generateIndexHTML(Project $project, $frames): string
    {
        $html = "<!DOCTYPE html>\n";
        $html .= "<html lang=\"en\">\n";
        $html .= "<head>\n";
        $html .= "    <meta charset=\"UTF-8\">\n";
        $html .= "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n";
        $html .= "    <title>{$project->name}</title>\n";
        $html .= "    <link rel=\"stylesheet\" href=\"styles/global.css\">\n";
        $html .= "    <style>\n";
        $html .= "        .navigation {\n";
        $html .= "            position: fixed;\n";
        $html .= "            top: 0;\n";
        $html .= "            left: 0;\n";
        $html .= "            right: 0;\n";
        $html .= "            background: var(--color-surface);\n";
        $html .= "            border-bottom: 1px solid var(--color-border);\n";
        $html .= "            padding: var(--spacing-md);\n";
        $html .= "            display: flex;\n";
        $html .= "            gap: var(--spacing-sm);\n";
        $html .= "            z-index: 1000;\n";
        $html .= "        }\n";
        $html .= "        .nav-button {\n";
        $html .= "            padding: var(--spacing-sm) var(--spacing-md);\n";
        $html .= "            background: var(--color-bg-muted);\n";
        $html .= "            border: 1px solid var(--color-border);\n";
        $html .= "            border-radius: var(--radius-md);\n";
        $html .= "            cursor: pointer;\n";
        $html .= "            transition: all var(--transition-duration) var(--transition-easing);\n";
        $html .= "        }\n";
        $html .= "        .nav-button:hover {\n";
        $html .= "            background: var(--color-primary);\n";
        $html .= "            color: white;\n";
        $html .= "        }\n";
        $html .= "        .nav-button.active {\n";
        $html .= "            background: var(--color-primary);\n";
        $html .= "            color: white;\n";
        $html .= "        }\n";
        $html .= "        .frame-viewer {\n";
        $html .= "            margin-top: 80px;\n";
        $html .= "            width: 100%;\n";
        $html .= "            height: calc(100vh - 80px);\n";
        $html .= "            border: none;\n";
        $html .= "        }\n";
        $html .= "    </style>\n";
        $html .= "</head>\n";
        $html .= "<body>\n";
        $html .= "    <div class=\"navigation\">\n";
        
        foreach ($frames as $index => $frame) {
            $fileName = Str::slug($frame->name, '_');
            $active = $index === 0 ? ' active' : '';
            $html .= "        <button class=\"nav-button{$active}\" data-frame=\"frames/{$fileName}.html\">{$frame->name}</button>\n";
        }
        
        $html .= "    </div>\n";
        $html .= "    <iframe id=\"frame-viewer\" class=\"frame-viewer\" src=\"";
        
        if ($frames->isNotEmpty()) {
            $firstFrame = $frames->first();
            $fileName = Str::slug($firstFrame->name, '_');
            $html .= "frames/{$fileName}.html";
        }
        
        $html .= "\"></iframe>\n";
        $html .= "    <script src=\"scripts/main.js\"></script>\n";
        $html .= "</body>\n";
        $html .= "</html>\n";
        
        return $html;
    }

    /**
     * Generate main.js with frame switching logic
     */
    private function generateMainJS($frames): string
    {
        $js = "// DeCode Project - Frame Navigation\n\n";
        $js .= "document.addEventListener('DOMContentLoaded', function() {\n";
        $js .= "    const frameViewer = document.getElementById('frame-viewer');\n";
        $js .= "    const navButtons = document.querySelectorAll('.nav-button');\n\n";
        $js .= "    navButtons.forEach(button => {\n";
        $js .= "        button.addEventListener('click', function() {\n";
        $js .= "            // Remove active class from all buttons\n";
        $js .= "            navButtons.forEach(btn => btn.classList.remove('active'));\n";
        $js .= "            \n";
        $js .= "            // Add active class to clicked button\n";
        $js .= "            this.classList.add('active');\n";
        $js .= "            \n";
        $js .= "            // Load the frame\n";
        $js .= "            const frameSrc = this.getAttribute('data-frame');\n";
        $js .= "            frameViewer.src = frameSrc;\n";
        $js .= "        });\n";
        $js .= "    });\n";
        $js .= "});\n";
        
        return $js;
    }

    /**
     * Utility: Copy directory recursively
     */
    private function copyDirectory(string $src, string $dest): void
    {
        if (!is_dir($src)) {
            return;
        }

        if (!is_dir($dest)) {
            mkdir($dest, 0755, true);
        }

        $files = scandir($src);
        foreach ($files as $file) {
            if ($file !== '.' && $file !== '..') {
                $srcPath = "{$src}/{$file}";
                $destPath = "{$dest}/{$file}";
                
                if (is_dir($srcPath)) {
                    $this->copyDirectory($srcPath, $destPath);
                } else {
                    copy($srcPath, $destPath);
                }
            }
        }
    }

    /**
     * Create ZIP from directory
     */
    private function createZipFromDirectory(string $source, string $destination): bool
    {
        if (!extension_loaded('zip')) {
            throw new \Exception('ZIP extension not loaded');
        }

        $zip = new ZipArchive();
        if (!$zip->open($destination, ZipArchive::CREATE | ZipArchive::OVERWRITE)) {
            return false;
        }

        $source = realpath($source);
        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($source),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ($files as $file) {
            if (!$file->isDir()) {
                $filePath = $file->getRealPath();
                $relativePath = substr($filePath, strlen($source) + 1);
                $zip->addFile($filePath, $relativePath);
            }
        }

        return $zip->close();
    }

    /**
     * Helper methods for mapping
     */
    private function mapComponentTypeToJSX(string $type): string
    {
        $map = [
            'button' => 'button',
            'text' => 'p',
            'heading' => 'h2',
            'input' => 'input',
            'image' => 'img',
            'container' => 'div',
        ];
        return $map[$type] ?? 'div';
    }

    private function mapComponentTypeToHTML(string $type): string
    {
        return $this->mapComponentTypeToJSX($type);
    }

    private function generateTailwindClasses($component): string
    {
        // Simplified - you can enhance this
        return 'component';
    }

    private function generateInlineStyle(array $style): string
    {
        $parts = [];
        foreach ($style as $key => $value) {
            $cssKey = str_replace('_', '-', $key);
            $parts[] = "{$cssKey}: {$value}";
        }
        return implode('; ', $parts);
    }

    private function generateLinkedCSS($frame, $framesPath): void
    {
        // Placeholder for linked CSS generation
    }

    private function restorePreservedFiles($project, $exportPath): void
    {
        // Placeholder for restoring preserved files from imported projects
    }

    private function pushToGitHub($project, $projectPath, $validated, $user): string
    {
        $repoUrl = $validated['repo_url'] ?? $project->github_repo_url;
        
        if (!$repoUrl) {
            throw new \Exception('No GitHub repository URL provided');
        }
        
        // Extract owner and repo name from URL
        // Example: https://github.com/username/repo or git@github.com:username/repo.git
        preg_match('/github\.com[\/:]([^\/]+)\/([^\/\.]+)/', $repoUrl, $matches);
        
        if (count($matches) < 3) {
            throw new \Exception('Invalid GitHub repository URL format');
        }
        
        $owner = $matches[1];
        $repo = $matches[2];
        
        // Initialize git in the project directory
        $commands = [
            "cd {$projectPath}",
            "git init",
            "git add .",
            "git commit -m 'Export from DeCode - {$project->name}'",
        ];
        
        // Set up remote with authentication token
        if ($user->github_token) {
            $authenticatedUrl = "https://{$user->github_token}@github.com/{$owner}/{$repo}.git";
            $commands[] = "git remote add origin {$authenticatedUrl}";
        } else {
            $commands[] = "git remote add origin {$repoUrl}";
        }
        
        // Push to GitHub
        $commands[] = "git branch -M main";
        $commands[] = "git push -u origin main --force"; // Force push to overwrite
        
        // Execute commands
        $output = [];
        $returnVar = 0;
        
        foreach ($commands as $command) {
            exec($command . " 2>&1", $output, $returnVar);
            
            if ($returnVar !== 0) {
                Log::error('GitHub push command failed', [
                    'command' => $command,
                    'output' => implode("\n", $output),
                    'return_code' => $returnVar
                ]);
                throw new \Exception('Failed to push to GitHub: ' . implode("\n", $output));
            }
        }
        
        Log::info('Successfully pushed to GitHub', [
            'repo' => $repoUrl,
            'project' => $project->name
        ]);
        
        return $repoUrl;
    }
}
