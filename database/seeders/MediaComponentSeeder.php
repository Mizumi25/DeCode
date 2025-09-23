<?php
// database/seeders/MediaComponentSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class MediaComponentSeeder extends Seeder
{
    public function run(): void
    {
        $mediaComponents = [
            [
                'name' => 'Image Gallery',
                'type' => 'image-gallery',
                'component_type' => 'component',
                'category' => 'media',
                'alphabet_group' => 'I',
                'description' => 'Responsive image gallery with lightbox',
                'icon' => 'Images',
                'default_props' => [
                    'images' => [
                        'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Image+1',
                        'https://via.placeholder.com/400x300/10b981/ffffff?text=Image+2',
                        'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Image+3'
                    ],
                    'layout' => 'grid',
                    'columns' => 3,
                    'showLightbox' => true,
                    'showThumbnails' => true
                ],
                'prop_definitions' => [
                    'layout' => ['type' => 'select', 'label' => 'Layout', 'options' => ['grid', 'masonry', 'carousel'], 'default' => 'grid'],
                    'columns' => ['type' => 'number', 'label' => 'Columns', 'default' => 3],
                    'showLightbox' => ['type' => 'boolean', 'label' => 'Show Lightbox', 'default' => true]
                ],
                'render_template' => 'image-gallery-template',
                'code_generators' => ['react-image-gallery' => 'templates/media/image-gallery.js'],
                'variants' => [
                    [
                        'name' => 'Masonry Layout',
                        'description' => 'Pinterest-style masonry gallery',
                        'props' => ['layout' => 'masonry'],
                        'preview_code' => '<div class="columns-3 gap-4 space-y-4"><div class="break-inside-avoid"><img class="w-full rounded-lg shadow-md" src="https://via.placeholder.com/300x400" /></div><div class="break-inside-avoid"><img class="w-full rounded-lg shadow-md" src="https://via.placeholder.com/300x200" /></div><div class="break-inside-avoid"><img class="w-full rounded-lg shadow-md" src="https://via.placeholder.com/300x300" /></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 1
            ],
            [
                'name' => 'Video Player',
                'type' => 'video-player',
                'component_type' => 'component',
                'category' => 'media',
                'alphabet_group' => 'V',
                'description' => 'Advanced video player with controls',
                'icon' => 'PlayCircle',
                'default_props' => [
                    'url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    'controls' => true,
                    'autoPlay' => false,
                    'muted' => false,
                    'loop' => false,
                    'poster' => 'https://via.placeholder.com/800x450/000000/ffffff?text=Video+Poster'
                ],
                'prop_definitions' => [
                    'url' => ['type' => 'string', 'label' => 'Video URL'],
                    'controls' => ['type' => 'boolean', 'label' => 'Show Controls', 'default' => true],
                    'autoPlay' => ['type' => 'boolean', 'label' => 'Auto Play', 'default' => false]
                ],
                'render_template' => 'video-player-template',
                'code_generators' => ['react-player' => 'templates/media/video-player.js'],
                'variants' => [
                    [
                        'name' => 'YouTube Embed',
                        'description' => 'YouTube video player',
                        'props' => ['platform' => 'youtube', 'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
                        'preview_code' => '<div class="relative aspect-video bg-black rounded-lg overflow-hidden"><div class="absolute inset-0 flex items-center justify-center"><div class="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center"><svg class="w-8 h-8 text-white ml-1"><path fill="currentColor" d="M8 5v14l11-7z"/></svg></div></div></div>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 2
            ],
            [
                'name' => 'Audio Player',
                'type' => 'audio-player',
                'component_type' => 'component',
                'category' => 'media',
                'alphabet_group' => 'A',
                'description' => 'Custom audio player with waveform',
                'icon' => 'Music',
                'default_props' => [
                    'src' => 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
                    'title' => 'Sample Audio',
                    'artist' => 'Unknown Artist',
                    'showWaveform' => true,
                    'showPlaylist' => false
                ],
                'prop_definitions' => [
                    'src' => ['type' => 'string', 'label' => 'Audio URL'],
                    'title' => ['type' => 'string', 'label' => 'Track Title'],
                    'showWaveform' => ['type' => 'boolean', 'label' => 'Show Waveform', 'default' => true]
                ],
                'render_template' => 'audio-player-template',
                'code_generators' => ['react-tailwind' => 'templates/media/audio-player.js'],
                'variants' => [
                    [
                        'name' => 'Podcast Player',
                        'description' => 'Podcast-style audio player',
                        'props' => ['variant' => 'podcast', 'showChapters' => true],
                        'preview_code' => '<div class="bg-white rounded-xl shadow-lg p-6 max-w-sm"><div class="flex items-center space-x-4"><img class="w-16 h-16 rounded-lg" src="https://via.placeholder.com/64/3b82f6/ffffff?text=🎵" /><div><h3 class="font-semibold">Episode Title</h3><p class="text-sm text-gray-600">Podcast Name</p></div></div><div class="mt-4"><div class="h-1 bg-gray-200 rounded-full"><div class="h-1 bg-blue-500 rounded-full" style="width: 35%"></div></div><div class="flex justify-between mt-2 text-sm text-gray-600"><span>12:30</span><span>35:40</span></div></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 3
            ],
            [
                'name' => 'QR Code',
                'type' => 'qr-code',
                'component_type' => 'element',
                'category' => 'media',
                'alphabet_group' => 'Q',
                'description' => 'QR code generator',
                'icon' => 'QrCode',
                'default_props' => [
                    'value' => 'https://example.com',
                    'size' => 128,
                    'bgColor' => '#ffffff',
                    'fgColor' => '#000000',
                    'includeMargin' => true
                ],
                'prop_definitions' => [
                    'value' => ['type' => 'string', 'label' => 'QR Code Value'],
                    'size' => ['type' => 'number', 'label' => 'Size (px)', 'default' => 128],
                    'bgColor' => ['type' => 'color', 'label' => 'Background Color', 'default' => '#ffffff'],
                    'fgColor' => ['type' => 'color', 'label' => 'Foreground Color', 'default' => '#000000']
                ],
                'render_template' => 'qr-code-template',
                'code_generators' => ['qrcode.js' => 'templates/media/qr-code.js'],
                'variants' => [
                    [
                        'name' => 'Styled QR Code',
                        'description' => 'QR code with custom styling',
                        'props' => ['fgColor' => '#3b82f6', 'rounded' => true],
                        'preview_code' => '<div class="p-4 bg-white rounded-lg shadow-lg"><div class="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"><div class="grid grid-cols-8 gap-0.5 w-24 h-24">' . str_repeat('<div class="bg-white w-2 h-2 rounded-sm"></div>', 64) . '</div></div></div>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 6
            ]
        ];

        foreach ($mediaComponents as $component) {
            Component::create($component);
        }
    }
}