<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class TextPseudoElementSeeder extends Seeder
{
    public function run(): void
    {
        $pseudoTextElement = [
            // TEXT NODE - Special pseudo-element (NO WRAPPER)
            [
                'name' => 'Text Node',
                'type' => 'text-node',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'T',
                'description' => '⚠️ PSEUDO ELEMENT: Pure text content without any HTML wrapper',
                'icon' => 'Type',
                'default_props' => [
                    'content' => '',
                    'editable' => true,
                    'isPseudoElement' => true, // ✅ FLAG
                    'hasWrapper' => false,     // ✅ FLAG
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Text Content', 'default' => '', 'description' => 'Pure text - no HTML tags'],
                ],
                'render_template' => 'text-node-pseudo',
                'code_generators' => ['react-tailwind' => 'templates/typography/text-node.js'],
                'variants' => [
                    [
                        'name' => 'Simple Text',
                        'description' => 'Plain text (no wrapper)',
                        'props' => ['content' => 'Hello World'],
                        'preview_code' => 'Hello World' // ✅ NO TAGS
                    ],
                    [
                        'name' => 'Multi-line Text',
                        'description' => 'Text with line breaks',
                        'props' => ['content' => "First line\nSecond line"],
                        'preview_code' => "First line\nSecond line" // ✅ NO TAGS
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