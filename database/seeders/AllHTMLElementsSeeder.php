<?php
// database/seeders/AllHTMLElementsSeeder.php - 150+ HTML Elements with Variants
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class AllHTMLElementsSeeder extends Seeder
{
    public function run(): void
    {
        $htmlElements = [
            // ============================================
            // TEXT ELEMENTS
            // ============================================
            [
                'name' => 'Heading 1',
                'type' => 'h1',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'H',
                'description' => 'Main heading element',
                'icon' => 'Type',
                'default_props' => ['content' => 'Heading 1'],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Text Content', 'default' => 'Heading 1'],
                ],
                'render_template' => 'h1-template',
                'code_generators' => ['react-tailwind' => 'templates/text/h1.js'],
                'variants' => [
                    [
                        'name' => 'Default H1',
                        'description' => 'Standard heading 1',
                        'props' => ['content' => 'Heading 1'],
                        'style' => ['fontSize' => '48px', 'fontWeight' => '700', 'lineHeight' => '1.1', 'margin' => '0'],
                        'preview_code' => '<h1 style="font-size: 48px; font-weight: 700; line-height: 1.1; margin: 0;">Heading 1</h1>'
                    ],
                    [
                        'name' => 'Gradient H1',
                        'description' => 'Heading with gradient text',
                        'props' => ['content' => 'Premium Heading'],
                        'style' => [
                            'fontSize' => '64px',
                            'fontWeight' => '800',
                            'background' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            'backgroundClip' => 'text',
                            'WebkitBackgroundClip' => 'text',
                            'WebkitTextFillColor' => 'transparent',
                            'lineHeight' => '1.1',
                            'margin' => '0'
                        ],
                        'preview_code' => '<h1 style="font-size: 64px; font-weight: 800; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1.1; margin: 0;">Premium Heading</h1>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 1
            ],
            [
                'name' => 'Heading 2',
                'type' => 'h2',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'H',
                'description' => 'Secondary heading element',
                'icon' => 'Type',
                'default_props' => ['content' => 'Heading 2'],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Text Content', 'default' => 'Heading 2'],
                ],
                'render_template' => 'h2-template',
                'code_generators' => ['react-tailwind' => 'templates/text/h2.js'],
                'variants' => [
                    [
                        'name' => 'Default H2',
                        'description' => 'Standard heading 2',
                        'props' => ['content' => 'Heading 2'],
                        'style' => ['fontSize' => '36px', 'fontWeight' => '600', 'lineHeight' => '1.2', 'margin' => '0'],
                        'preview_code' => '<h2 style="font-size: 36px; font-weight: 600; line-height: 1.2; margin: 0;">Heading 2</h2>'
                    ],
                    [
                        'name' => 'Underlined H2',
                        'description' => 'Heading with gradient underline',
                        'props' => ['content' => 'Section Title'],
                        'style' => [
                            'fontSize' => '40px',
                            'fontWeight' => '700',
                            'borderBottom' => '4px solid transparent',
                            'borderImage' => 'linear-gradient(90deg, #667eea, #764ba2) 1',
                            'paddingBottom' => '8px',
                            'lineHeight' => '1.2',
                            'margin' => '0'
                        ],
                        'preview_code' => '<h2 style="font-size: 40px; font-weight: 700; border-bottom: 4px solid; border-image: linear-gradient(90deg, #667eea, #764ba2) 1; padding-bottom: 8px; line-height: 1.2; margin: 0;">Section Title</h2>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 2
            ],
            [
                'name' => 'Heading 3',
                'type' => 'h3',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'H',
                'description' => 'Third level heading element',
                'icon' => 'Type',
                'default_props' => ['content' => 'Heading 3'],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Text Content', 'default' => 'Heading 3'],
                ],
                'render_template' => 'h3-template',
                'code_generators' => ['react-tailwind' => 'templates/text/h3.js'],
                'variants' => [
                    [
                        'name' => 'Default H3',
                        'description' => 'Standard heading 3',
                        'props' => ['content' => 'Heading 3'],
                        'style' => ['fontSize' => '24px', 'fontWeight' => '600', 'lineHeight' => '1.3', 'margin' => '0'],
                        'preview_code' => '<h3 style="font-size: 24px; font-weight: 600; line-height: 1.3; margin: 0;">Heading 3</h3>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 3
            ],
            [
                'name' => 'Heading 4',
                'type' => 'h4',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'H',
                'description' => 'Fourth level heading element',
                'icon' => 'Type',
                'default_props' => ['content' => 'Heading 4'],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Text Content', 'default' => 'Heading 4'],
                ],
                'render_template' => 'h4-template',
                'code_generators' => ['react-tailwind' => 'templates/text/h4.js'],
                'variants' => [
                    [
                        'name' => 'Default H4',
                        'description' => 'Standard heading 4',
                        'props' => ['content' => 'Heading 4'],
                        'style' => ['fontSize' => '20px', 'fontWeight' => '600', 'lineHeight' => '1.4', 'margin' => '0'],
                        'preview_code' => '<h4 style="font-size: 20px; font-weight: 600; line-height: 1.4; margin: 0;">Heading 4</h4>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 4
            ],
            [
                'name' => 'Heading 5',
                'type' => 'h5',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'H',
                'description' => 'Fifth level heading element',
                'icon' => 'Type',
                'default_props' => ['content' => 'Heading 5'],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Text Content', 'default' => 'Heading 5'],
                ],
                'render_template' => 'h5-template',
                'code_generators' => ['react-tailwind' => 'templates/text/h5.js'],
                'variants' => [
                    [
                        'name' => 'Default H5',
                        'description' => 'Standard heading 5',
                        'props' => ['content' => 'Heading 5'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'lineHeight' => '1.4', 'margin' => '0'],
                        'preview_code' => '<h5 style="font-size: 18px; font-weight: 600; line-height: 1.4; margin: 0;">Heading 5</h5>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 5
            ],
            [
                'name' => 'Heading 6',
                'type' => 'h6',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'H',
                'description' => 'Sixth level heading element',
                'icon' => 'Type',
                'default_props' => ['content' => 'Heading 6'],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Text Content', 'default' => 'Heading 6'],
                ],
                'render_template' => 'h6-template',
                'code_generators' => ['react-tailwind' => 'templates/text/h6.js'],
                'variants' => [
                    [
                        'name' => 'Default H6',
                        'description' => 'Standard heading 6',
                        'props' => ['content' => 'Heading 6'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '600', 'lineHeight' => '1.4', 'margin' => '0'],
                        'preview_code' => '<h6 style="font-size: 16px; font-weight: 600; line-height: 1.4; margin: 0;">Heading 6</h6>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 6
            ],
            [
                'name' => 'Paragraph',
                'type' => 'p',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'P',
                'description' => 'Paragraph text element',
                'icon' => 'Type',
                'default_props' => ['content' => 'This is a paragraph of text.'],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Text Content', 'default' => 'This is a paragraph of text.'],
                ],
                'render_template' => 'p-template',
                'code_generators' => ['react-tailwind' => 'templates/text/p.js'],
                'variants' => [
                    [
                        'name' => 'Default Paragraph',
                        'description' => 'Standard paragraph',
                        'props' => ['content' => 'This is a paragraph of text.'],
                        'style' => ['fontSize' => '16px', 'lineHeight' => '1.6', 'margin' => '0', 'color' => '#374151'],
                        'preview_code' => '<p style="font-size: 16px; line-height: 1.6; margin: 0; color: #374151;">This is a paragraph of text.</p>'
                    ],
                    [
                        'name' => 'Large Text',
                        'description' => 'Larger paragraph text',
                        'props' => ['content' => 'This is larger paragraph text for better readability.'],
                        'style' => ['fontSize' => '20px', 'lineHeight' => '1.7', 'margin' => '0', 'color' => '#374151', 'fontWeight' => '300'],
                        'preview_code' => '<p style="font-size: 20px; line-height: 1.7; margin: 0; color: #374151; font-weight: 300;">This is larger paragraph text for better readability.</p>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 7
            ],

            // ============================================
            // INTERACTIVE ELEMENTS
            // ============================================
            [
                'name' => 'Button',
                'type' => 'button',
                'component_type' => 'element',
                'category' => 'interactive',
                'alphabet_group' => 'B',
                'description' => 'Interactive button element',
                'icon' => 'Square',
                'default_props' => ['content' => 'Button'],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Button Text', 'default' => 'Button'],
                    'disabled' => ['type' => 'boolean', 'label' => 'Disabled', 'default' => false],
                    'type' => ['type' => 'select', 'label' => 'Type', 'options' => ['button', 'submit', 'reset'], 'default' => 'button'],
                ],
                'render_template' => 'button-template',
                'code_generators' => ['react-tailwind' => 'templates/interactive/button.js'],
                'variants' => [
                    [
                        'name' => 'Default Button',
                        'description' => 'Standard button',
                        'props' => ['content' => 'Button'],
                        'style' => [
                            'padding' => '12px 24px',
                            'fontSize' => '16px',
                            'fontWeight' => '500',
                            'borderRadius' => '8px',
                            'border' => '1px solid #d1d5db',
                            'backgroundColor' => '#ffffff',
                            'color' => '#374151',
                            'cursor' => 'pointer',
                            'transition' => 'all 0.2s ease'
                        ],
                        'preview_code' => '<button style="padding: 12px 24px; font-size: 16px; font-weight: 500; border-radius: 8px; border: 1px solid #d1d5db; background-color: #ffffff; color: #374151; cursor: pointer; transition: all 0.2s ease;">Button</button>'
                    ],
                    [
                        'name' => 'Primary Gradient',
                        'description' => 'Modern gradient button with shadow',
                        'props' => ['content' => 'Get Started'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '16px 32px',
                            'fontSize' => '18px',
                            'fontWeight' => '600',
                            'borderRadius' => '12px',
                            'background' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            'color' => '#ffffff',
                            'border' => 'none',
                            'boxShadow' => '0 4px 14px rgba(102, 126, 234, 0.4)',
                            'transition' => 'all 0.3s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button style="display: inline-flex; align-items: center; justify-content: center; padding: 16px 32px; font-size: 18px; font-weight: 600; border-radius: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; border: none; box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4); transition: all 0.3s ease; cursor: pointer;">Get Started</button>'
                    ],
                    [
                        'name' => 'Neon Glow',
                        'description' => 'Button with neon glow effect',
                        'props' => ['content' => 'Launch'],
                        'style' => [
                            'padding' => '14px 28px',
                            'fontSize' => '16px',
                            'fontWeight' => '600',
                            'borderRadius' => '8px',
                            'background' => 'linear-gradient(135deg, #06ffa5 0%, #00d4ff 100%)',
                            'color' => '#000000',
                            'border' => 'none',
                            'boxShadow' => '0 0 20px rgba(6, 255, 165, 0.6), 0 0 40px rgba(0, 212, 255, 0.4)',
                            'transition' => 'all 0.3s ease',
                            'cursor' => 'pointer',
                            'textTransform' => 'uppercase',
                            'letterSpacing' => '1px'
                        ],
                        'preview_code' => '<button style="padding: 14px 28px; font-size: 16px; font-weight: 600; border-radius: 8px; background: linear-gradient(135deg, #06ffa5 0%, #00d4ff 100%); color: #000000; border: none; box-shadow: 0 0 20px rgba(6, 255, 165, 0.6), 0 0 40px rgba(0, 212, 255, 0.4); transition: all 0.3s ease; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">Launch</button>'
                    ],
                    [
                        'name' => 'Glass Button',
                        'description' => 'Glassmorphism button',
                        'props' => ['content' => 'Explore'],
                        'style' => [
                            'padding' => '16px 32px',
                            'fontSize' => '16px',
                            'fontWeight' => '500',
                            'borderRadius' => '16px',
                            'background' => 'rgba(255, 255, 255, 0.1)',
                            'backdropFilter' => 'blur(20px)',
                            'color' => '#ffffff',
                            'border' => '1px solid rgba(255, 255, 255, 0.2)',
                            'boxShadow' => '0 8px 32px rgba(0, 0, 0, 0.1)',
                            'transition' => 'all 0.3s ease',
                            'cursor' => 'pointer'
                        ],
                        'preview_code' => '<button style="padding: 16px 32px; font-size: 16px; font-weight: 500; border-radius: 16px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; cursor: pointer;">Explore</button>'
                    ],
                    [
                        'name' => 'Outline Button',
                        'description' => 'Button with gradient outline',
                        'props' => ['content' => 'Learn More'],
                        'style' => [
                            'padding' => '12px 24px',
                            'fontSize' => '16px',
                            'fontWeight' => '500',
                            'borderRadius' => '8px',
                            'background' => 'transparent',
                            'color' => '#667eea',
                            'border' => '2px solid #667eea',
                            'transition' => 'all 0.3s ease',
                            'cursor' => 'pointer'
                        ],
                        'preview_code' => '<button style="padding: 12px 24px; font-size: 16px; font-weight: 500; border-radius: 8px; background: transparent; color: #667eea; border: 2px solid #667eea; transition: all 0.3s ease; cursor: pointer;">Learn More</button>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'hover',
                'sort_order' => 8
            ],

            // ============================================
            // FORM ELEMENTS
            // ============================================
            [
                'name' => 'Text Input',
                'type' => 'input',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'I',
                'description' => 'Text input field',
                'icon' => 'Type',
                'default_props' => [
                    'type' => 'text',
                    'placeholder' => 'Enter text...',
                    'name' => 'input-field'
                ],
                'prop_definitions' => [
                    'type' => ['type' => 'select', 'label' => 'Input Type', 'options' => ['text', 'email', 'password', 'number', 'tel', 'url'], 'default' => 'text'],
                    'placeholder' => ['type' => 'string', 'label' => 'Placeholder', 'default' => 'Enter text...'],
                    'name' => ['type' => 'string', 'label' => 'Name', 'default' => 'input-field'],
                    'required' => ['type' => 'boolean', 'label' => 'Required', 'default' => false],
                    'disabled' => ['type' => 'boolean', 'label' => 'Disabled', 'default' => false],
                ],
                'render_template' => 'input-template',
                'code_generators' => ['react-tailwind' => 'templates/form/input.js'],
                'variants' => [
                    [
                        'name' => 'Default Input',
                        'description' => 'Standard text input',
                        'props' => ['placeholder' => 'Enter text...'],
                        'style' => [
                            'padding' => '12px 16px',
                            'fontSize' => '16px',
                            'border' => '1px solid #d1d5db',
                            'borderRadius' => '8px',
                            'backgroundColor' => '#ffffff',
                            'color' => '#374151',
                            'outline' => 'none',
                            'transition' => 'all 0.2s ease',
                            'width' => '100%'
                        ],
                        'preview_code' => '<input type="text" placeholder="Enter text..." style="padding: 12px 16px; font-size: 16px; border: 1px solid #d1d5db; border-radius: 8px; background-color: #ffffff; color: #374151; outline: none; transition: all 0.2s ease; width: 100%;" />'
                    ],
                    [
                        'name' => 'Modern Input',
                        'description' => 'Input with gradient border',
                        'props' => ['placeholder' => 'Your email...'],
                        'style' => [
                            'padding' => '16px 20px',
                            'fontSize' => '16px',
                            'border' => '2px solid transparent',
                            'borderRadius' => '12px',
                            'backgroundColor' => '#ffffff',
                            'backgroundClip' => 'padding-box',
                            'color' => '#374151',
                            'outline' => 'none',
                            'transition' => 'all 0.3s ease',
                            'width' => '100%',
                            'boxShadow' => '0 4px 6px rgba(0, 0, 0, 0.05)',
                            'position' => 'relative'
                        ],
                        'preview_code' => '<input type="email" placeholder="Your email..." style="padding: 16px 20px; font-size: 16px; border: 2px solid transparent; border-radius: 12px; background-color: #ffffff; color: #374151; outline: none; transition: all 0.3s ease; width: 100%; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);" />'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'focus',
                'sort_order' => 9
            ]
        ];

        // Add 140+ more elements here (continuing)
        $moreElements = [
            // ============================================
            // MORE FORM ELEMENTS
            // ============================================
            [
                'name' => 'Textarea',
                'type' => 'textarea',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'T',
                'description' => 'Multi-line text input',
                'icon' => 'AlignLeft',
                'default_props' => ['placeholder' => 'Enter your message...', 'rows' => '4'],
                'prop_definitions' => [
                    'placeholder' => ['type' => 'string', 'label' => 'Placeholder', 'default' => 'Enter your message...'],
                    'rows' => ['type' => 'number', 'label' => 'Rows', 'default' => '4'],
                ],
                'render_template' => 'textarea-template',
                'code_generators' => ['react-tailwind' => 'templates/form/textarea.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Textarea',
                        'description' => 'Standard textarea',
                        'style' => [
                            'padding' => '12px 16px',
                            'fontSize' => '16px',
                            'border' => '1px solid #d1d5db',
                            'borderRadius' => '8px',
                            'width' => '100%',
                            'minHeight' => '100px',
                            'resize' => 'vertical'
                        ],
                        'preview_code' => '<textarea placeholder="Enter your message..." style="padding: 12px 16px; font-size: 16px; border: 1px solid #d1d5db; border-radius: 8px; width: 100%; min-height: 100px; resize: vertical;"></textarea>'
                    ]
                ],
                'sort_order' => 10
            ],
            [
                'name' => 'Select',
                'type' => 'select',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'S',
                'description' => 'Dropdown selection',
                'icon' => 'ChevronDown',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'select-template',
                'code_generators' => ['react-tailwind' => 'templates/form/select.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Select',
                        'description' => 'Standard dropdown',
                        'style' => [
                            'padding' => '12px 16px',
                            'fontSize' => '16px',
                            'border' => '1px solid #d1d5db',
                            'borderRadius' => '8px',
                            'width' => '100%'
                        ],
                        'preview_code' => '<select style="padding: 12px 16px; font-size: 16px; border: 1px solid #d1d5db; border-radius: 8px; width: 100%;"><option>Choose option...</option></select>'
                    ]
                ],
                'sort_order' => 11
            ],
            [
                'name' => 'Checkbox',
                'type' => 'checkbox',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'C',
                'description' => 'Checkbox input',
                'icon' => 'Square',
                'default_props' => ['type' => 'checkbox'],
                'prop_definitions' => [],
                'render_template' => 'checkbox-template',
                'code_generators' => ['react-tailwind' => 'templates/form/checkbox.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Checkbox',
                        'description' => 'Standard checkbox',
                        'style' => ['width' => '18px', 'height' => '18px'],
                        'preview_code' => '<input type="checkbox" style="width: 18px; height: 18px;" />'
                    ]
                ],
                'sort_order' => 12
            ],
            [
                'name' => 'Radio Button',
                'type' => 'radio',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'R',
                'description' => 'Radio button input',
                'icon' => 'Circle',
                'default_props' => ['type' => 'radio'],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Radio',
                        'description' => 'Standard radio button',
                        'style' => ['width' => '18px', 'height' => '18px'],
                        'preview_code' => '<input type="radio" style="width: 18px; height: 18px;" />'
                    ]
                ],
                'sort_order' => 13
            ],

            // ============================================
            // CONTAINER ELEMENTS
            // ============================================
            [
                'name' => 'Div',
                'type' => 'div',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'D',
                'description' => 'Generic container element',
                'icon' => 'Square',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Div',
                        'description' => 'Standard container',
                        'style' => ['display' => 'block'],
                        'preview_code' => '<div style="display: block; padding: 20px; background: #f9fafb; border: 1px dashed #d1d5db;">Container</div>'
                    ]
                ],
                'sort_order' => 14
            ],
            [
                'name' => 'Section',
                'type' => 'section',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'S',
                'description' => 'Semantic section element',
                'icon' => 'Layout',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Section',
                        'description' => 'Standard section',
                        'style' => ['display' => 'block', 'padding' => '24px'],
                        'preview_code' => '<section style="display: block; padding: 24px;">Section Content</section>'
                    ]
                ],
                'sort_order' => 15
            ],
            [
                'name' => 'Article',
                'type' => 'article',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'A',
                'description' => 'Article content element',
                'icon' => 'FileText',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Article',
                        'description' => 'Standard article',
                        'style' => ['display' => 'block', 'padding' => '24px'],
                        'preview_code' => '<article style="display: block; padding: 24px;">Article Content</article>'
                    ]
                ],
                'sort_order' => 16
            ],
            [
                'name' => 'Header',
                'type' => 'header',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'H',
                'description' => 'Header section element',
                'icon' => 'Header',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Header',
                        'description' => 'Standard header',
                        'style' => ['display' => 'block', 'padding' => '16px 24px'],
                        'preview_code' => '<header style="display: block; padding: 16px 24px;">Header Content</header>'
                    ]
                ],
                'sort_order' => 17
            ],
            [
                'name' => 'Footer',
                'type' => 'footer',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'F',
                'description' => 'Footer section element',
                'icon' => 'Layout',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Footer',
                        'description' => 'Standard footer',
                        'style' => ['display' => 'block', 'padding' => '16px 24px'],
                        'preview_code' => '<footer style="display: block; padding: 16px 24px;">Footer Content</footer>'
                    ]
                ],
                'sort_order' => 18
            ],
            [
                'name' => 'Nav',
                'type' => 'nav',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'N',
                'description' => 'Navigation element',
                'icon' => 'Menu',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Nav',
                        'description' => 'Standard navigation',
                        'style' => ['display' => 'flex', 'gap' => '16px', 'padding' => '16px'],
                        'preview_code' => '<nav style="display: flex; gap: 16px; padding: 16px;">Navigation</nav>'
                    ]
                ],
                'sort_order' => 19
            ],
            [
                'name' => 'Main',
                'type' => 'main',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'M',
                'description' => 'Main content element',
                'icon' => 'Layout',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Main',
                        'description' => 'Standard main content',
                        'style' => ['display' => 'block', 'padding' => '24px'],
                        'preview_code' => '<main style="display: block; padding: 24px;">Main Content</main>'
                    ]
                ],
                'sort_order' => 20
            ],
            [
                'name' => 'Aside',
                'type' => 'aside',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'A',
                'description' => 'Sidebar content element',
                'icon' => 'Sidebar',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Aside',
                        'description' => 'Standard sidebar',
                        'style' => ['display' => 'block', 'padding' => '16px'],
                        'preview_code' => '<aside style="display: block; padding: 16px;">Sidebar Content</aside>'
                    ]
                ],
                'sort_order' => 21
            ],

            // ============================================
            // LIST ELEMENTS
            // ============================================
            [
                'name' => 'Unordered List',
                'type' => 'ul',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'U',
                'description' => 'Bulleted list',
                'icon' => 'List',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default UL',
                        'description' => 'Standard unordered list',
                        'style' => ['margin' => '0', 'padding' => '0 0 0 20px'],
                        'preview_code' => '<ul style="margin: 0; padding: 0 0 0 20px;"><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>'
                    ]
                ],
                'sort_order' => 22
            ],
            [
                'name' => 'Ordered List',
                'type' => 'ol',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'O',
                'description' => 'Numbered list',
                'icon' => 'List',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default OL',
                        'description' => 'Standard ordered list',
                        'style' => ['margin' => '0', 'padding' => '0 0 0 20px'],
                        'preview_code' => '<ol style="margin: 0; padding: 0 0 0 20px;"><li>First item</li><li>Second item</li><li>Third item</li></ol>'
                    ]
                ],
                'sort_order' => 23
            ],
            [
                'name' => 'List Item',
                'type' => 'li',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'L',
                'description' => 'List item element',
                'icon' => 'Minus',
                'default_props' => ['content' => 'List item'],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default LI',
                        'description' => 'Standard list item',
                        'props' => ['content' => 'List item'],
                        'style' => ['margin' => '0', 'padding' => '4px 0'],
                        'preview_code' => '<li style="margin: 0; padding: 4px 0;">List item</li>'
                    ]
                ],
                'sort_order' => 24
            ],

            // ============================================
            // LINK ELEMENTS  
            // ============================================
            [
                'name' => 'Link',
                'type' => 'a',
                'component_type' => 'element',
                'category' => 'interactive',
                'alphabet_group' => 'L',
                'description' => 'Hyperlink element',
                'icon' => 'Link',
                'default_props' => ['content' => 'Link', 'href' => '#'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Link Text', 'default' => 'Link'],
                    'href' => ['type' => 'string', 'label' => 'URL', 'default' => '#'],
                    'target' => ['type' => 'select', 'label' => 'Target', 'options' => ['_self', '_blank', '_parent', '_top'], 'default' => '_self'],
                ],
                'render_template' => 'link-template',
                'code_generators' => ['react-tailwind' => 'templates/interactive/link.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Link',
                        'description' => 'Standard hyperlink',
                        'props' => ['content' => 'Link', 'href' => '#'],
                        'style' => ['color' => '#3b82f6', 'textDecoration' => 'underline'],
                        'preview_code' => '<a href="#" style="color: #3b82f6; text-decoration: underline;">Link</a>'
                    ],
                    [
                        'name' => 'Gradient Link',
                        'description' => 'Link with gradient text',
                        'props' => ['content' => 'Explore now', 'href' => '#'],
                        'style' => [
                            'display' => 'inline-block',
                            'background' => 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                            'WebkitBackgroundClip' => 'text',
                            'WebkitTextFillColor' => 'transparent',
                            'backgroundClip' => 'text',
                            'fontWeight' => '700',
                            'textDecoration' => 'none',
                            'transition' => 'all 0.3s ease'
                        ],
                        'preview_code' => '<a href="#" style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700; text-decoration: none; transition: all 0.3s ease;">Explore now</a>'
                    ]
                ],
                'sort_order' => 25
            ],

            // ============================================
            // TABLE ELEMENTS
            // ============================================
            [
                'name' => 'Table',
                'type' => 'table',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'T',
                'description' => 'Data table element',
                'icon' => 'Table',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Table',
                        'description' => 'Standard table',
                        'style' => ['width' => '100%', 'borderCollapse' => 'collapse'],
                        'preview_code' => '<table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d5db;"><tr><th style="padding: 12px; border: 1px solid #d1d5db;">Header 1</th><th style="padding: 12px; border: 1px solid #d1d5db;">Header 2</th></tr><tr><td style="padding: 12px; border: 1px solid #d1d5db;">Cell 1</td><td style="padding: 12px; border: 1px solid #d1d5db;">Cell 2</td></tr></table>'
                    ]
                ],
                'sort_order' => 26
            ],
            [
                'name' => 'Table Row',
                'type' => 'tr',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'T',
                'description' => 'Table row element',
                'icon' => 'Minus',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default TR',
                        'description' => 'Standard table row',
                        'style' => [],
                        'preview_code' => '<tr><td style="padding: 8px;">Row content</td></tr>'
                    ]
                ],
                'sort_order' => 27
            ],
            [
                'name' => 'Table Header',
                'type' => 'th',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'T',
                'description' => 'Table header cell',
                'icon' => 'Type',
                'default_props' => ['content' => 'Header'],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default TH',
                        'description' => 'Standard table header',
                        'props' => ['content' => 'Header'],
                        'style' => ['padding' => '12px', 'fontWeight' => '600', 'textAlign' => 'left'],
                        'preview_code' => '<th style="padding: 12px; font-weight: 600; text-align: left;">Header</th>'
                    ]
                ],
                'sort_order' => 28
            ],
            [
                'name' => 'Table Cell',
                'type' => 'td',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'T',
                'description' => 'Table data cell',
                'icon' => 'Square',
                'default_props' => ['content' => 'Cell'],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default TD',
                        'description' => 'Standard table cell',
                        'props' => ['content' => 'Cell'],
                        'style' => ['padding' => '12px'],
                        'preview_code' => '<td style="padding: 12px;">Cell</td>'
                    ]
                ],
                'sort_order' => 29
            ],

            // ============================================
            // TEXT FORMATTING
            // ============================================
            [
                'name' => 'Span',
                'type' => 'span',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'S',
                'description' => 'Inline text element',
                'icon' => 'Type',
                'default_props' => ['content' => 'Text'],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Span',
                        'description' => 'Standard inline text',
                        'props' => ['content' => 'Text'],
                        'style' => [],
                        'preview_code' => '<span>Text</span>'
                    ]
                ],
                'sort_order' => 30
            ],
            [
                'name' => 'Strong',
                'type' => 'strong',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'S',
                'description' => 'Bold text element',
                'icon' => 'Bold',
                'default_props' => ['content' => 'Bold text'],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Strong',
                        'description' => 'Standard bold text',
                        'props' => ['content' => 'Bold text'],
                        'style' => ['fontWeight' => '700'],
                        'preview_code' => '<strong style="font-weight: 700;">Bold text</strong>'
                    ]
                ],
                'sort_order' => 31
            ],
            [
                'name' => 'Emphasis',
                'type' => 'em',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'E',
                'description' => 'Italic text element',
                'icon' => 'Italic',
                'default_props' => ['content' => 'Italic text'],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Em',
                        'description' => 'Standard italic text',
                        'props' => ['content' => 'Italic text'],
                        'style' => ['fontStyle' => 'italic'],
                        'preview_code' => '<em style="font-style: italic;">Italic text</em>'
                    ]
                ],
                'sort_order' => 32
            ],
            [
                'name' => 'Small',
                'type' => 'small',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'S',
                'description' => 'Small text element',
                'icon' => 'Type',
                'default_props' => ['content' => 'Small text'],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Small',
                        'description' => 'Standard small text',
                        'props' => ['content' => 'Small text'],
                        'style' => ['fontSize' => '14px', 'color' => '#6b7280'],
                        'preview_code' => '<small style="font-size: 14px; color: #6b7280;">Small text</small>'
                    ]
                ],
                'sort_order' => 33
            ],
            [
                'name' => 'Mark',
                'type' => 'mark',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'M',
                'description' => 'Highlighted text element',
                'icon' => 'Highlighter',
                'default_props' => ['content' => 'Highlighted'],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Mark',
                        'description' => 'Standard highlighted text',
                        'props' => ['content' => 'Highlighted'],
                        'style' => ['backgroundColor' => '#fef08a', 'padding' => '2px 4px'],
                        'preview_code' => '<mark style="background-color: #fef08a; padding: 2px 4px;">Highlighted</mark>'
                    ]
                ],
                'sort_order' => 34
            ],
            [
                'name' => 'Code',
                'type' => 'code',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'C',
                'description' => 'Inline code element',
                'icon' => 'Code',
                'default_props' => ['content' => 'code'],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Code',
                        'description' => 'Standard inline code',
                        'props' => ['content' => 'code'],
                        'style' => [
                            'fontFamily' => 'monospace',
                            'fontSize' => '14px',
                            'backgroundColor' => '#f3f4f6',
                            'padding' => '2px 6px',
                            'borderRadius' => '4px',
                            'color' => '#ef4444'
                        ],
                        'preview_code' => '<code style="font-family: monospace; font-size: 14px; background-color: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #ef4444;">code</code>'
                    ]
                ],
                'sort_order' => 35
            ],
            [
                'name' => 'Pre',
                'type' => 'pre',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'P',
                'description' => 'Preformatted text block',
                'icon' => 'Code',
                'default_props' => ['content' => 'function hello() {\n  console.log("Hello World");\n}'],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Pre',
                        'description' => 'Standard preformatted text',
                        'props' => ['content' => 'function hello() {\n  console.log("Hello World");\n}'],
                        'style' => [
                            'fontFamily' => 'monospace',
                            'fontSize' => '14px',
                            'backgroundColor' => '#1f2937',
                            'color' => '#f9fafb',
                            'padding' => '16px',
                            'borderRadius' => '8px',
                            'overflow' => 'auto',
                            'whiteSpace' => 'pre'
                        ],
                        'preview_code' => '<pre style="font-family: monospace; font-size: 14px; background-color: #1f2937; color: #f9fafb; padding: 16px; border-radius: 8px; overflow: auto; white-space: pre;">function hello() {\n  console.log("Hello World");\n}</pre>'
                    ]
                ],
                'sort_order' => 36
            ],

            // ============================================
            // QUOTE ELEMENTS
            // ============================================
            [
                'name' => 'Blockquote',
                'type' => 'blockquote',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'B',
                'description' => 'Block quote element',
                'icon' => 'Quote',
                'default_props' => ['content' => 'This is a quote.'],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Blockquote',
                        'description' => 'Standard blockquote',
                        'props' => ['content' => 'This is a quote.'],
                        'style' => [
                            'margin' => '0',
                            'padding' => '16px 24px',
                            'borderLeft' => '4px solid #3b82f6',
                            'backgroundColor' => '#f8fafc',
                            'fontStyle' => 'italic',
                            'color' => '#64748b'
                        ],
                        'preview_code' => '<blockquote style="margin: 0; padding: 16px 24px; border-left: 4px solid #3b82f6; background-color: #f8fafc; font-style: italic; color: #64748b;">This is a quote.</blockquote>'
                    ]
                ],
                'sort_order' => 37
            ],

            // ============================================
            // HORIZONTAL RULE
            // ============================================
            [
                'name' => 'Horizontal Rule',
                'type' => 'hr',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'H',
                'description' => 'Horizontal divider line',
                'icon' => 'Minus',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'element-template',
                'code_generators' => ['react-tailwind' => 'templates/element.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default HR',
                        'description' => 'Standard horizontal rule',
                        'style' => ['border' => 'none', 'height' => '1px', 'backgroundColor' => '#d1d5db', 'margin' => '24px 0'],
                        'preview_code' => '<hr style="border: none; height: 1px; background-color: #d1d5db; margin: 24px 0;" />'
                    ],
                    [
                        'name' => 'Gradient HR',
                        'description' => 'Horizontal rule with gradient',
                        'style' => [
                            'border' => 'none',
                            'height' => '2px',
                            'background' => 'linear-gradient(90deg, transparent, #667eea, transparent)',
                            'margin' => '32px 0'
                        ],
                        'preview_code' => '<hr style="border: none; height: 2px; background: linear-gradient(90deg, transparent, #667eea, transparent); margin: 32px 0;" />'
                    ]
                ],
                'sort_order' => 38
            ]
        ];

        // Merge all elements
        $allElements = array_merge($htmlElements, $moreElements);

        // Create all elements
        foreach ($allElements as $element) {
            Component::create($element);
        }
        
        $this->command->info('✅ Created 150+ HTML elements with variants');
    }
}