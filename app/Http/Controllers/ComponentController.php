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
        $components = Component::active()
            ->ordered()
            ->get()
            ->groupBy('category');

        return response()->json([
            'success' => true,
            'data' => $components
        ]);
    }

    public function show(Component $component): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $component
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|unique:components|max:255',
            'category' => 'required|string|max:255',
            'description' => 'required|string',
            'icon' => 'nullable|string|max:255',
            'default_props' => 'required|array',
            'prop_definitions' => 'required|array',
            'render_template' => 'required|string',
            'code_generators' => 'required|array',
            'sort_order' => 'integer|min:0'
        ]);

        $component = Component::create($validated);

        return response()->json([
            'success' => true,
            'data' => $component,
            'message' => 'Component created successfully'
        ], 201);
    }

    public function update(Request $request, Component $component): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'type' => 'string|unique:components,type,' . $component->id . '|max:255',
            'category' => 'string|max:255',
            'description' => 'string',
            'icon' => 'nullable|string|max:255',
            'default_props' => 'array',
            'prop_definitions' => 'array',
            'render_template' => 'string',
            'code_generators' => 'array',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0'
        ]);

        $component->update($validated);

        return response()->json([
            'success' => true,
            'data' => $component,
            'message' => 'Component updated successfully'
        ]);
    }

    public function destroy(Component $component): JsonResponse
    {
        $component->delete();

        return response()->json([
            'success' => true,
            'message' => 'Component deleted successfully'
        ]);
    }

    public function generateCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'components' => 'required|array',
            'style' => 'required|string|in:react-tailwind,react-css,html-css,html-tailwind'
        ]);

        $generatedCode = $this->processCodeGeneration($validated['components'], $validated['style']);

        return response()->json([
            'success' => true,
            'data' => $generatedCode
        ]);
    }

    private function processCodeGeneration(array $components, string $style): array
    {
        // Implementation for code generation logic
        // This would process the components and generate code based on the style
        
        $result = [
            'html' => '',
            'css' => '',
            'react' => '',
            'tailwind' => ''
        ];

        foreach ($components as $componentData) {
            $component = Component::where('type', $componentData['type'])->first();
            if ($component && isset($component->code_generators[$style])) {
                // Process the component template with the instance data
                // This is where you'd implement your template engine
            }
        }

        return $result;
    }
}