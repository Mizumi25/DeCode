<?php
// database/seeders/ComponentCombinationsSeeder.php - Component combinations made from element variants
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class ComponentCombinationsSeeder extends Seeder
{
    public function run(): void
    {
        $componentCombinations = [
            // ============================================
            // CARD COMPONENTS
            // ============================================
            [
                'name' => 'Card',
                'type' => 'card',
                'component_type' => 'component',
                'category' => 'layout',
                'alphabet_group' => 'C',
                'description' => 'Card component made from div + heading + paragraph + button variants',
                'icon' => 'Square',
                'default_props' => [
                    'title' => 'Card Title',
                    'description' => 'Card description text',
                    'buttonText' => 'Learn More'
                ],
                'prop_definitions' => [
                    'title' => ['type' => 'string', 'label' => 'Title', 'default' => 'Card Title'],
                    'description' => ['type' => 'textarea', 'label' => 'Description', 'default' => 'Card description text'],
                    'buttonText' => ['type' => 'string', 'label' => 'Button Text', 'default' => 'Learn More'],
                ],
                'render_template' => 'card-template',
                'code_generators' => ['react-tailwind' => 'templates/components/card.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Card',
                        'description' => 'Standard card layout',
                        'props' => ['title' => 'Card Title', 'description' => 'This is a card description', 'buttonText' => 'Learn More'],
                        'style' => [
                            'padding' => '24px',
                            'borderRadius' => '12px',
                            'border' => '1px solid #e5e7eb',
                            'backgroundColor' => '#ffffff',
                            'boxShadow' => '0 1px 3px rgba(0, 0, 0, 0.1)'
                        ],
                        'preview_code' => '<div style="padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb; background-color: #ffffff; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);"><h3 style="font-size: 24px; font-weight: 600; margin: 0 0 12px 0;">Card Title</h3><p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; color: #6b7280;">This is a card description</p><button style="padding: 12px 24px; font-size: 16px; font-weight: 500; border-radius: 8px; border: 1px solid #d1d5db; background-color: #ffffff; color: #374151; cursor: pointer;">Learn More</button></div>'
                    ],
                    [
                        'name' => 'Gradient Card',
                        'description' => 'Card with gradient background',
                        'props' => ['title' => 'Premium Card', 'description' => 'Enhanced card with gradient', 'buttonText' => 'Get Started'],
                        'style' => [
                            'padding' => '32px',
                            'borderRadius' => '16px',
                            'background' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            'color' => '#ffffff',
                            'boxShadow' => '0 10px 25px rgba(102, 126, 234, 0.3)'
                        ],
                        'preview_code' => '<div style="padding: 32px; border-radius: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);"><h3 style="font-size: 28px; font-weight: 700; margin: 0 0 16px 0; color: #ffffff;">Premium Card</h3><p style="font-size: 18px; line-height: 1.6; margin: 0 0 24px 0; color: rgba(255, 255, 255, 0.9);">Enhanced card with gradient</p><button style="padding: 16px 32px; font-size: 16px; font-weight: 500; border-radius: 16px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;">Get Started</button></div>'
                    ]
                ],
                'sort_order' => 100
            ],

            // ============================================
            // HERO SECTIONS
            // ============================================
            [
                'name' => 'Hero Section',
                'type' => 'hero',
                'component_type' => 'component',
                'category' => 'layout',
                'alphabet_group' => 'H',
                'description' => 'Hero section made from section + heading + paragraph + button variants',
                'icon' => 'Layout',
                'default_props' => [
                    'title' => 'Build Amazing Products',
                    'subtitle' => 'The fastest way to ship your ideas',
                    'ctaText' => 'Get Started'
                ],
                'prop_definitions' => [
                    'title' => ['type' => 'string', 'label' => 'Title', 'default' => 'Build Amazing Products'],
                    'subtitle' => ['type' => 'textarea', 'label' => 'Subtitle', 'default' => 'The fastest way to ship your ideas'],
                    'ctaText' => ['type' => 'string', 'label' => 'CTA Text', 'default' => 'Get Started'],
                ],
                'render_template' => 'hero-template',
                'code_generators' => ['react-tailwind' => 'templates/components/hero.js'],
                'has_animation' => false,
                'animation_type' => null,
                'variants' => [
                    [
                        'name' => 'Default Hero',
                        'description' => 'Standard hero section',
                        'props' => ['title' => 'Build Amazing Products', 'subtitle' => 'The fastest way to ship your ideas', 'ctaText' => 'Get Started'],
                        'style' => [
                            'padding' => '80px 24px',
                            'textAlign' => 'center',
                            'backgroundColor' => '#f9fafb'
                        ],
                        'preview_code' => '<section style="padding: 80px 24px; text-align: center; background-color: #f9fafb;"><h1 style="font-size: 48px; font-weight: 700; line-height: 1.1; margin: 0 0 24px 0;">Build Amazing Products</h1><p style="font-size: 20px; line-height: 1.7; margin: 0 0 32px 0; color: #6b7280;">The fastest way to ship your ideas</p><button style="display: inline-flex; align-items: center; justify-content: center; padding: 16px 32px; font-size: 18px; font-weight: 600; border-radius: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; border: none; box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4); cursor: pointer;">Get Started</button></section>'
                    ],
                    [
                        'name' => 'Gradient Hero',
                        'description' => 'Hero with gradient background',
                        'props' => ['title' => 'Next Generation Platform', 'subtitle' => 'Build faster, ship smarter', 'ctaText' => 'Start Building'],
                        'style' => [
                            'padding' => '120px 24px',
                            'textAlign' => 'center',
                            'background' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            'color' => '#ffffff',
                            'minHeight' => '100vh',
                            'display' => 'flex',
                            'flexDirection' => 'column',
                            'justifyContent' => 'center',
                            'alignItems' => 'center'
                        ],
                        'preview_code' => '<section style="padding: 120px 24px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;"><h1 style="font-size: 64px; font-weight: 800; line-height: 1.1; margin: 0 0 32px 0; color: #ffffff;">Next Generation Platform</h1><p style="font-size: 24px; line-height: 1.6; margin: 0 0 40px 0; color: rgba(255, 255, 255, 0.9);">Build faster, ship smarter</p><button style="padding: 20px 40px; font-size: 18px; font-weight: 600; border-radius: 16px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer;">Start Building</button></section>'
                    ]
                ],
                'sort_order' => 101
            ],

            // ============================================
            // NAVIGATION COMPONENTS
            // ============================================
            [
                'name' => 'Navigation Bar',
                'type' => 'navbar',
                'component_type' => 'component',
                'category' => 'layout',
                'alphabet_group' => 'N',
                'description' => 'Navigation bar made from nav + links + button variants',
                'icon' => 'Menu',
                'default_props' => [
                    'logo' => 'Logo',
                    'links' => ['Home', 'About', 'Services', 'Contact']
                ],
                'prop_definitions' => [
                    'logo' => ['type' => 'string', 'label' => 'Logo Text', 'default' => 'Logo'],
                ],
                'variants' => [
                    [
                        'name' => 'Default Navbar',
                        'description' => 'Standard navigation bar',
                        'props' => ['logo' => 'Brand'],
                        'style' => [
                            'display' => 'flex',
                            'justifyContent' => 'space-between',
                            'alignItems' => 'center',
                            'padding' => '16px 24px',
                            'backgroundColor' => '#ffffff',
                            'borderBottom' => '1px solid #e5e7eb'
                        ],
                        'preview_code' => '<nav style="display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; background-color: #ffffff; border-bottom: 1px solid #e5e7eb;"><div style="font-size: 24px; font-weight: 700; color: #111827;">Brand</div><div style="display: flex; gap: 32px; align-items: center;"><a href="#" style="color: #374151; text-decoration: none; font-weight: 500;">Home</a><a href="#" style="color: #374151; text-decoration: none; font-weight: 500;">About</a><a href="#" style="color: #374151; text-decoration: none; font-weight: 500;">Services</a><button style="padding: 12px 24px; font-size: 16px; font-weight: 500; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; border: none; cursor: pointer;">Get Started</button></div></nav>'
                    ]
                ],
                'sort_order' => 102
            ],

            // ============================================
            // FORM COMPONENTS
            // ============================================
            [
                'name' => 'Contact Form',
                'type' => 'contact-form',
                'component_type' => 'component',
                'category' => 'form',
                'alphabet_group' => 'C',
                'description' => 'Contact form made from form + input + textarea + button variants',
                'icon' => 'Mail',
                'default_props' => [
                    'title' => 'Get in Touch',
                    'submitText' => 'Send Message'
                ],
                'variants' => [
                    [
                        'name' => 'Default Contact Form',
                        'description' => 'Standard contact form',
                        'props' => ['title' => 'Get in Touch', 'submitText' => 'Send Message'],
                        'style' => [
                            'maxWidth' => '600px',
                            'margin' => '0 auto',
                            'padding' => '32px',
                            'backgroundColor' => '#ffffff',
                            'borderRadius' => '12px',
                            'boxShadow' => '0 4px 6px rgba(0, 0, 0, 0.1)'
                        ],
                        'preview_code' => '<div style="max-width: 600px; margin: 0 auto; padding: 32px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"><h2 style="font-size: 32px; font-weight: 700; margin: 0 0 24px 0; text-align: center;">Get in Touch</h2><form style="display: flex; flex-direction: column; gap: 20px;"><input type="text" placeholder="Your Name" style="padding: 16px 20px; font-size: 16px; border: 1px solid #d1d5db; border-radius: 8px; width: 100%;" /><input type="email" placeholder="Your Email" style="padding: 16px 20px; font-size: 16px; border: 1px solid #d1d5db; border-radius: 8px; width: 100%;" /><textarea placeholder="Your Message" style="padding: 16px 20px; font-size: 16px; border: 1px solid #d1d5db; border-radius: 8px; width: 100%; min-height: 120px; resize: vertical;"></textarea><button type="submit" style="padding: 16px 32px; font-size: 18px; font-weight: 600; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; border: none; cursor: pointer;">Send Message</button></form></div>'
                    ]
                ],
                'sort_order' => 103
            ],

            // ============================================
            // PRICING COMPONENTS
            // ============================================
            [
                'name' => 'Pricing Card',
                'type' => 'pricing-card',
                'component_type' => 'component',
                'category' => 'layout',
                'alphabet_group' => 'P',
                'description' => 'Pricing card made from div + heading + price + list + button variants',
                'icon' => 'DollarSign',
                'default_props' => [
                    'plan' => 'Pro',
                    'price' => '$29',
                    'period' => '/month',
                    'features' => ['Feature 1', 'Feature 2', 'Feature 3'],
                    'ctaText' => 'Choose Plan'
                ],
                'variants' => [
                    [
                        'name' => 'Default Pricing Card',
                        'description' => 'Standard pricing card',
                        'props' => ['plan' => 'Pro', 'price' => '$29', 'period' => '/month', 'ctaText' => 'Choose Plan'],
                        'style' => [
                            'padding' => '32px',
                            'backgroundColor' => '#ffffff',
                            'borderRadius' => '16px',
                            'border' => '1px solid #e5e7eb',
                            'textAlign' => 'center',
                            'boxShadow' => '0 4px 6px rgba(0, 0, 0, 0.05)'
                        ],
                        'preview_code' => '<div style="padding: 32px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; text-align: center; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);"><h3 style="font-size: 28px; font-weight: 700; margin: 0 0 16px 0;">Pro</h3><div style="margin-bottom: 24px;"><span style="font-size: 48px; font-weight: 800;">$29</span><span style="font-size: 18px; color: #6b7280;">/month</span></div><ul style="list-style: none; padding: 0; margin: 0 0 32px 0;"><li style="padding: 8px 0; color: #374151;">✓ Feature 1</li><li style="padding: 8px 0; color: #374151;">✓ Feature 2</li><li style="padding: 8px 0; color: #374151;">✓ Feature 3</li></ul><button style="width: 100%; padding: 16px; font-size: 18px; font-weight: 600; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; border: none; cursor: pointer;">Choose Plan</button></div>'
                    ],
                    [
                        'name' => 'Popular Pricing Card',
                        'description' => 'Featured pricing card with gradient',
                        'props' => ['plan' => 'Premium', 'price' => '$59', 'period' => '/month', 'ctaText' => 'Get Premium'],
                        'style' => [
                            'padding' => '40px 32px',
                            'background' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            'color' => '#ffffff',
                            'borderRadius' => '20px',
                            'textAlign' => 'center',
                            'boxShadow' => '0 20px 40px rgba(102, 126, 234, 0.3)',
                            'position' => 'relative',
                            'transform' => 'scale(1.05)'
                        ],
                        'preview_code' => '<div style="padding: 40px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; border-radius: 20px; text-align: center; box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3); position: relative; transform: scale(1.05);"><div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #fbbf24; color: #000; padding: 8px 24px; border-radius: 20px; font-size: 14px; font-weight: 600;">POPULAR</div><h3 style="font-size: 32px; font-weight: 800; margin: 0 0 20px 0; color: #ffffff;">Premium</h3><div style="margin-bottom: 32px;"><span style="font-size: 56px; font-weight: 900; color: #ffffff;">$59</span><span style="font-size: 20px; color: rgba(255, 255, 255, 0.8);">/month</span></div><ul style="list-style: none; padding: 0; margin: 0 0 40px 0;"><li style="padding: 12px 0; color: rgba(255, 255, 255, 0.9); font-size: 18px;">✓ Everything in Pro</li><li style="padding: 12px 0; color: rgba(255, 255, 255, 0.9); font-size: 18px;">✓ Advanced Analytics</li><li style="padding: 12px 0; color: rgba(255, 255, 255, 0.9); font-size: 18px;">✓ Priority Support</li></ul><button style="width: 100%; padding: 20px; font-size: 20px; font-weight: 700; border-radius: 12px; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(20px); color: #ffffff; border: 2px solid rgba(255, 255, 255, 0.3); cursor: pointer;">Get Premium</button></div>'
                    ]
                ],
                'sort_order' => 104
            ],

            // ============================================
            // FEATURE SECTIONS
            // ============================================
            [
                'name' => 'Feature Grid',
                'type' => 'feature-grid',
                'component_type' => 'component',
                'category' => 'layout',
                'alphabet_group' => 'F',
                'description' => 'Feature grid made from section + div + heading + paragraph variants',
                'icon' => 'Grid',
                'default_props' => [
                    'title' => 'Features',
                    'subtitle' => 'Everything you need to succeed'
                ],
                'variants' => [
                    [
                        'name' => 'Default Feature Grid',
                        'description' => 'Standard 3-column feature grid',
                        'props' => ['title' => 'Features', 'subtitle' => 'Everything you need to succeed'],
                        'style' => [
                            'padding' => '80px 24px',
                            'backgroundColor' => '#f9fafb',
                            'textAlign' => 'center'
                        ],
                        'preview_code' => '<section style="padding: 80px 24px; background-color: #f9fafb; text-align: center;"><h2 style="font-size: 48px; font-weight: 700; margin: 0 0 16px 0;">Features</h2><p style="font-size: 20px; margin: 0 0 64px 0; color: #6b7280;">Everything you need to succeed</p><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; max-width: 1200px; margin: 0 auto;"><div style="padding: 32px; background: #ffffff; border-radius: 12px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><div style="width: 64px; height: 64px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">🚀</div><h3 style="font-size: 24px; font-weight: 600; margin: 0 0 12px 0;">Fast Performance</h3><p style="color: #6b7280; line-height: 1.6;">Lightning fast performance for your applications</p></div><div style="padding: 32px; background: #ffffff; border-radius: 12px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><div style="width: 64px; height: 64px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">🔒</div><h3 style="font-size: 24px; font-weight: 600; margin: 0 0 12px 0;">Secure & Safe</h3><p style="color: #6b7280; line-height: 1.6;">Enterprise-grade security you can trust</p></div><div style="padding: 32px; background: #ffffff; border-radius: 12px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><div style="width: 64px; height: 64px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">📱</div><h3 style="font-size: 24px; font-weight: 600; margin: 0 0 12px 0;">Mobile First</h3><p style="color: #6b7280; line-height: 1.6;">Responsive design that works everywhere</p></div></div></section>'
                    ]
                ],
                'sort_order' => 105
            ]
        ];

        // Create all component combinations
        foreach ($componentCombinations as $component) {
            Component::create($component);
        }
        
        $this->command->info('✅ Created component combinations made from element variants');
    }
}