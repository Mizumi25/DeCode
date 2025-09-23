<?php
// database/seeders/EcommerceMarketingSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class EcommerceMarketingSeeder extends Seeder
{
    public function run(): void
    {
        $ecommerceComponents = [
            [
                'name' => 'Product Card',
                'type' => 'product-card',
                'component_type' => 'component',
                'category' => 'ecommerce',
                'alphabet_group' => 'P',
                'description' => 'Product showcase card with price and actions',
                'icon' => 'ShoppingBag',
                'default_props' => [
                    'image' => 'https://via.placeholder.com/300x300/3b82f6/ffffff?text=Product',
                    'name' => 'Product Name',
                    'price' => '$99.99',
                    'originalPrice' => null,
                    'rating' => 4.5,
                    'reviews' => 128,
                    'inStock' => true,
                    'badge' => null
                ],
                'prop_definitions' => [
                    'image' => ['type' => 'string', 'label' => 'Product Image'],
                    'name' => ['type' => 'string', 'label' => 'Product Name'],
                    'price' => ['type' => 'string', 'label' => 'Current Price'],
                    'rating' => ['type' => 'number', 'label' => 'Rating', 'default' => 0],
                    'inStock' => ['type' => 'boolean', 'label' => 'In Stock', 'default' => true]
                ],
                'render_template' => 'product-card-template',
                'code_generators' => ['react-tailwind' => 'templates/ecommerce/product-card.js'],
                'variants' => [
                    [
                        'name' => 'Sale Product',
                        'description' => 'Product card with sale badge',
                        'props' => ['originalPrice' => '$149.99', 'badge' => 'SALE'],
                        'preview_code' => '<div class="bg-white rounded-xl shadow-lg overflow-hidden max-w-sm"><div class="relative"><img class="w-full h-48 object-cover" src="https://via.placeholder.com/300x200/10b981/ffffff?text=Product" /><div class="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">SALE</div></div><div class="p-4"><h3 class="font-semibold text-gray-900 mb-2">Premium Product</h3><div class="flex items-center mb-2"><div class="flex text-yellow-400">★★★★★</div><span class="text-sm text-gray-600 ml-1">(4.8)</span></div><div class="flex items-center justify-between"><div><span class="text-lg font-bold text-gray-900">$99.99</span><span class="text-sm text-gray-500 line-through ml-2">$149.99</span></div></div></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 1
            ],
            [
                'name' => 'Shopping Cart',
                'type' => 'shopping-cart',
                'component_type' => 'component',
                'category' => 'ecommerce',
                'alphabet_group' => 'S',
                'description' => 'Shopping cart with items and checkout',
                'icon' => 'ShoppingCart',
                'default_props' => [
                    'items' => [
                        ['id' => 1, 'name' => 'Product 1', 'price' => 29.99, 'quantity' => 2],
                        ['id' => 2, 'name' => 'Product 2', 'price' => 49.99, 'quantity' => 1]
                    ],
                    'showQuantity' => true,
                    'showRemove' => true,
                    'showCheckout' => true
                ],
                'prop_definitions' => [
                    'showQuantity' => ['type' => 'boolean', 'label' => 'Show Quantity Controls', 'default' => true],
                    'showRemove' => ['type' => 'boolean', 'label' => 'Show Remove Button', 'default' => true],
                    'showCheckout' => ['type' => 'boolean', 'label' => 'Show Checkout Button', 'default' => true]
                ],
                'render_template' => 'shopping-cart-template',
                'code_generators' => ['react-tailwind' => 'templates/ecommerce/shopping-cart.js'],
                'variants' => [],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 2
            ],
            [
                'name' => 'Pricing Table',
                'type' => 'pricing-table',
                'component_type' => 'component',
                'category' => 'ecommerce',
                'alphabet_group' => 'P',
                'description' => 'Subscription pricing plans comparison',
                'icon' => 'CreditCard',
                'default_props' => [
                    'plans' => [
                        ['name' => 'Basic', 'price' => '$9', 'period' => 'month', 'features' => ['1 Project', '5GB Storage', 'Email Support']],
                        ['name' => 'Pro', 'price' => '$29', 'period' => 'month', 'features' => ['10 Projects', '100GB Storage', 'Priority Support'], 'popular' => true],
                        ['name' => 'Enterprise', 'price' => '$99', 'period' => 'month', 'features' => ['Unlimited Projects', '1TB Storage', '24/7 Support']]
                    ],
                    'showAnnualToggle' => true
                ],
                'prop_definitions' => [
                    'showAnnualToggle' => ['type' => 'boolean', 'label' => 'Show Annual Toggle', 'default' => true]
                ],
                'render_template' => 'pricing-table-template',
                'code_generators' => ['react-tailwind' => 'templates/ecommerce/pricing-table.js'],
                'variants' => [
                    [
                        'name' => 'SaaS Pricing',
                        'description' => 'SaaS-style pricing table',
                        'props' => ['style' => 'saas', 'showFeatureComparison' => true],
                        'preview_code' => '<div class="grid grid-cols-3 gap-6 max-w-6xl"><div class="bg-white rounded-2xl border border-gray-200 p-8 relative"><h3 class="text-xl font-bold mb-4">Starter</h3><div class="mb-6"><span class="text-4xl font-bold">$19</span><span class="text-gray-600">/month</span></div><ul class="space-y-3 mb-8"><li class="flex items-center"><svg class="w-5 h-5 text-green-500 mr-3"><path d="M9 12l2 2 4-4"/></svg>5 Projects</li><li class="flex items-center"><svg class="w-5 h-5 text-green-500 mr-3"><path d="M9 12l2 2 4-4"/></svg>10GB Storage</li></ul><button class="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold">Get Started</button></div><div class="bg-white rounded-2xl border-2 border-blue-500 p-8 relative transform scale-105"><div class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</div><h3 class="text-xl font-bold mb-4">Pro</h3><div class="mb-6"><span class="text-4xl font-bold">$49</span><span class="text-gray-600">/month</span></div><ul class="space-y-3 mb-8"><li class="flex items-center"><svg class="w-5 h-5 text-green-500 mr-3"><path d="M9 12l2 2 4-4"/></svg>50 Projects</li><li class="flex items-center"><svg class="w-5 h-5 text-green-500 mr-3"><path d="M9 12l2 2 4-4"/></svg>100GB Storage</li></ul><button class="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold">Get Started</button></div><div class="bg-white rounded-2xl border border-gray-200 p-8 relative"><h3 class="text-xl font-bold mb-4">Enterprise</h3><div class="mb-6"><span class="text-4xl font-bold">$99</span><span class="text-gray-600">/month</span></div><ul class="space-y-3 mb-8"><li class="flex items-center"><svg class="w-5 h-5 text-green-500 mr-3"><path d="M9 12l2 2 4-4"/></svg>Unlimited</li><li class="flex items-center"><svg class="w-5 h-5 text-green-500 mr-3"><path d="M9 12l2 2 4-4"/></svg>1TB Storage</li></ul><button class="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold">Contact Sales</button></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 3
            ],
            [
                'name' => 'Testimonial',
                'type' => 'testimonial',
                'component_type' => 'component',
                'category' => 'marketing',
                'alphabet_group' => 'T',
                'description' => 'Customer testimonial with avatar and rating',
                'icon' => 'MessageCircle',
                'default_props' => [
                    'quote' => 'This product has completely transformed how we work. Highly recommend!',
                    'author' => 'John Smith',
                    'title' => 'CEO, Tech Corp',
                    'avatar' => 'https://via.placeholder.com/64/3b82f6/ffffff?text=JS',
                    'rating' => 5,
                    'layout' => 'card'
                ],
                'prop_definitions' => [
                    'quote' => ['type' => 'textarea', 'label' => 'Quote'],
                    'author' => ['type' => 'string', 'label' => 'Author Name'],
                    'title' => ['type' => 'string', 'label' => 'Author Title'],
                    'rating' => ['type' => 'number', 'label' => 'Rating', 'default' => 5],
                    'layout' => ['type' => 'select', 'label' => 'Layout', 'options' => ['card', 'minimal', 'featured'], 'default' => 'card']
                ],
                'render_template' => 'testimonial-template',
                'code_generators' => ['react-tailwind' => 'templates/marketing/testimonial.js'],
                'variants' => [
                    [
                        'name' => 'Video Testimonial',
                        'description' => 'Testimonial with video background',
                        'props' => ['layout' => 'video', 'videoUrl' => 'https://example.com/video.mp4'],
                        'preview_code' => '<div class="relative bg-black rounded-2xl overflow-hidden"><div class="aspect-video bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center"><div class="text-center text-white p-8"><div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"><svg class="w-6 h-6"><path fill="currentColor" d="M8 5v14l11-7z"/></svg></div><blockquote class="text-lg mb-4">"Amazing results in just 30 days!"</blockquote><cite class="text-sm opacity-80">Sarah Johnson, Marketing Director</cite></div></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 4
            ],
            [
                'name' => 'CTA Banner',
                'type' => 'cta-banner',
                'component_type' => 'component',
                'category' => 'marketing',
                'alphabet_group' => 'C',
                'description' => 'Call-to-action banner with urgency elements',
                'icon' => 'Megaphone',
                'default_props' => [
                    'title' => 'Limited Time Offer!',
                    'subtitle' => 'Get 50% off your first month',
                    'buttonText' => 'Claim Offer',
                    'urgencyText' => 'Offer expires in 24 hours',
                    'style' => 'gradient'
                ],
                'prop_definitions' => [
                    'title' => ['type' => 'string', 'label' => 'Main Title'],
                    'subtitle' => ['type' => 'string', 'label' => 'Subtitle'],
                    'buttonText' => ['type' => 'string', 'label' => 'Button Text'],
                    'style' => ['type' => 'select', 'label' => 'Style', 'options' => ['gradient', 'solid', 'minimal'], 'default' => 'gradient']
                ],
                'render_template' => 'cta-banner-template',
                'code_generators' => ['react-tailwind' => 'templates/marketing/cta-banner.js'],
                'variants' => [
                    [
                        'name' => 'Email Signup',
                        'description' => 'Newsletter signup CTA',
                        'props' => ['variant' => 'newsletter', 'showEmailInput' => true],
                        'preview_code' => '<div class="bg-gradient-to-r from-pink-500 to-violet-600 rounded-2xl p-8 text-white text-center"><h3 class="text-2xl font-bold mb-2">Stay in the loop</h3><p class="mb-6 opacity-90">Get the latest updates and exclusive offers</p><div class="flex max-w-md mx-auto gap-3"><input class="flex-1 px-4 py-3 rounded-lg text-gray-900" placeholder="Enter your email" /><button class="bg-white text-violet-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Subscribe</button></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 5
            ],
            [
                'name' => 'Feature Grid',
                'type' => 'feature-grid',
                'component_type' => 'component',
                'category' => 'marketing',
                'alphabet_group' => 'F',
                'description' => 'Grid of features with icons and descriptions',
                'icon' => 'Grid3X3',
                'default_props' => [
                    'features' => [
                        ['icon' => 'Zap', 'title' => 'Lightning Fast', 'description' => 'Optimized for speed and performance'],
                        ['icon' => 'Shield', 'title' => 'Secure', 'description' => 'Enterprise-grade security built-in'],
                        ['icon' => 'Users', 'title' => 'Team Collaboration', 'description' => 'Work together seamlessly']
                    ],
                    'columns' => 3,
                    'showIcons' => true
                ],
                'prop_definitions' => [
                    'columns' => ['type' => 'number', 'label' => 'Columns', 'default' => 3],
                    'showIcons' => ['type' => 'boolean', 'label' => 'Show Icons', 'default' => true]
                ],
                'render_template' => 'feature-grid-template',
                'code_generators' => ['react-tailwind' => 'templates/marketing/feature-grid.js'],
                'variants' => [],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 6
            ],
            [
                'name' => 'Countdown Timer',
                'type' => 'countdown-timer',
                'component_type' => 'component',
                'category' => 'marketing',
                'alphabet_group' => 'C',
                'description' => 'Countdown timer for sales and events',
                'icon' => 'Clock',
                'default_props' => [
                    'targetDate' => '2024-12-31T23:59:59',
                    'format' => 'dhms',
                    'size' => 'large',
                    'showLabels' => true
                ],
                'prop_definitions' => [
                    'targetDate' => ['type' => 'datetime', 'label' => 'Target Date'],
                    'format' => ['type' => 'select', 'label' => 'Format', 'options' => ['dhms', 'hms', 'ms'], 'default' => 'dhms'],
                    'size' => ['type' => 'select', 'label' => 'Size', 'options' => ['small', 'medium', 'large'], 'default' => 'large']
                ],
                'render_template' => 'countdown-timer-template',
                'code_generators' => ['react-countdown' => 'templates/marketing/countdown-timer.js'],
                'variants' => [
                    [
                        'name' => 'Sale Countdown',
                        'description' => 'Urgent sale countdown with effects',
                        'props' => ['style' => 'urgent', 'showProgress' => true],
                        'preview_code' => '<div class="bg-red-600 text-white p-6 rounded-xl text-center"><h3 class="text-lg font-bold mb-4">⚡ FLASH SALE ENDS IN:</h3><div class="grid grid-cols-4 gap-4 max-w-md mx-auto"><div class="bg-white/20 rounded-lg p-3"><div class="text-2xl font-bold">05</div><div class="text-sm opacity-80">Days</div></div><div class="bg-white/20 rounded-lg p-3"><div class="text-2xl font-bold">12</div><div class="text-sm opacity-80">Hours</div></div><div class="bg-white/20 rounded-lg p-3"><div class="text-2xl font-bold">34</div><div class="text-sm opacity-80">Minutes</div></div><div class="bg-white/20 rounded-lg p-3"><div class="text-2xl font-bold animate-pulse">56</div><div class="text-sm opacity-80">Seconds</div></div></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'javascript',
                'sort_order' => 7
            ]
        ];

        foreach ($ecommerceComponents as $component) {
            Component::create($component);
        }
    }
}