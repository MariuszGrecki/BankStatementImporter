<?php

namespace Database\Factories;

use App\Casts\MoneyCast;
use App\Models\Category;
use App\Models\Import;
use App\Models\Transaction;
use Brick\Money\Money;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'import_id' => Import::factory(),
            'bank_account_id' => fn (array $attributes) => Import::query()->findOrFail((int) $attributes['import_id'])->bank_account_id,
            'category_id' => null,
            'booked_on' => fake()->dateTimeBetween('-1 year'),
            'amount' => Money::ofMinor(fake()->randomElement([-1, 1]) * fake()->numberBetween(100, 500_000), MoneyCast::CURRENCY),
            'description' => fake()->randomElement(['Zakupy spożywcze', 'Opłata za prąd', 'Przelew własny', 'Paliwo', 'Subskrypcja', 'Zwrot za zakupy']),
            'counterparty' => fake()->optional(0.8)->company(),
        ];
    }

    public function expense(): static
    {
        return $this->state(fn (array $attributes) => [
            'amount' => $attributes['amount']->abs()->negated(),
        ]);
    }

    public function income(): static
    {
        return $this->state(fn (array $attributes) => [
            'amount' => $attributes['amount']->abs(),
        ]);
    }

    public function withCategory(): static
    {
        return $this->state([
            'category_id' => fn (array $attributes) => Category::factory()->state([
                'user_id' => Import::query()->findOrFail((int) $attributes['import_id'])->user_id,
            ]),
        ]);
    }
}
