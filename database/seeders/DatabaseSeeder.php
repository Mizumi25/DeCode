<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Example user
        \App\Models\User::factory()->create([
            'name' => 'Mizumi',
            'email' => 'mizumi@gmail.com',
            'password' => 'mizumi123',
            'platform_role' => 'admin',
        ]);

        // Call ComponentSeeder
        $this->call([
            ComponentSeeder::class,
            LayoutElementSeeder::class,
            ChartComponentSeeder::class,
            TextComponentSeeder::class,
        ]);
    }
}
