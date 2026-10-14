<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\CategoryRule;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CategoryRule>
 */
class CategoryRuleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => fn (array $attributes) => Category::factory()->state(['user_id' => $attributes['user_id']]),
            'pattern' => fake()->randomElement(['BIEDRONKA', 'ORLEN', 'NETFLIX', 'ZABKA', 'UBER', 'ALLEGRO']),
            'position' => fake()->numberBetween(1, 1000),
        ];
    }
}
