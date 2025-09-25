<?php
// database/seeders/MediaComponentSeeder.php - REPLACE EXISTING FILE
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class MediaComponentSeeder extends Seeder
{
    public function run(): void
    {
        $mediaComponents = [
            // BASIC IMAGE
            [
                'name' => 'Image',
                'type' => 'image',
                'component_type' => 'element',
                'category' => 'media',
                'alphabet_group' => 'I',
                'description' => 'Responsive image with lazy loading',
                'icon' => 'Image',
                'default_props' => [
                    'src' => 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Image',
                    'alt' => 'Image',
                    'width' => 'auto',
                    'height' => 'auto',
                    'objectFit' => 'cover',
                    'loading' => 'lazy',
                    'rounded' => false,
                    'shadow' => false
                ],
                'prop_definitions' => [
                    'src' => ['type' => 'string', 'label' => 'Image URL'],
                    'alt' => ['type' => 'string', 'label' => 'Alt Text'],
                    'objectFit' => ['type' => 'select', 'label' => 'Object Fit', 'options' => ['cover', 'contain', 'fill', 'none'], 'default' => 'cover'],
                    'rounded' => ['type' => 'boolean', 'label' => 'Rounded Corners', 'default' => false],
                    'shadow' => ['type' => 'boolean', 'label' => 'Drop Shadow', 'default' => false]
                ],
                'render_template' => 'image-template',
                'code_generators' => ['react-tailwind' => 'templates/media/image.js'],
                'variants' => [
                    [
                        'name' => 'Rounded Image',
                        'description' => 'Image with rounded corners',
                        'props' => ['rounded' => true],
                        'preview_code' => '<img class="rounded-lg shadow-md" src="https://via.placeholder.com/200x150" alt="Rounded Image" />'
                    ],
                    [
                        'name' => 'Circle Avatar',
                        'description' => 'Circular image for avatars',
                        'props' => ['rounded' => true, 'objectFit' => 'cover'],
                        'preview_code' => '<img class="w-16 h-16 rounded-full object-cover shadow-lg" src="https://via.placeholder.com/64x64" alt="Avatar" />'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 1
            ],

            // BASIC VIDEO
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
                    'width' => '100%',
                    'height' => 'auto'
                ],
                'prop_definitions' => [
                    'src' => ['type' => 'string', 'label' => 'Video URL'],
                    'controls' => ['type' => 'boolean', 'label' => 'Show Controls', 'default' => true],
                    'autoPlay' => ['type' => 'boolean', 'label' => 'Auto Play', 'default' => false],
                    'muted' => ['type' => 'boolean', 'label' => 'Muted', 'default' => false],
                    'loop' => ['type' => 'boolean', 'label' => 'Loop', 'default' => false]
                ],
                'render_template' => 'video-template',
                'code_generators' => ['react-tailwind' => 'templates/media/video.js'],
                'variants' => [
                    [
                        'name' => 'Auto-play Video',
                        'description' => 'Video that auto-plays when loaded',
                        'props' => ['autoPlay' => true, 'muted' => true],
                        'preview_code' => '<video class="w-full rounded-lg" autoplay muted loop><source src="#" type="video/mp4">Video not supported</video>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 2
            ],

            // YOUTUBE EMBED
            [
                'name' => 'YouTube Embed',
                'type' => 'youtube-embed',
                'component_type' => 'component',
                'category' => 'media',
                'alphabet_group' => 'Y',
                'description' => 'Embedded YouTube video player',
                'icon' => 'Play',
                'default_props' => [
                    'videoId' => 'dQw4w9WgXcQ',
                    'width' => '560',
                    'height' => '315',
                    'autoplay' => false,
                    'controls' => true,
                    'mute' => false,
                    'loop' => false,
                    'showInfo' => true
                ],
                'prop_definitions' => [
                    'videoId' => ['type' => 'string', 'label' => 'YouTube Video ID'],
                    'autoplay' => ['type' => 'boolean', 'label' => 'Auto Play', 'default' => false],
                    'controls' => ['type' => 'boolean', 'label' => 'Show Controls', 'default' => true],
                    'mute' => ['type' => 'boolean', 'label' => 'Mute', 'default' => false],
                    'loop' => ['type' => 'boolean', 'label' => 'Loop', 'default' => false]
                ],
                'render_template' => 'youtube-template',
                'code_generators' => ['react-tailwind' => 'templates/media/youtube.js'],
                'variants' => [
                    [
                        'name' => 'Responsive YouTube',
                        'description' => 'YouTube embed with 16:9 aspect ratio',
                        'props' => ['responsive' => true],
                        'preview_code' => '<div class="relative aspect-video"><iframe class="absolute inset-0 w-full h-full rounded-lg" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe></div>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 3
            ],

            // VIMEO EMBED
            [
                'name' => 'Vimeo Embed',
                'type' => 'vimeo-embed',
                'component_type' => 'component',
                'category' => 'media',
                'alphabet_group' => 'V',
                'description' => 'Embedded Vimeo video player',
                'icon' => 'Play',
                'default_props' => [
                    'videoId' => '148751763',
                    'width' => '560',
                    'height' => '315',
                    'autoplay' => false,
                    'loop' => false,
                    'showTitle' => true,
                    'showByline' => true,
                    'showPortrait' => true
                ],
                'prop_definitions' => [
                    'videoId' => ['type' => 'string', 'label' => 'Vimeo Video ID'],
                    'autoplay' => ['type' => 'boolean', 'label' => 'Auto Play', 'default' => false],
                    'loop' => ['type' => 'boolean', 'label' => 'Loop', 'default' => false],
                    'showTitle' => ['type' => 'boolean', 'label' => 'Show Title', 'default' => true]
                ],
                'render_template' => 'vimeo-template',
                'code_generators' => ['react-tailwind' => 'templates/media/vimeo.js'],
                'variants' => [],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 4
            ],

            // IMAGE GALLERY
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
                        'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Image+3',
                        'https://via.placeholder.com/400x300/ef4444/ffffff?text=Image+4'
                    ],
                    'layout' => 'grid',
                    'columns' => 3,
                    'showLightbox' => true,
                    'showThumbnails' => true,
                    'gap' => 'md'
                ],
                'prop_definitions' => [
                    'layout' => ['type' => 'select', 'label' => 'Layout', 'options' => ['grid', 'masonry', 'carousel'], 'default' => 'grid'],
                    'columns' => ['type' => 'number', 'label' => 'Columns', 'default' => 3, 'min' => 1, 'max' => 6],
                    'showLightbox' => ['type' => 'boolean', 'label' => 'Show Lightbox', 'default' => true],
                    'gap' => ['type' => 'select', 'label' => 'Gap Size', 'options' => ['sm', 'md', 'lg'], 'default' => 'md']
                ],
                'render_template' => 'image-gallery-template',
                'code_generators' => ['react-image-gallery' => 'templates/media/image-gallery.js'],
                'variants' => [
                    [
                        'name' => 'Masonry Layout',
                        'description' => 'Pinterest-style masonry gallery',
                        'props' => ['layout' => 'masonry'],
                        'preview_code' => '<div class="columns-3 gap-4 space-y-4"><div class="break-inside-avoid"><img class="w-full rounded-lg shadow-md" src="https://via.placeholder.com/300x400" /></div><div class="break-inside-avoid"><img class="w-full rounded-lg shadow-md" src="https://via.placeholder.com/300x200" /></div></div>'
                    ],
                    [
                        'name' => 'Carousel Gallery',
                        'description' => 'Sliding carousel gallery',
                        'props' => ['layout' => 'carousel', 'autoplay' => true],
                        'preview_code' => '<div class="relative overflow-hidden rounded-xl"><div class="flex transition-transform duration-500"><img class="w-full flex-shrink-0 object-cover" src="https://via.placeholder.com/600x400" /></div><div class="absolute inset-0 flex items-center justify-between p-4"><button class="bg-black/50 text-white p-2 rounded-full">‹</button><button class="bg-black/50 text-white p-2 rounded-full">›</button></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 5
            ],

            // VIDEO GALLERY
            [
                'name' => 'Video Gallery',
                'type' => 'video-gallery',
                'component_type' => 'component',
                'category' => 'media',
                'alphabet_group' => 'V',
                'description' => 'Grid of video thumbnails with modal player',
                'icon' => 'Video',
                'default_props' => [
                    'videos' => [
                        [
                            'id' => '1',
                            'title' => 'Sample Video 1',
                            'url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                            'thumbnail' => 'https://via.placeholder.com/400x225/1f2937/ffffff?text=Video+1',
                            'duration' => '10:24'
                        ],
                        [
                            'id' => '2',
                            'title' => 'Sample Video 2',
                            'url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                            'thumbnail' => 'https://via.placeholder.com/400x225/374151/ffffff?text=Video+2',
                            'duration' => '15:33'
                        ]
                    ],
                    'columns' => 2,
                    'showTitles' => true,
                    'showDuration' => true
                ],
                'prop_definitions' => [
                    'columns' => ['type' => 'number', 'label' => 'Columns', 'default' => 2, 'min' => 1, 'max' => 4],
                    'showTitles' => ['type' => 'boolean', 'label' => 'Show Titles', 'default' => true],
                    'showDuration' => ['type' => 'boolean', 'label' => 'Show Duration', 'default' => true]
                ],
                'render_template' => 'video-gallery-template',
                'code_generators' => ['react-tailwind' => 'templates/media/video-gallery.js'],
                'variants' => [],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 6
            ],

            // AUDIO PLAYER
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
                    'showPlaylist' => false,
                    'autoplay' => false,
                    'loop' => false,
                    'volume' => 0.8
                ],
                'prop_definitions' => [
                    'src' => ['type' => 'string', 'label' => 'Audio URL'],
                    'title' => ['type' => 'string', 'label' => 'Track Title'],
                    'artist' => ['type' => 'string', 'label' => 'Artist Name'],
                    'showWaveform' => ['type' => 'boolean', 'label' => 'Show Waveform', 'default' => true],
                    'autoplay' => ['type' => 'boolean', 'label' => 'Auto Play', 'default' => false]
                ],
                'render_template' => 'audio-player-template',
                'code_generators' => ['react-tailwind' => 'templates/media/audio-player.js'],
                'variants' => [
                    [
                        'name' => 'Podcast Player',
                        'description' => 'Podcast-style audio player',
                        'props' => ['variant' => 'podcast', 'showChapters' => true],
                        'preview_code' => '<div class="bg-white rounded-xl shadow-lg p-6 max-w-sm"><div class="flex items-center space-x-4"><img class="w-16 h-16 rounded-lg" src="https://via.placeholder.com/64/3b82f6/ffffff?text=🎵" /><div><h3 class="font-semibold">Episode Title</h3><p class="text-sm text-gray-600">Podcast Name</p></div></div><div class="mt-4"><div class="h-1 bg-gray-200 rounded-full"><div class="h-1 bg-blue-500 rounded-full" style="width: 35%"></div></div><div class="flex justify-between mt-2 text-sm text-gray-600"><span>12:30</span><span>35:40</span></div></div></div>'
                    ],
                    [
                        'name' => 'Music Player',
                        'description' => 'Music streaming style player',
                        'props' => ['variant' => 'music', 'showAlbumArt' => true],
                        'preview_code' => '<div class="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-6 text-white max-w-sm"><div class="text-center mb-4"><img class="w-32 h-32 rounded-2xl mx-auto shadow-2xl" src="https://via.placeholder.com/128/8b5cf6/ffffff?text=♪" /><h2 class="font-bold text-xl mt-4">Song Title</h2><p class="text-purple-200">Artist Name</p></div><div class="flex items-center justify-center space-x-4"><button class="p-2 text-2xl">⏮</button><button class="bg-white text-purple-900 rounded-full p-4 text-2xl">▶</button><button class="p-2 text-2xl">⏭</button></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 7
            ],

            // GIF PLAYER
            [
                'name' => 'GIF Player',
                'type' => 'gif-player',
                'component_type' => 'component',
                'category' => 'media',
                'alphabet_group' => 'G',
                'description' => 'GIF with play/pause controls',
                'icon' => 'Zap',
                'default_props' => [
                    'src' => 'https://via.placeholder.com/400x300.gif',
                    'alt' => 'Animated GIF',
                    'autoplay' => true,
                    'loop' => true,
                    'controls' => false,
                    'speed' => 1.0
                ],
                'prop_definitions' => [
                    'src' => ['type' => 'string', 'label' => 'GIF URL'],
                    'alt' => ['type' => 'string', 'label' => 'Alt Text'],
                    'autoplay' => ['type' => 'boolean', 'label' => 'Auto Play', 'default' => true],
                    'controls' => ['type' => 'boolean', 'label' => 'Show Controls', 'default' => false],
                    'speed' => ['type' => 'number', 'label' => 'Playback Speed', 'default' => 1.0, 'min' => 0.1, 'max' => 3.0, 'step' => 0.1]
                ],
                'render_template' => 'gif-player-template',
                'code_generators' => ['react-tailwind' => 'templates/media/gif-player.js'],
                'variants' => [
                    [
                        'name' => 'Controllable GIF',
                        'description' => 'GIF with play/pause and speed controls',
                        'props' => ['controls' => true, 'autoplay' => false],
                        'preview_code' => '<div class="relative inline-block"><img class="rounded-lg" src="https://via.placeholder.com/300x200.gif" alt="Animated GIF" /><div class="absolute bottom-2 left-2 right-2 bg-black/70 rounded flex items-center justify-between p-2"><button class="text-white text-sm">▶</button><input type="range" class="flex-1 mx-2" min="0.1" max="3" step="0.1" value="1" /><span class="text-white text-xs">1.0x</span></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 8
            ],

            // QR CODE
            [
                'name' => 'QR Code',
                'type' => 'qr-code',
                'component_type' => 'element',
                'category' => 'media',
                'alphabet_group' => 'Q',
                'description' => 'QR code generator with customization',
                'icon' => 'QrCode',
                'default_props' => [
                    'value' => 'https://example.com',
                    'size' => 128,
                    'bgColor' => '#ffffff',
                    'fgColor' => '#000000',
                    'includeMargin' => true,
                    'errorCorrectionLevel' => 'M',
                    'logo' => null
                ],
                'prop_definitions' => [
                    'value' => ['type' => 'string', 'label' => 'QR Code Value'],
                    'size' => ['type' => 'number', 'label' => 'Size (px)', 'default' => 128, 'min' => 64, 'max' => 512],
                    'bgColor' => ['type' => 'color', 'label' => 'Background Color', 'default' => '#ffffff'],
                    'fgColor' => ['type' => 'color', 'label' => 'Foreground Color', 'default' => '#000000'],
                    'errorCorrectionLevel' => ['type' => 'select', 'label' => 'Error Correction', 'options' => ['L', 'M', 'Q', 'H'], 'default' => 'M']
                ],
                'render_template' => 'qr-code-template',
                'code_generators' => ['qrcode.js' => 'templates/media/qr-code.js'],
                'variants' => [
                    [
                        'name' => 'Styled QR Code',
                        'description' => 'QR code with custom styling and branding',
                        'props' => ['fgColor' => '#3b82f6', 'rounded' => true, 'logo' => 'brand-logo.png'],
                        'preview_code' => '<div class="p-4 bg-white rounded-lg shadow-lg"><div class="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"><div class="grid grid-cols-8 gap-0.5 w-24 h-24">' . str_repeat('<div class="bg-white w-2 h-2 rounded-sm"></div>', 64) . '</div></div><p class="text-center mt-2 text-sm text-gray-600">Scan me!</p></div>'
                    ]
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 9
            ]
        ];

        foreach ($mediaComponents as $component) {
            Component::create($component);
        }
    }
}