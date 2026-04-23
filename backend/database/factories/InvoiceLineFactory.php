<?php

namespace Database\Factories;

use App\Models\InvoiceLine;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InvoiceLine>
 */
class InvoiceLineFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
{
    return [
        'description' => fake()->sentence(3),
        'quantity' => fake()->numberBetween(1, 10),
        'unit_price' => fake()->randomFloat(2, 10, 500),
    ];
}
}
