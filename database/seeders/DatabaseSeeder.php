<?php
// database/seeders/DatabaseSeeder.php - Complete with all seeders
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
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
            // Pseudo text first (special case)
            TextPseudoElementSeeder::class,
            
            // Semantic text elements
            SemanticTextElementsSeeder::class,
            
            // Layout containers
            LayoutContainerSeeder::class,
            
            // Basic elements
            BasicElementsSeeder::class,
            
            // Form elements
            FormElementsSeeder::class,
            
            // Advanced components
            AdvancedComponentsSeeder::class,
            
            // 3D and interactive
            Advanced3DAndInteractiveSeeder::class,
            
            // Media and special
            MediaAndSpecialSeeder::class,
            
            // Non-component panel seeders
            CustomIconSeeder::class,
            AssetSeeder::class,
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
        
        // Display breakdown by type (element vs component)
        $typeBreakdown = \DB::table('components')
            ->select('component_type', \DB::raw('count(*) as count'))
            ->groupBy('component_type')
            ->get();
            
        $this->command->info('🔧 Component breakdown by type:');
        foreach ($typeBreakdown as $item) {
            $this->command->info("   {$item->component_type}: {$item->count} components");
        }
        
        // Display alphabet distribution
        $alphabetBreakdown = \DB::table('components')
            ->select('alphabet_group', \DB::raw('count(*) as count'))
            ->whereNotNull('alphabet_group')
            ->groupBy('alphabet_group')
            ->orderBy('alphabet_group')
            ->get();
            
        $this->command->info('🔤 Alphabet distribution:');
        foreach ($alphabetBreakdown as $item) {
            $this->command->info("   {$item->alphabet_group}: {$item->count} components");
        }
        
        $this->command->info('✨ Database seeding completed successfully!');
    }
}