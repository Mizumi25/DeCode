<?php
// database/seeders/ChartComponentSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Component;

class ChartComponentSeeder extends Seeder
{
    public function run(): void
    {
        $chartComponents = [
            // CHART COMPONENTS
            [
                'name' => 'Line Chart',
                'type' => 'line-chart',
                'component_type' => 'component',
                'category' => 'charts',
                'alphabet_group' => 'L',
                'description' => 'Interactive line chart for showing trends over time',
                'icon' => 'TrendingUp',
                'default_props' => [
                    'data' => [
                        ['month' => 'Jan', 'sales' => 4000, 'users' => 2400],
                        ['month' => 'Feb', 'sales' => 3000, 'users' => 1398],
                        ['month' => 'Mar', 'sales' => 2000, 'users' => 9800],
                        ['month' => 'Apr', 'sales' => 2780, 'users' => 3908],
                        ['month' => 'May', 'sales' => 1890, 'users' => 4800],
                        ['month' => 'Jun', 'sales' => 2390, 'users' => 3800],
                    ],
                    'xKey' => 'month',
                    'yKeys' => ['sales', 'users'],
                    'colors' => ['#8884d8', '#82ca9d'],
                    'width' => 600,
                    'height' => 300
                ],
                'prop_definitions' => [
                    'data' => ['type' => 'array', 'label' => 'Chart Data', 'default' => []],
                    'xKey' => ['type' => 'string', 'label' => 'X-Axis Key', 'default' => 'x'],
                    'yKeys' => ['type' => 'array', 'label' => 'Y-Axis Keys', 'default' => ['y']],
                    'colors' => ['type' => 'array', 'label' => 'Line Colors', 'default' => ['#8884d8']],
                    'width' => ['type' => 'number', 'label' => 'Width', 'default' => 600],
                    'height' => ['type' => 'number', 'label' => 'Height', 'default' => 300]
                ],
                'render_template' => 'line-chart-template',
                'code_generators' => ['react-recharts' => 'templates/charts/line-chart.js'],
                'variants' => [
                    [
                        'name' => 'Sales Trend',
                        'description' => 'Monthly sales performance chart',
                        'props' => ['data' => [['month' => 'Q1', 'value' => 45000], ['month' => 'Q2', 'value' => 52000]]],
                        'preview_code' => '<div className="w-full h-64 bg-white p-4 rounded-lg border"><div className="h-full flex items-end justify-around"><div className="bg-blue-500 w-8" style={{height: "60%"}}></div><div className="bg-blue-500 w-8" style={{height: "80%"}}></div><div className="bg-blue-500 w-8" style={{height: "45%"}}></div></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'svg',
                'sort_order' => 1
            ],
            [
                'name' => 'Bar Chart',
                'type' => 'bar-chart',
                'component_type' => 'component',
                'category' => 'charts',
                'alphabet_group' => 'B',
                'description' => 'Vertical bar chart for comparing data categories',
                'icon' => 'BarChart3',
                'default_props' => [
                    'data' => [
                        ['category' => 'Product A', 'value' => 4000, 'target' => 4500],
                        ['category' => 'Product B', 'value' => 3000, 'target' => 3200],
                        ['category' => 'Product C', 'value' => 2000, 'target' => 2800],
                        ['category' => 'Product D', 'value' => 2780, 'target' => 3000],
                    ],
                    'xKey' => 'category',
                    'yKey' => 'value',
                    'color' => '#8884d8',
                    'width' => 600,
                    'height' => 300
                ],
                'prop_definitions' => [
                    'data' => ['type' => 'array', 'label' => 'Chart Data'],
                    'xKey' => ['type' => 'string', 'label' => 'Category Key', 'default' => 'category'],
                    'yKey' => ['type' => 'string', 'label' => 'Value Key', 'default' => 'value'],
                    'color' => ['type' => 'color', 'label' => 'Bar Color', 'default' => '#8884d8']
                ],
                'render_template' => 'bar-chart-template',
                'code_generators' => ['react-recharts' => 'templates/charts/bar-chart.js'],
                'variants' => [
                    [
                        'name' => 'Revenue by Product',
                        'description' => 'Product performance comparison',
                        'props' => ['data' => [['name' => 'Mobile', 'value' => 45], ['name' => 'Desktop', 'value' => 55]]],
                        'preview_code' => '<div className="w-full h-48 bg-white p-4 rounded-lg border"><div className="h-full flex items-end gap-2"><div className="bg-green-500 w-12" style={{height: "70%"}}></div><div className="bg-green-500 w-12" style={{height: "90%"}}></div><div className="bg-green-500 w-12" style={{height: "45%"}}></div></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'svg',
                'sort_order' => 2
            ],
            [
                'name' => 'Pie Chart',
                'type' => 'pie-chart',
                'component_type' => 'component',
                'category' => 'charts',
                'alphabet_group' => 'P',
                'description' => 'Circular pie chart for showing proportions',
                'icon' => 'PieChart',
                'default_props' => [
                    'data' => [
                        ['name' => 'Desktop', 'value' => 45, 'color' => '#8884d8'],
                        ['name' => 'Mobile', 'value' => 35, 'color' => '#82ca9d'],
                        ['name' => 'Tablet', 'value' => 20, 'color' => '#ffc658'],
                    ],
                    'centerX' => 200,
                    'centerY' => 150,
                    'radius' => 80
                ],
                'prop_definitions' => [
                    'data' => ['type' => 'array', 'label' => 'Chart Data'],
                    'centerX' => ['type' => 'number', 'label' => 'Center X', 'default' => 200],
                    'centerY' => ['type' => 'number', 'label' => 'Center Y', 'default' => 150]
                ],
                'render_template' => 'pie-chart-template',
                'code_generators' => ['react-recharts' => 'templates/charts/pie-chart.js'],
                'variants' => [
                    [
                        'name' => 'Market Share',
                        'description' => 'Company market share breakdown',
                        'props' => ['data' => [['name' => 'Us', 'value' => 65], ['name' => 'Competitors', 'value' => 35]]],
                        'preview_code' => '<div className="w-48 h-48 bg-white p-4 rounded-lg border flex items-center justify-center"><div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center"><div className="w-8 h-8 bg-white rounded-full"></div></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'svg',
                'sort_order' => 3
            ],
            [
                'name' => 'Area Chart',
                'type' => 'area-chart',
                'component_type' => 'component',
                'category' => 'charts',
                'alphabet_group' => 'A',
                'description' => 'Filled area chart for showing trends with volume',
                'icon' => 'Activity',
                'default_props' => [
                    'data' => [
                        ['month' => 'Jan', 'value' => 400],
                        ['month' => 'Feb', 'value' => 300],
                        ['month' => 'Mar', 'value' => 800],
                        ['month' => 'Apr', 'value' => 780],
                        ['month' => 'May', 'value' => 890],
                        ['month' => 'Jun', 'value' => 390],
                    ],
                    'xKey' => 'month',
                    'yKey' => 'value',
                    'fill' => '#8884d8',
                    'width' => 600,
                    'height' => 300
                ],
                'prop_definitions' => [
                    'data' => ['type' => 'array', 'label' => 'Chart Data'],
                    'xKey' => ['type' => 'string', 'label' => 'X-Axis Key'],
                    'yKey' => ['type' => 'string', 'label' => 'Y-Axis Key'],
                    'fill' => ['type' => 'color', 'label' => 'Fill Color', 'default' => '#8884d8']
                ],
                'render_template' => 'area-chart-template',
                'code_generators' => ['react-recharts' => 'templates/charts/area-chart.js'],
                'variants' => [],
                'has_animation' => true,
                'animation_type' => 'svg',
                'sort_order' => 4
            ],

            // DASHBOARD COMPONENTS
            [
                'name' => 'KPI Card',
                'type' => 'kpi-card',
                'component_type' => 'component',
                'category' => 'dashboard',
                'alphabet_group' => 'K',
                'description' => 'Key Performance Indicator display card',
                'icon' => 'Target',
                'default_props' => [
                    'title' => 'Total Revenue',
                    'value' => '$125,430',
                    'change' => '+12.5%',
                    'trend' => 'up',
                    'icon' => 'DollarSign',
                    'color' => 'green'
                ],
                'prop_definitions' => [
                    'title' => ['type' => 'string', 'label' => 'KPI Title'],
                    'value' => ['type' => 'string', 'label' => 'Main Value'],
                    'change' => ['type' => 'string', 'label' => 'Change Percentage'],
                    'trend' => ['type' => 'select', 'label' => 'Trend', 'options' => ['up', 'down', 'neutral']],
                    'color' => ['type' => 'select', 'label' => 'Color Theme', 'options' => ['green', 'red', 'blue', 'purple']]
                ],
                'render_template' => 'kpi-card-template',
                'code_generators' => ['react-tailwind' => 'templates/dashboard/kpi-card.js'],
                'variants' => [
                    [
                        'name' => 'Revenue KPI',
                        'description' => 'Monthly revenue tracking',
                        'props' => ['title' => 'Monthly Revenue', 'value' => '$45,230', 'change' => '+8.2%'],
                        'preview_code' => '<div className="bg-white p-6 rounded-xl border shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Monthly Revenue</p><p className="text-2xl font-bold">$45,230</p></div><div className="text-green-500 text-sm font-medium">+8.2%</div></div></div>'
                    ]
                ],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 5
            ],
            [
                'name' => 'Stats Grid',
                'type' => 'stats-grid',
                'component_type' => 'component',
                'category' => 'dashboard',
                'alphabet_group' => 'S',
                'description' => 'Grid layout for multiple statistics',
                'icon' => 'Grid3X3',
                'default_props' => [
                    'stats' => [
                        ['label' => 'Total Users', 'value' => '12,543', 'change' => '+2.5%', 'trend' => 'up'],
                        ['label' => 'Revenue', 'value' => '$54,230', 'change' => '+12.1%', 'trend' => 'up'],
                        ['label' => 'Orders', 'value' => '1,429', 'change' => '-1.2%', 'trend' => 'down'],
                        ['label' => 'Conversion', 'value' => '3.24%', 'change' => '+0.5%', 'trend' => 'up'],
                    ],
                    'columns' => 2,
                    'gap' => 4
                ],
                'prop_definitions' => [
                    'stats' => ['type' => 'array', 'label' => 'Statistics Data'],
                    'columns' => ['type' => 'select', 'label' => 'Columns', 'options' => [1, 2, 3, 4]],
                    'gap' => ['type' => 'number', 'label' => 'Gap Size', 'default' => 4]
                ],
                'render_template' => 'stats-grid-template',
                'code_generators' => ['react-tailwind' => 'templates/dashboard/stats-grid.js'],
                'variants' => [],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 6
            ],
            [
                'name' => 'Data Table',
                'type' => 'data-table',
                'component_type' => 'component',
                'category' => 'dashboard',
                'alphabet_group' => 'D',
                'description' => 'Sortable and filterable data table',
                'icon' => 'Table',
                'default_props' => [
                    'columns' => [
                        ['key' => 'name', 'label' => 'Name', 'sortable' => true],
                        ['key' => 'email', 'label' => 'Email', 'sortable' => true],
                        ['key' => 'role', 'label' => 'Role', 'sortable' => false],
                        ['key' => 'status', 'label' => 'Status', 'sortable' => true],
                    ],
                    'data' => [
                        ['name' => 'John Doe', 'email' => 'john@example.com', 'role' => 'Admin', 'status' => 'Active'],
                        ['name' => 'Jane Smith', 'email' => 'jane@example.com', 'role' => 'User', 'status' => 'Active'],
                        ['name' => 'Bob Wilson', 'email' => 'bob@example.com', 'role' => 'User', 'status' => 'Inactive'],
                    ],
                    'striped' => true,
                    'hover' => true
                ],
                'prop_definitions' => [
                    'columns' => ['type' => 'array', 'label' => 'Table Columns'],
                    'data' => ['type' => 'array', 'label' => 'Table Data'],
                    'striped' => ['type' => 'boolean', 'label' => 'Striped Rows'],
                    'hover' => ['type' => 'boolean', 'label' => 'Hover Effect']
                ],
                'render_template' => 'data-table-template',
                'code_generators' => ['react-tailwind' => 'templates/dashboard/data-table.js'],
                'variants' => [],
                'has_animation' => false,
                'animation_type' => null,
                'sort_order' => 7
            ],
            [
                'name' => 'Progress Ring',
                'type' => 'progress-ring',
                'component_type' => 'component',
                'category' => 'dashboard',
                'alphabet_group' => 'P',
                'description' => 'Circular progress indicator',
                'icon' => 'CircularProgress',
                'default_props' => [
                    'value' => 75,
                    'max' => 100,
                    'size' => 120,
                    'strokeWidth' => 8,
                    'color' => '#3b82f6',
                    'backgroundColor' => '#e5e7eb',
                    'showText' => true,
                    'label' => 'Completion'
                ],
                'prop_definitions' => [
                    'value' => ['type' => 'number', 'label' => 'Current Value', 'default' => 0],
                    'max' => ['type' => 'number', 'label' => 'Maximum Value', 'default' => 100],
                    'size' => ['type' => 'number', 'label' => 'Ring Size', 'default' => 120],
                    'strokeWidth' => ['type' => 'number', 'label' => 'Stroke Width', 'default' => 8],
                    'color' => ['type' => 'color', 'label' => 'Progress Color', 'default' => '#3b82f6']
                ],
                'render_template' => 'progress-ring-template',
                'code_generators' => ['react-svg' => 'templates/dashboard/progress-ring.js'],
                'variants' => [],
                'has_animation' => true,
                'animation_type' => 'svg',
                'sort_order' => 8
            ],
            [
                'name' => 'Metric Card',
                'type' => 'metric-card',
                'component_type' => 'component',
                'category' => 'dashboard',
                'alphabet_group' => 'M',
                'description' => 'Card displaying a single metric with trend',
                'icon' => 'TrendingUp',
                'default_props' => [
                    'title' => 'Active Users',
                    'value' => '2,543',
                    'subtitle' => 'Last 30 days',
                    'trend' => 'up',
                    'trendValue' => '+12.5%',
                    'color' => 'blue'
                ],
                'prop_definitions' => [
                    'title' => ['type' => 'string', 'label' => 'Metric Title'],
                    'value' => ['type' => 'string', 'label' => 'Main Value'],
                    'subtitle' => ['type' => 'string', 'label' => 'Subtitle'],
                    'trend' => ['type' => 'select', 'label' => 'Trend', 'options' => ['up', 'down', 'neutral']],
                    'trendValue' => ['type' => 'string', 'label' => 'Trend Value']
                ],
                'render_template' => 'metric-card-template',
                'code_generators' => ['react-tailwind' => 'templates/dashboard/metric-card.js'],
                'variants' => [],
                'has_animation' => true,
                'animation_type' => 'css',
                'sort_order' => 9
            ]
        ];

        foreach ($chartComponents as $component) {
            Component::create($component);
        }
    }
}