<?php

namespace App\Services;

use App\Models\Frame;
use App\Events\ThumbnailGenerated;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Illuminate\Support\Facades\Http;


/**
 * Enhanced Playwright Thumbnail Service with real-time updates
 */
class PlaywrightThumbnailService
{
    private string $playwrightPath;
    private string $thumbnailsPath;
    private string $tempPath;

    public function __construct()
    {
        $this->playwrightPath = base_path('node_modules/.bin/playwright');
        $this->thumbnailsPath = storage_path('app/public/thumbnails/frames');
        $this->tempPath = storage_path('app/temp/playwright');
        
        // Ensure directories exist
        $this->ensureDirectories();
    }

    /**
     * Generate thumbnail for a frame with canvas data
     */
    public function generateThumbnail(Frame $frame, array $canvasData = null): ?string
    {
        try {
            // Delete previous thumbnail if exists
            $this->deletePreviousThumbnail($frame);

            // Use provided canvas data or get from frame
            $canvasData = $canvasData ?? $frame->canvas_data ?? [];
            
            // Generate unique filename with timestamp to prevent caching
            $timestamp = time();
            $thumbnailFilename = $frame->uuid . '_' . $timestamp . '.png';
            $thumbnailPath = $this->thumbnailsPath . '/' . $thumbnailFilename;

            // Create HTML from canvas data
            $htmlContent = $this->buildFrameHtml($frame, $canvasData);
            $tempHtmlPath = $this->tempPath . '/frame_' . $frame->uuid . '_' . $timestamp . '.html';
            file_put_contents($tempHtmlPath, $htmlContent);

            // Create Playwright script
            $playwrightScript = $this->createPlaywrightScript($tempHtmlPath, $thumbnailPath, $frame);
            $scriptPath = $this->tempPath . '/playwright_' . $frame->uuid . '_' . $timestamp . '.js';
            file_put_contents($scriptPath, $playwrightScript);
                // === [TERMUX TEMP - REMOTE PLAYWRIGHT] ===
                // Use Browserless.io to generate the thumbnail remotely.
                // This avoids needing Chromium locally (since Termux can't run Playwright browsers).
                
                $browserlessToken = env('BROWSERLESS_TOKEN');
                $browserlessUrl = "https://chrome.browserless.io/screenshot?token={$browserlessToken}";
                
                // Prepare payload for remote screenshot
                $payload = [
                    'url' => 'file://' . $tempHtmlPath,
                    'options' => [
                        'fullPage' => true,
                        'omitBackground' => false
                    ]
                ];
                
                $response = Http::withHeaders(['Content-Type' => 'application/json'])
                    ->post($browserlessUrl, $payload);
                
                // Clean up temporary files after sending to remote service
                if ($response->successful()) {
                    @unlink($tempHtmlPath);
                    @unlink($scriptPath);
                }
                
                if ($response->successful()) {
                    // Save the returned PNG/JPG from Browserless
                    Storage::disk('public')->put('thumbnails/frames/' . $thumbnailFilename, $response->body());
                } else {
                    Log::error('Browserless API failed:', [
                        'frame_id' => $frame->id,
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);
                    return null;
                }
                // === [END TERMUX TEMP - REMOTE PLAYWRIGHT] ===
                
                
                
                // === [PRODUCTION - LOCAL PLAYWRIGHT EXECUTION] ===
                // Uncomment this section when you move to a PC or server that can run Playwright natively.
                /*
                $process = new Process(['node', $scriptPath], null, [
                    'NODE_PATH' => base_path('node_modules')
                ]);
                $process->setTimeout(30); // 30 seconds timeout
                $process->run();
                
                @unlink($tempHtmlPath);
                @unlink($scriptPath);
                
                if (!$process->isSuccessful()) {
                    Log::error('Playwright process failed:', [
                        'frame_id' => $frame->id,
                        'error' => $process->getErrorOutput(),
                        'output' => $process->getOutput()
                    ]);
                    return null;
                }
                */
                // === [END PRODUCTION - LOCAL PLAYWRIGHT EXECUTION] ===

            // Verify thumbnail was created
            if (Storage::disk('public')->exists('thumbnails/frames/' . $thumbnailFilename)) {
                // Update frame settings with new thumbnail path
                $settings = $frame->settings ?? [];
                $settings['thumbnail_generated'] = true;
                $settings['thumbnail_path'] = 'thumbnails/frames/' . $thumbnailFilename;
                $settings['thumbnail_generated_at'] = now()->toISOString();
                $settings['thumbnail_version'] = $timestamp;
                
                $frame->update(['settings' => $settings]);

                // Broadcast thumbnail update to workspace
                if ($frame->project->workspace) {
                    broadcast(new ThumbnailGenerated($frame, $frame->project->workspace));
                }

                Log::info('Thumbnail generated successfully:', [
                    'frame_id' => $frame->id,
                    'thumbnail_path' => $thumbnailPath,
                    'file_size' => filesize($thumbnailPath)
                ]);

                return $thumbnailPath;
            }

            return null;

        } catch (\Exception $e) {
            Log::error('Playwright thumbnail generation failed:', [
                'frame_id' => $frame->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return null;
        }
    }

    /**
     * Generate thumbnail from live canvas state (for real-time updates)
     */
    public function generateThumbnailFromCanvas(Frame $frame, array $canvasComponents, array $canvasSettings = []): ?string
    {
        try {
            $canvasData = [
                'components' => $canvasComponents,
                'settings' => $canvasSettings,
                'viewport' => $canvasSettings['viewport'] ?? ['width' => 1440, 'height' => 900],
                'updated_at' => now()->toISOString()
            ];

            return $this->generateThumbnail($frame, $canvasData);

        } catch (\Exception $e) {
            Log::error('Canvas thumbnail generation failed:', [
                'frame_id' => $frame->id,
                'error' => $e->getMessage()
            ]);
            
            return null;
        }
    }

    /**
     * Build HTML content from canvas data - Enhanced for component rendering
     */
    private function buildFrameHtml(Frame $frame, array $canvasData): string
    {
        $components = $canvasData['components'] ?? [];
        $viewport = $canvasData['viewport'] ?? ['width' => 1440, 'height' => 900];
        $settings = $frame->settings ?? [];
        $backgroundColor = $settings['background_color'] ?? '#ffffff';

        // Generate CSS from components
        $componentStyles = $this->generateComponentStyles($components);
        
        // Generate HTML from components
        $bodyContent = $this->componentsToHtml($components);

        return "<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{$frame->name}</title>
    <script src='https://cdn.tailwindcss.com'></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: {$backgroundColor};
            width: {$viewport['width']}px;
            height: {$viewport['height']}px;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        * {
            box-sizing: border-box;
        }
        {$componentStyles}
        
        /* Responsive canvas styles */
        .canvas-container {
            position: relative;
            width: 100%;
            height: 100%;
            min-height: {$viewport['height']}px;
        }
        
        /* Component positioning */
        .absolute-component {
            position: absolute;
        }
        
        .relative-component {
            position: relative;
            display: block;
            margin-bottom: 1rem;
        }
        
        /* Animation support */
        .animated {
            transition: all 0.3s ease;
        }
        
        /* Ensure text is readable */
        .component-text {
            color: inherit;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class='canvas-container'>
        {$bodyContent}
    </div>
    
    <script>
        // Ensure all fonts and resources are loaded before screenshot
        window.addEventListener('load', function() {
            document.body.setAttribute('data-loaded', 'true');
        });
        
        // Add any necessary JavaScript for component interactivity
        {$this->generateComponentScripts($components)}
    </script>
</body>
</html>";
    }

    /**
     * Convert components to HTML with proper styling
     */
    private function componentsToHtml(array $components): string
    {
        $html = '';
        
        foreach ($components as $component) {
            $html .= $this->renderComponent($component);
        }
        
        return $html;
    }

    /**
     * Render individual component to HTML
     */
    private function renderComponent(array $component): string
    {
        $type = $component['type'] ?? 'div';
        $props = $component['props'] ?? [];
        $style = $component['style'] ?? [];
        $position = $component['position'] ?? null;
        $children = $component['children'] ?? [];
        $name = $component['name'] ?? $type;

        // Determine positioning
        $isAbsolute = isset($position) && ($style['position'] ?? 'static') !== 'static';
        $positionClass = $isAbsolute ? 'absolute-component' : 'relative-component';
        
        // Build style attributes
        $styleAttr = $this->buildStyleAttribute($style, $position);
        
        // Build class attributes
        $classes = [];
        $classes[] = $positionClass;
        $classes[] = 'animated';
        if (isset($props['className'])) {
            $classes[] = $props['className'];
        }
        
        $classAttr = 'class="' . implode(' ', $classes) . '"';
        
        // Handle different component types
        switch ($type) {
            case 'button':
                return "<button {$classAttr} {$styleAttr}>{$this->getComponentText($component)}</button>";
                
            case 'input':
                $inputType = $props['type'] ?? 'text';
                $placeholder = $props['placeholder'] ?? '';
                return "<input type='{$inputType}' placeholder='{$placeholder}' {$classAttr} {$styleAttr} />";
                
            case 'img':
                $src = $props['src'] ?? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudGFsIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZTwvdGV4dD48L3N2Zz4=';
                $alt = $props['alt'] ?? 'Image';
                return "<img src='{$src}' alt='{$alt}' {$classAttr} {$styleAttr} />";
                
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
                return "<{$type} {$classAttr} {$styleAttr}>{$this->getComponentText($component)}</{$type}>";
                
            case 'p':
            case 'span':
                return "<{$type} {$classAttr} {$styleAttr} class='component-text'>{$this->getComponentText($component)}</{$type}>";
                
            default:
                $content = $this->getComponentContent($component);
                return "<{$type} {$classAttr} {$styleAttr}>{$content}</{$type}>";
        }
    }

    /**
     * Build CSS style attribute from component style
     */
    private function buildStyleAttribute(array $style, ?array $position): string
    {
        $styles = [];
        
        // Handle positioning
        if ($position) {
            $styles[] = "left: {$position['x']}px";
            $styles[] = "top: {$position['y']}px";
        }
        
        // Apply component styles
        foreach ($style as $property => $value) {
            if (!empty($value)) {
                $cssProperty = $this->convertToCssProperty($property);
                $styles[] = "{$cssProperty}: {$value}";
            }
        }
        
        return empty($styles) ? '' : 'style="' . implode('; ', $styles) . '"';
    }

    /**
     * Convert camelCase to CSS property
     */
    private function convertToCssProperty(string $property): string
    {
        return strtolower(preg_replace('/([A-Z])/', '-$1', $property));
    }

    /**
     * Get component text content
     */
    private function getComponentText(array $component): string
    {
        if (isset($component['props']['text'])) {
            return htmlspecialchars($component['props']['text']);
        }
        
        if (isset($component['children']) && is_string($component['children'])) {
            return htmlspecialchars($component['children']);
        }
        
        return $component['name'] ?? $component['type'] ?? 'Component';
    }

    /**
     * Get component content (including nested components)
     */
    private function getComponentContent(array $component): string
    {
        $content = $this->getComponentText($component);
        
        // Handle nested components
        if (isset($component['children']) && is_array($component['children'])) {
            foreach ($component['children'] as $child) {
                if (is_array($child)) {
                    $content .= $this->renderComponent($child);
                }
            }
        }
        
        return $content;
    }

    /**
     * Generate component-specific CSS
     */
    private function generateComponentStyles(array $components): string
    {
        $styles = [];
        
        foreach ($components as $component) {
            if (isset($component['id'])) {
                $componentId = $component['id'];
                $style = $component['style'] ?? [];
                
                if (!empty($style)) {
                    $cssRules = [];
                    foreach ($style as $property => $value) {
                        $cssProperty = $this->convertToCssProperty($property);
                        $cssRules[] = "  {$cssProperty}: {$value};";
                    }
                    
                    if (!empty($cssRules)) {
                        $styles[] = "#{$componentId} {\n" . implode("\n", $cssRules) . "\n}";
                    }
                }
            }
        }
        
        return implode("\n\n", $styles);
    }

    /**
     * Generate component-specific JavaScript
     */
    private function generateComponentScripts(array $components): string
    {
        $scripts = [];
        
        foreach ($components as $component) {
            if (isset($component['animation']) && !empty($component['animation'])) {
                $componentId = $component['id'] ?? '';
                if ($componentId) {
                    $scripts[] = "// Animation for {$componentId}";
                    // Add animation scripts here if needed
                }
            }
        }
        
        return implode("\n", $scripts);
    }

    /**
     * Create enhanced Playwright script
     */
    private function createPlaywrightScript(string $htmlPath, string $thumbnailPath, Frame $frame): string
    {
        $canvasData = $frame->canvas_data ?? [];
        $viewport = $canvasData['viewport'] ?? ['width' => 1440, 'height' => 900];
        $settings = $frame->settings ?? [];
        
        // Responsive mode detection
        $responsiveMode = $settings['responsive_mode'] ?? 'desktop';
        $deviceConfig = $this->getDeviceConfig($responsiveMode);

        return "
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    let browser;
    try {
        // Launch browser with optimized settings
        browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-first-run',
                '--disable-extensions',
                '--disable-default-apps'
            ]
        });
        
        const context = await browser.newContext({
            viewport: {$deviceConfig['viewport']},
            deviceScaleFactor: {$deviceConfig['deviceScaleFactor']},
            userAgent: '{$deviceConfig['userAgent']}'
        });
        
        const page = await context.newPage();
        
        // Navigate to the HTML file
        await page.goto('file://{$htmlPath}', { waitUntil: 'networkidle' });
        
        // Wait for content to load and fonts to render
        await page.waitForSelector('body[data-loaded=\"true\"]', { timeout: 10000 });
        await page.waitForTimeout(1000);
        
        // Ensure the thumbnail directory exists
        const thumbnailDir = path.dirname('{$thumbnailPath}');
        if (!fs.existsSync(thumbnailDir)) {
            fs.mkdirSync(thumbnailDir, { recursive: true });
        }
        
        // Take screenshot with optimized settings
        await page.screenshot({
            path: '{$thumbnailPath}',
            type: 'png',
            quality: 90,
            fullPage: false,
            clip: {
                x: 0,
                y: 0,
                width: {$viewport['width']},
                height: {$viewport['height']}
            },
            animations: 'disabled'
        });
        
        console.log('Thumbnail generated successfully: {$thumbnailPath}');
        
    } catch (error) {
        console.error('Playwright error:', error.message);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();
        ";
    }

    /**
     * Get device configuration for responsive modes
     */
    private function getDeviceConfig(string $responsiveMode): array
    {
        $configs = [
            'desktop' => [
                'viewport' => '{ width: 1440, height: 900 }',
                'deviceScaleFactor' => '1',
                'userAgent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            ],
            'tablet' => [
                'viewport' => '{ width: 768, height: 1024 }',
                'deviceScaleFactor' => '2',
                'userAgent' => 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
            ],
            'mobile' => [
                'viewport' => '{ width: 375, height: 667 }',
                'deviceScaleFactor' => '2',
                'userAgent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
            ]
        ];
        
        return $configs[$responsiveMode] ?? $configs['desktop'];
    }

    /**
     * Delete previous thumbnail to prevent storage buildup
     */
    private function deletePreviousThumbnail(Frame $frame): void
    {
        try {
            $settings = $frame->settings ?? [];
            if (isset($settings['thumbnail_path'])) {
                $fullPath = storage_path('app/public/' . $settings['thumbnail_path']);
                if (file_exists($fullPath)) {
                    unlink($fullPath);
                    Log::info('Deleted previous thumbnail:', ['path' => $fullPath]);
                }
            }
        } catch (\Exception $e) {
            Log::warning('Failed to delete previous thumbnail:', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Ensure required directories exist
     */
    private function ensureDirectories(): void
    {
        $directories = [
            $this->thumbnailsPath,
            $this->tempPath
        ];
        
        foreach ($directories as $directory) {
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }
        }
    }

    /**
     * Clean up old temporary files
     */
    public function cleanupTempFiles(): int
    {
        $cleaned = 0;
        $cutoff = time() - (3600); // 1 hour old
        
        if (is_dir($this->tempPath)) {
            $files = glob($this->tempPath . '/*');
            foreach ($files as $file) {
                if (is_file($file) && filemtime($file) < $cutoff) {
                    unlink($file);
                    $cleaned++;
                }
            }
        }
        
        return $cleaned;
    }

    /**
     * Check if Playwright is installed and available
     */
    public function checkPlaywrightAvailability(): bool
    {
        try {
            $process = new Process(['node', '-e', 'require("playwright")'], null, [
                'NODE_PATH' => base_path('node_modules')
            ]);
            $process->run();
            return $process->isSuccessful();
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Generate thumbnail URL with cache busting
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