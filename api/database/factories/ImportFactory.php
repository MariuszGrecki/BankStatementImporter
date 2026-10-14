<?php

namespace Database\Factories;

use App\Enums\ImportStatus;
use App\Models\BankAccount;
use App\Models\Import;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<Import>
 */
class ImportFactory extends Factory
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
            'bank_account_id' => fn (array $attributes) => BankAccount::factory()->state(['user_id' => $attributes['user_id']]),
            'status' => ImportStatus::COMPLETED->value,
            'original_filename' => 'wyciag-'.fake()->date('Y-m').'.csv',
            'file_path' => 'imports/'.fake()->uuid().'.csv',
            'total_rows' => fake()->numberBetween(50, 2000),
            'skipped_rows' => fn (array $attributes) => fake()->numberBetween(0, min(10, $attributes['total_rows'])),
            'imported_rows' => fn (array $attributes) => $attributes['total_rows'] - $attributes['skipped_rows'],
            'started_at' => fake()->dateTimeBetween('-1 year', '-1 day'),
            'finished_at' => fn (array $attributes) => Carbon::instance($attributes['started_at'])->addSeconds(fake()->numberBetween(5, 120)),
        ];
    }

    public function queued(): static
    {
        return $this->state([
            'status' => ImportStatus::QUEUED->value,
            'total_rows' => null,
            'imported_rows' => 0,
            'skipped_rows' => 0,
            'started_at' => null,
            'finished_at' => null,
        ]);
    }

    public function failed(): static
    {
        return $this->state([
            'status' => ImportStatus::FAILED->value,
            'imported_rows' => 0,
            'skipped_rows' => 0,
            'error_message' => 'Nie udało się przetworzyć pliku.',
        ]);
    }

    public function rolledBack(): static
    {
        return $this->state([
            'status' => ImportStatus::ROLLED_BACK->value,
            'rolled_back_at' => fn (array $attributes) => Carbon::instance($attributes['finished_at'])->addHour(),
        ]);
    }
}
