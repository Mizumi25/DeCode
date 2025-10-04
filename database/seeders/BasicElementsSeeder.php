<?php
// database/seeders/BasicElementsSeeder.php - INTERACTIVE ELEMENTS
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class BasicElementsSeeder extends Seeder
{
    public function run(): void
    {
        $basicElements = [
            // BUTTON - Main interactive element
            [
                'name' => 'Button',
                'type' => 'button',
                'component_type' => 'element',
                'category' => 'interactive', // MOVED from layout to interactive
                'alphabet_group' => 'B',
                'description' => 'Interactive button element with multiple styles and animations',
                'icon' => 'Square',
                'default_props' => [
                    'text' => 'Click me',
                    'variant' => 'primary',
                    'size' => 'md',
                    'disabled' => false,
                    'display' => 'inline-flex', // ADD THIS
                    'width' => 'fit-content', // ADD THIS
                ],
                'prop_definitions' => [
                    'text' => ['type' => 'string', 'label' => 'Button Text', 'default' => 'Click me'],
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['primary', 'secondary', 'success', 'warning', 'danger', 'ghost', 'gradient', 'neon', 'glass'], 'default' => 'primary'],
                    'size' => ['type' => 'select', 'label' => 'Size', 'options' => ['xs', 'sm', 'md', 'lg', 'xl'], 'default' => 'md'],
                    'disabled' => ['type' => 'boolean', 'label' => 'Disabled', 'default' => false]
                ],
                'render_template' => 'button-template',
                'code_generators' => ['react-tailwind' => 'templates/interactive/button.js'],
                'variants' => [
                    [
                        'name' => 'Primary Button',
                        'description' => 'Standard primary action button',
                        'props' => ['text' => 'Get Started', 'variant' => 'primary', 'size' => 'md'],
                        'preview_code' => '<button class="inline-flex items-center justify-center px-6 py-2.5 text-base font-medium rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg hover:shadow-xl transition-all duration-200">Get Started</button>'
                    ],
                    [
                        'name' => 'Ghost Button',
                        'description' => 'Transparent button with border effect',
                        'props' => ['text' => 'Learn More', 'variant' => 'ghost', 'size' => 'md'],
                        'preview_code' => '<button class="inline-flex items-center justify-center px-6 py-2.5 text-base font-medium rounded-lg bg-transparent text-purple-600 hover:bg-purple-50 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 border border-transparent hover:border-purple-200 transition-all duration-200">Learn More</button>'
                    ],
                    [
                        'name' => 'Gradient Button',
                        'description' => 'Eye-catching gradient button with hover effects',
                        'props' => ['text' => 'Gradient Magic', 'variant' => 'gradient', 'size' => 'lg'],
                        'preview_code' => '<button class="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">Gradient Magic</button>'
                    ],
                    [
                        'name' => 'Neon Button',
                        'description' => 'Futuristic neon glow button',
                        'props' => ['text' => 'Neon Glow', 'variant' => 'neon', 'size' => 'lg'],
                        'preview_code' => '<button class="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg bg-black border-2 border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-400/50 hover:shadow-cyan-400/75 transition-all duration-200">Neon Glow</button>'
                    ],
                    [
                        'name' => 'Glass Button',
                        'description' => 'Modern glassmorphism button',
                        'props' => ['text' => 'Glass Effect', 'variant' => 'glass', 'size' => 'md'],
                        'preview_code' => '<button class="inline-flex items-center justify-center px-6 py-2.5 text-base font-medium rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xl hover:bg-white/25 transition-all duration-200">Glass Effect</button>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 1
            ],

            // INPUT - Text input field
            [
                'name' => 'Text Input',
                'type' => 'input',
                'component_type' => 'element',
                'category' => 'interactive',
                'alphabet_group' => 'I',
                'description' => 'Text input field with validation states',
                'icon' => 'Type',
                'default_props' => [
                    'type' => 'text',
                    'placeholder' => 'Enter text...',
                    'size' => 'md',
                    'variant' => 'default',
                    'required' => false,
                    'disabled' => false
                ],
                'prop_definitions' => [
                    'type' => ['type' => 'select', 'label' => 'Input Type', 'options' => ['text', 'email', 'password', 'tel', 'url'], 'default' => 'text'],
                    'placeholder' => ['type' => 'string', 'label' => 'Placeholder', 'default' => 'Enter text...'],
                    'size' => ['type' => 'select', 'label' => 'Size', 'options' => ['sm', 'md', 'lg'], 'default' => 'md'],
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['default', 'error', 'success'], 'default' => 'default']
                ],
                'render_template' => 'input-template',
                'code_generators' => ['react-tailwind' => 'templates/interactive/input.js'],
                'variants' => [
                    [
                        'name' => 'Standard Input',
                        'description' => 'Clean standard text input',
                        'props' => ['placeholder' => 'Enter your email', 'type' => 'email', 'size' => 'md'],
                        'preview_code' => '<input class="block w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-colors duration-200" type="email" placeholder="Enter your email" />'
                    ],
                    [
                        'name' => 'Glass Input',
                        'description' => 'Modern glass morphism input',
                        'props' => ['placeholder' => 'Glass input', 'variant' => 'glass', 'size' => 'lg'],
                        'preview_code' => '<input class="block w-full px-4 py-3 text-lg bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl placeholder-white/70 focus:bg-white/25 transition-all duration-200" placeholder="Glass input" />'
                    ],
                    [
                        'name' => 'Floating Label',
                        'description' => 'Input with floating label animation',
                        'props' => ['variant' => 'floating', 'placeholder' => 'Email', 'size' => 'md'],
                        'preview_code' => '<div class="relative"><input class="peer w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 placeholder-transparent" placeholder="Email" /><label class="absolute left-4 -top-2.5 text-sm text-blue-600 bg-white px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">Email</label></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 2
            ],

            // TOGGLE SWITCH
            [
                'name' => 'Toggle Switch',
                'type' => 'toggle',
                'component_type' => 'element',
                'category' => 'interactive',
                'alphabet_group' => 'T',
                'description' => 'On/off toggle switch with smooth animations',
                'icon' => 'ToggleLeft',
                'default_props' => [
                    'checked' => false,
                    'size' => 'md',
                    'color' => 'blue',
                    'disabled' => false,
                    'display' => 'inline-flex', 
                    'width' => 'fit-content',
                ],
                'prop_definitions' => [
                    'checked' => ['type' => 'boolean', 'label' => 'Checked', 'default' => false],
                    'size' => ['type' => 'select', 'label' => 'Size', 'options' => ['sm', 'md', 'lg'], 'default' => 'md'],
                    'color' => ['type' => 'select', 'label' => 'Color', 'options' => ['blue', 'green', 'purple', 'pink'], 'default' => 'blue']
                ],
                'render_template' => 'toggle-template',
                'code_generators' => ['react-tailwind' => 'templates/interactive/toggle.js'],
                'variants' => [
                    [
                        'name' => 'Standard Toggle',
                        'description' => 'Clean toggle switch',
                        'props' => ['checked' => false, 'size' => 'md', 'color' => 'blue'],
                        'preview_code' => '<button class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"><span class="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out translate-x-1"></span></button>'
                    ],
                    [
                        'name' => 'Checked Toggle',
                        'description' => 'Toggle in checked state',
                        'props' => ['checked' => true, 'size' => 'md', 'color' => 'green'],
                        'preview_code' => '<button class="relative inline-flex h-6 w-11 items-center rounded-full bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"><span class="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out translate-x-6"></span></button>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 3
            ]
        ];

        foreach ($basicElements as $element) {
            Component::create($element);
        }
    }
}