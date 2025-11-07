<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class TextPseudoElementSeeder extends Seeder
{
    public function run(): void
    {
        $pseudoTextElement = [
            // ============================================
            // TEXT NODE - PSEUDO ELEMENT
            // ============================================
            [
                'name' => 'Text Node',
                'type' => 'text-node',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'T',
                'description' => 'Text Node no wrapper',
                'icon' => 'Type',
                'default_props' => [
                    'content' => 'Text',
                    'editable' => true,
                    'isPseudoElement' => true,
                    'hasWrapper' => false,
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Text Content', 'default' => 'Text', 'description' => 'Pure text - no HTML tags'],
                ],
                'render_template' => 'text-node-pseudo',
                'code_generators' => ['react-tailwind' => 'templates/typography/text-node.js'],
                'variants' => [
                    [
                        'name' => 'Simple Text',
                        'description' => 'Plain text (no wrapper)',
                        'props' => ['content' => 'Hello World'],
                        'style' => [
                            'fontSize' => '16px',
                            'color' => '#111827',
                        ],
                        'preview_code' => '<span style="font-size: 16px; color: #111827;">Hello World</span>'
                    ],
                    [
                        'name' => 'Bold Text',
                        'description' => 'Bold text node',
                        'props' => ['content' => 'Bold Text'],
                        'style' => [
                            'fontSize' => '16px',
                            'fontWeight' => '700',
                            'color' => '#111827',
                        ],
                        'preview_code' => '<span style="font-size: 16px; font-weight: 700; color: #111827;">Bold Text</span>'
                    ],
                    [
                        'name' => 'Gradient Text',
                        'description' => 'Text with gradient',
                        'props' => ['content' => 'Gradient'],
                        'style' => [
                            'fontSize' => '20px',
                            'fontWeight' => '700',
                            'background' => 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                            'WebkitBackgroundClip' => 'text',
                            'WebkitTextFillColor' => 'transparent',
                            'backgroundClip' => 'text',
                        ],
                        'preview_code' => '<span style="font-size: 20px; font-weight: 700; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Gradient</span>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 1
            ],
        ];

        foreach ($pseudoTextElement as $element) {
            Component::create($element);
        }
    }
}