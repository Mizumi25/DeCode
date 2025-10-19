<?php
// database/seeders/MediaAndSpecialSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class MediaAndSpecialSeeder extends Seeder
{
    public function run(): void
    {
        $mediaComponents = [
            // ANIMATED GRADIENT BACKGROUND
            [
                'name' => 'Animated Gradient',
                'type' => 'animated-gradient',
                'component_type' => 'component',
                'category' => 'effects',
                'alphabet_group' => 'A',
                'description' => 'Animated gradient background',
                'icon' => 'Sparkles',
                'default_props' => [
                    'variant' => 'aurora',
                    'speed' => 'medium',
                ],
                'prop_definitions' => [
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['aurora', 'sunset', 'ocean', 'cosmic'], 'default' => 'aurora'],
                    'speed' => ['type' => 'select', 'label' => 'Animation Speed', 'options' => ['slow', 'medium', 'fast'], 'default' => 'medium'],
                ],
                'render_template' => 'gradient-template',
                'code_generators' => ['react-tailwind' => 'templates/effects/gradient.js'],
                'variants' => [
                    [
                        'name' => 'Aurora Borealis',
                        'description' => 'Northern lights effect',
                        'props' => ['variant' => 'aurora', 'speed' => 'medium'],
                        'preview_code' => '<div class="absolute inset-0 overflow-hidden"><div class="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 opacity-70 animate-gradient"></div><div class="absolute inset-0 bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 opacity-60 animate-gradient-reverse"></div></div>'
                    ],
                    [
                        'name' => 'Cosmic Wave',
                        'description' => 'Flowing cosmic gradient',
                        'props' => ['variant' => 'cosmic', 'speed' => 'slow'],
                        'preview_code' => '<div class="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 animate-pulse-slow"></div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 1
            ],

            // PARTICLE SYSTEM
            [
                'name' => 'Particle Effect',
                'type' => 'particles',
                'component_type' => 'component',
                'category' => 'effects',
                'alphabet_group' => 'P',
                'description' => 'Animated particle system',
                'icon' => 'Sparkles',
                'default_props' => [
                    'count' => 50,
                    'color' => '#ffffff',
                    'speed' => 'medium',
                ],
                'prop_definitions' => [
                    'count' => ['type' => 'number', 'label' => 'Particle Count', 'default' => 50, 'min' => 10, 'max' => 200],
                    'color' => ['type' => 'color', 'label' => 'Particle Color', 'default' => '#ffffff'],
                    'speed' => ['type' => 'select', 'label' => 'Speed', 'options' => ['slow', 'medium', 'fast'], 'default' => 'medium'],
                ],
                'render_template' => 'particles-template',
                'code_generators' => ['react-tailwind' => 'templates/effects/particles.js'],
                'variants' => [
                    [
                        'name' => 'Floating Particles',
                        'description' => 'Gentle floating particles',
                        'props' => ['count' => 50, 'speed' => 'slow'],
                        'preview_code' => '<div class="absolute inset-0 overflow-hidden"><div class="absolute w-2 h-2 bg-white/30 rounded-full animate-float" style="left: 10%; top: 20%;"></div><div class="absolute w-1 h-1 bg-white/40 rounded-full animate-float-delayed" style="left: 30%; top: 50%;"></div><div class="absolute w-3 h-3 bg-white/20 rounded-full animate-float" style="left: 60%; top: 30%;"></div></div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 2
            ],

            // PRICING TABLE
            [
                'name' => 'Pricing Card',
                'type' => 'pricing',
                'component_type' => 'component',
                'category' => 'marketing',
                'alphabet_group' => 'P',
                'description' => 'Pricing card with features',
                'icon' => 'DollarSign',
                'default_props' => [
                    'title' => '',
                    'price' => '',
                    'period' => 'month',
                    'featured' => false,
                ],
                'prop_definitions' => [
                    'title' => ['type' => 'string', 'label' => 'Plan Name', 'default' => ''],
                    'price' => ['type' => 'string', 'label' => 'Price', 'default' => ''],
                    'period' => ['type' => 'select', 'label' => 'Billing Period', 'options' => ['month', 'year'], 'default' => 'month'],
                    'featured' => ['type' => 'boolean', 'label' => 'Featured Plan', 'default' => false],
                ],
                'render_template' => 'pricing-template',
                'code_generators' => ['react-tailwind' => 'templates/marketing/pricing.js'],
                'variants' => [
                    [
                        'name' => 'Premium Pricing',
                        'description' => 'Featured pricing card',
                        'props' => ['title' => 'Pro', 'price' => '$29', 'period' => 'month', 'featured' => true],
                        'preview_code' => '<div class="relative p-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl text-white shadow-2xl transform hover:scale-105 transition-transform"><div class="absolute top-0 right-0 px-4 py-1 bg-yellow-400 text-black text-xs font-bold rounded-bl-xl rounded-tr-xl">POPULAR</div><h3 class="text-2xl font-bold mb-4">Pro</h3><div class="flex items-baseline mb-6"><span class="text-5xl font-black">$29</span><span class="text-xl ml-2">/month</span></div><ul class="space-y-3 mb-8"><li class="flex items-center"><svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>Unlimited projects</li><li class="flex items-center"><svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>Priority support</li></ul><button class="w-full py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-100 transition">Get Started</button></div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 3
            ],

            // TESTIMONIAL
            [
                'name' => 'Testimonial',
                'type' => 'testimonial',
                'component_type' => 'component',
                'category' => 'marketing',
                'alphabet_group' => 'T',
                'description' => 'Customer testimonial card',
                'icon' => 'MessageSquare',
                'default_props' => [
                    'quote' => '',
                    'author' => '',
                    'role' => '',
                    'variant' => 'default',
                ],
                'prop_definitions' => [
                    'quote' => ['type' => 'textarea', 'label' => 'Quote', 'default' => ''],
                    'author' => ['type' => 'string', 'label' => 'Author Name', 'default' => ''],
                    'role' => ['type' => 'string', 'label' => 'Role/Company', 'default' => ''],
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['default', 'minimal', 'featured'], 'default' => 'default'],
                ],
                'render_template' => 'testimonial-template',
                'code_generators' => ['react-tailwind' => 'templates/marketing/testimonial.js'],
                'variants' => [
                    [
                        'name' => 'Featured Testimonial',
                        'description' => 'Large featured testimonial',
                        'props' => ['quote' => 'This product changed everything for us!', 'author' => 'John Doe', 'role' => 'CEO, TechCorp'],
                        'preview_code' => '<div class="p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100"><svg class="w-12 h-12 text-purple-600 mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"></path></svg><p class="text-xl text-gray-700 mb-6 italic">This product changed everything for us!</p><div class="flex items-center gap-4"><div class="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">JD</div><div><div class="font-bold text-gray-900">John Doe</div><div class="text-sm text-gray-600">CEO, TechCorp</div></div></div></div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 4
            ],

            // COUNTDOWN TIMER
            [
                'name' => 'Countdown Timer',
                'type' => 'countdown',
                'component_type' => 'component',
                'category' => 'interactive',
                'alphabet_group' => 'C',
                'description' => 'Countdown timer display',
                'icon' => 'Clock',
                'default_props' => [
                    'targetDate' => '',
                    'variant' => 'default',
                    'showLabels' => true,
                ],
                'prop_definitions' => [
                    'targetDate' => ['type' => 'string', 'label' => 'Target Date (YYYY-MM-DD)', 'default' => ''],
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['default', 'minimal', 'bold'], 'default' => 'default'],
                    'showLabels' => ['type' => 'boolean', 'label' => 'Show Labels', 'default' => true],
                ],
                'render_template' => 'countdown-template',
                'code_generators' => ['react-tailwind' => 'templates/interactive/countdown.js'],
                'variants' => [
                    [
                        'name' => 'Neon Countdown',
                        'description' => 'Futuristic neon style',
                        'props' => ['variant' => 'bold'],
                        'preview_code' => '<div class="flex items-center gap-6 p-8 bg-black rounded-2xl"><div class="text-center"><div class="text-5xl font-black text-cyan-400 font-mono">23</div><div class="text-sm text-cyan-400/60 mt-2">DAYS</div></div><div class="text-4xl text-cyan-400">:</div><div class="text-center"><div class="text-5xl font-black text-cyan-400 font-mono">14</div><div class="text-sm text-cyan-400/60 mt-2">HOURS</div></div><div class="text-4xl text-cyan-400">:</div><div class="text-center"><div class="text-5xl font-black text-cyan-400 font-mono">32</div><div class="text-sm text-cyan-400/60 mt-2">MINS</div></div><div class="text-4xl text-cyan-400">:</div><div class="text-center"><div class="text-5xl font-black text-cyan-400 font-mono">18</div><div class="text-sm text-cyan-400/60 mt-2">SECS</div></div></div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'gsap',
                'sort_order' => 5
            ],

            // STATS COUNTER
            [
                'name' => 'Stats Counter',
                'type' => 'stats-counter',
                'component_type' => 'component',
                'category' => 'display',
                'alphabet_group' => 'S',
                'description' => 'Animated statistics counter',
                'icon' => 'TrendingUp',
                'default_props' => [
                    'value' => '0',
                    'label' => '',
                    'suffix' => '',
                    'animated' => true,
                ],
                'prop_definitions' => [
                    'value' => ['type' => 'string', 'label' => 'Value', 'default' => '0'],
                    'label' => ['type' => 'string', 'label' => 'Label', 'default' => ''],
                    'suffix' => ['type' => 'string', 'label' => 'Suffix', 'default' => ''],
                    'animated' => ['type' => 'boolean', 'label' => 'Animated Count', 'default' => true],
                ],
                'render_template' => 'stats-template',
                'code_generators' => ['react-tailwind' => 'templates/display/stats.js'],
                'variants' => [
                    [
                        'name' => 'Gradient Stats',
                        'description' => 'Stats with gradient numbers',
                        'props' => ['value' => '10,000', 'label' => 'Happy Customers', 'suffix' => '+'],
                        'preview_code' => '<div class="text-center p-8"><div class="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">10,000+</div><div class="text-xl text-gray-600 font-semibold">Happy Customers</div></div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'gsap',
                'sort_order' => 6
            ],

            // BREADCRUMB
            [
                'name' => 'Breadcrumb',
                'type' => 'breadcrumb',
                'component_type' => 'component',
                'category' => 'navigation',
                'alphabet_group' => 'B',
                'description' => 'Navigation breadcrumb trail',
                'icon' => 'ChevronRight',
                'default_props' => [
                    'separator' => 'slash',
                ],
                'prop_definitions' => [
                    'separator' => ['type' => 'select', 'label' => 'Separator', 'options' => ['slash', 'chevron', 'dot'], 'default' => 'slash'],
                ],
                'render_template' => 'breadcrumb-template',
                'code_generators' => ['react-tailwind' => 'templates/navigation/breadcrumb.js'],
                'variants' => [
                    [
                        'name' => 'Modern Breadcrumb',
                        'description' => 'Clean modern breadcrumb',
                        'props' => ['separator' => 'chevron'],
                        'preview_code' => '<nav class="flex items-center gap-2 text-sm"><a href="#" class="text-gray-600 hover:text-gray-900 transition">Home</a><svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg><a href="#" class="text-gray-600 hover:text-gray-900 transition">Products</a><svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg><span class="text-gray-900 font-semibold">Category</span></nav>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 7
            ],

            // DIVIDER
            [
                'name' => 'Divider',
                'type' => 'divider',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'D',
                'description' => 'Content divider line',
                'icon' => 'Minus',
                'default_props' => [
                    'variant' => 'solid',
                    'orientation' => 'horizontal',
                    'text' => '',
                ],
                'prop_definitions' => [
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['solid', 'dashed', 'gradient'], 'default' => 'solid'],
                    'orientation' => ['type' => 'select', 'label' => 'Orientation', 'options' => ['horizontal', 'vertical'], 'default' => 'horizontal'],
                    'text' => ['type' => 'string', 'label' => 'Center Text', 'default' => ''],
                ],
                'render_template' => 'divider-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/divider.js'],
                'variants' => [
                    [
                        'name' => 'Gradient Divider',
                        'description' => 'Divider with gradient',
                        'props' => ['variant' => 'gradient'],
                        'preview_code' => '<div class="relative my-8"><div class="absolute inset-0 flex items-center"><div class="w-full h-px bg-gradient-to-r from-transparent via-purple-600 to-transparent"></div></div></div>'
                    ],
                    [
                        'name' => 'Text Divider',
                        'description' => 'Divider with centered text',
                        'props' => ['text' => 'or continue with'],
                        'preview_code' => '<div class="relative my-8"><div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-300"></div></div><div class="relative flex justify-center"><span class="px-4 bg-white text-sm text-gray-600">or continue with</span></div></div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 8
            ],
        ];

        foreach ($mediaComponents as $component) {
            Component::create($component);
        }
    }
}