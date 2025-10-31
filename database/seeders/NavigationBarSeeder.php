<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class NavigationBarSeeder extends Seeder
{
    public function run(): void
    {
        $navbarComponent = [
            [
                'name' => 'Navigation Bar',
                'type' => 'navbar',
                'component_type' => 'component',
                'category' => 'navigation',
                'alphabet_group' => 'N',
                'description' => 'Pre-built navigation bar with logo and links',
                'icon' => 'Menu',
                'default_props' => [
                    'logoText' => 'UXZehra',
                    'navLinks' => ['Work', 'Contact', 'Resume'],
                    'ctaText' => 'Hire me',
                ],
                'prop_definitions' => [
                    'logoText' => ['type' => 'string', 'label' => 'Logo Text', 'default' => 'UXZehra'],
                    'navLinks' => ['type' => 'array', 'label' => 'Navigation Links', 'default' => ['Work', 'Contact', 'Resume']],
                    'ctaText' => ['type' => 'string', 'label' => 'CTA Button Text', 'default' => 'Hire me'],
                ],
                'render_template' => 'navbar-component',
                'code_generators' => ['react-tailwind' => 'templates/components/navbar.js'],
                'variants' => [
                    [
                        'name' => 'Modern Navbar',
                        'description' => 'Clean modern navigation',
                        'props' => [
                            'logoText' => 'UXZehra',
                            'navLinks' => ['Work', 'Contact', 'Resume'],
                            'ctaText' => 'Hire me',
                        ],
                        'style' => [
                            'width' => '100%',
                            'display' => 'flex',
                            'flexDirection' => 'row',
                            'justifyContent' => 'space-between',
                            'alignItems' => 'center',
                            'padding' => '24px 48px',
                            'background' => 'rgba(255, 255, 255, 0.9)',
                            'backdropFilter' => 'blur(12px)',
                            'borderBottom' => '1px solid rgba(0, 0, 0, 0.1)',
                        ],
                        'preview_code' => '<nav style="width: 100%; display: flex; flex-direction: row; justify-content: space-between; align-items: center; padding: 24px 48px; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0, 0, 0, 0.1);"><div style="font-size: 20px; font-weight: 700; color: #000000;">UXZehra</div><div style="display: flex; gap: 32px; align-items: center;"><a style="font-size: 16px; color: #374151; text-decoration: none;">Work</a><a style="font-size: 16px; color: #374151; text-decoration: none;">Contact</a><a style="font-size: 16px; color: #374151; text-decoration: none;">Resume</a></div><button style="padding: 12px 24px; font-size: 16px; font-weight: 600; border-radius: 9999px; background: #000000; color: #ffffff; border: none; cursor: pointer;">Hire me</button></nav>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 1
            ],
        ];

        foreach ($navbarComponent as $component) {
            Component::create($component);
        }
    }
}