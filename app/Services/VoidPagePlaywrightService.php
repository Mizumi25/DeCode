<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;
use Illuminate\Support\Facades\Http;

/**
 * Playwright-powered VoidPage thumbnail generation service
 * Captures the entire VoidPage (all frames in infinite canvas) using Playwright
 * with fallback to frontend canvas capture
 */
class VoidPagePlaywrightService
{
    private string $playwrightPath;
    private string $thumbnailsPath;
    private string $tempPath;
    private bool $useRemoteBrowser;

    public function __construct()
    {
        $this->playwrightPath = base_path('node_modules/.bin/playwright');
        $this->thumbnailsPath = storage_path('app/public/thumbnails/projects');
        $this->tempPath = storage_path('app/temp/playwright');
        
        // Only use remote browser if token is set and not empty
        $token = env('BROWSERLESS_TOKEN');
        $this->useRemoteBrowser = !empty($token) && strlen(trim($token)) > 0;
        
        $this->ensureDirectories();
    }

    /**
     * Generate VoidPage thumbnail using Playwright
     * 
     * @param Project $project
     * @param array $options - width, height, scale, quality
     * @return string|null - Path to generated thumbnail
     */
    public function generateVoidPageThumbnail(Project $project, array $options = []): ?string
    {
        try {
            $width = $options['width'] ?? 1600;
            $height = $options['height'] ?? 1000;
            $quality = $options['quality'] ?? 90;
            $waitTime = $options['wait_time'] ?? 3000; // Wait for frames to load
            
            Log::info('🎬 Starting Playwright VoidPage thumbnail generation', [
                'project_id' => $project->uuid,
                'project_name' => $project->name,
                'dimensions' => "{$width}x{$height}",
                'use_remote' => $this->useRemoteBrowser
            ]);

            // Delete previous thumbnail
            $this->deletePreviousThumbnail($project);

            // Generate unique filename
            $timestamp = time();
            $thumbnailFilename = 'project_' . $project->uuid . '_' . $timestamp . '.png';
            $thumbnailPath = $this->thumbnailsPath . '/' . $thumbnailFilename;

            // Build the VoidPage URL
            $voidPageUrl = url("/void/{$project->uuid}");
            
            Log::info('📍 VoidPage URL', ['url' => $voidPageUrl]);

            if ($this->useRemoteBrowser) {
                // Try Browserless.io for remote rendering
                Log::info('🌐 Attempting Browserless.io remote rendering');
                $success = $this->generateWithBrowserless($voidPageUrl, $thumbnailPath, $width, $height, $quality, $waitTime);
                
                // If Browserless fails, fall back to local Playwright
                if (!$success) {
                    Log::warning('⚠️ Browserless.io failed, falling back to local Playwright');
                    $success = $this->generateWithLocalPlaywright($voidPageUrl, $thumbnailPath, $width, $height, $quality, $waitTime);
                }
            } else {
                // Use local Playwright
                Log::info('🖥️ Using local Playwright (Browserless.io not configured)');
                $success = $this->generateWithLocalPlaywright($voidPageUrl, $thumbnailPath, $width, $height, $quality, $waitTime);
            }

            if ($success && file_exists($thumbnailPath)) {
                // Update project with new thumbnail
                $relativePath = 'thumbnails/projects/' . $thumbnailFilename;
                $project->update([
                    'thumbnail' => $relativePath,
                    'thumbnail_method' => $this->useRemoteBrowser ? 'playwright_remote' : 'playwright_local',
                    'thumbnail_updated_at' => now()
                ]);

                Log::info('✅ VoidPage thumbnail generated successfully!', [
                    'project_id' => $project->uuid,
                    'path' => $relativePath,
                    'size' => filesize($thumbnailPath) . ' bytes'
                ]);

                return $thumbnailPath;
            }

            Log::warning('⚠️ Playwright thumbnail generation failed, no file created');
            return null;

        } catch (\Exception $e) {
            Log::error('❌ Playwright VoidPage thumbnail generation failed', [
                'project_id' => $project->uuid,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return null;
        }
    }

    /**
     * Generate thumbnail using Browserless.io remote service
     */
    private function generateWithBrowserless(string $url, string $outputPath, int $width, int $height, int $quality, int $waitTime): bool
    {
        try {
            $browserlessToken = env('BROWSERLESS_TOKEN');
            $browserlessUrl = "https://chrome.browserless.io/screenshot?token={$browserlessToken}";
            
            Log::info('🌐 Using Browserless.io for remote rendering');

            // Create Playwright script for Browserless
            $script = $this->createBrowserlessScript($url, $width, $height, $waitTime);

            $payload = [
                'code' => $script,
                'context' => [
                    'viewport' => [
                        'width' => $width,
                        'height' => $height,
                        'deviceScaleFactor' => 2
                    ]
                ]
            ];

            $response = Http::timeout(60)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($browserlessUrl, $payload);

            if ($response->successful()) {
                Storage::disk('public')->put('thumbnails/projects/' . basename($outputPath), $response->body());
                Log::info('✅ Browserless screenshot saved');
                return true;
            }

            Log::error('❌ Browserless API failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            
            return false;

        } catch (\Exception $e) {
            Log::error('❌ Browserless generation failed', [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Generate thumbnail using local Playwright installation
     */
    private function generateWithLocalPlaywright(string $url, string $outputPath, int $width, int $height, int $quality, int $waitTime): bool
    {
        try {
            Log::info('🖥️ Using local Playwright');

            // Get auth bypass token
            $authToken = $this->generateAuthBypassToken();

            // Create Playwright script (use .cjs extension for CommonJS in ES module project)
            $playwrightScript = $this->createPlaywrightScript($url, $outputPath, $width, $height, $quality, $waitTime, $authToken);
            $scriptPath = $this->tempPath . '/void_playwright_' . time() . '.cjs';
            file_put_contents($scriptPath, $playwrightScript);

            // Execute Playwright
            $process = new Process(['node', $scriptPath], null, [
                'NODE_PATH' => base_path('node_modules')
            ]);
            $process->setTimeout(60); // 60 seconds timeout
            $process->run();

            // Cleanup script
            @unlink($scriptPath);

            if (!$process->isSuccessful()) {
                Log::error('❌ Playwright process failed', [
                    'error' => $process->getErrorOutput(),
                    'output' => $process->getOutput()
                ]);
                return false;
            }

            Log::info('✅ Local Playwright screenshot captured');
            return true;

        } catch (\Exception $e) {
            Log::error('❌ Local Playwright generation failed', [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Generate a special token to bypass authentication for Playwright
     */
    private function generateAuthBypassToken(): string
    {
        // Use a special header that we can check in middleware
        // For now, we'll use a simple token stored in env
        return env('PLAYWRIGHT_AUTH_TOKEN', 'playwright_' . md5(env('APP_KEY')));
    }

    /**
     * Create Playwright script for capturing VoidPage
     */
    private function createPlaywrightScript(string $url, string $outputPath, int $width, int $height, int $quality, int $waitTime, string $authToken = ''): string
    {
        return <<<JS
const { chromium } = require('playwright');

(async () => {
    let browser;
    try {
        console.log('🚀 Launching Playwright browser...');
        
        browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });
        
        const context = await browser.newContext({
            viewport: { width: {$width}, height: {$height} },
            deviceScaleFactor: 2,
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        });
        
        const page = await context.newPage();
        
        // Set auth bypass header for Playwright
        await page.setExtraHTTPHeaders({
            'X-Playwright-Auth': '{$authToken}'
        });
        
        console.log('🌐 Navigating to VoidPage:', '{$url}');
        console.log('🔑 Using auth bypass token');
        
        await page.goto('{$url}', { 
            waitUntil: 'domcontentloaded',
            timeout: 60000  // Increased to 60 seconds
        });
        
        console.log('⏳ Waiting {$waitTime}ms for frames to load...');
        await page.waitForTimeout({$waitTime});
        
        // Wait for canvas element (increase timeout for heavy pages)
        try {
            await page.waitForSelector('[data-canvas="true"]', { timeout: 15000 });
        } catch (e) {
            console.log('⚠️ Canvas selector timeout, taking screenshot anyway...');
        }
        
        // Hide UI elements we don't want in thumbnail
        await page.evaluate(() => {
            // Hide header, panels, toolbox, grid, etc.
            const selectorsToHide = [
                'header',
                'nav',
                '[class*="Header"]',
                '[class*="Panel"]',
                '[class*="Toolbox"]',
                '[class*="FloatingToolbox"]',
                '[class*="DeleteButton"]',
                '[class*="InfiniteGrid"]',
                '.header',
                '.panel',
                '.floating-toolbox'
            ];
            
            selectorsToHide.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    el.style.display = 'none';
                });
            });
        });
        
        console.log('📸 Taking screenshot...');
        await page.screenshot({
            path: '{$outputPath}',
            type: 'png',
            fullPage: false,
            clip: { x: 0, y: 0, width: {$width}, height: {$height} }
        });
        
        console.log('✅ Screenshot saved successfully!');
        
    } catch (error) {
        console.error('❌ Playwright error:', error.message);
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
     * Create script for Browserless.io
     */
    private function createBrowserlessScript(string $url, int $width, int $height, int $waitTime): string
    {
        return <<<JS
const { chromium } = require('playwright-core');

module.exports = async ({ page, context }) => {
    console.log('🌐 Navigating to VoidPage');
    await page.goto('{$url}', { waitUntil: 'networkidle', timeout: 30000 });
    
    console.log('⏳ Waiting for content to load...');
    await page.waitForTimeout({$waitTime});
    
    await page.waitForSelector('[data-canvas="true"]', { timeout: 10000 });
    
    // Hide UI elements
    await page.evaluate(() => {
        const selectorsToHide = [
            'header', 'nav',
            '[class*="Header"]', '[class*="Panel"]',
            '[class*="Toolbox"]', '[class*="FloatingToolbox"]',
            '[class*="DeleteButton"]', '[class*="InfiniteGrid"]'
        ];
        
        selectorsToHide.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.style.display = 'none';
            });
        });
    });
    
    console.log('📸 Taking screenshot');
    return await page.screenshot({ 
        type: 'png',
        fullPage: false,
        clip: { x: 0, y: 0, width: {$width}, height: {$height} }
    });
};
JS;
    }

    /**
     * Check if Playwright is available
     */
    public function checkPlaywrightAvailability(): bool
    {
        if ($this->useRemoteBrowser) {
            return true; // Browserless.io is always available if token is set
        }

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
     * Delete previous project thumbnail
     */
    private function deletePreviousThumbnail(Project $project): void
    {
        try {
            if ($project->thumbnail) {
                $fullPath = storage_path('app/public/' . $project->thumbnail);
                if (file_exists($fullPath)) {
                    unlink($fullPath);
                    Log::info('🗑️ Deleted previous project thumbnail', ['path' => $project->thumbnail]);
                }
            }
        } catch (\Exception $e) {
            Log::warning('⚠️ Failed to delete previous thumbnail', ['error' => $e->getMessage()]);
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
     * Get thumbnail URL with cache busting
     */
    public function getThumbnailUrl(Project $project): ?string
    {
        if (!$project->thumbnail) {
            return null;
        }
        
        $version = $project->thumbnail_updated_at ? $project->thumbnail_updated_at->timestamp : time();
        return asset('storage/' . $project->thumbnail . '?v=' . $version);
    }
}
