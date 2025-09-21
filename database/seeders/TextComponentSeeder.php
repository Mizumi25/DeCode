<?php
// database/seeders/TextComponentSeeder.php - Typography and Text Elements

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class TextComponentSeeder extends Seeder
{
    public function run(): void
    {
        $textComponents = [
            // TYPOGRAPHY ELEMENTS
            [
                'name' => 'Heading 1',
                'type' => 'h1',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'H',
                'description' => 'Large main heading text',
                'icon' => 'Type',
                'default_props' => [
                    'text' => 'Main Heading',
                    'align' => 'left',
                    'color' => '#1f2937',
                    'weight' => 'bold'
                ],
                'prop_definitions' => [
                    'text' => [
                        'type' => 'string',
                        'label' => 'Heading Text',
                        'default' => 'Main Heading'
                    ],
                    'align' => [
                        'type' => 'select',
                        'label' => 'Text Alignment',
                        'options' => ['left', 'center', 'right'],
                        'default' => 'left'
                    ],
                    'color' => [
                        'type' => 'color',
                        'label' => 'Text Color',
                        'default' => '#1f2937'
                    ],
                    'weight' => [
                        'type' => 'select',
                        'label' => 'Font Weight',
                        'options' => ['normal', 'medium', 'semibold', 'bold', 'extrabold'],
                        'default' => 'bold'
                    ]
                ],
                'render_template' => 'heading-template', 'code_generators' => [], 'variants' => [
                    [
                        'name' => 'Hero Title',
                        'description' => 'Large hero section title',
                        'props' => ['text' => 'Welcome to Our Platform', 'align' => 'center', 'weight' => 'extrabold'],
                        'preview_code' => '<h1 className="text-6xl font-extrabold text-center text-gray-900">Welcome to Our Platform</h1>'
                    ],
                    [
                        'name' => 'Section Title',
                        'description' => 'Main section heading',
                        'props' => ['text' => 'Our Services', 'align' => 'left', 'weight' => 'bold'],
                        'preview_code' => '<h1 className="text-4xl font-bold text-gray-900">Our Services</h1>'
                    ]
                ],
                'has_animation' => false,
                'sort_order' => 31
            ],
            
            [
                'name' => 'Heading 2',
                'type' => 'h2',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'H',
                'description' => 'Secondary heading text',
                'icon' => 'Type',
                'default_props' => [
                    'text' => 'Section Heading',
                    'align' => 'left',
                    'color' => '#1f2937',
                    'weight' => 'semibold'
                ],
                'prop_definitions' => [
                    'text' => [
                        'type' => 'string',
                        'label' => 'Heading Text',
                        'default' => 'Section Heading'
                    ],
                    'align' => [
                        'type' => 'select',
                        'label' => 'Text Alignment',
                        'options' => ['left', 'center', 'right'],
                        'default' => 'left'
                    ],
                    'color' => [
                        'type' => 'color',
                        'label' => 'Text Color',
                        'default' => '#1f2937'
                    ]
                ],
                'render_template' => 'heading-template', 'code_generators' => [], 'variants' => [
                    [
                        'name' => 'Subsection Title',
                        'description' => 'Subsection heading',
                        'props' => ['text' => 'Key Features', 'weight' => 'semibold'],
                        'preview_code' => '<h2 className="text-3xl font-semibold text-gray-900">Key Features</h2>'
                    ]
                ],
                'has_animation' => false,
                'sort_order' => 32
            ],
            
            [
                'name' => 'Heading 3',
                'type' => 'h3',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'H',
                'description' => 'Third level heading',
                'icon' => 'Type',
                'default_props' => [
                    'text' => 'Subheading',
                    'align' => 'left',
                    'color' => '#1f2937',
                    'weight' => 'semibold'
                ],
                'prop_definitions' => [
                    'text' => [
                        'type' => 'string',
                        'label' => 'Heading Text',
                        'default' => 'Subheading'
                    ],
                    'align' => [
                        'type' => 'select',
                        'label' => 'Text Alignment',
                        'options' => ['left', 'center', 'right'],
                        'default' => 'left'
                    ]
                ],
                'render_template' => 'heading-template', 'code_generators' => [], 'variants' => [
                    [
                        'name' => 'Card Title',
                        'description' => 'Card or component title',
                        'props' => ['text' => 'Feature Title'],
                        'preview_code' => '<h3 className="text-xl font-semibold text-gray-900">Feature Title</h3>'
                    ]
                ],
                'has_animation' => false,
                'sort_order' => 33
            ],
            
            [
                'name' => 'Paragraph',
                'type' => 'p',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'P',
                'description' => 'Paragraph text content',
                'icon' => 'FileText',
                'default_props' => [
                    'text' => 'This is a paragraph of text content. You can customize the styling, alignment, and appearance to match your design needs.',
                    'align' => 'left',
                    'size' => 'base',
                    'color' => '#6b7280',
                    'lineHeight' => 'relaxed'
                ],
                'prop_definitions' => [
                    'text' => [
                        'type' => 'textarea',
                        'label' => 'Paragraph Text',
                        'default' => 'This is a paragraph of text content. You can customize the styling, alignment, and appearance to match your design needs.'
                    ],
                    'align' => [
                        'type' => 'select',
                        'label' => 'Text Alignment',
                        'options' => ['left', 'center', 'right', 'justify'],
                        'default' => 'left'
                    ],
                    'size' => [
                        'type' => 'select',
                        'label' => 'Text Size',
                        'options' => ['sm', 'base', 'lg', 'xl'],
                        'default' => 'base'
                    ],
                    'color' => [
                        'type' => 'color',
                        'label' => 'Text Color',
                        'default' => '#6b7280'
                    ],
                    'lineHeight' => [
                        'type' => 'select',
                        'label' => 'Line Height',
                        'options' => ['tight', 'normal', 'relaxed', 'loose'],
                        'default' => 'relaxed'
                    ]
                ],
                'render_template' => 'heading-template', 'code_generators' => [], 'variants' => [
                    [
                        'name' => 'Lead Text',
                        'description' => 'Large introductory paragraph',
                        'props' => ['text' => 'This is a lead paragraph that introduces the main content with larger, more prominent text.', 'size' => 'lg', 'color' => '#374151'],
                        'preview_code' => '<p className="text-lg text-gray-700 leading-relaxed">This is a lead paragraph that introduces the main content with larger, more prominent text.</p>'
                    ],
                    [
                        'name' => 'Caption Text',
                        'description' => 'Small caption or description text',
                        'props' => ['text' => 'Image caption or small description text appears here.', 'size' => 'sm', 'color' => '#9ca3af'],
                        'preview_code' => '<p className="text-sm text-gray-400">Image caption or small description text appears here.</p>'
                    ]
                ],
                'has_animation' => false,
                'sort_order' => 34
            ],
            
            [
                'name' => 'Link Text',
                'type' => 'link',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'L',
                'description' => 'Clickable link element',
                'icon' => 'Link',
                'default_props' => [
                    'text' => 'Click here',
                    'href' => '#',
                    'color' => '#3b82f6',
                    'underline' => true,
                    'target' => '_self'
                ],
                'prop_definitions' => [
                    'text' => [
                        'type' => 'string',
                        'label' => 'Link Text',
                        'default' => 'Click here'
                    ],
                    'href' => [
                        'type' => 'string',
                        'label' => 'Link URL',
                        'default' => '#'
                    ],
                    'color' => [
                        'type' => 'color',
                        'label' => 'Link Color',
                        'default' => '#3b82f6'
                    ],
                    'underline' => [
                        'type' => 'boolean',
                        'label' => 'Show Underline',
                        'default' => true
                    ],
                    'target' => [
                        'type' => 'select',
                        'label' => 'Link Target',
                        'options' => ['_self', '_blank'],
                        'default' => '_self'
                    ]
                ],
                'render_template' => 'heading-template', 'code_generators' => [], 'variants' => [
                    [
                        'name' => 'Call to Action Link',
                        'description' => 'Primary action link',
                        'props' => ['text' => 'Learn More', 'href' => '#learn-more', 'color' => '#dc2626', 'underline' => false],
                        'preview_code' => '<a href="#learn-more" className="text-red-600 hover:text-red-800 font-medium">Learn More</a>'
                    ],
                    [
                        'name' => 'External Link',
                        'description' => 'Link to external website',
                        'props' => ['text' => 'Visit Website', 'href' => 'https://example.com', 'target' => '_blank', 'underline' => true],
                        'preview_code' => '<a href="https://example.com" target="_blank" className="text-blue-600 hover:text-blue-800 underline">Visit Website</a>'
                    ]
                ],
                'has_animation' => false,
                'sort_order' => 35
            ],
            
            [
                'name' => 'Quote Block',
                'type' => 'blockquote',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'Q',
                'description' => 'Styled quote or testimonial block',
                'icon' => 'Quote',
                'default_props' => [
                    'text' => 'This is an inspiring quote or testimonial that adds credibility and engagement to your content.',
                    'author' => 'John Doe',
                    'role' => 'CEO, Company',
                    'style' => 'bordered'
                ],
                'prop_definitions' => [
                    'text' => [
                        'type' => 'textarea',
                        'label' => 'Quote Text',
                        'default' => 'This is an inspiring quote or testimonial that adds credibility and engagement to your content.'
                    ],
                    'author' => [
                        'type' => 'string',
                        'label' => 'Author Name',
                        'default' => 'John Doe'
                    ],
                    'role' => [
                        'type' => 'string',
                        'label' => 'Author Role/Title',
                        'default' => 'CEO, Company'
                    ],
                    'style' => [
                        'type' => 'select',
                        'label' => 'Quote Style',
                        'options' => ['bordered', 'highlighted', 'minimal', 'card'],
                        'default' => 'bordered'
                    ]
                ],
                'render_template' => 'heading-template', 'code_generators' => [], 'variants' => [
                    [
                        'name' => 'Customer Testimonial',
                        'description' => 'Customer review or testimonial',
                        'props' => ['text' => 'This product has completely transformed how we work. Highly recommend!', 'author' => 'Sarah Johnson', 'role' => 'Marketing Director', 'style' => 'card'],
                        'preview_code' => '<blockquote className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600"><p className="text-gray-700 italic mb-4">"This product has completely transformed how we work. Highly recommend!"</p><cite className="text-sm font-medium text-gray-900">— Sarah Johnson, Marketing Director</cite></blockquote>'
                    ]
                ],
                'has_animation' => false,
                'sort_order' => 36
            ],
            
            [
                'name' => 'Code Block',
                'type' => 'code',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'C',
                'description' => 'Formatted code display block',
                'icon' => 'Code',
                'default_props' => [
                    'code' => 'const greeting = "Hello, World!";\nconsole.log(greeting);',
                    'language' => 'javascript',
                    'showLineNumbers' => true,
                    'theme' => 'dark'
                ],
                'prop_definitions' => [
                    'code' => [
                        'type' => 'textarea',
                        'label' => 'Code Content',
                        'default' => 'const greeting = "Hello, World!";\nconsole.log(greeting);'
                    ],
                    'language' => [
                        'type' => 'select',
                        'label' => 'Programming Language',
                        'options' => ['javascript', 'python', 'html', 'css', 'json', 'bash'],
                        'default' => 'javascript'
                    ],
                    'showLineNumbers' => [
                        'type' => 'boolean',
                        'label' => 'Show Line Numbers',
                        'default' => true
                    ],
                    'theme' => [
                        'type' => 'select',
                        'label' => 'Color Theme',
                        'options' => ['dark', 'light'],
                        'default' => 'dark'
                    ]
                ],
                'render_template' => 'heading-template', 'code_generators' => [], 'variants' => [
                    [
                        'name' => 'Terminal Command',
                        'description' => 'Command line code block',
                        'props' => ['code' => '$ npm install react\n$ npm start', 'language' => 'bash', 'theme' => 'dark'],
                        'preview_code' => '<pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto"><code>$ npm install react\n$ npm start</code></pre>'
                    ]
                ],
                'has_animation' => false,
                'sort_order' => 37
            ],
            
            [
                'name' => 'Inline Code',
                'type' => 'code-inline',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'C',
                'description' => 'Inline code snippet',
                'icon' => 'Code',
                'default_props' => [
                    'code' => 'console.log()',
                    'background' => '#f3f4f6',
                    'color' => '#dc2626'
                ],
                'prop_definitions' => [
                    'code' => [
                        'type' => 'string',
                        'label' => 'Code Text',
                        'default' => 'console.log()'
                    ],
                    'background' => [
                        'type' => 'color',
                        'label' => 'Background Color',
                        'default' => '#f3f4f6'
                    ],
                    'color' => [
                        'type' => 'color',
                        'label' => 'Text Color',
                        'default' => '#dc2626'
                    ]
                ],
                'render_template' => 'heading-template', 'code_generators' => [], 'variants' => [
                    [
                        'name' => 'Variable Name',
                        'description' => 'Highlighted variable or function name',
                        'props' => ['code' => 'userName', 'background' => '#fef3c7', 'color' => '#92400e'],
                        'preview_code' => '<code className="bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded text-sm font-mono">userName</code>'
                    ]
                ],
                'has_animation' => false,
                'sort_order' => 38
            ],
            
            [
                'name' => 'Text List',
                'type' => 'list',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'L',
                'description' => 'Ordered or unordered list',
                'icon' => 'List',
                'default_props' => [
                    'items' => ['First list item', 'Second list item', 'Third list item'],
                    'type' => 'unordered',
                    'style' => 'disc',
                    'spacing' => 'normal'
                ],
                'prop_definitions' => [
                    'items' => [
                        'type' => 'array',
                        'label' => 'List Items',
                        'default' => ['First list item', 'Second list item', 'Third list item']
                    ],
                    'type' => [
                        'type' => 'select',
                        'label' => 'List Type',
                        'options' => ['unordered', 'ordered'],
                        'default' => 'unordered'
                    ],
                    'style' => [
                        'type' => 'select',
                        'label' => 'List Style',
                        'options' => ['disc', 'circle', 'square', 'decimal', 'roman'],
                        'default' => 'disc'
                    ],
                    'spacing' => [
                        'type' => 'select',
                        'label' => 'Item Spacing',
                        'options' => ['tight', 'normal', 'loose'],
                        'default' => 'normal'
                    ]
                ],
                'render_template' => 'heading-template', 'code_generators' => [], 'variants' => [
                    [
                        'name' => 'Feature List',
                        'description' => 'Product or service features',
                        'props' => ['items' => ['24/7 Customer Support', 'Free Shipping Worldwide', '30-Day Money Back Guarantee', 'Premium Quality Materials'], 'type' => 'unordered', 'style' => 'disc'],
                        'preview_code' => '<ul className="space-y-2 text-gray-700"><li className="flex items-start"><span className="text-green-500 mr-2">•</span>24/7 Customer Support</li><li className="flex items-start"><span className="text-green-500 mr-2">•</span>Free Shipping Worldwide</li></ul>'
                    ],
                    [
                        'name' => 'Step by Step',
                        'description' => 'Numbered instructions or process',
                        'props' => ['items' => ['Create your account', 'Verify your email', 'Complete your profile', 'Start using the platform'], 'type' => 'ordered', 'style' => 'decimal'],
                        'preview_code' => '<ol className="space-y-2 text-gray-700 list-decimal list-inside"><li>Create your account</li><li>Verify your email</li><li>Complete your profile</li><li>Start using the platform</li></ol>'
                    ]
                ],
                'has_animation' => false,
                'sort_order' => 39
            ],
            
            [
                'name' => 'Highlight Text',
                'type' => 'highlight',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'H',
                'description' => 'Highlighted or marked text',
                'icon' => 'Highlighter',
                'default_props' => [
                    'text' => 'Important highlighted text',
                    'backgroundColor' => '#fef08a',
                    'textColor' => '#713f12',
                    'style' => 'background'
                ],
                'prop_definitions' => [
                    'text' => [
                        'type' => 'string',
                        'label' => 'Text to Highlight',
                        'default' => 'Important highlighted text'
                    ],
                    'backgroundColor' => [
                        'type' => 'color',
                        'label' => 'Background Color',
                        'default' => '#fef08a'
                    ],
                    'textColor' => [
                        'type' => 'color',
                        'label' => 'Text Color',
                        'default' => '#713f12'
                    ],
                    'style' => [
                        'type' => 'select',
                        'label' => 'Highlight Style',
                        'options' => ['background', 'underline', 'border', 'shadow'],
                        'default' => 'background'
                    ]
                ],
                'render_template' => 'heading-template', 'code_generators' => [], 'variants' => [
                    [
                        'name' => 'Warning Text',
                        'description' => 'Warning or important notice',
                        'props' => ['text' => 'Important: Please read carefully', 'backgroundColor' => '#fef2f2', 'textColor' => '#dc2626', 'style' => 'background'],
                        'preview_code' => '<span className="bg-red-50 text-red-600 px-2 py-1 rounded">Important: Please read carefully</span>'
                    ],
                    [
                        'name' => 'Success Text',
                        'description' => 'Success or positive highlight',
                        'props' => ['text' => 'Successfully completed!', 'backgroundColor' => '#f0fdf4', 'textColor' => '#166534', 'style' => 'background'],
                        'preview_code' => '<span className="bg-green-50 text-green-700 px-2 py-1 rounded">Successfully completed!</span>'
                    ]
                ],
                'has_animation' => false,
                'sort_order' => 40
            ]
        ];

        foreach ($textComponents as $component) {
            Component::create($component);
        }
    }
}