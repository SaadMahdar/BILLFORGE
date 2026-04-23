<?php

namespace Database\Factories;

use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
{
    return [
        'client_name' => fake()->company(),
        'invoice_number' => 'INV-' . fake()->unique()->randomNumber(5, true),
        'total_amount' => fake()->randomFloat(2, 100, 5000),
        'issue_date' => fake()->date(),
    ];
}
}