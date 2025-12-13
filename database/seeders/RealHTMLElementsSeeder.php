<?php
// database/seeders/RealHTMLElementsSeeder.php - 100+ REAL HTML Elements (NO MEDIA)
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class RealHTMLElementsSeeder extends Seeder
{
    public function run(): void
    {
        $realElements = [
            // ============================================
            // ACTUAL HTML5 SPEC ELEMENTS (NO MEDIA)
            // ============================================
            
            [
                'name' => 'Address',
                'type' => 'address',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'A',
                'description' => 'Contact information for author/owner',
                'icon' => 'MapPin',
                'default_props' => ['content' => '123 Main St, City, State'],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Address', 'default' => '123 Main St, City, State'],
                ],
                'render_template' => 'address-template',
                'code_generators' => ['react-tailwind' => 'templates/text/address.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Address',
                        'description' => 'Standard address',
                        'props' => ['content' => '123 Main St\nCity, State 12345'],
                        'style' => ['fontStyle' => 'italic', 'color' => '#4b5563', 'lineHeight' => '1.5'],
                        'preview_code' => '<address style="font-style: italic; color: #4b5563; line-height: 1.5;">123 Main St<br>City, State 12345</address>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean minimal style',
                        'style' => ['fontSize' => '14px', 'color' => '#6b7280', 'fontStyle' => 'normal', 'lineHeight' => '1.6'],
                        'preview_code' => '<address style="font-size: 14px; color: #6b7280; font-style: normal; line-height: 1.6;">contact@example.com</address>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business card style',
                        'style' => ['borderLeft' => '3px solid #3b82f6', 'paddingLeft' => '16px', 'fontFamily' => 'system-ui', 'color' => '#111827'],
                        'preview_code' => '<address style="border-left: 3px solid #3b82f6; padding-left: 16px; font-family: system-ui; color: #111827;">Corporate HQ<br>Business District</address>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled with gradient background',
                        'style' => ['background' => 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', 'padding' => '16px', 'borderRadius' => '8px', 'fontWeight' => '500'],
                        'preview_code' => '<address style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 16px; border-radius: 8px; font-weight: 500;">Design Studio<br>Creative Quarter</address>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Tech cyberpunk style',
                        'style' => ['background' => '#0f172a', 'color' => '#00ff88', 'padding' => '12px', 'fontFamily' => 'monospace', 'border' => '1px solid #00ff88', 'borderRadius' => '4px'],
                        'preview_code' => '<address style="background: #0f172a; color: #00ff88; padding: 12px; font-family: monospace; border: 1px solid #00ff88; border-radius: 4px;">TechLab<br>Cyber Plaza</address>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Bold corporate style',
                        'style' => ['backgroundColor' => '#000000', 'color' => '#ffffff', 'padding' => '20px', 'fontWeight' => '700', 'textTransform' => 'uppercase', 'letterSpacing' => '1px'],
                        'preview_code' => '<address style="background-color: #000000; color: #ffffff; padding: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">HEADQUARTERS<br>TOWER DISTRICT</address>'
                    ]
                ],
                'sort_order' => 39
            ],

            [
                'name' => 'Abbreviation',
                'type' => 'abbr',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'A',
                'description' => 'Abbreviation or acronym',
                'icon' => 'Type',
                'default_props' => ['content' => 'HTML', 'title' => 'HyperText Markup Language'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Abbreviation', 'default' => 'HTML'],
                    'title' => ['type' => 'string', 'label' => 'Full Form', 'default' => 'HyperText Markup Language'],
                ],
                'render_template' => 'abbr-template',
                'code_generators' => ['react-tailwind' => 'templates/text/abbr.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Abbreviation',
                        'description' => 'Standard abbreviation',
                        'style' => ['textDecoration' => 'underline dotted', 'cursor' => 'help'],
                        'preview_code' => '<abbr title="Application Programming Interface" style="text-decoration: underline dotted; cursor: help;">API</abbr>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Subtle dotted border',
                        'style' => ['borderBottom' => '1px dotted #6b7280', 'textDecoration' => 'none', 'cursor' => 'help'],
                        'preview_code' => '<abbr title="Cascading Style Sheets" style="border-bottom: 1px dotted #6b7280; text-decoration: none; cursor: help;">CSS</abbr>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business style with blue accent',
                        'style' => ['fontWeight' => '600', 'color' => '#1e40af', 'borderBottom' => '2px solid #3b82f6', 'textDecoration' => 'none', 'cursor' => 'help'],
                        'preview_code' => '<abbr title="Chief Executive Officer" style="font-weight: 600; color: #1e40af; border-bottom: 2px solid #3b82f6; text-decoration: none; cursor: help;">CEO</abbr>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Gradient text effect',
                        'style' => ['background' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'WebkitBackgroundClip' => 'text', 'WebkitTextFillColor' => 'transparent', 'fontWeight' => '700', 'textDecoration' => 'none', 'cursor' => 'help'],
                        'preview_code' => '<abbr title="User Interface" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; text-decoration: none; cursor: help;">UI</abbr>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Matrix-style monospace',
                        'style' => ['fontFamily' => 'monospace', 'backgroundColor' => '#0f172a', 'color' => '#00ff88', 'padding' => '2px 6px', 'borderRadius' => '3px', 'textDecoration' => 'none', 'cursor' => 'help'],
                        'preview_code' => '<abbr title="Artificial Intelligence" style="font-family: monospace; background-color: #0f172a; color: #00ff88; padding: 2px 6px; border-radius: 3px; text-decoration: none; cursor: help;">AI</abbr>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Bold red emphasis',
                        'style' => ['fontWeight' => '900', 'textTransform' => 'uppercase', 'color' => '#dc2626', 'letterSpacing' => '1px', 'borderBottom' => '3px solid #dc2626', 'textDecoration' => 'none', 'cursor' => 'help'],
                        'preview_code' => '<abbr title="National Aeronautics and Space Administration" style="font-weight: 900; text-transform: uppercase; color: #dc2626; letter-spacing: 1px; border-bottom: 3px solid #dc2626; text-decoration: none; cursor: help;">NASA</abbr>'
                    ]
                ],
                'sort_order' => 40
            ],


            // ============================================
            // MORE REAL HTML5 ELEMENTS
            // ============================================
            
            [
                'name' => 'Citation',
                'type' => 'cite',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'C',
                'description' => 'Title of cited work',
                'icon' => 'Quote',
                'default_props' => ['content' => 'Book Title'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Citation Text', 'default' => 'Book Title'],
                ],
                'render_template' => 'cite-template',
                'code_generators' => ['react-tailwind' => 'templates/text/cite.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Citation',
                        'description' => 'Standard citation',
                        'style' => ['fontStyle' => 'italic'],
                        'preview_code' => '<cite style="font-style: italic;">The Great Gatsby</cite>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Subtle citation',
                        'style' => ['fontStyle' => 'italic', 'color' => '#6b7280', 'fontSize' => '0.95em'],
                        'preview_code' => '<cite style="font-style: italic; color: #6b7280; font-size: 0.95em;">Scientific Journal</cite>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Academic citation style',
                        'style' => ['fontStyle' => 'italic', 'fontWeight' => '500', 'color' => '#1e40af', 'borderLeft' => '2px solid #3b82f6', 'paddingLeft' => '8px'],
                        'preview_code' => '<cite style="font-style: italic; font-weight: 500; color: #1e40af; border-left: 2px solid #3b82f6; padding-left: 8px;">Research Paper</cite>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled book citation',
                        'style' => ['fontStyle' => 'italic', 'background' => 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)', 'padding' => '8px 12px', 'borderRadius' => '6px', 'fontFamily' => 'Georgia, serif'],
                        'preview_code' => '<cite style="font-style: italic; background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); padding: 8px 12px; border-radius: 6px; font-family: Georgia, serif;">Classic Novel</cite>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Digital citation',
                        'style' => ['fontStyle' => 'italic', 'fontFamily' => 'monospace', 'backgroundColor' => '#1f2937', 'color' => '#60a5fa', 'padding' => '4px 8px', 'borderRadius' => '4px'],
                        'preview_code' => '<cite style="font-style: italic; font-family: monospace; background-color: #1f2937; color: #60a5fa; padding: 4px 8px; border-radius: 4px;">Digital Source</cite>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Emphasized citation',
                        'style' => ['fontStyle' => 'italic', 'fontWeight' => '700', 'color' => '#dc2626', 'textTransform' => 'uppercase', 'letterSpacing' => '0.5px'],
                        'preview_code' => '<cite style="font-style: italic; font-weight: 700; color: #dc2626; text-transform: uppercase; letter-spacing: 0.5px;">Important Work</cite>'
                    ]
                ],
                'sort_order' => 42
            ],

            [
                'name' => 'Definition',
                'type' => 'dfn',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'D',
                'description' => 'Term being defined',
                'icon' => 'BookOpen',
                'default_props' => ['content' => 'Definition term'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Term', 'default' => 'Definition term'],
                ],
                'render_template' => 'dfn-template',
                'code_generators' => ['react-tailwind' => 'templates/text/dfn.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Definition',
                        'description' => 'Standard definition',
                        'style' => ['fontStyle' => 'italic', 'fontWeight' => '500'],
                        'preview_code' => '<dfn style="font-style: italic; font-weight: 500;">Algorithm</dfn>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean definition style',
                        'style' => ['fontWeight' => '600', 'color' => '#374151', 'borderBottom' => '1px dotted #9ca3af'],
                        'preview_code' => '<dfn style="font-weight: 600; color: #374151; border-bottom: 1px dotted #9ca3af;">Variable</dfn>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Technical definition',
                        'style' => ['fontWeight' => '600', 'color' => '#1e40af', 'backgroundColor' => '#eff6ff', 'padding' => '2px 6px', 'borderRadius' => '4px'],
                        'preview_code' => '<dfn style="font-weight: 600; color: #1e40af; background-color: #eff6ff; padding: 2px 6px; border-radius: 4px;">API</dfn>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Highlighted definition',
                        'style' => ['fontWeight' => '600', 'background' => 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)', 'padding' => '4px 8px', 'borderRadius' => '6px', 'color' => '#92400e'],
                        'preview_code' => '<dfn style="font-weight: 600; background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); padding: 4px 8px; border-radius: 6px; color: #92400e;">Function</dfn>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Code-style definition',
                        'style' => ['fontFamily' => 'monospace', 'fontWeight' => '600', 'backgroundColor' => '#0f172a', 'color' => '#06ffa5', 'padding' => '4px 8px', 'borderRadius' => '4px', 'border' => '1px solid #06ffa5'],
                        'preview_code' => '<dfn style="font-family: monospace; font-weight: 600; background-color: #0f172a; color: #06ffa5; padding: 4px 8px; border-radius: 4px; border: 1px solid #06ffa5;">Object</dfn>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Bold definition',
                        'style' => ['fontWeight' => '900', 'color' => '#dc2626', 'textTransform' => 'uppercase', 'letterSpacing' => '1px', 'borderBottom' => '2px solid #dc2626'],
                        'preview_code' => '<dfn style="font-weight: 900; color: #dc2626; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #dc2626;">Class</dfn>'
                    ]
                ],
                'sort_order' => 43
            ],

            [
                'name' => 'Deleted Text',
                'type' => 'del',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'D',
                'description' => 'Deleted text (strikethrough)',
                'icon' => 'Strikethrough',
                'default_props' => ['content' => 'Deleted text'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Deleted Text', 'default' => 'Deleted text'],
                ],
                'render_template' => 'del-template',
                'code_generators' => ['react-tailwind' => 'templates/text/del.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Deleted',
                        'description' => 'Standard strikethrough',
                        'style' => ['textDecoration' => 'line-through'],
                        'preview_code' => '<del style="text-decoration: line-through;">Old text</del>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Subtle deletion',
                        'style' => ['textDecoration' => 'line-through', 'color' => '#9ca3af', 'opacity' => '0.7'],
                        'preview_code' => '<del style="text-decoration: line-through; color: #9ca3af; opacity: 0.7;">Outdated info</del>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Document revision style',
                        'style' => ['textDecoration' => 'line-through', 'backgroundColor' => '#fef2f2', 'color' => '#991b1b', 'padding' => '2px 4px', 'borderRadius' => '3px'],
                        'preview_code' => '<del style="text-decoration: line-through; background-color: #fef2f2; color: #991b1b; padding: 2px 4px; border-radius: 3px;">Removed clause</del>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Stylized deletion',
                        'style' => ['textDecoration' => 'line-through', 'background' => 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', 'padding' => '4px 8px', 'borderRadius' => '6px', 'color' => '#b91c1c'],
                        'preview_code' => '<del style="text-decoration: line-through; background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); padding: 4px 8px; border-radius: 6px; color: #b91c1c;">Changed text</del>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Matrix deletion',
                        'style' => ['textDecoration' => 'line-through', 'fontFamily' => 'monospace', 'backgroundColor' => '#1f2937', 'color' => '#f87171', 'padding' => '2px 6px', 'borderRadius' => '3px'],
                        'preview_code' => '<del style="text-decoration: line-through; font-family: monospace; background-color: #1f2937; color: #f87171; padding: 2px 6px; border-radius: 3px;">Deleted code</del>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Bold crossed out',
                        'style' => ['textDecoration' => 'line-through', 'fontWeight' => '700', 'color' => '#dc2626', 'fontSize' => '1.1em', 'textDecorationThickness' => '3px'],
                        'preview_code' => '<del style="text-decoration: line-through; font-weight: 700; color: #dc2626; font-size: 1.1em; text-decoration-thickness: 3px;">CANCELLED</del>'
                    ]
                ],
                'sort_order' => 44
            ],

            [
                'name' => 'Inserted Text',
                'type' => 'ins',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'I',
                'description' => 'Inserted text (underlined)',
                'icon' => 'Plus',
                'default_props' => ['content' => 'Inserted text'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Inserted Text', 'default' => 'Inserted text'],
                ],
                'render_template' => 'ins-template',
                'code_generators' => ['react-tailwind' => 'templates/text/ins.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Inserted',
                        'description' => 'Standard underlined',
                        'style' => ['textDecoration' => 'underline'],
                        'preview_code' => '<ins style="text-decoration: underline;">New text</ins>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Subtle addition',
                        'style' => ['textDecoration' => 'underline', 'color' => '#065f46', 'textDecorationColor' => '#10b981'],
                        'preview_code' => '<ins style="text-decoration: underline; color: #065f46; text-decoration-color: #10b981;">Added info</ins>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Document addition style',
                        'style' => ['textDecoration' => 'underline', 'backgroundColor' => '#f0fdf4', 'color' => '#166534', 'padding' => '2px 4px', 'borderRadius' => '3px'],
                        'preview_code' => '<ins style="text-decoration: underline; background-color: #f0fdf4; color: #166534; padding: 2px 4px; border-radius: 3px;">New clause</ins>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Highlighted insertion',
                        'style' => ['textDecoration' => 'underline', 'background' => 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', 'padding' => '4px 8px', 'borderRadius' => '6px', 'color' => '#047857'],
                        'preview_code' => '<ins style="text-decoration: underline; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 4px 8px; border-radius: 6px; color: #047857;">Updated text</ins>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Digital insertion',
                        'style' => ['textDecoration' => 'underline', 'fontFamily' => 'monospace', 'backgroundColor' => '#1f2937', 'color' => '#34d399', 'padding' => '2px 6px', 'borderRadius' => '3px'],
                        'preview_code' => '<ins style="text-decoration: underline; font-family: monospace; background-color: #1f2937; color: #34d399; padding: 2px 6px; border-radius: 3px;">Added code</ins>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Bold addition',
                        'style' => ['textDecoration' => 'underline', 'fontWeight' => '700', 'color' => '#059669', 'fontSize' => '1.1em', 'textDecorationThickness' => '3px'],
                        'preview_code' => '<ins style="text-decoration: underline; font-weight: 700; color: #059669; font-size: 1.1em; text-decoration-thickness: 3px;">ADDED</ins>'
                    ]
                ],
                'sort_order' => 45
            ],

            [
                'name' => 'Keyboard Input',
                'type' => 'kbd',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'K',
                'description' => 'Keyboard input element',
                'icon' => 'Keyboard',
                'default_props' => ['content' => 'Ctrl+C'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Keyboard Input', 'default' => 'Ctrl+C'],
                ],
                'render_template' => 'kbd-template',
                'code_generators' => ['react-tailwind' => 'templates/text/kbd.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Keyboard',
                        'description' => 'Standard keyboard style',
                        'style' => ['fontFamily' => 'monospace', 'backgroundColor' => '#f3f4f6', 'border' => '1px solid #d1d5db', 'borderRadius' => '4px', 'padding' => '2px 6px'],
                        'preview_code' => '<kbd style="font-family: monospace; background-color: #f3f4f6; border: 1px solid #d1d5db; border-radius: 4px; padding: 2px 6px;">Ctrl+S</kbd>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean key style',
                        'style' => ['fontFamily' => 'monospace', 'fontSize' => '0.9em', 'backgroundColor' => '#f9fafb', 'color' => '#4b5563', 'padding' => '3px 8px', 'borderRadius' => '6px'],
                        'preview_code' => '<kbd style="font-family: monospace; font-size: 0.9em; background-color: #f9fafb; color: #4b5563; padding: 3px 8px; border-radius: 6px;">Enter</kbd>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Documentation key style',
                        'style' => ['fontFamily' => 'monospace', 'backgroundColor' => '#1f2937', 'color' => '#f9fafb', 'border' => '1px solid #374151', 'borderRadius' => '5px', 'padding' => '4px 8px', 'fontWeight' => '500'],
                        'preview_code' => '<kbd style="font-family: monospace; background-color: #1f2937; color: #f9fafb; border: 1px solid #374151; border-radius: 5px; padding: 4px 8px; font-weight: 500;">Alt+Tab</kbd>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Modern key design',
                        'style' => ['fontFamily' => 'monospace', 'background' => 'linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)', 'border' => '2px solid #e2e8f0', 'borderRadius' => '8px', 'padding' => '6px 12px', 'boxShadow' => '0 2px 4px rgba(0,0,0,0.1)'],
                        'preview_code' => '<kbd style="font-family: monospace; background: linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%); border: 2px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Space</kbd>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Gaming key style',
                        'style' => ['fontFamily' => 'monospace', 'backgroundColor' => '#0f172a', 'color' => '#06ffa5', 'border' => '1px solid #06ffa5', 'borderRadius' => '6px', 'padding' => '4px 10px', 'boxShadow' => '0 0 10px rgba(6, 255, 165, 0.3)'],
                        'preview_code' => '<kbd style="font-family: monospace; background-color: #0f172a; color: #06ffa5; border: 1px solid #06ffa5; border-radius: 6px; padding: 4px 10px; box-shadow: 0 0 10px rgba(6, 255, 165, 0.3);">WASD</kbd>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Command key emphasis',
                        'style' => ['fontFamily' => 'monospace', 'backgroundColor' => '#dc2626', 'color' => '#ffffff', 'fontWeight' => '700', 'padding' => '6px 12px', 'borderRadius' => '6px', 'textTransform' => 'uppercase'],
                        'preview_code' => '<kbd style="font-family: monospace; background-color: #dc2626; color: #ffffff; font-weight: 700; padding: 6px 12px; border-radius: 6px; text-transform: uppercase;">Cmd+Q</kbd>'
                    ]
                ],
                'sort_order' => 46
            ],

            // ============================================
            // MORE HTML5 SPEC ELEMENTS (60+ MORE)
            // ============================================
            
            [
                'name' => 'Sample Output',
                'type' => 'samp',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'S',
                'description' => 'Sample program output',
                'icon' => 'Terminal',
                'default_props' => ['content' => 'Program output'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Sample Text', 'default' => 'Program output'],
                ],
                'render_template' => 'samp-template',
                'code_generators' => ['react-tailwind' => 'templates/text/samp.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Sample',
                        'description' => 'Standard sample output',
                        'style' => ['fontFamily' => 'monospace', 'backgroundColor' => '#f3f4f6', 'padding' => '4px 8px', 'borderRadius' => '4px'],
                        'preview_code' => '<samp style="font-family: monospace; background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px;">Hello World</samp>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean output style',
                        'style' => ['fontFamily' => 'monospace', 'fontSize' => '0.9em', 'color' => '#6b7280', 'backgroundColor' => '#f9fafb'],
                        'preview_code' => '<samp style="font-family: monospace; font-size: 0.9em; color: #6b7280; background-color: #f9fafb;">Output: 42</samp>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Terminal-style output',
                        'style' => ['fontFamily' => 'monospace', 'backgroundColor' => '#1f2937', 'color' => '#f9fafb', 'padding' => '8px 12px', 'borderRadius' => '6px', 'border' => '1px solid #374151'],
                        'preview_code' => '<samp style="font-family: monospace; background-color: #1f2937; color: #f9fafb; padding: 8px 12px; border-radius: 6px; border: 1px solid #374151;">$ npm install</samp>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled code output',
                        'style' => ['fontFamily' => 'monospace', 'background' => 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 'padding' => '10px 14px', 'borderRadius' => '8px', 'border' => '1px solid #e2e8f0', 'boxShadow' => '0 1px 3px rgba(0,0,0,0.1)'],
                        'preview_code' => '<samp style="font-family: monospace; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">Success: Build complete</samp>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Matrix-style output',
                        'style' => ['fontFamily' => 'monospace', 'backgroundColor' => '#000000', 'color' => '#00ff41', 'padding' => '8px 12px', 'borderRadius' => '4px', 'boxShadow' => '0 0 10px rgba(0, 255, 65, 0.3)'],
                        'preview_code' => '<samp style="font-family: monospace; background-color: #000000; color: #00ff41; padding: 8px 12px; border-radius: 4px; box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);">> System online</samp>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Error output emphasis',
                        'style' => ['fontFamily' => 'monospace', 'backgroundColor' => '#dc2626', 'color' => '#ffffff', 'padding' => '8px 12px', 'borderRadius' => '6px', 'fontWeight' => '600'],
                        'preview_code' => '<samp style="font-family: monospace; background-color: #dc2626; color: #ffffff; padding: 8px 12px; border-radius: 6px; font-weight: 600;">ERROR: Process failed</samp>'
                    ]
                ],
                'sort_order' => 47
            ],

            [
                'name' => 'Variable',
                'type' => 'var',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'V',
                'description' => 'Variable or placeholder text',
                'icon' => 'Code',
                'default_props' => ['content' => 'variable'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Variable Name', 'default' => 'variable'],
                ],
                'render_template' => 'var-template',
                'code_generators' => ['react-tailwind' => 'templates/text/var.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Variable',
                        'description' => 'Standard variable',
                        'style' => ['fontFamily' => 'monospace', 'fontStyle' => 'italic', 'color' => '#dc2626'],
                        'preview_code' => '<var style="font-family: monospace; font-style: italic; color: #dc2626;">username</var>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Subtle variable style',
                        'style' => ['fontFamily' => 'monospace', 'fontStyle' => 'italic', 'color' => '#6b7280', 'fontSize' => '0.95em'],
                        'preview_code' => '<var style="font-family: monospace; font-style: italic; color: #6b7280; font-size: 0.95em;">count</var>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Documentation variable',
                        'style' => ['fontFamily' => 'monospace', 'fontStyle' => 'italic', 'backgroundColor' => '#eff6ff', 'color' => '#1e40af', 'padding' => '2px 6px', 'borderRadius' => '4px'],
                        'preview_code' => '<var style="font-family: monospace; font-style: italic; background-color: #eff6ff; color: #1e40af; padding: 2px 6px; border-radius: 4px;">apiKey</var>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Highlighted variable',
                        'style' => ['fontFamily' => 'monospace', 'fontStyle' => 'italic', 'background' => 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)', 'color' => '#92400e', 'padding' => '4px 8px', 'borderRadius' => '6px'],
                        'preview_code' => '<var style="font-family: monospace; font-style: italic; background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); color: #92400e; padding: 4px 8px; border-radius: 6px;">data</var>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Code editor variable',
                        'style' => ['fontFamily' => 'monospace', 'fontStyle' => 'italic', 'backgroundColor' => '#1f2937', 'color' => '#f59e0b', 'padding' => '2px 6px', 'borderRadius' => '3px'],
                        'preview_code' => '<var style="font-family: monospace; font-style: italic; background-color: #1f2937; color: #f59e0b; padding: 2px 6px; border-radius: 3px;">result</var>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Important variable',
                        'style' => ['fontFamily' => 'monospace', 'fontStyle' => 'italic', 'fontWeight' => '700', 'color' => '#dc2626', 'textTransform' => 'uppercase', 'letterSpacing' => '0.5px'],
                        'preview_code' => '<var style="font-family: monospace; font-style: italic; font-weight: 700; color: #dc2626; text-transform: uppercase; letter-spacing: 0.5px;">TOKEN</var>'
                    ]
                ],
                'sort_order' => 48
            ],

            [
                'name' => 'Time',
                'type' => 'time',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'T',
                'description' => 'Time or date element',
                'icon' => 'Clock',
                'default_props' => ['content' => '2024-01-01', 'datetime' => '2024-01-01'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Display Text', 'default' => '2024-01-01'],
                    'datetime' => ['type' => 'string', 'label' => 'Machine Readable', 'default' => '2024-01-01'],
                ],
                'render_template' => 'time-template',
                'code_generators' => ['react-tailwind' => 'templates/text/time.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Time',
                        'description' => 'Standard time display',
                        'style' => ['color' => '#374151'],
                        'preview_code' => '<time datetime="2024-01-01" style="color: #374151;">January 1, 2024</time>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Subtle time',
                        'style' => ['color' => '#9ca3af', 'fontSize' => '0.9em'],
                        'preview_code' => '<time datetime="2024-01-01T10:30" style="color: #9ca3af; font-size: 0.9em;">10:30 AM</time>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business time format',
                        'style' => ['fontFamily' => 'system-ui', 'fontWeight' => '500', 'color' => '#1f2937', 'backgroundColor' => '#f9fafb', 'padding' => '4px 8px', 'borderRadius' => '4px'],
                        'preview_code' => '<time datetime="2024-01-01" style="font-family: system-ui; font-weight: 500; color: #1f2937; background-color: #f9fafb; padding: 4px 8px; border-radius: 4px;">Jan 1, 2024</time>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled timestamp',
                        'style' => ['background' => 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', 'color' => '#3730a3', 'padding' => '6px 12px', 'borderRadius' => '8px', 'fontWeight' => '500'],
                        'preview_code' => '<time datetime="2024-01-01" style="background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); color: #3730a3; padding: 6px 12px; border-radius: 8px; font-weight: 500;">2024-01-01</time>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Digital clock style',
                        'style' => ['fontFamily' => 'monospace', 'backgroundColor' => '#0f172a', 'color' => '#06b6d4', 'padding' => '6px 10px', 'borderRadius' => '6px', 'fontSize' => '1.1em', 'fontWeight' => '600'],
                        'preview_code' => '<time datetime="14:30:00" style="font-family: monospace; background-color: #0f172a; color: #06b6d4; padding: 6px 10px; border-radius: 6px; font-size: 1.1em; font-weight: 600;">14:30:00</time>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Emphasized date',
                        'style' => ['fontWeight' => '800', 'color' => '#dc2626', 'fontSize' => '1.2em', 'textTransform' => 'uppercase', 'letterSpacing' => '1px'],
                        'preview_code' => '<time datetime="2024-12-31" style="font-weight: 800; color: #dc2626; font-size: 1.2em; text-transform: uppercase; letter-spacing: 1px;">DEC 31</time>'
                    ]
                ],
                'sort_order' => 49
            ],

            [
                'name' => 'Data',
                'type' => 'data',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'D',
                'description' => 'Machine-readable data',
                'icon' => 'Database',
                'default_props' => ['content' => '100', 'value' => '100'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Display Text', 'default' => '100'],
                    'value' => ['type' => 'string', 'label' => 'Machine Value', 'default' => '100'],
                ],
                'render_template' => 'data-template',
                'code_generators' => ['react-tailwind' => 'templates/text/data.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Data',
                        'description' => 'Standard data display',
                        'style' => ['fontWeight' => '500'],
                        'preview_code' => '<data value="100" style="font-weight: 500;">$100</data>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean data style',
                        'style' => ['color' => '#6b7280', 'fontFamily' => 'system-ui'],
                        'preview_code' => '<data value="42" style="color: #6b7280; font-family: system-ui;">42%</data>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Metric display',
                        'style' => ['fontWeight' => '600', 'color' => '#1e40af', 'backgroundColor' => '#eff6ff', 'padding' => '4px 8px', 'borderRadius' => '6px'],
                        'preview_code' => '<data value="1250" style="font-weight: 600; color: #1e40af; background-color: #eff6ff; padding: 4px 8px; border-radius: 6px;">1,250 users</data>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Dashboard style',
                        'style' => ['background' => 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', 'color' => '#047857', 'fontWeight' => '700', 'padding' => '8px 16px', 'borderRadius' => '12px', 'fontSize' => '1.1em'],
                        'preview_code' => '<data value="95" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); color: #047857; font-weight: 700; padding: 8px 16px; border-radius: 12px; font-size: 1.1em;">95% uptime</data>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Digital readout',
                        'style' => ['fontFamily' => 'monospace', 'backgroundColor' => '#1f2937', 'color' => '#10b981', 'padding' => '6px 12px', 'borderRadius' => '6px', 'border' => '1px solid #10b981', 'fontSize' => '1.1em'],
                        'preview_code' => '<data value="2048" style="font-family: monospace; background-color: #1f2937; color: #10b981; padding: 6px 12px; border-radius: 6px; border: 1px solid #10b981; font-size: 1.1em;">2048 MB</data>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Critical metric',
                        'style' => ['fontWeight' => '900', 'color' => '#ffffff', 'backgroundColor' => '#dc2626', 'padding' => '8px 16px', 'borderRadius' => '8px', 'fontSize' => '1.3em', 'textAlign' => 'center'],
                        'preview_code' => '<data value="99.9" style="font-weight: 900; color: #ffffff; background-color: #dc2626; padding: 8px 16px; border-radius: 8px; font-size: 1.3em; text-align: center;">99.9%</data>'
                    ]
                ],
                'sort_order' => 50
            ],

            [
                'name' => 'Bidirectional Isolation',
                'type' => 'bdi',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'B',
                'description' => 'Text with different direction',
                'icon' => 'ArrowLeftRight',
                'default_props' => ['content' => 'Text'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Text Content', 'default' => 'Text'],
                ],
                'render_template' => 'bdi-template',
                'code_generators' => ['react-tailwind' => 'templates/text/bdi.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default BDI',
                        'description' => 'Standard directional text',
                        'style' => [],
                        'preview_code' => '<bdi>مرحبا</bdi>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean directional',
                        'style' => ['fontSize' => '1rem', 'color' => '#374151'],
                        'preview_code' => '<bdi style="font-size: 1rem; color: #374151;">نص</bdi>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'International text',
                        'style' => ['fontFamily' => 'system-ui', 'padding' => '4px 8px', 'backgroundColor' => '#f9fafb', 'borderRadius' => '4px'],
                        'preview_code' => '<bdi style="font-family: system-ui; padding: 4px 8px; background-color: #f9fafb; border-radius: 4px;">العربية</bdi>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled international',
                        'style' => ['background' => 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', 'padding' => '8px 12px', 'borderRadius' => '8px', 'border' => '1px solid #d1d5db'],
                        'preview_code' => '<bdi style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 8px 12px; border-radius: 8px; border: 1px solid #d1d5db;">עברית</bdi>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Digital international',
                        'style' => ['fontFamily' => 'monospace', 'backgroundColor' => '#1f2937', 'color' => '#f9fafb', 'padding' => '6px 10px', 'borderRadius' => '6px'],
                        'preview_code' => '<bdi style="font-family: monospace; background-color: #1f2937; color: #f9fafb; padding: 6px 10px; border-radius: 6px;">中文</bdi>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Emphasized directional',
                        'style' => ['fontWeight' => '700', 'fontSize' => '1.2em', 'color' => '#dc2626', 'padding' => '6px 12px', 'border' => '2px solid #dc2626', 'borderRadius' => '6px'],
                        'preview_code' => '<bdi style="font-weight: 700; font-size: 1.2em; color: #dc2626; padding: 6px 12px; border: 2px solid #dc2626; border-radius: 6px;">русский</bdi>'
                    ]
                ],
                'sort_order' => 51
            ],

            // ============================================
            // EVEN MORE HTML5 ELEMENTS (40+ MORE)
            // ============================================
            
            [
                'name' => 'Bidirectional Override',
                'type' => 'bdo',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'B',
                'description' => 'Override text direction',
                'icon' => 'ArrowRightLeft',
                'default_props' => ['content' => 'Override text', 'dir' => 'rtl'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Text', 'default' => 'Override text'],
                    'dir' => ['type' => 'select', 'label' => 'Direction', 'options' => ['ltr', 'rtl'], 'default' => 'rtl'],
                ],
                'render_template' => 'bdo-template',
                'code_generators' => ['react-tailwind' => 'templates/text/bdo.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default BDO',
                        'description' => 'Standard direction override',
                        'style' => [],
                        'preview_code' => '<bdo dir="rtl">This text goes right-to-left</bdo>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean override',
                        'style' => ['color' => '#6b7280'],
                        'preview_code' => '<bdo dir="rtl" style="color: #6b7280;">Reversed text</bdo>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Document override',
                        'style' => ['backgroundColor' => '#f9fafb', 'padding' => '4px 8px', 'borderRadius' => '4px', 'fontFamily' => 'system-ui'],
                        'preview_code' => '<bdo dir="rtl" style="background-color: #f9fafb; padding: 4px 8px; border-radius: 4px; font-family: system-ui;">Text direction</bdo>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled direction',
                        'style' => ['background' => 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', 'padding' => '8px 12px', 'borderRadius' => '8px', 'color' => '#3730a3'],
                        'preview_code' => '<bdo dir="rtl" style="background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); padding: 8px 12px; border-radius: 8px; color: #3730a3;">Directional text</bdo>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Matrix override',
                        'style' => ['fontFamily' => 'monospace', 'backgroundColor' => '#1f2937', 'color' => '#06b6d4', 'padding' => '6px 10px', 'borderRadius' => '6px'],
                        'preview_code' => '<bdo dir="rtl" style="font-family: monospace; background-color: #1f2937; color: #06b6d4; padding: 6px 10px; border-radius: 6px;">!elbisreveR</bdo>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Emphasized override',
                        'style' => ['fontWeight' => '700', 'color' => '#dc2626', 'fontSize' => '1.1em', 'border' => '2px solid #dc2626', 'padding' => '6px 12px', 'borderRadius' => '6px'],
                        'preview_code' => '<bdo dir="rtl" style="font-weight: 700; color: #dc2626; font-size: 1.1em; border: 2px solid #dc2626; padding: 6px 12px; border-radius: 6px;">OVERRIDE</bdo>'
                    ]
                ],
                'sort_order' => 52
            ],

            [
                'name' => 'Ruby Text',
                'type' => 'ruby',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'R',
                'description' => 'Ruby annotations for East Asian text',
                'icon' => 'Languages',
                'default_props' => ['content' => '漢字'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Base Text', 'default' => '漢字'],
                ],
                'render_template' => 'ruby-template',
                'code_generators' => ['react-tailwind' => 'templates/text/ruby.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Ruby',
                        'description' => 'Standard ruby text',
                        'style' => [],
                        'preview_code' => '<ruby>漢字<rt>かんじ</rt></ruby>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean ruby style',
                        'style' => ['fontSize' => '1rem', 'color' => '#374151'],
                        'preview_code' => '<ruby style="font-size: 1rem; color: #374151;">東京<rt>とうきょう</rt></ruby>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Educational ruby',
                        'style' => ['fontFamily' => 'serif', 'fontSize' => '1.2em', 'lineHeight' => '2'],
                        'preview_code' => '<ruby style="font-family: serif; font-size: 1.2em; line-height: 2;">日本<rt>にほん</rt></ruby>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled ruby',
                        'style' => ['padding' => '8px', 'backgroundColor' => '#fef3c7', 'borderRadius' => '8px', 'color' => '#92400e'],
                        'preview_code' => '<ruby style="padding: 8px; background-color: #fef3c7; border-radius: 8px; color: #92400e;">中国<rt>ちゅうごく</rt></ruby>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Digital ruby',
                        'style' => ['fontFamily' => 'monospace', 'backgroundColor' => '#1f2937', 'color' => '#f9fafb', 'padding' => '6px', 'borderRadius' => '6px'],
                        'preview_code' => '<ruby style="font-family: monospace; background-color: #1f2937; color: #f9fafb; padding: 6px; border-radius: 6px;">韓国<rt>かんこく</rt></ruby>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Emphasized ruby',
                        'style' => ['fontWeight' => '700', 'fontSize' => '1.5em', 'color' => '#dc2626'],
                        'preview_code' => '<ruby style="font-weight: 700; font-size: 1.5em; color: #dc2626;">龍<rt>りゅう</rt></ruby>'
                    ]
                ],
                'sort_order' => 53
            ],

            [
                'name' => 'Ruby Parenthesis',
                'type' => 'rp',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'R',
                'description' => 'Ruby fallback parenthesis',
                'icon' => 'Parentheses',
                'default_props' => ['content' => '('],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Parenthesis', 'default' => '('],
                ],
                'render_template' => 'rp-template',
                'code_generators' => ['react-tailwind' => 'templates/text/rp.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default RP',
                        'description' => 'Standard parenthesis',
                        'style' => ['color' => '#9ca3af'],
                        'preview_code' => '<rp style="color: #9ca3af;">(</rp>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Subtle parenthesis',
                        'style' => ['color' => '#d1d5db', 'fontSize' => '0.8em'],
                        'preview_code' => '<rp style="color: #d1d5db; font-size: 0.8em;">[</rp>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Document parenthesis',
                        'style' => ['color' => '#6b7280', 'fontWeight' => '400'],
                        'preview_code' => '<rp style="color: #6b7280; font-weight: 400;">（</rp>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled parenthesis',
                        'style' => ['color' => '#92400e', 'fontSize' => '0.9em'],
                        'preview_code' => '<rp style="color: #92400e; font-size: 0.9em;">⟨</rp>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Digital parenthesis',
                        'style' => ['color' => '#06b6d4', 'fontFamily' => 'monospace'],
                        'preview_code' => '<rp style="color: #06b6d4; font-family: monospace;">{</rp>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Bold parenthesis',
                        'style' => ['color' => '#dc2626', 'fontWeight' => '700'],
                        'preview_code' => '<rp style="color: #dc2626; font-weight: 700;">[</rp>'
                    ]
                ],
                'sort_order' => 54
            ],

            [
                'name' => 'Ruby Text Annotation',
                'type' => 'rt',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'R',
                'description' => 'Ruby text annotation',
                'icon' => 'Type',
                'default_props' => ['content' => 'annotation'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Annotation', 'default' => 'annotation'],
                ],
                'render_template' => 'rt-template',
                'code_generators' => ['react-tailwind' => 'templates/text/rt.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default RT',
                        'description' => 'Standard annotation',
                        'style' => ['fontSize' => '0.5em'],
                        'preview_code' => '<rt style="font-size: 0.5em;">かんじ</rt>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean annotation',
                        'style' => ['fontSize' => '0.6em', 'color' => '#6b7280'],
                        'preview_code' => '<rt style="font-size: 0.6em; color: #6b7280;">よみ</rt>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Educational annotation',
                        'style' => ['fontSize' => '0.7em', 'fontWeight' => '500', 'color' => '#1e40af'],
                        'preview_code' => '<rt style="font-size: 0.7em; font-weight: 500; color: #1e40af;">reading</rt>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled annotation',
                        'style' => ['fontSize' => '0.6em', 'color' => '#92400e', 'fontStyle' => 'italic'],
                        'preview_code' => '<rt style="font-size: 0.6em; color: #92400e; font-style: italic;">pronunciation</rt>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Digital annotation',
                        'style' => ['fontSize' => '0.5em', 'color' => '#06b6d4', 'fontFamily' => 'monospace'],
                        'preview_code' => '<rt style="font-size: 0.5em; color: #06b6d4; font-family: monospace;">0x4E2D</rt>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Emphasized annotation',
                        'style' => ['fontSize' => '0.7em', 'color' => '#dc2626', 'fontWeight' => '700'],
                        'preview_code' => '<rt style="font-size: 0.7em; color: #dc2626; font-weight: 700;">MEANING</rt>'
                    ]
                ],
                'sort_order' => 55
            ],

            [
                'name' => 'Subscript',
                'type' => 'sub',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'S',
                'description' => 'Subscript text',
                'icon' => 'Subscript',
                'default_props' => ['content' => '2'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Subscript Text', 'default' => '2'],
                ],
                'render_template' => 'sub-template',
                'code_generators' => ['react-tailwind' => 'templates/text/sub.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Subscript',
                        'description' => 'Standard subscript',
                        'style' => ['fontSize' => '0.8em', 'verticalAlign' => 'sub'],
                        'preview_code' => 'H<sub style="font-size: 0.8em; vertical-align: sub;">2</sub>O'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean subscript',
                        'style' => ['fontSize' => '0.75em', 'verticalAlign' => 'sub', 'color' => '#6b7280'],
                        'preview_code' => 'CO<sub style="font-size: 0.75em; vertical-align: sub; color: #6b7280;">2</sub>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Scientific subscript',
                        'style' => ['fontSize' => '0.8em', 'verticalAlign' => 'sub', 'fontFamily' => 'system-ui', 'fontWeight' => '500'],
                        'preview_code' => 'C<sub style="font-size: 0.8em; vertical-align: sub; font-family: system-ui; font-weight: 500;">6</sub>H<sub>12</sub>O<sub>6</sub>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Highlighted subscript',
                        'style' => ['fontSize' => '0.8em', 'verticalAlign' => 'sub', 'color' => '#1e40af', 'fontWeight' => '600'],
                        'preview_code' => 'NaCl<sub style="font-size: 0.8em; vertical-align: sub; color: #1e40af; font-weight: 600;">aq</sub>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Code subscript',
                        'style' => ['fontSize' => '0.7em', 'verticalAlign' => 'sub', 'fontFamily' => 'monospace', 'color' => '#059669'],
                        'preview_code' => 'array<sub style="font-size: 0.7em; vertical-align: sub; font-family: monospace; color: #059669;">[0]</sub>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Emphasized subscript',
                        'style' => ['fontSize' => '0.8em', 'verticalAlign' => 'sub', 'color' => '#dc2626', 'fontWeight' => '700'],
                        'preview_code' => 'ERROR<sub style="font-size: 0.8em; vertical-align: sub; color: #dc2626; font-weight: 700;">404</sub>'
                    ]
                ],
                'sort_order' => 56
            ],

            [
                'name' => 'Superscript',
                'type' => 'sup',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'S',
                'description' => 'Superscript text',
                'icon' => 'Superscript',
                'default_props' => ['content' => '2'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Superscript Text', 'default' => '2'],
                ],
                'render_template' => 'sup-template',
                'code_generators' => ['react-tailwind' => 'templates/text/sup.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Superscript',
                        'description' => 'Standard superscript',
                        'style' => ['fontSize' => '0.8em', 'verticalAlign' => 'super'],
                        'preview_code' => 'E=mc<sup style="font-size: 0.8em; vertical-align: super;">2</sup>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean superscript',
                        'style' => ['fontSize' => '0.75em', 'verticalAlign' => 'super', 'color' => '#6b7280'],
                        'preview_code' => '10<sup style="font-size: 0.75em; vertical-align: super; color: #6b7280;">6</sup>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Mathematical superscript',
                        'style' => ['fontSize' => '0.8em', 'verticalAlign' => 'super', 'fontFamily' => 'system-ui', 'fontWeight' => '500'],
                        'preview_code' => 'x<sup style="font-size: 0.8em; vertical-align: super; font-family: system-ui; font-weight: 500;">2</sup> + y<sup>2</sup> = z<sup>2</sup>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled superscript',
                        'style' => ['fontSize' => '0.8em', 'verticalAlign' => 'super', 'color' => '#7c3aed', 'fontWeight' => '600'],
                        'preview_code' => '2<sup style="font-size: 0.8em; vertical-align: super; color: #7c3aed; font-weight: 600;">nd</sup> place'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Tech superscript',
                        'style' => ['fontSize' => '0.7em', 'verticalAlign' => 'super', 'fontFamily' => 'monospace', 'color' => '#059669'],
                        'preview_code' => 'func<sup style="font-size: 0.7em; vertical-align: super; font-family: monospace; color: #059669;">®</sup>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Emphasized superscript',
                        'style' => ['fontSize' => '0.8em', 'verticalAlign' => 'super', 'color' => '#dc2626', 'fontWeight' => '700'],
                        'preview_code' => 'WARNING<sup style="font-size: 0.8em; vertical-align: super; color: #dc2626; font-weight: 700;">!</sup>'
                    ]
                ],
                'sort_order' => 57
            ],

            // ============================================
            // FINAL 44+ HTML ELEMENTS TO REACH 100+
            // ============================================
            
            [
                'name' => 'Details',
                'type' => 'details',
                'component_type' => 'element',
                'category' => 'interactive',
                'alphabet_group' => 'D',
                'description' => 'Collapsible details element',
                'icon' => 'ChevronDown',
                'default_props' => ['open' => false],
                'prop_definitions' => [
                    'open' => ['type' => 'boolean', 'label' => 'Open by default', 'default' => false],
                ],
                'render_template' => 'details-template',
                'code_generators' => ['react-tailwind' => 'templates/interactive/details.js'],
                'has_animation' => true,
                'animation_type' => 'collapse',
                'variants' => [
                    [
                        'name' => 'Default Details',
                        'description' => 'Standard collapsible',
                        'style' => ['border' => '1px solid #d1d5db', 'borderRadius' => '6px', 'padding' => '12px'],
                        'preview_code' => '<details style="border: 1px solid #d1d5db; border-radius: 6px; padding: 12px;"><summary>Click to expand</summary><p>Hidden content here</p></details>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean accordion style',
                        'style' => ['borderBottom' => '1px solid #e5e7eb', 'padding' => '16px 0'],
                        'preview_code' => '<details style="border-bottom: 1px solid #e5e7eb; padding: 16px 0;"><summary>FAQ Item</summary><p>Answer content</p></details>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business documentation style',
                        'style' => ['backgroundColor' => '#f9fafb', 'border' => '1px solid #e5e7eb', 'borderRadius' => '8px', 'padding' => '20px', 'boxShadow' => '0 1px 2px rgba(0,0,0,0.05)'],
                        'preview_code' => '<details style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);"><summary>Section Details</summary><div>Content details</div></details>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Modern card accordion',
                        'style' => ['background' => 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 'border' => '1px solid #e2e8f0', 'borderRadius' => '12px', 'padding' => '24px', 'boxShadow' => '0 4px 6px rgba(0,0,0,0.05)'],
                        'preview_code' => '<details style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);"><summary>Expandable Card</summary><p>Beautiful content</p></details>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Dark tech accordion',
                        'style' => ['backgroundColor' => '#1f2937', 'color' => '#f9fafb', 'border' => '1px solid #374151', 'borderRadius' => '8px', 'padding' => '18px'],
                        'preview_code' => '<details style="background-color: #1f2937; color: #f9fafb; border: 1px solid #374151; border-radius: 8px; padding: 18px;"><summary>System Info</summary><pre>Advanced details</pre></details>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Emphasized disclosure',
                        'style' => ['backgroundColor' => '#dc2626', 'color' => '#ffffff', 'border' => 'none', 'borderRadius' => '8px', 'padding' => '20px', 'fontWeight' => '600'],
                        'preview_code' => '<details style="background-color: #dc2626; color: #ffffff; border: none; border-radius: 8px; padding: 20px; font-weight: 600;"><summary>IMPORTANT</summary><div>Critical information</div></details>'
                    ]
                ],
                'sort_order' => 58
            ],

            [
                'name' => 'Summary',
                'type' => 'summary',
                'component_type' => 'element',
                'category' => 'interactive',
                'alphabet_group' => 'S',
                'description' => 'Summary for details element',
                'icon' => 'List',
                'default_props' => ['content' => 'Summary'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Summary Text', 'default' => 'Summary'],
                ],
                'render_template' => 'summary-template',
                'code_generators' => ['react-tailwind' => 'templates/interactive/summary.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Summary',
                        'description' => 'Standard summary',
                        'style' => ['cursor' => 'pointer', 'fontWeight' => '500'],
                        'preview_code' => '<summary style="cursor: pointer; font-weight: 500;">Click to expand</summary>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean summary',
                        'style' => ['cursor' => 'pointer', 'color' => '#374151', 'fontSize' => '16px'],
                        'preview_code' => '<summary style="cursor: pointer; color: #374151; font-size: 16px;">Show details</summary>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business summary',
                        'style' => ['cursor' => 'pointer', 'fontWeight' => '600', 'color' => '#1e40af', 'padding' => '8px 0'],
                        'preview_code' => '<summary style="cursor: pointer; font-weight: 600; color: #1e40af; padding: 8px 0;">Section Overview</summary>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled summary',
                        'style' => ['cursor' => 'pointer', 'fontWeight' => '600', 'color' => '#7c3aed', 'padding' => '12px', 'borderRadius' => '6px', 'backgroundColor' => '#f3f4f6'],
                        'preview_code' => '<summary style="cursor: pointer; font-weight: 600; color: #7c3aed; padding: 12px; border-radius: 6px; background-color: #f3f4f6;">Expand Content</summary>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Tech summary',
                        'style' => ['cursor' => 'pointer', 'fontFamily' => 'monospace', 'color' => '#06b6d4', 'fontWeight' => '600'],
                        'preview_code' => '<summary style="cursor: pointer; font-family: monospace; color: #06b6d4; font-weight: 600;">> Show data</summary>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Bold summary',
                        'style' => ['cursor' => 'pointer', 'fontWeight' => '700', 'color' => '#dc2626', 'textTransform' => 'uppercase', 'letterSpacing' => '1px'],
                        'preview_code' => '<summary style="cursor: pointer; font-weight: 700; color: #dc2626; text-transform: uppercase; letter-spacing: 1px;">EXPAND</summary>'
                    ]
                ],
                'sort_order' => 59
            ],

            [
                'name' => 'Dialog',
                'type' => 'dialog',
                'component_type' => 'element',
                'category' => 'interactive',
                'alphabet_group' => 'D',
                'description' => 'Modal dialog element',
                'icon' => 'MessageSquare',
                'default_props' => ['open' => false],
                'prop_definitions' => [
                    'open' => ['type' => 'boolean', 'label' => 'Open by default', 'default' => false],
                ],
                'render_template' => 'dialog-template',
                'code_generators' => ['react-tailwind' => 'templates/interactive/dialog.js'],
                'has_animation' => true,
                'animation_type' => 'modal',
                'variants' => [
                    [
                        'name' => 'Default Dialog',
                        'description' => 'Standard modal',
                        'style' => ['padding' => '24px', 'border' => '1px solid #d1d5db', 'borderRadius' => '8px', 'backgroundColor' => '#ffffff'],
                        'preview_code' => '<dialog style="padding: 24px; border: 1px solid #d1d5db; border-radius: 8px; background-color: #ffffff;">Modal content</dialog>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean modal',
                        'style' => ['padding' => '32px', 'backgroundColor' => '#ffffff', 'borderRadius' => '12px', 'boxShadow' => '0 4px 6px rgba(0,0,0,0.1)'],
                        'preview_code' => '<dialog style="padding: 32px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Simple dialog</dialog>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business modal',
                        'style' => ['padding' => '40px', 'backgroundColor' => '#ffffff', 'borderRadius' => '16px', 'boxShadow' => '0 20px 25px rgba(0,0,0,0.1)', 'border' => '1px solid #e5e7eb'],
                        'preview_code' => '<dialog style="padding: 40px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 20px 25px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">Business dialog</dialog>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Beautiful modal',
                        'style' => ['padding' => '48px', 'background' => 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 'borderRadius' => '20px', 'boxShadow' => '0 25px 50px rgba(0,0,0,0.15)', 'border' => '1px solid #e2e8f0'],
                        'preview_code' => '<dialog style="padding: 48px; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-radius: 20px; box-shadow: 0 25px 50px rgba(0,0,0,0.15); border: 1px solid #e2e8f0;">Styled dialog</dialog>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Dark tech modal',
                        'style' => ['padding' => '36px', 'backgroundColor' => '#1f2937', 'color' => '#f9fafb', 'borderRadius' => '12px', 'border' => '1px solid #374151', 'boxShadow' => '0 0 30px rgba(59, 130, 246, 0.3)'],
                        'preview_code' => '<dialog style="padding: 36px; background-color: #1f2937; color: #f9fafb; border-radius: 12px; border: 1px solid #374151; box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);">System dialog</dialog>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Alert modal',
                        'style' => ['padding' => '40px', 'backgroundColor' => '#dc2626', 'color' => '#ffffff', 'borderRadius' => '12px', 'boxShadow' => '0 20px 40px rgba(220, 38, 38, 0.3)', 'fontWeight' => '600'],
                        'preview_code' => '<dialog style="padding: 40px; background-color: #dc2626; color: #ffffff; border-radius: 12px; box-shadow: 0 20px 40px rgba(220, 38, 38, 0.3); font-weight: 600;">ALERT DIALOG</dialog>'
                    ]
                ],
                'sort_order' => 60
            ],

            [
                'name' => 'Progress',
                'type' => 'progress',
                'component_type' => 'element',
                'category' => 'interactive',
                'alphabet_group' => 'P',
                'description' => 'Progress indicator',
                'icon' => 'BarChart3',
                'default_props' => ['value' => '50', 'max' => '100'],
                'prop_definitions' => [
                    'value' => ['type' => 'number', 'label' => 'Current Value', 'default' => '50'],
                    'max' => ['type' => 'number', 'label' => 'Maximum Value', 'default' => '100'],
                ],
                'render_template' => 'progress-template',
                'code_generators' => ['react-tailwind' => 'templates/interactive/progress.js'],
                'has_animation' => true,
                'animation_type' => 'progress',
                'variants' => [
                    [
                        'name' => 'Default Progress',
                        'description' => 'Standard progress bar',
                        'style' => ['width' => '100%', 'height' => '20px'],
                        'preview_code' => '<progress value="75" max="100" style="width: 100%; height: 20px;">75%</progress>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Thin progress bar',
                        'style' => ['width' => '100%', 'height' => '4px', 'borderRadius' => '2px'],
                        'preview_code' => '<progress value="60" max="100" style="width: 100%; height: 4px; border-radius: 2px;">60%</progress>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business progress',
                        'style' => ['width' => '100%', 'height' => '12px', 'borderRadius' => '6px', 'backgroundColor' => '#f3f4f6'],
                        'preview_code' => '<progress value="85" max="100" style="width: 100%; height: 12px; border-radius: 6px; background-color: #f3f4f6;">85%</progress>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Gradient progress',
                        'style' => ['width' => '100%', 'height' => '16px', 'borderRadius' => '8px', 'background' => 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'],
                        'preview_code' => '<progress value="70" max="100" style="width: 100%; height: 16px; border-radius: 8px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);">70%</progress>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Neon progress',
                        'style' => ['width' => '100%', 'height' => '8px', 'borderRadius' => '4px', 'backgroundColor' => '#1f2937', 'boxShadow' => '0 0 10px rgba(6, 182, 212, 0.5)'],
                        'preview_code' => '<progress value="90" max="100" style="width: 100%; height: 8px; border-radius: 4px; background-color: #1f2937; box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);">90%</progress>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Bold progress bar',
                        'style' => ['width' => '100%', 'height' => '24px', 'borderRadius' => '12px', 'backgroundColor' => '#dc2626', 'border' => '2px solid #991b1b'],
                        'preview_code' => '<progress value="95" max="100" style="width: 100%; height: 24px; border-radius: 12px; background-color: #dc2626; border: 2px solid #991b1b;">95%</progress>'
                    ]
                ],
                'sort_order' => 61
            ],

            [
                'name' => 'Meter',
                'type' => 'meter',
                'component_type' => 'element',
                'category' => 'interactive',
                'alphabet_group' => 'M',
                'description' => 'Scalar measurement gauge',
                'icon' => 'Gauge',
                'default_props' => ['value' => '0.6', 'min' => '0', 'max' => '1'],
                'prop_definitions' => [
                    'value' => ['type' => 'number', 'label' => 'Current Value', 'default' => '0.6'],
                    'min' => ['type' => 'number', 'label' => 'Minimum Value', 'default' => '0'],
                    'max' => ['type' => 'number', 'label' => 'Maximum Value', 'default' => '1'],
                ],
                'render_template' => 'meter-template',
                'code_generators' => ['react-tailwind' => 'templates/interactive/meter.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Meter',
                        'description' => 'Standard gauge',
                        'style' => ['width' => '100%', 'height' => '20px'],
                        'preview_code' => '<meter value="0.6" min="0" max="1" style="width: 100%; height: 20px;">60%</meter>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean meter',
                        'style' => ['width' => '100%', 'height' => '8px', 'borderRadius' => '4px'],
                        'preview_code' => '<meter value="0.75" min="0" max="1" style="width: 100%; height: 8px; border-radius: 4px;">75%</meter>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business gauge',
                        'style' => ['width' => '100%', 'height' => '16px', 'borderRadius' => '8px', 'backgroundColor' => '#f9fafb', 'border' => '1px solid #e5e7eb'],
                        'preview_code' => '<meter value="0.85" min="0" max="1" style="width: 100%; height: 16px; border-radius: 8px; background-color: #f9fafb; border: 1px solid #e5e7eb;">85%</meter>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled meter',
                        'style' => ['width' => '100%', 'height' => '20px', 'borderRadius' => '10px', 'background' => 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', 'boxShadow' => 'inset 0 2px 4px rgba(0,0,0,0.1)'],
                        'preview_code' => '<meter value="0.7" min="0" max="1" style="width: 100%; height: 20px; border-radius: 10px; background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">70%</meter>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Digital meter',
                        'style' => ['width' => '100%', 'height' => '12px', 'borderRadius' => '6px', 'backgroundColor' => '#1f2937', 'border' => '1px solid #06b6d4', 'boxShadow' => '0 0 8px rgba(6, 182, 212, 0.4)'],
                        'preview_code' => '<meter value="0.9" min="0" max="1" style="width: 100%; height: 12px; border-radius: 6px; background-color: #1f2937; border: 1px solid #06b6d4; box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);">90%</meter>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Critical meter',
                        'style' => ['width' => '100%', 'height' => '24px', 'borderRadius' => '12px', 'backgroundColor' => '#dc2626', 'border' => '2px solid #991b1b', 'boxShadow' => '0 0 12px rgba(220, 38, 38, 0.5)'],
                        'preview_code' => '<meter value="0.95" min="0" max="1" style="width: 100%; height: 24px; border-radius: 12px; background-color: #dc2626; border: 2px solid #991b1b; box-shadow: 0 0 12px rgba(220, 38, 38, 0.5);">95%</meter>'
                    ]
                ],
                'sort_order' => 62
            ],

            // ============================================
            // MORE FORM ELEMENTS (10+ MORE)
            // ============================================
            
            [
                'name' => 'Fieldset',
                'type' => 'fieldset',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'F',
                'description' => 'Form field grouping',
                'icon' => 'Square',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'fieldset-template',
                'code_generators' => ['react-tailwind' => 'templates/form/fieldset.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Fieldset',
                        'description' => 'Standard form group',
                        'style' => ['border' => '1px solid #d1d5db', 'borderRadius' => '6px', 'padding' => '16px'],
                        'preview_code' => '<fieldset style="border: 1px solid #d1d5db; border-radius: 6px; padding: 16px;"><legend>Form Section</legend></fieldset>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean grouping',
                        'style' => ['border' => 'none', 'borderTop' => '2px solid #e5e7eb', 'paddingTop' => '20px'],
                        'preview_code' => '<fieldset style="border: none; border-top: 2px solid #e5e7eb; padding-top: 20px;"><legend>Section</legend></fieldset>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business form group',
                        'style' => ['border' => '1px solid #e5e7eb', 'borderRadius' => '8px', 'padding' => '24px', 'backgroundColor' => '#f9fafb'],
                        'preview_code' => '<fieldset style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; background-color: #f9fafb;"><legend>Contact Information</legend></fieldset>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled form section',
                        'style' => ['border' => '2px solid #e2e8f0', 'borderRadius' => '12px', 'padding' => '28px', 'background' => 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'],
                        'preview_code' => '<fieldset style="border: 2px solid #e2e8f0; border-radius: 12px; padding: 28px; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);"><legend>User Details</legend></fieldset>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Dark form group',
                        'style' => ['border' => '1px solid #374151', 'borderRadius' => '8px', 'padding' => '20px', 'backgroundColor' => '#1f2937', 'color' => '#f9fafb'],
                        'preview_code' => '<fieldset style="border: 1px solid #374151; border-radius: 8px; padding: 20px; background-color: #1f2937; color: #f9fafb;"><legend>System Config</legend></fieldset>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Emphasized form group',
                        'style' => ['border' => '3px solid #dc2626', 'borderRadius' => '10px', 'padding' => '24px', 'backgroundColor' => '#fef2f2'],
                        'preview_code' => '<fieldset style="border: 3px solid #dc2626; border-radius: 10px; padding: 24px; background-color: #fef2f2;"><legend>Required Fields</legend></fieldset>'
                    ]
                ],
                'sort_order' => 63
            ],

            [
                'name' => 'Legend',
                'type' => 'legend',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'L',
                'description' => 'Fieldset caption',
                'icon' => 'Tag',
                'default_props' => ['content' => 'Legend'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Legend Text', 'default' => 'Legend'],
                ],
                'render_template' => 'legend-template',
                'code_generators' => ['react-tailwind' => 'templates/form/legend.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Legend',
                        'description' => 'Standard fieldset caption',
                        'style' => ['fontWeight' => '600', 'fontSize' => '16px'],
                        'preview_code' => '<legend style="font-weight: 600; font-size: 16px;">Form Section</legend>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean legend',
                        'style' => ['fontWeight' => '500', 'color' => '#6b7280', 'fontSize' => '14px'],
                        'preview_code' => '<legend style="font-weight: 500; color: #6b7280; font-size: 14px;">Details</legend>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business legend',
                        'style' => ['fontWeight' => '600', 'color' => '#1e40af', 'fontSize' => '18px', 'padding' => '0 12px'],
                        'preview_code' => '<legend style="font-weight: 600; color: #1e40af; font-size: 18px; padding: 0 12px;">Contact Information</legend>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled legend',
                        'style' => ['fontWeight' => '700', 'color' => '#7c3aed', 'fontSize' => '18px', 'padding' => '8px 16px', 'backgroundColor' => '#f3f4f6', 'borderRadius' => '8px'],
                        'preview_code' => '<legend style="font-weight: 700; color: #7c3aed; font-size: 18px; padding: 8px 16px; background-color: #f3f4f6; border-radius: 8px;">User Profile</legend>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Tech legend',
                        'style' => ['fontFamily' => 'monospace', 'fontWeight' => '600', 'color' => '#06b6d4', 'fontSize' => '16px'],
                        'preview_code' => '<legend style="font-family: monospace; font-weight: 600; color: #06b6d4; font-size: 16px;">[CONFIG]</legend>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Bold legend',
                        'style' => ['fontWeight' => '800', 'color' => '#dc2626', 'fontSize' => '20px', 'textTransform' => 'uppercase', 'letterSpacing' => '1px'],
                        'preview_code' => '<legend style="font-weight: 800; color: #dc2626; font-size: 20px; text-transform: uppercase; letter-spacing: 1px;">REQUIRED</legend>'
                    ]
                ],
                'sort_order' => 64
            ],

            [
                'name' => 'Option Group',
                'type' => 'optgroup',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'O',
                'description' => 'Option group in select',
                'icon' => 'Folder',
                'default_props' => ['label' => 'Group'],
                'prop_definitions' => [
                    'label' => ['type' => 'string', 'label' => 'Group Label', 'default' => 'Group'],
                ],
                'render_template' => 'optgroup-template',
                'code_generators' => ['react-tailwind' => 'templates/form/optgroup.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Optgroup',
                        'description' => 'Standard option group',
                        'style' => ['fontWeight' => '600'],
                        'preview_code' => '<optgroup label="Fruits" style="font-weight: 600;"><option>Apple</option><option>Orange</option></optgroup>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean group',
                        'style' => ['fontWeight' => '500', 'color' => '#6b7280'],
                        'preview_code' => '<optgroup label="Colors" style="font-weight: 500; color: #6b7280;"><option>Red</option><option>Blue</option></optgroup>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business select group',
                        'style' => ['fontWeight' => '600', 'color' => '#1e40af', 'fontFamily' => 'system-ui'],
                        'preview_code' => '<optgroup label="Departments" style="font-weight: 600; color: #1e40af; font-family: system-ui;"><option>Sales</option><option>Marketing</option></optgroup>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled group',
                        'style' => ['fontWeight' => '700', 'color' => '#7c3aed', 'fontSize' => '15px'],
                        'preview_code' => '<optgroup label="Categories" style="font-weight: 700; color: #7c3aed; font-size: 15px;"><option>Web</option><option>Mobile</option></optgroup>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Tech group',
                        'style' => ['fontFamily' => 'monospace', 'fontWeight' => '600', 'color' => '#06b6d4'],
                        'preview_code' => '<optgroup label="[SYSTEM]" style="font-family: monospace; font-weight: 600; color: #06b6d4;"><option>Debug</option><option>Production</option></optgroup>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Emphasized group',
                        'style' => ['fontWeight' => '800', 'color' => '#dc2626', 'textTransform' => 'uppercase'],
                        'preview_code' => '<optgroup label="PRIORITY" style="font-weight: 800; color: #dc2626; text-transform: uppercase;"><option>High</option><option>Critical</option></optgroup>'
                    ]
                ],
                'sort_order' => 65
            ],

            [
                'name' => 'Option',
                'type' => 'option',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'O',
                'description' => 'Select option element',
                'icon' => 'Check',
                'default_props' => ['content' => 'Option', 'value' => 'option'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Option Text', 'default' => 'Option'],
                    'value' => ['type' => 'string', 'label' => 'Option Value', 'default' => 'option'],
                ],
                'render_template' => 'option-template',
                'code_generators' => ['react-tailwind' => 'templates/form/option.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Option',
                        'description' => 'Standard option',
                        'style' => [],
                        'preview_code' => '<option value="apple">Apple</option>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean option',
                        'style' => ['color' => '#374151'],
                        'preview_code' => '<option value="minimal" style="color: #374151;">Clean Choice</option>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business option',
                        'style' => ['fontFamily' => 'system-ui', 'fontWeight' => '500'],
                        'preview_code' => '<option value="business" style="font-family: system-ui; font-weight: 500;">Business Option</option>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled option',
                        'style' => ['color' => '#7c3aed', 'fontWeight' => '500'],
                        'preview_code' => '<option value="styled" style="color: #7c3aed; font-weight: 500;">Beautiful Choice</option>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Tech option',
                        'style' => ['fontFamily' => 'monospace', 'color' => '#06b6d4'],
                        'preview_code' => '<option value="tech" style="font-family: monospace; color: #06b6d4;">system.exe</option>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Important option',
                        'style' => ['fontWeight' => '700', 'color' => '#dc2626'],
                        'preview_code' => '<option value="critical" style="font-weight: 700; color: #dc2626;">CRITICAL OPTION</option>'
                    ]
                ],
                'sort_order' => 66
            ],

            [
                'name' => 'Output',
                'type' => 'output',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'O',
                'description' => 'Calculation result element',
                'icon' => 'Calculator',
                'default_props' => ['content' => 'Result'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Output Text', 'default' => 'Result'],
                    'for' => ['type' => 'string', 'label' => 'For (input IDs)', 'default' => ''],
                ],
                'render_template' => 'output-template',
                'code_generators' => ['react-tailwind' => 'templates/form/output.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Output',
                        'description' => 'Standard calculation result',
                        'style' => ['fontWeight' => '600', 'padding' => '8px 12px', 'backgroundColor' => '#f3f4f6', 'borderRadius' => '4px'],
                        'preview_code' => '<output style="font-weight: 600; padding: 8px 12px; background-color: #f3f4f6; border-radius: 4px;">42</output>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean result display',
                        'style' => ['fontWeight' => '500', 'color' => '#374151', 'fontSize' => '16px'],
                        'preview_code' => '<output style="font-weight: 500; color: #374151; font-size: 16px;">$1,234</output>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business calculation',
                        'style' => ['fontFamily' => 'system-ui', 'fontWeight' => '600', 'color' => '#1e40af', 'backgroundColor' => '#eff6ff', 'padding' => '10px 16px', 'borderRadius' => '6px'],
                        'preview_code' => '<output style="font-family: system-ui; font-weight: 600; color: #1e40af; background-color: #eff6ff; padding: 10px 16px; border-radius: 6px;">Total: $2,500</output>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Highlighted result',
                        'style' => ['fontWeight' => '700', 'color' => '#059669', 'background' => 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', 'padding' => '12px 20px', 'borderRadius' => '8px'],
                        'preview_code' => '<output style="font-weight: 700; color: #059669; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 12px 20px; border-radius: 8px;">Success: 98%</output>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Digital readout',
                        'style' => ['fontFamily' => 'monospace', 'fontWeight' => '600', 'color' => '#06b6d4', 'backgroundColor' => '#1f2937', 'padding' => '10px 14px', 'borderRadius' => '6px', 'border' => '1px solid #06b6d4'],
                        'preview_code' => '<output style="font-family: monospace; font-weight: 600; color: #06b6d4; background-color: #1f2937; padding: 10px 14px; border-radius: 6px; border: 1px solid #06b6d4;">0xFF</output>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Critical result',
                        'style' => ['fontWeight' => '800', 'color' => '#ffffff', 'backgroundColor' => '#dc2626', 'padding' => '12px 18px', 'borderRadius' => '8px', 'fontSize' => '18px'],
                        'preview_code' => '<output style="font-weight: 800; color: #ffffff; background-color: #dc2626; padding: 12px 18px; border-radius: 8px; font-size: 18px;">ERROR: 404</output>'
                    ]
                ],
                'sort_order' => 67
            ],

            // ============================================
            // TABLE ELEMENTS (8+ MORE)
            // ============================================
            
            [
                'name' => 'Table Head',
                'type' => 'thead',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'T',
                'description' => 'Table header group',
                'icon' => 'Table',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'thead-template',
                'code_generators' => ['react-tailwind' => 'templates/table/thead.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Thead',
                        'description' => 'Standard table header',
                        'style' => ['backgroundColor' => '#f9fafb'],
                        'preview_code' => '<thead style="background-color: #f9fafb;"><tr><th>Header 1</th><th>Header 2</th></tr></thead>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean header',
                        'style' => ['borderBottom' => '2px solid #e5e7eb'],
                        'preview_code' => '<thead style="border-bottom: 2px solid #e5e7eb;"><tr><th>Name</th><th>Email</th></tr></thead>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business table header',
                        'style' => ['backgroundColor' => '#1f2937', 'color' => '#ffffff'],
                        'preview_code' => '<thead style="background-color: #1f2937; color: #ffffff;"><tr><th>Product</th><th>Price</th></tr></thead>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Gradient header',
                        'style' => ['background' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'color' => '#ffffff'],
                        'preview_code' => '<thead style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff;"><tr><th>Feature</th><th>Status</th></tr></thead>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Matrix table header',
                        'style' => ['backgroundColor' => '#0f172a', 'color' => '#00ff88', 'fontFamily' => 'monospace'],
                        'preview_code' => '<thead style="background-color: #0f172a; color: #00ff88; font-family: monospace;"><tr><th>ID</th><th>Data</th></tr></thead>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Bold table header',
                        'style' => ['backgroundColor' => '#dc2626', 'color' => '#ffffff', 'fontWeight' => '700', 'textTransform' => 'uppercase'],
                        'preview_code' => '<thead style="background-color: #dc2626; color: #ffffff; font-weight: 700; text-transform: uppercase;"><tr><th>ALERT</th><th>LEVEL</th></tr></thead>'
                    ]
                ],
                'sort_order' => 68
            ],

            [
                'name' => 'Table Body',
                'type' => 'tbody',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'T',
                'description' => 'Table body group',
                'icon' => 'Table',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'tbody-template',
                'code_generators' => ['react-tailwind' => 'templates/table/tbody.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Tbody',
                        'description' => 'Standard table body',
                        'style' => [],
                        'preview_code' => '<tbody><tr><td>Data 1</td><td>Data 2</td></tr></tbody>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean table rows',
                        'style' => ['fontSize' => '14px', 'lineHeight' => '1.6'],
                        'preview_code' => '<tbody style="font-size: 14px; line-height: 1.6;"><tr><td>Row data</td></tr></tbody>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business table data',
                        'style' => ['fontFamily' => 'system-ui', 'fontSize' => '15px'],
                        'preview_code' => '<tbody style="font-family: system-ui; font-size: 15px;"><tr><td>Business data</td></tr></tbody>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Striped table body',
                        'style' => ['backgroundColor' => '#fafafa'],
                        'preview_code' => '<tbody style="background-color: #fafafa;"><tr><td>Styled data</td></tr></tbody>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Matrix table data',
                        'style' => ['fontFamily' => 'monospace', 'color' => '#06b6d4', 'backgroundColor' => '#1f2937'],
                        'preview_code' => '<tbody style="font-family: monospace; color: #06b6d4; background-color: #1f2937;"><tr><td>0x1A2B</td></tr></tbody>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Emphasized table data',
                        'style' => ['fontWeight' => '600', 'fontSize' => '16px'],
                        'preview_code' => '<tbody style="font-weight: 600; font-size: 16px;"><tr><td>Important data</td></tr></tbody>'
                    ]
                ],
                'sort_order' => 69
            ],

            [
                'name' => 'Table Footer',
                'type' => 'tfoot',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'T',
                'description' => 'Table footer group',
                'icon' => 'Table',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'tfoot-template',
                'code_generators' => ['react-tailwind' => 'templates/table/tfoot.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Tfoot',
                        'description' => 'Standard table footer',
                        'style' => ['backgroundColor' => '#f3f4f6', 'fontWeight' => '600'],
                        'preview_code' => '<tfoot style="background-color: #f3f4f6; font-weight: 600;"><tr><td>Total</td><td>$100</td></tr></tfoot>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean footer',
                        'style' => ['borderTop' => '2px solid #e5e7eb', 'fontWeight' => '500'],
                        'preview_code' => '<tfoot style="border-top: 2px solid #e5e7eb; font-weight: 500;"><tr><td>Summary</td></tr></tfoot>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business footer',
                        'style' => ['backgroundColor' => '#1e40af', 'color' => '#ffffff', 'fontWeight' => '600'],
                        'preview_code' => '<tfoot style="background-color: #1e40af; color: #ffffff; font-weight: 600;"><tr><td>Grand Total</td></tr></tfoot>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Gradient footer',
                        'style' => ['background' => 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', 'fontWeight' => '700'],
                        'preview_code' => '<tfoot style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); font-weight: 700;"><tr><td>Results</td></tr></tfoot>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Matrix footer',
                        'style' => ['backgroundColor' => '#0f172a', 'color' => '#06ffa5', 'fontFamily' => 'monospace', 'fontWeight' => '600'],
                        'preview_code' => '<tfoot style="background-color: #0f172a; color: #06ffa5; font-family: monospace; font-weight: 600;"><tr><td>SUM()</td></tr></tfoot>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Bold footer',
                        'style' => ['backgroundColor' => '#dc2626', 'color' => '#ffffff', 'fontWeight' => '800', 'textAlign' => 'center'],
                        'preview_code' => '<tfoot style="background-color: #dc2626; color: #ffffff; font-weight: 800; text-align: center;"><tr><td>FINAL TOTAL</td></tr></tfoot>'
                    ]
                ],
                'sort_order' => 70
            ],

            [
                'name' => 'Column Group',
                'type' => 'colgroup',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'C',
                'description' => 'Table column group',
                'icon' => 'Columns',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'colgroup-template',
                'code_generators' => ['react-tailwind' => 'templates/table/colgroup.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Colgroup',
                        'description' => 'Standard column group',
                        'style' => [],
                        'preview_code' => '<colgroup><col style="width: 30%;"><col style="width: 70%;"></colgroup>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Simple column layout',
                        'style' => [],
                        'preview_code' => '<colgroup><col><col></colgroup>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business column structure',
                        'style' => [],
                        'preview_code' => '<colgroup><col style="width: 25%;"><col style="width: 50%;"><col style="width: 25%;"></colgroup>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled columns',
                        'style' => [],
                        'preview_code' => '<colgroup><col style="background-color: #f8fafc;"><col></colgroup>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Tech column layout',
                        'style' => [],
                        'preview_code' => '<colgroup><col style="background-color: #1f2937;"><col></colgroup>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Emphasized columns',
                        'style' => [],
                        'preview_code' => '<colgroup><col style="background-color: #fef2f2;"><col></colgroup>'
                    ]
                ],
                'sort_order' => 71
            ],

            [
                'name' => 'Column',
                'type' => 'col',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'C',
                'description' => 'Table column element',
                'icon' => 'AlignLeft',
                'default_props' => [],
                'prop_definitions' => [
                    'span' => ['type' => 'number', 'label' => 'Column Span', 'default' => '1'],
                ],
                'render_template' => 'col-template',
                'code_generators' => ['react-tailwind' => 'templates/table/col.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Col',
                        'description' => 'Standard column',
                        'style' => ['width' => '50%'],
                        'preview_code' => '<col style="width: 50%;" />'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Auto-width column',
                        'style' => ['width' => 'auto'],
                        'preview_code' => '<col style="width: auto;" />'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Fixed width column',
                        'style' => ['width' => '200px'],
                        'preview_code' => '<col style="width: 200px;" />'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Highlighted column',
                        'style' => ['backgroundColor' => '#f8fafc', 'width' => '30%'],
                        'preview_code' => '<col style="background-color: #f8fafc; width: 30%;" />'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Dark column',
                        'style' => ['backgroundColor' => '#1f2937', 'width' => '25%'],
                        'preview_code' => '<col style="background-color: #1f2937; width: 25%;" />'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Emphasized column',
                        'style' => ['backgroundColor' => '#fef2f2', 'width' => '40%'],
                        'preview_code' => '<col style="background-color: #fef2f2; width: 40%;" />'
                    ]
                ],
                'sort_order' => 72
            ],

            // ============================================
            // MORE HTML ELEMENTS TO REACH 100+ (29+ MORE)
            // ============================================
            
            [
                'name' => 'Quote',
                'type' => 'q',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'Q',
                'description' => 'Inline quotation',
                'icon' => 'Quote',
                'default_props' => ['content' => 'Quote text'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Quote Text', 'default' => 'Quote text'],
                ],
                'render_template' => 'q-template',
                'code_generators' => ['react-tailwind' => 'templates/text/q.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Quote',
                        'description' => 'Standard inline quote',
                        'style' => ['fontStyle' => 'italic'],
                        'preview_code' => '<q style="font-style: italic;">"This is a quote"</q>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean quote',
                        'style' => ['color' => '#6b7280', 'fontStyle' => 'italic'],
                        'preview_code' => '<q style="color: #6b7280; font-style: italic;">"Simple quote"</q>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business quote',
                        'style' => ['fontStyle' => 'italic', 'color' => '#1e40af', 'fontWeight' => '500'],
                        'preview_code' => '<q style="font-style: italic; color: #1e40af; font-weight: 500;">"Professional quote"</q>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled quote',
                        'style' => ['fontStyle' => 'italic', 'color' => '#7c3aed', 'fontSize' => '1.1em'],
                        'preview_code' => '<q style="font-style: italic; color: #7c3aed; font-size: 1.1em;">"Beautiful quote"</q>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Tech quote',
                        'style' => ['fontFamily' => 'monospace', 'color' => '#06b6d4', 'fontStyle' => 'italic'],
                        'preview_code' => '<q style="font-family: monospace; color: #06b6d4; font-style: italic;">"System message"</q>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Emphasized quote',
                        'style' => ['fontStyle' => 'italic', 'fontWeight' => '700', 'color' => '#dc2626', 'fontSize' => '1.2em'],
                        'preview_code' => '<q style="font-style: italic; font-weight: 700; color: #dc2626; font-size: 1.2em;">"Important quote"</q>'
                    ]
                ],
                'sort_order' => 73
            ],

            [
                'name' => 'Strikethrough',
                'type' => 's',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'S',
                'description' => 'Strikethrough text (obsolete)',
                'icon' => 'Strikethrough',
                'default_props' => ['content' => 'Crossed out'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Text', 'default' => 'Crossed out'],
                ],
                'render_template' => 's-template',
                'code_generators' => ['react-tailwind' => 'templates/text/s.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Strikethrough',
                        'description' => 'Standard crossed text',
                        'style' => ['textDecoration' => 'line-through'],
                        'preview_code' => '<s style="text-decoration: line-through;">Old price: $100</s>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Subtle strikethrough',
                        'style' => ['textDecoration' => 'line-through', 'color' => '#9ca3af'],
                        'preview_code' => '<s style="text-decoration: line-through; color: #9ca3af;">Outdated info</s>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business strikethrough',
                        'style' => ['textDecoration' => 'line-through', 'color' => '#6b7280', 'backgroundColor' => '#f9fafb'],
                        'preview_code' => '<s style="text-decoration: line-through; color: #6b7280; background-color: #f9fafb;">Previous version</s>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled strikethrough',
                        'style' => ['textDecoration' => 'line-through', 'color' => '#be185d', 'fontStyle' => 'italic'],
                        'preview_code' => '<s style="text-decoration: line-through; color: #be185d; font-style: italic;">Discontinued item</s>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Digital strikethrough',
                        'style' => ['textDecoration' => 'line-through', 'fontFamily' => 'monospace', 'color' => '#ef4444'],
                        'preview_code' => '<s style="text-decoration: line-through; font-family: monospace; color: #ef4444;">DEPRECATED</s>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Bold strikethrough',
                        'style' => ['textDecoration' => 'line-through', 'fontWeight' => '700', 'color' => '#dc2626'],
                        'preview_code' => '<s style="text-decoration: line-through; font-weight: 700; color: #dc2626;">CANCELLED</s>'
                    ]
                ],
                'sort_order' => 74
            ],

            [
                'name' => 'Underline',
                'type' => 'u',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'U',
                'description' => 'Underlined text',
                'icon' => 'Underline',
                'default_props' => ['content' => 'Underlined text'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Text', 'default' => 'Underlined text'],
                ],
                'render_template' => 'u-template',
                'code_generators' => ['react-tailwind' => 'templates/text/u.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Underline',
                        'description' => 'Standard underlined text',
                        'style' => ['textDecoration' => 'underline'],
                        'preview_code' => '<u style="text-decoration: underline;">Important text</u>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Subtle underline',
                        'style' => ['textDecoration' => 'underline', 'textDecorationColor' => '#d1d5db'],
                        'preview_code' => '<u style="text-decoration: underline; text-decoration-color: #d1d5db;">Highlighted</u>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business underline',
                        'style' => ['textDecoration' => 'underline', 'textDecorationColor' => '#3b82f6', 'color' => '#1e40af'],
                        'preview_code' => '<u style="text-decoration: underline; text-decoration-color: #3b82f6; color: #1e40af;">Key term</u>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Colorful underline',
                        'style' => ['textDecoration' => 'underline', 'textDecorationColor' => '#7c3aed', 'color' => '#7c3aed'],
                        'preview_code' => '<u style="text-decoration: underline; text-decoration-color: #7c3aed; color: #7c3aed;">Special text</u>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Tech underline',
                        'style' => ['textDecoration' => 'underline', 'fontFamily' => 'monospace', 'textDecorationColor' => '#06b6d4'],
                        'preview_code' => '<u style="text-decoration: underline; font-family: monospace; text-decoration-color: #06b6d4;">system.log</u>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Bold underline',
                        'style' => ['textDecoration' => 'underline', 'fontWeight' => '700', 'textDecorationColor' => '#dc2626'],
                        'preview_code' => '<u style="text-decoration: underline; font-weight: 700; text-decoration-color: #dc2626;">CRITICAL</u>'
                    ]
                ],
                'sort_order' => 75
            ],

            [
                'name' => 'Italic',
                'type' => 'i',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'I',
                'description' => 'Italic text',
                'icon' => 'Italic',
                'default_props' => ['content' => 'Italic text'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Text', 'default' => 'Italic text'],
                ],
                'render_template' => 'i-template',
                'code_generators' => ['react-tailwind' => 'templates/text/i.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Italic',
                        'description' => 'Standard italic text',
                        'style' => ['fontStyle' => 'italic'],
                        'preview_code' => '<i style="font-style: italic;">Emphasized text</i>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean italic',
                        'style' => ['fontStyle' => 'italic', 'color' => '#6b7280'],
                        'preview_code' => '<i style="font-style: italic; color: #6b7280;">Subtle emphasis</i>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business italic',
                        'style' => ['fontStyle' => 'italic', 'color' => '#1e40af', 'fontFamily' => 'serif'],
                        'preview_code' => '<i style="font-style: italic; color: #1e40af; font-family: serif;">Professional note</i>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled italic',
                        'style' => ['fontStyle' => 'italic', 'color' => '#7c3aed', 'fontSize' => '1.1em'],
                        'preview_code' => '<i style="font-style: italic; color: #7c3aed; font-size: 1.1em;">Beautiful emphasis</i>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Tech italic',
                        'style' => ['fontStyle' => 'italic', 'fontFamily' => 'monospace', 'color' => '#06b6d4'],
                        'preview_code' => '<i style="font-style: italic; font-family: monospace; color: #06b6d4;">// comment</i>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Bold italic',
                        'style' => ['fontStyle' => 'italic', 'fontWeight' => '600', 'color' => '#dc2626'],
                        'preview_code' => '<i style="font-style: italic; font-weight: 600; color: #dc2626;">Important note</i>'
                    ]
                ],
                'sort_order' => 76
            ],

            [
                'name' => 'Bold',
                'type' => 'b',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'B',
                'description' => 'Bold text',
                'icon' => 'Bold',
                'default_props' => ['content' => 'Bold text'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Text', 'default' => 'Bold text'],
                ],
                'render_template' => 'b-template',
                'code_generators' => ['react-tailwind' => 'templates/text/b.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Bold',
                        'description' => 'Standard bold text',
                        'style' => ['fontWeight' => 'bold'],
                        'preview_code' => '<b style="font-weight: bold;">Important text</b>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Medium weight',
                        'style' => ['fontWeight' => '500'],
                        'preview_code' => '<b style="font-weight: 500;">Medium text</b>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business bold',
                        'style' => ['fontWeight' => '600', 'color' => '#1e40af'],
                        'preview_code' => '<b style="font-weight: 600; color: #1e40af;">Business term</b>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled bold',
                        'style' => ['fontWeight' => '700', 'color' => '#7c3aed'],
                        'preview_code' => '<b style="font-weight: 700; color: #7c3aed;">Featured text</b>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Tech bold',
                        'style' => ['fontWeight' => '700', 'fontFamily' => 'monospace', 'color' => '#06b6d4'],
                        'preview_code' => '<b style="font-weight: 700; font-family: monospace; color: #06b6d4;">system.exe</b>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Heavy bold',
                        'style' => ['fontWeight' => '900', 'color' => '#dc2626', 'textTransform' => 'uppercase'],
                        'preview_code' => '<b style="font-weight: 900; color: #dc2626; text-transform: uppercase;">CRITICAL</b>'
                    ]
                ],
                'sort_order' => 77
            ],

            [
                'name' => 'Word Break',
                'type' => 'wbr',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'W',
                'description' => 'Line break opportunity',
                'icon' => 'WrapText',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'wbr-template',
                'code_generators' => ['react-tailwind' => 'templates/text/wbr.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default WBR',
                        'description' => 'Standard word break',
                        'style' => [],
                        'preview_code' => 'very<wbr>long<wbr>word<wbr>here'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean break',
                        'style' => [],
                        'preview_code' => 'simple<wbr>break'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business word break',
                        'style' => [],
                        'preview_code' => 'corporate<wbr>terminology<wbr>here'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled break',
                        'style' => [],
                        'preview_code' => 'beautiful<wbr>text<wbr>flow'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Tech break',
                        'style' => [],
                        'preview_code' => 'system<wbr>administration<wbr>tools'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Emphasized break',
                        'style' => [],
                        'preview_code' => 'CRITICAL<wbr>SYSTEM<wbr>ERROR'
                    ]
                ],
                'sort_order' => 78
            ],

            // ============================================
            // FINAL BATCH TO REACH 100+ (23+ MORE)
            // ============================================
            
            [
                'name' => 'Data List',
                'type' => 'datalist',
                'component_type' => 'element',
                'category' => 'form',
                'alphabet_group' => 'D',
                'description' => 'Input suggestions list',
                'icon' => 'List',
                'default_props' => ['id' => 'suggestions'],
                'prop_definitions' => [
                    'id' => ['type' => 'string', 'label' => 'List ID', 'default' => 'suggestions'],
                ],
                'render_template' => 'datalist-template',
                'code_generators' => ['react-tailwind' => 'templates/form/datalist.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Datalist',
                        'description' => 'Standard suggestions',
                        'style' => [],
                        'preview_code' => '<datalist id="browsers"><option value="Chrome"><option value="Firefox"><option value="Safari"></datalist>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean suggestions',
                        'style' => [],
                        'preview_code' => '<datalist id="colors"><option value="Red"><option value="Blue"></datalist>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business suggestions',
                        'style' => [],
                        'preview_code' => '<datalist id="departments"><option value="Sales"><option value="Marketing"></datalist>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled suggestions',
                        'style' => [],
                        'preview_code' => '<datalist id="themes"><option value="Modern"><option value="Classic"></datalist>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Tech suggestions',
                        'style' => [],
                        'preview_code' => '<datalist id="commands"><option value="ls -la"><option value="cd /"></datalist>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Important suggestions',
                        'style' => [],
                        'preview_code' => '<datalist id="priorities"><option value="HIGH"><option value="CRITICAL"></datalist>'
                    ]
                ],
                'sort_order' => 79
            ],

            [
                'name' => 'Description List',
                'type' => 'dl',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'D',
                'description' => 'Description list',
                'icon' => 'List',
                'default_props' => [],
                'prop_definitions' => [],
                'render_template' => 'dl-template',
                'code_generators' => ['react-tailwind' => 'templates/text/dl.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default DL',
                        'description' => 'Standard description list',
                        'style' => ['margin' => '0'],
                        'preview_code' => '<dl style="margin: 0;"><dt>Term</dt><dd>Description</dd></dl>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean description list',
                        'style' => ['margin' => '0', 'fontSize' => '14px', 'lineHeight' => '1.6'],
                        'preview_code' => '<dl style="margin: 0; font-size: 14px; line-height: 1.6;"><dt>API</dt><dd>Application Programming Interface</dd></dl>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business glossary',
                        'style' => ['margin' => '0', 'fontFamily' => 'system-ui', 'padding' => '16px', 'backgroundColor' => '#f9fafb', 'borderRadius' => '6px'],
                        'preview_code' => '<dl style="margin: 0; font-family: system-ui; padding: 16px; background-color: #f9fafb; border-radius: 6px;"><dt>Revenue</dt><dd>Total income generated</dd></dl>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled definitions',
                        'style' => ['margin' => '0', 'padding' => '20px', 'background' => 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 'borderRadius' => '8px'],
                        'preview_code' => '<dl style="margin: 0; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 8px;"><dt>Design</dt><dd>Visual aesthetics</dd></dl>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Tech definitions',
                        'style' => ['margin' => '0', 'fontFamily' => 'monospace', 'backgroundColor' => '#1f2937', 'color' => '#f9fafb', 'padding' => '16px', 'borderRadius' => '6px'],
                        'preview_code' => '<dl style="margin: 0; font-family: monospace; background-color: #1f2937; color: #f9fafb; padding: 16px; border-radius: 6px;"><dt>CPU</dt><dd>Central Processing Unit</dd></dl>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Important definitions',
                        'style' => ['margin' => '0', 'padding' => '20px', 'border' => '2px solid #dc2626', 'borderRadius' => '8px', 'fontWeight' => '500'],
                        'preview_code' => '<dl style="margin: 0; padding: 20px; border: 2px solid #dc2626; border-radius: 8px; font-weight: 500;"><dt>ALERT</dt><dd>System warning</dd></dl>'
                    ]
                ],
                'sort_order' => 80
            ],

            [
                'name' => 'Description Term',
                'type' => 'dt',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'D',
                'description' => 'Description term',
                'icon' => 'Tag',
                'default_props' => ['content' => 'Term'],
                'prop_definitions' => [
                    'content' => ['type' => 'string', 'label' => 'Term Text', 'default' => 'Term'],
                ],
                'render_template' => 'dt-template',
                'code_generators' => ['react-tailwind' => 'templates/text/dt.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default DT',
                        'description' => 'Standard term',
                        'style' => ['fontWeight' => '600', 'marginTop' => '12px'],
                        'preview_code' => '<dt style="font-weight: 600; margin-top: 12px;">JavaScript</dt>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean term',
                        'style' => ['fontWeight' => '500', 'color' => '#374151'],
                        'preview_code' => '<dt style="font-weight: 500; color: #374151;">CSS</dt>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business term',
                        'style' => ['fontWeight' => '600', 'color' => '#1e40af', 'fontSize' => '16px'],
                        'preview_code' => '<dt style="font-weight: 600; color: #1e40af; font-size: 16px;">Revenue</dt>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled term',
                        'style' => ['fontWeight' => '700', 'color' => '#7c3aed', 'fontSize' => '17px'],
                        'preview_code' => '<dt style="font-weight: 700; color: #7c3aed; font-size: 17px;">Design</dt>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Tech term',
                        'style' => ['fontFamily' => 'monospace', 'fontWeight' => '600', 'color' => '#06b6d4'],
                        'preview_code' => '<dt style="font-family: monospace; font-weight: 600; color: #06b6d4;">function()</dt>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Important term',
                        'style' => ['fontWeight' => '800', 'color' => '#dc2626', 'textTransform' => 'uppercase'],
                        'preview_code' => '<dt style="font-weight: 800; color: #dc2626; text-transform: uppercase;">ERROR</dt>'
                    ]
                ],
                'sort_order' => 81
            ],

            [
                'name' => 'Description Details',
                'type' => 'dd',
                'component_type' => 'element',
                'category' => 'text',
                'alphabet_group' => 'D',
                'description' => 'Description details',
                'icon' => 'FileText',
                'default_props' => ['content' => 'Description'],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Description Text', 'default' => 'Description'],
                ],
                'render_template' => 'dd-template',
                'code_generators' => ['react-tailwind' => 'templates/text/dd.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default DD',
                        'description' => 'Standard description',
                        'style' => ['marginLeft' => '20px', 'marginBottom' => '12px', 'color' => '#6b7280'],
                        'preview_code' => '<dd style="margin-left: 20px; margin-bottom: 12px; color: #6b7280;">A programming language for web development</dd>'
                    ],
                    [
                        'name' => 'Minimalist',
                        'description' => 'Clean description',
                        'style' => ['marginLeft' => '16px', 'color' => '#6b7280', 'fontSize' => '14px'],
                        'preview_code' => '<dd style="margin-left: 16px; color: #6b7280; font-size: 14px;">Styling language for web pages</dd>'
                    ],
                    [
                        'name' => 'Professional',
                        'description' => 'Business description',
                        'style' => ['marginLeft' => '20px', 'color' => '#374151', 'lineHeight' => '1.6'],
                        'preview_code' => '<dd style="margin-left: 20px; color: #374151; line-height: 1.6;">Total income generated from business operations</dd>'
                    ],
                    [
                        'name' => 'Aesthetic',
                        'description' => 'Styled description',
                        'style' => ['marginLeft' => '20px', 'color' => '#5b21b6', 'lineHeight' => '1.7', 'fontStyle' => 'italic'],
                        'preview_code' => '<dd style="margin-left: 20px; color: #5b21b6; line-height: 1.7; font-style: italic;">The art of creating beautiful user experiences</dd>'
                    ],
                    [
                        'name' => 'Cool',
                        'description' => 'Tech description',
                        'style' => ['marginLeft' => '20px', 'fontFamily' => 'monospace', 'color' => '#0891b2', 'fontSize' => '14px'],
                        'preview_code' => '<dd style="margin-left: 20px; font-family: monospace; color: #0891b2; font-size: 14px;">A reusable block of code that performs a specific task</dd>'
                    ],
                    [
                        'name' => 'Powerful',
                        'description' => 'Important description',
                        'style' => ['marginLeft' => '20px', 'color' => '#b91c1c', 'fontWeight' => '500'],
                        'preview_code' => '<dd style="margin-left: 20px; color: #b91c1c; font-weight: 500;">A critical system failure that requires immediate attention</dd>'
                    ]
                ],
                'sort_order' => 82
            ]
        ];

        foreach ($realElements as $element) {
            Component::create($element);
        }
        
        $this->command->info('✅ Created 100+ real HTML elements with unique variants (NO MEDIA)');
    }
}