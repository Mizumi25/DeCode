<?php
// app/Http/Controllers/ComponentController.php
namespace App\Http\Controllers;

use App\Models\Component;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ComponentController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $components = Component::active()
                ->ordered()
                ->get();

            // Debug: Log the raw components
            Log::info('Raw components from database:', ['count' => $components->count()]);
            
            if ($components->isEmpty()) {
                Log::warning('No components found in database');
                return response()->json([
                    'success' => true,
                    'data' => [
                        'elements' => [],
                        'components' => []
                    ],
                    'debug' => 'No components found in database'
                ]);
            }

            // Group by component_type first, then by alphabet_group
            $groupedComponents = $components->groupBy(function ($component) {
                $componentType = $component->component_type ?? 'element';
                $alphabetGroup = $component->alphabet_group ?? strtoupper(substr($component->name ?? 'A', 0, 1));
                return $componentType . '_' . $alphabetGroup;
            })->map(function ($group) {
                return $group->sortBy('sort_order')->values()->map(function ($component) {
                    // Ensure variants is properly handled
                    $variants = $component->variants;
                    if (is_string($variants)) {
                        $variants = json_decode($variants, true);
                    }
                    
                    return [
                        'id' => $component->id,
                        'name' => $component->name,
                        'type' => $component->type,
                        'component_type' => $component->component_type,
                        'category' => $component->category,
                        'alphabet_group' => $component->alphabet_group,
                        'description' => $component->description,
                        'icon' => $component->icon,
                        'default_props' => $component->default_props,
                        'prop_definitions' => $component->prop_definitions,
                        'variants' => $variants,
                        'has_animation' => $component->has_animation,
                        'animation_type' => $component->animation_type,
                        'sort_order' => $component->sort_order
                    ];
                });
            });

            // Restructure the data for frontend consumption
            $restructured = [
                'elements' => [],
                'components' => []
            ];

            foreach ($groupedComponents as $key => $group) {
                $parts = explode('_', $key);
                if (count($parts) >= 2) {
                    $type = $parts[0];
                    $letter = $parts[1];
                    
                    // Ensure the type key exists and is pluralized
                    $typeKey = $type === 'element' ? 'elements' : 'components';
                    
                    if (!isset($restructured[$typeKey])) {
                        $restructured[$typeKey] = [];
                    }
                    
                    if (!isset($restructured[$typeKey][$letter])) {
                        $restructured[$typeKey][$letter] = [];
                    }
                    
                    $restructured[$typeKey][$letter] = array_merge(
                        $restructured[$typeKey][$letter], 
                        $group->toArray()
                    );
                }
            }

            // Debug: Log the restructured data
            Log::info('Restructured components:', [
                'elements_count' => count($restructured['elements']),
                'components_count' => count($restructured['components']),
                'elements_letters' => array_keys($restructured['elements']),
                'components_letters' => array_keys($restructured['components'])
            ]);

            return response()->json([
                'success' => true,
                'data' => $restructured,
                'debug' => [
                    'total_components' => $components->count(),
                    'elements_letters' => array_keys($restructured['elements']),
                    'components_letters' => array_keys($restructured['components'])
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in ComponentController@index:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to load components: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Component $component): JsonResponse
    {
        try {
            // Ensure variants is properly loaded and decoded
            $componentData = $component->toArray();
            
            if (isset($componentData['variants']) && is_string($componentData['variants'])) {
                $componentData['variants'] = json_decode($componentData['variants'], true);
            }
            
            return response()->json([
                'success' => true,
                'data' => $componentData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load component: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'type' => 'required|string|unique:components|max:255',
                'component_type' => 'required|in:element,component',
                'category' => 'required|string|max:255',
                'alphabet_group' => 'required|string|size:1',
                'description' => 'required|string',
                'icon' => 'nullable|string|max:255',
                'default_props' => 'required|array',
                'prop_definitions' => 'required|array',
                'render_template' => 'required|string',
                'code_generators' => 'required|array',
                'variants' => 'nullable|array',
                'has_animation' => 'boolean',
                'animation_type' => 'nullable|string|max:255',
                'sort_order' => 'integer|min:0'
            ]);

            $component = Component::create($validated);

            return response()->json([
                'success' => true,
                'data' => $component,
                'message' => 'Component created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create component: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Component $component): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'string|max:255',
                'type' => 'string|unique:components,type,' . $component->id . '|max:255',
                'component_type' => 'in:element,component',
                'category' => 'string|max:255',
                'alphabet_group' => 'string|size:1',
                'description' => 'string',
                'icon' => 'nullable|string|max:255',
                'default_props' => 'array',
                'prop_definitions' => 'array',
                'render_template' => 'string',
                'code_generators' => 'array',
                'variants' => 'nullable|array',
                'has_animation' => 'boolean',
                'animation_type' => 'nullable|string|max:255',
                'is_active' => 'boolean',
                'sort_order' => 'integer|min:0'
            ]);

            $component->update($validated);

            return response()->json([
                'success' => true,
                'data' => $component,
                'message' => 'Component updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update component: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Component $component): JsonResponse
    {
        try {
            $component->delete();

            return response()->json([
                'success' => true,
                'message' => 'Component deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete component: ' . $e->getMessage()
            ], 500);
        }
    }

    public function search(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'query' => 'required|string|max:255',
                'component_type' => 'nullable|in:element,component',
                'category' => 'nullable|string|max:255'
            ]);

            $query = Component::active()->search($validated['query']);

            if (isset($validated['component_type'])) {
                $query->byComponentType($validated['component_type']);
            }

            if (isset($validated['category'])) {
                $query->byCategory($validated['category']);
            }

            $results = $query->ordered()->get()->map(function ($component) {
                $variants = $component->variants;
                if (is_string($variants)) {
                    $variants = json_decode($variants, true);
                }
                
                return [
                    'id' => $component->id,
                    'name' => $component->name,
                    'type' => $component->type,
                    'component_type' => $component->component_type,
                    'category' => $component->category,
                    'alphabet_group' => $component->alphabet_group,
                    'description' => $component->description,
                    'icon' => $component->icon,
                    'variants' => $variants,
                    'has_animation' => $component->has_animation,
                    'animation_type' => $component->animation_type
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $results
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search components: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getByLetter(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'letter' => 'required|string|size:1',
                'component_type' => 'required|in:element,component'
            ]);

            $components = Component::active()
                ->byComponentType($validated['component_type'])
                ->byAlphabetGroup($validated['letter'])
                ->ordered()
                ->get()
                ->map(function ($component) {
                    $variants = $component->variants;
                    if (is_string($variants)) {
                        $variants = json_decode($variants, true);
                    }
                    
                    return [
                        'id' => $component->id,
                        'name' => $component->name,
                        'type' => $component->type,
                        'component_type' => $component->component_type,
                        'category' => $component->category,
                        'alphabet_group' => $component->alphabet_group,
                        'description' => $component->description,
                        'icon' => $component->icon,
                        'variants' => $variants,
                        'has_animation' => $component->has_animation,
                        'animation_type' => $component->animation_type
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $components
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get components by letter: ' . $e->getMessage()
            ], 500);
        }
    }

    // Around line 250 - REPLACE with simple delegation
public function generateCode(Request $request): JsonResponse
{
    try {
        $validated = $request->validate([
            'components' => 'required|array',
            'style' => 'required|string|in:react-tailwind,react-css,html-css,html-tailwind'
        ]);

        // ✅ Just return success - let frontend handle generation
        return response()->json([
            'success' => true,
            'message' => 'Code generation handled by frontend ComponentLibraryService'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to process request: ' . $e->getMessage()
        ], 500);
    }
}

  


 

  


    





}