<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class ModernUIElementsSeeder extends Seeder
{
    public function run(): void
    {
        $modernElements = [
            // ============================================
            // BUTTONS (10 VARIANTS)
            // ============================================
            [
                'name' => 'Modern Button',
                'type' => 'mod-modern-button',
                'component_type' => 'element',
                'category' => 'buttons',
                'alphabet_group' => 'B',
                'description' => 'Modern button with 10 beautiful variants',
                'icon' => 'Square',
                'default_props' => [
                    'content' => 'Button',
                    'disabled' => false,
                    'type' => 'mod-button',
                ],
                'prop_definitions' => [
                    'content' => ['type' => 'textarea', 'label' => 'Button Text', 'default' => 'Button'],
                    'disabled' => ['type' => 'boolean', 'label' => 'Disabled', 'default' => false],
                    'type' => ['type' => 'select', 'label' => 'Type', 'options' => ['button', 'submit', 'reset'], 'default' => 'button'],
                ],
                'render_template' => 'button-template',
                'code_generators' => ['react-tailwind' => 'templates/interactive/button.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default button',
                        'props' => ['content' => 'Button'],
                        'style' => [
                            'padding' => '8px 16px',
                            'fontSize' => '14px',
                            'border' => '1px solid #d1d5db',
                            'borderRadius' => '4px',
                            'background' => '#ffffff',
                            'color' => '#111827',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button style="padding: 8px 16px; font-size: 14px; border: 1px solid #d1d5db; border-radius: 4px; background: #ffffff; color: #111827; cursor: pointer;">Button</button>'
                    ],
                    [
                        'name' => 'Apple Solid',
                        'description' => 'Clean Apple-style solid button',
                        'props' => ['content' => 'Continue'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '14px 28px',
                            'fontSize' => '15px',
                            'fontWeight' => '600',
                            'borderRadius' => '12px',
                            'background' => '#000000',
                            'color' => '#ffffff',
                            'border' => 'none',
                            'transition' => 'all 0.2s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button style="display: inline-flex; align-items: center; justify-content: center; padding: 14px 28px; font-size: 15px; font-weight: 600; border-radius: 12px; background: #000000; color: #ffffff; border: none; transition: all 0.2s ease; cursor: pointer;">Continue</button>'
                    ],
                    [
                        'name' => 'Blue Gradient',
                        'description' => 'Modern blue gradient',
                        'props' => ['content' => 'Get Started'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '14px 32px',
                            'fontSize' => '15px',
                            'fontWeight' => '600',
                            'borderRadius' => '12px',
                            'background' => 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            'color' => '#ffffff',
                            'border' => 'none',
                            'boxShadow' => '0 4px 16px rgba(59, 130, 246, 0.3)',
                            'transition' => 'all 0.3s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button style="display: inline-flex; align-items: center; justify-content: center; padding: 14px 32px; font-size: 15px; font-weight: 600; border-radius: 12px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; border: none; box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3); transition: all 0.3s ease; cursor: pointer;">Get Started</button>'
                    ],
                    [
                        'name' => 'Purple Glow',
                        'description' => 'Purple with glow effect',
                        'props' => ['content' => 'Explore'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '14px 32px',
                            'fontSize' => '15px',
                            'fontWeight' => '600',
                            'borderRadius' => '12px',
                            'background' => 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                            'color' => '#ffffff',
                            'border' => 'none',
                            'boxShadow' => '0 0 24px rgba(139, 92, 246, 0.5)',
                            'transition' => 'all 0.3s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button style="display: inline-flex; align-items: center; justify-content: center; padding: 14px 32px; font-size: 15px; font-weight: 600; border-radius: 12px; background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: #ffffff; border: none; box-shadow: 0 0 24px rgba(139, 92, 246, 0.5); transition: all 0.3s ease; cursor: pointer;">Explore</button>'
                    ],
                    [
                        'name' => 'Ghost',
                        'description' => 'Transparent with border',
                        'props' => ['content' => 'Learn More'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '14px 28px',
                            'fontSize' => '15px',
                            'fontWeight' => '500',
                            'borderRadius' => '12px',
                            'background' => 'transparent',
                            'color' => '#111827',
                            'border' => '2px solid #e5e7eb',
                            'transition' => 'all 0.2s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button style="display: inline-flex; align-items: center; justify-content: center; padding: 14px 28px; font-size: 15px; font-weight: 500; border-radius: 12px; background: transparent; color: #111827; border: 2px solid #e5e7eb; transition: all 0.2s ease; cursor: pointer;">Learn More</button>'
                    ],
                    [
                        'name' => 'Glass Morphism',
                        'description' => 'Frosted glass effect',
                        'props' => ['content' => 'Sign Up'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '14px 28px',
                            'fontSize' => '15px',
                            'fontWeight' => '500',
                            'borderRadius' => '12px',
                            'background' => 'rgba(255, 255, 255, 0.1)',
                            'backdropFilter' => 'blur(20px)',
                            'color' => '#ffffff',
                            'border' => '1px solid rgba(255, 255, 255, 0.2)',
                            'boxShadow' => '0 8px 32px rgba(0, 0, 0, 0.1)',
                            'transition' => 'all 0.3s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button style="display: inline-flex; align-items: center; justify-content: center; padding: 14px 28px; font-size: 15px; font-weight: 500; border-radius: 12px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; cursor: pointer;">Sign Up</button>'
                    ],
                    [
                        'name' => 'Minimal Text',
                        'description' => 'Clean text-only button',
                        'props' => ['content' => 'Skip'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '8px 16px',
                            'fontSize' => '14px',
                            'fontWeight' => '500',
                            'borderRadius' => '8px',
                            'background' => 'transparent',
                            'color' => '#6b7280',
                            'border' => 'none',
                            'transition' => 'all 0.2s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button style="display: inline-flex; align-items: center; justify-content: center; padding: 8px 16px; font-size: 14px; font-weight: 500; border-radius: 8px; background: transparent; color: #6b7280; border: none; transition: all 0.2s ease; cursor: pointer;">Skip</button>'
                    ],
                    [
                        'name' => 'Pill Solid',
                        'description' => 'Fully rounded pill button',
                        'props' => ['content' => 'Subscribe'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '12px 32px',
                            'fontSize' => '14px',
                            'fontWeight' => '600',
                            'borderRadius' => '9999px',
                            'background' => 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                            'color' => '#ffffff',
                            'border' => 'none',
                            'boxShadow' => '0 4px 14px rgba(236, 72, 153, 0.4)',
                            'transition' => 'all 0.2s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button style="display: inline-flex; align-items: center; justify-content: center; padding: 12px 32px; font-size: 14px; font-weight: 600; border-radius: 9999px; background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); color: #ffffff; border: none; box-shadow: 0 4px 14px rgba(236, 72, 153, 0.4); transition: all 0.2s ease; cursor: pointer;">Subscribe</button>'
                    ],
                    [
                        'name' => 'Soft Shadow',
                        'description' => 'Subtle elevated look',
                        'props' => ['content' => 'Contact'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'padding' => '14px 28px',
                            'fontSize' => '15px',
                            'fontWeight' => '500',
                            'borderRadius' => '12px',
                            'background' => '#ffffff',
                            'color' => '#111827',
                            'border' => 'none',
                            'boxShadow' => '0 4px 24px rgba(0, 0, 0, 0.08)',
                            'transition' => 'all 0.2s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button style="display: inline-flex; align-items: center; justify-content: center; padding: 14px 28px; font-size: 15px; font-weight: 500; border-radius: 12px; background: #ffffff; color: #111827; border: none; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); transition: all 0.2s ease; cursor: pointer;">Contact</button>'
                    ],
                    [
                        'name' => 'Icon Button',
                        'description' => 'Circular icon button',
                        'props' => ['content' => '→'],
                        'style' => [
                            'display' => 'inline-flex',
                            'alignItems' => 'center',
                            'justifyContent' => 'center',
                            'width' => '48px',
                            'height' => '48px',
                            'fontSize' => '20px',
                            'fontWeight' => '600',
                            'borderRadius' => '50%',
                            'background' => '#000000',
                            'color' => '#ffffff',
                            'border' => 'none',
                            'transition' => 'all 0.2s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<button style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; font-size: 20px; font-weight: 600; border-radius: 50%; background: #000000; color: #ffffff; border: none; transition: all 0.2s ease; cursor: pointer;">→</button>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 100
            ],

            // ============================================
            // CARD
            // ============================================
            [
                'name' => 'Card',
                'type' => 'mod-card',
                'component_type' => 'element',
                'category' => 'cards',
                'alphabet_group' => 'C',
                'description' => 'Modern card component with variants',
                'icon' => 'Square',
                'default_props' => [
                    'title' => 'Card Title',
                    'description' => 'Card description',
                ],
                'prop_definitions' => [
                    'title' => ['type' => 'string', 'label' => 'Title', 'default' => 'Card Title'],
                    'description' => ['type' => 'textarea', 'label' => 'Description', 'default' => 'Card description'],
                ],
                'render_template' => 'card-template',
                'code_generators' => ['react-tailwind' => 'templates/display/card.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Basic card',
                        'props' => ['title' => 'Title', 'description' => 'Description'],
                        'style' => [
                            'padding' => '16px',
                            'border' => '1px solid #e5e7eb',
                            'borderRadius' => '8px',
                            'background' => '#ffffff',
                        ],
                        'preview_code' => '<div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #ffffff;"><div style="font-weight: 600; margin-bottom: 8px;">Title</div><div style="font-size: 14px; color: #6b7280;">Description</div></div>'
                    ],
                    [
                        'name' => 'Elevated',
                        'description' => 'Card with shadow',
                        'props' => ['title' => 'Featured', 'description' => 'This is a featured card'],
                        'style' => [
                            'padding' => '24px',
                            'borderRadius' => '16px',
                            'background' => '#ffffff',
                            'boxShadow' => '0 4px 24px rgba(0, 0, 0, 0.08)',
                        ],
                        'preview_code' => '<div style="padding: 24px; border-radius: 16px; background: #ffffff; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);"><div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Featured</div><div style="font-size: 14px; color: #6b7280;">This is a featured card</div></div>'
                    ],
                    [
                        'name' => 'Glass',
                        'description' => 'Glassmorphism card',
                        'props' => ['title' => 'Glass Card', 'description' => 'Frosted glass effect'],
                        'style' => [
                            'padding' => '24px',
                            'borderRadius' => '16px',
                            'background' => 'rgba(255, 255, 255, 0.1)',
                            'backdropFilter' => 'blur(20px)',
                            'border' => '1px solid rgba(255, 255, 255, 0.2)',
                            'color' => '#ffffff',
                        ],
                        'preview_code' => '<div style="padding: 24px; border-radius: 16px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); color: #ffffff;"><div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Glass Card</div><div style="font-size: 14px; opacity: 0.8;">Frosted glass effect</div></div>'
                    ],
                    [
                        'name' => 'Gradient Border',
                        'description' => 'Card with gradient border',
                        'props' => ['title' => 'Premium', 'description' => 'Premium content'],
                        'style' => [
                            'padding' => '24px',
                            'borderRadius' => '16px',
                            'background' => '#ffffff',
                            'position' => 'relative',
                            'border' => '2px solid transparent',
                            'backgroundClip' => 'padding-box',
                            'boxShadow' => '0 0 0 2px transparent, 0 0 0 4px transparent',
                            'backgroundImage' => 'linear-gradient(white, white), linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            'backgroundOrigin' => 'border-box',
                        ],
                        'preview_code' => '<div style="padding: 24px; border-radius: 16px; background: #ffffff; border: 2px solid; border-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1;"><div style="font-size: 18px; font-weight: 600; margin-bottom: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Premium</div><div style="font-size: 14px; color: #6b7280;">Premium content</div></div>'
                    ],
                    [
                        'name' => 'Hover Lift',
                        'description' => 'Card with hover effect',
                        'props' => ['title' => 'Interactive', 'description' => 'Hover to see effect'],
                        'style' => [
                            'padding' => '24px',
                            'borderRadius' => '16px',
                            'background' => '#ffffff',
                            'border' => '1px solid #e5e7eb',
                            'transition' => 'all 0.3s ease',
                            'cursor' => 'pointer',
                        ],
                        'preview_code' => '<div style="padding: 24px; border-radius: 16px; background: #ffffff; border: 1px solid #e5e7eb; transition: all 0.3s ease; cursor: pointer;"><div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Interactive</div><div style="font-size: 14px; color: #6b7280;">Hover to see effect</div></div>'
                    ],
                    [
                        'name' => 'Minimal',
                        'description' => 'Clean minimal card',
                        'props' => ['title' => 'Simple', 'description' => 'Less is more'],
                        'style' => [
                            'padding' => '20px',
                            'borderRadius' => '12px',
                            'background' => '#f9fafb',
                            'border' => 'none',
                        ],
                        'preview_code' => '<div style="padding: 20px; border-radius: 12px; background: #f9fafb; border: none;"><div style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #111827;">Simple</div><div style="font-size: 14px; color: #6b7280;">Less is more</div></div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 101
            ],

            // ============================================
            // ALERT
            // ============================================
            [
                'name' => 'Alert',
                'type' => 'mod-alert',
                'component_type' => 'element',
                'category' => 'feedback',
                'alphabet_group' => 'A',
                'description' => 'Alert notification component',
                'icon' => 'Sparkles',
                'default_props' => [
                    'message' => 'Alert message',
                    'type' => 'mod-info',
                ],
                'prop_definitions' => [
                    'message' => ['type' => 'textarea', 'label' => 'Message', 'default' => 'Alert message'],
                    'type' => ['type' => 'select', 'label' => 'Type', 'options' => ['info', 'success', 'warning', 'error'], 'default' => 'info'],
                ],
                'render_template' => 'alert-template',
                'code_generators' => ['react-tailwind' => 'templates/feedback/alert.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Basic alert',
                        'props' => ['message' => 'Alert', 'type' => 'info'],
                        'style' => [
                            'padding' => '12px 16px',
                            'border' => '1px solid #e5e7eb',
                            'borderRadius' => '8px',
                            'background' => '#f9fafb',
                            'color' => '#111827',
                        ],
                        'preview_code' => '<div style="padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb; color: #111827; font-size: 14px;">Alert</div>'
                    ],
                    [
                        'name' => 'Success',
                        'description' => 'Success alert',
                        'props' => ['message' => 'Success!', 'type' => 'success'],
                        'style' => [
                            'padding' => '12px 16px',
                            'borderRadius' => '12px',
                            'background' => '#d1fae5',
                            'color' => '#065f46',
                            'border' => '1px solid #6ee7b7',
                        ],
                        'preview_code' => '<div style="padding: 12px 16px; border-radius: 12px; background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; font-size: 14px; font-weight: 500;">✓ Success!</div>'
                    ],
                    [
                        'name' => 'Warning',
                        'description' => 'Warning alert',
                        'props' => ['message' => 'Warning', 'type' => 'warning'],
                        'style' => [
                            'padding' => '12px 16px',
                            'borderRadius' => '12px',
                            'background' => '#fef3c7',
                            'color' => '#92400e',
                            'border' => '1px solid #fcd34d',
                        ],
                        'preview_code' => '<div style="padding: 12px 16px; border-radius: 12px; background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; font-size: 14px; font-weight: 500;">⚠ Warning</div>'
                    ],
                    [
                        'name' => 'Error',
                        'description' => 'Error alert',
                        'props' => ['message' => 'Error', 'type' => 'error'],
                        'style' => [
                            'padding' => '12px 16px',
                            'borderRadius' => '12px',
                            'background' => '#fee2e2',
                            'color' => '#991b1b',
                            'border' => '1px solid #fca5a5',
                        ],
                        'preview_code' => '<div style="padding: 12px 16px; border-radius: 12px; background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; font-size: 14px; font-weight: 500;">✕ Error</div>'
                    ],
                    [
                        'name' => 'Info Gradient',
                        'description' => 'Info with gradient',
                        'props' => ['message' => 'Info', 'type' => 'info'],
                        'style' => [
                            'padding' => '12px 16px',
                            'borderRadius' => '12px',
                            'background' => 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                            'color' => '#1e40af',
                            'border' => 'none',
                        ],
                        'preview_code' => '<div style="padding: 12px 16px; border-radius: 12px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #1e40af; border: none; font-size: 14px; font-weight: 500;">ℹ Info</div>'
                    ],
                    [
                        'name' => 'Solid Dark',
                        'description' => 'Dark solid alert',
                        'props' => ['message' => 'Notification', 'type' => 'info'],
                        'style' => [
                            'padding' => '12px 16px',
                            'borderRadius' => '12px',
                            'background' => '#1f2937',
                            'color' => '#ffffff',
                            'border' => 'none',
                        ],
                        'preview_code' => '<div style="padding: 12px 16px; border-radius: 12px; background: #1f2937; color: #ffffff; border: none; font-size: 14px;">Notification</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 102
            ],

            // ============================================
            // TOAST
            // ============================================
            [
                'name' => 'Toast',
                'type' => 'mod-toast',
                'component_type' => 'element',
                'category' => 'feedback',
                'alphabet_group' => 'T',
                'description' => 'Toast notification',
                'icon' => 'Sparkles',
                'default_props' => [
                    'message' => 'Toast message',
                ],
                'prop_definitions' => [
                    'message' => ['type' => 'textarea', 'label' => 'Message', 'default' => 'Toast message'],
                ],
                'render_template' => 'toast-template',
                'code_generators' => ['react-tailwind' => 'templates/feedback/toast.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Basic toast',
                        'props' => ['message' => 'Toast'],
                        'style' => [
                            'padding' => '12px 16px',
                            'borderRadius' => '8px',
                            'background' => '#ffffff',
                            'border' => '1px solid #e5e7eb',
                            'boxShadow' => '0 4px 12px rgba(0, 0, 0, 0.1)',
                        ],
                        'preview_code' => '<div style="padding: 12px 16px; border-radius: 8px; background: #ffffff; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); font-size: 14px;">Toast</div>'
                    ],
                    [
                        'name' => 'Success Toast',
                        'description' => 'Success notification',
                        'props' => ['message' => 'Saved!'],
                        'style' => [
                            'padding' => '12px 16px',
                            'borderRadius' => '12px',
                            'background' => '#10b981',
                            'color' => '#ffffff',
                            'boxShadow' => '0 4px 16px rgba(16, 185, 129, 0.4)',
                        ],
                        'preview_code' => '<div style="padding: 12px 16px; border-radius: 12px; background: #10b981; color: #ffffff; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4); font-size: 14px; font-weight: 500;">✓ Saved!</div>'
                    ],
                    [
                        'name' => 'Dark Toast',
                        'description' => 'Dark theme toast',
                        'props' => ['message' => 'Notification'],
                        'style' => [
                            'padding' => '12px 20px',
                            'borderRadius' => '12px',
                            'background' => '#1f2937',
                            'color' => '#ffffff',
                            'boxShadow' => '0 8px 24px rgba(0, 0, 0, 0.3)',
                        ],
                        'preview_code' => '<div style="padding: 12px 20px; border-radius: 12px; background: #1f2937; color: #ffffff; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3); font-size: 14px;">Notification</div>'
                    ],
                    [
                        'name' => 'Glass Toast',
                        'description' => 'Glassmorphism toast',
                        'props' => ['message' => 'Update available'],
                        'style' => [
                            'padding' => '12px 20px',
                            'borderRadius' => '12px',
                            'background' => 'rgba(255, 255, 255, 0.1)',
                            'backdropFilter' => 'blur(20px)',
                            'border' => '1px solid rgba(255, 255, 255, 0.2)',
                            'color' => '#ffffff',
                        ],
                        'preview_code' => '<div style="padding: 12px 20px; border-radius: 12px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); color: #ffffff; font-size: 14px;">Update available</div>'
                    ],
                    [
                        'name' => 'Gradient Toast',
                        'description' => 'Colorful gradient',
                        'props' => ['message' => 'New message'],
                        'style' => [
                            'padding' => '12px 20px',
                            'borderRadius' => '12px',
                            'background' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            'color' => '#ffffff',
                            'boxShadow' => '0 4px 16px rgba(102, 126, 234, 0.4)',
                        ],
                        'preview_code' => '<div style="padding: 12px 20px; border-radius: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4); font-size: 14px; font-weight: 500;">New message</div>'
                    ],
                    [
                        'name' => 'Minimal Toast',
                        'description' => 'Clean minimal',
                        'props' => ['message' => 'Done'],
                        'style' => [
                            'padding' => '10px 16px',
                            'borderRadius' => '8px',
                            'background' => '#f9fafb',
                            'color' => '#111827',
                            'border' => 'none',
                        ],
                        'preview_code' => '<div style="padding: 10px 16px; border-radius: 8px; background: #f9fafb; color: #111827; border: none; font-size: 13px;">Done</div>'
                    ],
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 103
            ],

            // ============================================
            // PROGRESS BAR
            // ============================================
            [
                'name' => 'Progress Bar',
                'type' => 'mod-progress',
                'component_type' => 'element',
                'category' => 'data',
                'alphabet_group' => 'P',
                'description' => 'Progress bar indicator',
                'icon' => 'Layout',
                'default_props' => [
                    'value' => 50,
                    'max' => 100,
                ],
                'prop_definitions' => [
                    'value' => ['type' => 'number', 'label' => 'Value', 'default' => 50, 'min' => 0, 'max' => 100],
                    'max' => ['type' => 'number', 'label' => 'Max', 'default' => 100],
                ],
                'render_template' => 'progress-template',
                'code_generators' => ['react-tailwind' => 'templates/data/progress.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Basic progress bar',
                        'props' => ['value' => 50, 'max' => 100],
                        'style' => [
                            'width' => '100%',
                            'height' => '8px',
                            'background' => '#e5e7eb',
                            'borderRadius' => '4px',
                            'overflow' => 'hidden',
                        ],
                        'preview_code' => '<div style="width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;"><div style="width: 50%; height: 100%; background: #3b82f6;"></div></div>'
                    ],
                    [
                        'name' => 'Gradient',
                        'description' => 'Gradient progress',
                        'props' => ['value' => 70, 'max' => 100],
                        'style' => [
                            'width' => '100%',
                            'height' => '12px',
                            'background' => '#e5e7eb',
                            'borderRadius' => '6px',
                            'overflow' => 'hidden',
                        ],
                        'preview_code' => '<div style="width: 100%; height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden;"><div style="width: 70%; height: 100%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);"></div></div>'
                    ],
                    [
                        'name' => 'Striped',
                        'description' => 'Striped pattern',
                        'props' => ['value' => 60, 'max' => 100],
                        'style' => [
                            'width' => '100%',
                            'height' => '12px',
                            'background' => '#e5e7eb',
                            'borderRadius' => '6px',
                            'overflow' => 'hidden',
                        ],
                        'preview_code' => '<div style="width: 100%; height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden;"><div style="width: 60%; height: 100%; background: repeating-linear-gradient(45deg, #3b82f6, #3b82f6 10px, #60a5fa 10px, #60a5fa 20px);"></div></div>'
                    ],
                    [
                        'name' => 'Success',
                        'description' => 'Green success bar',
                        'props' => ['value' => 100, 'max' => 100],
                        'style' => [
                            'width' => '100%',
                            'height' => '10px',
                            'background' => '#d1fae5',
                            'borderRadius' => '5px',
                            'overflow' => 'hidden',
                        ],
                        'preview_code' => '<div style="width: 100%; height: 10px; background: #d1fae5; border-radius: 5px; overflow: hidden;"><div style="width: 100%; height: 100%; background: #10b981;"></div></div>'
                    ],
                    [
                        'name' => 'Thick',
                        'description' => 'Thick progress bar',
                        'props' => ['value' => 45, 'max' => 100],
                        'style' => [
                            'width' => '100%',
                            'height' => '20px',
                            'background' => '#f3f4f6',
                            'borderRadius' => '10px',
                            'overflow' => 'hidden',
                        ],
                        'preview_code' => '<div style="width: 100%; height: 20px; background: #f3f4f6; border-radius: 10px; overflow: hidden;"><div style="width: 45%; height: 100%; background: #6366f1; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px;"><span style="font-size: 11px; color: white; font-weight: 600;">45%</span></div></div>'
                    ],
                    [
                        'name' => 'Minimal',
                        'description' => 'Minimal thin bar',
                        'props' => ['value' => 80, 'max' => 100],
                        'style' => [
                            'width' => '100%',
                            'height' => '4px',
                            'background' => '#f3f4f6',
                            'borderRadius' => '2px',
                            'overflow' => 'hidden',
                        ],
                        'preview_code' => '<div style="width: 100%; height: 4px; background: #f3f4f6; border-radius: 2px; overflow: hidden;"><div style="width: 80%; height: 100%; background: #000000;"></div></div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 104
            ],

            // ============================================
            // CHECKBOX
            // ============================================
            [
                'name' => 'Checkbox',
                'type' => 'mod-checkbox',
                'component_type' => 'element',
                'category' => 'inputs',
                'alphabet_group' => 'C',
                'description' => 'Checkbox input element',
                'icon' => 'Square',
                'default_props' => [
                    'label' => 'Checkbox',
                    'checked' => false,
                ],
                'prop_definitions' => [
                    'label' => ['type' => 'string', 'label' => 'Label', 'default' => 'Checkbox'],
                    'checked' => ['type' => 'boolean', 'label' => 'Checked', 'default' => false],
                ],
                'render_template' => 'checkbox-template',
                'code_generators' => ['react-tailwind' => 'templates/form/checkbox.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Standard checkbox',
                        'props' => ['label' => 'Option', 'checked' => false],
                        'style' => [
                            'display' => 'flex',
                            'alignItems' => 'center',
                            'gap' => '8px',
                        ],
                        'preview_code' => '<label style="display: flex; align-items: center; gap: 8px; cursor: pointer;"><input type="checkbox" style="width: 16px; height: 16px; cursor: pointer;" /><span style="font-size: 14px; color: #111827;">Option</span></label>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger checkbox',
                        'props' => ['label' => 'I agree', 'checked' => false],
                        'style' => [
                            'display' => 'flex',
                            'alignItems' => 'center',
                            'gap' => '12px',
                        ],
                        'preview_code' => '<label style="display: flex; align-items: center; gap: 12px; cursor: pointer;"><input type="checkbox" style="width: 20px; height: 20px; cursor: pointer;" /><span style="font-size: 15px; color: #111827;">I agree</span></label>'
                    ],
                    [
                        'name' => 'Checked',
                        'description' => 'Pre-checked state',
                        'props' => ['label' => 'Selected', 'checked' => true],
                        'style' => [
                            'display' => 'flex',
                            'alignItems' => 'center',
                            'gap' => '8px',
                        ],
                        'preview_code' => '<label style="display: flex; align-items: center; gap: 8px; cursor: pointer;"><input type="checkbox" checked style="width: 18px; height: 18px; cursor: pointer; accent-color: #3b82f6;" /><span style="font-size: 14px; color: #111827; font-weight: 500;">Selected</span></label>'
                    ],
                    [
                        'name' => 'Success Color',
                        'description' => 'Green checkbox',
                        'props' => ['label' => 'Complete', 'checked' => true],
                        'style' => [
                            'display' => 'flex',
                            'alignItems' => 'center',
                            'gap' => '8px',
                        ],
                        'preview_code' => '<label style="display: flex; align-items: center; gap: 8px; cursor: pointer;"><input type="checkbox" checked style="width: 18px; height: 18px; cursor: pointer; accent-color: #10b981;" /><span style="font-size: 14px; color: #111827;">Complete</span></label>'
                    ],
                    [
                        'name' => 'Purple Color',
                        'description' => 'Purple checkbox',
                        'props' => ['label' => 'Premium', 'checked' => true],
                        'style' => [
                            'display' => 'flex',
                            'alignItems' => 'center',
                            'gap' => '8px',
                        ],
                        'preview_code' => '<label style="display: flex; align-items: center; gap: 8px; cursor: pointer;"><input type="checkbox" checked style="width: 18px; height: 18px; cursor: pointer; accent-color: #8b5cf6;" /><span style="font-size: 14px; color: #111827;">Premium</span></label>'
                    ],
                    [
                        'name' => 'Black Color',
                        'description' => 'Black checkbox',
                        'props' => ['label' => 'Dark mode', 'checked' => true],
                        'style' => [
                            'display' => 'flex',
                            'alignItems' => 'center',
                            'gap' => '8px',
                        ],
                        'preview_code' => '<label style="display: flex; align-items: center; gap: 8px; cursor: pointer;"><input type="checkbox" checked style="width: 18px; height: 18px; cursor: pointer; accent-color: #000000;" /><span style="font-size: 14px; color: #111827;">Dark mode</span></label>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 105
            ],

            // ============================================
            // RADIO BUTTON
            // ============================================
            [
                'name' => 'Radio Button',
                'type' => 'mod-radio',
                'component_type' => 'element',
                'category' => 'inputs',
                'alphabet_group' => 'R',
                'description' => 'Radio button input',
                'icon' => 'Square',
                'default_props' => ['content' => 'Radio Button'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Radio Button']],
                'render_template' => 'radio-template',
                'code_generators' => ['react-tailwind' => 'templates/inputs/radio.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Radio Button'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Radio Button</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Radio Button'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Radio Button</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Radio Button'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Radio Button</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Radio Button'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Radio Button</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Radio Button'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Radio Button</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Radio Button'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Radio Button</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 106
            ],
            // ============================================
            // TOGGLE SWITCH
            // ============================================
            [
                'name' => 'Toggle Switch',
                'type' => 'mod-toggle',
                'component_type' => 'element',
                'category' => 'inputs',
                'alphabet_group' => 'T',
                'description' => 'Toggle switch input',
                'icon' => 'Square',
                'default_props' => ['content' => 'Toggle Switch'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Toggle Switch']],
                'render_template' => 'toggle-template',
                'code_generators' => ['react-tailwind' => 'templates/inputs/toggle.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Toggle Switch'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Toggle Switch</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Toggle Switch'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Toggle Switch</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Toggle Switch'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Toggle Switch</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Toggle Switch'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Toggle Switch</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Toggle Switch'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Toggle Switch</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Toggle Switch'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Toggle Switch</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 107
            ],
            // ============================================
            // SELECT DROPDOWN
            // ============================================
            [
                'name' => 'Select Dropdown',
                'type' => 'mod-select',
                'component_type' => 'element',
                'category' => 'inputs',
                'alphabet_group' => 'S',
                'description' => 'Dropdown select input',
                'icon' => 'Square',
                'default_props' => ['content' => 'Select Dropdown'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Select Dropdown']],
                'render_template' => 'select-template',
                'code_generators' => ['react-tailwind' => 'templates/inputs/select.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Select Dropdown'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Select Dropdown</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Select Dropdown'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Select Dropdown</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Select Dropdown'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Select Dropdown</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Select Dropdown'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Select Dropdown</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Select Dropdown'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Select Dropdown</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Select Dropdown'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Select Dropdown</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 108
            ],
            // ============================================
            // RANGE SLIDER
            // ============================================
            [
                'name' => 'Range Slider',
                'type' => 'mod-range',
                'component_type' => 'element',
                'category' => 'inputs',
                'alphabet_group' => 'R',
                'description' => 'Range slider input',
                'icon' => 'Square',
                'default_props' => ['content' => 'Range Slider'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Range Slider']],
                'render_template' => 'range-template',
                'code_generators' => ['react-tailwind' => 'templates/inputs/range.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Range Slider'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Range Slider</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Range Slider'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Range Slider</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Range Slider'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Range Slider</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Range Slider'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Range Slider</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Range Slider'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Range Slider</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Range Slider'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Range Slider</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 109
            ],
            // ============================================
            // SEARCH INPUT
            // ============================================
            [
                'name' => 'Search Input',
                'type' => 'mod-search',
                'component_type' => 'element',
                'category' => 'inputs',
                'alphabet_group' => 'S',
                'description' => 'Search input field',
                'icon' => 'Search',
                'default_props' => ['content' => 'Search Input'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Search Input']],
                'render_template' => 'search-template',
                'code_generators' => ['react-tailwind' => 'templates/inputs/search.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Search Input'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Search Input</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Search Input'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Search Input</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Search Input'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Search Input</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Search Input'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Search Input</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Search Input'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Search Input</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Search Input'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Search Input</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 110
            ],
            // ============================================
            // FILE UPLOAD
            // ============================================
            [
                'name' => 'File Upload',
                'type' => 'mod-file',
                'component_type' => 'element',
                'category' => 'inputs',
                'alphabet_group' => 'F',
                'description' => 'File upload input',
                'icon' => 'Upload',
                'default_props' => ['content' => 'File Upload'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'File Upload']],
                'render_template' => 'file-template',
                'code_generators' => ['react-tailwind' => 'templates/inputs/file.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'File Upload'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">File Upload</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'File Upload'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">File Upload</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'File Upload'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">File Upload</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'File Upload'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">File Upload</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'File Upload'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">File Upload</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'File Upload'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">File Upload</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 111
            ],
            // ============================================
            // DATE PICKER
            // ============================================
            [
                'name' => 'Date Picker',
                'type' => 'mod-date',
                'component_type' => 'element',
                'category' => 'inputs',
                'alphabet_group' => 'D',
                'description' => 'Date picker input',
                'icon' => 'Calendar',
                'default_props' => ['content' => 'Date Picker'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Date Picker']],
                'render_template' => 'date-template',
                'code_generators' => ['react-tailwind' => 'templates/inputs/date.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Date Picker'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Date Picker</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Date Picker'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Date Picker</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Date Picker'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Date Picker</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Date Picker'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Date Picker</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Date Picker'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Date Picker</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Date Picker'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Date Picker</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 112
            ],
            // ============================================
            // TIME PICKER
            // ============================================
            [
                'name' => 'Time Picker',
                'type' => 'mod-time',
                'component_type' => 'element',
                'category' => 'inputs',
                'alphabet_group' => 'T',
                'description' => 'Time picker input',
                'icon' => 'Clock',
                'default_props' => ['content' => 'Time Picker'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Time Picker']],
                'render_template' => 'time-template',
                'code_generators' => ['react-tailwind' => 'templates/inputs/time.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Time Picker'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Time Picker</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Time Picker'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Time Picker</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Time Picker'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Time Picker</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Time Picker'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Time Picker</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Time Picker'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Time Picker</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Time Picker'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Time Picker</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 113
            ],
            // ============================================
            // EMAIL INPUT
            // ============================================
            [
                'name' => 'Email Input',
                'type' => 'mod-email-input',
                'component_type' => 'element',
                'category' => 'inputs',
                'alphabet_group' => 'E',
                'description' => 'Email input field',
                'icon' => 'Mail',
                'default_props' => ['content' => 'Email Input'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Email Input']],
                'render_template' => 'email-input-template',
                'code_generators' => ['react-tailwind' => 'templates/inputs/email-input.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Email Input'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Email Input</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Email Input'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Email Input</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Email Input'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Email Input</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Email Input'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Email Input</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Email Input'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Email Input</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Email Input'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Email Input</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 114
            ],
            // ============================================
            // PASSWORD INPUT
            // ============================================
            [
                'name' => 'Password Input',
                'type' => 'mod-password-input',
                'component_type' => 'element',
                'category' => 'inputs',
                'alphabet_group' => 'P',
                'description' => 'Password input field',
                'icon' => 'Lock',
                'default_props' => ['content' => 'Password Input'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Password Input']],
                'render_template' => 'password-input-template',
                'code_generators' => ['react-tailwind' => 'templates/inputs/password-input.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Password Input'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Password Input</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Password Input'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Password Input</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Password Input'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Password Input</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Password Input'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Password Input</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Password Input'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Password Input</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Password Input'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Password Input</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 115
            ],
            // ============================================
            // NUMBER INPUT
            // ============================================
            [
                'name' => 'Number Input',
                'type' => 'mod-number-input',
                'component_type' => 'element',
                'category' => 'inputs',
                'alphabet_group' => 'N',
                'description' => 'Number input field',
                'icon' => 'Hash',
                'default_props' => ['content' => 'Number Input'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Number Input']],
                'render_template' => 'number-input-template',
                'code_generators' => ['react-tailwind' => 'templates/inputs/number-input.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Number Input'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Number Input</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Number Input'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Number Input</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Number Input'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Number Input</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Number Input'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Number Input</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Number Input'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Number Input</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Number Input'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Number Input</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 116
            ],
            // ============================================
            // TEL INPUT
            // ============================================
            [
                'name' => 'Tel Input',
                'type' => 'mod-tel',
                'component_type' => 'element',
                'category' => 'inputs',
                'alphabet_group' => 'T',
                'description' => 'Telephone input field',
                'icon' => 'Phone',
                'default_props' => ['content' => 'Tel Input'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Tel Input']],
                'render_template' => 'tel-template',
                'code_generators' => ['react-tailwind' => 'templates/inputs/tel.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Tel Input'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Tel Input</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Tel Input'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Tel Input</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Tel Input'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Tel Input</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Tel Input'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Tel Input</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Tel Input'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Tel Input</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Tel Input'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Tel Input</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 117
            ],
            // ============================================
            // URL INPUT
            // ============================================
            [
                'name' => 'URL Input',
                'type' => 'mod-url-input',
                'component_type' => 'element',
                'category' => 'inputs',
                'alphabet_group' => 'U',
                'description' => 'URL input field',
                'icon' => 'Link',
                'default_props' => ['content' => 'URL Input'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'URL Input']],
                'render_template' => 'url-input-template',
                'code_generators' => ['react-tailwind' => 'templates/inputs/url-input.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'URL Input'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">URL Input</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'URL Input'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">URL Input</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'URL Input'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">URL Input</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'URL Input'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">URL Input</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'URL Input'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">URL Input</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'URL Input'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">URL Input</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 118
            ],
            // ============================================
            // COLOR PICKER
            // ============================================
            [
                'name' => 'Color Picker',
                'type' => 'mod-color',
                'component_type' => 'element',
                'category' => 'inputs',
                'alphabet_group' => 'C',
                'description' => 'Color picker input',
                'icon' => 'Palette',
                'default_props' => ['content' => 'Color Picker'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Color Picker']],
                'render_template' => 'color-template',
                'code_generators' => ['react-tailwind' => 'templates/inputs/color.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Color Picker'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Color Picker</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Color Picker'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Color Picker</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Color Picker'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Color Picker</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Color Picker'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Color Picker</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Color Picker'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Color Picker</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Color Picker'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Color Picker</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 119
            ],
            // ============================================
            // HEADING 2
            // ============================================
            [
                'name' => 'Heading 2',
                'type' => 'mod-h2',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'H',
                'description' => 'Secondary heading',
                'icon' => 'Type',
                'default_props' => ['content' => 'Heading 2'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Heading 2']],
                'render_template' => 'h2-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/h2.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Heading 2'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Heading 2</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Heading 2'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Heading 2</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Heading 2'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Heading 2</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Heading 2'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Heading 2</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Heading 2'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Heading 2</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Heading 2'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Heading 2</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 120
            ],
            // ============================================
            // HEADING 3
            // ============================================
            [
                'name' => 'Heading 3',
                'type' => 'mod-h3',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'H',
                'description' => 'Tertiary heading',
                'icon' => 'Type',
                'default_props' => ['content' => 'Heading 3'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Heading 3']],
                'render_template' => 'h3-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/h3.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Heading 3'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Heading 3</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Heading 3'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Heading 3</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Heading 3'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Heading 3</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Heading 3'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Heading 3</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Heading 3'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Heading 3</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Heading 3'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Heading 3</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 121
            ],
            // ============================================
            // HEADING 4
            // ============================================
            [
                'name' => 'Heading 4',
                'type' => 'mod-h4',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'H',
                'description' => 'Level 4 heading',
                'icon' => 'Type',
                'default_props' => ['content' => 'Heading 4'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Heading 4']],
                'render_template' => 'h4-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/h4.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Heading 4'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Heading 4</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Heading 4'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Heading 4</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Heading 4'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Heading 4</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Heading 4'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Heading 4</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Heading 4'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Heading 4</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Heading 4'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Heading 4</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 122
            ],
            // ============================================
            // HEADING 5
            // ============================================
            [
                'name' => 'Heading 5',
                'type' => 'mod-h5',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'H',
                'description' => 'Level 5 heading',
                'icon' => 'Type',
                'default_props' => ['content' => 'Heading 5'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Heading 5']],
                'render_template' => 'h5-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/h5.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Heading 5'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Heading 5</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Heading 5'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Heading 5</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Heading 5'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Heading 5</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Heading 5'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Heading 5</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Heading 5'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Heading 5</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Heading 5'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Heading 5</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 123
            ],
            // ============================================
            // HEADING 6
            // ============================================
            [
                'name' => 'Heading 6',
                'type' => 'mod-h6',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'H',
                'description' => 'Level 6 heading',
                'icon' => 'Type',
                'default_props' => ['content' => 'Heading 6'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Heading 6']],
                'render_template' => 'h6-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/h6.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Heading 6'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Heading 6</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Heading 6'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Heading 6</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Heading 6'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Heading 6</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Heading 6'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Heading 6</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Heading 6'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Heading 6</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Heading 6'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Heading 6</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 124
            ],
            // ============================================
            // SPAN
            // ============================================
            [
                'name' => 'Span',
                'type' => 'mod-span',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'S',
                'description' => 'Inline text span',
                'icon' => 'Type',
                'default_props' => ['content' => 'Span'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Span']],
                'render_template' => 'span-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/span.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Span'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Span</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Span'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Span</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Span'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Span</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Span'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Span</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Span'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Span</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Span'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Span</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 125
            ],
            // ============================================
            // LABEL TEXT
            // ============================================
            [
                'name' => 'Label Text',
                'type' => 'mod-label-text',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'L',
                'description' => 'Text label element',
                'icon' => 'Tag',
                'default_props' => ['content' => 'Label Text'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Label Text']],
                'render_template' => 'label-text-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/label-text.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Label Text'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Label Text</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Label Text'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Label Text</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Label Text'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Label Text</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Label Text'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Label Text</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Label Text'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Label Text</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Label Text'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Label Text</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 126
            ],
            // ============================================
            // STRONG TEXT
            // ============================================
            [
                'name' => 'Strong Text',
                'type' => 'mod-strong',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'S',
                'description' => 'Bold strong text',
                'icon' => 'Type',
                'default_props' => ['content' => 'Strong Text'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Strong Text']],
                'render_template' => 'strong-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/strong.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Strong Text'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Strong Text</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Strong Text'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Strong Text</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Strong Text'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Strong Text</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Strong Text'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Strong Text</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Strong Text'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Strong Text</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Strong Text'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Strong Text</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 127
            ],
            // ============================================
            // EMPHASIS
            // ============================================
            [
                'name' => 'Emphasis',
                'type' => 'mod-em',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'E',
                'description' => 'Italic emphasis text',
                'icon' => 'Type',
                'default_props' => ['content' => 'Emphasis'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Emphasis']],
                'render_template' => 'em-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/em.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Emphasis'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Emphasis</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Emphasis'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Emphasis</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Emphasis'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Emphasis</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Emphasis'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Emphasis</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Emphasis'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Emphasis</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Emphasis'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Emphasis</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 128
            ],
            // ============================================
            // SMALL TEXT
            // ============================================
            [
                'name' => 'Small Text',
                'type' => 'mod-small',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'S',
                'description' => 'Small text element',
                'icon' => 'Type',
                'default_props' => ['content' => 'Small Text'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Small Text']],
                'render_template' => 'small-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/small.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Small Text'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Small Text</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Small Text'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Small Text</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Small Text'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Small Text</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Small Text'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Small Text</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Small Text'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Small Text</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Small Text'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Small Text</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 129
            ],
            // ============================================
            // MARK HIGHLIGHT
            // ============================================
            [
                'name' => 'Mark Highlight',
                'type' => 'mod-mark',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'M',
                'description' => 'Highlighted text',
                'icon' => 'Highlighter',
                'default_props' => ['content' => 'Mark Highlight'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Mark Highlight']],
                'render_template' => 'mark-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/mark.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Mark Highlight'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Mark Highlight</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Mark Highlight'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Mark Highlight</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Mark Highlight'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Mark Highlight</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Mark Highlight'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Mark Highlight</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Mark Highlight'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Mark Highlight</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Mark Highlight'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Mark Highlight</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 130
            ],
            // ============================================
            // CODE INLINE
            // ============================================
            [
                'name' => 'Code Inline',
                'type' => 'mod-code-inline',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'C',
                'description' => 'Inline code text',
                'icon' => 'Code',
                'default_props' => ['content' => 'Code Inline'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Code Inline']],
                'render_template' => 'code-inline-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/code-inline.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Code Inline'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Code Inline</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Code Inline'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Code Inline</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Code Inline'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Code Inline</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Code Inline'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Code Inline</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Code Inline'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Code Inline</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Code Inline'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Code Inline</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 131
            ],
            // ============================================
            // BLOCKQUOTE
            // ============================================
            [
                'name' => 'Blockquote',
                'type' => 'mod-blockquote',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'B',
                'description' => 'Block quotation',
                'icon' => 'Quote',
                'default_props' => ['content' => 'Blockquote'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Blockquote']],
                'render_template' => 'blockquote-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/blockquote.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Blockquote'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Blockquote</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Blockquote'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Blockquote</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Blockquote'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Blockquote</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Blockquote'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Blockquote</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Blockquote'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Blockquote</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Blockquote'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Blockquote</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 132
            ],
            // ============================================
            // PREFORMATTED
            // ============================================
            [
                'name' => 'Preformatted',
                'type' => 'mod-pre',
                'component_type' => 'element',
                'category' => 'typography',
                'alphabet_group' => 'P',
                'description' => 'Preformatted text block',
                'icon' => 'Code',
                'default_props' => ['content' => 'Preformatted'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Preformatted']],
                'render_template' => 'pre-template',
                'code_generators' => ['react-tailwind' => 'templates/typography/pre.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Preformatted'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Preformatted</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Preformatted'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Preformatted</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Preformatted'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Preformatted</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Preformatted'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Preformatted</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Preformatted'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Preformatted</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Preformatted'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Preformatted</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 133
            ],
            // ============================================
            // SECTION
            // ============================================
            [
                'name' => 'Section',
                'type' => 'mod-section',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'S',
                'description' => 'Section container',
                'icon' => 'Layout',
                'default_props' => ['content' => 'Section'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Section']],
                'render_template' => 'section-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/section.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Section'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Section</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Section'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Section</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Section'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Section</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Section'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Section</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Section'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Section</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Section'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Section</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 134
            ],
            // ============================================
            // ARTICLE
            // ============================================
            [
                'name' => 'Article',
                'type' => 'mod-article',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'A',
                'description' => 'Article container',
                'icon' => 'FileText',
                'default_props' => ['content' => 'Article'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Article']],
                'render_template' => 'article-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/article.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Article'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Article</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Article'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Article</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Article'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Article</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Article'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Article</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Article'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Article</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Article'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Article</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 135
            ],
            // ============================================
            // MAIN
            // ============================================
            [
                'name' => 'Main',
                'type' => 'mod-main',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'M',
                'description' => 'Main content area',
                'icon' => 'Layout',
                'default_props' => ['content' => 'Main'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Main']],
                'render_template' => 'main-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/main.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Main'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Main</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Main'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Main</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Main'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Main</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Main'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Main</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Main'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Main</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Main'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Main</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 136
            ],
            // ============================================
            // HEADER
            // ============================================
            [
                'name' => 'Header',
                'type' => 'mod-header',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'H',
                'description' => 'Header section',
                'icon' => 'Layout',
                'default_props' => ['content' => 'Header'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Header']],
                'render_template' => 'header-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/header.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Header'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Header</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Header'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Header</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Header'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Header</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Header'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Header</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Header'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Header</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Header'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Header</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 137
            ],
            // ============================================
            // FOOTER
            // ============================================
            [
                'name' => 'Footer',
                'type' => 'mod-footer',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'F',
                'description' => 'Footer section',
                'icon' => 'Layout',
                'default_props' => ['content' => 'Footer'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Footer']],
                'render_template' => 'footer-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/footer.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Footer'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Footer</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Footer'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Footer</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Footer'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Footer</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Footer'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Footer</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Footer'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Footer</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Footer'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Footer</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 138
            ],
            // ============================================
            // ASIDE
            // ============================================
            [
                'name' => 'Aside',
                'type' => 'mod-aside',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'A',
                'description' => 'Sidebar aside',
                'icon' => 'Sidebar',
                'default_props' => ['content' => 'Aside'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Aside']],
                'render_template' => 'aside-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/aside.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Aside'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Aside</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Aside'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Aside</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Aside'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Aside</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Aside'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Aside</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Aside'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Aside</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Aside'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Aside</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 139
            ],
            // ============================================
            // NAV CONTAINER
            // ============================================
            [
                'name' => 'Nav Container',
                'type' => 'mod-nav',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'N',
                'description' => 'Navigation container',
                'icon' => 'Menu',
                'default_props' => ['content' => 'Nav Container'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Nav Container']],
                'render_template' => 'nav-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/nav.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Nav Container'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Nav Container</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Nav Container'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Nav Container</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Nav Container'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Nav Container</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Nav Container'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Nav Container</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Nav Container'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Nav Container</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Nav Container'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Nav Container</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 140
            ],
            // ============================================
            // DIV CONTAINER
            // ============================================
            [
                'name' => 'Div Container',
                'type' => 'mod-div',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'D',
                'description' => 'Generic div container',
                'icon' => 'Square',
                'default_props' => ['content' => 'Div Container'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Div Container']],
                'render_template' => 'div-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/div.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Div Container'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Div Container</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Div Container'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Div Container</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Div Container'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Div Container</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Div Container'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Div Container</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Div Container'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Div Container</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Div Container'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Div Container</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 141
            ],
            // ============================================
            // CONTAINER
            // ============================================
            [
                'name' => 'Container',
                'type' => 'mod-container',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'C',
                'description' => 'Content container',
                'icon' => 'Layout',
                'default_props' => ['content' => 'Container'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Container']],
                'render_template' => 'container-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/container.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Container'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Container</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Container'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Container</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Container'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Container</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Container'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Container</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Container'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Container</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Container'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Container</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 142
            ],
            // ============================================
            // GRID LAYOUT
            // ============================================
            [
                'name' => 'Grid Layout',
                'type' => 'mod-grid',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'G',
                'description' => 'CSS Grid layout',
                'icon' => 'Grid',
                'default_props' => ['content' => 'Grid Layout'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Grid Layout']],
                'render_template' => 'grid-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/grid.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Grid Layout'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Grid Layout</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Grid Layout'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Grid Layout</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Grid Layout'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Grid Layout</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Grid Layout'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Grid Layout</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Grid Layout'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Grid Layout</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Grid Layout'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Grid Layout</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 143
            ],
            // ============================================
            // FLEX LAYOUT
            // ============================================
            [
                'name' => 'Flex Layout',
                'type' => 'mod-flex',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'F',
                'description' => 'Flexbox layout',
                'icon' => 'Layout',
                'default_props' => ['content' => 'Flex Layout'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Flex Layout']],
                'render_template' => 'flex-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/flex.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Flex Layout'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Flex Layout</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Flex Layout'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Flex Layout</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Flex Layout'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Flex Layout</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Flex Layout'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Flex Layout</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Flex Layout'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Flex Layout</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Flex Layout'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Flex Layout</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 144
            ],
            // ============================================
            // STACK
            // ============================================
            [
                'name' => 'Stack',
                'type' => 'mod-stack',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'S',
                'description' => 'Vertical stack layout',
                'icon' => 'Layers',
                'default_props' => ['content' => 'Stack'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Stack']],
                'render_template' => 'stack-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/stack.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Stack'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Stack</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Stack'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Stack</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Stack'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Stack</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Stack'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Stack</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Stack'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Stack</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Stack'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Stack</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 145
            ],
            // ============================================
            // WRAPPER
            // ============================================
            [
                'name' => 'Wrapper',
                'type' => 'mod-wrapper',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'W',
                'description' => 'Wrapper container',
                'icon' => 'Package',
                'default_props' => ['content' => 'Wrapper'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Wrapper']],
                'render_template' => 'wrapper-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/wrapper.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Wrapper'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Wrapper</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Wrapper'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Wrapper</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Wrapper'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Wrapper</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Wrapper'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Wrapper</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Wrapper'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Wrapper</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Wrapper'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Wrapper</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 146
            ],
            // ============================================
            // COLUMN
            // ============================================
            [
                'name' => 'Column',
                'type' => 'mod-column',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'C',
                'description' => 'Column layout',
                'icon' => 'Columns',
                'default_props' => ['content' => 'Column'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Column']],
                'render_template' => 'column-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/column.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Column'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Column</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Column'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Column</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Column'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Column</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Column'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Column</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Column'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Column</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Column'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Column</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 147
            ],
            // ============================================
            // TABS
            // ============================================
            [
                'name' => 'Tabs',
                'type' => 'mod-tabs',
                'component_type' => 'element',
                'category' => 'navigation',
                'alphabet_group' => 'T',
                'description' => 'Tabbed navigation',
                'icon' => 'Menu',
                'default_props' => ['content' => 'Tabs'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Tabs']],
                'render_template' => 'tabs-template',
                'code_generators' => ['react-tailwind' => 'templates/navigation/tabs.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Tabs'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Tabs</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Tabs'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Tabs</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Tabs'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Tabs</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Tabs'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Tabs</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Tabs'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Tabs</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Tabs'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Tabs</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 148
            ],
            // ============================================
            // BREADCRUMB
            // ============================================
            [
                'name' => 'Breadcrumb',
                'type' => 'mod-breadcrumb',
                'component_type' => 'element',
                'category' => 'navigation',
                'alphabet_group' => 'B',
                'description' => 'Breadcrumb navigation',
                'icon' => 'ChevronRight',
                'default_props' => ['content' => 'Breadcrumb'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Breadcrumb']],
                'render_template' => 'breadcrumb-template',
                'code_generators' => ['react-tailwind' => 'templates/navigation/breadcrumb.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Breadcrumb'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Breadcrumb</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Breadcrumb'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Breadcrumb</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Breadcrumb'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Breadcrumb</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Breadcrumb'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Breadcrumb</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Breadcrumb'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Breadcrumb</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Breadcrumb'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Breadcrumb</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 149
            ],
            // ============================================
            // PAGINATION
            // ============================================
            [
                'name' => 'Pagination',
                'type' => 'mod-pagination',
                'component_type' => 'element',
                'category' => 'navigation',
                'alphabet_group' => 'P',
                'description' => 'Page pagination',
                'icon' => 'ChevronRight',
                'default_props' => ['content' => 'Pagination'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Pagination']],
                'render_template' => 'pagination-template',
                'code_generators' => ['react-tailwind' => 'templates/navigation/pagination.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Pagination'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Pagination</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Pagination'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Pagination</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Pagination'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Pagination</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Pagination'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Pagination</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Pagination'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Pagination</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Pagination'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Pagination</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 150
            ],
            // ============================================
            // MENU
            // ============================================
            [
                'name' => 'Menu',
                'type' => 'mod-menu',
                'component_type' => 'element',
                'category' => 'navigation',
                'alphabet_group' => 'M',
                'description' => 'Menu component',
                'icon' => 'Menu',
                'default_props' => ['content' => 'Menu'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Menu']],
                'render_template' => 'menu-template',
                'code_generators' => ['react-tailwind' => 'templates/navigation/menu.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Menu'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Menu</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Menu'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Menu</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Menu'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Menu</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Menu'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Menu</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Menu'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Menu</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Menu'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Menu</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 151
            ],
            // ============================================
            // DROPDOWN MENU
            // ============================================
            [
                'name' => 'Dropdown Menu',
                'type' => 'mod-dropdown-menu',
                'component_type' => 'element',
                'category' => 'navigation',
                'alphabet_group' => 'D',
                'description' => 'Dropdown menu',
                'icon' => 'ChevronDown',
                'default_props' => ['content' => 'Dropdown Menu'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Dropdown Menu']],
                'render_template' => 'dropdown-menu-template',
                'code_generators' => ['react-tailwind' => 'templates/navigation/dropdown-menu.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Dropdown Menu'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Dropdown Menu</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Dropdown Menu'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Dropdown Menu</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Dropdown Menu'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Dropdown Menu</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Dropdown Menu'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Dropdown Menu</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Dropdown Menu'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Dropdown Menu</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Dropdown Menu'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Dropdown Menu</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 152
            ],
            // ============================================
            // SIDEBAR NAV
            // ============================================
            [
                'name' => 'Sidebar Nav',
                'type' => 'mod-sidebar-nav',
                'component_type' => 'element',
                'category' => 'navigation',
                'alphabet_group' => 'S',
                'description' => 'Sidebar navigation',
                'icon' => 'Sidebar',
                'default_props' => ['content' => 'Sidebar Nav'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Sidebar Nav']],
                'render_template' => 'sidebar-nav-template',
                'code_generators' => ['react-tailwind' => 'templates/navigation/sidebar-nav.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Sidebar Nav'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Sidebar Nav</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Sidebar Nav'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Sidebar Nav</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Sidebar Nav'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Sidebar Nav</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Sidebar Nav'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Sidebar Nav</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Sidebar Nav'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Sidebar Nav</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Sidebar Nav'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Sidebar Nav</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 153
            ],
            // ============================================
            // TOP NAVIGATION
            // ============================================
            [
                'name' => 'Top Navigation',
                'type' => 'mod-top-nav',
                'component_type' => 'element',
                'category' => 'navigation',
                'alphabet_group' => 'T',
                'description' => 'Top navigation bar',
                'icon' => 'Menu',
                'default_props' => ['content' => 'Top Navigation'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Top Navigation']],
                'render_template' => 'top-nav-template',
                'code_generators' => ['react-tailwind' => 'templates/navigation/top-nav.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Top Navigation'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Top Navigation</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Top Navigation'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Top Navigation</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Top Navigation'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Top Navigation</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Top Navigation'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Top Navigation</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Top Navigation'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Top Navigation</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Top Navigation'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Top Navigation</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 154
            ],
            // ============================================
            // BOTTOM NAVIGATION
            // ============================================
            [
                'name' => 'Bottom Navigation',
                'type' => 'mod-bottom-nav',
                'component_type' => 'element',
                'category' => 'navigation',
                'alphabet_group' => 'B',
                'description' => 'Bottom navigation bar',
                'icon' => 'Menu',
                'default_props' => ['content' => 'Bottom Navigation'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Bottom Navigation']],
                'render_template' => 'bottom-nav-template',
                'code_generators' => ['react-tailwind' => 'templates/navigation/bottom-nav.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Bottom Navigation'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Bottom Navigation</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Bottom Navigation'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Bottom Navigation</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Bottom Navigation'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Bottom Navigation</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Bottom Navigation'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Bottom Navigation</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Bottom Navigation'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Bottom Navigation</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Bottom Navigation'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Bottom Navigation</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 155
            ],
            // ============================================
            // STEPS
            // ============================================
            [
                'name' => 'Steps',
                'type' => 'mod-steps',
                'component_type' => 'element',
                'category' => 'navigation',
                'alphabet_group' => 'S',
                'description' => 'Step indicator',
                'icon' => 'GitBranch',
                'default_props' => ['content' => 'Steps'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Steps']],
                'render_template' => 'steps-template',
                'code_generators' => ['react-tailwind' => 'templates/navigation/steps.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Steps'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Steps</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Steps'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Steps</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Steps'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Steps</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Steps'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Steps</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Steps'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Steps</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Steps'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Steps</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 156
            ],
            // ============================================
            // STEPPER
            // ============================================
            [
                'name' => 'Stepper',
                'type' => 'mod-stepper',
                'component_type' => 'element',
                'category' => 'navigation',
                'alphabet_group' => 'S',
                'description' => 'Multi-step progress',
                'icon' => 'List',
                'default_props' => ['content' => 'Stepper'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Stepper']],
                'render_template' => 'stepper-template',
                'code_generators' => ['react-tailwind' => 'templates/navigation/stepper.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Stepper'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Stepper</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Stepper'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Stepper</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Stepper'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Stepper</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Stepper'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Stepper</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Stepper'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Stepper</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Stepper'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Stepper</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 157
            ],
            // ============================================
            // STATS CARD
            // ============================================
            [
                'name' => 'Stats Card',
                'type' => 'mod-stats-card',
                'component_type' => 'element',
                'category' => 'data',
                'alphabet_group' => 'S',
                'description' => 'Statistics card',
                'icon' => 'BarChart',
                'default_props' => ['content' => 'Stats Card'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Stats Card']],
                'render_template' => 'stats-card-template',
                'code_generators' => ['react-tailwind' => 'templates/data/stats-card.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Stats Card'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Stats Card</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Stats Card'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Stats Card</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Stats Card'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Stats Card</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Stats Card'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Stats Card</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Stats Card'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Stats Card</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Stats Card'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Stats Card</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 158
            ],
            // ============================================
            // METRIC
            // ============================================
            [
                'name' => 'Metric',
                'type' => 'mod-metric',
                'component_type' => 'element',
                'category' => 'data',
                'alphabet_group' => 'M',
                'description' => 'Single metric display',
                'icon' => 'Activity',
                'default_props' => ['content' => 'Metric'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Metric']],
                'render_template' => 'metric-template',
                'code_generators' => ['react-tailwind' => 'templates/data/metric.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Metric'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Metric</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Metric'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Metric</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Metric'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Metric</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Metric'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Metric</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Metric'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Metric</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Metric'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Metric</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 159
            ],
            // ============================================
            // COUNTER
            // ============================================
            [
                'name' => 'Counter',
                'type' => 'mod-counter',
                'component_type' => 'element',
                'category' => 'data',
                'alphabet_group' => 'C',
                'description' => 'Number counter',
                'icon' => 'Hash',
                'default_props' => ['content' => 'Counter'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Counter']],
                'render_template' => 'counter-template',
                'code_generators' => ['react-tailwind' => 'templates/data/counter.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Counter'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Counter</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Counter'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Counter</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Counter'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Counter</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Counter'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Counter</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Counter'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Counter</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Counter'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Counter</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 160
            ],
            // ============================================
            // AVATAR
            // ============================================
            [
                'name' => 'Avatar',
                'type' => 'mod-avatar',
                'component_type' => 'element',
                'category' => 'data',
                'alphabet_group' => 'A',
                'description' => 'User avatar',
                'icon' => 'User',
                'default_props' => ['content' => 'Avatar'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Avatar']],
                'render_template' => 'avatar-template',
                'code_generators' => ['react-tailwind' => 'templates/data/avatar.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Avatar'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Avatar</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Avatar'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Avatar</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Avatar'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Avatar</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Avatar'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Avatar</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Avatar'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Avatar</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Avatar'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Avatar</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 161
            ],
            // ============================================
            // AVATAR GROUP
            // ============================================
            [
                'name' => 'Avatar Group',
                'type' => 'mod-avatar-group',
                'component_type' => 'element',
                'category' => 'data',
                'alphabet_group' => 'A',
                'description' => 'Group of avatars',
                'icon' => 'Users',
                'default_props' => ['content' => 'Avatar Group'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Avatar Group']],
                'render_template' => 'avatar-group-template',
                'code_generators' => ['react-tailwind' => 'templates/data/avatar-group.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Avatar Group'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Avatar Group</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Avatar Group'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Avatar Group</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Avatar Group'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Avatar Group</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Avatar Group'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Avatar Group</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Avatar Group'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Avatar Group</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Avatar Group'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Avatar Group</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 162
            ],
            // ============================================
            // SKELETON
            // ============================================
            [
                'name' => 'Skeleton',
                'type' => 'mod-skeleton',
                'component_type' => 'element',
                'category' => 'data',
                'alphabet_group' => 'S',
                'description' => 'Loading skeleton',
                'icon' => 'Loader',
                'default_props' => ['content' => 'Skeleton'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Skeleton']],
                'render_template' => 'skeleton-template',
                'code_generators' => ['react-tailwind' => 'templates/data/skeleton.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Skeleton'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Skeleton</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Skeleton'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Skeleton</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Skeleton'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Skeleton</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Skeleton'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Skeleton</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Skeleton'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Skeleton</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Skeleton'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Skeleton</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 163
            ],
            // ============================================
            // SPINNER
            // ============================================
            [
                'name' => 'Spinner',
                'type' => 'mod-spinner',
                'component_type' => 'element',
                'category' => 'data',
                'alphabet_group' => 'S',
                'description' => 'Loading spinner',
                'icon' => 'Loader',
                'default_props' => ['content' => 'Spinner'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Spinner']],
                'render_template' => 'spinner-template',
                'code_generators' => ['react-tailwind' => 'templates/data/spinner.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Spinner'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Spinner</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Spinner'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Spinner</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Spinner'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Spinner</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Spinner'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Spinner</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Spinner'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Spinner</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Spinner'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Spinner</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 164
            ],
            // ============================================
            // EMPTY STATE
            // ============================================
            [
                'name' => 'Empty State',
                'type' => 'mod-empty-state',
                'component_type' => 'element',
                'category' => 'data',
                'alphabet_group' => 'E',
                'description' => 'Empty state message',
                'icon' => 'Inbox',
                'default_props' => ['content' => 'Empty State'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Empty State']],
                'render_template' => 'empty-state-template',
                'code_generators' => ['react-tailwind' => 'templates/data/empty-state.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Empty State'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Empty State</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Empty State'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Empty State</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Empty State'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Empty State</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Empty State'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Empty State</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Empty State'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Empty State</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Empty State'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Empty State</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 165
            ],
            // ============================================
            // TIMELINE
            // ============================================
            [
                'name' => 'Timeline',
                'type' => 'mod-timeline',
                'component_type' => 'element',
                'category' => 'data',
                'alphabet_group' => 'T',
                'description' => 'Timeline component',
                'icon' => 'Clock',
                'default_props' => ['content' => 'Timeline'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Timeline']],
                'render_template' => 'timeline-template',
                'code_generators' => ['react-tailwind' => 'templates/data/timeline.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Timeline'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Timeline</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Timeline'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Timeline</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Timeline'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Timeline</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Timeline'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Timeline</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Timeline'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Timeline</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Timeline'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Timeline</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 166
            ],
            // ============================================
            // DATA BADGE
            // ============================================
            [
                'name' => 'Data Badge',
                'type' => 'mod-data-badge',
                'component_type' => 'element',
                'category' => 'data',
                'alphabet_group' => 'B',
                'description' => 'Data badge indicator',
                'icon' => 'Tag',
                'default_props' => ['content' => 'Data Badge'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Data Badge']],
                'render_template' => 'data-badge-template',
                'code_generators' => ['react-tailwind' => 'templates/data/data-badge.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Data Badge'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Data Badge</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Data Badge'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Data Badge</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Data Badge'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Data Badge</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Data Badge'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Data Badge</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Data Badge'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Data Badge</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Data Badge'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Data Badge</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 167
            ],
            // ============================================
            // PRODUCT CARD
            // ============================================
            [
                'name' => 'Product Card',
                'type' => 'mod-product-card',
                'component_type' => 'element',
                'category' => 'cards',
                'alphabet_group' => 'P',
                'description' => 'Product display card',
                'icon' => 'ShoppingCart',
                'default_props' => ['content' => 'Product Card'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Product Card']],
                'render_template' => 'product-card-template',
                'code_generators' => ['react-tailwind' => 'templates/cards/product-card.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Product Card'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Product Card</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Product Card'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Product Card</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Product Card'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Product Card</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Product Card'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Product Card</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Product Card'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Product Card</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Product Card'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Product Card</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 168
            ],
            // ============================================
            // PROFILE CARD
            // ============================================
            [
                'name' => 'Profile Card',
                'type' => 'mod-profile-card',
                'component_type' => 'element',
                'category' => 'cards',
                'alphabet_group' => 'P',
                'description' => 'User profile card',
                'icon' => 'User',
                'default_props' => ['content' => 'Profile Card'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Profile Card']],
                'render_template' => 'profile-card-template',
                'code_generators' => ['react-tailwind' => 'templates/cards/profile-card.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Profile Card'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Profile Card</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Profile Card'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Profile Card</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Profile Card'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Profile Card</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Profile Card'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Profile Card</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Profile Card'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Profile Card</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Profile Card'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Profile Card</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 169
            ],
            // ============================================
            // PRICING CARD
            // ============================================
            [
                'name' => 'Pricing Card',
                'type' => 'mod-pricing-card',
                'component_type' => 'element',
                'category' => 'cards',
                'alphabet_group' => 'P',
                'description' => 'Pricing tier card',
                'icon' => 'DollarSign',
                'default_props' => ['content' => 'Pricing Card'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Pricing Card']],
                'render_template' => 'pricing-card-template',
                'code_generators' => ['react-tailwind' => 'templates/cards/pricing-card.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Pricing Card'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Pricing Card</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Pricing Card'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Pricing Card</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Pricing Card'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Pricing Card</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Pricing Card'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Pricing Card</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Pricing Card'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Pricing Card</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Pricing Card'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Pricing Card</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 170
            ],
            // ============================================
            // FEATURE CARD
            // ============================================
            [
                'name' => 'Feature Card',
                'type' => 'mod-feature-card',
                'component_type' => 'element',
                'category' => 'cards',
                'alphabet_group' => 'F',
                'description' => 'Feature showcase card',
                'icon' => 'Zap',
                'default_props' => ['content' => 'Feature Card'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Feature Card']],
                'render_template' => 'feature-card-template',
                'code_generators' => ['react-tailwind' => 'templates/cards/feature-card.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Feature Card'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Feature Card</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Feature Card'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Feature Card</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Feature Card'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Feature Card</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Feature Card'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Feature Card</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Feature Card'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Feature Card</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Feature Card'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Feature Card</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 171
            ],
            // ============================================
            // TESTIMONIAL CARD
            // ============================================
            [
                'name' => 'Testimonial Card',
                'type' => 'mod-testimonial-card',
                'component_type' => 'element',
                'category' => 'cards',
                'alphabet_group' => 'T',
                'description' => 'Customer testimonial',
                'icon' => 'MessageSquare',
                'default_props' => ['content' => 'Testimonial Card'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Testimonial Card']],
                'render_template' => 'testimonial-card-template',
                'code_generators' => ['react-tailwind' => 'templates/cards/testimonial-card.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Testimonial Card'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Testimonial Card</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Testimonial Card'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Testimonial Card</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Testimonial Card'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Testimonial Card</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Testimonial Card'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Testimonial Card</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Testimonial Card'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Testimonial Card</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Testimonial Card'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Testimonial Card</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 172
            ],
            // ============================================
            // IMAGE CARD
            // ============================================
            [
                'name' => 'Image Card',
                'type' => 'mod-image-card',
                'component_type' => 'element',
                'category' => 'cards',
                'alphabet_group' => 'I',
                'description' => 'Image display card',
                'icon' => 'Image',
                'default_props' => ['content' => 'Image Card'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Image Card']],
                'render_template' => 'image-card-template',
                'code_generators' => ['react-tailwind' => 'templates/cards/image-card.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Image Card'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Image Card</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Image Card'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Image Card</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Image Card'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Image Card</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Image Card'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Image Card</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Image Card'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Image Card</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Image Card'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Image Card</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 173
            ],
            // ============================================
            // BLOG CARD
            // ============================================
            [
                'name' => 'Blog Card',
                'type' => 'mod-blog-card',
                'component_type' => 'element',
                'category' => 'cards',
                'alphabet_group' => 'B',
                'description' => 'Blog post card',
                'icon' => 'FileText',
                'default_props' => ['content' => 'Blog Card'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Blog Card']],
                'render_template' => 'blog-card-template',
                'code_generators' => ['react-tailwind' => 'templates/cards/blog-card.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Blog Card'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Blog Card</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Blog Card'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Blog Card</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Blog Card'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Blog Card</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Blog Card'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Blog Card</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Blog Card'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Blog Card</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Blog Card'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Blog Card</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 174
            ],
            // ============================================
            // INFO CARD
            // ============================================
            [
                'name' => 'Info Card',
                'type' => 'mod-info-card',
                'component_type' => 'element',
                'category' => 'cards',
                'alphabet_group' => 'I',
                'description' => 'Information card',
                'icon' => 'Info',
                'default_props' => ['content' => 'Info Card'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Info Card']],
                'render_template' => 'info-card-template',
                'code_generators' => ['react-tailwind' => 'templates/cards/info-card.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Info Card'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Info Card</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Info Card'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Info Card</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Info Card'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Info Card</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Info Card'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Info Card</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Info Card'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Info Card</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Info Card'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Info Card</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 175
            ],
            // ============================================
            // TOOLTIP
            // ============================================
            [
                'name' => 'Tooltip',
                'type' => 'mod-tooltip',
                'component_type' => 'element',
                'category' => 'feedback',
                'alphabet_group' => 'T',
                'description' => 'Hover tooltip',
                'icon' => 'MessageCircle',
                'default_props' => ['content' => 'Tooltip'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Tooltip']],
                'render_template' => 'tooltip-template',
                'code_generators' => ['react-tailwind' => 'templates/feedback/tooltip.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Tooltip'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Tooltip</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Tooltip'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Tooltip</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Tooltip'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Tooltip</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Tooltip'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Tooltip</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Tooltip'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Tooltip</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Tooltip'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Tooltip</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 176
            ],
            // ============================================
            // MODAL
            // ============================================
            [
                'name' => 'Modal',
                'type' => 'mod-modal',
                'component_type' => 'element',
                'category' => 'overlays',
                'alphabet_group' => 'M',
                'description' => 'Modal dialog',
                'icon' => 'Square',
                'default_props' => ['content' => 'Modal'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Modal']],
                'render_template' => 'modal-template',
                'code_generators' => ['react-tailwind' => 'templates/overlays/modal.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Modal'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Modal</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Modal'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Modal</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Modal'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Modal</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Modal'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Modal</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Modal'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Modal</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Modal'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Modal</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 177
            ],
            // ============================================
            // DIALOG
            // ============================================
            [
                'name' => 'Dialog',
                'type' => 'mod-dialog',
                'component_type' => 'element',
                'category' => 'overlays',
                'alphabet_group' => 'D',
                'description' => 'Dialog box',
                'icon' => 'MessageSquare',
                'default_props' => ['content' => 'Dialog'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Dialog']],
                'render_template' => 'dialog-template',
                'code_generators' => ['react-tailwind' => 'templates/overlays/dialog.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Dialog'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Dialog</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Dialog'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Dialog</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Dialog'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Dialog</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Dialog'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Dialog</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Dialog'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Dialog</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Dialog'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Dialog</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 178
            ],
            // ============================================
            // DRAWER
            // ============================================
            [
                'name' => 'Drawer',
                'type' => 'mod-drawer',
                'component_type' => 'element',
                'category' => 'overlays',
                'alphabet_group' => 'D',
                'description' => 'Side drawer',
                'icon' => 'Sidebar',
                'default_props' => ['content' => 'Drawer'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Drawer']],
                'render_template' => 'drawer-template',
                'code_generators' => ['react-tailwind' => 'templates/overlays/drawer.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Drawer'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Drawer</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Drawer'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Drawer</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Drawer'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Drawer</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Drawer'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Drawer</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Drawer'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Drawer</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Drawer'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Drawer</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 179
            ],
            // ============================================
            // POPOVER
            // ============================================
            [
                'name' => 'Popover',
                'type' => 'mod-popover',
                'component_type' => 'element',
                'category' => 'overlays',
                'alphabet_group' => 'P',
                'description' => 'Popover overlay',
                'icon' => 'MessageCircle',
                'default_props' => ['content' => 'Popover'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Popover']],
                'render_template' => 'popover-template',
                'code_generators' => ['react-tailwind' => 'templates/overlays/popover.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Popover'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Popover</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Popover'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Popover</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Popover'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Popover</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Popover'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Popover</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Popover'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Popover</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Popover'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Popover</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 180
            ],
            // ============================================
            // SNACKBAR
            // ============================================
            [
                'name' => 'Snackbar',
                'type' => 'mod-snackbar',
                'component_type' => 'element',
                'category' => 'feedback',
                'alphabet_group' => 'S',
                'description' => 'Bottom notification',
                'icon' => 'Bell',
                'default_props' => ['content' => 'Snackbar'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Snackbar']],
                'render_template' => 'snackbar-template',
                'code_generators' => ['react-tailwind' => 'templates/feedback/snackbar.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Snackbar'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Snackbar</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Snackbar'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Snackbar</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Snackbar'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Snackbar</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Snackbar'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Snackbar</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Snackbar'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Snackbar</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Snackbar'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Snackbar</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 181
            ],
            // ============================================
            // BANNER
            // ============================================
            [
                'name' => 'Banner',
                'type' => 'mod-banner',
                'component_type' => 'element',
                'category' => 'feedback',
                'alphabet_group' => 'B',
                'description' => 'Top banner notification',
                'icon' => 'Flag',
                'default_props' => ['content' => 'Banner'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Banner']],
                'render_template' => 'banner-template',
                'code_generators' => ['react-tailwind' => 'templates/feedback/banner.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Banner'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Banner</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Banner'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Banner</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Banner'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Banner</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Banner'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Banner</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Banner'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Banner</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Banner'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Banner</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 182
            ],
            // ============================================
            // NOTIFICATION
            // ============================================
            [
                'name' => 'Notification',
                'type' => 'mod-notification',
                'component_type' => 'element',
                'category' => 'feedback',
                'alphabet_group' => 'N',
                'description' => 'Notification message',
                'icon' => 'Bell',
                'default_props' => ['content' => 'Notification'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Notification']],
                'render_template' => 'notification-template',
                'code_generators' => ['react-tailwind' => 'templates/feedback/notification.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Notification'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Notification</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Notification'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Notification</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Notification'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Notification</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Notification'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Notification</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Notification'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Notification</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Notification'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Notification</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 183
            ],
            // ============================================
            // ICON BUTTON
            // ============================================
            [
                'name' => 'Icon Button',
                'type' => 'mod-icon-button',
                'component_type' => 'element',
                'category' => 'buttons',
                'alphabet_group' => 'I',
                'description' => 'Icon-only button',
                'icon' => 'Circle',
                'default_props' => ['content' => 'Icon Button'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Icon Button']],
                'render_template' => 'icon-button-template',
                'code_generators' => ['react-tailwind' => 'templates/buttons/icon-button.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Icon Button'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Icon Button</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Icon Button'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Icon Button</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Icon Button'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Icon Button</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Icon Button'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Icon Button</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Icon Button'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Icon Button</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Icon Button'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Icon Button</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 184
            ],
            // ============================================
            // BUTTON GROUP
            // ============================================
            [
                'name' => 'Button Group',
                'type' => 'mod-button-group',
                'component_type' => 'element',
                'category' => 'buttons',
                'alphabet_group' => 'B',
                'description' => 'Group of buttons',
                'icon' => 'Square',
                'default_props' => ['content' => 'Button Group'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Button Group']],
                'render_template' => 'button-group-template',
                'code_generators' => ['react-tailwind' => 'templates/buttons/button-group.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Button Group'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Button Group</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Button Group'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Button Group</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Button Group'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Button Group</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Button Group'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Button Group</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Button Group'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Button Group</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Button Group'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Button Group</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 185
            ],
            // ============================================
            // FAB
            // ============================================
            [
                'name' => 'FAB',
                'type' => 'mod-fab',
                'component_type' => 'element',
                'category' => 'buttons',
                'alphabet_group' => 'F',
                'description' => 'Floating action button',
                'icon' => 'Plus',
                'default_props' => ['content' => 'FAB'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'FAB']],
                'render_template' => 'fab-template',
                'code_generators' => ['react-tailwind' => 'templates/buttons/fab.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'FAB'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">FAB</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'FAB'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">FAB</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'FAB'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">FAB</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'FAB'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">FAB</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'FAB'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">FAB</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'FAB'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">FAB</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 186
            ],
            // ============================================
            // TOGGLE BUTTON
            // ============================================
            [
                'name' => 'Toggle Button',
                'type' => 'mod-toggle-button',
                'component_type' => 'element',
                'category' => 'buttons',
                'alphabet_group' => 'T',
                'description' => 'Toggle button',
                'icon' => 'ToggleLeft',
                'default_props' => ['content' => 'Toggle Button'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Toggle Button']],
                'render_template' => 'toggle-button-template',
                'code_generators' => ['react-tailwind' => 'templates/buttons/toggle-button.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Toggle Button'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Toggle Button</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Toggle Button'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Toggle Button</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Toggle Button'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Toggle Button</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Toggle Button'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Toggle Button</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Toggle Button'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Toggle Button</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Toggle Button'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Toggle Button</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 187
            ],
            // ============================================
            // SOCIAL BUTTON
            // ============================================
            [
                'name' => 'Social Button',
                'type' => 'mod-social-button',
                'component_type' => 'element',
                'category' => 'buttons',
                'alphabet_group' => 'S',
                'description' => 'Social media button',
                'icon' => 'Share2',
                'default_props' => ['content' => 'Social Button'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Social Button']],
                'render_template' => 'social-button-template',
                'code_generators' => ['react-tailwind' => 'templates/buttons/social-button.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Social Button'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Social Button</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Social Button'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Social Button</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Social Button'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Social Button</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Social Button'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Social Button</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Social Button'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Social Button</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Social Button'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Social Button</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 188
            ],
            // ============================================
            // CLOSE BUTTON
            // ============================================
            [
                'name' => 'Close Button',
                'type' => 'mod-close-button',
                'component_type' => 'element',
                'category' => 'buttons',
                'alphabet_group' => 'C',
                'description' => 'Close/dismiss button',
                'icon' => 'X',
                'default_props' => ['content' => 'Close Button'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Close Button']],
                'render_template' => 'close-button-template',
                'code_generators' => ['react-tailwind' => 'templates/buttons/close-button.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Close Button'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Close Button</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Close Button'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Close Button</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Close Button'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Close Button</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Close Button'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Close Button</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Close Button'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Close Button</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Close Button'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Close Button</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 189
            ],
            // ============================================
            // BACK BUTTON
            // ============================================
            [
                'name' => 'Back Button',
                'type' => 'mod-back-button',
                'component_type' => 'element',
                'category' => 'buttons',
                'alphabet_group' => 'B',
                'description' => 'Back navigation button',
                'icon' => 'ArrowLeft',
                'default_props' => ['content' => 'Back Button'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Back Button']],
                'render_template' => 'back-button-template',
                'code_generators' => ['react-tailwind' => 'templates/buttons/back-button.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Back Button'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Back Button</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Back Button'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Back Button</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Back Button'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Back Button</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Back Button'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Back Button</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Back Button'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Back Button</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Back Button'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Back Button</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 190
            ],
            // ============================================
            // SVG
            // ============================================
            [
                'name' => 'SVG',
                'type' => 'mod-svg',
                'component_type' => 'element',
                'category' => 'media',
                'alphabet_group' => 'S',
                'description' => 'SVG graphic element',
                'icon' => 'Image',
                'default_props' => ['content' => 'SVG'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'SVG']],
                'render_template' => 'svg-template',
                'code_generators' => ['react-tailwind' => 'templates/media/svg.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'SVG'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">SVG</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'SVG'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">SVG</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'SVG'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">SVG</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'SVG'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">SVG</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'SVG'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">SVG</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'SVG'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">SVG</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 191
            ],
            // ============================================
            // IFRAME
            // ============================================
            [
                'name' => 'Iframe',
                'type' => 'mod-iframe',
                'component_type' => 'element',
                'category' => 'media',
                'alphabet_group' => 'I',
                'description' => 'Embedded iframe',
                'icon' => 'Globe',
                'default_props' => ['content' => 'Iframe'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Iframe']],
                'render_template' => 'iframe-template',
                'code_generators' => ['react-tailwind' => 'templates/media/iframe.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Iframe'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Iframe</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Iframe'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Iframe</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Iframe'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Iframe</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Iframe'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Iframe</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Iframe'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Iframe</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Iframe'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Iframe</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 192
            ],
            // ============================================
            // CANVAS
            // ============================================
            [
                'name' => 'Canvas',
                'type' => 'mod-canvas',
                'component_type' => 'element',
                'category' => 'media',
                'alphabet_group' => 'C',
                'description' => 'HTML5 canvas',
                'icon' => 'Image',
                'default_props' => ['content' => 'Canvas'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Canvas']],
                'render_template' => 'canvas-template',
                'code_generators' => ['react-tailwind' => 'templates/media/canvas.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Canvas'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Canvas</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Canvas'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Canvas</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Canvas'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Canvas</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Canvas'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Canvas</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Canvas'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Canvas</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Canvas'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Canvas</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 193
            ],
            // ============================================
            // PICTURE
            // ============================================
            [
                'name' => 'Picture',
                'type' => 'mod-picture',
                'component_type' => 'element',
                'category' => 'media',
                'alphabet_group' => 'P',
                'description' => 'Responsive picture',
                'icon' => 'Image',
                'default_props' => ['content' => 'Picture'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Picture']],
                'render_template' => 'picture-template',
                'code_generators' => ['react-tailwind' => 'templates/media/picture.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Picture'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Picture</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Picture'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Picture</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Picture'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Picture</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Picture'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Picture</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Picture'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Picture</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Picture'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Picture</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 194
            ],
            // ============================================
            // FIGURE
            // ============================================
            [
                'name' => 'Figure',
                'type' => 'mod-figure',
                'component_type' => 'element',
                'category' => 'media',
                'alphabet_group' => 'F',
                'description' => 'Figure with caption',
                'icon' => 'Image',
                'default_props' => ['content' => 'Figure'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Figure']],
                'render_template' => 'figure-template',
                'code_generators' => ['react-tailwind' => 'templates/media/figure.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Figure'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Figure</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Figure'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Figure</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Figure'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Figure</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Figure'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Figure</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Figure'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Figure</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Figure'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Figure</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 195
            ],
            // ============================================
            // ORDERED LIST
            // ============================================
            [
                'name' => 'Ordered List',
                'type' => 'mod-ol',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'O',
                'description' => 'Numbered list',
                'icon' => 'List',
                'default_props' => ['content' => 'Ordered List'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Ordered List']],
                'render_template' => 'ol-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/ol.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Ordered List'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Ordered List</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Ordered List'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Ordered List</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Ordered List'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Ordered List</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Ordered List'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Ordered List</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Ordered List'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Ordered List</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Ordered List'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Ordered List</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 196
            ],
            // ============================================
            // UNORDERED LIST
            // ============================================
            [
                'name' => 'Unordered List',
                'type' => 'mod-ul',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'U',
                'description' => 'Bulleted list',
                'icon' => 'List',
                'default_props' => ['content' => 'Unordered List'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Unordered List']],
                'render_template' => 'ul-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/ul.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Unordered List'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Unordered List</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Unordered List'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Unordered List</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Unordered List'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Unordered List</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Unordered List'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Unordered List</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Unordered List'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Unordered List</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Unordered List'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Unordered List</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 197
            ],
            // ============================================
            // LIST ITEM
            // ============================================
            [
                'name' => 'List Item',
                'type' => 'mod-li',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'L',
                'description' => 'List item element',
                'icon' => 'Minus',
                'default_props' => ['content' => 'List Item'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'List Item']],
                'render_template' => 'li-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/li.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'List Item'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">List Item</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'List Item'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">List Item</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'List Item'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">List Item</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'List Item'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">List Item</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'List Item'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">List Item</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'List Item'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">List Item</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 198
            ],
            // ============================================
            // DESCRIPTION LIST
            // ============================================
            [
                'name' => 'Description List',
                'type' => 'mod-dl',
                'component_type' => 'element',
                'category' => 'layout',
                'alphabet_group' => 'D',
                'description' => 'Description list',
                'icon' => 'List',
                'default_props' => ['content' => 'Description List'],
                'prop_definitions' => ['content' => ['type' => 'textarea', 'label' => 'Content', 'default' => 'Description List']],
                'render_template' => 'dl-template',
                'code_generators' => ['react-tailwind' => 'templates/layout/dl.js'],
                'variants' => [
                    [
                        'name' => 'Default',
                        'description' => 'Unstyled default',
                        'props' => ['content' => 'Description List'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '400', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 400; color: #111827;">Description List</div>'
                    ],
                    [
                        'name' => 'Modern',
                        'description' => 'Clean modern style',
                        'props' => ['content' => 'Description List'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '500', 'color' => '#000000'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 500; color: #000000;">Description List</div>'
                    ],
                    [
                        'name' => 'Bold',
                        'description' => 'Bold emphasis',
                        'props' => ['content' => 'Description List'],
                        'style' => ['fontSize' => '16px', 'fontWeight' => '700', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 16px; font-weight: 700; color: #111827;">Description List</div>'
                    ],
                    [
                        'name' => 'Light',
                        'description' => 'Light weight',
                        'props' => ['content' => 'Description List'],
                        'style' => ['fontSize' => '14px', 'fontWeight' => '300', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 14px; font-weight: 300; color: #6b7280;">Description List</div>'
                    ],
                    [
                        'name' => 'Large',
                        'description' => 'Larger size',
                        'props' => ['content' => 'Description List'],
                        'style' => ['fontSize' => '18px', 'fontWeight' => '600', 'color' => '#111827'],
                        'preview_code' => '<div style="font-size: 18px; font-weight: 600; color: #111827;">Description List</div>'
                    ],
                    [
                        'name' => 'Small',
                        'description' => 'Smaller size',
                        'props' => ['content' => 'Description List'],
                        'style' => ['fontSize' => '12px', 'fontWeight' => '400', 'color' => '#6b7280'],
                        'preview_code' => '<div style="font-size: 12px; font-weight: 400; color: #6b7280;">Description List</div>'
                    ],
                ],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 199
            ],
        ];

        foreach ($modernElements as $element) {
            Component::create($element);
        }
    }
}
