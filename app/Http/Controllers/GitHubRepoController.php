<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Project;
use App\Models\User;
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
     * Import project from GitHub repository
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
            
            // Create project with GitHub repository data
            $project = Project::create([
                'uuid' => Str::uuid(),
                'name' => $validated['name'],
                'description' => $validated['description'],
                'type' => $validated['type'],
                'user_id' => $user->id,
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
                'canvas_data' => [
                    'frames' => [
                        [
                            'id' => Str::uuid(),
                            'name' => 'Main',
                            'width' => $validated['viewport_width'],
                            'height' => $validated['viewport_height'],
                            'x' => 0,
                            'y' => 0,
                            'components' => [],
                            'created_at' => now()->toISOString(),
                            'github_imported' => true
                        ]
                    ]
                ],
                'export_settings' => Project::getDefaultExportSettings(),
                'last_opened_at' => now()
            ]);

            // TODO: Future enhancement - Parse repository structure
            // This is where you could add logic to:
            // 1. Clone the repository to a temporary location
            // 2. Parse HTML/CSS/JS files
            // 3. Extract existing components or pages
            // 4. Create multiple frames based on the repository structure
            // 5. Generate thumbnails from existing designs
            
            return response()->json([
                'success' => true,
                'message' => 'Project imported successfully from GitHub',
                'project' => [
                    'uuid' => $project->uuid,
                    'name' => $project->name,
                    'description' => $project->description,
                    'type' => $project->type,
                    'created_at' => $project->created_at,
                    'github_repo' => $validated['repository_name']
                ],
                'redirect_url' => route('void.index', $project->uuid)
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('GitHub Import Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to import project from GitHub. Please try again.'
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
     * Refresh user's repositories (force fetch from GitHub)
     */
    public function refreshRepos(): JsonResponse
    {
        // This is the same as getUserRepos() but could include cache busting logic
        // or additional processing if needed
        return $this->getUserRepos();
    }

    /**
     * Get repository contents (for future use - parsing files)
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
}