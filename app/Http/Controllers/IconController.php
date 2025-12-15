<?php
// app/Http/Controllers/IconController.php
namespace App\Http\Controllers;

use App\Models\Icon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class IconController extends Controller
{
    /**
     * Get all icons (system + user-uploaded)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $userId = auth()->id();
            
            $icons = Icon::active()
                ->forUser($userId)
                ->ordered()
                ->get();

            // Group by type (lucide, heroicons, svg)
            $groupedIcons = [
                'lucide' => [],
                'heroicons' => [],
                'svg' => []
            ];

            foreach ($icons as $icon) {
                $type = $icon->type;
                if (!isset($groupedIcons[$type])) {
                    $groupedIcons[$type] = [];
                }
                
                $groupedIcons[$type][] = [
                    'id' => $icon->id,
                    'name' => $icon->name,
                    'type' => $icon->type,
                    'category' => $icon->category,
                    'alphabet_group' => $icon->alphabet_group,
                    'description' => $icon->description,
                    'svg_code' => $icon->svg_code,
                    'library_name' => $icon->library_name,
                    'metadata' => $icon->metadata,
                    'tags' => $icon->tags,
                    'is_system' => $icon->is_system,
                    'created_at' => $icon->created_at?->toISOString()
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $groupedIcons,
                'counts' => [
                    'lucide' => count($groupedIcons['lucide']),
                    'heroicons' => count($groupedIcons['heroicons']),
                    'svg' => count($groupedIcons['svg'])
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in IconController@index:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to load icons: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get icons by type
     */
    public function getByType(Request $request, string $type): JsonResponse
    {
        try {
            $validated = $request->validate([
                'search' => 'nullable|string|max:255',
                'category' => 'nullable|string|max:255'
            ]);

            $userId = auth()->id();
            
            $query = Icon::active()
                ->forUser($userId)
                ->byType($type);

            if (isset($validated['search'])) {
                $query->search($validated['search']);
            }

            if (isset($validated['category'])) {
                $query->byCategory($validated['category']);
            }

            $icons = $query->ordered()->get()->map(function ($icon) {
                return [
                    'id' => $icon->id,
                    'name' => $icon->name,
                    'type' => $icon->type,
                    'category' => $icon->category,
                    'description' => $icon->description,
                    'svg_code' => $icon->svg_code,
                    'library_name' => $icon->library_name,
                    'tags' => $icon->tags,
                    'is_system' => $icon->is_system
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $icons
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load icons: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload custom SVG icon
     */
    public function uploadSvg(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'file' => 'required|file|mimes:svg|max:2048', // 2MB max
                'name' => 'nullable|string|max:255',
                'category' => 'nullable|string|max:255',
                'tags' => 'nullable|array'
            ]);

            $file = $request->file('file');
            $svgContent = file_get_contents($file->getRealPath());
            
            // Validate SVG content
            if (!$this->isValidSvg($svgContent)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid SVG file'
                ], 400);
            }

            // Create icon record
            $icon = Icon::create([
                'user_id' => auth()->id(),
                'name' => $validated['name'] ?? pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                'type' => 'svg',
                'category' => $validated['category'] ?? 'custom',
                'alphabet_group' => strtoupper(substr($validated['name'] ?? 'A', 0, 1)),
                'svg_code' => $svgContent,
                'tags' => $validated['tags'] ?? ['custom'],
                'is_system' => false,
                'is_active' => true
            ]);

            return response()->json([
                'success' => true,
                'icon' => [
                    'id' => $icon->id,
                    'name' => $icon->name,
                    'type' => $icon->type,
                    'category' => $icon->category,
                    'svg_code' => $icon->svg_code,
                    'tags' => $icon->tags
                ],
                'message' => 'SVG icon uploaded successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('SVG upload failed:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload SVG: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create custom SVG icon from drawing/code
     */
    public function createSvg(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'svg_code' => 'required|string',
                'category' => 'nullable|string|max:255',
                'tags' => 'nullable|array'
            ]);

            // Validate SVG content
            if (!$this->isValidSvg($validated['svg_code'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid SVG code'
                ], 400);
            }

            // Create icon record
            $icon = Icon::create([
                'user_id' => auth()->id(),
                'name' => $validated['name'],
                'type' => 'svg',
                'category' => $validated['category'] ?? 'custom',
                'alphabet_group' => strtoupper(substr($validated['name'], 0, 1)),
                'svg_code' => $validated['svg_code'],
                'tags' => $validated['tags'] ?? ['custom', 'drawn'],
                'is_system' => false,
                'is_active' => true
            ]);

            return response()->json([
                'success' => true,
                'icon' => [
                    'id' => $icon->id,
                    'name' => $icon->name,
                    'type' => $icon->type,
                    'category' => $icon->category,
                    'svg_code' => $icon->svg_code,
                    'tags' => $icon->tags
                ],
                'message' => 'SVG icon created successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create SVG: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete custom SVG icon
     */
    public function destroy(Icon $icon): JsonResponse
    {
        try {
            // Only allow deletion of user's own icons (not system icons)
            if ($icon->is_system) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete system icons'
                ], 403);
            }

            if ($icon->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $icon->delete();

            return response()->json([
                'success' => true,
                'message' => 'Icon deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete icon: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search icons
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'query' => 'required|string|max:255',
                'type' => 'nullable|in:lucide,heroicons,svg',
                'category' => 'nullable|string|max:255'
            ]);

            $userId = auth()->id();
            
            $query = Icon::active()
                ->forUser($userId)
                ->search($validated['query']);

            if (isset($validated['type'])) {
                $query->byType($validated['type']);
            }

            if (isset($validated['category'])) {
                $query->byCategory($validated['category']);
            }

            $results = $query->ordered()->get()->map(function ($icon) {
                return [
                    'id' => $icon->id,
                    'name' => $icon->name,
                    'type' => $icon->type,
                    'category' => $icon->category,
                    'description' => $icon->description,
                    'svg_code' => $icon->svg_code,
                    'library_name' => $icon->library_name,
                    'tags' => $icon->tags,
                    'is_system' => $icon->is_system
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $results,
                'count' => $results->count()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search icons: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate SVG content
     */
    private function isValidSvg(string $svgContent): bool
    {
        // Basic SVG validation
        $svgContent = trim($svgContent);
        
        // Must start with <svg
        if (!preg_match('/^<svg/i', $svgContent)) {
            return false;
        }
        
        // Must end with </svg>
        if (!preg_match('/<\/svg>$/i', $svgContent)) {
            return false;
        }
        
        // Check for potentially dangerous content
        $dangerousPatterns = [
            '/<script/i',
            '/javascript:/i',
            '/onerror=/i',
            '/onload=/i',
            '/<iframe/i',
            '/<embed/i',
            '/<object/i'
        ];
        
        foreach ($dangerousPatterns as $pattern) {
            if (preg_match($pattern, $svgContent)) {
                return false;
            }
        }
        
        return true;
    }
}
