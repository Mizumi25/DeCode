<?php
// database/seeders/Advanced3DAndInteractiveSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class Advanced3DAndInteractiveSeeder extends Seeder
{
    public function run(): void
    {
        $advancedComponents = [
            // THREE.JS 3D SCENE
            [
                'name' => 'Three.js Scene',
                'type' => 'threejs-scene',
                'component_type' => 'component',
                'category' => '3d',
                'alphabet_group' => 'T',
                'description' => 'Interactive 3D scene with Three.js',
                'icon' => 'Box',
                'default_props' => [
                    'scene' => 'cube',
                    'autoRotate' => true,
                    'controls' => true,
                ],
                'prop_definitions' => [
                    'scene' => ['type' => 'select', 'label' => 'Scene Type', 'options' => ['cube', 'sphere', 'torus', 'custom'], 'default' => 'cube'],
                    'autoRotate' => ['type' => 'boolean', 'label' => 'Auto Rotate', 'default' => true],
                    'controls' => ['type' => 'boolean', 'label' => 'User Controls', 'default' => true],
                ],
                'render_template' => 'threejs-template',
                'code_generators' => ['react-tailwind' => 'templates/3d/threejs.js'],
                'variants' => [
                    [
                        'name' => 'Gradient Sphere',
                        'description' => '3D sphere with gradient material',
                        'props' => ['scene' => 'sphere', 'autoRotate' => true],
                        'preview_code' => '<div class="relative w-full h-96 bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl overflow-hidden"><div class="absolute inset-0 flex items-center justify-center"><div class="w-64 h-64 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-spin-slow shadow-2xl"></div></div></div>'
                    ],
                    [
                        'name' => 'Floating Cube',
                        'description' => 'Animated 3D cube',
                        'props' => ['scene' => 'cube', 'autoRotate' => true],
                        'preview_code' => '<div class="relative w-full h-96 bg-black rounded-2xl overflow-hidden"><div class="absolute inset-0 flex items-center justify-center"><div class="w-48 h-48 bg-gradient-to-br from-cyan-400 to-blue-600 animate-pulse transform rotate-45 shadow-2xl"></div></div></div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'threejs',
                'sort_order' => 1
            ],

            // VIDEO PLAYER
            [
                'name' => 'Video Player',
                'type' => 'video',
                'component_type' => 'element',
                'category' => 'media',
                'alphabet_group' => 'V',
                'description' => 'HTML5 video player with controls',
                'icon' => 'Play',
                'default_props' => [
                    'src' => '',
                    'poster' => '',
                    'controls' => true,
                    'autoplay' => false,
                    'loop' => false,
                    'muted' => false,
                ],
                'prop_definitions' => [
                    'src' => ['type' => 'string', 'label' => 'Video URL', 'default' => ''],
                    'poster' => ['type' => 'string', 'label' => 'Poster Image URL', 'default' => ''],
                    'controls' => ['type' => 'boolean', 'label' => 'Show Controls', 'default' => true],
                    'autoplay' => ['type' => 'boolean', 'label' => 'Autoplay', 'default' => false],
                    'loop' => ['type' => 'boolean', 'label' => 'Loop', 'default' => false],
                    'muted' => ['type' => 'boolean', 'label' => 'Muted', 'default' => false],
                ],
                'render_template' => 'video-template',
                'code_generators' => ['react-tailwind' => 'templates/media/video.js'],
                'variants' => [
                    [
                        'name' => 'Background Video',
                        'description' => 'Full-screen background video',
                        'props' => ['autoplay' => true, 'loop' => true, 'muted' => true, 'controls' => false],
                        'preview_code' => '<div class="relative w-full h-96 bg-gray-900 rounded-2xl overflow-hidden"><video class="absolute inset-0 w-full h-full object-cover opacity-60" autoplay loop muted><source src="/video.mp4" type="video/mp4" /></video><div class="absolute inset-0 flex items-center justify-center text-white"><h2 class="text-4xl font-bold">Video Background</h2></div></div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 2
            ],

            // IMAGE GALLERY
            [
                'name' => 'Image Gallery',
                'type' => 'gallery',
                'component_type' => 'component',
                'category' => 'media',
                'alphabet_group' => 'G',
                'description' => 'Responsive image gallery with lightbox',
                'icon' => 'Images',
                'default_props' => [
                    'columns' => 3,
                    'gap' => 'md',
                    'lightbox' => true,
                ],
                'prop_definitions' => [
                    'columns' => ['type' => 'select', 'label' => 'Columns', 'options' => ['2', '3', '4', '5'], 'default' => '3'],
                    'gap' => ['type' => 'select', 'label' => 'Gap', 'options' => ['sm', 'md', 'lg'], 'default' => 'md'],
                    'lightbox' => ['type' => 'boolean', 'label' => 'Lightbox Effect', 'default' => true],
                ],
                'render_template' => 'gallery-template',
                'code_generators' => ['react-tailwind' => 'templates/media/gallery.js'],
                'variants' => [
                    [
                        'name' => 'Masonry Gallery',
                        'description' => 'Pinterest-style masonry layout',
                        'props' => ['columns' => 3, 'gap' => 'md'],
                        'preview_code' => '<div class="grid grid-cols-3 gap-4"><div class="aspect-square bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg hover:scale-105 transition-transform cursor-pointer"></div><div class="aspect-square bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg hover:scale-105 transition-transform cursor-pointer"></div><div class="aspect-square bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg hover:scale-105 transition-transform cursor-pointer"></div></div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 3
            ],

            // PARALLAX SECTION
            [
                'name' => 'Parallax Section',
                'type' => 'parallax',
                'component_type' => 'component',
                'category' => 'effects',
                'alphabet_group' => 'P',
                'description' => 'Section with parallax scrolling effect',
                'icon' => 'Layers',
                'default_props' => [
                    'speed' => 'medium',
                    'direction' => 'up',
                ],
                'prop_definitions' => [
                    'speed' => ['type' => 'select', 'label' => 'Speed', 'options' => ['slow', 'medium', 'fast'], 'default' => 'medium'],
                    'direction' => ['type' => 'select', 'label' => 'Direction', 'options' => ['up', 'down', 'left', 'right'], 'default' => 'up'],
                ],
                'render_template' => 'parallax-template',
                'code_generators' => ['react-tailwind' => 'templates/effects/parallax.js'],
                'variants' => [
                    [
                        'name' => 'Layered Parallax',
                        'description' => 'Multiple parallax layers',
                        'props' => ['speed' => 'medium', 'direction' => 'up'],
                        'preview_code' => '<div class="relative h-96 overflow-hidden bg-gradient-to-b from-indigo-900 to-purple-900"><div class="absolute inset-0 bg-[url(\'/stars.png\')] opacity-40 animate-scroll-slow"></div><div class="absolute inset-0 flex items-center justify-center"><h2 class="text-6xl font-bold text-white">Parallax Effect</h2></div></div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'gsap',
                'sort_order' => 4
            ],

            // HOVER CARD
            [
                'name' => 'Hover Card',
                'type' => 'hover-card',
                'component_type' => 'component',
                'category' => 'interactive',
                'alphabet_group' => 'H',
                'description' => 'Card with advanced hover effects',
                'icon' => 'MousePointer',
                'default_props' => [
                    'effect' => 'lift',
                    'title' => '',
                    'description' => '',
                ],
                'prop_definitions' => [
                    'effect' => ['type' => 'select', 'label' => 'Hover Effect', 'options' => ['lift', 'glow', 'tilt', 'flip'], 'default' => 'lift'],
                    'title' => ['type' => 'string', 'label' => 'Title', 'default' => ''],
                    'description' => ['type' => 'textarea', 'label' => 'Description', 'default' => ''],
                ],
                'render_template' => 'hover-card-template',
                'code_generators' => ['react-tailwind' => 'templates/interactive/hover-card.js'],
                'variants' => [
                    [
                        'name' => '3D Tilt Card',
                        'description' => 'Card with 3D tilt on hover',
                        'props' => ['title' => 'Hover Me', 'effect' => 'tilt'],
                        'preview_code' => '<div class="relative p-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl hover:shadow-[0_30px_90px_rgba(168,85,247,0.4)] transition-all duration-300 transform hover:-translate-y-2 hover:rotate-1 cursor-pointer"><h3 class="text-2xl font-bold text-white mb-4">Hover Me</h3><p class="text-white/90">Amazing 3D effect on hover</p></div>'
                    ],
                    [
                        'name' => 'Glow Card',
                        'description' => 'Card with glowing border',
                        'props' => ['title' => 'Neon Glow', 'effect' => 'glow'],
                        'preview_code' => '<div class="relative p-8 bg-black rounded-2xl border-2 border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.8)] transition-all duration-300 cursor-pointer"><h3 class="text-2xl font-bold text-cyan-400 mb-4">Neon Glow</h3><p class="text-gray-300">Cyberpunk vibes</p></div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'framer-motion',
                'sort_order' => 5
            ],

            // SCROLL REVEAL
            [
                'name' => 'Scroll Reveal',
                'type' => 'scroll-reveal',
                'component_type' => 'component',
                'category' => 'effects',
                'alphabet_group' => 'S',
                'description' => 'Content that reveals on scroll',
                'icon' => 'Eye',
                'default_props' => [
                    'animation' => 'fadeUp',
                    'delay' => 0,
                    'duration' => 600,
                ],
                'prop_definitions' => [
                    'animation' => ['type' => 'select', 'label' => 'Animation', 'options' => ['fadeUp', 'fadeIn', 'slideLeft', 'slideRight', 'zoom'], 'default' => 'fadeUp'],
                    'delay' => ['type' => 'number', 'label' => 'Delay (ms)', 'default' => 0, 'min' => 0, 'max' => 2000],
                    'duration' => ['type' => 'number', 'label' => 'Duration (ms)', 'default' => 600, 'min' => 200, 'max' => 2000],
                ],
                'render_template' => 'scroll-reveal-template',
                'code_generators' => ['react-tailwind' => 'templates/effects/scroll-reveal.js'],
                'variants' => [
                    [
                        'name' => 'Fade Up',
                        'description' => 'Fade in from bottom',
                        'props' => ['animation' => 'fadeUp', 'duration' => 600],
                        'preview_code' => '<div class="opacity-0 translate-y-8 animate-fadeInUp p-8 bg-white rounded-2xl shadow-lg"><h3 class="text-2xl font-bold mb-4">Scroll to Reveal</h3><p class="text-gray-600">This content animates when scrolled into view</p></div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'gsap',
                'sort_order' => 6
            ],

            // SKELETON LOADER
            [
                'name' => 'Skeleton Loader',
                'type' => 'skeleton',
                'component_type' => 'component',
                'category' => 'feedback',
                'alphabet_group' => 'S',
                'description' => 'Loading skeleton placeholder',
                'icon' => 'Loader',
                'default_props' => [
                    'variant' => 'card',
                    'animated' => true,
                ],
                'prop_definitions' => [
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['card', 'text', 'avatar', 'custom'], 'default' => 'card'],
                    'animated' => ['type' => 'boolean', 'label' => 'Animated', 'default' => true],
                ],
                'render_template' => 'skeleton-template',
                'code_generators' => ['react-tailwind' => 'templates/feedback/skeleton.js'],
                'variants' => [
                    [
                        'name' => 'Card Skeleton',
                        'description' => 'Skeleton for card loading',
                        'props' => ['variant' => 'card', 'animated' => true],
                        'preview_code' => '<div class="p-6 bg-white rounded-2xl border border-gray-200 animate-pulse"><div class="flex items-center gap-4 mb-4"><div class="w-12 h-12 bg-gray-200 rounded-full"></div><div class="flex-1"><div class="h-4 bg-gray-200 rounded mb-2"></div><div class="h-3 bg-gray-200 rounded w-2/3"></div></div></div><div class="h-32 bg-gray-200 rounded-xl mb-4"></div><div class="space-y-2"><div class="h-3 bg-gray-200 rounded"></div><div class="h-3 bg-gray-200 rounded w-5/6"></div></div></div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 7
            ],

            // TIMELINE
            [
                'name' => 'Timeline',
                'type' => 'timeline',
                'component_type' => 'component',
                'category' => 'display',
                'alphabet_group' => 'T',
                'description' => 'Vertical timeline component',
                'icon' => 'GitBranch',
                'default_props' => [
                    'orientation' => 'vertical',
                    'variant' => 'default',
                ],
                'prop_definitions' => [
                    'orientation' => ['type' => 'select', 'label' => 'Orientation', 'options' => ['vertical', 'horizontal'], 'default' => 'vertical'],
                    'variant' => ['type' => 'select', 'label' => 'Variant', 'options' => ['default', 'minimal', 'gradient'], 'default' => 'default'],
                ],
                'render_template' => 'timeline-template',
                'code_generators' => ['react-tailwind' => 'templates/display/timeline.js'],
                'variants' => [
                    [
                        'name' => 'Gradient Timeline',
                        'description' => 'Timeline with gradient line',
                        'props' => ['variant' => 'gradient'],
                        'preview_code' => '<div class="relative"><div class="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-600 to-pink-600"></div><div class="space-y-8 pl-16"><div class="relative"><div class="absolute -left-10 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">1</div><div class="p-6 bg-white rounded-xl shadow-lg"><h3 class="font-bold text-lg mb-2">Step One</h3><p class="text-gray-600">First milestone achieved</p></div></div><div class="relative"><div class="absolute -left-10 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">2</div><div class="p-6 bg-white rounded-xl shadow-lg"><h3 class="font-bold text-lg mb-2">Step Two</h3><p class="text-gray-600">Second milestone in progress</p></div></div></div></div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'framer-motion',
                'sort_order' => 8
            ],
        ];

        foreach ($advancedComponents as $component) {
            Component::create($component);
        }
    }
}