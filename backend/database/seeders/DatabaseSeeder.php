<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run()
{
    \App\Models\Invoice::factory(50)
        ->has(\App\Models\InvoiceLine::factory()->count(random_int(3, 6)), 'lines')
        ->create();
}
}
