<?php

namespace App\Services;

use App\Models\Frame;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

/**
 * Future implementation for generating frame thumbnails using Playwright
 * 
 * This service will use Playwright to render actual HTML/CSS/JS content
 * and generate high-quality thumbnails for frames.
 */
class PlaywrightThumbnailService
{
    private string $playwrightPath;
    private string $thumbnailsPath;

    public function __construct()
    {
        $this->playwrightPath = base_path('node_modules/.bin/playwright');
        $this->thumbnailsPath = storage_path('app/public/thumbnails/frames');
        
        // Ensure thumbnails directory exists
        if (!file_exists($this->thumbnailsPath)) {
            mkdir($this->thumbnailsPath, 0755, true);
        }
    }

    /**
     * Generate thumbnail for a frame using Playwright
     */
    public function generateThumbnail(Frame $frame): ?string
    {
        try {
            // Create temporary HTML file with frame content
            $htmlContent = $this->buildFrameHtml($frame);
            $tempHtmlPath = tempnam(sys_get_temp_dir(), 'frame_') . '.html';
            file_put_contents($tempHtmlPath, $htmlContent);

            // Generate thumbnail filename
            $thumbnailFilename = $frame->uuid . '.png';
            $thumbnailPath = $this->thumbnailsPath . '/' . $thumbnailFilename;

            // Create Node.js script for Playwright
            $playwrightScript = $this->createPlaywrightScript($tempHtmlPath, $thumbnailPath, $frame);
            $scriptPath = tempnam(sys_get_temp_dir(), 'playwright_') . '.js';
            file_put_contents($scriptPath, $playwrightScript);

            // Execute Playwright script
            $process = new Process(['node', $scriptPath]);
            $process->setTimeout(60); // 60 seconds timeout
            $process->run();

            // Clean up temporary files
            unlink($tempHtmlPath);
            unlink($scriptPath);

            if (!$process->isSuccessful()) {
                throw new ProcessFailedException($process);
            }

            // Verify thumbnail was created
            if (file_exists($thumbnailPath)) {
                // Update frame settings with thumbnail path
                $settings = $frame->settings ?? [];
                $settings['thumbnail_generated'] = true;
                $settings['thumbnail_path'] = 'thumbnails/frames/' . $thumbnailFilename;
                $settings['thumbnail_generated_at'] = now()->toISOString();
                
                $frame->update(['settings' => $settings]);

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
     * Build HTML content from frame data
     */
    private function buildFrameHtml(Frame $frame): string
    {
        $canvasData = $frame->canvas_data ?? [];
        $elements = $canvasData['elements'] ?? [];
        $viewport = $canvasData['viewport'] ?? ['width' => 1440, 'height' => 900];
        $settings = $frame->settings ?? [];

        // Convert frame elements to HTML
        $bodyContent = $this->elementsToHtml($elements);
        
        // Get background color from settings
        $backgroundColor = $settings['background_color'] ?? '#ffffff';

        return "
        <!DOCTYPE html>
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
                }
                * {
                    box-sizing: border-box;
                }
            </style>
        </head>
        <body>
            {$bodyContent}
        </body>
        </html>";
    }

    /**
     * Convert frame elements to HTML recursively
     */
    private function elementsToHtml(array $elements): string
    {
        $html = '';
        
        foreach ($elements as $element) {
            $tag = $element['type'] ?? 'div';
            $props = $element['props'] ?? [];
            $children = $element['children'] ?? [];
            
            // Build attributes
            $attributes = [];
            foreach ($props as $key => $value) {
                if ($key === 'className') {
                    $attributes[] = "class=\"{$value}\"";
                } else {
                    $attributes[] = "{$key}=\"{$value}\"";
                }
            }
            
            $attributeString = implode(' ', $attributes);
            
            // Handle children
            if (is_string($children)) {
                // Text content
                $html .= "<{$tag} {$attributeString}>{$children}</{$tag}>";
            } elseif (is_array($children)) {
                // Nested elements
                $childrenHtml = $this->elementsToHtml($children);
                $html .= "<{$tag} {$attributeString}>{$childrenHtml}</{$tag}>";
            } else {
                // Self-closing or empty element
                $html .= "<{$tag} {$attributeString}></{$tag}>";
            }
        }
        
        return $html;
    }

    /**
     * Create Playwright script for screenshot generation
     */
    private function createPlaywrightScript(string $htmlPath, string $thumbnailPath, Frame $frame): string
    {
        $canvasData = $frame->canvas_data ?? [];
        $viewport = $canvasData['viewport'] ?? ['width' => 1440, 'height' => 900];

        return "
        const { chromium } = require('playwright');

        (async () => {
            const browser = await chromium.launch();
            const page = await browser.newPage();
            
            // Set viewport size
            await page.setViewportSize({
                width: {$viewport['width']},
                height: {$viewport['height']}
            });
            
            // Navigate to the HTML file
            await page.goto('file://{$htmlPath}');
            
            // Wait for content to load
            await page.waitForTimeout(2000);
            
            // Take screenshot
            await page.screenshot({
                path: '{$thumbnailPath}',
                fullPage: true,
                type: 'png'
            });
            
            await browser.close();
        })();
        ";
    }

    /**
     * Regenerate thumbnails for all frames in a project
     */
    public function regenerateProjectThumbnails(int $projectId): array
    {
        $frames = Frame::where('project_id', $projectId)->get();
        $results = [];
        
        foreach ($frames as $frame) {
            $thumbnailPath = $this->generateThumbnail($frame);
            $results[] = [
                'frame_id' => $frame->id,
                'frame_name' => $frame->name,
                'success' => $thumbnailPath !== null,
                'thumbnail_path' => $thumbnailPath
            ];
        }
        
        return $results;
    }

    /**
     * Delete thumbnail file for a frame
     */
    public function deleteThumbnail(Frame $frame): bool
    {
        $settings = $frame->settings ?? [];
        if (!isset($settings['thumbnail_path'])) {
            return true; // No thumbnail to delete
        }
        
        $fullPath = storage_path('app/public/' . $settings['thumbnail_path']);
        if (file_exists($fullPath)) {
            return unlink($fullPath);
        }
        
        return true;
    }

    /**
     * Check if Playwright is installed and available
     */
    public function checkPlaywrightAvailability(): bool
    {
        try {
            $process = new Process(['node', '-e', 'require("playwright")']);
            $process->run();
            return $process->isSuccessful();
        } catch (\Exception $e) {
            return false;
        }
    }
}";