<?php
// app/Http/Controllers/ComponentController.php
namespace App\Http\Controllers;

use App\Models\Component;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ComponentController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $components = Component::active()
                ->ordered()
                ->get();

            // Debug: Log the raw components
            \Log::info('Raw components from database:', ['count' => $components->count()]);
            
            if ($components->isEmpty()) {
                \Log::warning('No components found in database');
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
            \Log::info('Restructured components:', [
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
            \Log::error('Error in ComponentController@index:', [
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

    public function generateCode(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'components' => 'required|array',
                'style' => 'required|string|in:react-tailwind,react-css,html-css,html-tailwind'
            ]);

            $generatedCode = $this->processCodeGeneration($validated['components'], $validated['style']);
            
            return response()->json([
                'success' => true,
                'data' => $generatedCode
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate code: ' . $e->getMessage()
            ], 500);
        }
    }

    private function processCodeGeneration(array $components, string $style): array
    {
        if (empty($components)) {
            return $this->getEmptyTemplate($style);
        }

        switch ($style) {
            case 'react-tailwind':
                return $this->generateReactTailwindCode($components);
            case 'react-css':
                return $this->generateReactCSSCode($components);
            case 'html-css':
                return $this->generateHTMLCSSCode($components);
            case 'html-tailwind':
                return $this->generateHTMLTailwindCode($components);
            default:
                return $this->generateReactTailwindCode($components);
        }
    }

    private function getEmptyTemplate(string $style): array
    {
        switch ($style) {
            case 'react-tailwind':
            case 'react-css':
                return [
                    'react' => 'import React from \'react\';

const GeneratedComponent = () => {
  return (
    <div className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
      {/* No components yet */}
    </div>
  );
};

export default GeneratedComponent;',
                    'css' => '/* No styles needed yet */',
                    'html' => '',
                    'tailwind' => '// No components to generate classes for'
                ];
            case 'html-css':
            case 'html-tailwind':
                return [
                    'html' => '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Component</title>
</head>
<body>
    <div class="container">
      <!-- No components yet -->
    </div>
</body>
</html>',
                    'css' => '.container { padding: 20px; }',
                    'react' => '',
                    'tailwind' => ''
                ];
            default:
                return ['html' => '', 'css' => '', 'react' => '', 'tailwind' => ''];
        }
    }

    private function generateReactTailwindCode(array $components): array
    {
        $reactComponents = [];
        $tailwindClasses = [];

        foreach ($components as $comp) {
            $component = Component::where('type', $comp['type'])->first();
            if (!$component) continue;

            $classes = $this->getComponentClasses($comp, $component);
            $tailwindClasses[] = "// {$component->name} ({$comp['type']})\n{$classes}";

            $reactComponents[] = "        <div style={{ position: 'absolute', left: '{$comp['position']['x']}px', top: '{$comp['position']['y']}px' }}>
          {$this->generateComponentJSX($comp, $component, $classes)}
        </div>";
        }

        return [
            'react' => 'import React from \'react\';

const GeneratedComponent = () => {
  return (
    <div className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
' . implode("\n", $reactComponents) . '
    </div>
  );
};

export default GeneratedComponent;',
            'tailwind' => implode("\n\n", $tailwindClasses),
            'html' => '',
            'css' => ''
        ];
    }

    private function generateComponentJSX(array $comp, Component $component, string $classes): string
    {
        // Handle variant-specific generation
        $variant = $comp['variant'] ?? null;
        
        if ($variant && $component->variants) {
            $variants = is_string($component->variants) 
                ? json_decode($component->variants, true) 
                : $component->variants;
                
            $variantData = collect($variants)->firstWhere('name', $variant['name']);
            if ($variantData && isset($variantData['preview_code'])) {
                return $variantData['preview_code'];
            }
        }

        // Fallback to default component generation
        switch ($comp['type']) {
            case 'button':
                $disabled = isset($comp['props']['disabled']) && $comp['props']['disabled'] ? ' disabled' : '';
                return "<button className=\"{$classes}\"{$disabled}>{$comp['props']['text']}</button>";
            
            case 'avatar':
                return "<div className=\"{$classes}\"><span>A</span></div>";
            
            case 'badge':
                return "<span className=\"{$classes}\">{$comp['props']['text']}</span>";
            
            case 'card':
                $title = isset($comp['props']['title']) ? "<h3 className=\"font-semibold text-lg mb-2 text-gray-900\">{$comp['props']['title']}</h3>" : '';
                $content = $comp['props']['content'] ?? 'Card content';
                return "<div className=\"{$classes}\">
            {$title}
            <div className=\"text-gray-600\">{$content}</div>
          </div>";
            
            case 'searchbar':
                return "<div className=\"{$classes}\"><input placeholder=\"{$comp['props']['placeholder']}\" /><svg className=\"search-icon\">...</svg></div>";
            
            default:
                return "<div className=\"{$classes}\">{$component->name}</div>";
        }
    }

    private function getComponentClasses(array $comp, Component $component): string
    {
        // Handle variant-specific classes
        $variant = $comp['variant'] ?? null;
        
        if ($variant && $component->variants) {
            $variants = is_string($component->variants) 
                ? json_decode($component->variants, true) 
                : $component->variants;
                
            $variantData = collect($variants)->firstWhere('name', $variant['name']);
            if ($variantData && isset($variantData['classes'])) {
                return $variantData['classes'];
            }
        }

        // Default classes based on component type
        switch ($comp['type']) {
            case 'button':
                return $this->getButtonClasses($comp['props'] ?? []);
            case 'avatar':
                return 'w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600';
            case 'badge':
                return 'inline-block bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full';
            case 'card':
                return 'bg-white rounded-lg shadow-md p-6 border border-gray-200';
            case 'searchbar':
                return 'relative flex items-center';
            default:
                return 'p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50';
        }
    }

    private function getButtonClasses(array $props): string
    {
        $baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
        
        $variantClasses = [
            'primary' => "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus:ring-purple-500 shadow-lg hover:shadow-xl",
            'secondary' => "bg-white text-gray-900 border-2 border-gray-200 hover:bg-gray-50 focus:ring-gray-500 shadow-sm hover:shadow-md",
            'success' => "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-500 shadow-lg hover:shadow-xl",
            'warning' => "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 focus:ring-amber-500 shadow-lg hover:shadow-xl",
            'danger' => "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 focus:ring-red-500 shadow-lg hover:shadow-xl",
            'ghost' => "bg-transparent text-purple-600 hover:bg-purple-50 focus:ring-purple-500 border border-transparent hover:border-purple-200",
            'gradient' => "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all",
            'neon' => "bg-black border-2 border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-400/50 hover:shadow-cyan-400/75",
            'glass' => "bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xl"
        ];
        
        $sizeClasses = [
            'xs' => "px-2 py-1 text-xs",
            'sm' => "px-3 py-1.5 text-sm",
            'md' => "px-6 py-2.5 text-base",
            'lg' => "px-8 py-4 text-lg",
            'xl' => "px-10 py-5 text-xl"
        ];
        
        $variant = $variantClasses[$props['variant'] ?? 'primary'] ?? $variantClasses['primary'];
        $size = $sizeClasses[$props['size'] ?? 'md'] ?? $sizeClasses['md'];
        $custom = $props['className'] ?? '';
        
        return trim("{$baseClasses} {$variant} {$size} {$custom}");
    }

    private function getInputClasses(array $props): string
    {
        $baseClasses = "block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1";
        
        $variantClasses = [
            'default' => "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
            'error' => "border-red-300 focus:border-red-500 focus:ring-red-500",
            'success' => "border-green-300 focus:border-green-500 focus:ring-green-500"
        ];
        
        $sizeClasses = [
            'sm' => "px-3 py-1.5 text-sm",
            'md' => "px-4 py-2.5 text-base",
            'lg' => "px-5 py-3 text-lg"
        ];
        
        $variant = $variantClasses[$props['variant'] ?? 'default'] ?? $variantClasses['default'];
        $size = $sizeClasses[$props['size'] ?? 'md'] ?? $sizeClasses['md'];
        
        return trim("{$baseClasses} {$variant} {$size}");
    }

    private function getCardClasses(array $props): string
    {
        $baseClasses = "rounded-lg border bg-white";
        
        $variantClasses = [
            'default' => "border-gray-200",
            'outlined' => "border-gray-300 bg-transparent",
            'elevated' => "border-transparent shadow-lg"
        ];
        
        $paddingClasses = [
            'sm' => "p-3",
            'md' => "p-4",
            'lg' => "p-6"
        ];
        
        $variant = $variantClasses[$props['variant'] ?? 'default'] ?? $variantClasses['default'];
        $padding = $paddingClasses[$props['padding'] ?? 'md'] ?? $paddingClasses['md'];
        $shadow = (isset($props['shadow']) && $props['shadow'] && ($props['variant'] ?? 'default') !== 'elevated') ? 'shadow-sm' : '';
        
        return trim("{$baseClasses} {$variant} {$padding} {$shadow}");
    }

    private function generateReactCSSCode(array $components): array
    {
        $reactComponents = [];
        
        foreach ($components as $comp) {
            $component = Component::where('type', $comp['type'])->first();
            if (!$component) continue;

            $classes = $this->getCSSClasses($comp, $component);
            $reactComponents[] = "        <div style={{ position: 'absolute', left: '{$comp['position']['x']}px', top: '{$comp['position']['y']}px' }}>
          {$this->generateComponentJSX($comp, $component, $classes)}
        </div>";
        }

        return [
            'react' => 'import React from \'react\';
import \'./GeneratedComponent.css\';

const GeneratedComponent = () => {
  return (
    <div className="canvas-container">
' . implode("\n", $reactComponents) . '
    </div>
  );
};

export default GeneratedComponent;',
            'css' => $this->generateCSSStyles($components),
            'html' => '',
            'tailwind' => ''
        ];
    }

    private function generateHTMLCSSCode(array $components): array
    {
        $htmlComponents = [];
        
        foreach ($components as $comp) {
            $component = Component::where('type', $comp['type'])->first();
            if (!$component) continue;

            $classes = $this->getCSSClasses($comp, $component);
            $htmlComponents[] = "    <div style=\"position: absolute; left: {$comp['position']['x']}px; top: {$comp['position']['y']}px;\">
      {$this->generateComponentHTML($comp, $component, $classes)}
    </div>";
        }

        return [
            'html' => '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Component</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="canvas-container">
' . implode("\n", $htmlComponents) . '
    </div>
</body>
</html>',
            'css' => $this->generateCSSStyles($components),
            'react' => '',
            'tailwind' => ''
        ];
    }

    private function generateHTMLTailwindCode(array $components): array
    {
        $htmlComponents = [];
        $tailwindClasses = [];

        foreach ($components as $comp) {
            $component = Component::where('type', $comp['type'])->first();
            if (!$component) continue;

            $classes = $this->getComponentClasses($comp, $component);
            $tailwindClasses[] = "/* {$component->name} ({$comp['type']}) */\n{$classes}";

            $htmlComponents[] = "    <div style=\"position: absolute; left: {$comp['position']['x']}px; top: {$comp['position']['y']}px;\">
      {$this->generateComponentHTML($comp, $component, $classes)}
    </div>";
        }

        return [
            'html' => '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Component</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div class="relative w-full h-full min-h-[400px] bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
' . implode("\n", $htmlComponents) . '
    </div>
</body>
</html>',
            'tailwind' => implode("\n\n", $tailwindClasses),
            'css' => '',
            'react' => ''
        ];
    }

    private function generateComponentHTML(array $comp, Component $component, string $classes): string
    {
        switch ($comp['type']) {
            case 'button':
                $disabled = isset($comp['props']['disabled']) && $comp['props']['disabled'] ? ' disabled' : '';
                return "<button class=\"{$classes}\"{$disabled}>{$comp['props']['text']}</button>";
            
            case 'avatar':
                return "<div class=\"{$classes}\"><span>A</span></div>";
            
            case 'badge':
                return "<span class=\"{$classes}\">{$comp['props']['text']}</span>";
            
            case 'card':
                $title = isset($comp['props']['title']) ? "<h3 class=\"font-semibold text-lg mb-2 text-gray-900\">{$comp['props']['title']}</h3>" : '';
                $content = $comp['props']['content'] ?? 'Card content';
                return "<div class=\"{$classes}\">
        {$title}
        <div class=\"text-gray-600\">{$content}</div>
      </div>";
            
            default:
                return "<div class=\"{$classes}\">{$component->name}</div>";
        }
    }

    private function getCSSClasses(array $comp, Component $component): string
    {
        switch ($comp['type']) {
            case 'button':
                $variant = $comp['props']['variant'] ?? 'primary';
                $size = $comp['props']['size'] ?? 'md';
                return "btn btn-{$variant} btn-{$size}";
            case 'avatar':
                return 'avatar';
            case 'badge':
                $variant = $comp['props']['variant'] ?? 'default';
                return "badge badge-{$variant}";
            case 'card':
                return 'card';
            default:
                return 'component-default';
        }
    }

    private function generateCSSStyles(array $components): string
    {
        return '.canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  font-family: \'Inter\', sans-serif;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover {
  background: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.875rem;
}

.btn-md {
  padding: 10px 24px;
  font-size: 1rem;
}

.btn-lg {
  padding: 16px 32px;
  font-size: 1.125rem;
}

/* Input styles */
.input {
  display: block;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Card styles */
.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Avatar styles */
.avatar {
  width: 3rem;
  height: 3rem;
  background-color: #d1d5db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

/* Badge styles */
.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge-default {
  background-color: #f3f4f6;
  color: #374151;
}

.badge-primary {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.badge-success {
  background-color: #dcfce7;
  color: #166534;
}

.badge-warning {
  background-color: #fef3c7;
  color: #92400e;
}

.badge-danger {
  background-color: #fee2e2;
  color: #991b1b;
}

.component-default {
  padding: 1rem;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background-color: #f9fafb;
  text-align: center;
}';
    }
}