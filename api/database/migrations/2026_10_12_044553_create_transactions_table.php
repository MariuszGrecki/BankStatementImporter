<?php

use App\Models\BankAccount;
use App\Models\Category;
use App\Models\Import;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(BankAccount::class)
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignIdFor(Import::class)
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignIdFor(Category::class)
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->date('booked_on');
            $table->decimal('amount', 12, 2);
            $table->text('description');
            $table->string('counterparty', 255)->nullable();
            $table->timestamps();

            $table->index(['bank_account_id', 'booked_on']);
            $table->index('import_id');
            $table->index('category_id');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
