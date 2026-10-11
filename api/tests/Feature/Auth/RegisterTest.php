<?php

use App\Models\User;

function validRegistration(array $overrides = []): array
{
    return array_merge([
        'name' => 'Jan Kowalski',
        'email' => 'jan@example.com',
        'password' => 'sekret123',
        'password_confirmation' => 'sekret123',
    ], $overrides);
}

it('registers a user and returns a token', function () {
    $response = $this->postJson('/api/register', validRegistration())
        ->assertCreated()
        ->assertJsonStructure(['data' => ['id', 'name', 'email'], 'token'])
        ->assertJsonPath('data.email', 'jan@example.com')
        ->assertJsonMissingPath('data.password');

    $this->getJson('/api/user', ['Authorization' => 'Bearer '.$response->json('token')])
        ->assertOk()
        ->assertJsonPath('data.email', 'jan@example.com');
});

it('stores the email in lowercase', function () {
    $this->postJson('/api/register', validRegistration(['email' => ' Jan@Example.COM ']))->assertCreated();

    expect(User::sole()->email)->toBe('jan@example.com');
});

it('rejects invalid data with errors per field', function (array $data, string $field) {
    $this->postJson('/api/register', validRegistration($data))
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors([$field]);
})->with([
    'invalid email' => [['email' => 'to-nie-jest-email'], 'email'],
    'missing email' => [['email' => ''], 'email'],
    'too short password' => [['password' => 'krotkie', 'password_confirmation' => 'krotkie'], 'password'],
    'unconfirmed password' => [['password_confirmation' => 'inne-haslo'], 'password'],
    'missing name' => [['name' => ''], 'name'],
]);

it('rejects an email that is already taken regardless of letter case', function () {
    User::factory()->create(['email' => 'jan@example.com']);

    $this->postJson('/api/register', validRegistration(['email' => 'JAN@example.com']))
        ->assertUnprocessable()
        ->assertOnlyJsonValidationErrors(['email']);
});
