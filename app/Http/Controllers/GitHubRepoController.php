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
                
                // Filter and enhance repository data - ONLY HTML/React projects
                $filteredRepos = collect($repositories)
                    ->filter(function ($repo) use ($user) {
                        // Only include web frontend projects
                        $language = strtolower($repo['language'] ?? '');
                        $name = strtolower($repo['name'] ?? '');
                        $description = strtolower($repo['description'] ?? '');
                        
                        // Explicitly exclude backend keywords in name/description
                        $backendKeywords = ['api', 'backend', 'server', 'express-api', 'rest-api', 'node-api', 'blog-api'];
                        foreach ($backendKeywords as $keyword) {
                            if (str_contains($name, $keyword) || str_contains($description, $keyword)) {
                                return false;
                            }
                        }
                        
                        // Exclude non-web languages
                        $backendLanguages = ['python', 'java', 'ruby', 'go', 'rust', 'c++', 'c#', 'php'];
                        if (in_array($language, $backendLanguages)) {
                            return false;
                        }
                        
                        // For JavaScript repos, verify they have frontend code
                        if ($language === 'javascript') {
                            // Check if it has React, Vue, or frontend indicators
                            $hasFrontendIndicator = 
                                str_contains($name, 'react') ||
                                str_contains($name, 'vue') ||
                                str_contains($name, 'frontend') ||
                                str_contains($name, 'ui') ||
                                str_contains($name, 'web') ||
                                str_contains($description, 'react') ||
                                str_contains($description, 'vue') ||
                                str_contains($description, 'frontend') ||
                                str_contains($description, 'website') ||
                                str_contains($description, 'web app');
                            
                            // Additional check: Look at package.json for frontend dependencies
                            if (!$hasFrontendIndicator) {
                                $hasFrontendDeps = $this->hasFrontendDependencies($repo['id'], $user);
                                if (!$hasFrontendDeps) {
                                    return false; // Exclude backend-only JS projects
                                }
                            }
                        }
                        
                        // Include HTML projects
                        if ($language === 'html') {
                            return true;
                        }
                        
                        // Include JSX projects
                        if ($language === 'jsx') {
                            return true;
                        }
                        
                        // Include JavaScript projects that passed the frontend check
                        if ($language === 'javascript') {
                            return true;
                        }
                        
                        return false;
                    })
                    ->map(function ($repo) {
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
                    })
                    ->values()
                    ->toArray();
                
                return response()->json([
                    'success' => true,
                    'repositories' => $filteredRepos,
                    'total_filtered' => count($filteredRepos),
                    'message' => count($filteredRepos) > 0 
                        ? "Found " . count($filteredRepos) . " HTML/React repositories"
                        : "No HTML or React repositories found. Only HTML and React projects with CSS or Tailwind are supported."
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
            
            // Detect framework from frontend files
            $detectedFrameworks = $this->detectFrameworks($frontendFiles);
            
            // Check package.json for React if not detected from file extensions
            $hasReact = in_array('React', $detectedFrameworks) || 
                        $this->hasReactInPackageJson($validated['repository_id'], $user);
            
            $framework = $hasReact ? 'react' : 'html';
            $styleFramework = $validated['css_framework'] === 'tailwind' ? 'tailwind' : 'css';
            
            Log::info('Framework detection', [
                'repo_id' => $validated['repository_id'],
                'detected_from_files' => $detectedFrameworks,
                'has_react_in_package' => $this->hasReactInPackageJson($validated['repository_id'], $user),
                'final_framework' => $framework
            ]);
            
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
                'project_type' => 'imported',
                'source_repo_url' => $validated['repository_url'],
                'source_repo_branch' => 'main',
                'framework' => $framework,
                'style_framework' => $styleFramework,
                'last_synced_at' => now(),
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
                    
                    // 🔥 NEW: Fetch actual file content from GitHub
                    $fileContent = $this->fetchFileContent($validated['repository_id'], $fileData['path'], $user);
                    $generatedCode = $this->generateCodeFromGitHubFile($fileContent, $fileData);
                    
                    // Create frame with GitHub file metadata and actual code
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
                            'github_imported' => true,
                            'generated_code' => $generatedCode // Store actual code from GitHub
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
                    
                                        
                      
                      // Import components for each frame and save to database
                      $totalComponentsImported = 0;
                      foreach ($createdFrames as $frame) {
                          try {
                              // Extract components from the frame's canvas_data elements
                              $frameElements = $frame->canvas_data['elements'] ?? [];
                              
                              if (!empty($frameElements)) {
                                  $projectComponents = [];
                                  
                                  foreach ($frameElements as $index => $element) {
                                      // Convert GitHub frame elements to ProjectComponent format
                                      $projectComponent = [
                                          'project_id' => $project->uuid,
                                          'frame_id' => $frame->uuid,
                                          'component_instance_id' => $element['id'] ?? "github_import_" . $frame->id . "_" . $index,
                                          'component_type' => $this->mapElementToComponentType($element),
                                          'props' => $this->extractElementProps($element),
                                          'position' => $element['position'] ?? ['x' => 0, 'y' => 0],
                                          'name' => $element['name'] ?? $element['type'] ?? 'Imported Element',
                                          'z_index' => $element['z_index'] ?? $index,
                                          'variant' => $element['variant'] ?? null,
                                          'style' => $element['style'] ?? [],
                                          'animation' => $element['animation'] ?? []
                                      ];
                                      
                                      $projectComponents[] = $projectComponent;
                                  }
                                  
                                  // Bulk save components to database
                                  if (!empty($projectComponents)) {
                                      foreach ($projectComponents as $componentData) {
                                          \App\Models\ProjectComponent::create($componentData);
                                      }
                                      
                                      $totalComponentsImported += count($projectComponents);
                                      
                                      // Create initial revision snapshot for this frame
                                      \App\Models\Revision::createSnapshot(
                                          $project->uuid,
                                          $frame->uuid,
                                          $user->id,
                                          $projectComponents,
                                          'github_sync',
                                          "GitHub Import: {$frame->name}"
                                      );
                                  }
                              }
                              
                          } catch (\Exception $e) {
                              Log::warning('Failed to import components for frame', [
                                  'frame_id' => $frame->uuid,
                                  'error' => $e->getMessage()
                              ]);
                          }
                      }
                    
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
            $extension = strtolower($file['extension'] ?? '');
            $filename = strtolower($file['filename'] ?? $file['name'] ?? '');
            
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
     * Check if repository has React by examining package.json
     */
    private function hasReactInPackageJson($repoId, $user): bool
    {
        try {
            $headers = $user->getGitHubApiHeaders();
            $response = Http::withHeaders($headers)
                ->timeout(10)
                ->get("https://api.github.com/repositories/{$repoId}/contents/package.json");
            
            if (!$response->successful()) {
                return false;
            }
            
            $packageData = $response->json();
            
            // GitHub returns base64 encoded content
            if (isset($packageData['content'])) {
                $content = base64_decode($packageData['content']);
                $packageJson = json_decode($content, true);
                
                if ($packageJson) {
                    // Check for React in dependencies or devDependencies
                    $deps = array_merge(
                        $packageJson['dependencies'] ?? [],
                        $packageJson['devDependencies'] ?? []
                    );
                    
                    return isset($deps['react']) || 
                           isset($deps['next']) || 
                           isset($deps['gatsby']);
                }
            }
            
            return false;
            
        } catch (\Exception $e) {
            Log::debug('Failed to check package.json for React', [
                'repo_id' => $repoId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
    
    /**
     * Check if repository has frontend dependencies in package.json
     */
    private function hasFrontendDependencies($repoId, $user): bool
    {
        try {
            $headers = $user->getGitHubApiHeaders();
            $response = Http::withHeaders($headers)
                ->timeout(10)
                ->get("https://api.github.com/repositories/{$repoId}/contents/package.json");
            
            if (!$response->successful()) {
                return false;
            }
            
            $packageData = $response->json();
            
            if (isset($packageData['content'])) {
                $content = base64_decode($packageData['content']);
                $packageJson = json_decode($content, true);
                
                if ($packageJson) {
                    $deps = array_merge(
                        $packageJson['dependencies'] ?? [],
                        $packageJson['devDependencies'] ?? []
                    );
                    
                    // Frontend frameworks/libraries
                    $frontendDeps = [
                        'react', 'react-dom', 'vue', 'angular', '@angular/core',
                        'next', 'gatsby', 'nuxt', 'svelte', 'solid-js',
                        'preact', 'lit', 'alpine.js'
                    ];
                    
                    foreach ($frontendDeps as $dep) {
                        if (isset($deps[$dep])) {
                            return true;
                        }
                    }
                    
                    // Backend-only indicators (if found, it's NOT frontend)
                    $backendDeps = [
                        'express', 'koa', 'fastify', 'hapi', '@nestjs/core',
                        'mongoose', 'sequelize', 'typeorm', 'prisma',
                        'socket.io', 'ws', 'cors', 'helmet', 'morgan'
                    ];
                    
                    $backendCount = 0;
                    foreach ($backendDeps as $dep) {
                        if (isset($deps[$dep])) {
                            $backendCount++;
                        }
                    }
                    
                    // If it has multiple backend deps and no frontend, it's backend-only
                    if ($backendCount >= 2) {
                        return false;
                    }
                }
            }
            
            return false;
            
        } catch (\Exception $e) {
            Log::debug('Failed to check package.json for frontend deps', [
                'repo_id' => $repoId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
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
    
    
      /**
   * Map GitHub frame element to component type
   */
  private function mapElementToComponentType($element): string
  {
      $elementType = strtolower($element['type'] ?? 'div');
      
      // Map HTML elements to your component system
      $typeMapping = [
          'button' => 'button',
          'input' => 'input',
          'img' => 'image',
          'h1' => 'heading',
          'h2' => 'heading',
          'h3' => 'heading',
          'h4' => 'heading',
          'h5' => 'heading',
          'h6' => 'heading',
          'p' => 'text',
          'span' => 'text',
          'div' => 'container',
          'section' => 'container',
          'article' => 'card',
          'nav' => 'navigation',
          'form' => 'form',
          'ul' => 'list',
          'ol' => 'list',
          'li' => 'list-item',
          'a' => 'link',
          'video' => 'video',
          'audio' => 'audio',
          'canvas' => 'canvas',
          'svg' => 'icon'
      ];
      
      return $typeMapping[$elementType] ?? 'container';
  }
  
  /**
   * Extract props from GitHub frame element
   */
  private function extractElementProps($element): array
  {
      $props = [];
      
      // Extract common properties
      if (isset($element['text'])) {
          $props['text'] = $element['text'];
      }
      
      if (isset($element['src'])) {
          $props['src'] = $element['src'];
      }
      
      if (isset($element['href'])) {
          $props['href'] = $element['href'];
      }
      
      if (isset($element['alt'])) {
          $props['alt'] = $element['alt'];
      }
      
      if (isset($element['placeholder'])) {
          $props['placeholder'] = $element['placeholder'];
      }
      
      if (isset($element['type']) && $element['type'] === 'input') {
          $props['type'] = $element['inputType'] ?? 'text';
      }
      
      // Extract custom props
      if (isset($element['props'])) {
          $props = array_merge($props, $element['props']);
      }
      
      return $props;
  }
  
  /**
   * Generate components from repository analysis
   */
  private function generateComponentsFromRepo($repoContents, $frameId): array
  {
      $components = [];
      
      // This is a placeholder - you can enhance this based on your analysis
      // For now, create basic components from common patterns
      
      $componentIndex = 0;
      foreach ($repoContents as $file) {
          if ($this->isComponentFile($file)) {
              $component = [
                  'id' => "repo_component_{$frameId}_{$componentIndex}",
                  'type' => $this->inferComponentTypeFromFile($file),
                  'name' => $this->extractComponentName($file),
                  'position' => [
                      'x' => ($componentIndex % 4) * 200 + 50,
                      'y' => floor($componentIndex / 4) * 150 + 50
                  ],
                  'props' => $this->extractPropsFromFile($file),
                  'style' => [],
                  'animation' => []
              ];
              
              $components[] = $component;
              $componentIndex++;
          }
      }
      
      return $components;
  }
  
  /**
   * Check if file represents a component
   */
  private function isComponentFile($file): bool
  {
      $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
      $filename = strtolower($file['name']);
      
      // Check for component file patterns
      return in_array($extension, ['jsx', 'tsx', 'vue']) ||
             str_contains($filename, '.component.') ||
             str_contains($filename, 'component');
  }
  
  /**
   * Infer component type from file
   */
  private function inferComponentTypeFromFile($file): string
  {
      $filename = strtolower($file['name']);
      
      if (str_contains($filename, 'button')) return 'button';
      if (str_contains($filename, 'input')) return 'input';
      if (str_contains($filename, 'card')) return 'card';
      if (str_contains($filename, 'modal')) return 'modal';
      if (str_contains($filename, 'nav')) return 'navigation';
      if (str_contains($filename, 'header')) return 'header';
      if (str_contains($filename, 'footer')) return 'footer';
      
      return 'container';
  }
  
  /**
   * Extract component name from file
   */
  private function extractComponentName($file): string
  {
      $name = pathinfo($file['name'], PATHINFO_FILENAME);
      
      // Convert PascalCase or kebab-case to readable name
      $name = preg_replace('/([A-Z])/', ' $1', $name);
      $name = str_replace(['-', '_'], ' ', $name);
      $name = ucwords(trim($name));
      
      return $name ?: 'Imported Component';
  }
  
  /**
   * Extract props from file (basic implementation)
   */
  private function extractPropsFromFile($file): array
  {
      // This is a basic implementation - you can enhance it to parse actual file content
      return [
          'imported_from' => 'github',
          'original_file' => $file['path'],
          'file_size' => $file['size'] ?? 0
      ];
  }
  
  /**
   * Fetch file content from GitHub
   */
  private function fetchFileContent($repoId, $filePath, $user): ?string
  {
      try {
          $headers = $user->getGitHubApiHeaders();
          $response = Http::withHeaders($headers)
              ->timeout(30)
              ->get("https://api.github.com/repositories/{$repoId}/contents/{$filePath}");
          
          if (!$response->successful()) {
              Log::warning('Failed to fetch file content from GitHub', [
                  'repo_id' => $repoId,
                  'file_path' => $filePath,
                  'status' => $response->status()
              ]);
              return null;
          }
          
          $fileData = $response->json();
          
          // GitHub returns base64 encoded content
          if (isset($fileData['content'])) {
              return base64_decode($fileData['content']);
          }
          
          return null;
          
      } catch (\Exception $e) {
          Log::error('Error fetching file content from GitHub', [
              'repo_id' => $repoId,
              'file_path' => $filePath,
              'error' => $e->getMessage()
          ]);
          return null;
      }
  }
  
  /**
   * Generate code structure from GitHub file content
   */
  private function generateCodeFromGitHubFile(?string $content, array $fileData): array
  {
      if (!$content) {
          return [];
      }
      
      $extension = strtolower($fileData['extension'] ?? '');
      $generatedCode = [];
      
      // Determine the framework and structure based on file type
      if (in_array($extension, ['jsx', 'tsx'])) {
          // React/JSX file
          $generatedCode['react'] = $content;
          $generatedCode['html'] = null;
          
          // Try to extract CSS if there's a CSS-in-JS or style object
          $cssContent = $this->extractCSSFromJSX($content);
          $generatedCode['css'] = $cssContent;
          
      } elseif (in_array($extension, ['html', 'htm'])) {
          // HTML file - extract HTML and any embedded CSS
          $generatedCode['html'] = $content;
          $generatedCode['react'] = null;
          
          // Extract embedded CSS from <style> tags
          $cssContent = $this->extractCSSFromHTML($content);
          $generatedCode['css'] = $cssContent;
          
      } elseif (in_array($extension, ['js', 'ts'])) {
          // JavaScript/TypeScript - treat as potential React component
          $generatedCode['react'] = $content;
          $generatedCode['html'] = null;
          $generatedCode['css'] = $this->extractCSSFromJSX($content);
          
      } elseif ($extension === 'css') {
          // Pure CSS file
          $generatedCode['css'] = $content;
          $generatedCode['html'] = null;
          $generatedCode['react'] = null;
      }
      
      return $generatedCode;
  }
  
  /**
   * Extract CSS from HTML content (from <style> tags)
   */
  private function extractCSSFromHTML(string $html): ?string
  {
      preg_match_all('/<style[^>]*>(.*?)<\/style>/is', $html, $matches);
      
      if (!empty($matches[1])) {
          return implode("\n\n", $matches[1]);
      }
      
      return null;
  }
  
  /**
   * Extract CSS from JSX/JS content (basic implementation)
   */
  private function extractCSSFromJSX(string $jsx): ?string
  {
      // Look for CSS imports
      preg_match_all('/import\s+[\'"]([^\'"]+\.css)[\'"]/i', $jsx, $matches);
      
      if (!empty($matches[1])) {
          // Return a comment indicating CSS files are imported
          return "/* CSS imported from: " . implode(', ', $matches[1]) . " */";
      }
      
      // Look for styled-components or emotion
      if (preg_match('/styled\.|css`|styled`/i', $jsx)) {
          return "/* CSS-in-JS detected (styled-components or similar) */";
      }
      
      return null;
  }
}