<?php
// database/seeders/DatabaseSeeder.php - Updated with all new seeders
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
      
        \App\Models\User::factory()->create([
            'name' => 'Mizumi',
            'email' => 'mizumi@gmail.com',
            'password' => 'mizumi123',
            'platform_role' => 'admin',
        ]);
        
        // Clear existing components first
        \DB::table('components')->truncate();
        
        $this->command->info('🧹 Cleared existing components');
        
        // Seed all component types
        $this->call([
            // Original seeders (updated)
            ComponentSeeder::class,
            LayoutElementSeeder::class,
            ChartComponentSeeder::class,
            
            // NEW: Advanced component seeders
            FormComponentSeeder::class,
            MediaComponentSeeder::class,
            ThreeDAnimationSeeder::class,
            EcommerceMarketingSeeder::class,
            ContentMapSeeder::class,
            InteractiveAdvancedSeeder::class,
        ]);
        
        $this->command->info('🎉 All components seeded successfully!');
        
        // Display component count
        $totalComponents = \DB::table('components')->count();
        $this->command->info("📦 Total components: {$totalComponents}");
        
        // Display breakdown by category
        $breakdown = \DB::table('components')
            ->select('category', \DB::raw('count(*) as count'))
            ->groupBy('category')
            ->orderBy('count', 'desc')
            ->get();
            
        $this->command->info('📊 Component breakdown by category:');
        foreach ($breakdown as $item) {
            $this->command->info("   {$item->category}: {$item->count} components");
        }
        
        // Display breakdown by type
        $typeBreakdown = \DB::table('components')
            ->select('component_type', \DB::raw('count(*) as count'))
            ->groupBy('component_type')
            ->get();
            
        $this->command->info('🔧 Component breakdown by type:');
        foreach ($typeBreakdown as $item) {
            $this->command->info("   {$item->component_type}: {$item->count} components");
        }
    }
}