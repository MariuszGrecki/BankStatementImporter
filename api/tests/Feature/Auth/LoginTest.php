<?php

use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create([
        'email' => 'jan@example.com',
        'password' => 'sekret123',
    ]);
});

it('logs in with valid credentials and returns a token', function () {
    $this->postJson('/api/login', ['email' => 'Jan@Example.com', 'password' => 'sekret123'])
        ->assertOk()
        ->assertJsonPath('data.id', $this->user->id)
        ->assertJsonStructure(['token']);
});

it('rejects invalid credentials with a validation error on email', function (string $email, string $password) {
    $this->postJson('/api/login', ['email' => $email, 'password' => $password])
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors(['email'])
        ->assertJsonMissingPath('token');
})->with([
    'wrong password' => ['jan@example.com', 'zle-haslo'],
    'unknown email' => ['nikt@example.com', 'sekret123'],
]);

it('requires email and password', function () {
    $this->postJson('/api/login', [])
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors(['email', 'password']);
});

it('throttles repeated login attempts', function () {
    foreach (range(1, 10) as $attempt) {
        $this->postJson('/api/login', ['email' => 'jan@example.com', 'password' => 'zle-haslo']);
    }

    $this->postJson('/api/login', ['email' => 'jan@example.com', 'password' => 'sekret123'])
        ->assertTooManyRequests();
});
