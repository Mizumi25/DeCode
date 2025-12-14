<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class BasicElementsSeeder extends Seeder
{
    public function run(): void
    {
        $basicElements = [
            // ============================================
            // BUTTON
            // ============================================
            [
                'name' => 'Button',
                'type' => 'button',
                'component_type' => 'element',
                'category' => 'buttons',
                'alphabet_group' => 'B',
                'description' => 'Interactive button with multiple styles and animations',
                'icon' => 'Square',
                'default_props' => [
                    'content' => 'Button',
                    'disabled' => false,
                    'type' => 'button',
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Button Text', 'default' => 'Button'],
                    'disabled' => ['type' => 'boolean', 'label' => 'Disabled', 'default' => false],
                    'type' => ['type' => 'select', 'label' => 'Type', 'options' => ['button', 'submit', 'reset'], 'default' => 'button'],
                ],
                'render_template' => 'button-template',
                'code_generators' => ['react-tailwind' => 'templates/interactive/button.js'],
                'variants' => [
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
                        'preview_code' => '<button class="inline-flex items-center justify-center font-semibold" style="padding: 16px 32px; font-size: 18px; border-radius: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; border: none; box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4); transition: all 0.3s ease; cursor: pointer;">Get Started</button>'
                    ],
                    [
                        'name' => 'Glass Effect',
                        'description' => 'Glassmorphism button',
                        'props' => ['content' => 'Glass Effect'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '12px 24px',
                            'fontSize' => '16px',
                            'fontWeight' => '500',
                            'borderRadius' => '12px',
                            'background' => 'rgba(255, 255, 255, 0.1)',
                            'backdropFilter' => 'blur(16px)',
                            'color' => '#ffffff',
                            'border' => '1px solid rgba(255, 255, 255, 0.2)',
                            'boxShadow' => '0 8px 32px rgba(0, 0, 0, 0.1)',
                            'transition' => 'all 0.3s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button class="inline-flex items-center justify-center font-medium" style="padding: 12px 24px; font-size: 16px; border-radius: 12px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(16px); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; cursor: pointer;">Glass Effect</button>'
                    ],
                    [
                        'name' => 'Neon Glow',
                        'description' => 'Cyberpunk neon button',
                        'props' => ['content' => 'Neon Glow'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '16px 32px',
                            'fontSize' => '18px',
                            'fontWeight' => '700',
                            'borderRadius' => '8px',
                            'background' => '#000000',
                            'color' => '#22d3ee',
                            'border' => '2px solid #22d3ee',
                            'boxShadow' => '0 0 20px rgba(34, 211, 238, 0.6)',
                            'transition' => 'all 0.3s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button class="inline-flex items-center justify-center font-bold" style="padding: 16px 32px; font-size: 18px; border-radius: 8px; background: #000000; color: #22d3ee; border: 2px solid #22d3ee; box-shadow: 0 0 20px rgba(34, 211, 238, 0.6); transition: all 0.3s ease; cursor: pointer;">Neon Glow</button>'
                    ],
                    [
                        'name' => 'Rounded Pill',
                        'description' => 'Fully rounded pill button',
                        'props' => ['content' => 'Subscribe'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '12px 32px',
                            'fontSize' => '16px',
                            'fontWeight' => '500',
                            'borderRadius' => '9999px',
                            'background' => 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                            'color' => '#ffffff',
                            'border' => 'none',
                            'boxShadow' => '0 4px 14px rgba(236, 72, 153, 0.4)',
                            'transition' => 'all 0.2s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button class="inline-flex items-center justify-center font-medium" style="padding: 12px 32px; font-size: 16px; border-radius: 9999px; background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); color: #ffffff; border: none; box-shadow: 0 4px 14px rgba(236, 72, 153, 0.4); transition: all 0.2s ease; cursor: pointer;">Subscribe</button>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean minimal design',
                        'props' => ['content' => 'Learn More'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '12px 24px',
                            'fontSize' => '16px',
                            'fontWeight' => '500',
                            'borderRadius' => '8px',
                            'background' => 'transparent',
                            'color' => '#374151',
                            'border' => 'none',
                            'transition' => 'all 0.2s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button class="inline-flex items-center justify-center font-medium" style="padding: 12px 24px; font-size: 16px; border-radius: 8px; background: transparent; color: #374151; border: none; transition: all 0.2s ease; cursor: pointer;">Learn More</button>'
                    ],
                    [
                        'name' => 'Outline Button',
                        'description' => 'Transparent with black border',
                        'props' => ['content' => 'View My Work'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '16px 32px',
                            'fontSize' => '18px',
                            'fontWeight' => '500',
                            'borderRadius' => '9999px',
                            'background' => 'transparent',
                            'color' => '#000000',
                            'border' => '2px solid #000000',
                            'transition' => 'all 0.3s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button class="inline-flex items-center justify-center font-medium" style="padding: 16px 32px; font-size: 18px; border-radius: 9999px; background: transparent; color: #000000; border: 2px solid #000000; transition: all 0.3s ease; cursor: pointer;">View My Work</button>'
                    ],
                    [
                        'name' => 'Black Solid',
                        'description' => 'Solid black button',
                        'props' => ['content' => 'Get in touch'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '16px 32px',
                            'fontSize' => '18px',
                            'fontWeight' => '600',
                            'borderRadius' => '9999px',
                            'background' => '#000000',
                            'color' => '#ffffff',
                            'border' => 'none',
                            'transition' => 'all 0.3s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button class="inline-flex items-center justify-center font-semibold" style="padding: 16px 32px; font-size: 18px; border-radius: 9999px; background: #000000; color: #ffffff; border: none; transition: all 0.3s ease; cursor: pointer;">Get in touch</button>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 1
            ],

            // ============================================
            // LINK
            // ============================================
            [
                'name' => 'Link',
                'type' => 'link',
                'component_type' => 'element',
                'category' => 'buttons',
                'alphabet_group' => 'L',
                'description' => 'Hyperlink element with various styles',
                'icon' => 'Link',
                'default_props' => [
                    'content' => 'Link',
                    'href' => '#',
                    'target' => '_self',
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Link Text', 'default' => 'Link'],
                    'href' => ['type' => 'string', 'label' => 'URL', 'default' => '#'],
                    'target' => ['type' => 'select', 'label' => 'Target', 'options' => ['_self', '_blank', '_parent', '_top'], 'default' => '_self'],
                ],
                'render_template' => 'link-template',
                'code_generators' => ['react-tailwind' => 'templates/interactive/link.js'],
                'variants' => [
                    [
                        'name' => 'Underline Hover',
                        'description' => 'Link with animated underline',
                        'props' => ['content' => 'Read more', 'href' => '#'],
                        'style' => [
                            'display' => 'inline-block',
                            'position' => 'relative',
                            'color' => '#2563eb',
                            'fontWeight' => '500',
                            'textDecoration' => 'none',
                            'transition' => 'color 0.3s ease',
                        ],
                        'preview_code' => '<a href="#" style="display: inline-block; position: relative; color: #2563eb; font-weight: 500; text-decoration: none; transition: color 0.3s ease;">Read more</a>'
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
                            'transition' => 'all 0.3s ease',
                        ],
                        'preview_code' => '<a href="#" style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700; text-decoration: none; transition: all 0.3s ease;">Explore now</a>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 2
            ],

            // ============================================
            // INPUT
            // ============================================
            [
                'name' => 'Text Input',
                'type' => 'input',
                'component_type' => 'element',
                'category' => 'inputs',
                'alphabet_group' => 'I',
                'description' => 'Text input field with validation states',
                'icon' => 'Type',
                'default_props' => [
                    'type' => 'text',
                    'placeholder' => 'Enter text...',
                    'value' => '',
                    'required' => false,
                    'disabled' => false
                ],
                'prop_definitions' => [
                    'type' => ['type' => 'select', 'label' => 'Input Type', 'options' => ['text', 'email', 'password', 'tel', 'url', 'number', 'date'], 'default' => 'text'],
                    'placeholder' => ['type' => 'string', 'label' => 'Placeholder', 'default' => 'Enter text...'],
                    'value' => ['type' => 'string', 'label' => 'Default Value', 'default' => ''],
                ],
                'render_template' => 'input-template',
                'code_generators' => ['react-tailwind' => 'templates/form/input.js'],
                'variants' => [
                    [
                        'name' => 'Glass Input',
                        'description' => 'Glassmorphism input field',
                        'props' => ['placeholder' => 'Enter email...', 'type' => 'email'],
                        'style' => [
                            'display' => 'block',
                            'width' => '100%',
                            'padding' => '12px 16px',
                            'fontSize' => '16px',
                            'background' => 'rgba(255, 255, 255, 0.1)',
                            'backdropFilter' => 'blur(16px)',
                            'border' => '1px solid rgba(255, 255, 255, 0.2)',
                            'borderRadius' => '12px',
                            'color' => '#ffffff',
                            'outline' => 'none',
                            'transition' => 'all 0.3s ease',
                        ],
                        'preview_code' => '<input type="email" placeholder="Enter email..." style="display: block; width: 100%; padding: 12px 16px; font-size: 16px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; color: #ffffff; outline: none; transition: all 0.3s ease;" />'
                    ],
                    [
                        'name' => 'Standard Input',
                        'description' => 'Clean standard input',
                        'props' => ['placeholder' => 'Email', 'type' => 'email'],
                        'style' => [
                            'display' => 'block',
                            'width' => '100%',
                            'padding' => '12px 16px',
                            'fontSize' => '16px',
                            'background' => '#ffffff',
                            'border' => '2px solid #d1d5db',
                            'borderRadius' => '12px',
                            'color' => '#111827',
                            'outline' => 'none',
                            'transition' => 'all 0.2s ease',
                        ],
                        'preview_code' => '<input type="email" placeholder="Email" style="display: block; width: 100%; padding: 12px 16px; font-size: 16px; background: #ffffff; border: 2px solid #d1d5db; border-radius: 12px; color: #111827; outline: none; transition: all 0.2s ease;" />'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 3
            ],

            // ============================================
            // TEXTAREA
            // ============================================
            [
                'name' => 'Textarea',
                'type' => 'textarea',
                'component_type' => 'element',
                'category' => 'inputs',
                'alphabet_group' => 'T',
                'description' => 'Multi-line text input',
                'icon' => 'AlignLeft',
                'default_props' => [
                    'placeholder' => 'Write your message...',
                    'content' => '',
                    'rows' => 4,
                ],
                'prop_definitions' => [
                    'placeholder' => ['type' => 'string', 'label' => 'Placeholder', 'default' => 'Write your message...'],
                    'content' => ['type' => 'textarea', 'label' => 'Default Value', 'default' => ''],
                    'rows' => ['type' => 'number', 'label' => 'Rows', 'default' => 4, 'min' => 2, 'max' => 20],
                ],
                'render_template' => 'textarea-template',
                'code_generators' => ['react-tailwind' => 'templates/form/textarea.js'],
                'variants' => [
                    [
                        'name' => 'Standard Textarea',
                        'description' => 'Clean textarea design',
                        'props' => ['placeholder' => 'Write your message...', 'rows' => 4],
                        'style' => [
                            'display' => 'block',
                            'width' => '100%',
                            'padding' => '12px 16px',
                            'fontSize' => '16px',
                            'background' => '#ffffff',
                            'border' => '2px solid #d1d5db',
                            'borderRadius' => '12px',
                            'color' => '#111827',
                            'outline' => 'none',
                            'resize' => 'vertical',
                            'transition' => 'all 0.2s ease',
                            'minHeight' => '100px',
                        ],
                        'preview_code' => '<textarea rows="4" placeholder="Write your message..." style="display: block; width: 100%; padding: 12px 16px; font-size: 16px; background: #ffffff; border: 2px solid #d1d5db; border-radius: 12px; color: #111827; outline: none; resize: vertical; transition: all 0.2s ease; min-height: 100px;"></textarea>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 4
            ],

            // ============================================
            // PARAGRAPH
            // ============================================
            [
                'name' => 'Paragraph',
                'type' => 'p',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'P',
                'description' => 'Text paragraph element',
                'icon' => 'Type',
                'default_props' => [
                    'content' => 'Lorem ipsum dolor sit amet.',
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Paragraph Text', 'default' => 'Lorem ipsum dolor sit amet.'],
                ],
                'render_template' => 'paragraph-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/paragraph.js'],
                'variants' => [
                    [
                        'name' => 'Body Text',
                        'description' => 'Standard paragraph',
                        'props' => ['content' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'],
                        'style' => [
                            'fontSize' => '16px',
                            'lineHeight' => '1.7',
                            'color' => '#374151',
                            'margin' => '0',
                        ],
                        'preview_code' => '<p style="font-size: 16px; line-height: 1.7; color: #374151; margin: 0;">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>'
                    ],
                    [
                        'name' => 'Large Text',
                        'description' => 'Large body text',
                        'props' => ['content' => 'Large readable text for emphasis.'],
                        'style' => [
                            'fontSize' => '20px',
                            'lineHeight' => '1.6',
                            'color' => '#111827',
                            'fontWeight' => '400',
                            'margin' => '0',
                        ],
                        'preview_code' => '<p style="font-size: 20px; line-height: 1.6; color: #111827; font-weight: 400; margin: 0;">Large readable text for emphasis.</p>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 6
            ],
            
            // ============================================
            // BADGE
            // ============================================
            [
                'name' => 'Badge',
                'type' => 'badge',
                'component_type' => 'element',
                'category' => 'feedback',
                'alphabet_group' => 'B',
                'description' => 'Small status or label badge',
                'icon' => 'Tag',
                'default_props' => [
                    'content' => 'Open To New Opportunities',
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Badge Text', 'default' => 'Open To New Opportunities'],
                ],
                'render_template' => 'badge-template',
                'code_generators' => ['react-tailwind' => 'templates/display/badge.js'],
                'variants' => [
                    [
                        'name' => 'Status Badge',
                        'description' => 'Badge with green dot indicator',
                        'props' => ['content' => 'Open To New Opportunities'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'gap' => '8px',
                            'padding' => '8px 16px',
                            'fontSize' => '14px',
                            'fontWeight' => '500',
                            'borderRadius' => '9999px',
                            'background' => 'rgba(255, 255, 255, 0.9)',
                            'border' => '1px solid #e5e7eb',
                            'color' => '#374151',
                        ],
                        'preview_code' => '<span style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; font-size: 14px; font-weight: 500; border-radius: 9999px; background: rgba(255, 255, 255, 0.9); border: 1px solid #e5e7eb; color: #374151;"><span style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></span>Open To New Opportunities</span>'
                    ],
                    [
                        'name' => 'Primary Badge',
                        'description' => 'Badge with primary colors',
                        'props' => ['content' => 'New'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'padding' => '4px 12px',
                            'fontSize' => '12px',
                            'fontWeight' => '600',
                            'borderRadius' => '9999px',
                            'background' => '#3b82f6',
                            'color' => '#ffffff',
                        ],
                        'preview_code' => '<span style="display: inline-flex; align-items: center; padding: 4px 12px; font-size: 12px; font-weight: 600; border-radius: 9999px; background: #3b82f6; color: #ffffff;">New</span>'
                    ],
                    [
                        'name' => 'Outline Badge',
                        'description' => 'Badge with border only',
                        'props' => ['content' => 'Featured'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'padding' => '4px 12px',
                            'fontSize' => '12px',
                            'fontWeight' => '500',
                            'borderRadius' => '9999px',
                            'background' => 'transparent',
                            'border' => '1px solid #000000',
                            'color' => '#000000',
                        ],
                        'preview_code' => '<span style="display: inline-flex; align-items: center; padding: 4px 12px; font-size: 12px; font-weight: 500; border-radius: 9999px; background: transparent; border: 1px solid #000000; color: #000000;">Featured</span>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 7
            ],

            // ============================================
            // HEADING 1
            // ============================================
            [
                'name' => 'Heading 1',
                'type' => 'h1',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'H',
                'description' => 'Primary page heading',
                'icon' => 'Type',
                'default_props' => [
                    'content' => 'Heading 1',
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Heading Text', 'default' => 'Heading 1'],
                ],
                'render_template' => 'h1-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/h1.js'],
                'variants' => [
                    [
                        'name' => 'Black Heading',
                        'description' => 'Bold black heading',
                        'props' => ['content' => 'Hello'],
                        'style' => [
                            'fontSize' => '96px',
                            'fontWeight' => '700',
                            'color' => '#000000',
                            'lineHeight' => '1.1',
                            'margin' => '0',
                        ],
                        'preview_code' => '<h1 style="font-size: 96px; font-weight: 700; color: #000000; line-height: 1.1; margin: 0;">Hello, I\'m UXZehra</h1>'
                    ],
                    [
                        'name' => 'Subtle Gold Gradient',
                        'description' => 'Black with subtle gold shimmer',
                        'props' => ['content' => 'Premium Heading'],
                        'style' => [
                            'fontSize' => '96px',
                            'fontWeight' => '700',
                            'background' => 'linear-gradient(135deg, #000000 0%, #1a1a1a 45%, #d4af37 50%, #1a1a1a 55%, #000000 100%)',
                            'WebkitBackgroundClip' => 'text',
                            'WebkitTextFillColor' => 'transparent',
                            'backgroundClip' => 'text',
                            'lineHeight' => '1.1',
                            'margin' => '0',
                        ],
                        'preview_code' => '<h1 style="font-size: 96px; font-weight: 700; background: linear-gradient(135deg, #000000 0%, #1a1a1a 45%, #d4af37 50%, #1a1a1a 55%, #000000 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1.1; margin: 0;">Premium Heading</h1>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 8
            ],

            // ============================================
            // IMAGE
            // ============================================
            [
                'name' => 'Image',
                'type' => 'image',
                'component_type' => 'element',
                'category' => 'media',
                'alphabet_group' => 'I',
                'description' => 'Image element with URL support',
                'icon' => 'Image',
                'default_props' => [
                    'url' => '',
                    'alt' => '',
                    'loading' => 'lazy',
                ],
                'prop_definitions' => [
                    'url' => ['type' => 'url', 'label' => 'Image URL', 'default' => ''],
                    'alt' => ['type' => 'string', 'label' => 'Alt Text', 'default' => ''],
                    'loading' => ['type' => 'select', 'label' => 'Loading', 'options' => ['lazy', 'eager'], 'default' => 'lazy'],
                ],
                'render_template' => 'image-template',
                'code_generators' => ['react-tailwind' => 'templates/media/image.js'],
                'variants' => [],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 9
            ],

            // ============================================
            // VIDEO
            // ============================================
            [
                'name' => 'Video',
                'type' => 'video',
                'component_type' => 'element',
                'category' => 'media',
                'alphabet_group' => 'V',
                'description' => 'Video element with URL support',
                'icon' => 'Play',
                'default_props' => [
                    'url' => '',
                    'autoplay' => false,
                    'controls' => true,
                    'loop' => false,
                    'muted' => false,
                ],
                'prop_definitions' => [
                    'url' => ['type' => 'url', 'label' => 'Video URL', 'default' => ''],
                    'autoplay' => ['type' => 'boolean', 'label' => 'Autoplay', 'default' => false],
                    'controls' => ['type' => 'boolean', 'label' => 'Show Controls', 'default' => true],
                    'loop' => ['type' => 'boolean', 'label' => 'Loop', 'default' => false],
                    'muted' => ['type' => 'boolean', 'label' => 'Muted', 'default' => false],
                ],
                'render_template' => 'video-template',
                'code_generators' => ['react-tailwind' => 'templates/media/video.js'],
                'variants' => [],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 10
            ],

            // ============================================
            // AUDIO
            // ============================================
            [
                'name' => 'Audio',
                'type' => 'audio',
                'component_type' => 'element',
                'category' => 'media',
                'alphabet_group' => 'A',
                'description' => 'Audio element with URL support',
                'icon' => 'Volume2',
                'default_props' => [
                    'url' => '',
                    'autoplay' => false,
                    'controls' => true,
                    'loop' => false,
                ],
                'prop_definitions' => [
                    'url' => ['type' => 'url', 'label' => 'Audio URL', 'default' => ''],
                    'autoplay' => ['type' => 'boolean', 'label' => 'Autoplay', 'default' => false],
                    'controls' => ['type' => 'boolean', 'label' => 'Show Controls', 'default' => true],
                    'loop' => ['type' => 'boolean', 'label' => 'Loop', 'default' => false],
                ],
                'render_template' => 'audio-template',
                'code_generators' => ['react-tailwind' => 'templates/media/audio.js'],
                'variants' => [],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 11
            ],

            // ============================================
            // GIF
            // ============================================
            [
                'name' => 'Gif',
                'type' => 'gif',
                'component_type' => 'element',
                'category' => 'media',
                'alphabet_group' => 'G',
                'description' => 'Animated GIF element with URL support',
                'icon' => 'Image',
                'default_props' => [
                    'url' => '',
                    'alt' => '',
                ],
                'prop_definitions' => [
                    'url' => ['type' => 'url', 'label' => 'GIF URL', 'default' => ''],
                    'alt' => ['type' => 'string', 'label' => 'Alt Text', 'default' => ''],
                ],
                'render_template' => 'gif-template',
                'code_generators' => ['react-tailwind' => 'templates/media/gif.js'],
                'variants' => [],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 12
            ],

            // ============================================
            // ICON
            // ============================================
            [
                'name' => 'Icon',
                'type' => 'icon',
                'component_type' => 'element',
                'category' => 'feedback',
                'alphabet_group' => 'I',
                'description' => 'Icon element with SVG support',
                'icon' => 'Sparkles',
                'default_props' => [
                    'url' => '',
                    'svgCode' => '',
                    'name' => '',
                    'size' => '24',
                ],
                'prop_definitions' => [
                    'url' => ['type' => 'url', 'label' => 'Icon URL', 'default' => ''],
                    'svgCode' => ['type' => 'textarea', 'label' => 'SVG Code', 'default' => ''],
                    'name' => ['type' => 'string', 'label' => 'Icon Name', 'default' => ''],
                    'size' => ['type' => 'number', 'label' => 'Size (px)', 'default' => 24, 'min' => 8, 'max' => 128],
                ],
                'render_template' => 'icon-template',
                'code_generators' => ['react-tailwind' => 'templates/display/icon.js'],
                'variants' => [],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 13
            ],
        ];

        foreach ($basicElements as $element) {
            Component::create($element);
        }
    }
}