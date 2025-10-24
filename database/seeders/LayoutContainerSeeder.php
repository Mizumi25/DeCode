<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class LayoutContainerSeeder extends Seeder
{
    public function run(): void
    {
        $layoutContainers = [
            // ============================================
            // SECTION
            // ============================================
            [
                'name' => 'Section',
                'type' => 'section',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'S',
                'description' => 'Semantic section element - main page structure container',
                'icon' => 'Layout',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'section-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/section.js'],
                'variants' => [
                    [
                        'name' => 'Hero Section',
                        'description' => 'Large hero section with gradient background',
                        'props' => [], // ✅ NO STYLES
                        'style' => [ // ✅ ALL STYLES (CSS)
                            'width' => '100%',
                            'minHeight' => '100vh',
                            'display' => 'flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '128px 32px',
                            'background' => 'linear-gradient(135deg, #2563eb 0%, #9333ea 100%)',
                            'color' => '#ffffff',
                        ],
                        'preview_code' => '<section style="width: 100%; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 128px 32px; background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%); color: #ffffff;"><div style="text-align: center;"><h1 style="font-size: 60px; font-weight: 700; margin-bottom: 24px;">Hero Title</h1><p style="font-size: 20px; margin-bottom: 32px;">Amazing subtitle here</p></div></section>'
                    ],
                    [
                        'name' => 'Content Section',
                        'description' => 'Standard content section',
                        'props' => [],
                        'style' => [
                            'width' => '100%',
                            'padding' => '64px 24px',
                            'background' => '#f9fafb',
                        ],
                        'preview_code' => '<section style="width: 100%; padding: 64px 24px; background: #f9fafb;"><div style="max-width: 1280px; margin: 0 auto;"><h2 style="font-size: 30px; font-weight: 700; margin-bottom: 32px; text-align: center;">Our Services</h2></div></section>'
                    ],
                    [
                        'name' => 'Full Height Section',
                        'description' => 'Full viewport height section',
                        'props' => [],
                        'style' => [
                            'width' => '100%',
                            'height' => '100vh',
                            'display' => 'flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '0',
                            'background' => '#000000',
                            'color' => '#ffffff',
                        ],
                        'preview_code' => '<section style="width: 100%; height: 100vh; display: flex; align-items: center; justify-content: center; padding: 0; background: #000000; color: #ffffff;"><div style="text-align: center;"><h1 style="font-size: 48px; font-weight: 700; margin-bottom: 16px;">Full Height Section</h1><p style="font-size: 20px;">Perfect for landing pages</p></div></section>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 1
            ],

            // ============================================
            // CONTAINER
            // ============================================
            [
                'name' => 'Container',
                'type' => 'container',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'C',
                'description' => 'Content width container with max-width constraints',
                'icon' => 'Square',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'container-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/container.js'],
                'variants' => [
                    [
                        'name' => 'Centered Container',
                        'description' => 'Standard centered content container',
                        'props' => [],
                        'style' => [
                            'width' => '100%',
                            'maxWidth' => '1152px',
                            'margin' => '0 auto',
                            'padding' => '0 24px',
                        ],
                        'preview_code' => '<div style="width: 100%; max-width: 1152px; margin: 0 auto; padding: 0 24px;"><div style="background: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; padding: 32px;"><h3 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Centered Content</h3><p style="color: #6b7280;">This content is perfectly centered and constrained to a readable width.</p></div></div>'
                    ],
                    [
                        'name' => 'Narrow Container',
                        'description' => 'Narrow container for forms',
                        'props' => [],
                        'style' => [
                            'width' => '100%',
                            'maxWidth' => '672px',
                            'margin' => '0 auto',
                            'padding' => '0 32px',
                        ],
                        'preview_code' => '<div style="width: 100%; max-width: 672px; margin: 0 auto; padding: 0 32px;"><div style="background: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 32px;"><h2 style="font-size: 30px; font-weight: 700; margin-bottom: 24px; text-align: center;">Sign Up</h2></div></div>'
                    ],
                    [
                        'name' => 'Wide Container',
                        'description' => 'Wide container for dashboards',
                        'props' => [],
                        'style' => [
                            'width' => '100%',
                            'maxWidth' => '100%',
                            'margin' => '0 auto',
                            'padding' => '0 16px',
                        ],
                        'preview_code' => '<div style="width: 100%; max-width: 100%; margin: 0 auto; padding: 0 16px;"><div style="background: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; overflow: hidden;"><div style="padding: 24px; border-bottom: 1px solid #e5e7eb;"><h2 style="font-size: 24px; font-weight: 700;">Dashboard</h2></div></div></div>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 2
            ],

            // ============================================
            // FLEX CONTAINER
            // ============================================
            [
                'name' => 'Flex Container',
                'type' => 'flex',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'F',
                'description' => 'Flexible layout container with flexbox',
                'icon' => 'Columns',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'flex-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/flex.js'],
                'variants' => [
                    [
                        'name' => 'Navbar Layout',
                        'description' => 'Horizontal navbar',
                        'props' => [],
                        'style' => [
                            'width' => '100%',
                            'display' => 'flex',
                            'flexDirection' => 'row',
                            'justifyContent' => 'space-between',
                            'alignItems' => 'center',
                            'gap' => '32px',
                            'padding' => '24px',
                            'background' => '#ffffff',
                            'borderBottom' => '1px solid #e5e7eb',
                            ],
                        'preview_code' => '<div style="width: 100%; display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 32px; padding: 24px; background: #ffffff; border-bottom: 1px solid #e5e7eb;"><div style="font-weight: 700; font-size: 24px; color: #111827;">Logo</div><nav style="display: flex; gap: 24px;"><a style="color: #6b7280;">Home</a><a style="color: #6b7280;">About</a><a style="color: #6b7280;">Contact</a></nav><button style="background: #2563eb; color: #ffffff; padding: 8px 24px; border-radius: 8px; border: none;">Sign In</button></div>'
                    ],
                    [
                        'name' => 'Card Grid',
                        'description' => 'Responsive card layout',
                        'props' => [],
                        'style' => [
                            'width' => '100%',
                            'display' => 'flex',
                            'flexDirection' => 'row',
                            'justifyContent' => 'center',
                            'alignItems' => 'stretch',
                            'gap' => '24px',
                            'flexWrap' => 'wrap',
                            'padding' => '32px',
                        ],
                        'preview_code' => '<div style="width: 100%; display: flex; flex-direction: row; justify-content: center; align-items: stretch; gap: 24px; flex-wrap: wrap; padding: 32px;"><div style="background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 24px; flex: 1; min-width: 288px;"><h3 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Feature 1</h3><p style="color: #6b7280;">Description here</p></div><div style="background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 24px; flex: 1; min-width: 288px;"><h3 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Feature 2</h3><p style="color: #6b7280;">Description here</p></div></div>'
                    ],
                    [
                        'name' => 'Sidebar Layout',
                        'description' => 'Sidebar with main content',
                        'props' => [],
                        'style' => [
                            'width' => '100%',
                            'height' => '100vh',
                            'display' => 'flex',
                            'flexDirection' => 'row',
                            'justifyContent' => 'flex-start',
                            'alignItems' => 'stretch',
                            'gap' => '0',
                        ],
                        'preview_code' => '<div style="width: 100%; height: 100vh; display: flex; flex-direction: row;"><aside style="width: 256px; background: #111827; color: #ffffff; padding: 24px;"><h2 style="font-size: 20px; font-weight: 700; margin-bottom: 24px;">Navigation</h2><nav style="display: flex; flex-direction: column; gap: 8px;"><a style="display: block; padding: 8px 16px; border-radius: 8px;">Dashboard</a><a style="display: block; padding: 8px 16px; border-radius: 8px;">Projects</a></nav></aside><main style="flex: 1; background: #f9fafb; padding: 32px;"><h1 style="font-size: 30px; font-weight: 700; margin-bottom: 24px;">Main Content</h1><p>Content goes here...</p></main></div>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 3
            ],

            // ============================================
            // GRID CONTAINER
            // ============================================
            [
                'name' => 'Grid Container',
                'type' => 'grid',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'G',
                'description' => 'Advanced CSS Grid container',
                'icon' => 'Grid3X3',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'grid-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/grid.js'],
                'variants' => [
                    [
                        'name' => 'Dashboard Grid',
                        'description' => 'Dashboard layout',
                        'props' => [],
                        'style' => [
                            'width' => '100%',
                            'height' => '100vh',
                            'display' => 'grid',
                            'gridTemplateColumns' => 'repeat(12, 1fr)',
                            'gridTemplateRows' => 'repeat(4, 1fr)',
                            'gap' => '24px',
                            'padding' => '24px',
                        ],
                        'preview_code' => '<div style="width: 100%; height: 100vh; display: grid; grid-template-columns: repeat(12, 1fr); grid-template-rows: repeat(4, 1fr); gap: 24px; padding: 24px;"><div style="grid-column: span 8; grid-row: span 2; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; padding: 24px;"><h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Main Chart</h2><div style="background: #f3f4f6; height: 100%; border-radius: 8px; display: flex; align-items: center; justify-content: center;">Chart Area</div></div><div style="grid-column: span 4; grid-row: span 1; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; padding: 24px;"><h3 style="font-weight: 700; margin-bottom: 8px;">Stats</h3><p style="font-size: 30px; font-weight: 700; color: #2563eb;">$12,345</p></div></div>'
                    ],
                    [
                        'name' => 'Photo Gallery',
                        'description' => 'Responsive photo gallery',
                        'props' => [],
                        'style' => [
                            'width' => '100%',
                            'display' => 'grid',
                            'gridTemplateColumns' => 'repeat(auto-fill, minmax(250px, 1fr))',
                            'gap' => '16px',
                            'padding' => '24px',
                        ],
                        'preview_code' => '<div style="width: 100%; display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; padding: 24px;"><div style="aspect-ratio: 1; background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); border-radius: 8px;"></div><div style="aspect-ratio: 1; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); border-radius: 8px;"></div><div style="aspect-ratio: 1; background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); border-radius: 8px;"></div><div style="aspect-ratio: 1; background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); border-radius: 8px;"></div></div>'
                    ],
                    [
                        'name' => 'Magazine Layout',
                        'description' => 'Complex grid layout',
                        'props' => [],
                        'style' => [
                            'width' => '100%',
                            'height' => '100vh',
                            'display' => 'grid',
                            'gridTemplateColumns' => 'repeat(6, 1fr)',
                            'gridTemplateRows' => 'repeat(6, 1fr)',
                            'gap' => '16px',
                            'padding' => '24px',
                        ],
                        'preview_code' => '<div style="width: 100%; height: 100vh; display: grid; grid-template-columns: repeat(6, 1fr); grid-template-rows: repeat(6, 1fr); gap: 16px; padding: 24px;"><div style="grid-column: span 4; grid-row: span 3; background: linear-gradient(135deg, #9333ea 0%, #2563eb 100%); border-radius: 12px; color: #ffffff; padding: 32px; display: flex; align-items: flex-end;"><h1 style="font-size: 36px; font-weight: 700;">Featured Article</h1></div><div style="grid-column: span 2; grid-row: span 2; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; padding: 24px;"><h3 style="font-weight: 700; margin-bottom: 8px;">Side Story 1</h3></div></div>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 4
            ],

            // ============================================
            // DIV CONTAINER
            // ============================================
            [
                'name' => 'Div Container',
                'type' => 'div',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'D',
                'description' => 'Generic div container - fully customizable',
                'icon' => 'Square',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'div-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/div.js'],
                'variants' => [
                    [
                        'name' => 'Content Block',
                        'description' => 'Basic content container',
                        'props' => [],
                        'style' => [
                            'width' => '100%',
                            'padding' => '24px',
                            'background' => '#ffffff',
                            'borderRadius' => '8px',
                            'border' => '1px solid #e5e7eb',
                        ],
                        'preview_code' => '<div style="width: 100%; padding: 24px; background: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb;"><div style="height: 128px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 14px; font-weight: 500;">Content Block</div></div>'
                    ],
                    [
                        'name' => 'Card Wrapper',
                        'description' => 'Card-style wrapper',
                        'props' => [],
                        'style' => [
                            'width' => '100%',
                            'maxWidth' => '448px',
                            'margin' => '0 auto',
                            'background' => '#ffffff',
                            'borderRadius' => '12px',
                            'boxShadow' => '0 4px 12px rgba(0, 0, 0, 0.1)',
                            'overflow' => 'hidden',
                        ],
                        'preview_code' => '<div style="width: 100%; max-width: 448px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden;"><div style="padding: 32px;"><div style="height: 96px; background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%); border-radius: 8px; margin-bottom: 16px;"></div><h3 style="font-size: 20px; font-weight: 700; color: #111827;">Card Title</h3><p style="color: #6b7280; margin-top: 8px;">Card description goes here</p></div></div>'
                    ],
                    [
                        'name' => 'Overlay Container',
                        'description' => 'Container with overlay',
                        'props' => [],
                        'style' => [
                            'position' => 'relative',
                            'width' => '100%',
                            'height' => '256px',
                            'background' => '#111827',
                            'borderRadius' => '8px',
                            'overflow' => 'hidden',
                        ],
                        'preview_code' => '<div style="position: relative; width: 100%; height: 256px; background: #111827; border-radius: 8px; overflow: hidden;"><div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%);"></div><div style="position: absolute; bottom: 24px; left: 24px; color: #ffffff;"><h3 style="font-size: 24px; font-weight: 700;">Overlay Content</h3><p style="color: #d1d5db;">Perfect for hero sections</p></div></div>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 5
            ]
        ];

        foreach ($layoutContainers as $container) {
            Component::create($container);
        }
    }
}