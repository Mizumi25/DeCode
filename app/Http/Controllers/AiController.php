<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;
use App\Models\Component;

class AiController extends Controller
{
    public function generateTemplate(Request $request)
    {
        $client = new Client();
        $apiKey = env('OPENROUTER_API_KEY');

        $userPrompt = $request->input('prompt');
        $frameId = $request->input('frame_id');
        $projectId = $request->input('project_id');

        // Get all available components from database
        $availableComponents = Component::where('is_active', true)
            ->select('id', 'name', 'type', 'category', 'description', 'variants')
            ->get()
            ->map(function($component) {
                return [
                    'type' => $component->type,
                    'name' => $component->name,
                    'category' => $component->category,
                    'description' => $component->description,
                    'variants' => $component->variants ? array_column($component->variants, 'name') : []
                ];
            })
            ->toArray();

        $componentsListText = $this->formatComponentsList($availableComponents);

        $systemPrompt = "You are a UI template generator AI. You can ONLY use components from the provided list below. 
        
AVAILABLE COMPONENTS:
{$componentsListText}

IMPORTANT RULES:
1. Only use components from the list above - do NOT create new component types
2. If a requested element doesn't match any available component, skip it
3. Use appropriate variants when available (e.g., 'primary', 'secondary', 'large', 'small')
4. Apply styling through the 'style' property using CSS-in-JS format
5. Output ONLY valid JSON in this exact format:

{
  \"components\": [
    {
      \"type\": \"component-type-from-list\",
      \"name\": \"descriptive-name\",
      \"variant\": \"variant-name-if-applicable\",
      \"props\": {},
      \"style\": {
        \"property\": \"value\"
      },
      \"zIndex\": 0,
      \"sortOrder\": 0
    }
  ]
}

Do not include any explanation or markdown - just the JSON.";

        try {
            $response = $client->post('https://openrouter.ai/api/v1/chat/completions', [
                'headers' => [
                    'Authorization' => "Bearer $apiKey",
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'model' => 'openai/gpt-3.5-turbo',
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $userPrompt],
                    ],
                    'temperature' => 0.7,
                ]
            ]);

            $body = json_decode($response->getBody()->getContents(), true);
            
            \Log::info('AI API Response:', [
                'status' => $response->getStatusCode(),
                'body' => $body
            ]);
            
            $generated = $body['choices'][0]['message']['content'] ?? '';
            
            if (empty($generated)) {
                \Log::warning('AI generated empty output', [
                    'response_body' => $body,
                    'prompt' => $userPrompt
                ]);
            }

            return response()->json([
                'ai_output' => $generated,
                'available_components_count' => count($availableComponents),
                'frame_id' => $frameId,
                'project_id' => $projectId,
                'debug' => [
                    'has_api_key' => !empty($apiKey),
                    'components_sent' => count($availableComponents),
                    'response_status' => $response->getStatusCode()
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('AI generation error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'ai_output' => '',
                'error' => $e->getMessage(),
                'available_components_count' => count($availableComponents),
                'frame_id' => $frameId,
                'project_id' => $projectId
            ], 500);
        }
    }

    private function formatComponentsList($components)
    {
        $formatted = [];
        foreach ($components as $component) {
            $variantsText = !empty($component['variants']) 
                ? ' (Variants: ' . implode(', ', $component['variants']) . ')' 
                : '';
            $formatted[] = "- {$component['type']}: {$component['name']} - {$component['description']}{$variantsText}";
        }
        return implode("\n", $formatted);
    }
}
