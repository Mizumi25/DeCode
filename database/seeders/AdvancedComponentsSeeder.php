<?php
// database/seeders/AdvancedComponentsSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class AdvancedComponentsSeeder extends Seeder
{
    public function run(): void
    {
        $advancedComponents = [
            // CARD COMPONENT
            [
                'name' => 'Card',
                'type' => 'card',
                'component_type' => 'component',
                'category' => 'layout',
                'alphabet_group' => 'C',
                'description' => 'Flexible card container with multiple variants',
                'icon' => 'Square',
                'default_props' => [
                    'title' => '',
                    'description' => '',
                    'variant' => 'default',
                    'padding' => 'md',
                ],
                'prop_definitions' => [
                    'title' => ['type' => 'string', 'label' => 'Title', 'default' => ''],
                    'description' => ['type' => 'textarea', 'label' => 'Description', 'default' => ''],
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['default', 'elevated', 'outlined', 'glass', 'gradient'], 'default' => 'default'],
                    'padding' => ['type' => 'select', 'label' => 'Padding', 'options' => ['sm', 'md', 'lg', 'xl'], 'default' => 'md'],
                ],
                'render_template' => 'card-template',
                'code_generators' => ['react-tailwind' => 'templates/components/card.js'],
                'variants' => [
                    [
                        'name' => 'Glass Card',
                        'description' => 'Glassmorphism card',
                        'props' => ['title' => 'Glass Card', 'description' => 'Beautiful glassmorphism effect', 'variant' => 'glass'],
                        'preview_code' => '<div class="p-6 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl"><h3 class="text-xl font-bold text-white mb-2">Glass Card</h3><p class="text-white/80">Beautiful glassmorphism effect</p></div>'
                    ],
                    [
                        'name' => 'Gradient Border',
                        'description' => 'Card with gradient border',
                        'props' => ['title' => 'Premium Feature', 'variant' => 'gradient'],
                        'preview_code' => '<div class="relative p-8 rounded-2xl bg-white overflow-hidden"><div class="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-20"></div><div class="relative"><h3 class="text-2xl font-bold mb-2">Premium Feature</h3><p class="text-gray-600">Unlock exclusive content</p></div></div>'
                    ],
                    [
                        'name' => 'Elevated Shadow',
                        'description' => 'Card with deep shadow',
                        'props' => ['title' => 'Elevated', 'variant' => 'elevated'],
                        'preview_code' => '<div class="p-8 rounded-2xl bg-white shadow-[0_20px_70px_rgba(0,0,0,0.15)] hover:shadow-[0_30px_90px_rgba(0,0,0,0.2)] transition-shadow duration-300"><h3 class="text-2xl font-bold mb-2">Elevated</h3><p class="text-gray-600">Hover for more depth</p></div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 1
            ],

            // HERO SECTION
            [
                'name' => 'Hero Section',
                'type' => 'hero',
                'component_type' => 'component',
                'category' => 'sections',
                'alphabet_group' => 'H',
                'description' => 'Hero section with multiple layouts',
                'icon' => 'Layout',
                'default_props' => [
                    'title' => '',
                    'subtitle' => '',
                    'ctaText' => '',
                    'variant' => 'centered',
                ],
                'prop_definitions' => [
                    'title' => ['type' => 'string', 'label' => 'Main Title', 'default' => ''],
                    'subtitle' => ['type' => 'textarea', 'label' => 'Subtitle', 'default' => ''],
                    'ctaText' => ['type' => 'string', 'label' => 'CTA Button Text', 'default' => ''],
                    'variant' => ['type' => 'select', 'label' => 'Layout', 'options' => ['centered', 'split', 'gradient'], 'default' => 'centered'],
                ],
                'render_template' => 'hero-template',
                'code_generators' => ['react-tailwind' => 'templates/sections/hero.js'],
                'variants' => [
                    [
                        'name' => 'Gradient Hero',
                        'description' => 'Full-screen gradient hero',
                        'props' => ['title' => 'Build Amazing Products', 'subtitle' => 'The fastest way to ship', 'ctaText' => 'Get Started'],
                        'preview_code' => '<section class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 text-white"><div class="text-center px-4"><h1 class="text-6xl font-black mb-6">Build Amazing Products</h1><p class="text-2xl mb-8 text-white/90">The fastest way to ship</p><button class="px-12 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:scale-105 transition-transform">Get Started</button></div></section>'
                    ],
                    [
                        'name' => 'Split Hero',
                        'description' => 'Content and visual split',
                        'props' => ['variant' => 'split'],
                        'preview_code' => '<section class="min-h-screen grid md:grid-cols-2 items-center"><div class="p-12"><h1 class="text-5xl font-black mb-6">Next Generation Platform</h1><p class="text-xl text-gray-600 mb-8">Build faster, ship smarter</p><button class="px-8 py-4 bg-black text-white rounded-xl">Learn More</button></div><div class="bg-gradient-to-br from-purple-100 to-blue-100 min-h-[400px]"></div></section>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'framer-motion',
                'sort_order' => 2
            ],

            // SEARCHBAR
            [
                'name' => 'Search Bar',
                'type' => 'searchbar',
                'component_type' => 'component',
                'category' => 'form',
                'alphabet_group' => 'S',
                'description' => 'Search input with icon',
                'icon' => 'Search',
                'default_props' => [
                    'placeholder' => '',
                    'variant' => 'default',
                    'size' => 'md',
                ],
                'prop_definitions' => [
                    'placeholder' => ['type' => 'string', 'label' => 'Placeholder', 'default' => ''],
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['default', 'pill', 'minimal'], 'default' => 'default'],
                    'size' => ['type' => 'select', 'label' => 'Size', 'options' => ['sm', 'md', 'lg'], 'default' => 'md'],
                ],
                'render_template' => 'searchbar-template',
                'code_generators' => ['react-tailwind' => 'templates/components/searchbar.js'],
                'variants' => [
                    [
                        'name' => 'Pill Search',
                        'description' => 'Rounded pill searchbar',
                        'props' => ['placeholder' => 'Search...', 'variant' => 'pill'],
                        'preview_code' => '<div class="flex items-center w-full max-w-md px-6 py-3 bg-gray-100 rounded-full"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg><input class="flex-1 ml-3 bg-transparent outline-none" placeholder="Search..." /></div>'
                    ],
                    [
                        'name' => 'Minimal Search',
                        'description' => 'Clean minimal design',
                        'props' => ['placeholder' => 'Type to search...', 'variant' => 'minimal'],
                        'preview_code' => '<div class="flex items-center w-full max-w-2xl border-b-2 border-gray-300 pb-2"><input class="flex-1 text-2xl outline-none" placeholder="Type to search..." /><svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 3
            ],

            // AVATAR
            [
                'name' => 'Avatar',
                'type' => 'avatar',
                'component_type' => 'component',
                'category' => 'media',
                'alphabet_group' => 'A',
                'description' => 'User avatar with variants',
                'icon' => 'User',
                'default_props' => [
                    'name' => '',
                    'src' => '',
                    'size' => 'md',
                    'variant' => 'circle',
                ],
                'prop_definitions' => [
                    'name' => ['type' => 'string', 'label' => 'Name (for initials)', 'default' => ''],
                    'src' => ['type' => 'string', 'label' => 'Image URL', 'default' => ''],
                    'size' => ['type' => 'select', 'label' => 'Size', 'options' => ['xs', 'sm', 'md', 'lg', 'xl', '2xl'], 'default' => 'md'],
                    'variant' => ['type' => 'select', 'label' => 'Shape', 'options' => ['circle', 'rounded', 'square'], 'default' => 'circle'],
                ],
                'render_template' => 'avatar-template',
                'code_generators' => ['react-tailwind' => 'templates/components/avatar.js'],
                'variants' => [
                    [
                        'name' => 'Gradient Ring',
                        'description' => 'Avatar with gradient border',
                        'props' => ['name' => 'JD', 'size' => 'lg'],
                        'preview_code' => '<div class="relative w-16 h-16"><div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-spin-slow"></div><div class="relative w-full h-full flex items-center justify-center bg-white rounded-full m-0.5"><span class="text-xl font-bold text-gray-700">JD</span></div></div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 4
            ],

            // CAROUSEL
            [
                'name' => 'Carousel',
                'type' => 'carousel',
                'component_type' => 'component',
                'category' => 'interactive',
                'alphabet_group' => 'C',
                'description' => 'Image carousel with navigation',
                'icon' => 'Images',
                'default_props' => [
                    'autoplay' => true,
                    'interval' => 3000,
                    'showDots' => true,
                    'showArrows' => true,
                ],
                'prop_definitions' => [
                    'autoplay' => ['type' => 'boolean', 'label' => 'Autoplay', 'default' => true],
                    'interval' => ['type' => 'number', 'label' => 'Interval (ms)', 'default' => 3000, 'min' => 1000, 'max' => 10000],
                    'showDots' => ['type' => 'boolean', 'label' => 'Show Dots', 'default' => true],
                    'showArrows' => ['type' => 'boolean', 'label' => 'Show Arrows', 'default' => true],
                ],
                'render_template' => 'carousel-template',
                'code_generators' => ['react-tailwind' => 'templates/components/carousel.js'],
                'variants' => [
                    [
                        'name' => 'Card Carousel',
                        'description' => 'Carousel with card items',
                        'props' => ['showDots' => true, 'showArrows' => true],
                        'preview_code' => '<div class="relative max-w-4xl mx-auto"><div class="overflow-hidden rounded-2xl"><div class="flex transition-transform duration-500"><div class="min-w-full p-8 bg-gradient-to-br from-purple-500 to-pink-500 text-white"><h3 class="text-3xl font-bold mb-4">Slide 1</h3><p>Beautiful carousel content</p></div></div></div><div class="absolute inset-y-0 left-4 flex items-center"><button class="p-3 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition">←</button></div><div class="absolute inset-y-0 right-4 flex items-center"><button class="p-3 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition">→</button></div><div class="flex justify-center gap-2 mt-4"><div class="w-2 h-2 rounded-full bg-white"></div><div class="w-2 h-2 rounded-full bg-white/40"></div><div class="w-2 h-2 rounded-full bg-white/40"></div></div></div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'framer-motion',
                'sort_order' => 5
            ],

            // BADGE
            [
                'name' => 'Badge',
                'type' => 'badge',
                'component_type' => 'component',
                'category' => 'display',
                'alphabet_group' => 'B',
                'description' => 'Small status indicator or label',
                'icon' => 'Tag',
                'default_props' => [
                    'text' => '',
                    'variant' => 'default',
                    'size' => 'md',
                ],
                'prop_definitions' => [
                    'text' => ['type' => 'string', 'label' => 'Badge Text', 'default' => ''],
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['default', 'primary', 'success', 'warning', 'danger', 'gradient'], 'default' => 'default'],
                    'size' => ['type' => 'select', 'label' => 'Size', 'options' => ['sm', 'md', 'lg'], 'default' => 'md'],
                ],
                'render_template' => 'badge-template',
                'code_generators' => ['react-tailwind' => 'templates/components/badge.js'],
                'variants' => [
                    [
                        'name' => 'Gradient Badge',
                        'description' => 'Badge with gradient',
                        'props' => ['text' => 'New', 'variant' => 'gradient'],
                        'preview_code' => '<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">New</span>'
                    ],
                    [
                        'name' => 'Outlined Badge',
                        'description' => 'Badge with border only',
                        'props' => ['text' => 'Beta', 'variant' => 'primary'],
                        'preview_code' => '<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border-2 border-blue-600 text-blue-600">Beta</span>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 6
            ],

            // NAVBAR
            [
                'name' => 'Navbar',
                'type' => 'navbar',
                'component_type' => 'component',
                'category' => 'navigation',
                'alphabet_group' => 'N',
                'description' => 'Navigation bar with various styles',
                'icon' => 'Menu',
                'default_props' => [
                    'brandName' => '',
                    'variant' => 'solid',
                    'position' => 'sticky',
                ],
                'prop_definitions' => [
                    'brandName' => ['type' => 'string', 'label' => 'Brand Name', 'default' => ''],
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['solid', 'transparent', 'glass'], 'default' => 'solid'],
                    'position' => ['type' => 'select', 'label' => 'Position', 'options' => ['sticky', 'fixed', 'static'], 'default' => 'sticky'],
                ],
                'render_template' => 'navbar-template',
                'code_generators' => ['react-tailwind' => 'templates/components/navbar.js'],
                'variants' => [
                    [
                        'name' => 'Glass Navbar',
                        'description' => 'Glassmorphism navigation',
                        'props' => ['brandName' => 'DeCode', 'variant' => 'glass'],
                        'preview_code' => '<nav class="sticky top-0 z-50 backdrop-blur-2xl bg-white/10 border-b border-white/20"><div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between"><div class="text-2xl font-bold text-white">DeCode</div><div class="flex items-center gap-8"><a class="text-white/80 hover:text-white transition">Features</a><a class="text-white/80 hover:text-white transition">Pricing</a><a class="text-white/80 hover:text-white transition">About</a><button class="px-6 py-2 bg-white text-black rounded-full font-semibold hover:scale-105 transition">Sign In</button></div></div></nav>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 7
            ],

            // ACCORDION
            [
                'name' => 'Accordion',
                'type' => 'accordion',
                'component_type' => 'component',
                'category' => 'interactive',
                'alphabet_group' => 'A',
                'description' => 'Expandable content sections',
                'icon' => 'ChevronDown',
                'default_props' => [
                    'title' => '',
                    'content' => '',
                    'variant' => 'default',
                ],
                'prop_definitions' => [
                    'title' => ['type' => 'string', 'label' => 'Title', 'default' => ''],
                    'content' => ['type' => 'textarea', 'label' => 'Content', 'default' => ''],
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['default', 'bordered', 'minimal'], 'default' => 'default'],
                ],
                'render_template' => 'accordion-template',
                'code_generators' => ['react-tailwind' => 'templates/components/accordion.js'],
                'variants' => [
                    [
                        'name' => 'FAQ Accordion',
                        'description' => 'Styled for FAQs',
                        'props' => ['title' => 'What is DeCode?', 'content' => 'DeCode is a visual website builder'],
                        'preview_code' => '<div class="border-b border-gray-200"><button class="w-full py-4 px-6 flex items-center justify-between text-left hover:bg-gray-50 transition"><span class="font-semibold text-lg">What is DeCode?</span><svg class="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button><div class="px-6 pb-4 text-gray-600">DeCode is a visual website builder</div></div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'framer-motion',
                'sort_order' => 8
            ],

            // MODAL
            [
                'name' => 'Modal',
                'type' => 'modal',
                'component_type' => 'component',
                'category' => 'overlay',
                'alphabet_group' => 'M',
                'description' => 'Dialog modal overlay',
                'icon' => 'Square',
                'default_props' => [
                    'title' => '',
                    'size' => 'md',
                    'variant' => 'default',
                ],
                'prop_definitions' => [
                    'title' => ['type' => 'string', 'label' => 'Modal Title', 'default' => ''],
                    'size' => ['type' => 'select', 'label' => 'Size', 'options' => ['sm', 'md', 'lg', 'xl', 'full'], 'default' => 'md'],
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['default', 'glass', 'centered'], 'default' => 'default'],
                ],
                'render_template' => 'modal-template',
                'code_generators' => ['react-tailwind' => 'templates/components/modal.js'],
                'variants' => [
                    [
                        'name' => 'Glass Modal',
                        'description' => 'Modal with glassmorphism',
                        'props' => ['title' => 'Confirm Action', 'variant' => 'glass'],
                        'preview_code' => '<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"><div class="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-8"><h2 class="text-2xl font-bold text-white mb-4">Confirm Action</h2><p class="text-white/80 mb-6">Are you sure you want to proceed?</p><div class="flex gap-4"><button class="flex-1 px-6 py-3 bg-white text-black rounded-xl font-semibold">Confirm</button><button class="flex-1 px-6 py-3 bg-white/20 text-white rounded-xl font-semibold">Cancel</button></div></div></div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'framer-motion',
                'sort_order' => 9
            ],

            // TABS
            [
                'name' => 'Tabs',
                'type' => 'tabs',
                'component_type' => 'component',
                'category' => 'navigation',
                'alphabet_group' => 'T',
                'description' => 'Tabbed navigation interface',
                'icon' => 'Columns',
                'default_props' => [
                    'variant' => 'underline',
                ],
                'prop_definitions' => [
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['underline', 'pills', 'bordered'], 'default' => 'underline'],
                ],
                'render_template' => 'tabs-template',
                'code_generators' => ['react-tailwind' => 'templates/components/tabs.js'],
                'variants' => [
                    [
                        'name' => 'Pill Tabs',
                        'description' => 'Rounded pill style tabs',
                        'props' => ['variant' => 'pills'],
                        'preview_code' => '<div class="flex gap-2 p-2 bg-gray-100 rounded-xl"><button class="px-6 py-2 bg-white rounded-lg font-semibold shadow-sm">Tab 1</button><button class="px-6 py-2 text-gray-600 hover:text-gray-900 transition">Tab 2</button><button class="px-6 py-2 text-gray-600 hover:text-gray-900 transition">Tab 3</button></div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'framer-motion',
                'sort_order' => 10
            ],

            // TOAST NOTIFICATION
            [
                'name' => 'Toast',
                'type' => 'toast',
                'component_type' => 'component',
                'category' => 'feedback',
                'alphabet_group' => 'T',
                'description' => 'Temporary notification message',
                'icon' => 'Bell',
                'default_props' => [
                    'message' => '',
                    'type' => 'info',
                    'position' => 'top-right',
                ],
                'prop_definitions' => [
                    'message' => ['type' => 'string', 'label' => 'Message', 'default' => ''],
                    'type' => ['type' => 'select', 'label' => 'Type', 'options' => ['success', 'error', 'warning', 'info'], 'default' => 'info'],
                    'position' => ['type' => 'select', 'label' => 'Position', 'options' => ['top-left', 'top-right', 'bottom-left', 'bottom-right'], 'default' => 'top-right'],
                ],
                'render_template' => 'toast-template',
                'code_generators' => ['react-tailwind' => 'templates/components/toast.js'],
                'variants' => [
                    [
                        'name' => 'Success Toast',
                        'description' => 'Success notification',
                        'props' => ['message' => 'Changes saved successfully!', 'type' => 'success'],
                        'preview_code' => '<div class="fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 bg-green-50 border border-green-200 rounded-xl shadow-lg animate-slide-in-right"><svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span class="font-semibold text-green-900">Changes saved successfully!</span></div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 11
            ],

            // PROGRESS BAR
            [
                'name' => 'Progress Bar',
                'type' => 'progress',
                'component_type' => 'component',
                'category' => 'feedback',
                'alphabet_group' => 'P',
                'description' => 'Progress indicator',
                'icon' => 'Activity',
                'default_props' => [
                    'value' => 50,
                    'max' => 100,
                    'variant' => 'default',
                    'showLabel' => true,
                ],
                'prop_definitions' => [
                    'value' => ['type' => 'number', 'label' => 'Value', 'default' => 50, 'min' => 0, 'max' => 100],
                    'max' => ['type' => 'number', 'label' => 'Maximum', 'default' => 100],
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['default', 'gradient', 'striped'], 'default' => 'default'],
                    'showLabel' => ['type' => 'boolean', 'label' => 'Show Label', 'default' => true],
                ],
                'render_template' => 'progress-template',
                'code_generators' => ['react-tailwind' => 'templates/components/progress.js'],
                'variants' => [
                    [
                        'name' => 'Gradient Progress',
                        'description' => 'Progress with gradient fill',
                        'props' => ['value' => 75, 'variant' => 'gradient'],
                        'preview_code' => '<div class="w-full"><div class="flex justify-between mb-2"><span class="text-sm font-semibold">Loading...</span><span class="text-sm font-semibold">75%</span></div><div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300" style="width: 75%"></div></div></div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 12
            ],
        ];

        foreach ($advancedComponents as $component) {
            Component::create($component);
        }
    }
}