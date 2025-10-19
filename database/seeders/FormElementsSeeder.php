<?php
// database/seeders/FormElementsSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class FormElementsSeeder extends Seeder
{
    public function run(): void
    {
        $formElements = [
            // CHECKBOX - Semantic <input type="checkbox">
            [
                'name' => 'Checkbox',
                'type' => 'checkbox',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'C',
                'description' => 'Checkbox input with label',
                'icon' => 'CheckSquare',
                'default_props' => [
                    'label' => '',
                    'checked' => false,
                    'disabled' => false,
                ],
                'prop_definitions' => [
                    'label' => ['type' => 'string', 'label' => 'Label', 'default' => ''],
                    'checked' => ['type' => 'boolean', 'label' => 'Checked', 'default' => false],
                    'disabled' => ['type' => 'boolean', 'label' => 'Disabled', 'default' => false],
                ],
                'render_template' => 'checkbox-template',
                'code_generators' => ['react-tailwind' => 'templates/form/checkbox.js'],
                'variants' => [
                    [
                        'name' => 'Modern Checkbox',
                        'description' => 'Styled checkbox with smooth animation',
                        'props' => ['label' => 'Accept terms', 'checked' => false],
                        'preview_code' => '<label class="flex items-center gap-3 cursor-pointer"><input type="checkbox" class="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-600/20 transition" /><span class="text-gray-700">Accept terms</span></label>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 1
            ],

            // RADIO - Semantic <input type="radio">
            [
                'name' => 'Radio Button',
                'type' => 'radio',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'R',
                'description' => 'Radio button input',
                'icon' => 'Circle',
                'default_props' => [
                    'label' => '',
                    'name' => 'radio-group',
                    'checked' => false,
                ],
                'prop_definitions' => [
                    'label' => ['type' => 'string', 'label' => 'Label', 'default' => ''],
                    'name' => ['type' => 'string', 'label' => 'Group Name', 'default' => 'radio-group'],
                    'checked' => ['type' => 'boolean', 'label' => 'Checked', 'default' => false],
                ],
                'render_template' => 'radio-template',
                'code_generators' => ['react-tailwind' => 'templates/form/radio.js'],
                'variants' => [
                    [
                        'name' => 'Card Radio',
                        'description' => 'Radio as selectable card',
                        'props' => ['label' => 'Option 1', 'checked' => false],
                        'preview_code' => '<label class="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-600 transition has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50"><input type="radio" class="w-5 h-5 text-blue-600" /><span class="font-semibold">Option 1</span></label>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 2
            ],

            // SELECT - Semantic <select>
            [
                'name' => 'Select Dropdown',
                'type' => 'select',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'S',
                'description' => 'Dropdown select menu',
                'icon' => 'ChevronDown',
                'default_props' => [
                    'placeholder' => '',
                    'size' => 'md',
                ],
                'prop_definitions' => [
                    'placeholder' => ['type' => 'string', 'label' => 'Placeholder', 'default' => ''],
                    'size' => ['type' => 'select', 'label' => 'Size', 'options' => ['sm', 'md', 'lg'], 'default' => 'md'],
                ],
                'render_template' => 'select-template',
                'code_generators' => ['react-tailwind' => 'templates/form/select.js'],
                'variants' => [
                    [
                        'name' => 'Modern Select',
                        'description' => 'Styled select dropdown',
                        'props' => ['placeholder' => 'Choose option', 'size' => 'md'],
                        'preview_code' => '<select class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none appearance-none bg-white transition"><option>Option 1</option><option>Option 2</option><option>Option 3</option></select>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 3
            ],

            // TOGGLE SWITCH
            [
                'name' => 'Toggle Switch',
                'type' => 'toggle',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'T',
                'description' => 'On/off toggle switch',
                'icon' => 'ToggleLeft',
                'default_props' => [
                    'checked' => false,
                    'size' => 'md',
                    'label' => '',
                ],
                'prop_definitions' => [
                    'checked' => ['type' => 'boolean', 'label' => 'Checked', 'default' => false],
                    'size' => ['type' => 'select', 'label' => 'Size', 'options' => ['sm', 'md', 'lg'], 'default' => 'md'],
                    'label' => ['type' => 'string', 'label' => 'Label', 'default' => ''],
                ],
                'render_template' => 'toggle-template',
                'code_generators' => ['react-tailwind' => 'templates/form/toggle.js'],
                'variants' => [
                    [
                        'name' => 'iOS Style Toggle',
                        'description' => 'Toggle switch with iOS-like design',
                        'props' => ['label' => 'Enable notifications', 'checked' => true],
                        'preview_code' => '<label class="flex items-center justify-between cursor-pointer"><span class="text-gray-700">Enable notifications</span><div class="relative inline-block w-12 h-6"><input type="checkbox" class="sr-only peer" checked /><div class="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div></label>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 4
            ],

            // FILE INPUT
            [
                'name' => 'File Upload',
                'type' => 'file',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'F',
                'description' => 'File upload input',
                'icon' => 'Upload',
                'default_props' => [
                    'accept' => '',
                    'multiple' => false,
                    'variant' => 'default',
                ],
                'prop_definitions' => [
                    'accept' => ['type' => 'string', 'label' => 'Accepted Types', 'default' => ''],
                    'multiple' => ['type' => 'boolean', 'label' => 'Multiple Files', 'default' => false],
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['default', 'dropzone'], 'default' => 'default'],
                ],
                'render_template' => 'file-template',
                'code_generators' => ['react-tailwind' => 'templates/form/file.js'],
                'variants' => [
                    [
                        'name' => 'Drag & Drop Zone',
                        'description' => 'Dropzone for file uploads',
                        'props' => ['variant' => 'dropzone', 'multiple' => true],
                        'preview_code' => '<label class="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition"><div class="flex flex-col items-center justify-center pt-5 pb-6"><svg class="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg><p class="mb-2 text-sm text-gray-500"><span class="font-semibold">Click to upload</span> or drag and drop</p><p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p></div><input type="file" class="hidden" multiple /></label>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 5
            ],

            // RANGE SLIDER
            [
                'name' => 'Range Slider',
                'type' => 'range',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'R',
                'description' => 'Range slider input',
                'icon' => 'Slider',
                'default_props' => [
                    'min' => 0,
                    'max' => 100,
                    'value' => 50,
                    'step' => 1,
                    'showValue' => true,
                ],
                'prop_definitions' => [
                    'min' => ['type' => 'number', 'label' => 'Minimum', 'default' => 0],
                    'max' => ['type' => 'number', 'label' => 'Maximum', 'default' => 100],
                    'value' => ['type' => 'number', 'label' => 'Default Value', 'default' => 50],
                    'step' => ['type' => 'number', 'label' => 'Step', 'default' => 1],
                    'showValue' => ['type' => 'boolean', 'label' => 'Show Value', 'default' => true],
                ],
                'render_template' => 'range-template',
                'code_generators' => ['react-tailwind' => 'templates/form/range.js'],
                'variants' => [
                    [
                        'name' => 'Gradient Slider',
                        'description' => 'Slider with gradient track',
                        'props' => ['min' => 0, 'max' => 100, 'value' => 70],
                        'preview_code' => '<div class="w-full"><div class="flex justify-between mb-2"><span class="text-sm font-semibold">Volume</span><span class="text-sm font-semibold">70%</span></div><input type="range" min="0" max="100" value="70" class="w-full h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg" /></div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 6
            ],
        ];

        foreach ($formElements as $element) {
            Component::create($element);
        }
    }
}