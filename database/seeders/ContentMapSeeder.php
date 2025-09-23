<?php
// database/seeders/ContentMapSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class ContentMapSeeder extends Seeder
{
    public function run(): void
    {
        $contentComponents = [
            [
                'name' => 'Rich Text Editor',
                'type' => 'rich-text-editor',
                'component_type' => 'component',
                'category' => 'content',
                'alphabet_group' => 'R',
                'description' => 'WYSIWYG rich text editor with formatting',
                'icon' => 'Type',
                'default_props' => [
                    'content' => '<p>Start typing your content here...</p>',
                    'toolbar' => ['bold', 'italic', 'underline', 'link', 'bulletList', 'orderedList'],
                    'placeholder' => 'Write something amazing...',
                    'editable' => true
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'richtext', 'label' => 'Content'],
                    'editable' => ['type' => 'boolean', 'label' => 'Editable', 'default' => true],
                    'placeholder' => ['type' => 'string', 'label' => 'Placeholder']
                ],
                'render_template' => 'rich-text-editor-template',
                'code_generators' => ['tiptap' => 'templates/content/rich-text-editor.js'],
                'variants' => [
                    [
                        'name' => 'Minimal Editor',
                        'description' => 'Clean minimal text editor',
                        'props' => ['toolbar' => ['bold', 'italic'], 'variant' => 'minimal'],
                        'preview_code' => '<div class="border border-gray-300 rounded-lg p-4 min-h-[120px] bg-white"><div class="border-b border-gray-200 pb-2 mb-3"><div class="flex gap-2"><button class="p-1 text-gray-600 hover:bg-gray-100 rounded"><strong>B</strong></button><button class="p-1 text-gray-600 hover:bg-gray-100 rounded"><em>I</em></button></div></div><div class="text-gray-800">Start typing your content here...</div></div>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 1
            ],
            [
                'name' => 'Code Block',
                'type' => 'code-block',
                'component_type' => 'component',
                'category' => 'content',
                'alphabet_group' => 'C',
                'description' => 'Syntax highlighted code block',
                'icon' => 'Code',
                'default_props' => [
                    'code' => 'function hello() {\n  console.log("Hello, World!");\n}',
                    'language' => 'javascript',
                    'theme' => 'dark',
                    'showLineNumbers' => true,
                    'showCopyButton' => true
                ],
                'prop_definitions' => [
                    'code' => ['type' => 'textarea', 'label' => 'Code'],
                    'language' => ['type' => 'select', 'label' => 'Language', 'options' => ['javascript', 'typescript', 'python', 'java', 'php', 'html', 'css'], 'default' => 'javascript'],
                    'theme' => ['type' => 'select', 'label' => 'Theme', 'options' => ['dark', 'light'], 'default' => 'dark'],
                    'showLineNumbers' => ['type' => 'boolean', 'label' => 'Show Line Numbers', 'default' => true]
                ],
                'render_template' => 'code-block-template',
                'code_generators' => ['prism' => 'templates/content/code-block.js'],
                'variants' => [
                    [
                        'name' => 'Terminal',
                        'description' => 'Terminal-style code block',
                        'props' => ['theme' => 'terminal', 'showPrompt' => true],
                        'preview_code' => '<div class="bg-black rounded-lg p-4 font-mono text-sm"><div class="flex items-center mb-3"><div class="flex gap-2"><div class="w-3 h-3 bg-red-500 rounded-full"></div><div class="w-3 h-3 bg-yellow-500 rounded-full"></div><div class="w-3 h-3 bg-green-500 rounded-full"></div></div><div class="flex-1 text-center text-gray-400 text-xs">Terminal</div></div><div class="text-green-400"><span class="text-gray-500">user@computer:~$</span> npm install awesome-package</div><div class="text-white mt-2">✓ Package installed successfully</div></div>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 2
            ],
            [
                'name' => 'FAQ Section',
                'type' => 'faq-section',
                'component_type' => 'component',
                'category' => 'content',
                'alphabet_group' => 'F',
                'description' => 'Expandable FAQ section with search',
                'icon' => 'HelpCircle',
                'default_props' => [
                    'faqs' => [
                        ['question' => 'What is your return policy?', 'answer' => 'We offer a 30-day money-back guarantee on all products.'],
                        ['question' => 'How long does shipping take?', 'answer' => 'Standard shipping takes 3-5 business days.'],
                        ['question' => 'Do you offer customer support?', 'answer' => 'Yes, we provide 24/7 customer support via email and chat.']
                    ],
                    'showSearch' => true,
                    'allowMultipleOpen' => false
                ],
                'prop_definitions' => [
                    'showSearch' => ['type' => 'boolean', 'label' => 'Show Search', 'default' => true],
                    'allowMultipleOpen' => ['type' => 'boolean', 'label' => 'Allow Multiple Open', 'default' => false]
                ],
                'render_template' => 'faq-section-template',
                'code_generators' => ['react-tailwind' => 'templates/content/faq-section.js'],
                'variants' => [],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 3
            ],
            [
                'name' => 'Table of Contents',
                'type' => 'table-of-contents',
                'component_type' => 'component',
                'category' => 'content',
                'alphabet_group' => 'T',
                'description' => 'Auto-generated table of contents with smooth scroll',
                'icon' => 'List',
                'default_props' => [
                    'headings' => [
                        ['id' => 'introduction', 'text' => 'Introduction', 'level' => 1],
                        ['id' => 'getting-started', 'text' => 'Getting Started', 'level' => 1],
                        ['id' => 'installation', 'text' => 'Installation', 'level' => 2],
                        ['id' => 'configuration', 'text' => 'Configuration', 'level' => 2]
                    ],
                    'position' => 'sticky',
                    'showProgress' => true
                ],
                'prop_definitions' => [
                    'position' => ['type' => 'select', 'label' => 'Position', 'options' => ['static', 'sticky', 'fixed'], 'default' => 'sticky'],
                    'showProgress' => ['type' => 'boolean', 'label' => 'Show Progress', 'default' => true]
                ],
                'render_template' => 'table-of-contents-template',
                'code_generators' => ['react-tailwind' => 'templates/content/table-of-contents.js'],
                'variants' => [],
                'has_animation' => true,
                'animation_type' => 'scroll',
                'sort_order' => 4
            ],
            [
                'name' => 'Interactive Map',
                'type' => 'interactive-map',
                'component_type' => 'component',
                'category' => 'maps',
                'alphabet_group' => 'I',
                'description' => 'Interactive map with markers and controls',
                'icon' => 'Map',
                'default_props' => [
                    'center' => [40.7128, -74.0060],
                    'zoom' => 10,
                    'markers' => [
                        ['lat' => 40.7128, 'lng' => -74.0060, 'title' => 'New York City']
                    ],
                    'showControls' => true,
                    'style' => 'streets'
                ],
                'prop_definitions' => [
                    'center' => ['type' => 'array', 'label' => 'Map Center [lat, lng]'],
                    'zoom' => ['type' => 'number', 'label' => 'Zoom Level', 'default' => 10],
                    'style' => ['type' => 'select', 'label' => 'Map Style', 'options' => ['streets', 'satellite', 'terrain'], 'default' => 'streets']
                ],
                'render_template' => 'interactive-map-template',
                'code_generators' => ['leaflet' => 'templates/maps/interactive-map.js'],
                'variants' => [
                    [
                        'name' => 'Store Locator',
                        'description' => 'Map for finding store locations',
                        'props' => ['variant' => 'store-locator', 'showSearch' => true],
                        'preview_code' => '<div class="bg-gray-100 rounded-lg p-6 h-64 relative overflow-hidden"><div class="absolute inset-0 bg-gradient-to-br from-green-200 to-blue-200 opacity-50"></div><div class="relative z-10 h-full flex items-center justify-center"><div class="text-center"><div class="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2 animate-bounce"></div><p class="text-sm font-medium text-gray-700">Interactive Map</p><p class="text-xs text-gray-500">Store locations will appear here</p></div></div><div class="absolute top-4 left-4 bg-white rounded-lg shadow p-2 z-20"><input class="text-sm border-none outline-none" placeholder="Search locations..." /></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'javascript',
                'sort_order' => 5
            ],
            [
                'name' => 'Contact Form',
                'type' => 'contact-form',
                'component_type' => 'component',
                'category' => 'content',
                'alphabet_group' => 'C',
                'description' => 'Complete contact form with validation',
                'icon' => 'Mail',
                'default_props' => [
                    'fields' => ['name', 'email', 'subject', 'message'],
                    'showCaptcha' => false,
                    'submitText' => 'Send Message',
                    'successMessage' => 'Thank you! Your message has been sent.'
                ],
                'prop_definitions' => [
                    'showCaptcha' => ['type' => 'boolean', 'label' => 'Show Captcha', 'default' => false],
                    'submitText' => ['type' => 'string', 'label' => 'Submit Button Text', 'default' => 'Send Message']
                ],
                'render_template' => 'contact-form-template',
                'code_generators' => ['react-hook-form' => 'templates/content/contact-form.js'],
                'variants' => [
                    [
                        'name' => 'Newsletter Signup',
                        'description' => 'Simple newsletter subscription form',
                        'props' => ['variant' => 'newsletter', 'fields' => ['email']],
                        'preview_code' => '<div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white"><h3 class="text-xl font-bold mb-2">Stay Updated</h3><p class="mb-4 opacity-90">Get the latest news and updates delivered to your inbox.</p><form class="flex gap-3"><input class="flex-1 px-4 py-2 rounded-lg text-gray-900" placeholder="Your email address" type="email" /><button class="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Subscribe</button></form></div>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 6
            ],
            [
                'name' => 'Social Proof',
                'type' => 'social-proof',
                'component_type' => 'component',
                'category' => 'content',
                'alphabet_group' => 'S',
                'description' => 'Social proof widgets with logos and stats',
                'icon' => 'Users',
                'default_props' => [
                    'type' => 'logos',
                    'title' => 'Trusted by leading companies',
                    'logos' => [
                        'https://via.placeholder.com/120x40/3b82f6/ffffff?text=Company+1',
                        'https://via.placeholder.com/120x40/10b981/ffffff?text=Company+2',
                        'https://via.placeholder.com/120x40/f59e0b/ffffff?text=Company+3'
                    ],
                    'stats' => [
                        ['value' => '10,000+', 'label' => 'Happy Customers'],
                        ['value' => '99.9%', 'label' => 'Uptime'],
                        ['value' => '24/7', 'label' => 'Support']
                    ]
                ],
                'prop_definitions' => [
                    'type' => ['type' => 'select', 'label' => 'Type', 'options' => ['logos', 'stats', 'testimonials'], 'default' => 'logos'],
                    'title' => ['type' => 'string', 'label' => 'Section Title']
                ],
                'render_template' => 'social-proof-template',
                'code_generators' => ['react-tailwind' => 'templates/content/social-proof.js'],
                'variants' => [
                    [
                        'name' => 'Live Activity',
                        'description' => 'Real-time user activity notifications',
                        'props' => ['type' => 'activity', 'showRealTime' => true],
                        'preview_code' => '<div class="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg border p-4 max-w-sm"><div class="flex items-center gap-3"><div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">J</div><div class="flex-1"><p class="text-sm font-medium">John from New York</p><p class="text-xs text-gray-600">just purchased Pro Plan</p></div><div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 7
            ]
        ];

        foreach ($contentComponents as $component) {
            Component::create($component);
        }
    }
}