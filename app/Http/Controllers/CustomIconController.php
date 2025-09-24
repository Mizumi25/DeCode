<?php

namespace App\Http\Controllers;

use App\Models\CustomIcon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class CustomIconController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $workspaceId = $request->get('workspace_id');
        
        $query = CustomIcon::byUser($user->id);
        
        if ($workspaceId) {
            $query->byWorkspace($workspaceId);
        }
        
        if ($category = $request->get('category')) {
            $query->byCategory($category);
        }
        
        if ($search = $request->get('search')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }
        
        $icons = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $icons
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'category' => 'string|max:100',
            'svg_content' => 'required|string',
            'workspace_id' => 'nullable|exists:workspaces,id',
            'is_public' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Validate SVG content
        if (!$this->isValidSvg($request->svg_content)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid SVG content'
            ], 422);
        }

        $icon = CustomIcon::create([
            'user_id' => auth()->id(),
            'workspace_id' => $request->workspace_id,
            'name' => $request->name,
            'category' => $request->category ?? 'custom',
            'svg_content' => $request->svg_content,
            'metadata' => $this->extractSvgMetadata($request->svg_content),
            'is_public' => $request->is_public ?? false
        ]);

        return response()->json([
            'success' => true,
            'data' => $icon,
            'message' => 'Icon created successfully'
        ], 201);
    }

    public function upload(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:svg|max:1024', // 1MB max
            'name' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:100',
            'workspace_id' => 'nullable|exists:workspaces,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $file = $request->file('file');
        $svgContent = file_get_contents($file->getRealPath());

        if (!$this->isValidSvg($svgContent)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid SVG file'
            ], 422);
        }

        // Store file
        $path = $file->store('icons/svg', 'public');

        $icon = CustomIcon::create([
            'user_id' => auth()->id(),
            'workspace_id' => $request->workspace_id,
            'name' => $request->name ?? pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'category' => $request->category ?? 'uploaded',
            'svg_content' => $svgContent,
            'file_path' => $path,
            'metadata' => $this->extractSvgMetadata($svgContent)
        ]);

        return response()->json([
            'success' => true,
            'data' => $icon,
            'message' => 'Icon uploaded successfully'
        ], 201);
    }

    public function destroy(CustomIcon $customIcon): JsonResponse
    {
        // Check ownership
        if ($customIcon->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Delete file if exists
        if ($customIcon->file_path && Storage::disk('public')->exists($customIcon->file_path)) {
            Storage::disk('public')->delete($customIcon->file_path);
        }

        $customIcon->delete();

        return response()->json([
            'success' => true,
            'message' => 'Icon deleted successfully'
        ]);
    }

    private function isValidSvg(string $content): bool
    {
        // Basic SVG validation
        return strpos(trim($content), '<svg') === 0 && 
               strpos($content, '</svg>') !== false;
    }

    private function extractSvgMetadata(string $svgContent): array
    {
        $metadata = [];
        
        // Extract viewBox
        if (preg_match('/viewBox="([^"]*)"/', $svgContent, $matches)) {
            $metadata['viewBox'] = $matches[1];
        }
        
        // Extract dimensions
        if (preg_match('/width="([^"]*)"/', $svgContent, $matches)) {
            $metadata['width'] = $matches[1];
        }
        if (preg_match('/height="([^"]*)"/', $svgContent, $matches)) {
            $metadata['height'] = $matches[1];
        }
        
        // Extract colors (basic)
        if (preg_match_all('/(?:fill|stroke)="(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})"/', $svgContent, $matches)) {
            $metadata['colors'] = array_unique($matches[1]);
        }
        
        $metadata['size'] = strlen($svgContent);
        $metadata['created_at'] = now()->toISOString();
        
        return $metadata;
    }
}