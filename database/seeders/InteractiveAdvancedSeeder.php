<?php
// database/seeders/InteractiveAdvancedSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class InteractiveAdvancedSeeder extends Seeder
{
    public function run(): void
    {
        $interactiveComponents = [
            [
                'name' => 'Drag Drop Builder',
                'type' => 'drag-drop-builder',
                'component_type' => 'component',
                'category' => 'interactive',
                'alphabet_group' => 'D',
                'description' => 'Drag and drop interface builder',
                'icon' => 'Move',
                'default_props' => [
                    'items' => [
                        ['id' => 1, 'type' => 'text', 'content' => 'Draggable Text'],
                        ['id' => 2, 'type' => 'image', 'content' => 'Image Placeholder'],
                        ['id' => 3, 'type' => 'button', 'content' => 'Draggable Button']
                    ],
                    'allowReorder' => true,
                    'showTrash' => true
                ],
                'prop_definitions' => [
                    'allowReorder' => ['type' => 'boolean', 'label' => 'Allow Reorder', 'default' => true],
                    'showTrash' => ['type' => 'boolean', 'label' => 'Show Delete Zone', 'default' => true]
                ],
                'render_template' => 'drag-drop-builder-template',
                'code_generators' => ['dnd-kit' => 'templates/interactive/drag-drop-builder.js'],
                'variants' => [
                    [
                        'name' => 'Form Builder',
                        'description' => 'Drag and drop form builder',
                        'props' => ['variant' => 'form', 'formElements' => true],
                        'preview_code' => '<div class="grid grid-cols-2 gap-6"><div class="bg-gray-50 p-4 rounded-lg"><h3 class="font-semibold mb-4">Elements</h3><div class="space-y-2"><div class="bg-white p-3 rounded border cursor-move hover:shadow-md transition-shadow">📝 Text Input</div><div class="bg-white p-3 rounded border cursor-move hover:shadow-md transition-shadow">☑️ Checkbox</div><div class="bg-white p-3 rounded border cursor-move hover:shadow-md transition-shadow">🔘 Radio Button</div></div></div><div class="bg-white border-2 border-dashed border-gray-300 p-4 rounded-lg min-h-64"><h3 class="font-semibold mb-4">Drop Zone</h3><div class="text-gray-500 text-center">Drag elements here to build your form</div></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'drag',
                'sort_order' => 1
            ],
            [
                'name' => 'Virtual Scroller',
                'type' => 'virtual-scroller',
                'component_type' => 'component',
                'category' => 'interactive',
                'alphabet_group' => 'V',
                'description' => 'High-performance virtual scrolling list',
                'icon' => 'ScrollText',
                'default_props' => [
                    'itemCount' => 10000,
                    'itemHeight' => 50,
                    'visibleHeight' => 300,
                    'overscan' => 5
                ],
                'prop_definitions' => [
                    'itemCount' => ['type' => 'number', 'label' => 'Item Count', 'default' => 1000],
                    'itemHeight' => ['type' => 'number', 'label' => 'Item Height (px)', 'default' => 50],
                    'visibleHeight' => ['type' => 'number', 'label' => 'Container Height (px)', 'default' => 300]
                ],
                'render_template' => 'virtual-scroller-template',
                'code_generators' => ['react-window' => 'templates/interactive/virtual-scroller.js'],
                'variants' => [],
                'has_animation' => true,
                'animation_type' => 'scroll',
                'sort_order' => 2
            ],
            [
                'name' => 'Command Palette',
                'type' => 'command-palette',
                'component_type' => 'component',
                'category' => 'interactive',
                'alphabet_group' => 'C',
                'description' => 'Command palette with fuzzy search',
                'icon' => 'Command',
                'default_props' => [
                    'commands' => [
                        ['id' => 'new-file', 'label' => 'Create New File', 'shortcut' => 'Ctrl+N'],
                        ['id' => 'search', 'label' => 'Search Files', 'shortcut' => 'Ctrl+P'],
                        ['id' => 'settings', 'label' => 'Open Settings', 'shortcut' => 'Ctrl+,']
                    ],
                    'placeholder' => 'Type a command...',
                    'showShortcuts' => true
                ],
                'prop_definitions' => [
                    'placeholder' => ['type' => 'string', 'label' => 'Placeholder Text'],
                    'showShortcuts' => ['type' => 'boolean', 'label' => 'Show Shortcuts', 'default' => true]
                ],
                'render_template' => 'command-palette-template',
                'code_generators' => ['cmdk' => 'templates/interactive/command-palette.js'],
                'variants' => [],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 3
            ],
            [
                'name' => 'Kanban Board',
                'type' => 'kanban-board',
                'component_type' => 'component',
                'category' => 'interactive',
                'alphabet_group' => 'K',
                'description' => 'Draggable Kanban board for project management',
                'icon' => 'Columns',
                'default_props' => [
                    'columns' => [
                        [
                            'id' => 'todo',
                            'title' => 'To Do',
                            'items' => [
                                ['id' => 1, 'title' => 'Task 1', 'description' => 'Description for task 1'],
                                ['id' => 2, 'title' => 'Task 2', 'description' => 'Description for task 2']
                            ]
                        ],
                        [
                            'id' => 'progress',
                            'title' => 'In Progress',
                            'items' => [
                                ['id' => 3, 'title' => 'Task 3', 'description' => 'Description for task 3']
                            ]
                        ],
                        [
                            'id' => 'done',
                            'title' => 'Done',
                            'items' => []
                        ]
                    ]
                ],
                'prop_definitions' => [
                    'allowAddColumn' => ['type' => 'boolean', 'label' => 'Allow Add Column', 'default' => true],
                    'allowAddCard' => ['type' => 'boolean', 'label' => 'Allow Add Card', 'default' => true]
                ],
                'render_template' => 'kanban-board-template',
                'code_generators' => ['dnd-kit' => 'templates/interactive/kanban-board.js'],
                'variants' => [
                    [
                        'name' => 'Sprint Board',
                        'description' => 'Agile sprint planning board',
                        'props' => ['variant' => 'sprint', 'showPoints' => true],
                        'preview_code' => '<div class="flex gap-4 p-4 bg-gray-50 rounded-lg overflow-x-auto"><div class="flex-shrink-0 w-72 bg-white rounded-lg p-4 shadow-sm"><div class="flex items-center justify-between mb-4"><h3 class="font-semibold text-gray-800">📋 Backlog</h3><span class="text-xs bg-gray-100 px-2 py-1 rounded-full">3</span></div><div class="space-y-3"><div class="bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-move hover:shadow-md transition-shadow"><h4 class="font-medium text-sm">User Authentication</h4><div class="flex items-center justify-between mt-2"><span class="text-xs text-gray-600">Frontend</span><span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">5 pts</span></div></div></div></div><div class="flex-shrink-0 w-72 bg-white rounded-lg p-4 shadow-sm"><div class="flex items-center justify-between mb-4"><h3 class="font-semibold text-gray-800">⚡ In Progress</h3><span class="text-xs bg-yellow-100 px-2 py-1 rounded-full">1</span></div><div class="space-y-3"><div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 cursor-move"><h4 class="font-medium text-sm">API Integration</h4><div class="flex items-center justify-between mt-2"><span class="text-xs text-gray-600">Backend</span><span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">8 pts</span></div></div></div></div><div class="flex-shrink-0 w-72 bg-white rounded-lg p-4 shadow-sm"><div class="flex items-center justify-between mb-4"><h3 class="font-semibold text-gray-800">✅ Done</h3><span class="text-xs bg-green-100 px-2 py-1 rounded-full">2</span></div><div class="space-y-3"><div class="bg-green-50 border border-green-200 rounded-lg p-3"><h4 class="font-medium text-sm">Database Setup</h4><div class="flex items-center justify-between mt-2"><span class="text-xs text-gray-600">DevOps</span><span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">3 pts</span></div></div></div></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'drag',
                'sort_order' => 4
            ],
            [
                'name' => 'Data Visualization',
                'type' => 'data-visualization',
                'component_type' => 'component',
                'category' => 'interactive',
                'alphabet_group' => 'D',
                'description' => 'Interactive data visualization with D3.js',
                'icon' => 'TrendingUp',
                'default_props' => [
                    'type' => 'scatter',
                    'data' => [
                        ['x' => 10, 'y' => 20, 'category' => 'A'],
                        ['x' => 25, 'y' => 35, 'category' => 'B'],
                        ['x' => 40, 'y' => 15, 'category' => 'A'],
                        ['x' => 30, 'y' => 45, 'category' => 'C']
                    ],
                    'interactive' => true,
                    'showTooltip' => true
                ],
                'prop_definitions' => [
                    'type' => ['type' => 'select', 'label' => 'Visualization Type', 'options' => ['scatter', 'bubble', 'heatmap', 'network'], 'default' => 'scatter'],
                    'interactive' => ['type' => 'boolean', 'label' => 'Interactive', 'default' => true],
                    'showTooltip' => ['type' => 'boolean', 'label' => 'Show Tooltips', 'default' => true]
                ],
                'render_template' => 'data-visualization-template',
                'code_generators' => ['d3' => 'templates/interactive/data-visualization.js'],
                'variants' => [
                    [
                        'name' => 'Network Graph',
                        'description' => 'Interactive network visualization',
                        'props' => ['type' => 'network', 'physics' => true],
                        'preview_code' => '<div class="bg-gray-900 rounded-lg p-6 h-64 relative overflow-hidden"><div class="absolute inset-0 flex items-center justify-center"><div class="relative w-48 h-48"><div class="absolute top-8 left-8 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div><div class="absolute top-16 right-12 w-3 h-3 bg-green-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div><div class="absolute bottom-12 left-16 w-5 h-5 bg-purple-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div><div class="absolute bottom-8 right-8 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style="animation-delay: 0.6s"></div><svg class="absolute inset-0 w-full h-full"><line x1="20%" y1="25%" x2="65%" y2="40%" stroke="rgba(59, 130, 246, 0.4)" stroke-width="1"/><line x1="65%" y1="40%" x2="35%" y2="75%" stroke="rgba(16, 185, 129, 0.4)" stroke-width="1"/><line x1="35%" y1="75%" x2="65%" y2="85%" stroke="rgba(168, 85, 247, 0.4)" stroke-width="1"/></svg></div></div><div class="absolute bottom-4 left-4 text-white text-sm font-medium">Network Visualization</div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'd3',
                'sort_order' => 5
            ],
            [
                'name' => 'Sortable List',
                'type' => 'sortable-list',
                'component_type' => 'component',
                'category' => 'interactive',
                'alphabet_group' => 'S',
                'description' => 'Drag and drop sortable list component',
                'icon' => 'ArrowUpDown',
                'default_props' => [
                    'items' => [
                        ['id' => 1, 'text' => 'First Item'],
                        ['id' => 2, 'text' => 'Second Item'],
                        ['id' => 3, 'text' => 'Third Item'],
                        ['id' => 4, 'text' => 'Fourth Item']
                    ],
                    'showHandles' => true,
                    'animation' => true
                ],
                'prop_definitions' => [
                    'showHandles' => ['type' => 'boolean', 'label' => 'Show Drag Handles', 'default' => true],
                    'animation' => ['type' => 'boolean', 'label' => 'Enable Animation', 'default' => true]
                ],
                'render_template' => 'sortable-list-template',
                'code_generators' => ['dnd-kit' => 'templates/interactive/sortable-list.js'],
                'variants' => [
                    [
                        'name' => 'Priority List',
                        'description' => 'Sortable priority task list',
                        'props' => ['variant' => 'priority', 'showPriority' => true],
                        'preview_code' => '<div class="bg-white rounded-lg border p-4 max-w-md"><h3 class="font-semibold mb-4">Task Priority</h3><div class="space-y-2"><div class="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg cursor-move"><div class="w-6 h-6 flex items-center justify-center text-red-600"><svg class="w-4 h-4"><path d="M4 6h16M4 12h16M4 18h16"/></svg></div><div class="flex-1"><span class="font-medium">Critical Bug Fix</span><div class="text-xs text-red-600 font-medium">HIGH PRIORITY</div></div></div><div class="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-move"><div class="w-6 h-6 flex items-center justify-center text-yellow-600"><svg class="w-4 h-4"><path d="M4 6h16M4 12h16M4 18h16"/></svg></div><div class="flex-1"><span class="font-medium">Feature Update</span><div class="text-xs text-yellow-600 font-medium">MEDIUM PRIORITY</div></div></div></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'drag',
                'sort_order' => 6
            ],
            [
                'name' => 'Chat Interface',
                'type' => 'chat-interface',
                'component_type' => 'component',
                'category' => 'interactive',
                'alphabet_group' => 'C',
                'description' => 'Real-time chat interface with typing indicators',
                'icon' => 'MessageSquare',
                'default_props' => [
                    'messages' => [
                        ['id' => 1, 'sender' => 'Alice', 'text' => 'Hey there!', 'timestamp' => '10:30 AM', 'isMe' => false],
                        ['id' => 2, 'sender' => 'Me', 'text' => 'Hello! How are you?', 'timestamp' => '10:31 AM', 'isMe' => true],
                        ['id' => 3, 'sender' => 'Alice', 'text' => 'I\'m doing great, thanks for asking!', 'timestamp' => '10:32 AM', 'isMe' => false]
                    ],
                    'showTypingIndicator' => true,
                    'showTimestamps' => true,
                    'enableEmojis' => true
                ],
                'prop_definitions' => [
                    'showTypingIndicator' => ['type' => 'boolean', 'label' => 'Show Typing Indicator', 'default' => true],
                    'showTimestamps' => ['type' => 'boolean', 'label' => 'Show Timestamps', 'default' => true],
                    'enableEmojis' => ['type' => 'boolean', 'label' => 'Enable Emojis', 'default' => true]
                ],
                'render_template' => 'chat-interface-template',
                'code_generators' => ['react-tailwind' => 'templates/interactive/chat-interface.js'],
                'variants' => [
                    [
                        'name' => 'Support Chat',
                        'description' => 'Customer support chat widget',
                        'props' => ['variant' => 'support', 'showAgent' => true],
                        'preview_code' => '<div class="bg-white rounded-2xl shadow-xl max-w-sm w-full h-96 flex flex-col"><div class="bg-blue-600 text-white p-4 rounded-t-2xl flex items-center gap-3"><div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">👩‍💼</div><div><div class="font-semibold">Sarah - Support</div><div class="text-xs opacity-80">Online now</div></div></div><div class="flex-1 p-4 space-y-3 overflow-y-auto"><div class="flex gap-2"><div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">S</div><div class="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2 max-w-xs"><p class="text-sm">Hi! How can I help you today?</p><span class="text-xs text-gray-500">2:34 PM</span></div></div><div class="flex gap-2 justify-end"><div class="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-xs"><p class="text-sm">I need help with my account</p><span class="text-xs opacity-80">2:35 PM</span></div></div></div><div class="p-4 border-t"><div class="flex gap-2"><input class="flex-1 border rounded-full px-4 py-2 text-sm" placeholder="Type a message..." /><button class="bg-blue-600 text-white rounded-full p-2"><svg class="w-4 h-4"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg></button></div></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 7
            ]
        ];

        foreach ($interactiveComponents as $component) {
            Component::create($component);
        }
    }
}