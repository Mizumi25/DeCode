<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Project;
use App\Models\Frame;
use App\Models\User;
use App\Services\FrontendAnalysisService;
use Illuminate\Support\Str;

class GitHubRepoController extends Controller
{
    /**
     * Get user's GitHub repositories
     */
    public function getUserRepos(): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->github_id) {
            return response()->json([
                'success' => false,
                'message' => 'GitHub account not connected'
            ], 401);
        }

        try {
            $headers = $user->getGitHubApiHeaders();
            
            $response = Http::withHeaders($headers)->timeout(30)->get("https://api.github.com/user/repos", [
                'sort' => 'updated',
                'per_page' => 100,
                'affiliation' => 'owner,collaborator',
                'visibility' => 'all'
            ]);

            if ($response->successful()) {
                $repositories = $response->json();
                
                // Filter and enhance repository data
                $filteredRepos = collect($repositories)->map(function ($repo) {
                    return [
                        'id' => $repo['id'],
                        'name' => $repo['name'],
                        'full_name' => $repo['full_name'],
                        'description' => $repo['description'],
                        'html_url' => $repo['html_url'],
                        'clone_url' => $repo['clone_url'],
                        'ssh_url' => $repo['ssh_url'],
                        'private' => $repo['private'],
                        'fork' => $repo['fork'],
                        'language' => $repo['language'],
                        'stargazers_count' => $repo['stargazers_count'],
                        'forks_count' => $repo['forks_count'],
                        'size' => $repo['size'],
                        'default_branch' => $repo['default_branch'],
                        'created_at' => $repo['created_at'],
                        'updated_at' => $repo['updated_at'],
                        'pushed_at' => $repo['pushed_at'],
                    ];
                })->toArray();
                
                return response()->json([
                    'success' => true,
                    'repositories' => $filteredRepos
                ]);
            }

            // Handle different error responses
            if ($response->status() === 401) {
                return response()->json([
                    'success' => false,
                    'message' => 'GitHub authentication expired. Please reconnect your account.'
                ], 401);
            }

            if ($response->status() === 403) {
                return response()->json([
                    'success' => false,
                    'message' => 'GitHub API rate limit exceeded. Please try again later.'
                ], 429);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch repositories from GitHub'
            ], 400);
            
        } catch (\Exception $e) {
            Log::error('GitHub API Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error connecting to GitHub API. Please try again later.'
            ], 500);
        }
    }

    /**
     * Check GitHub connection status
     */
    public function checkConnection(): JsonResponse
    {
        $user = Auth::user();
        
        $connected = !empty($user->github_id) && $user->isGitHubTokenValid();
        
        return response()->json([
            'connected' => $connected,
            'github_id' => $user->github_id,
            'github_username' => $user->github_username,
            'avatar' => $user->avatar,
            'name' => $user->name,
            'token_valid' => $user->isGitHubTokenValid()
        ]);
    }

    /**
     * Import project from GitHub repository with automatic frame generation
     */
    public function importProject(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'repository_id' => 'required|integer',
            'repository_name' => 'required|string|max:255',
            'repository_url' => 'required|url',
            'clone_url' => 'required|url',
            'type' => 'required|in:website,landing_page,component_library,dashboard,email_template,prototype',
            'css_framework' => 'required|in:tailwind,vanilla',
            'viewport_width' => 'required|integer|min:320|max:3840',
            'viewport_height' => 'required|integer|min:240|max:2160',
            'is_public' => 'boolean'
        ]);

        try {
            $user = Auth::user();
            
            // Check if user is connected to GitHub
            if (!$user->github_id || !$user->isGitHubTokenValid()) {
                return response()->json([
                    'success' => false,
                    'message' => 'GitHub account not connected or token expired'
                ], 401);
            }
            
            // Get user's current workspace or personal workspace
            $workspace = $user->getCurrentWorkspace();
            if (!$workspace || !$workspace->hasUser($user->id)) {
                $workspace = $user->getPersonalWorkspace() ?? $user->ensurePersonalWorkspace();
            }
            
            // Analyze repository for frontend files BEFORE creating project
            $frontendFiles = $this->analyzeFrontendFiles($validated['repository_id'], $user);
            
            // Create project first
            $project = Project::create([
                'uuid' => Str::uuid(),
                'name' => $validated['name'],
                'description' => $validated['description'],
                'type' => $validated['type'],
                'user_id' => $user->id,
                'workspace_id' => $workspace->id,
                'status' => 'active',
                'viewport_width' => $validated['viewport_width'],
                'viewport_height' => $validated['viewport_height'],
                'css_framework' => $validated['css_framework'],
                'is_public' => $validated['is_public'] ?? false,
                'settings' => array_merge(
                    Project::getDefaultSettings(),
                    [
                        'imported_from_github' => true,
                        'original_repo' => [
                            'id' => $validated['repository_id'],
                            'name' => $validated['repository_name'],
                            'url' => $validated['repository_url'],
                            'clone_url' => $validated['clone_url']
                        ]
                    ]
                ),
                'canvas_data' => ['frames' => []], // Will be populated with actual frames
                'export_settings' => Project::getDefaultExportSettings(),
                'last_opened_at' => now()
            ]);

            // Now create frames from frontend files
            $createdFrames = [];
            $framePosition = ['x' => 200, 'y' => 200]; // Starting position
            
            foreach ($frontendFiles as $index => $fileData) {
                try {
                    // Calculate position in grid layout (4 columns)
                    $column = $index % 4;
                    $row = floor($index / 4);
                    $framePosition = [
                        'x' => 200 + ($column * 380), // 380px spacing between frames
                        'y' => 200 + ($row * 300)     // 300px vertical spacing
                    ];
                    
                    // Create frame with GitHub file metadata
                    $frame = Frame::create([
                        'uuid' => Str::uuid(),
                        'project_id' => $project->id,
                        'name' => $fileData['name'],
                        'type' => $fileData['type'],
                        'canvas_data' => [
                            'template' => 'github_import',
                            'device' => 'desktop',
                            'viewport' => [
                                'width' => $validated['viewport_width'],
                                'height' => $validated['viewport_height']
                            ],
                            'position' => $framePosition,
                            'elements' => FrontendAnalysisService::generateFrameElements($fileData, [
                                'width' => $validated['viewport_width'],
                                'height' => $validated['viewport_height']
                            ]),
                            'github_file' => $fileData, // Store original file metadata
                            'github_imported' => true
                        ],
                        'settings' => array_merge(
                            $this->getDefaultFrameSettings(),
                            [
                                'imported_from_github' => true,
                                'github_file_path' => $fileData['path'],
                                'complexity' => $fileData['estimated_complexity'],
                                'thumbnail_generated' => false
                            ]
                        )
                    ]);
                    
                    // Generate enhanced thumbnail for GitHub imported frames
                    $this->generateGitHubFrameThumbnail($frame, $fileData);
                    
                    $createdFrames[] = $frame;
                    
                    Log::info('GitHub frame created', [
                        'frame_id' => $frame->id,
                        'file_path' => $fileData['path'],
                        'frame_type' => $fileData['type']
                    ]);
                    
                } catch (\Exception $e) {
                    Log::warning('Failed to create frame for GitHub file', [
                        'file_path' => $fileData['path'],
                        'error' => $e->getMessage()
                    ]);
                    // Continue with other files even if one fails
                }
            }
            
            Log::info('GitHub import completed', [
                'project_id' => $project->id,
                'repository' => $validated['repository_name'],
                'files_analyzed' => count($frontendFiles),
                'frames_created' => count($createdFrames)
            ]);
            
            return response()->json([
                'success' => true,
                'message' => "Project imported successfully! Created {$this->countFramesByType($createdFrames)} from {$validated['repository_name']}",
                'project' => [
                    'uuid' => $project->uuid,
                    'name' => $project->name,
                    'description' => $project->description,
                    'type' => $project->type,
                    'created_at' => $project->created_at,
                    'github_repo' => $validated['repository_name']
                ],
                'import_summary' => [
                    'total_files_analyzed' => count($frontendFiles),
                    'frames_created' => count($createdFrames),
                    'frame_breakdown' => [
                        'pages' => count(array_filter($createdFrames, fn($f) => $f->type === 'page')),
                        'components' => count(array_filter($createdFrames, fn($f) => $f->type === 'component'))
                    ]
                ],
                'redirect_url' => route('void.index', $project->uuid)
            ], 201);
            
        } catch (\Exception $e) {
            Log::error('GitHub Import Error: ' . $e->getMessage(), [
                'repository_id' => $validated['repository_id'] ?? null,
                'user_id' => $user->id ?? null
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to import project from GitHub. Please try again.'
            ], 500);
        }
    }
    
    /**
     * Analyze repository for frontend files (preview before import)
     */
    public function analyzeRepository(Request $request, $repoId): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->github_id || !$user->isGitHubTokenValid()) {
            return response()->json([
                'success' => false,
                'message' => 'GitHub account not connected or token expired'
            ], 401);
        }

        try {
            // Analyze repository for frontend files
            $frontendFiles = $this->analyzeFrontendFiles($repoId, $user);
            
            // Generate analysis summary
            $summary = [
                'total_frontend_files' => count($frontendFiles),
                'pages' => count(array_filter($frontendFiles, fn($f) => $f['type'] === 'page')),
                'components' => count(array_filter($frontendFiles, fn($f) => $f['type'] === 'component')),
                'frameworks_detected' => $this->detectFrameworks($frontendFiles),
                'estimated_frames' => count($frontendFiles),
                'complexity_distribution' => [
                    'simple' => count(array_filter($frontendFiles, fn($f) => ($f['estimated_complexity'] ?? 'simple') === 'simple')),
                    'medium' => count(array_filter($frontendFiles, fn($f) => ($f['estimated_complexity'] ?? 'simple') === 'medium')),
                    'high' => count(array_filter($frontendFiles, fn($f) => ($f['estimated_complexity'] ?? 'simple') === 'high'))
                ]
            ];
            
            return response()->json([
                'success' => true,
                'analysis' => [
                    'frontend_files' => array_slice($frontendFiles, 0, 10), // Limit preview to 10 files
                    'summary' => $summary,
                    'preview_frames' => array_slice($frontendFiles, 0, 6) // First 6 for UI preview
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Repository analysis error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to analyze repository: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get repository details by ID
     */
    public function getRepositoryDetails(Request $request, $repoId): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->github_id || !$user->isGitHubTokenValid()) {
            return response()->json([
                'success' => false,
                'message' => 'GitHub account not connected or token expired'
            ], 401);
        }

        try {
            $headers = $user->getGitHubApiHeaders();
            $response = Http::withHeaders($headers)->timeout(30)->get("https://api.github.com/repositories/{$repoId}");

            if ($response->successful()) {
                $repository = $response->json();
                
                // Filter the repository data to return only what we need
                $filteredRepo = [
                    'id' => $repository['id'],
                    'name' => $repository['name'],
                    'full_name' => $repository['full_name'],
                    'description' => $repository['description'],
                    'html_url' => $repository['html_url'],
                    'clone_url' => $repository['clone_url'],
                    'private' => $repository['private'],
                    'fork' => $repository['fork'],
                    'language' => $repository['language'],
                    'stargazers_count' => $repository['stargazers_count'],
                    'forks_count' => $repository['forks_count'],
                    'default_branch' => $repository['default_branch'],
                    'created_at' => $repository['created_at'],
                    'updated_at' => $repository['updated_at'],
                ];
                
                return response()->json([
                    'success' => true,
                    'repository' => $filteredRepo
                ]);
            }

            if ($response->status() === 404) {
                return response()->json([
                    'success' => false,
                    'message' => 'Repository not found or access denied'
                ], 404);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch repository details'
            ], 400);
            
        } catch (\Exception $e) {
            Log::error('GitHub Repository Details Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching repository details'
            ], 500);
        }
    }

    /**
     * Get repository contents (for analyzing files)
     */
    public function getRepositoryContents(Request $request, $repoId, $path = ''): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->github_id || !$user->isGitHubTokenValid()) {
            return response()->json([
                'success' => false,
                'message' => 'GitHub account not connected or token expired'
            ], 401);
        }

        try {
            $headers = $user->getGitHubApiHeaders();
            $response = Http::withHeaders($headers)->timeout(30)->get("https://api.github.com/repositories/{$repoId}/contents/{$path}");

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'contents' => $response->json()
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch repository contents'
            ], 400);
            
        } catch (\Exception $e) {
            Log::error('GitHub Repository Contents Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching repository contents'
            ], 500);
        }
    }

    /**
     * PRIVATE HELPER METHODS
     */

    /**
     * Analyze repository for frontend files
     */
    private function analyzeFrontendFiles($repoId, $user)
    {
        try {
            // Get repository contents recursively
            $repoContents = $this->getRepositoryContentsRecursively($repoId, $user, '');
            
            if (empty($repoContents)) {
                Log::warning('No repository contents found', ['repo_id' => $repoId]);
                return [];
            }

            // Use the FrontendAnalysisService to analyze files
            return FrontendAnalysisService::analyzeFrontendFiles($repoContents);
            
        } catch (\Exception $e) {
            Log::error('Failed to analyze frontend files', [
                'repo_id' => $repoId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Recursively get repository contents
     */
    private function getRepositoryContentsRecursively($repoId, $user, $path = '', $depth = 0, $maxDepth = 3)
    {
        if ($depth > $maxDepth) {
            return [];
        }

        try {
            $headers = $user->getGitHubApiHeaders();
            $response = Http::withHeaders($headers)
                ->timeout(30)
                ->get("https://api.github.com/repositories/{$repoId}/contents/{$path}");

            if (!$response->successful()) {
                return [];
            }

            $contents = $response->json();
            $allFiles = [];

            foreach ($contents as $item) {
                if ($item['type'] === 'file') {
                    $allFiles[] = [
                        'name' => $item['name'],
                        'path' => $item['path'],
                        'type' => 'file',
                        'size' => $item['size'],
                        'download_url' => $item['download_url']
                    ];
                } elseif ($item['type'] === 'dir' && $depth < $maxDepth) {
                    // Skip common directories that don't contain frontend files
                    $skipDirs = ['.git', 'node_modules', 'vendor', '.vscode', '.idea', 'build', 'dist', 'coverage', '.next'];
                    if (!in_array($item['name'], $skipDirs)) {
                        $subFiles = $this->getRepositoryContentsRecursively($repoId, $user, $item['path'], $depth + 1, $maxDepth);
                        $allFiles = array_merge($allFiles, $subFiles);
                    }
                }
            }

            return $allFiles;

        } catch (\Exception $e) {
            Log::warning('Failed to get repository contents', [
                'repo_id' => $repoId,
                'path' => $path,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Count frames by type for summary message
     */
    private function countFramesByType(array $frames): string
    {
        $pages = count(array_filter($frames, fn($f) => $f->type === 'page'));
        $components = count(array_filter($frames, fn($f) => $f->type === 'component'));
        
        $parts = [];
        if ($pages > 0) $parts[] = "{$pages} page" . ($pages > 1 ? 's' : '');
        if ($components > 0) $parts[] = "{$components} component" . ($components > 1 ? 's' : '');
        
        return implode(' and ', $parts);
    }

    /**
     * Get default settings for imported frames
     */
    private function getDefaultFrameSettings(): array
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
     * Detect frameworks from file analysis
     */
    private function detectFrameworks(array $frontendFiles): array
    {
        $frameworks = [];
        
        foreach ($frontendFiles as $file) {
            $extension = strtolower($file['extension']);
            $filename = strtolower($file['filename']);
            
            if (in_array($extension, ['jsx', 'tsx'])) {
                $frameworks['React'] = true;
            } elseif ($extension === 'vue') {
                $frameworks['Vue.js'] = true;
            } elseif (str_contains($filename, '.component.')) {
                $frameworks['Angular'] = true;
            } elseif (str_contains($filename, '.blade.php')) {
                $frameworks['Laravel Blade'] = true;
            } elseif (in_array($extension, ['twig', 'hbs', 'handlebars'])) {
                $frameworks['Template Engine'] = true;
            }
        }
        
        return array_keys($frameworks);
    }

    /**
     * Generate GitHub frame thumbnail (placeholder for now)
     */
    private function generateGitHubFrameThumbnail($frame, $fileData)
    {
        // This is a placeholder - you can implement actual thumbnail generation later
        // For now, we'll just mark that a thumbnail should be generated
        $frame->update([
            'settings' => array_merge($frame->settings, [
                'needs_thumbnail_generation' => true,
                'thumbnail_type' => 'github_import'
            ])
        ]);
    }

    /**
     * Refresh user's repositories (force fetch from GitHub)
     */
    public function refreshRepos(): JsonResponse
    {
        return $this->getUserRepos();
    }
}