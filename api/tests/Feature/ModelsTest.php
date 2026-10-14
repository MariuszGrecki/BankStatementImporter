<?php

use App\Models\BankAccount;
use App\Models\Category;
use App\Models\CategoryRule;
use App\Models\Import;
use App\Models\Transaction;
use App\Models\User;

function seedGraph(): array
{
    $user = User::factory()->create();
    $account = BankAccount::factory()->for($user)->create();
    $category = Category::factory()->for($user)->create();
    CategoryRule::factory()->for($user)->for($category)->create();
    $import = Import::factory()->for($user)->for($account)->create();
    Transaction::factory()->count(3)->for($import)->create(['category_id' => $category->id]);

    return compact('user', 'account', 'category', 'import');
}

it('creates a valid record with every factory', function (string $model) {
    expect($model::factory()->create()->exists)->toBeTrue();
})->with([
    User::class,
    BankAccount::class,
    Category::class,
    Import::class,
    Transaction::class,
    CategoryRule::class,
]);

it('keeps a transaction consistent with its import and owner', function () {
    $transaction = Transaction::factory()->withCategory()->create();

    expect($transaction->bank_account_id)->toBe($transaction->import->bank_account_id)
        ->and($transaction->category->user_id)->toBe($transaction->bankAccount->user_id);
});

it('fills in the default status of a new import', function () {
    $import = Import::forceCreate([
        'user_id' => User::factory()->create()->id,
        'bank_account_id' => BankAccount::factory()->create()->id,
        'original_filename' => 'wyciag.csv',
        'file_path' => 'imports/wyciag.csv',
    ]);

    expect($import->getAttributes()['status'])->toBe('queued');
});

it('deletes everything that belongs to a deleted user', function () {
    seedGraph()['user']->delete();

    expect(User::count())->toBe(0)
        ->and(BankAccount::count())->toBe(0)
        ->and(Category::count())->toBe(0)
        ->and(CategoryRule::count())->toBe(0)
        ->and(Import::count())->toBe(0)
        ->and(Transaction::count())->toBe(0);
});

it('keeps transactions of a deleted category and clears their category', function () {
    seedGraph()['category']->delete();

    expect(Transaction::count())->toBe(3)
        ->and(Transaction::whereNotNull('category_id')->count())->toBe(0)
        ->and(CategoryRule::count())->toBe(0);
});

it('deletes the transactions of a deleted import but keeps the account', function () {
    seedGraph()['import']->delete();

    expect(Transaction::count())->toBe(0)
        ->and(BankAccount::count())->toBe(1);
});

it('deletes the imports and transactions of a deleted bank account', function () {
    seedGraph()['account']->delete();

    expect(Import::count())->toBe(0)
        ->and(Transaction::count())->toBe(0)
        ->and(User::count())->toBe(1);
});
