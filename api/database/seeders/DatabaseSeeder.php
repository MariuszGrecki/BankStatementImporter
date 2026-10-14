<?php

namespace Database\Seeders;

use App\Models\BankAccount;
use App\Models\Category;
use App\Models\CategoryRule;
use App\Models\Import;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    private const TRANSACTIONS_PER_IMPORT = 300;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $mainAccount = BankAccount::factory()->for($user)->create(['name' => 'mBank - konto osobiste']);
        $savingsAccount = BankAccount::factory()->for($user)->create(['name' => 'PKO BP - oszczędności']);

        $food = Category::factory()->for($user)->create(['name' => 'Jedzenie']);
        $transport = Category::factory()->for($user)->create(['name' => 'Transport']);
        $bills = Category::factory()->for($user)->create(['name' => 'Rachunki']);
        $entertainment = Category::factory()->for($user)->create(['name' => 'Rozrywka']);
        $health = Category::factory()->for($user)->create(['name' => 'Zdrowie']);
        $categories = collect([$food, $transport, $bills, $entertainment, $health]);

        $rules = [['BIEDRONKA', $food], ['ORLEN', $transport], ['NETFLIX', $entertainment]];

        foreach ($rules as $index => [$pattern, $category]) {
            CategoryRule::factory()
                ->for($user)
                ->for($category)
                ->create(['pattern' => $pattern, 'position' => $index + 1]);
        }

        $import = Import::factory()
            ->for($user)
            ->for($mainAccount)
            ->create([
                'total_rows' => self::TRANSACTIONS_PER_IMPORT,
                'imported_rows' => self::TRANSACTIONS_PER_IMPORT,
                'skipped_rows' => 0,
            ]);

        Transaction::factory()
            ->count(self::TRANSACTIONS_PER_IMPORT)
            ->for($import)
            ->state(fn () => ['category_id' => fake()->boolean(60) ? $categories->random()->id : null])
            ->create();

        Import::factory()
            ->failed()
            ->for($user)
            ->for($savingsAccount)
            ->create();
    }
}
