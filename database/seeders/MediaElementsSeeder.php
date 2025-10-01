<?php
// database/seeders/MediaElementsSeeder.php - MEDIA ELEMENTS
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class MediaElementsSeeder extends Seeder
{
    public function run(): void
    {
        $mediaElements = [
            // IMAGE
            [
                'name' => 'Image',
                'type' => 'image',
                'component_type' => 'element',
                'category' => 'media',
                'alphabet_group' => 'I',
                'description' => 'Responsive image with lazy loading and effects',
                'icon' => 'Image',
                'default_props' => [
                    'src' => 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Image',
                    'alt' => 'Image',
                    'width' => 'auto',
                    'height' => 'auto',
                    'objectFit' => 'cover',
                    'className' => 'w-full h-auto rounded-lg'
                ],
                'prop_definitions' => [
                    'src' => ['type' => 'string', 'label' => 'Image URL'],
                    'alt' => ['type' => 'string', 'label' => 'Alt Text'],
                    'objectFit' => ['type' => 'select', 'label' => 'Object Fit', 'options' => ['cover', 'contain', 'fill'], 'default' => 'cover']
                ],
                'render_template' => 'image-template',
                'code_generators' => ['react-tailwind' => 'templates/media/image.js'],
                'variants' => [
                    [
                        'name' => 'Hero Image',
                        'description' => 'Large hero section image',
                        'props' => ['src' => 'https://via.placeholder.com/1200x600/6366f1/ffffff?text=Hero+Image', 'className' => 'w-full h-96 object-cover rounded-xl shadow-2xl'],
                        'preview_code' => '<img class="w-full h-96 object-cover rounded-xl shadow-2xl" src="https://via.placeholder.com/1200x600/6366f1/ffffff?text=Hero+Image" alt="Hero Image" />'
                    ],
                    [
                        'name' => 'Profile Avatar',
                        'description' => 'Circular profile image',
                        'props' => ['src' => 'https://via.placeholder.com/128x128/10b981/ffffff?text=User', 'className' => 'w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg'],
                        'preview_code' => '<img class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" src="https://via.placeholder.com/128x128/10b981/ffffff?text=User" alt="Profile Avatar" />'
                    ],
                    [
                        'name' => 'Card Image',
                        'description' => 'Card header image',
                        'props' => ['src' => 'https://via.placeholder.com/400x250/f59e0b/ffffff?text=Card+Image', 'className' => 'w-full h-48 object-cover rounded-t-lg'],
                        'preview_code' => '<img class="w-full h-48 object-cover rounded-t-lg" src="https://via.placeholder.com/400x250/f59e0b/ffffff?text=Card+Image" alt="Card Image" />'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 1
            ],

            // VIDEO
            [
                'name' => 'Video',
                'type' => 'video',
                'component_type' => 'element',
                'category' => 'media',
                'alphabet_group' => 'V',
                'description' => 'HTML5 video player with controls',
                'icon' => 'Video',
                'default_props' => [
                    'src' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    'controls' => true,
                    'autoPlay' => false,
                    'muted' => false,
                    'loop' => false,
                    'className' => 'w-full rounded-lg shadow-lg'
                ],
                'prop_definitions' => [
                    'src' => ['type' => 'string', 'label' => 'Video URL'],
                    'controls' => ['type' => 'boolean', 'label' => 'Show Controls', 'default' => true],
                    'autoPlay' => ['type' => 'boolean', 'label' => 'Auto Play', 'default' => false],
                    'muted' => ['type' => 'boolean', 'label' => 'Muted', 'default' => false]
                ],
                'render_template' => 'video-template',
                'code_generators' => ['react-tailwind' => 'templates/media/video.js'],
                'variants' => [
                    [
                        'name' => 'Hero Video',
                        'description' => 'Background video for hero sections',
                        'props' => ['autoPlay' => true, 'muted' => true, 'loop' => true, 'controls' => false, 'className' => 'w-full h-96 object-cover rounded-xl'],
                        'preview_code' => '<video class="w-full h-96 object-cover rounded-xl" autoplay muted loop><source src="#" type="video/mp4">Your browser does not support video.</video>'
                    ],
                    [
                        'name' => 'Standard Player',
                        'description' => 'Standard video player with controls',
                        'props' => ['controls' => true, 'className' => 'w-full max-w-4xl mx-auto rounded-lg shadow-lg'],
                        'preview_code' => '<video class="w-full max-w-4xl mx-auto rounded-lg shadow-lg" controls><source src="#" type="video/mp4">Your browser does not support video.</video>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 2
            ],

            // ICON
            [
                'name' => 'Icon',
                'type' => 'icon',
                'component_type' => 'element',
                'category' => 'media',
                'alphabet_group' => 'I',
                'description' => 'Scalable vector icon with various styles',
                'icon' => 'Sparkles',
                'default_props' => [
                    'iconName' => 'Star',
                    'size' => 24,
                    'color' => '#6b7280',
                    'strokeWidth' => 2,
                    'className' => 'w-6 h-6 text-gray-500'
                ],
                'prop_definitions' => [
                    'iconName' => ['type' => 'string', 'label' => 'Icon Name', 'default' => 'Star'],
                    'size' => ['type' => 'number', 'label' => 'Size (px)', 'default' => 24],
                    'color' => ['type' => 'color', 'label' => 'Color', 'default' => '#6b7280']
                ],
                'render_template' => 'icon-template',
                'code_generators' => ['react-tailwind' => 'templates/media/icon.js'],
                'variants' => [
                    [
                        'name' => 'Feature Icon',
                        'description' => 'Large colorful feature icon',
                        'props' => ['iconName' => 'Zap', 'size' => 48, 'color' => '#3b82f6', 'className' => 'w-12 h-12 text-blue-600'],
                        'preview_code' => '<svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>'
                    ],
                    [
                        'name' => 'Navigation Icon',
                        'description' => 'Small navigation menu icon',
                        'props' => ['iconName' => 'Menu', 'size' => 20, 'color' => '#374151', 'className' => 'w-5 h-5 text-gray-700'],
                        'preview_code' => '<svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 3
            ]
        ];

        foreach ($mediaElements as $element) {
            Component::create($element);
        }
    }
}