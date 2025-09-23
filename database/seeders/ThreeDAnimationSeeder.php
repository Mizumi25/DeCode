<?php
// database/seeders/ThreeDAnimationSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class ThreeDAnimationSeeder extends Seeder
{
    public function run(): void
    {
        $threeDComponents = [
            [
                'name' => '3D Model Viewer',
                'type' => '3d-model-viewer',
                'component_type' => 'component',
                'category' => '3d',
                'alphabet_group' => '3',
                'description' => 'Interactive 3D model viewer with controls',
                'icon' => 'Box',
                'default_props' => [
                    'modelUrl' => '/models/default-cube.glb',
                    'enableControls' => true,
                    'autoRotate' => false,
                    'background' => 'transparent',
                    'lighting' => 'studio',
                    'cameraPosition' => [0, 0, 5]
                ],
                'prop_definitions' => [
                    'modelUrl' => ['type' => 'string', 'label' => 'Model URL (.glb/.gltf)'],
                    'enableControls' => ['type' => 'boolean', 'label' => 'Enable Controls', 'default' => true],
                    'autoRotate' => ['type' => 'boolean', 'label' => 'Auto Rotate', 'default' => false],
                    'lighting' => ['type' => 'select', 'label' => 'Lighting', 'options' => ['studio', 'natural', 'dramatic'], 'default' => 'studio']
                ],
                'render_template' => '3d-model-viewer-template',
                'code_generators' => ['react-three-fiber' => 'templates/3d/model-viewer.js'],
                'variants' => [
                    [
                        'name' => 'Product Showcase',
                        'description' => '3D product viewer with hotspots',
                        'props' => ['variant' => 'product', 'showHotspots' => true],
                        'preview_code' => '<div class="relative w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden"><div class="absolute inset-0 flex items-center justify-center"><div class="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-xl transform rotate-12 animate-pulse"></div></div><div class="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2"><svg class="w-4 h-4 text-gray-600"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'threejs',
                'sort_order' => 1
            ],
            [
                'name' => '3D Scene',
                'type' => '3d-scene',
                'component_type' => 'component',
                'category' => '3d',
                'alphabet_group' => '3',
                'description' => 'Custom 3D scene with primitives',
                'icon' => 'Layers',
                'default_props' => [
                    'objects' => [
                        ['type' => 'cube', 'position' => [0, 0, 0], 'color' => '#3b82f6'],
                        ['type' => 'sphere', 'position' => [2, 0, 0], 'color' => '#10b981']
                    ],
                    'cameraType' => 'perspective',
                    'backgroundColor' => '#ffffff',
                    'fog' => false
                ],
                'prop_definitions' => [
                    'cameraType' => ['type' => 'select', 'label' => 'Camera Type', 'options' => ['perspective', 'orthographic'], 'default' => 'perspective'],
                    'backgroundColor' => ['type' => 'color', 'label' => 'Background Color', 'default' => '#ffffff'],
                    'fog' => ['type' => 'boolean', 'label' => 'Enable Fog', 'default' => false]
                ],
                'render_template' => '3d-scene-template',
                'code_generators' => ['react-three-fiber' => 'templates/3d/scene.js'],
                'variants' => [
                    [
                        'name' => 'Solar System',
                        'description' => 'Animated solar system',
                        'props' => ['preset' => 'solar-system', 'autoRotate' => true],
                        'preview_code' => '<div class="w-full h-64 bg-black rounded-lg relative overflow-hidden"><div class="absolute inset-0 flex items-center justify-center"><div class="relative"><div class="w-8 h-8 bg-yellow-400 rounded-full animate-spin" style="animation-duration: 10s;"></div><div class="absolute top-1/2 left-1/2 w-20 h-20 border border-blue-400/30 rounded-full -translate-x-1/2 -translate-y-1/2"><div class="w-2 h-2 bg-blue-500 rounded-full absolute animate-pulse" style="top: -1px; left: 50%; margin-left: -4px;"></div></div></div></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'threejs',
                'sort_order' => 2
            ],
            [
                'name' => 'Particle System',
                'type' => 'particle-system',
                'component_type' => 'component',
                'category' => '3d',
                'alphabet_group' => 'P',
                'description' => '3D particle effects and animations',
                'icon' => 'Sparkles',
                'default_props' => [
                    'particleCount' => 1000,
                    'particleSize' => 0.1,
                    'speed' => 1,
                    'pattern' => 'sphere',
                    'color' => '#3b82f6'
                ],
                'prop_definitions' => [
                    'particleCount' => ['type' => 'number', 'label' => 'Particle Count', 'default' => 1000],
                    'particleSize' => ['type' => 'number', 'label' => 'Particle Size', 'default' => 0.1],
                    'pattern' => ['type' => 'select', 'label' => 'Pattern', 'options' => ['sphere', 'cube', 'plane', 'spiral'], 'default' => 'sphere']
                ],
                'render_template' => 'particle-system-template',
                'code_generators' => ['react-three-fiber' => 'templates/3d/particles.js'],
                'variants' => [
                    [
                        'name' => 'Snow Effect',
                        'description' => 'Falling snow particles',
                        'props' => ['pattern' => 'snow', 'color' => '#ffffff', 'speed' => 0.5],
                        'preview_code' => '<div class="w-full h-64 bg-gradient-to-b from-gray-600 to-gray-800 rounded-lg relative overflow-hidden">' . str_repeat('<div class="absolute w-1 h-1 bg-white rounded-full opacity-80 animate-bounce" style="left: ' . rand(0, 100) . '%; top: ' . rand(0, 100) . '%; animation-delay: ' . (rand(0, 2000) / 1000) . 's; animation-duration: ' . (rand(2000, 4000) / 1000) . 's;"></div>', 20) . '</div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'threejs',
                'sort_order' => 3
            ],
            [
                'name' => 'GSAP Animation',
                'type' => 'gsap-animation',
                'component_type' => 'component',
                'category' => 'animation',
                'alphabet_group' => 'G',
                'description' => 'GSAP timeline animation',
                'icon' => 'Zap',
                'default_props' => [
                    'trigger' => 'scroll',
                    'duration' => 1,
                    'delay' => 0,
                    'ease' => 'power2.out',
                    'animation' => 'fadeInUp'
                ],
                'prop_definitions' => [
                    'trigger' => ['type' => 'select', 'label' => 'Trigger', 'options' => ['scroll', 'hover', 'click', 'load'], 'default' => 'scroll'],
                    'duration' => ['type' => 'number', 'label' => 'Duration (s)', 'default' => 1],
                    'animation' => ['type' => 'select', 'label' => 'Animation', 'options' => ['fadeInUp', 'slideInLeft', 'scaleIn', 'rotateIn'], 'default' => 'fadeInUp']
                ],
                'render_template' => 'gsap-animation-template',
                'code_generators' => ['gsap' => 'templates/animations/gsap.js'],
                'variants' => [
                    [
                        'name' => 'Text Reveal',
                        'description' => 'Animated text reveal effect',
                        'props' => ['animation' => 'textReveal', 'stagger' => 0.1],
                        'preview_code' => '<div class="overflow-hidden"><h2 class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Animated Text Reveal</h2><div class="h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 mt-2 animate-pulse" style="width: 0%; animation: expand 2s ease-out forwards;"></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'gsap',
                'sort_order' => 4
            ],
            [
                'name' => 'CSS Animation',
                'type' => 'css-animation',
                'component_type' => 'element',
                'category' => 'animation',
                'alphabet_group' => 'C',
                'description' => 'CSS-based animations and effects',
                'icon' => 'Waves',
                'default_props' => [
                    'animation' => 'bounce',
                    'duration' => '1s',
                    'delay' => '0s',
                    'iterationCount' => 'infinite',
                    'direction' => 'normal'
                ],
                'prop_definitions' => [
                    'animation' => ['type' => 'select', 'label' => 'Animation', 'options' => ['bounce', 'pulse', 'spin', 'ping', 'wiggle'], 'default' => 'bounce'],
                    'duration' => ['type' => 'string', 'label' => 'Duration', 'default' => '1s'],
                    'iterationCount' => ['type' => 'select', 'label' => 'Repeat', 'options' => ['1', 'infinite'], 'default' => 'infinite']
                ],
                'render_template' => 'css-animation-template',
                'code_generators' => ['css' => 'templates/animations/css.js'],
                'variants' => [
                    [
                        'name' => 'Floating Element',
                        'description' => 'Gentle floating animation',
                        'props' => ['animation' => 'float', 'duration' => '3s'],
                        'preview_code' => '<div class="w-16 h-16 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full shadow-lg animate-bounce" style="animation-duration: 3s;"></div>'
                    ],
                    [
                        'name' => 'Morphing Shape',
                        'description' => 'Shape morphing animation',
                        'props' => ['animation' => 'morph', 'duration' => '2s'],
                        'preview_code' => '<div class="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-400 transition-all duration-2000 hover:rounded-full hover:rotate-180"></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 5
            ]
        ];

        foreach ($threeDComponents as $component) {
            Component::create($component);
        }
    }
}