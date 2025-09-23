<?php
// database/seeders/FormComponentSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class FormComponentSeeder extends Seeder
{
    public function run(): void
    {
        $formComponents = [
            // FORM ELEMENTS
            [
                'name' => 'Text Input',
                'type' => 'text-input',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'T',
                'description' => 'Standard text input field with validation',
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
                'render_template' => 'text-input-template',
                'code_generators' => ['react-tailwind' => 'templates/forms/text-input.js'],
                'variants' => [
                    [
                        'name' => 'Glass Input',
                        'description' => 'Modern glass morphism input',
                        'props' => ['variant' => 'glass', 'size' => 'lg'],
                        'preview_code' => '<input class="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-3 rounded-xl placeholder-white/70" placeholder="Glass Input" />'
                    ],
                    [
                        'name' => 'Floating Label',
                        'description' => 'Input with floating label animation',
                        'props' => ['variant' => 'floating', 'size' => 'md'],
                        'preview_code' => '<div class="relative"><input class="peer w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 placeholder-transparent" placeholder="Email" /><label class="absolute left-4 -top-2.5 text-sm text-blue-600 bg-white px-1">Email</label></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 1
            ],
            [
                'name' => 'Multi Select',
                'type' => 'multi-select',
                'component_type' => 'component',
                'category' => 'form',
                'alphabet_group' => 'M',
                'description' => 'Advanced multi-select dropdown with search',
                'icon' => 'CheckSquare',
                'default_props' => [
                    'options' => [
                        ['value' => 'option1', 'label' => 'Option 1'],
                        ['value' => 'option2', 'label' => 'Option 2'],
                        ['value' => 'option3', 'label' => 'Option 3']
                    ],
                    'placeholder' => 'Select options...',
                    'searchable' => true,
                    'clearable' => true
                ],
                'prop_definitions' => [
                    'options' => ['type' => 'array', 'label' => 'Options'],
                    'searchable' => ['type' => 'boolean', 'label' => 'Searchable', 'default' => true],
                    'clearable' => ['type' => 'boolean', 'label' => 'Clearable', 'default' => true]
                ],
                'render_template' => 'multi-select-template',
                'code_generators' => ['react-select' => 'templates/forms/multi-select.js'],
                'variants' => [],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 2
            ],
            [
                'name' => 'File Upload',
                'type' => 'file-upload',
                'component_type' => 'component',
                'category' => 'form',
                'alphabet_group' => 'F',
                'description' => 'Drag & drop file upload with preview',
                'icon' => 'Upload',
                'default_props' => [
                    'multiple' => false,
                    'accept' => 'image/*',
                    'maxSize' => '5MB',
                    'showPreview' => true
                ],
                'prop_definitions' => [
                    'multiple' => ['type' => 'boolean', 'label' => 'Multiple Files', 'default' => false],
                    'accept' => ['type' => 'string', 'label' => 'Accepted Types', 'default' => 'image/*'],
                    'showPreview' => ['type' => 'boolean', 'label' => 'Show Preview', 'default' => true]
                ],
                'render_template' => 'file-upload-template',
                'code_generators' => ['react-tailwind' => 'templates/forms/file-upload.js'],
                'variants' => [
                    [
                        'name' => 'Dropzone',
                        'description' => 'Large dropzone area',
                        'props' => ['variant' => 'dropzone'],
                        'preview_code' => '<div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"><svg class="w-12 h-12 mx-auto text-gray-400 mb-4"><path d="M7 14l3-3 3 3M12 17V5M5 7h14"/></svg><p>Drop files here or click to browse</p></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 3
            ],
            [
                'name' => 'Date Picker',
                'type' => 'date-picker',
                'component_type' => 'component',
                'category' => 'form',
                'alphabet_group' => 'D',
                'description' => 'Calendar date picker with time options',
                'icon' => 'Calendar',
                'default_props' => [
                    'format' => 'MM/dd/yyyy',
                    'showTime' => false,
                    'placeholder' => 'Select date...',
                    'minDate' => null,
                    'maxDate' => null
                ],
                'prop_definitions' => [
                    'format' => ['type' => 'string', 'label' => 'Date Format', 'default' => 'MM/dd/yyyy'],
                    'showTime' => ['type' => 'boolean', 'label' => 'Show Time', 'default' => false],
                    'placeholder' => ['type' => 'string', 'label' => 'Placeholder', 'default' => 'Select date...']
                ],
                'render_template' => 'date-picker-template',
                'code_generators' => ['react-datepicker' => 'templates/forms/date-picker.js'],
                'variants' => [],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 4
            ],
            [
                'name' => 'Color Picker',
                'type' => 'color-picker',
                'component_type' => 'component',
                'category' => 'form',
                'alphabet_group' => 'C',
                'description' => 'Color picker with swatches and gradients',
                'icon' => 'Palette',
                'default_props' => [
                    'color' => '#3b82f6',
                    'showSwatches' => true,
                    'showGradient' => false,
                    'format' => 'hex'
                ],
                'prop_definitions' => [
                    'color' => ['type' => 'color', 'label' => 'Default Color', 'default' => '#3b82f6'],
                    'showSwatches' => ['type' => 'boolean', 'label' => 'Show Swatches', 'default' => true],
                    'format' => ['type' => 'select', 'label' => 'Format', 'options' => ['hex', 'rgb', 'hsl'], 'default' => 'hex']
                ],
                'render_template' => 'color-picker-template',
                'code_generators' => ['react-color' => 'templates/forms/color-picker.js'],
                'variants' => [],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 5
            ],
            [
                'name' => 'Range Slider',
                'type' => 'range-slider',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'R',
                'description' => 'Dual-handle range slider',
                'icon' => 'Sliders',
                'default_props' => [
                    'min' => 0,
                    'max' => 100,
                    'step' => 1,
                    'value' => [20, 80],
                    'showLabels' => true
                ],
                'prop_definitions' => [
                    'min' => ['type' => 'number', 'label' => 'Min Value', 'default' => 0],
                    'max' => ['type' => 'number', 'label' => 'Max Value', 'default' => 100],
                    'step' => ['type' => 'number', 'label' => 'Step', 'default' => 1],
                    'showLabels' => ['type' => 'boolean', 'label' => 'Show Labels', 'default' => true]
                ],
                'render_template' => 'range-slider-template',
                'code_generators' => ['react-tailwind' => 'templates/forms/range-slider.js'],
                'variants' => [
                    [
                        'name' => 'Price Range',
                        'description' => 'Price range slider with currency',
                        'props' => ['min' => 0, 'max' => 1000, 'value' => [100, 500], 'format' => 'currency'],
                        'preview_code' => '<div class="relative w-full"><div class="flex justify-between mb-2"><span class="text-sm text-gray-600">$100</span><span class="text-sm text-gray-600">$500</span></div><div class="relative h-2 bg-gray-200 rounded-full"><div class="absolute h-2 bg-blue-500 rounded-full" style="left: 10%; width: 40%"></div></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 6
            ],
            [
                'name' => 'Rating',
                'type' => 'rating',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'R',
                'description' => 'Star rating input component',
                'icon' => 'Star',
                'default_props' => [
                    'max' => 5,
                    'value' => 0,
                    'size' => 'md',
                    'color' => 'yellow',
                    'allowHalf' => false
                ],
                'prop_definitions' => [
                    'max' => ['type' => 'number', 'label' => 'Max Rating', 'default' => 5],
                    'value' => ['type' => 'number', 'label' => 'Current Value', 'default' => 0],
                    'size' => ['type' => 'select', 'label' => 'Size', 'options' => ['sm', 'md', 'lg'], 'default' => 'md'],
                    'allowHalf' => ['type' => 'boolean', 'label' => 'Allow Half Stars', 'default' => false]
                ],
                'render_template' => 'rating-template',
                'code_generators' => ['react-tailwind' => 'templates/forms/rating.js'],
                'variants' => [
                    [
                        'name' => 'Heart Rating',
                        'description' => 'Heart-shaped rating',
                        'props' => ['icon' => 'heart', 'color' => 'red'],
                        'preview_code' => '<div class="flex gap-1">' . str_repeat('<svg class="w-6 h-6 fill-red-500"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>', 3) . str_repeat('<svg class="w-6 h-6 fill-gray-300"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>', 2) . '</div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 7
            ]
        ];

        foreach ($formComponents as $component) {
            Component::create($component);
        }
    }
}