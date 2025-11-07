<?php
// app/Http/Controllers/AssetController.php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class AssetController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'nullable|string',
            'type' => 'nullable|in:image,video,audio,gif',
            'search' => 'nullable|string'
        ]);

        $query = Asset::where('user_id', auth()->id());

        if (isset($validated['project_id'])) {
            $query->where('project_id', $validated['project_id']);
        }

        if (isset($validated['type'])) {
            $query->where('type', $validated['type']);
        }

        if (isset($validated['search'])) {
            $query->where('name', 'like', '%' . $validated['search'] . '%');
        }

        $assets = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $assets->map(function ($asset) {
                return [
                    'id' => $asset->id,
                    'uuid' => $asset->uuid,
                    'name' => $asset->name,
                    'type' => $asset->type,
                    'url' => $asset->url,
                    'thumbnail' => $asset->thumbnail_url,
                    'size' => $asset->file_size,
                    'dimensions' => $asset->dimensions,
                    'duration' => $asset->duration,
                    'metadata' => $asset->metadata,
                    'tags' => $asset->tags,
                    'created_at' => $asset->created_at->toISOString()
                ];
            })
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => 'required|file|max:102400', // 100MB max
            'type' => 'required|in:image,video,audio,gif',
            'project_id' => 'nullable|string'
        ]);

        $file = $request->file('file');
        $type = $validated['type'];
        
        // Generate unique filename
        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $extension;
        $filePath = "assets/{$type}s/" . $filename;
        
        // Store file
        $storedPath = $file->storeAs("assets/{$type}s", $filename, 'public');
        
        if (!$storedPath) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload file'
            ], 500);
        }

        // Get file metadata
        $metadata = $this->extractMetadata($file, $type);
        
        // Generate thumbnail
        $thumbnailPath = null;
        if ($type === 'image' || $type === 'gif') {
            $thumbnailPath = $this->generateImageThumbnail($file, $filename);
        } elseif ($type === 'video') {
            $thumbnailPath = $this->generateVideoThumbnail($filePath, $filename);
        }

        // Create asset record
        $asset = Asset::create([
            'user_id' => auth()->id(),
            'project_id' => $validated['project_id'] ?? null,
            'name' => $file->getClientOriginalName(),
            'type' => $type,
            'file_path' => $storedPath,
            'thumbnail_path' => $thumbnailPath,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'dimensions' => $metadata['dimensions'] ?? null,
            'duration' => $metadata['duration'] ?? null,
            'metadata' => $metadata
        ]);

        return response()->json([
            'success' => true,
            'asset' => [
                'id' => $asset->id,
                'uuid' => $asset->uuid,
                'name' => $asset->name,
                'type' => $asset->type,
                'url' => $asset->url,
                'thumbnail' => $asset->thumbnail_url,
                'size' => $asset->file_size,
                'dimensions' => $asset->dimensions,
                'duration' => $asset->duration,
                'metadata' => $asset->metadata
            ]
        ]);
    }

    public function show(Asset $asset): JsonResponse
    {
        // Check ownership
        if ($asset->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'asset' => [
                'id' => $asset->id,
                'uuid' => $asset->uuid,
                'name' => $asset->name,
                'type' => $asset->type,
                'url' => $asset->url,
                'thumbnail' => $asset->thumbnail_url,
                'size' => $asset->file_size,
                'dimensions' => $asset->dimensions,
                'duration' => $asset->duration,
                'metadata' => $asset->metadata,
                'tags' => $asset->tags,
                'created_at' => $asset->created_at->toISOString()
            ]
        ]);
    }

    public function destroy(Asset $asset): JsonResponse
    {
        // Check ownership
        if ($asset->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Delete files
        if (Storage::disk('public')->exists($asset->file_path)) {
            Storage::disk('public')->delete($asset->file_path);
        }

        if ($asset->thumbnail_path && Storage::disk('public')->exists($asset->thumbnail_path)) {
            Storage::disk('public')->delete($asset->thumbnail_path);
        }

        // Delete record
        $asset->delete();

        return response()->json([
            'success' => true,
            'message' => 'Asset deleted successfully'
        ]);
    }

    public function removeBackground(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'assetId' => 'required|integer|exists:assets,id'
        ]);

        $asset = Asset::findOrFail($validated['assetId']);

        // Check ownership
        if ($asset->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        if ($asset->type !== 'image') {
            return response()->json([
                'success' => false,
                'message' => 'Background removal only supported for images'
            ], 400);
        }

        try {
            $processedImagePath = $this->processBackgroundRemoval($asset->file_path);
            
            if (!$processedImagePath) {
                throw new \Exception('Background removal failed');
            }

            // Delete old file
            if (Storage::disk('public')->exists($asset->file_path)) {
                Storage::disk('public')->delete($asset->file_path);
            }

            // Update asset record
            $asset->update([
                'file_path' => $processedImagePath,
                'metadata' => array_merge($asset->metadata ?? [], [
                    'background_removed' => true,
                    'processed_at' => now()->toISOString()
                ])
            ]);

            // Generate new thumbnail
            $thumbnailPath = $this->generateImageThumbnail(
                Storage::disk('public')->path($processedImagePath), 
                pathinfo($asset->name, PATHINFO_FILENAME) . '_nobg.png'
            );
            
            if ($thumbnailPath) {
                if ($asset->thumbnail_path && Storage::disk('public')->exists($asset->thumbnail_path)) {
                    Storage::disk('public')->delete($asset->thumbnail_path);
                }
                $asset->update(['thumbnail_path' => $thumbnailPath]);
            }

            return response()->json([
                'success' => true,
                'url' => $asset->url,
                'thumbnail' => $asset->thumbnail_url
            ]);

        } catch (\Exception $e) {
            \Log::error('Background removal failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Background removal failed'
            ], 500);
        }
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'asset_ids' => 'required|array',
            'asset_ids.*' => 'integer|exists:assets,id'
        ]);

        $assets = Asset::whereIn('id', $validated['asset_ids'])
            ->where('user_id', auth()->id())
            ->get();

        foreach ($assets as $asset) {
            // Delete files
            if (Storage::disk('public')->exists($asset->file_path)) {
                Storage::disk('public')->delete($asset->file_path);
            }

            if ($asset->thumbnail_path && Storage::disk('public')->exists($asset->thumbnail_path)) {
                Storage::disk('public')->delete($asset->thumbnail_path);
            }

            $asset->delete();
        }

        return response()->json([
            'success' => true,
            'message' => count($assets) . ' assets deleted successfully'
        ]);
    }

    private function extractMetadata($file, $type): array
    {
        $metadata = [];

        try {
            if ($type === 'image' || $type === 'gif') {
                // Create ImageManager instance
                $manager = new ImageManager(new Driver());
                $image = $manager->read($file->getRealPath());
                
                $metadata['dimensions'] = [
                    'width' => $image->width(),
                    'height' => $image->height()
                ];
                
                // Extract EXIF data if available
                $exifData = @exif_read_data($file->getRealPath());
                if ($exifData) {
                    $metadata['exif'] = [
                        'camera_make' => $exifData['Make'] ?? null,
                        'camera_model' => $exifData['Model'] ?? null,
                        'date_taken' => $exifData['DateTime'] ?? null,
                    ];
                }
            } elseif (in_array($type, ['video', 'audio'])) {
                // Use getID3 library for media metadata
                $getID3 = new \getID3();
                $fileInfo = $getID3->analyze($file->getRealPath());
                
                if (isset($fileInfo['video'])) {
                    $metadata['dimensions'] = [
                        'width' => $fileInfo['video']['resolution_x'] ?? null,
                        'height' => $fileInfo['video']['resolution_y'] ?? null
                    ];
                }
                
                $metadata['duration'] = $fileInfo['playtime_seconds'] ?? null;
                $metadata['bitrate'] = $fileInfo['bitrate'] ?? null;
                $metadata['codec'] = $fileInfo['audio']['codec'] ?? $fileInfo['video']['codec'] ?? null;
            }
        } catch (\Exception $e) {
            \Log::warning('Failed to extract metadata: ' . $e->getMessage());
        }

        return $metadata;
    }

    private function generateImageThumbnail($file, $filename): ?string
    {
        try {
            // Create ImageManager instance
            $manager = new ImageManager(new Driver());
            $image = $manager->read($file);
            
            // Resize to 300x300 max, maintain aspect ratio
            $image->scale(width: 300, height: 300);

            $thumbnailPath = 'assets/thumbnails/' . pathinfo($filename, PATHINFO_FILENAME) . '_thumb.jpg';
            $fullThumbnailPath = storage_path('app/public/' . $thumbnailPath);
            
            // Ensure directory exists
            $directory = dirname($fullThumbnailPath);
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }
            
            $image->toJpeg(80)->save($fullThumbnailPath);
            
            return $thumbnailPath;
        } catch (\Exception $e) {
            \Log::warning('Failed to generate thumbnail: ' . $e->getMessage());
            return null;
        }
    }

    private function generateVideoThumbnail($videoPath, $filename): ?string
    {
        try {
            $thumbnailPath = 'assets/thumbnails/' . pathinfo($filename, PATHINFO_FILENAME) . '_thumb.jpg';
            $fullThumbnailPath = storage_path('app/public/' . $thumbnailPath);
            $fullVideoPath = storage_path('app/public/' . $videoPath);
            
            // Ensure directory exists
            $directory = dirname($fullThumbnailPath);
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }
            
            // Use FFmpeg to extract frame at 1 second
            $command = "ffmpeg -i \"{$fullVideoPath}\" -ss 00:00:01.000 -vframes 1 -q:v 2 \"{$fullThumbnailPath}\" 2>/dev/null";
            exec($command, $output, $returnCode);
            
            if ($returnCode === 0 && file_exists($fullThumbnailPath)) {
                return $thumbnailPath;
            }
        } catch (\Exception $e) {
            \Log::warning('Failed to generate video thumbnail: ' . $e->getMessage());
        }
        
        return null;
    }

    private function processBackgroundRemoval($imagePath): ?string
    {
        try {
            $apiKey = config('services.removebg.api_key');
            if (!$apiKey) {
                throw new \Exception('Remove.bg API key not configured');
            }

            $fullImagePath = storage_path('app/public/' . $imagePath);
            $processedPath = 'assets/images/' . Str::uuid() . '_nobg.png';
            $fullProcessedPath = storage_path('app/public/' . $processedPath);

            // Call remove.bg API
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => 'https://api.remove.bg/v1.0/removebg',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => [
                    'image_file' => new \CurlFile($fullImagePath),
                    'size' => 'auto'
                ],
                CURLOPT_HTTPHEADER => [
                    'X-Api-Key: ' . $apiKey
                ],
                CURLOPT_TIMEOUT => 30
            ]);

            $response = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            curl_close($curl);

            if ($httpCode === 200 && $response) {
                file_put_contents($fullProcessedPath, $response);
                return $processedPath;
            } else {
                throw new \Exception('Remove.bg API returned error: ' . $httpCode);
            }

        } catch (\Exception $e) {
            \Log::error('Background removal failed: ' . $e->getMessage());
            return null;
        }
    }
}