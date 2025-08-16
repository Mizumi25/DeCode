<?php
// database/seeders/ComponentSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class ComponentSeeder extends Seeder
{
    public function run(): void
    {
        $components = [
            [
                'name' => 'Button',
                'type' => 'button',
                'category' => 'basic',
                'description' => 'Interactive button component with multiple variants',
                'icon' => 'Square',
                'default_props' => [
                    'text' => 'Click me',
                    'variant' => 'primary',
                    'size' => 'md',
                    'className' => ''
                ],
                'prop_definitions' => [
                    'text' => [
                        'type' => 'string',
                        'label' => 'Button Text',
                        'default' => 'Click me'
                    ],
                    'variant' => [
                        'type' => 'select',
                        'label' => 'Variant',
                        'options' => ['primary', 'secondary', 'success', 'warning', 'danger', 'ghost'],
                        'default' => 'primary'
                    ],
                    'size' => [
                        'type' => 'select',
                        'label' => 'Size',
                        'options' => ['sm', 'md', 'lg'],
                        'default' => 'md'
                    ],
                    'className' => [
                        'type' => 'string',
                        'label' => 'Custom Classes',
                        'default' => ''
                    ]
                ],
                'render_template' => 'button-template',
                'code_generators' => [
                    'react-tailwind' => [
                        'component' => 'templates/react-tailwind/button.js',
                        'styles' => 'templates/react-tailwind/button-styles.js'
                    ],
                    'react-css' => [
                        'component' => 'templates/react-css/button.js',
                        'styles' => 'templates/react-css/button.css'
                    ],
                    'html-css' => [
                        'component' => 'templates/html/button.html',
                        'styles' => 'templates/html/button.css'
                    ],
                    'html-tailwind' => [
                        'component' => 'templates/html-tailwind/button.html',
                        'styles' => 'templates/html-tailwind/button-classes.txt'
                    ]
                ],
                'sort_order' => 1
            ],
            [
                'name' => 'Input Field',
                'type' => 'input',
                'category' => 'form',
                'description' => 'Text input field with validation support',
                'icon' => 'Type',
                'default_props' => [
                    'placeholder' => 'Enter text...',
                    'type' => 'text',
                    'size' => 'md',
                    'variant' => 'default',
                    'required' => false,
                    'disabled' => false
                ],
                'prop_definitions' => [
                    'placeholder' => [
                        'type' => 'string',
                        'label' => 'Placeholder',
                        'default' => 'Enter text...'
                    ],
                    'type' => [
                        'type' => 'select',
                        'label' => 'Input Type',
                        'options' => ['text', 'email', 'password', 'number', 'tel', 'url'],
                        'default' => 'text'
                    ],
                    'size' => [
                        'type' => 'select',
                        'label' => 'Size',
                        'options' => ['sm', 'md', 'lg'],
                        'default' => 'md'
                    ],
                    'variant' => [
                        'type' => 'select',
                        'label' => 'Variant',
                        'options' => ['default', 'error', 'success'],
                        'default' => 'default'
                    ],
                    'required' => [
                        'type' => 'boolean',
                        'label' => 'Required',
                        'default' => false
                    ],
                    'disabled' => [
                        'type' => 'boolean',
                        'label' => 'Disabled',
                        'default' => false
                    ]
                ],
                'render_template' => 'input-template',
                'code_generators' => [
                    'react-tailwind' => [
                        'component' => 'templates/react-tailwind/input.js',
                        'styles' => 'templates/react-tailwind/input-styles.js'
                    ]
                ],
                'sort_order' => 2
            ],
            [
                'name' => 'Card',
                'type' => 'card',
                'category' => 'layout',
                'description' => 'Flexible card container for content',
                'icon' => 'Layout',
                'default_props' => [
                    'title' => 'Card Title',
                    'content' => 'Card content goes here...',
                    'variant' => 'default',
                    'padding' => 'md',
                    'shadow' => true
                ],
                'prop_definitions' => [
                    'title' => [
                        'type' => 'string',
                        'label' => 'Card Title',
                        'default' => 'Card Title'
                    ],
                    'content' => [
                        'type' => 'textarea',
                        'label' => 'Content',
                        'default' => 'Card content goes here...'
                    ],
                    'variant' => [
                        'type' => 'select',
                        'label' => 'Variant',
                        'options' => ['default', 'outlined', 'elevated'],
                        'default' => 'default'
                    ],
                    'padding' => [
                        'type' => 'select',
                        'label' => 'Padding',
                        'options' => ['sm', 'md', 'lg'],
                        'default' => 'md'
                    ],
                    'shadow' => [
                        'type' => 'boolean',
                        'label' => 'Drop Shadow',
                        'default' => true
                    ]
                ],
                'render_template' => 'card-template',
                'code_generators' => [
                    'react-tailwind' => [
                        'component' => 'templates/react-tailwind/card.js',
                        'styles' => 'templates/react-tailwind/card-styles.js'
                    ]
                ],
                'sort_order' => 3
            ]
        ];

        foreach ($components as $component) {
            Component::create($component);
        }
    }
}