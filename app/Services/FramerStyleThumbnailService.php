<?php

namespace App\Services;

use App\Models\Frame;
use App\Events\ThumbnailGenerated;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

/**
 * TRUE Framer-Style Thumbnail Service
 * 
 * Generates pixel-perfect thumbnails using server-side Playwright rendering.
 * This is how Framer actually does it - no browser-only capture methods.
 * 
 * Architecture:
 * 1. Client sends frame data → server
 * 2. Server opens headless Chromium (Playwright)
 * 3. Chromium renders the Forge layout fully
 * 4. Chromium captures PNG screenshot
 * 5. Server returns thumbnail URL
 */
class FramerStyleThumbnailService
{
    private string $playwrightPath;
    private string $thumbnailsPath;
    private string $tempPath;

    public function __construct()
    {
        $this->playwrightPath = base_path('node_modules/.bin/playwright');
        $this->thumbnailsPath = storage_path('app/public/thumbnails/frames');
        $this->tempPath = storage_path('app/temp/playwright');
        
        $this->ensureDirectories();
    }

    /**
     * Generate thumbnail for a frame using server-side Playwright rendering
     * This is the REAL Framer approach
     */
    public function generateThumbnail(Frame $frame): ?string
    {
        try {
            Log::info('[FramerStyleThumbnail] Starting generation', ['frame_id' => $frame->uuid]);

            // Step 1: Delete previous thumbnail
            $this->deletePreviousThumbnail($frame);

            // Step 2: Get frame data - components, layout, styles
            $frameData = $this->prepareFrameData($frame);

            // Step 3: Generate unique filename
            $timestamp = time();
            $thumbnailFilename = $frame->uuid . '_' . $timestamp . '.png';
            $thumbnailPath = $this->thumbnailsPath . '/' . $thumbnailFilename;

            // Step 4: Create standalone HTML page that renders the frame
            $htmlContent = $this->buildFrameHTML($frame, $frameData);
            $tempHtmlPath = $this->tempPath . '/frame_' . $frame->uuid . '_' . $timestamp . '.html';
            file_put_contents($tempHtmlPath, $htmlContent);

            // Step 5: Create Playwright script to render and capture
            $playwrightScript = $this->createPlaywrightCaptureScript($tempHtmlPath, $thumbnailPath, $frameData);
            $scriptPath = $this->tempPath . '/capture_' . $frame->uuid . '_' . $timestamp . '.cjs';
            file_put_contents($scriptPath, $playwrightScript);

            // Step 6: Execute Playwright in headless Chromium
            $this->executePlaywright($scriptPath);

            // Step 7: Cleanup temporary files
            @unlink($tempHtmlPath);
            @unlink($scriptPath);

            // Step 8: Verify thumbnail was created
            if (!file_exists($thumbnailPath)) {
                throw new \Exception('Thumbnail file was not created');
            }

            // Step 9: Update frame with new thumbnail path
            $this->updateFrameThumbnail($frame, $thumbnailFilename, $timestamp);

            // Step 10: Broadcast thumbnail generated event
            if ($frame->project->workspace) {
                broadcast(new ThumbnailGenerated($frame, $frame->project->workspace));
            }

            Log::info('[FramerStyleThumbnail] ✅ Success', [
                'frame_id' => $frame->uuid,
                'thumbnail_path' => $thumbnailPath,
                'file_size' => filesize($thumbnailPath)
            ]);

            return $thumbnailPath;

        } catch (\Exception $e) {
            Log::error('[FramerStyleThumbnail] ❌ Failed', [
                'frame_id' => $frame->uuid,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return null;
        }
    }

    /**
     * Prepare frame data for rendering
     * Get all components, styles, and settings
     */
    private function prepareFrameData(Frame $frame): array
    {
        // Load all components for this frame
        $components = $frame->components()
            ->orderBy('z_index', 'asc')
            ->get()
            ->map(function ($component) {
                return [
                    'id' => $component->id,
                    'uuid' => $component->uuid,
                    'type' => $component->type,
                    'name' => $component->name,
                    'props' => $component->props ?? [],
                    'style' => $component->style ?? [],
                    'position' => [
                        'x' => $component->x ?? 0,
                        'y' => $component->y ?? 0,
                        'z' => $component->z_index ?? 0,
                    ],
                    'size' => [
                        'width' => $component->width ?? 'auto',
                        'height' => $component->height ?? 'auto',
                    ],
                    'parent_id' => $component->parent_id,
                    'children' => [],
                ];
            })
            ->toArray();

        // Build component tree
        $componentTree = $this->buildComponentTree($components);

        return [
            'components' => $componentTree,
            'canvas_style' => $frame->canvas_style ?? [],
            'canvas_props' => $frame->canvas_props ?? [],
            'settings' => $frame->settings ?? [],
            'viewport' => [
                'width' => $frame->canvas_props['width'] ?? 1200,
                'height' => $frame->canvas_props['height'] ?? 800,
            ],
        ];
    }

    /**
     * Build component tree from flat list
     */
    private function buildComponentTree(array $components): array
    {
        $tree = [];
        $lookup = [];

        // Index by ID
        foreach ($components as &$component) {
            $lookup[$component['id']] = &$component;
        }

        // Build tree
        foreach ($components as &$component) {
            if ($component['parent_id'] && isset($lookup[$component['parent_id']])) {
                $lookup[$component['parent_id']]['children'][] = &$component;
            } else {
                $tree[] = &$component;
            }
        }

        return $tree;
    }

    /**
     * Build standalone HTML that renders the frame
     * This is what Playwright will load and screenshot
     */
    private function buildFrameHTML(Frame $frame, array $frameData): string
    {
        $components = $frameData['components'];
        $canvasStyle = $frameData['canvas_style'];
        $viewport = $frameData['viewport'];
        
        $backgroundColor = $canvasStyle['backgroundColor'] ?? '#ffffff';
        $componentHTML = $this->renderComponentsToHTML($components);

        // Include Tailwind and your component styles
        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{$frame->name}</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            width: {$viewport['width']}px;
            height: {$viewport['height']}px;
            background-color: {$backgroundColor};
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        
        .canvas-root {
            position: relative;
            width: 100%;
            height: 100%;
        }
        
        .component {
            position: absolute;
            display: block;
        }
        
        /* Component-specific styles */
        {$this->generateComponentCSS($components)}
    </style>
</head>
<body>
    <div class="canvas-root" data-frame-id="{$frame->uuid}">
        {$componentHTML}
    </div>
    
    <script>
        // Signal when page is fully loaded
        window.addEventListener('load', function() {
            document.body.setAttribute('data-ready', 'true');
            console.log('Frame rendered and ready for capture');
        });
    </script>
</body>
</html>
HTML;
    }

    /**
     * Render components to HTML recursively
     */
    private function renderComponentsToHTML(array $components, int $depth = 0): string
    {
        $html = '';

        foreach ($components as $component) {
            $html .= $this->renderSingleComponent($component, $depth);
        }

        return $html;
    }

    /**
     * Render a single component to HTML
     */
    private function renderSingleComponent(array $component, int $depth): string
    {
        $type = $component['type'] ?? 'div';
        $props = $component['props'] ?? [];
        $style = $component['style'] ?? [];
        $position = $component['position'] ?? [];
        $size = $component['size'] ?? [];
        $children = $component['children'] ?? [];
        
        // Build inline style
        $styleAttr = $this->buildInlineStyle($style, $position, $size);
        
        // Build classes
        $classes = ['component'];
        if (!empty($props['className'])) {
            $classes[] = $props['className'];
        }
        $classAttr = 'class="' . implode(' ', $classes) . '"';
        
        // Build ID
        $idAttr = 'id="component-' . ($component['uuid'] ?? $component['id']) . '"';
        
        // Render based on type
        $tag = $this->getHTMLTag($type);
        $content = $this->getComponentContent($component);
        
        // Render children recursively
        if (!empty($children)) {
            $childrenHTML = $this->renderComponentsToHTML($children, $depth + 1);
            $content .= $childrenHTML;
        }
        
        // Self-closing tags
        if (in_array($tag, ['img', 'input', 'hr', 'br'])) {
            $extraAttrs = $this->getExtraAttributes($type, $props);
            return "<{$tag} {$idAttr} {$classAttr} {$styleAttr} {$extraAttrs} />";
        }
        
        // Regular tags
        $extraAttrs = $this->getExtraAttributes($type, $props);
        return "<{$tag} {$idAttr} {$classAttr} {$styleAttr} {$extraAttrs}>{$content}</{$tag}>";
    }

    /**
     * Get HTML tag for component type
     */
    private function getHTMLTag(string $type): string
    {
        $tagMap = [
            'Button' => 'button',
            'Input' => 'input',
            'Image' => 'img',
            'Text' => 'p',
            'Heading' => 'h1',
            'Container' => 'div',
            'Section' => 'section',
            'Header' => 'header',
            'Footer' => 'footer',
            'Nav' => 'nav',
            'Article' => 'article',
        ];

        return $tagMap[$type] ?? strtolower($type);
    }

    /**
     * Get component content (text, etc.)
     */
    private function getComponentContent(array $component): string
    {
        $props = $component['props'] ?? [];
        
        // Check for text content
        if (isset($props['text'])) {
            return htmlspecialchars($props['text'], ENT_QUOTES, 'UTF-8');
        }
        
        if (isset($props['children']) && is_string($props['children'])) {
            return htmlspecialchars($props['children'], ENT_QUOTES, 'UTF-8');
        }
        
        return '';
    }

    /**
     * Get extra HTML attributes based on component type
     */
    private function getExtraAttributes(string $type, array $props): string
    {
        $attrs = [];
        
        switch ($type) {
            case 'Input':
                if (isset($props['placeholder'])) {
                    $attrs[] = 'placeholder="' . htmlspecialchars($props['placeholder']) . '"';
                }
                if (isset($props['type'])) {
                    $attrs[] = 'type="' . htmlspecialchars($props['type']) . '"';
                }
                break;
                
            case 'Image':
                if (isset($props['src'])) {
                    $attrs[] = 'src="' . htmlspecialchars($props['src']) . '"';
                }
                if (isset($props['alt'])) {
                    $attrs[] = 'alt="' . htmlspecialchars($props['alt']) . '"';
                }
                break;
                
            case 'Button':
                if (isset($props['type'])) {
                    $attrs[] = 'type="' . htmlspecialchars($props['type']) . '"';
                }
                break;
        }
        
        return implode(' ', $attrs);
    }

    /**
     * Build inline style attribute
     */
    private function buildInlineStyle(array $style, array $position, array $size): string
    {
        $styles = [];
        
        // Position
        if (isset($position['x'])) {
            $styles[] = 'left: ' . $position['x'] . 'px';
        }
        if (isset($position['y'])) {
            $styles[] = 'top: ' . $position['y'] . 'px';
        }
        if (isset($position['z'])) {
            $styles[] = 'z-index: ' . $position['z'];
        }
        
        // Size
        if (isset($size['width']) && $size['width'] !== 'auto') {
            $styles[] = 'width: ' . $size['width'] . (is_numeric($size['width']) ? 'px' : '');
        }
        if (isset($size['height']) && $size['height'] !== 'auto') {
            $styles[] = 'height: ' . $size['height'] . (is_numeric($size['height']) ? 'px' : '');
        }
        
        // Other styles
        foreach ($style as $property => $value) {
            if (!empty($value)) {
                $cssProperty = $this->camelToKebab($property);
                $styles[] = $cssProperty . ': ' . $value;
            }
        }
        
        return empty($styles) ? '' : 'style="' . implode('; ', $styles) . '"';
    }

    /**
     * Generate component-specific CSS
     */
    private function generateComponentCSS(array $components): string
    {
        // Add any global component styles here
        return '';
    }

    /**
     * Convert camelCase to kebab-case
     */
    private function camelToKebab(string $string): string
    {
        return strtolower(preg_replace('/([a-z])([A-Z])/', '$1-$2', $string));
    }

    /**
     * Create Playwright script for capturing the frame
     */
    private function createPlaywrightCaptureScript(string $htmlPath, string $thumbnailPath, array $frameData): string
    {
        $viewport = $frameData['viewport'];
        $width = $viewport['width'];
        $height = $viewport['height'];

        return <<<JS
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    let browser;
    try {
        console.log('[Playwright] Launching Chromium...');
        
        // Launch headless Chromium
        browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });
        
        // Create context with exact viewport
        const context = await browser.newContext({
            viewport: { width: {$width}, height: {$height} },
            deviceScaleFactor: 2, // Retina quality
        });
        
        const page = await context.newPage();
        
        console.log('[Playwright] Loading HTML file...');
        await page.goto('file://{$htmlPath}', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        // Wait for page to be ready
        console.log('[Playwright] Waiting for render...');
        await page.waitForSelector('body[data-ready="true"]', { timeout: 10000 });
        
        // Extra wait for fonts/images
        await page.waitForTimeout(500);
        
        // Ensure thumbnail directory exists
        const thumbnailDir = path.dirname('{$thumbnailPath}');
        if (!fs.existsSync(thumbnailDir)) {
            fs.mkdirSync(thumbnailDir, { recursive: true });
        }
        
        console.log('[Playwright] Capturing screenshot...');
        await page.screenshot({
            path: '{$thumbnailPath}',
            type: 'png',
            fullPage: false,
            clip: {
                x: 0,
                y: 0,
                width: {$width},
                height: {$height}
            }
        });
        
        console.log('[Playwright] ✅ Success: {$thumbnailPath}');
        
    } catch (error) {
        console.error('[Playwright] ❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();
JS;
    }

    /**
     * Execute Playwright script
     */
    private function executePlaywright(string $scriptPath): void
    {
        $process = new Process(
            ['node', $scriptPath],
            null,
            ['NODE_PATH' => base_path('node_modules')],
            null,
            60 // 60 second timeout
        );

        $process->run();

        if (!$process->isSuccessful()) {
            $error = $process->getErrorOutput() ?: $process->getOutput();
            throw new \Exception('Playwright execution failed: ' . $error);
        }

        Log::info('[FramerStyleThumbnail] Playwright output:', [
            'output' => $process->getOutput()
        ]);
    }

    /**
     * Update frame with new thumbnail
     */
    private function updateFrameThumbnail(Frame $frame, string $filename, int $timestamp): void
    {
        $settings = $frame->settings ?? [];
        $settings['thumbnail_path'] = 'thumbnails/frames/' . $filename;
        $settings['thumbnail_generated'] = true;
        $settings['thumbnail_generated_at'] = now()->toISOString();
        $settings['thumbnail_version'] = $timestamp;
        $settings['thumbnail_method'] = 'playwright-server-side';
        
        $frame->update(['settings' => $settings]);
    }

    /**
     * Delete previous thumbnail
     */
    private function deletePreviousThumbnail(Frame $frame): void
    {
        try {
            $settings = $frame->settings ?? [];
            if (isset($settings['thumbnail_path'])) {
                Storage::disk('public')->delete($settings['thumbnail_path']);
            }
        } catch (\Exception $e) {
            Log::warning('[FramerStyleThumbnail] Could not delete previous thumbnail:', [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Ensure required directories exist
     */
    private function ensureDirectories(): void
    {
        foreach ([$this->thumbnailsPath, $this->tempPath] as $dir) {
            if (!file_exists($dir)) {
                mkdir($dir, 0755, true);
            }
        }
    }

    /**
     * Check if Playwright is available
     */
    public function checkAvailability(): bool
    {
        try {
            $process = new Process(
                ['node', '-e', 'require("playwright")'],
                null,
                ['NODE_PATH' => base_path('node_modules')]
            );
            $process->run();
            return $process->isSuccessful();
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get thumbnail URL with cache busting
     */
    public function getThumbnailUrl(Frame $frame): ?string
    {
        $settings = $frame->settings ?? [];
        if (!isset($settings['thumbnail_path'])) {
            return null;
        }
        
        $version = $settings['thumbnail_version'] ?? time();
        return asset('storage/' . $settings['thumbnail_path'] . '?v=' . $version);
    }
}
